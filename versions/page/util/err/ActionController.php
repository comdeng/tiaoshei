<?php
/**
 * @file ActionController.php
 * @author comdeng
 * @date 2012-10-7 下午4:33:37
 * @version 1.0
 * @brief 
 *  
 **/
class ActionController extends PageController
{
	function notfound()
	{
		$this->set('url', $this->get('u'));
		$this->setView('util/err/tpl/notfound.phtml');
	}
	
	function power()
	{
		$this->setView('util/err/tpl/power.phtml');
	}
	
	function error()
	{
		$this->setView('util/err/tpl/error.phtml');
	}
}