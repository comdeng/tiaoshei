<?php
require_once PAGE_ROOT.'/index/TsController.php';
class ActionController extends TsController
{
	protected $loadUser = false;

	/**
	 * 登录
	 */
	function login()
	{
		$this->set('rurl', $this->get('u', '/'));
		$this->setView('account/tpl/login.phtml');
	}
	
	function _login()
	{
		$email = $this->get('email');
		$password = $this->get('password');
		if (!$email || !$password) {
			throw new Exception('hapn.u_args');
		}
		$kept = $this->get('kept') == '1';
		
		$userApi = ANew('user');
		$userId = $userApi->login($email, $password);
		switch($userId) {
			case 0:
				throw new Exception('user.u_forbidden');
			case -1:
				throw new Exception('user.u_emailOrPwdWrong');
		}
		
		$this->markLogin($userId, $kept);
	}
	
	/**
	 * 注册
	 */
	function register()
	{
		$this->set('rurl', $this->get('rurl', '/'));
		$this->setView('account/tpl/register.phtml');
	}
	
	function _register()
	{
		$email = $this->get('email');
		$nickname = $this->get('nickname');
		$password = $this->get('password');
		
		if (!$email || !$nickname || !$password) {
			throw new Exception('hapn.u_input');
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
		// 注册以后用户直接登录
		$this->markLogin($userId);
		
		$this->set('user_id', $userId);
	}
	
	/**
	 * 退出
	 */
	function logout()
	{
		$rurl = $this->get('rurl', '/');
		$conf = Conf::get('hapn.cookie');
		$conf = $conf['user'];
		$this->response->setCookie($conf['key'], null, 0, '/', $conf['host']);
		
		$this->response->redirect($rurl);
	}
	
	function _check_email()
	{
		$email = $this->get('email');
		if (!$email) {
			throw new Exception('hapn.u_args');
		}
		if (ANew('user')->isEmailUsed($email)) {
			$this->set('exists', true);
		} else {
			$this->set('exists', false);
		}
	}
	
	function _check_nickname()
	{
		$nickname = $this->get('nickname');
		if (!$nickname) {
			throw new Exception('hapn.u_args');
		}
		
		if (!$this->checkNicknameFormat($nickname)) {
			$this->set('exists', 'illegal');
		} else {
			$exists = ANew('user')->isNicknameUsed($nickname);
			$this->set('exists', $exists);
		}
	}
}