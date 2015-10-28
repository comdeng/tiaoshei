<?php
final class TiaoImpl
{
	/**
	 * 获取挑
	 * @param int $tiaoId
	 * @return array|boolean
	 */
	static function getTiao($tiaoId)
	{
		$ret = Db::get('ts_tiao')->table('t_tiao')->where(array('tiao_id' => $tiaoId, 'tiao_status!' => -1))->get();
		if ($ret) {
			return array_shift($ret);
		}
		return false;
	}
	
	/**
	 * 分页获取挑
	 * @param int $page
	 * @param int $num
	 * @return array
	 */
	static function pagedGetTiaos($page, $num)
	{
		$db = Db::get('ts_tiao');
		$rows = $db
			->table('t_tiao')
			->where(array('tiao_status' => 1))
			->order('tiao_id', FALSE)
			->limit($page * $num, $num)
			->get(true);
		return array('data' => $rows, 'total' => $db->getFoundRows());
	}
	
	/**
	 * 分页获取指定用户的挑
	 * @param int $userId
	 * @param int $page
	 * @param int $num
	 * @param int $status
	 * 1 已经发布的
	 * 0 尚未发布的
	 * 2 包括已经发布和尚未发布的
	 */
	static function pagedGetTiaosByUserId($userId, $page, $num, $status = 1)
	{
		$where = array('user_id' => $userId);
		switch($status) {
			case 0:
				$where['tiao_status'] = 0;
				break;
			case 1:
				$where['tiao_status'] = 1;
				break;
			case 2:
				$where['tiao_status!'] = -1;
				break;
			default:
				throw new Exception('tiao.u_args wrong status value');
		}
		$db = Db::get('ts_tiao');
		$rows = $db->table('t_tiao')
			->where($where)
			->order('tiao_id', FALSE)
			->limit($page * $num, $num)
			->get(true);
		return array('data' => $rows, 'total' => $db->getFoundRows());
	}
	
	/**
	 * 增加挑
	 * @param int $userId
     * @param array $data
     * @return int
	 */
	static function addTiao($userId, array $data)
	{
		$now = time();
		$data = array_merge($data, array(
			'user_id' => $userId,
			'create_time' => $now,
			'update_time' => $now,
			'tiao_status' => 0,
		));

		$db = Db::get('ts_tiao');
		$db->table('t_tiao')->unique('tiao_id')->saveBody($data)->insert();
		return $db->getLastInsertId();
	}
	
	/**
	 * 更新挑
	 * @param int $tiaoId
     * @param array $data
	 */
	static function updateTiao($tiaoId, array $data)
	{
		$body = array('update_time' => time());
		foreach(array('tiao_name', 'tiao_desc', 'tiao_status', 'expire_time') as $key) {
			if (isset($data[$key])) {
				$body[$key] = $data[$key];
			}
		}

		Db::get('ts_tiao')->table('t_tiao')->where(array('tiao_id'=>$tiaoId))->saveBody($body)->update();
	}
}