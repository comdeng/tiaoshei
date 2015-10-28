<?php
require_once PAGE_ROOT.'/index/TsController.php';
class ActionController extends TsController
{
	protected $loadUser = false;
	
	function index($tiaoId)
	{
		$this->loadCurrentUser();
		
		$tiaoId = intval($tiaoId);
		if ($tiaoId <= 0) {
			throw new Exception('hapn.u_notfound');
		}
		$tiaoApi = ANew('tiao');
		$tiao = $tiaoApi->getTiao($tiaoId);
		if (!$tiao) {
			throw new Exception('hapn.u_notfound');
		}
		$this->set('tiao', $tiao);
		
		$products = $tiaoApi->getTiaoProducts($tiaoId);
		$this->set('products', $products);
		
		$userIds = array($tiao['user_id']);
		foreach($products as $product) {
			$userIds[] = $product['user_id'];
		}
		$userIds = array_unique($userIds);
		$userApi = ANew('user');
		$users = $userApi->getUsers($userIds);
		
		$this->set('users', $users);
		
		$sites = $tiaoApi->getAllSites();
		$this->set('sites', $sites);
		
		$this->setView('tiao/tpl/index.phtml');
	}
	
	
	
}