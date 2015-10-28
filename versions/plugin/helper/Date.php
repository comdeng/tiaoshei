<?php
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author Ronnie(dengxiaolong@jiehun.com.cn)
 * @date 2012-3-2
 * @version 1.0 
 * @brief 时间格式化
 *  
 **/
class ZendViewDateHelper extends Zend_View_Helper_Abstract
{
	const DATE_STYLE_SHORT = 'short';
	const DATE_STYLE_LONG = 'long';
	const DATE_STYLE_SMART = 'smart';

	function __construct()
	{
		$this->now = time();
		$this->year = date('Y', $this->now);
	}
	
	function Date($date = null, $formatName = self::DATE_STYLE_SHORT) {
		if ($date === null) {
			$date = time();
		} else {
			$date = intval($date);
		}
		if (!$date) {
			return '';
		}
		switch($formatName) {
			case self::DATE_STYLE_SHORT:
				return date('Y-m-d', $date);
			case self::DATE_STYLE_LONG:
				return date('Y-m-d H:i:s', $date);
			case self::DATE_STYLE_SMART:
				return $this->getSmartDate($date);
		}
	}

	private function getSmartDate($time)
	{
		$diff = $this->now - $time;
		if ($diff < 0) {
			return $this->Date($time, 'long');
		}
		if($diff<=30)
		{
			return '刚刚';
		}
		if ($diff < 60) {
			return '半分钟前';
		}
		if ($diff < 3600) {
			$minutes = ceil($diff/60);
			return ceil($diff/60).'分钟前';
		}
		$today = strtotime('today');
		if ($time >= $today) {
			return '今天 '.date('H:i', $time);
		}
		if ($today - $time < 86400) {
			return '昨天 '.date('H:i', $time);
		}
		if ($this->year != date('Y', $time)) {
			return date('Y-m-d H:i', $time);
		}
		return date('m-d H:i', $time);
	}
}