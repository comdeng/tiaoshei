<?php
require_once PAGE_ROOT.'/index/TsController.php';
class ActionController extends TsController
{
	protected $checkLogin = true;
	
	private function loadTiao($tiaoId = null)
	{
		if (!$tiaoId) {
			$tiaoId = $this->get('tiao_id');
		}
		$tiaoId = intval($tiaoId);
		if ($tiaoId <= 0) {
			throw new Exception('hapn.u_notfound');
		}
		
		$tiaoApi = ANew('tiao');
		$tiao = $tiaoApi->getTiao($tiaoId);
		if (!$tiao) {
			throw new Exception('hapn.u_notfound');
		}
		
		if ($tiao['user_id'] != $this->user['user_id']) {
			throw new Exception('hapn.u_power');
		}
		
		$this->set('tiao', $tiao);
		return $tiao;
	} 
	
	function update($tiaoId)
	{
		$tiaoId = intval($tiaoId);
		$tiao = $this->loadTiao($tiaoId);
		
		$this->set('tiao', $tiao);
		$this->set('isUpdate', true);
		$this->setView('my/tiao/tpl/add.phtml');
	}
	
	function _update()
	{
		$tiao = $this->loadTiao();
		$this->_edit_tiao($tiao['tiao_id']);
	}
	
	function add()
	{
		$this->set('isUpdate', false);
		$this->setView('my/tiao/tpl/add.phtml');
	}
	
	function _add()
	{
		$tiaoId = $this->_edit_tiao();
		$this->set('tiao_id', $tiaoId);
	}
	
	function _delete()
	{
		$tiao = $this->loadTiao();
		$tiaoApi = ANew('tiao');
		$tiaoApi->delTiao($tiao['tiao_id']);
	}
	
	private function _edit_tiao($tiaoId = 0)
	{
		$name = $this->get('tiao_name');
		$desc = $this->get('tiao_desc');
		$expireTime = $this->get('expire_time');
		
		if (!$name || !$desc) {
			throw new Exception('hapn.u_input');
		}
		
		if ($expireTime) {
			$expireTime = strtotime($expireTime);
		}
		if (!$expireTime) {
			$expireTime = time() + 30* 24 * 3600;
		}
		
		
		$tiaoApi = ANew('tiao');
		if (!$tiaoId) {
			$tiaoId = $tiaoApi->addTiao($this->user['user_id'], array(
					'tiao_name' => $name,
					'tiao_desc' => $desc,
					'expire_time' => $expireTime,
			));
			return $tiaoId;
		} else {
			$tiaoApi->updateTiao($tiaoId, array(
					'tiao_name' => $name,
					'tiao_desc' => $desc,
					'expire_time' => $expireTime,
			));
		}
	}
	
	function _publish()
	{
		$tiao = $this->loadTiao();
		
		ANew('tiao')->updateTiao($tiao['tiao_id'], array('tiao_status' => 1));
	}
	
	function add_product($tiaoId)
	{
		$tiaoId = intval($tiaoId);
		$tiao = $this->loadTiao($tiaoId);
		
		$tiaoApi = ANew('tiao');
		$products = $tiaoApi->getTiaoProducts($tiaoId);
		$this->set('products', $products);
		
		$this->setView('my/tiao/tpl/add_product.phtml');
	}
	
	function _add_product()
	{
		$tiao = $this->loadTiao();
		$tiaoId = intval($tiao['tiao_id']);
		
		$name = $this->get('product_name');
		$price = $this->get('product_price');
		$url = $this->get('product_url');
		$image = $this->get('product_img');
		
		if (!$name || !$price || !is_numeric($price) || $price <= 0 || !$url || !$image) {
			throw new Exception('hapn.u_input');
		}
		
		$imgId = $this->getImageIdByUrl($image);
		
		$userId = $this->user['user_id'];
		// 添加产品
		$tiaoApi = ANew('tiao');
		$productId = $tiaoApi->addProduct($tiaoId, $userId, array(
			'product_name' => $name,
			'product_url' => $url,
			'product_img_id' => $imgId,
			'product_price' => $price,
		));
		
		// 添加评论
		$yesRemark = $this->get('yes_remark');
		if ($yesRemark) {
			$tiaoApi->setChoose($productId, $userId, 1, array('choose_remark'=>$yesRemark));
		}
		
		$noRemark = $this->get('no_remark');
		if ($noRemark) {
			$tiaoApi->setChoose($productId, $userId, 0, array('choose_remark'=>$noRemark));
		}
		
		$this->set('product_id', $productId);
	}
	
