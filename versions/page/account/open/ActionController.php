<?php
require_once PAGE_ROOT.'/index/TsController.php';
class ActionController extends TsController
{
	protected $loadUser = false;
	
	function _before()
	{
		parent::_before();
		Conf::load(CONF_ROOT.'/api.conf.php');
	}
	
	function index($type)
	{
		$openApi = ANew('user/openid');
		$url = $openApi->getAuthorizeURL($type);
		$this->response->redirect($url);
	}
	
	private function _getTokenCacheKey($type)
	{
		$tid = $this->request->userData['tid'];
		$key = 'user_token_'.$type.'_'.$tid;
		return $key;
	}
	
	function callback()
	{
		$type = $this->get('type');
		if (!$type) {
			throw new Exception('hapn.u_args');
		}
		
		if ($type == 'tb') {
			$type = 'taobao';
		}
		
		$code = $this->get('code');
		if (!$code) {
			throw new Exception('hapn.u_notfound');
		}
		$openApi = ANew('user/openid');
		$cacheKey = $this->_getTokenCacheKey($type);
		$cache = Com::get('cache');
		$token = $cache->get($cacheKey);
		if ($token === null) {
			$openApi = ANew('user/openid');
			$token = $openApi->getToken($type, $code);
			if ($token !== false) {
				$cache->set($cacheKey, $token, 3600 * 12);
			}
		}
		if (!$token) {
			throw new Exception('open.u_tokenGetFailed');
		}
		
		$info = $openApi->parseToken($type, $token);
		if (!$info) {
			throw new Exception('open.u_tokenParseFailed');
		}
		
		// 检查该用户是否已经绑定过了
		$bindSiteUserId = $info['bind_site_user_id'];
		$bindSiteId = $info['bind_site_id'];
		$user = $openApi->getBindByBindUser($bindSiteId, $bindSiteUserId);
		if ($user && $user['user_id']) {
			// 登录
			$this->markLogin($user['user_id'], false);
			
			// 更改授权信息
			$openApi->updateBind($user['user_id'], $bindSiteId, array('bind_info' => $info['bind_info']));
			
			return $this->response->redirect('/my/');
		}
		
		$this->set('bindSiteId', $bindSiteId);
		$this->set('info', $info);
		$this->setView('account/tpl/open_callback.phtml');
	}
	
	function _check_email()
	{
		$email = $this->get('email');
		$bindSiteId = intval($this->get('bind_site_id'));
		if (!$email || $bindSiteId <= 0) {
			throw new Exception('hapn.u_args');
		}
		
		$userApi = ANew('user');
		$user = $userApi->getUserByEmail($email);
		if (!$user) {
			return $this->set('exists', false);
		}
		
		$openApi = ANew('user/openid');
		$bind = $openApi->getBind($user['user_id'], $bindSiteId);
		if ($bind) {
			$this->set('exists', true);
		} else {
			$this->set('exists', false);
		}
	}
	
	function _bind()
	{
		$bindSiteId = intval($this->get('bind_site_id'));
		$email = $this->get('email');
		$password = $this->get('password');
		if (!$email || $bindSiteId <= 0 || !$password) {
			throw new Exception('hapn.u_args');
		}
		
		$userApi = ANew('user');
		$userId = $userApi->login($email, $password);
		switch($userId) {
			case 0:
				throw new Exception('user.u_forbidden');
			case -1:
				throw new Exception('user.u_emailOrPwdWrong');
		}
		
		$this->bindUser($userId, $bindSiteId);
		
		$this->markLogin($userId, false);
	}
	
	function _fill()
	{
		$bindSiteId = intval($this->get('bind_site_id'));
		$email = trim($this->get('email'));
		$password = $this->get('password');
		$nickname = $this->get('nickname');
		
		if (!$email || $bindSiteId <= 0 || !$password || !$nickname) {
			throw new Exception('hapn.u_args');
		}
		
		$userApi = ANew('user');
		if ($userApi->isEmailUsed($email)) {
			throw new Exception('user.u_emailUsed');
		}
		
		if (!$this->checkNicknameFormat($nickname)) {
			throw new Exception('user.u_nicknameIllegal');
		} else if ($userApi->isNicknameUsed($nickname)) {
			throw new Exception('user.u_nicknameUsed');
		}
		
		$userId = $userApi->addUser(array('email' => $email, 'nickname' => $nickname, 'password' => $password, 'ip' => $this->request->userip));
		
		// 绑定到帐号
		$this->bindUser($userId, $bindSiteId);
		
		// 注册以后用户直接登录
		$this->markLogin($userId);
		$this->set('user_id', $userId);
	}
	
	private function bindUser($userId, $bindSiteId)
	{
		$openApi = ANew('user/openid');
		$bind = $openApi->getBind($userId, $bindSiteId);
		if ($bind) {
			throw new Exception('user.u_siteIsBinded');
		}
		
		$type = $openApi->getType($bindSiteId);
		$cacheKey = $this->_getTokenCacheKey($type);
		$cache = Com::get('cache');
		$token = $cache->get($cacheKey);
		if (!$token) {
			throw new Exception('open.u_tokenGetFailed');
		}
		
		$info = $openApi->parseToken($type, $token);
		if (!$info) {
			throw new Exception('open.u_tokenParseFailed');
		}
		
		$data = array(
			'user_id' => $userId,
			'bind_site_id' => $info['bind_site_id'],
			'bind_site_user_id' => $info['bind_site_user_id'],
			'bind_info' => array(),
		);
		$data['bind_info'] = $info['bind_info'];
		$openApi->addBind($data);
		
		$userApi = ANew('user');
		$user = $userApi->getUser($userId);
		// 头像
		$avatar = $info['avatar'];
		if ($avatar && !$user['avatar_id']) {
			$image = Com::get('image');
			$path = TMP_ROOT.'/'.uniqid().'.'.microtime();
				
			try{
				$curl = LibUtil::load('Curl');
				$body = $curl->get($avatar);
				if ($body['content']) {
					file_put_contents($path, $body['content']);
					$avatarId = $image->save($path);
					unlink($path);
			
					$userApi->updateUser($userId, array('avatar_id' => $avatarId));
				}
			} catch(Exception $ex) {
				// 图片抓取失败时功能继续 
			}
		}
		
	}
}