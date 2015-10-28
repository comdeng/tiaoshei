<?php
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author Ronnie(dengxiaolong@jiehun.com.cn)
 * @date 2012-3-2
 * @version 1.0 
 * @brief 图片显示
 *  
 **/
class ZendViewPictureHelper extends Zend_View_Helper_Abstract
{
	private $image;
	private $host;
	private $sHost;
	
	function __construct()
	{
		$this->image = Com::get('image');
		$conf = Conf::get('hapn.host');
		$this->host = 'http://'.$conf['cdn'].'/';
		$this->sHost = 'http://'.$conf['static'].'/';
	}
	
	function Picture($id, $rule = null, $lazyLoad = false)
	{
		if (!$id) {
			return $this->sHost.'/static/img/default/default.png';
		}
		if ($rule === null) {
			$rule = 'origin';
		}
		if ($rule == 'origin') {
			return $this->host.$this->image->getOriginUrl($id);
		} else {
			return $this->host.$this->image->getUrlByRuleName($id, $rule);
		}
	}
}