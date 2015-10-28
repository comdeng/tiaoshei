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
		
		$siteApi = ANew('site');
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
		$this->set('products', $products);
		
		$userIds = array($tiao['user_id']);
		foreach($products as $product) {
			$userIds[] = $product['user_id'];
		}
		array_unique($userIds);
		$userApi = ANew('user');
		$userList = $userApi->getUsers($userIds);
		
		$this->set('users', $userList);
		
		$this->setView('tiao/tpl/index.phtml');
	}
	
	function choose_list($productId)
	{
		$productId = intval($productId);
		if ($productId <= 0) {
			throw new Exception('hapn.u_notfound');
		}
		$tiaoApi = ANew('tiao');
		$type = intval($this->get('type'));
		if ($type != 'yes' || $type != 'no') {
			throw new Exception('hapn.u_input wrong type');
		}
		
		$chooses = $tiaoApi->getProductChooses($productId, $this->_page, $this->_size, $type == 'yes' ? 1 : 0);
		$this->set('chooses', $chooses);
		
		$this->set('product_id', $productId);
		
		$this->setView('tiao/tpl/choose_list.phtml');
	}
	
	function choose_nums($productId)
	{
		$productId = intval($productId);
		if ($productId <= 0) {
			throw new Exception('hapn.u_notfound');
		}
		$tiaoApi = ANew('tiao');
		$nums = $tiaoApi->getProductChooseNums($productId);
		$this->set('nums', $nums);
	}
}
