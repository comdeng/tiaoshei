<?php
/**
 * @file SiteImpl.php
 * @author comdeng
 * @date 2012-9-29 上午11:45:10
 * @version 1.0
 * @brief 
 *  
 **/
final class SiteImpl
{
	/**
	 * 解析网址
	 * @param string $url
	 * @throws Exception
	 */
	static function parseUrl($url)
	{
		if (!$url) {
			throw new Exception('site.u_args');
		}
	
		$url = trim($url);
		$info = @parse_url($url);
		if (!$info) {
			throw new Exception('site.u_urlFormatWrong');
		}
	
		// 先根据host获取站点
		$line = self::getLineByHost($info['host']);
		if (!$line) {
			// 创建站点
			$line = self::parseSite(self::getMainHost($info['host']));
			$siteId = self::addSite($line);
			$line['line_id'] = 0;
			$line['site_id'] = $siteId;
		}
		
		$item_regex = $image_regex = $item_url = '';
		if ($line['line_id']) {
			$item_regex = $line['item_regex'];
			$image_regex = $line['image_regex'];
			$item_url = $line['item_url'];
		}
		// 检查item的路径是否匹配
		$uri = $info['path'].(isset($info['query']) ? '?'.$info['query'] : '');
		$item_id = 0;
		if ($item_regex) {
			if (!preg_match('{'.$item_regex.'}', $uri, $matches)) {
				throw new Exception('site.u_urlFormatWrong');
			} else {
				$item_id = $matches[1];
			}
		}
		// 纠正网址
		if ($item_id && $item_url) {
			$url = 'http://'.$info['host'].str_replace('${id}', $item_id, $item_url);
		}
		
		$body = self::getContentByUrl($url);
		$ret = array();
		
		$ret['images'] = array();
		$ret['title'] = '';
		if (!empty($line['meta_selector'])) {
			$meta_selector = $line['meta_selector'];
			
			require_once EXLIB_ROOT.'/dom/simple_html_dom.php';
			$dom = str_get_html($body);
			$container = $dom->find($meta_selector, 0);
			foreach($container->find('img') as $image) {
				if ($image->src && preg_match('/\.(jpe?g|png|gif)/', $image->src)) {
					if ($image_regex) {
						if (preg_match('{'.$image_regex.'}', $image->src)) {
							$ret['images'][] = trim($image->src);
						}
					} else {
						$ret['images'][] = trim($image->src);
					}
				}
			}
			
			if (!empty($line['price_selector'])) {
				$priceSelector = $container->find($line['price_selector'], 0);
				if ($priceSelector) {
					$price = floatval( preg_replace('/[$￥\s]/', '', $priceSelector->plaintext));
					if ($price > 0) {
						$ret['price'] = $price;
					}
				}
			}
			if (!empty($line['title_selector'])) {
				$titleSelector = $container->find($line['title_selector'], 0);
				if ($titleSelector) {
					$ret['title'] = trim($titleSelector->plaintext);
				}
			}
		} else {
			// 获取网页图片
			if (preg_match_all('/<img .+?[\'\"]?(http\:\/\/[^\'\"]+\.(?:jpe?g|png|gif))[\'\"]?\b.*?\/?>/i', $body, $matches)) {
				if ($image_regex) {
					foreach($matches[1] as $imgUrl) {
						if (preg_match('{'.$image_regex.'}', $imgUrl)) {
							$ret['images'][] = $imgUrl;
						}
					}
				} else {
					$ret['images'] = $matches[1];
				}
			}
		}
		
		// 获取商品标题
		if (!$ret['title'] && preg_match('/<title>([^<]*)<\/title>/i', $body, $matches)) {
			$ret['title'] = trim($matches[1]);
		}
		
		$ret['url'] = $url;
		$ret['line'] = $line;
		$ret['item_id'] = $item_id;
		return $ret;
	}
	
	/**
	 * 获取项目的信息
	 * @param string $url
	 * @param string $imageHost
	 * @return array
	 */
	private static function getItemInfo($url, $imageHost = '')
	{
		$body = self::getContentByUrl($url);
		$ret = array();
		// 获取网页标题
		if (preg_match('/<title>([^<]*)<\/title>/i', $body, $matches)) {
			$ret['title'] = trim($matches[1]);
		}
		
		$ret['images'] = array();
		// 获取网页图片
		if (preg_match_all('/<img .+?[\'\"]?(http\:\/\/[^\'\"]+\.(?:jpe?g|png|gif))[\'\"]?\b.*?\/?>/i', $body, $matches)) {
			if ($cdnHost) {
				foreach($matches[1] as $imgUrl) {
					$imgInfo = parse_url($imgUrl);
					if (preg_match($cdnHost, $imgInfo['host'])) {
						$ret['images'][] = $imgUrl;
					}
				}
			} else {
				$ret['images'] = $matches[1];
			}
		}
		
		return $ret;
	}
	
