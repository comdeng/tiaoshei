<?php
final class UserOpenidExport
{
	private $sites = array(
		'sina' 		=> 1,
		'tencent' 	=> 2,
		'taobao' 	=> 3,
		'alipay'	=> 4,
		'douban'	=> 5,
		'renren'	=> 6,
	);
	
	private $openIdCache = array();
	
	private function checkSites($type)
	{
		if (!array_key_exists($type, $this->sites)) {
			throw new Exception('openid.u_siteNotSupported');
		}
	}
	
	private function getOpenId($type)
	{
		if (isset($this->openIdCache[$type])) {
			return $this->openIdCache[$type];
		}
		
		$className = ucfirst($type).'OpenidImpl';
		$path = dirname(__FILE__).'/'.$type.'/'.$className.'.php';
		if (!is_readable($path)) {
			throw new Exception('openid.u_implNotFound type='.$type);
		}
		$conf = Conf::get('api.open');
		if (isset($conf[$type])) {
			$conf = $conf[$type];
		} else {
			$conf = array();
		}
		require_once $path;
		$openId = new $className($conf);
		$this->openIdCache[$type] = $openId;
		return $openId;
	}
	
	function getType($bindSiteId)
	{
		foreach($this->sites as $key => $id) {
			if ($id == $bindSiteId) {
				return $key;
			}
		}
		return false;
	}
	
	/**
	 * 获取验证地址
	 * @param string $type
	 * sina: 微博
	 * @return string
	 */
	function getAuthorizeURL($type)
	{
		$this->checkSites($type);
		$api = $this->getOpenId($type);
		return $api->getAuthorizeURL();
	}
	
	/**
	 * 获取口令
	 * @param string $type
	 * @param string $code
	 */
	function getToken($type, $code)
	{
		$this->checkSites($type);
		if (!$code) {
			throw new Exception('openid.u_args');
		}
		$api = $this->getOpenId($type);
		$token = $api->getToken($code);
		return $token;
	}
	
	/**
	 * 解析口令
	 * @param string $type
	 * @param array $token
	 */
	function parseToken($type, $token)
	{
		$this->checkSites($type);
		if (!$token) {
			throw new Exception('openid.u_args');
		}
		$api = $this->getOpenId($type);
		$info = $api->parseToken($token);
		if (!$info) {
			return $info;
		}
		$info['bind_site_id'] = $this->sites[$type];
		return $info;
	}
	
	/**
	 * 通过口令寻找用户
	 * @param string $type
	 * @param mixed $token
	 * @return array | false
	 * 
	 */
	function getUserByToken($type, $token)
	{
		$this->checkSites($type);
		
		$api = $this->getOpenId($type);
		$bsUserId = $api->getUserId($token);
		
		$siteId = $this->sites[$type];
		$db = Db::get('ts_user');
		$users = $db->table('ts_bind')->where(array(
			'bind_status' => 1, 
			'bind_site_id' => $siteId,
			'bind_site_user_id' => $bsUserId,
		));
		if ($users) {
			return array_shift($users);
		}
		return false;
	}
	/**
	 * 添加绑定
	 * @param array $data
	 */
	function addBind(array $data)
	{
		require_once dirname(__FILE__).'/logic/BindImpl.php';
		BindImpl::addBind($data);
	}
	
	/**
	 * 更新绑定
	 * @param int $userId
	 * @param int $bindSiteId
	 * @param array $data
	 */
	function updateBind($userId, $bindSiteId, array $data)
	{
		require_once dirname(__FILE__).'/logic/BindImpl.php';
		BindImpl::updateBind($userId, $bindSiteId, $data);
	}
	
	/**
	 * 删除绑定
	 * @param int $bindId
	 * @param int $bindSiteId
	 */
	function delBind($bindId, $bindSiteId)
	{
		require_once dirname(__FILE__).'/logic/BindImpl.php';
		BindImpl::updateBind($userId, $bindSiteId, array('bind_status' => -1));
	}
	
	/**
	 * 获取指定用户在某网站的绑定
	 * @param int $userId
	 * @param int $bindSiteId
	 * @return array | false
	 */
	function getBind($userId, $bindSiteId)
	{
		require_once dirname(__FILE__).'/logic/BindImpl.php';
		return BindImpl::getBindBySiteId($userId, $bindSiteId);
	}
	
	/**
	 * 通过绑定站点的用户id找到相应的绑定
	 * @param int $bindSiteId
	 * @param int $bindSiteUserId
	 * @return mixed|boolean
	 */
	function getBindByBindUser($bindSiteId, $bindSiteUserId)
	{
		require_once dirname(__FILE__).'/logic/BindImpl.php';
		return BindImpl::getBindByBindUserId($bindSiteId, $bindSiteUserId);
	}
	
	/**
	 * 获取指定用户的绑定
	 * @param int $userId
	 * @return array
	 */
	function getUserBinds($userId)
	{
		require_once dirname(__FILE__).'/logic/BindImpl.php';
		return BindImpl::getBindsByUser($userId);
	}
}