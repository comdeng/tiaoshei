<?php
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author Ronnie(dengxiaolong@gmail.com)
 * @date 2012-9-15
 * @version 1.0
 * @brief 
 *  
 **/
require PAGE_ROOT.'/index/TsController.php';

class ActionController extends TsController
{
	function index($productId)
	{
		$productId = intval($productId);
		if ($productId <= 0) {
			throw new Exception('hapn.u_notfound');
		}
		
		$tiaoApi = ANew('tiao');
		$product = $tiaoApi->getProduct($productId);
		if (!$product) {
			throw new Exception('hapn.u_notfound');
		}
		$siteApi = ANew('site');
		if ($product['line_id']) {
			$line = $siteApi->getLine($product['line_id']);
			$product['site_name'] = $line['line_name'];
		} else if ($product['site_id']) {
			$site = $siteApi->getSite($product['site_id']);
			$product['site_name'] = $site['site_name'];
		} else {
			$product['site_name'] = '未知';
		}
		
		$this->set('product', $product);
		
		$tiao = $tiaoApi->getTiao($product['tiao_id']);
		if (!$tiao) {
			throw new Exception('hapn.u_notfound');
		}
		$tiao['is_expired'] = $tiao['expire_time'] <= strtotime('+1 days');
		$this->set('tiao', $tiao);
		
		// 获取挑的所有产品，便于找出相邻的产品
		$products = $tiaoApi->getTiaoProducts($product['tiao_id']);
		$prevProduct = $nextProduct = false;
		$count = count($products);
		foreach($products as $key=>$p) {
			if ($p['product_id'] == $productId) {
				if ($key > 0) {
					$prevProduct = $products[$key - 1];
				}
				if ($key < $count - 1) {
					$nextProduct = $products[$key + 1];
				}
				break;
			}
		}
		$this->set('prevProduct', $prevProduct);
		$this->set('nextProduct', $nextProduct);
		
		// 获取产品的所有选择
		$type = $this->get('type', 'yes');
		if (!in_array($type, array('yes', 'no'))) {
			throw new Exception('hapn.u_input wrong type');
		}
		$this->set('product_id', $productId);
		$chooseType = ($type == 'yes' ? 1 : 0);
		$this->set('choose_type', $chooseType);
	
		$chooses = $tiaoApi->getProductChooses($productId, $chooseType, $this->_page, $this->_size);
		foreach($chooses as $key=>$choose) {
			if ($choose['user_id'] == $this->user['user_id']) {
				unset($chooses[$key]);
			}
		}
		$this->set('chooses', $chooses);
		
		// 找出所有的用户
		$users = array();
		if ($chooses) {
			$userIds = LibUtil::load('EXArray')->extractList($chooses, 'user_id');
			$userIds = array_unique($userIds);
			if ($userIds) {
				$userApi = ANew('user');
				$users =  $userApi->getUsers($userIds);
			}
		}
		$this->set('users', $users);
		
		// 获取当前用户的选择
		$userChoose = false;
		if ($this->user && $this->user['user_id']) {
			$userChoose = $tiaoApi->getUserChoose($this->user['user_id'], $productId, $chooseType);
		}
		$this->set('userChoose', $userChoose);
	
		$this->setView('tiao/tpl/product_index.phtml');
	}
	
	function _add_choose()
	{
		$productId = intval($this->get('product_id'));
		if ($productId <= 0) {
			throw new Exception('hapn.u_notfound');
		}
		$chooseType = intval($this->get('choose_type'));
		if (!in_array($chooseType, array(1,0))) {
			throw new Exception('hapn.u_input choose_type='.$chooseType);
		}
		
		$tiaoApi = ANew('tiao');
		$product = $tiaoApi->getProduct($productId);
		if (!$product) {
			throw new Exception('hapn.u_notfound');
		}
		
		$remark = $this->get('choose_remark');
		if (!$remark) {
			throw new Exception('choose.u_remarkIsEmpty');
		}
		
		$userId = $this->user['user_id'];
		$tiaoApi->setChoose($productId, $userId, $chooseType, array('choose_remark' => $remark));
	}
	

	function outlink($productId)
	{
		$productId = intval($productId);
		if ($productId <= 0) {
			throw new Exception('hapn.u_notfound');
		}
		$tiaoApi = ANew('tiao');
		$product = $tiaoApi->getProduct($productId);
		$this->response->redirect($product['product_url']);
	}
}
