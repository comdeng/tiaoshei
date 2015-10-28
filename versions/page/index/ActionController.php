<?php
require_once PAGE_ROOT.'/index/TsController.php';
class ActionController extends TsController
{
	function index()
	{
		$tiaoApi = ANew('tiao');
		$data = $tiaoApi->getTiaos($this->_page, $this->_size);
		$tiaos = $data['data'];
		$this->set('tiaos', $tiaos);
		$this->set('total', $data['total']);
		
		$userIds = LibUtil::load('EXArray')->extractList($tiaos, 'user_id');
		$users = ANew('user')->getUsers($userIds);
		$this->set('users', $users);
		
		$tiaoProducts = array();
		$siteApi = ANew('site');
		foreach($tiaos as $tiao) {
			$tiaoId = $tiao['tiao_id'];
			
			$products = $tiaoApi->getTiaoProducts($tiaoId);
			
			foreach($products as $key=>$p) {
				if ($p['line_id']) {
					$line = $siteApi->getLine($p['line_id']);
					$products[$key]['site_name'] = $line['line_name'];
				} else if ($p['site_id']) {
					$site = $siteApi->getSite($p['site_id']);
					$products[$key]['site_name'] = $site['site_name'];
				} else {
					$products[$key]['site_name'] = '未知';
				}
			}
			$tiaoProducts[$tiaoId] = $products;
		}
		
		$this->set('tiaoProducts', $tiaoProducts);
		
		$this->setView('index/tpl/index.phtml');
	}	
}
