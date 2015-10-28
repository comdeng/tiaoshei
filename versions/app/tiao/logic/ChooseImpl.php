<?php
final class ChooseImpl
{
	/**
	 * 分页获取选择列表
	 * @param int $productId
	 * @param int $chooseType 1:挑 0：不挑
	 * @param int $page
	 * @param int $num
	 */
	static function getChoosesByProductId($productId, $chooseType, $page, $num)
	{
		return Db::get('ts_tiao')
			->table('t_choose')
			->where(array('product_id' => $productId, 'choose_type' => $chooseType, 'choose_status' => 1))
			->limit($page * $num, $num)
			->order('update_time', FALSE)
			->get();
	}
	
	/**
	 * 添加选择
	 * @param int $productId
	 * @param int $userId
	 * @param int $type 1 挑 0 不挑
	 * @param string $remark 评论
	 */
	static function setChoose($productId, $userId, $type, array $data)
	{
		$now = time();
		
		if (!isset($data['choose_status'])) {
			$data['choose_status'] = 1;
		}
		$data['product_id'] = $productId;
		$data['user_id'] = $userId;
		$data['choose_type'] = $type;
		
		$db = Db::get('ts_tiao');
		$sql = 'INSERT INTO `ts_tiao`.`t_choose` set product_id=?,user_id=?,choose_type=?,create_time=?,update_time=?,choose_status=?'.
			(isset($data['choose_remark']) ? ',choose_remark=?' : '').
			' ON DUPLICATE KEY UPDATE update_time=values(update_time),choose_status=values(choose_status)'.
			(isset($data['choose_remark']) ? ',choose_remark=values(choose_remark)' : '')
		;
		$db->queryBySql($sql, $productId, $userId, $type, $now, $now, $data['choose_status'], isset($data['choose_remark']) ? $data['choose_remark'] : '');
	}
	
	/**
	 * 获取用户的选择
	 * @param int $userId
	 * @param int $productId
	 * @param int $type 1 挑 0 不挑 2 所有类型
	 */
	static function getChooseByUserId($userId, $productId, $type)
	{
		$where = array('product_id' => intval($productId), 'user_id' => intval($userId), 'choose_status' => 1);
		if ($type != 2) {
			$where['choose_type'] = $type;
		}
		$rows = Db::get('ts_tiao')
			->table('t_choose')
			->where($where)
			->get();
		if ($rows) {
			if ($type == 2) {
				return LibUtil::load('EXArray')->indexArray($rows, 'choose_type');
			}
			return array_shift($rows);
		}
		
		if ($type == 2) {
			return array();
		}
		return false;
	}
}