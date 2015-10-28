<?php
require_once dirname(__FILE__).'/logic/SiteImpl.php';
/**
 * @file SiteExport.php
* @author comdeng
* @date 2012-9-29 上午11:45:10
* @version 1.0
* @brief
*
**/

final class SiteExport
{
	/**
	 * 解析网址
	 * @param string $url
	 * @throws Exception
	 */
	function parseUrl($url)
	{
		return SiteImpl::parseUrl($url);
	}	
	
	/**
	 * 通过主机名获取对应的网站产品
	 * @param string $host
	 * @param boolean $autoCreate 是否自动创建这个站点
	 * @return array | boolean
	 * <code>array(
	 *  site_id,
	 *  site_name,
	 *  site_sname,
	 *  site_host,
	 *  site_status,
	 *  line_id, 如果为0则不会输出之后的内容
	 *  line_name,
	 *  item_host,
	 *  item_regex,
	 *  item_url,
	 *  meta_selector, // 商品信息选择器
	 *  image_regex,
	 *  line_status,
	 * )</code>
	 */
	function getLineByHost($host, $autoCreate = true)
	{
		$line = SiteImpl::getLineByHost($host);
		if (!$line && $autoCreate) {
			// 创建站点
			$line = SiteImpl::parseSite(SiteImpl::getMainHost($info['host']));
			$line['line_id'] = 0;
			$siteId = SiteImpl::addSite($site);
			$line['site_id'] = $siteId;
		}
		return $line;
	}
	
	/**
	 * 获取指定站点
	 * @param int $siteId
	 * @return array | false
	 */
	function getSite($siteId)
	{
		require_once dirname(__FILE__).'/logic/SiteImpl.php';
		return SiteImpl::getSite($siteId);
	}
	
	/**
	 * 获取指定产品
	 * @param int $lineId
	 * @return array | false
	 */
	function getLine($lineId)
	{
		require_once dirname(__FILE__).'/logic/LineImpl.php';
		return LineImpl::getLine($lineId);
	}
}
