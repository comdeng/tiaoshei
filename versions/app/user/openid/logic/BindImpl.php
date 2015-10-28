<?php
final class BindImpl
{
	/**
	 * 添加绑定
	 * @param array $data
	 * @throws Exception
	 */
	static function addBind(array $data)
	{
		// 检查是否包含必要参数
		if (empty($data['user_id']) || empty($data['bind_site_id']) || empty($data['bind_site_user_id'])) {
			throw new Exception('bind.u_args');
		}
		
		// 检查用户是否绑定过该网站的帐号
		if (self::isUserBindSite($data['user_id'], $data['bind_site_id'])) {
			throw new Exception('bind.u_userBindedInTheSite');
		}
		
		// 该站点的该用户是否绑定过
		if (self::isBindUserExisted($data['bind_site_id'], $data['bind_site_user_id'])) {
			throw new Exception('bind.u_bindUserExisted');
		}
		
		$data['create_time'] = time();
		$data['bind_status'] = 1;
		
		self::inputData($data);
		Db::get('ts_user')->table('u_bind')->saveBody($data)->insert();
	}
	
	/**
	 * 更新绑定信息
	 * @param int $userId
	 * @param int $bindSiteId
	 * @param array $data
	 */
	static function updateBind($userId, $bindSiteId, array $data)
	{
		$body = array();
		foreach(array('bind_status', 'bind_info') as $key) {
			if (isset($data[$key])) {
				$body[$key] = $data[$key];
			}
		}
		if (!$body) {
			return;
		}
		self::inputData($body);
		
		Db::get('ts_user')->table('u_bind')->where(array(
			'user_id' => $userId,
			'bind_site_id' => $bindSiteId,
		))->saveBody($body)->update();
	}
	
	/**
	 * 获取指定用户的绑定
	 * @param int $userId
	 * @return array
	 */
	static function getBindsByUser($userId)
	{
		$rows = Db::get('ts_user')->table('u_bind')->where(array('bind_status' => 1))->get();
		foreach($rows as $key=>&$row) {
			self::outputData($row);
		}
		return $rows;
	}
	
	/**
	 * 获取指定用户在某网站的绑定
	 * @param int $userId
	 * @param int $bindSiteId
	 * @return array | false
	 */
	static function getBindBySiteId($userId, $bindSiteId)
	{
		$rows = Db::get('ts_user')->table('u_bind')->where(array(
			'user_id' => $userId,
			'bind_site_id'=>$bindSiteId,
			'bind_status'=>1,
			))->get();
		if ($rows) {
			$row = array_shift($rows);
			self::outputData($row);
			return $row;
		}
		return false;
	}
	
	/**
	 * 通过绑定站点的用户id找到相应的绑定
	 * @param int $bindSiteId
	 * @param int $bindSiteUserId
	 * @return mixed|boolean
	 */
	static function getBindByBindUserId($bindSiteId, $bindSiteUserId)
	{
		$rows = Db::get('ts_user')->table('u_bind')->where(array(
				'bind_site_user_id' => $bindSiteUserId,
				'bind_site_id' => $bindSiteId,
				'bind_status' => 1,	
			))->get();
		if ($rows) {
			$row = array_shift($rows);
			self::outputData($row);
			return $row;
		}
		return false;
	}
	
	private static function inputData(&$data)
	{
		if (isset($data['bind_info']) && is_array($data['bind_info'])) {
			foreach($data['bind_info'] as $key => $value) {
				$data['bind_info'][$key] = $key.'='.$value;
			}
			$data['bind_info'] = implode("\n", $data['bind_info']);
		}
	}
	
	private static function outputData(&$data)
	{
		if (isset($data['bind_info'])) {
			if (!$data['bind_info']) {
				$data['bind_info'] = array();
			} else {
				$arr = explode("\0", $data['bind_info']);
				$data['bind_info'] = array();
				foreach($arr as $k => $v) {
					list($key, $value) = explode('=', $v);
					$data['bind_info'][$key] = $value;
				}
			}
		}
	}
	
	/**
	 * 用户是否在指定站点绑定过
	 * @param int $userId
	 * @param int $bindSiteId
	 * @return boolean
	 */
	static function isUserBindSite($userId, $bindSiteId)
	{
		return self::getBindBySiteId($userId, $bindSiteId) !== false;
	}
	
	/**
	 * 指定站点的指定用户是否已经存在
	 * @param int $bindSiteId
	 * @param int $bindSiteUserId
	 * @return boolean
	 */
	static function isBindUserExisted($bindSiteId, $bindSiteUserId)
	{
		return self::getBindByBindUserId($bindSiteId, $bindSiteUserId) !== false;
	}
}