	/**
	 * 根据主机名获取对应的网站产品
	 * @param string $host
	 * @return array | false
	 * 返回包含site和line信息的数组
	 * 如果为false，表示没有找到相关连的网站
	 * 如果返回数组中line_id=0，表示找到对应的网站，但是没有对应的产品
	 * 否则，表示找到对应的网站及产品，可以运用相关规则对网站进行分析
	 */
	static function getLineByHost($host)
	{
		$host = strtolower($host);
		// 先根据host获取站点
		$mHost = self::getMainHost($host);
		$site = self::getSiteByHost($mHost);
		
		if ($site) {
			require_once dirname(__FILE__).'/LineImpl.php';
			$lines = LineImpl::getLinesBySiteId($site['site_id']);
			// 找到合适的网站产品
			foreach($lines as $line) {
				$h = $line['item_host'];
				if (strpos($h, '^') === 0) {
					if (preg_match($h, $host)) {
						return array_merge($site, $line);
					}
				} else {
					if ($h == $host) {
						return array_merge($site, $line);
					}
				}
			}
			$site['line_id'] = 0;
			return $site;
		}
		return false;
	}
	
	
	/**
	 * 根据主机名自动创建网站
	 * @param 主机名 $host
	 */
	static function parseSite($host)
	{
		$url = 'http://www.'.$host;
		$content = self::getContentByUrl($url);
		
		$data = array();
		$hs = explode('.', $host);
		// 获取网页标题
		$data['site_sname'] = $data['site_name'] = self::getPageTitle($content);
		$data['site_ename'] = $hs[0];
		$data['site_host'] = $host;
		return $data;
	}
	
	/**
	 * 返回站点
	 * @param int $siteId
	 * @return array | false
	 */
	static function getSite($siteId)
	{
		$rows = Db::get('ts_site')->table('s_site')->where(array('site_id' => $siteId, 'site_status' => 1))->get();
		if ($rows) {
			return array_shift($rows);
		}
		return false;
	}
	
	/**
	 * 添加网站
	 * @param array $data
	 * @return int
	 */
	static function addSite(array $data)
	{
		$data['site_status'] = 1;
		$db = Db::get('ts_site');
		$db->table('s_site')->unique('site_id')->saveBody($data)->insert();
		return $db->getLastInsertId();
	}
	
	/**
	 * 获取网页的标题
	 * @param string $content
	 * @return string
	 */
	private static function getPageTitle($content)
	{
		if (preg_match('/<title>([^<]*)<\/title>/i', $content, $matches)) {
			if (preg_match('/([a-zA-Z0-9\+\.x{4e00}-\x{9fa5}]+)/u', $matches[1], $titles)) {
				$ts = preg_split('/[—，。 、]/u', $titles[0]);
				return $ts[0];
			} else {
				return $matches[1];
			}
		}
		return '';
	}
	
	
	/**
	 * 根据主机名获取网站
	 * @param string $host
	 * @return mixed|boolean
	 */
	static function getSiteByHost($host)
	{
		$rows = Db::get('ts_site')->table('s_site')->where(array(
			'site_host' => $host,
			'site_status!' => -1
			))->get();
		if ($rows) {
			return array_shift($rows);
		}
		return false;
	}
	
	/**
	 * 获取域名的主域
	 * @param string $host
	 * @return string
	 */
	private static function getMainHost($host)
	{
		$pos = strpos($host, ':');
		if ($pos !== false) {
			$host = substr($host, 0, $pos);
		}
		$arr = explode('.', $host);
		for($i = count($arr) - 1; $i > 0; $i--) {
			if (!is_numeric($arr[$i]) && !in_array($arr[$i], array('com','cn','net','org'))) {
				break;
			}
		}
		if ($i == 0) {
			return $host;
		}
		return implode('.', array_slice($arr, $i));
	}
	
	/**
	 * 通过url获取页面内容
	 * @param string $url
	 * @throws Exception
	 * @return string
	 */
	static function getContentByUrl($url)
	{
		$data = LibUtil::load('Curl')->get($url, Conf::get('curl.options'));
		if ($data['code'] != 200) {
			throw new Exception('site.u_getUrlFailed code='.$data['code']);
		}
		$body = $data['content'];
		if (!$body) {
			return '';
		}
		$charset = '';
		// 分析编码
		if (isset($data['header']['Content-Type'])) {
			if (preg_match('/charset\s*=\s*(.+)$/i', $data['header']['Content-Type'], $matches)) {
				$charset = strtoupper(trim($matches[1]));
			}
		}
		if (!$charset) {
			if (preg_match('/<meta .*?charset\s*=\s*[\'\"]?([^\'\"]+)[\'\"].*?\/?>/i', $body, $matches)) {
				$charset = strtoupper(trim($matches[1]));
			}
		}
		if ($charset == 'GB2312') {
			$charset = 'GBK';
		}
		if ($charset && $charset != 'UTF-8') {
			$body = iconv($charset, 'UTF-8//IGNORE', $body);
		}
		return $body;
	}
	
}