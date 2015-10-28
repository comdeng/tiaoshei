<?php
$path = dirname(__FILE__);
require_once $path.'/UserConst.php';
require_once $path.'/logic/UserImpl.php';

final class UserExport
{
	/**
	 * 获取用户
	 * @param int $userId
	 * @return array
	 */
	function getUser($userId)
	{
		return UserImpl::getUserByUserId($userId);
	}
	
	/**
	 * Email是否被使用过
	 * @param string $email
	 * @return boolean
	 */
	function isEmailUsed($email)
	{
		return UserImpl::isEmailUsed($email);
	}
	
	/**
	 * 昵称是否被使用过
	 * @param string $nickname
	 * @return boolean
	 */
	function isNicknameUsed($nickname)
	{
		return UserImpl::isNicknameUsed($nickname);
	}
	
	/**
	 * 获取用户列表
	 * @param int $page
	 * @param int $num
	 * @param int $userStatus
	 * 2 除了被删除用户外的所有用户
	 * 1 正常用户
	 * 0 禁用用户
	 * -1 未激活用户
	 * -9 被删除用户
	 */
	function pagedGetUserList($page, $num, $userStatus = 1)
	{
		return UserImpl::pagedGetUserList($page, $num, $userStatus);
	}
	
	/**
	 * 获取用户列表
	 * @param array $userIds
	 */
	function getUsers($userIds)
	{
		if (empty($userIds)) {
			return array();
		}
		return UserImpl::getUserList($userIds);
	}
	
	/**
	 * 通过email获取用户
	 * @param string $email
	 * @return array
	 */
	function getUserByEmail($email)
	{
		return UserImpl::getUserByEmail($email);
	}
	
	/**
	 * 添加用户
	 * @param array $data
	 * <code>array(
	 * 'email',
	 * 'password',
	 * 'nickname',
	 * 'user_status',
	 * )</code>
	 */
	function addUser(array $data)
	{
		return UserImpl::addUser($data);
	}
	
	/**
	 * 更新用户信息
	 * @param int $userId
	 * @param array $data
	 */
	function updateUser($userId, array $data)
	{
		UserImpl::updateUser($userId, $data);
	}
	
	/**
	 * 更换密码
	 * @param int $userId
	 * @param string $oldPassword
	 * @param string $newPassword
	 */
	function changePassword($userId, $oldPassword, $newPassword)
	{
		UserImpl::changePassword($userId, $oldPassword, $newPassword);
	}

	/**
	 * 停止用户帐号的使用
	 * @param int $userId
	 */
	function forbiddenUser($userId)
	{
		UserImpl::updateUser($userId, array('user_status' => UserConst::USER_FORBIDDEN));
	}
	
	/**
	 * 使帐号能正常使用
	 * @param int $userId
	 */
	function activeUser($userId)
	{
		UserImpl::updateUser($userId, array('user_status' => UserConst::USER_NORMAL));
	}
	
	/**
	 * 删除帐号
	 * @param int $userId
	 */
	function delUser($userId)
	{
		userImpl::updateUser($userId, array('user_status' => UserConst::USER_DELETED));
	}
	
	/**
	 * 登录帐号
	 * @param string $email
	 * @param string $password
	 * @return int
	 *  0 用户已被禁用
	 * -1 用户或密码不对
	 * > 0 用户的id
	 */
	function login($email, $password)
	{
		return UserImpl::login($email, $password);
	}
	
	/**
	 * 对cookie进行加密
	 * @param int $userId
	 * @param int $expire
	 * @param array $params
	 * @return string
	 */
	function packCookie($userId, $expire, array $params = array())
	{
		return UserImpl::packCookie($userId, $expire, $params);
	}
	
	/**
	 * 对cookie进行解密
	 * @param string $cookie
	 * @return array | false
	 * <code>array(
	 * user_id,
	 * expire,
	 * ip,
	 * )</code>
	 */
	function unpackCookie($cookie)
	{
		return UserImpl::unpackCookie($cookie);
	}
}