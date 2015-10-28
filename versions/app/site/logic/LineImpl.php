<?php
/**
 * @file LineImpl.php
 * @author comdeng
 * @date 2012-10-5 上午9:22:08
 * @version 1.0
 * @brief 
 *  
 **/
final class LineImpl
{
	/**
	 * 获取产品
	 * @param int $lineId
	 * @return mixed|boolean
	 */
	static function getLine($lineId)
	{
		$rows = Db::get('ts_site')->table('s_line')->where(array('line_id' => $lineId, 'line_status' => 1))->get();
		if ($rows) {
			return array_shift($rows);
		}
		return false;
	}
	
	/**
	 * 更新产品
	 * @param int $lineId
	 * @param array $data
	 */
	static function updateLine($lineId, array $data)
	{
		$body = array();
		foreach(array('line_name', 'item_regex', 'item_host', 'item_url', 'image_regex', 'line_status', 'meta_selector', 'title_selector', 'price_selector') as $key) {
			if (isset($data[$key])) {
				$body[$key] = $data[$key];
			}
		}
		Db::get('ts_site')->table('s_line')->where(array('line_id'=>intval($lineId)))->saveBody($body)->update();
	}
	
	/**
	 * 添加产品
	 * @param int $siteId 网站id
	 * @param string $host 产品的主机名
	 * @param array $data
	 * @return int
	 */
	static function addLine($siteId, $host, array $data)
	{
		$db = Db::get('ts_line');
		$data['site_id'] = $siteId;
		$data['site_host'] = $host;
		$db->table('s_line')->unique('line_id')->saveBody($data);
		return $db->getLastInsertId();
	}
	
	/**
	 * 获取某个网站下的所有产品
	 * @param int $siteId
	 * @return array
	 */
	static function getLinesBySiteId($siteId)
	{
		return Db::get('ts_site')
		->table('s_line')
		->where(array(
				'site_id' => $siteId,
				'line_status' => 1,
		))
		->get();
	}
}