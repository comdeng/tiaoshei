<?php
/**
 * @file StaticUrl.php
 * @author comdeng
 * @date 2012-10-2 上午8:32:29
 * @version 1.0
 * @brief 
 *  
 **/
class ZendViewStaticUrlHelper extends Zend_View_Helper_Abstract
{
	private $staticHost;
	function __construct()
	{
		$conf = Conf::get('hapn.host');
		$this->staticHost = isset($conf['static']) ? 'http://'.$conf['static'] : '';
	}
	
	function StaticUrl($url)
	{
		return $this->staticHost.$url;
	}
}