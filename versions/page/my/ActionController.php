<?php
require_once PAGE_ROOT.'/index/TsController.php';
class ActionController extends TsController
{
	protected $checkLogin = true;
	
	function index()
	{
		//$this->setView('my/tpl/index.phtml');
		$this->response->redirect('/my/tiao/lists');
	}
}