	function _update_product()
	{
		$userId = $this->user['user_id'];
		$productId = intval($this->get('product_id'));
		$tiaoApi = ANew('tiao');
		$product = $tiaoApi->getProduct($productId);
		if (!$product) {
			throw new Exception('hapn.u_notfound');
		}
		if ($product['user_id'] != $userId) {
			throw new Exception('hapn.u_power');
		}
		$tiao = $this->loadTiao($product['tiao_id']);
		$tiaoId = intval($tiao['tiao_id']);
		
		$name = $this->get('product_name');
		$price = $this->get('product_price');
		$image = $this->get('product_img');
		
		if (!$name || !$price || !is_numeric($price) || $price <= 0) {
			throw new Exception('hapn.u_input');
		}
		
		$imgId = 0;
		if ($image) {
			$imgId = $this->getImageIdByUrl($image);
		}
		
		$data = array(
			'product_name' => $name,
			'product_price' => $price,
		);
		if ($imgId) {
			$data['product_img_id'] = $imgId;
		}
		
		// 添加产品
		$tiaoApi = ANew('tiao');
		$tiaoApi->updateProduct($productId, $data);
		
		// 修改评论
		$yesRemark = $this->get('yes_remark');
		$noRemark = $this->get('no_remark');
		
		if ($yesRemark) {
			$tiaoApi->setChoose($productId, $userId, 1, array('choose_remark' => $yesRemark));
		} else {
			$tiaoApi->delChoose($productId, $userId, 1);
		}
		
		if ($noRemark) {
			$tiaoApi->setChoose($productId, $userId, 0, array('choose_remark' => $noRemark));
		} else {
			$tiaoApi->delChoose($productId, $userId, 0);
		}
	}
	
	/**
	 * 通过url获取图片id
	 * @param string $url
	 * @throws Exception
	 */
	private function getImageIdByUrl($url)
	{
		$info = parse_url($url);
		if (!$info || $info['scheme'] != 'http') {
			throw new Exception('hapn.u_imgUrlFormatWrong');
		}
		if (!in_array( strtolower(pathinfo($info['path'],  PATHINFO_EXTENSION)), array('jpg', 'jpeg', 'png', 'gif') )) {
			throw new Exception('tiao.u_wrongExtOfUrl');
		}
		
		$data = LibUtil::load('Curl')->get($url);
		if ($data['code'] != 200) {
			throw new Exception('tiao.u_imgFetchFailed');
		}
		$path = TMP_ROOT.'/'.uniqid().rand(1000, 9999);
		file_put_contents($path, $data['content']);
		$imgInfo = getimagesize($path);
		if ($imgInfo === FALSE) {
			throw new Exception('tiao.u_urlIsNotImage');
		}
		
		$img = Com::get('image');
		return $img->save($path);
	}
	
	/**
	 * 获取指定url下边的信息
	 */
	function _get_url_info()
	{
		$url = $this->get('url');
		
		if (!$url) {
			throw new Exception('hapn.u_args');
		}
		$siteApi = ANew('site');
		$info = $siteApi->parseUrl($url);
		$this->set('info', $info);
	}
	
	function lists()
	{
		$tiaoApi = ANew('tiao');
		$data = $tiaoApi->getUserTiaos($this->user['user_id'], $this->_page, $this->_size, 2);
		
		$this->set('total', $data['total']);
		$this->set('tiaoList', $data['data']);
		
		$this->setView('my/tiao/tpl/lists.phtml');
	}
	
	function products($tiaoId)
	{
		$tiaoId = intval($tiaoId);
		$tiao = $this->loadTiao($tiaoId);
		
		$tiaoApi = ANew('tiao');
		$products = $tiaoApi->getTiaoProducts($tiaoId);
		$this->set('products', $products);
		$this->set('total', count($products));
		
		$this->setView('my/tiao/tpl/products.phtml');
	}
	
	function add_product1($tiaoId)
	{
		$tiaoId = intval($tiaoId);
		$tiao = $this->loadTiao($tiaoId);
		
		$url = $this->get('url');
		
		if (!$url) {
			throw new Exception('hapn.u_args');
		}
		$siteApi = ANew('site');
		$info = $siteApi->parseUrl($url);
		$this->set('info', $info);
		
		$this->set('isUpdate', false);
		
		$this->setView('my/tiao/tpl/add_product1.phtml');
	}
	
	function update_product($productId)
	{
		$productId = intval($productId);
		$tiaoApi = ANew('tiao');
		$product = $tiaoApi->getProduct($productId);
		if (!$product) {
			throw new Exception('hapn.u_notfound');
		}
		$this->set('product', $product);
		$this->set('isUpdate', true);
		
		$tiao = $this->loadTiao($product['tiao_id']);
		
		$chooses = $tiaoApi->getUserChoose($this->user['user_id'], $productId, 2);
		$this->set('chooses', $chooses);
		
		$this->setView('my/tiao/tpl/add_product1.phtml');
	}
	
	function _del_product()
	{
		$productId = intval($this->get('product_id'));
		if ($productId <= 0) {
			throw new Exception('hapn.u_args');
		}
		
		$tiaoApi = ANew('tiao');
		$product = $tiaoApi->getProduct($productId);
		if (!$product) {
			throw new Exception('hapn.u_args');
		}
		if ($product['user_id'] != $this->user['user_id']) {
			throw new Exception('hapn.u_power');
		}
		$tiaoApi->delProduct($productId);
	}
}