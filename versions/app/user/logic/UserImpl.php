<?php
final class UserImpl
{
	private static $cookieSecret = 'Xu@#4b9da7d9b2f8146b4d6931a1';
	private static $passwordSecret = 'sdf023ksdf0923423sdf*@sDSF_1!';
	
	static function getUserByUserId($userId)
	{
		return self::_getUser(array('user_id' => $userId, 'user_status' => array(UserConst::USER_DELETED, null)));
	}
	
	static function getUserByEmail($email)
	{
		return self::_getUser(array('email' => $email, 'user_status' => array(UserConst::USER_DELETED, null)));	
	}
	
	private static function _getUser(array $where)
	{
		$rows = Db::get('ts_user')
		->table('u_user')
		->where($where)
		->get();
		
		if ($rows) {
			$user = array_shift($rows);
			unset($user['password']);
			return $user;
		}
		return false;
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
	static function pagedGetUserList($page, $num, $userStatus = 1)
	{
		if ($userStatus == 2) {
			$userStatus = array(UserConst::USER_UNACTIVITED, null);
		}
		return Db::get('ts_user')
			->table('u_user')
			->field(array('user_id', 'email', 'nickname', 'avatar_id', 'create_time'))
			->where(array('user_status' => $userStatus))
			->limit($page * $num, $um)
			->order('user_id', FALSE)
			->get();
	}
	
	/**
	 * 获取用户列表
	 * @param array $userIds
	 */
	static function getUserList($userIds)
	{
		$rows = Db::get('ts_user')
		->table('u_user')
		->field(array('user_id', 'email', 'nickname', 'avatar_id', 'create_time'))
		->in('user_id', $userIds)
		->get();
		$rows = LibUtil::load('EXArray')->indexArray($rows, 'user_id');
		
		$ret = array();
		foreach($userIds as $userId) {
			if (isset($rows[$userId])) {
				$ret[$userId] = $rows[$userId];
			} else {
				$ret[$userId] = false;
			}
		}
		return $ret;
	}
	
	static function isEmailUsed($email)
	{
		return Db::get('ts_user')->table('u_user')->where(array('email' => $email))->getCount() > 0;
	}
	
	static function isNicknameUsed($nickname)
	{
		return Db::get('ts_user')->table('u_user')->where(array('nickname' => $nickname))->getCount() > 0;
	}
	
	
	/**
	 * 登录
	 * @param string $email
	 * @param string $password
	 * @return int
	 * 0 用户已被禁用
	 * -1 用户或密码不对
	 * > 0 用户的id
	 */
	static function login($email, $password)
	{
		$rows = Db::get('ts_user')
			->table('u_user')
			->field('user_id', 'password', 'user_status')
			->where(array('email' => $email))
			->get();
		
		if (!$rows) {
			return UserConst::LOGIN_EMAIL_OR_PASS_WRONG;
		}
		$user = array_shift($rows);
		if ($user['password'] != self::packPassword($password)) {
			return UserConst::LOGIN_EMAIL_OR_PASS_WRONG;
		}
		switch($user['user_status']) {
			case UserConst::USER_DELETED:
				return UserConst::LOGIN_EMAIL_OR_PASS_WRONG;
				
			case UserConst::USER_FORBIDDEN:
				return UserConst::LOGIN_FORBIDDEN;
				
			case UserConst::USER_UNACTIVITED:
			case UserConst::USER_NORMAL:
				return $user['user_id'];
				
			default:
				return $user['user_status'];
		}
	}
	
	static function addUser(array $data)
	{
		foreach(array('email', 'password', 'nickname', 'ip') as $key) {
			if (empty($data[$key])) {
				throw new Exception('user.u_args column='.$key);
			}
		}
		
		$data['create_time'] = $data['last_login_time'] = time();
		if (!isset($data['user_status'])) {
			$data['user_status'] = UserConst::USER_UNACTIVITED;
		}
		
		self::_inputUser($data);
		
		$db = Db::get('ts_user');
		$db->table('u_user')
			->unique('user_id')
			->saveBody($data)
			->insert();
		return $db->getLastInsertId();
	}

	static function updateUser($userId, array $data)
	{
		$body = array('update_time' => time());
		foreach(array('email', 'password', 'nickname', 'avatar_id', 'last_login_time', 'last_login_ip', 'user_status') as $key) {
			if (isset($data[$key])) {
				$body[$key] = $data[$key];
			}
		} 
		if (isset($body['last_login_ip'])) {
			$body['ip'] = $body['last_login_ip'];
		}
		self::_inputUser($body);
		
		Db::get('ts_user')->table('u_user')->where(array('user_id' => $userId))->saveBody($body)->update();
	}
	
	static function changePassword($userId, $oldPassword, $newPassword)
	{
		$db = Db::get('ts_user');
		$rows = $db->table('u_user')->field(array('password', 'user_status'))->where(array('user_id' => $userId))->get();
		$user = false;
		if (!$rows || $rows[0]['user_status'] == UserConst::USER_NORMAL) {
			throw new Exception('user.u_userNotExisted user_id='.$userId);
		}
		$user = array_shift($rows);
		$oldPassword = self::packPassword($oldPassword);
		if ($user['password'] != $oldPassword) {
			throw new Exception('user.u_oldPasswordWrong');
		}
		$newPassword = self::packPassword($newPassword);
		$db->table('u_user')
			->where(array('user_id' => $userId))
			->saveBody(array('password' => $newPassword, 'update_time' => time()))
			->update();
		Logger::trace('user::changePassword:userId='.$userId);
	}
	
	private static function _inputUser(&$data)
	{
		if (isset($data['password'])) {
			$data['password'] = self::packPassword($data['password']);
		}
		if (isset($data['ip'])) {
			if (!is_numeric($data['ip'])) {
				$data['last_login_ip'] = sprintf('%u', ip2long($data['ip']));
			} else {
				$data['last_login_ip'] = $data['ip'];
			}
			unset($data['ip']);
		}
	}
	
	
	/**
	 * 对cookie进行加密
	 * @param int $userId
	 * @param int $expire
	 * @param array $params
	 * @return string
	 */
	static function packCookie($userId, $expire, array $params = array())
	{
		$params['user_id'] = $userId;
		$params['expire'] = time() + $expire;
		$secret = self::$cookieSecret;
		
		
		$sign = self::_sign($params, $secret);
		
		foreach($params as $key => $value) {
			$params[$key] = $key.'='.$value;
		}
		$str = implode('&', $params).'&sign='.rawurlencode($sign);
		
		return base64_encode(self::_mask($str, $secret));
	}
	
	/**
	 * 对cookie进行解密
	 * @param string $cookie
	 * @return array | false
	 */
	static function unpackCookie($cookie)
	{
		$secret = self::$cookieSecret;
		
		$cookie = self::_unmask(base64_decode($cookie), $secret);
		
		$params = explode('&', $cookie);
		foreach($params as $key=>$value) {
			$arr = explode('=', $value);
			unset($params[$key]);
			$params[$arr[0]] = rawurldecode($arr[1]);
		}
		if (!isset($params['sign'])) {
			Logger::warning('user.u_signNotExisted');
			return false;
		}
		$sign = rawurldecode($params['sign']);
		unset($params['sign']);
		if ($sign != self::_sign($params, $secret)) {
			Logger::warning('user.u_cookieFormatWrong');
			return false;
		}
		return $params;
	}
	
	private static function packPassword($password)
	{
		if (strlen($password) != 32) {
			$password = md5($password);
		}
		return md5(self::_mask($password, self::$passwordSecret));
	}
	
	/**
	 * 获取数组的签名
	 * @param array $params
	 * @param string $secret
	 * @return string
	 */
	private static function _sign(array $params, $secret)
	{
		foreach($params as $key => $value) {
			$params[$key] = $key.'='.rawurlencode($value);
		}
		ksort($params);
		return hash_hmac('sha1', implode('&', $params), strtr($secret, '-_', '+/'), true);
	}
	
	/**
	 * 对字符串进行mask
	 * @param string $str
	 * @param string $mark
	 * @return string 
	 */
	private static function _mask($str, $mark)
	{
		$DataMd5 = md5($mark, true);
		$len = strlen($str);
		
		$result = '';
		
		$i = 0;
		while($i < $len)
		{
			$j = 0;
			while($i < $len && $j < 16)
			{
				$result .= $str[$i] ^ $DataMd5[$j];
		
				$i++;
				$j++;
			}
		}
		return $result;
	}
	
	private static function _unmask($str, $mask)
	{
		return self::_mask($str, $mask);
	}
}