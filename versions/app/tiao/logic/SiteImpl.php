<?php
final class SiteImpl1
{
	private static $hostMap = array(
		'item.taobao.com' => 'taobao.com',
	);
	
	private static function getRealHost($host) {
		$host = trim(strtolower($host));
		if (isset(self::$hostMap[$host])) {
			return self::$hostMap[$host];
		}
		return $host;
	}
	
	private static $sites;
	
	/**
	 * 通过主机名获取站点
	 * @param string $host
	 * @param boolean $autoCreate 是否自动创建这个站点
	 * @return array | boolean
	 */
	static function getSiteByHost($host, $autoCreate = true)
	{
		$host = self::getRealHost($host);
		
		$db = Db::get('ts_tiao');
		$rows = $db->table('t_site')->where(array('site_host' => $host))->get();
		if ($rows) {
			return array_shift($rows);
		}
		
		if (!$autoCreate) {
			return false;
		}
		
		$data = array(
			'site_name' => $host,
			'site_host' => $host,	
			'site_status' => 1,	
		);
		
		$db->table('t_site')
			->unique('site_id')
			->saveBody($data)
			->insert();
		$data['site_id'] = $db->getLastInsertId();
		return $data;
	}
	
	/**
	 * 获取站点
	 * @param int $siteId
	 * @return array | boolean
	 */
	static function getSite($siteId)
	{
		$sites = self::getAllSites();
		return isset($sites[$siteId]) ? $sites[$siteId] : false;
	}
	
	/**
	 * 获取所有站点
	 */
	static function getAllSites()
	{
		if (!self::$sites) {
			$rows = Db::get('ts_tiao')->table('t_site')->where('1=1')->get();
			self::$sites = LibUtil::load('EXArray')->indexArray($rows, 'site_id');
		}
		return self::$sites;
	}
	
	/**
	 * 添加站点
	 * @param string $host
	 * @param array $data
	 * @return int
	 */
	static function addSite($host, array $data)
	{
		$host = self::getRealHost($host);
		if (self::getSiteByHost($host, false)) {
			Db::get('ts_tiao')->table('t_site')->uniq('site_id')->saveBody($data)->insert();
		}
	}
	
	/**
	 * 更新站点
	 * @param int $siteId
	 * @param array $data
	 */
	static function updateSite($siteId, array $data)
	{
		$body = array();
		foreach(array('site_name', 'site_status') as $key) {
			if (isset($data[$key])) {
				$body[$key] = $data[$key];
			}
		}
		Db::get('ts_tiao')->table('t_site')->saveBody($body)->update();
	}
}