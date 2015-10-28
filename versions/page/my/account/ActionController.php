<?php
/**
 * @file ActionController.php
 * @author comdeng
 * @date 2012-10-3 上午8:30:23
 * @version 1.0
 * @brief 
 *  
 **/
require_once PAGE_ROOT.'/index/TsController.php';
class ActionController extends TsController
{
	function index()
	{
		$this->setView('my/account/tpl/index.phtml');
	}
	
	function avatar()
	{
		$this->setView('my/account/tpl/avatar.phtml');
	}
	
	function _avatar()
	{
		$avatarId = intval($this->get('avatar_id'));
		if (!$avatarId) {
			throw new Exception('hapn.u_args');
		}
		$userApi = ANew('user');
		$userApi->updateUser($this->user['user_id'], array('avatar_id' => $avatarId));
	}
	
	function password()
	{
		$this->setView('my/account/tpl/password.phtml');
	}
	
	function _password()
	{
		$oldPassword = $this->get('oldPassword');
		$password = $this->get('password');
		
		$userApi = ANew('user');
		$userApi->changePassword($this->user['user_id'], $oldPassword, $password);
	}
}