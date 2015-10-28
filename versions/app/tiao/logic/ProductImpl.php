<?php
final class ProductImpl
{
	/**
	 * 获取产品
	 * @param int $productId
	 * @return mixed|boolean
	 */
	static function getProduct($productId)
	{
		$ret = Db::get('ts_tiao')->table('t_product')->where(array('product_id' => $productId, 'product_status!' => -1))->get();
		if ($ret) {
			$data = array_shift($ret);
			self::_outputProduct($data);
			return $data;
		}
		return false;
	}

	/**
	 * 通过指定挑下边的所有产品
	 * @param int $tiaoId
	 * @return array
	 */
	static function getProductsByTiaoId($tiaoId)
	{
		$rows = Db::get('ts_tiao')
			->table('t_product')
			->where(array('tiao_id' => $tiaoId, 'product_status!' => -1))
			->order('product_id', TRUE)
			->get();
		foreach($rows as &$value) {
			self::_outputProduct($value);
		}
		
		return $rows;
	}

	/**
	 * 添加产品
	 * @param int $tiaoId
	 * @param int $userId
	 * @param array $data
	 */
	static function addProduct($tiaoId, $userId, array $data)
	{
		$now = time();
		$data = array_merge($data, array(
			'tiao_id' => $tiaoId,
			'user_id' => $userId,
			'create_time' => $now,
			'update_time' => $now,
		));
		if (!isset($data['product_status'])) {
			$data['product_status'] = 1;
		}

		self::_inputProduct($data);
		
		$db = Db::get('ts_tiao');
		$db->table('t_product')->unique('product_id')->saveBody($data)->insert();
		return $db->getLastInsertId();
	}

	/**
	 * 更新产品
	 * @param int $productId
	 * @param array $data
	 * <code>array(
	 * 	'product_img_id',
	 * 	'product_price',
	 * 	'product_status',
	 * )</code>
	 */
	static function updateProduct($productId, array $data)
	{
		$body = array('update_time' => time());
		foreach(array('product_name', 'product_img_id', 'product_price', 'product_status') as $key) {
			if (isset($data[$key])) {
				$body[$key] = $data[$key];
			}
		}

		self::_inputProduct($body);
		Db::get('ts_tiao')->table('t_product')->where(array('product_id' => $productId))->saveBody($body)->update();	
	}
	
	/**
	 * 更新产品的选择数目
	 * @param int $productId
	 * @param int $chooseType 1 挑 0 不挑
	 */
	static function updateProductChooseNum($productId, $chooseType)
	{
		if (!in_array($chooseType, array(0, 1))) {
			throw new Exception('tiao.u_wrongChooseType');
		}
		$sql = 'UPDATE `ts_tiao`.`t_product` set `'.($chooseType == 1 ? 'yes_num' : 'no_num').'` = (select count(1) from `ts_tiao`.`t_choose` where product_id=? and choose_type=? and choose_status=1) where `product_id`=?';
		Db::get('ts_tiao')->queryBySql($sql, $productId, $chooseType, $productId);
	}

	/**
	 * 格式化提交的产品
	 * @param array $data
	 */
	private static function _inputProduct(&$data)
	{
		if (isset($data['product_price'])) {
			// 价格转化成正整数
			if ($data['product_price'] > 0) {
				$data['product_price'] = floatval($data['product_price']) * 100;
			} else {
				$data['product_price'] = 0;
			}
		}
	}

	/**
	 * 格式化获取的产品
	 * @param array $data
	 */
	private static function _outputProduct(&$data)
	{
		if (isset($data['product_price']) && $data['product_price'] > 0) {
			$data['product_price'] = $data['product_price'] / 100;
		}
	}
}
