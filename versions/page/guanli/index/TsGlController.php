<?php
/**
 * @file TsGlController.php
 * @author comdeng
 * @date 2012-10-7 下午4:26:50
 * @version 1.0
 * @brief 
 *  
 **/
class TsGlController extends PageController
{
	protected $user = null;
	protected $_page;
	protected $_size;
	
	function _before()
	{
		$this->parsePageInfo();
	
		$this->loadCurrentUser();
		
		$this->checkLogin();
		
		// 检查权限
		Conf::load(CONF_ROOT.'permission.conf.php');
		$supers = Conf::get('admin.supers');
		if (!in_array($this->user['user_id'], $supers)) {
			throw new Exception('hapn.u_power');
		}
	}
	
	private function parsePageInfo()
	{
		$page = max(intval($this->get('_pn', 0)), 0);
		$size = max(intval($this->get('_sz', 20)), 1);
		$this->_page = $page;
		$this->_size = $size;
	}
	
	/**
	 * 获取当前用户
	 * @return array
	 */
	protected function loadCurrentUser()
	{
		if ($this->user === null) {
			if ($this->request->userData['user_id'] > 0) {
				$userApi = ANew('user');
				$this->user = $userApi->getUser($this->request->userData['user_id']);
			}
			$this->set('cuser', $this->user);
		}
		return $this->user;
	}
	
	protected function checkLogin()
	{
		if (!$this->loadCurrentUser()) {
			throw new Exception('hapn.u_login');
		}
	}
	
	/**
	 * 标记用户登录
	 * @param int $userId
	 * @param boolean $kept
	 */
	protected function markLogin($userId, $kept = false)
	{
		// 更新登录信息
		$userApi = ANew('user');
		$ip = $this->request->userip;
		// 记录cookie
	
		$conf = Conf::get('hapn.cookie');
		$conf = $conf['user'];
		$cookie = $userApi->packCookie($userId, $kept ? 3600 * 24 * 30 : 3600*24, array('ip'=>$ip));
		$this->response->setCookie($conf['key'], $cookie, $kept ? 3600 * 24 * 30 : null, '/', $conf['host']);
	
		$userApi->updateUser($userId, array('last_login_ip' => $ip));
	}
}