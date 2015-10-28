<?php
/**
 * @file ActionController.php
 * @author comdeng
 * @date 2012-10-7 上午8:57:41
 * @version 1.0
 * @brief 
 *  
 **/
require_once PAGE_ROOT.'/index/TsController.php';
class ActionController extends TsController
{
	function index($userId)
	{
		$userId = intval($userId);
		if ($userId <= 0) {
			throw new Exception('hapn.u_args');
		}
		$this->response->redirect('/user/'.$userId.'/tiaos');
	}
	
	function tiaos($userId)
	{
		$userId = intval($userId);
		if ($userId <= 0) {
			throw new Exception('hapn.u_args');
		}
		$isMine = false;
		if ($userId == $this->user['user_id']) {
			$user = $this->user;
			$isMine = true;
		} else {
			$userApi = ANew('user');
			$user = $userApi->getUser($userId);
			if (!$user) {
				throw new Exception('hapn.u_notfound');
			}
		}
		$this->set('isMine', $isMine);
		$this->set('nuser', $user);
		
		// 获取用户所有的挑
		$tiaoApi = ANew('tiao');
		$datas = $tiaoApi->getUserTiaos($userId, $this->_page, $this->_size);
		$tiaos = $datas['data'];
		$this->set('tiaos', $tiaos);
		$this->set('total', $datas['total']);
		
		// 获取用户
		$userIds = LibUtil::load('EXArray')->extractList($tiaos, 'user_id');
		$users = ANew('user')->getUsers($userIds);
		$this->set('users', $users);
		// 获取产品
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
		
		$this->setView('user/tpl/index.phtml');
	}
}
