<?php
final class TiaoExport
{
	/**
	 * 获取挑
	 * @param int $tiaoId
	 * @return array | false
	 */
	function getTiao($tiaoId)
	{
		require_once dirname(__FILE__).'/logic/TiaoImpl.php';
		return TiaoImpl::getTiao($tiaoId);
	}
	
	/**
	 * 分页获取挑
	 * @param int $page
	 * @param int $num
	 * @return array
	 */
	function getTiaos($page, $num)
	{
		require_once dirname(__FILE__).'/logic/TiaoImpl.php';
		return TiaoImpl::pagedGetTiaos($page, $num);
	}
	
	/**
	 * 分页获取指定用户的挑
	 * @param int $userId
	 * @param int $page
	 * @param int $num
	 * @param int $status
	 * 1 已经发布的
	 * 0 尚未发布的
	 * 2 包括已经发布和尚未发布的
	 */
	static function getUserTiaos($userId, $page, $num, $status = 1)
	{
		require_once dirname(__FILE__).'/logic/TiaoImpl.php';
		return TiaoImpl::pagedGetTiaosByUserId($userId, $page, $num, $status);
	}
	
	/**
	 * 增加挑
	 * @param int $userId
	 * @param array $data
	 * <code>array(
	 * 	'tiao_name',
	 *  'tiao_desc',
	 *  'expire_time',
	 * )</code>
	 * @return int
	 */
	function addTiao($userId, array $data)
	{
		require_once dirname(__FILE__).'/logic/TiaoImpl.php';
		return TiaoImpl::addTiao($userId, $data);
	}

	/**
	 * 更新挑
	 * @param int $tiaoId
	 * @param array $data
	 */
	function updateTiao($tiaoId, array $data)
	{
		require_once dirname(__FILE__).'/logic/TiaoImpl.php';
		TiaoImpl::updateTiao($tiaoId, $data);
	}

	/**
	 * 删除挑
	 * @param int $tiaoId
	 */
	function delTiao($tiaoId)
	{
		require_once dirname(__FILE__).'/logic/TiaoImpl.php';
		TiaoImpl::updateTiao($tiaoId, array('tiao_status' => -1));
	}
	
	/**
	 * 获取产品
	 * @param int $productId
	 * @return array | false
	 */
	function getProduct($productId)
	{
		require_once dirname(__FILE__).'/logic/ProductImpl.php';
		return ProductImpl::getProduct($productId);
	}
	
	/**
	 * 通过指定挑下边的所有产品
	 * @param int $tiaoId
	 * @return array
	 */
	function getTiaoProducts($tiaoId)
	{
		require_once dirname(__FILE__).'/logic/ProductImpl.php';
		return ProductImpl::getProductsByTiaoId($tiaoId);
	}

	/**
	 * 添加产品
	 * @param int $tiaoId
	 * @param int $userId
	 * @param array $data
	 * <code>array(
	 *  'product_name',
	 *  'product_url',
	 *  'product_img_id',
	 *  'product_price',
	 *  'product_status', 不指定为1
	 * )</code>
	 * @return int
	 */
	function addProduct($tiaoId, $userId, array $data)
	{
		$url = $data['product_url'];
		$info = parse_url($url);
		if ($info === FALSE) {
			throw new Exception('tiao.u_productUrlWrong');
		}
		
		// 找到对应的站点
		$siteApi = ANew('site');
		$line = $siteApi->getLineByHost($info['host']);
		if ($line) {
			$data['site_id'] = $line['site_id'];
			$data['line_id'] = $line['line_id'];
		} else {
			$data['site_id'] = $data['line_id'] = 0;
		}
		
		require_once dirname(__FILE__).'/logic/ProductImpl.php';
		return ProductImpl::addProduct($tiaoId, $userId, $data);
	}

	/**
	 * 更新产品
	 * @param int $productId
	 * @param array $data
	 */
	function updateProduct($productId, array $data)
	{
		require_once dirname(__FILE__).'/logic/ProductImpl.php';
		return ProductImpl::updateProduct($productId, $data);
	}

	/**
	 * 删除产品
	 * @param  $productId
	 */
	function delProduct($productId)
	{
		require_once dirname(__FILE__).'/logic/ProductImpl.php';
		$product = ProductImpl::getProduct($productId);
		if (!$product) {
			return;
		}
		
		ProductImpl::updateProduct($productId, array('product_status' => -1));
		// 没有产品时更新挑的状态为未发布状态
		$products = ProductImpl::getProductsByTiaoId($product['tiao_id']);
		if (!$products) {
			require_once dirname(__FILE__).'/logic/TiaoImpl.php';
			TiaoImpl::updateTiao($tiaoId, array('tiao_status' => 0));
		}
	}
	
	
	/**
	 * 分页获取选择列表
	 * @param int $productId
	 * @param int $chooseType 1:挑 0：不挑
	 * @param int $page
	 * @param int $num
	 */
	function getProductChooses($productId, $chooseType, $page = 0, $num = 20)
	{
		require_once dirname(__FILE__).'/logic/ChooseImpl.php';
		return ChooseImpl::getChoosesByProductId($productId, $chooseType, $page, $num);
	}

	/**
	 * 添加选择
	 * @param int $productId
	 * @param int $userId
	 * @param int $type
	 * @param array $data
	 * <code>array(
	 *  'choose_remark',
	 *  'choose_status' 
	 * )</code>
	 */
	function setChoose($productId, $userId, $type, array $data)
	{
		require_once dirname(__FILE__).'/logic/ChooseImpl.php';
		$chooseId = ChooseImpl::setChoose($productId, $userId, $type, $data);
		
		require_once dirname(__FILE__).'/logic/ProductImpl.php';
		ProductImpl::updateProductChooseNum($productId, $type);
		return $chooseId;
	}


	/**
	 * 删除选择
	 * @param int $productId
	 * @param int $userId
	 * @param int $type
	 */
	function delChoose($productId, $userId, $type)
	{
		require_once dirname(__FILE__).'/logic/ChooseImpl.php';
		ChooseImpl::setChoose($productId, $userId, $type, array('choose_status' => -1));
		
		require_once dirname(__FILE__).'/logic/ProductImpl.php';
		ProductImpl::updateProductChooseNum($productId, $type);
	}
	
	
	/**
	 * 获取用户的选择
	 * @param int $userId
	 * @param int $productId
	 * @param int $type 1 挑 0 不挑 2 所有类型
	 */
	function getUserChoose($userId, $productId, $type)
	{
		require_once dirname(__FILE__).'/logic/ChooseImpl.php';
		return ChooseImpl::getChooseByUserId($userId, $productId, $type);
	}
}
