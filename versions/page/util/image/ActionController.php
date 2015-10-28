<?php
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author Ronnie(dengxiaolong@gmail.com)
 * @date 2012-9-16
 * @version 1.0
 * @brief 
 *  
 **/
require_once PAGE_ROOT.'/index/TsController.php';
class ActionController extends TsController
{
	protected $loadUser = false;
	
	function _upload()
	{
		$this->checkLogin();
		if (empty($_FILES['upload'])) {
			throw new Exception('image.u_fileIsNotSupplied name=upload');
		}
		$file = $_FILES['upload'];
		
		if ($file['error'] != 0) {
			throw new Exception('image.u_uploadError error='. $file['error']);
		}
		
		// 检测是否图片类型
		$path = $file['tmp_name'];
		if (@getimagesize($path) === FALSE) {
			throw new Exception('image.u_formatWrong');
		}
		
		// 获取是否加水印
		$watermark = $this->get('watermark', false);
		
		$image = Com::get('image');
		
		$rules = $this->get('rules');
		$isgl = Conf::get('hapn.gl', false);
		
		if (preg_match("{^(\d+)[xX](\d+)$}", $rules, $matches)) {
			$width = intval($matches[1]);
			$height = intval($matches[2]);
			$type = 'fill';
				
			if (!$isgl && !$rules) {
				throw new Exception('image.u_ruleNotSupported width='.$width.',height='.$height);
			}
		}
		$imageId = $image->save($path);
		Logger::trace("upload image:".$imageId);
		
		// 必须处理成字符串才行，否则js解析时会因为超过数值最大限而进行截取
		$this->set('id', $imageId.'');
		
		$host = Conf::get('hapn.host', '');
		$host = isset($host['cdn']) ? 'http://'.$host['cdn'] : '';
		
		$oriUrl = $image->getOriginUrl($imageId);
		
		$confs = Conf::get('hapn.com');
		$savedir = $confs['image']['savedir'];
		
		$oriPath = $savedir.'/'.$oriUrl;
		
		// 根据图片大小重新设置是否需要水印
		if ($watermark && !$image->needWatermark($oriPath)) {
			$watermark = false;
		}
		
		list($oriWidth, $oriHeight) = getimagesize($oriPath);
		if ($watermark) {
			$oriUrl = $host.'/'.$image->watermarkOrigin($imageId);
		} else {
			$oriUrl = $host.'/'.$oriUrl;
		}
		if ($rules) {
			// 根据规则调整图片大小
			if (is_string($rules)) {
				$rules = array_diff(explode(',', $rules), array(''));
				array_unique($rules);
			}
		
			$urls = array();
			$sizes = array();
			if (!empty($rules)) {
				// 对编辑器的图片规格进行特殊的处理。当图片大于编辑器规格的宽度时，将图片裁剪，并将裁剪后的url返回，否则返回原始url
				if (count($rules) == 1 && $rules[0] == 'editor') {
					$conf = $confs['image']['rules']['editor'];
					if ($oriWidth > $conf['width']) {
						$oriUrl = $image->resizeByRuleName($imageId, 'editor', $watermark);
						list($oriWidth, $oriHeight) = getimagesize($savedir.'/'.$oriUrl);
						$oriUrl = $host.'/'.$oriUrl;
					}
					$urls['per8'] = $host.'/'.$image->resizeByRuleName($imageId, 'per8');
						
					// 给原路径增加尺寸
					$oriUrl = preg_replace('/(?:\-(?:\d+)?[Xx](?:\d+)?)?\.(jpg|png|gif)$/', '-'.$oriWidth.'X'.$oriHeight.'.$1', $oriUrl);
				} else {
					foreach($rules as $rule) {
						if ($rule != 'origin') {
							$url = $image->resizeByRuleName($imageId, $rule, $watermark);
							list($w, $h) = getimagesize($savedir.'/'.$url);
							$sizes[$rule] = array($w, $h);
							$urls[$rule] = $host.'/'.$url;
						} else {
							$urls[$rule] = $oriUrl;
							$sizes[$rule] = array($oriWidth, $oriHeight);
						}
					}
				}
			}
			$this->set('urls', $urls);
			if ($sizes) {
				$this->set('sizes', $sizes);
			}
		}
		$this->set('url', $oriUrl);
		$this->set('width', $oriWidth);
		$this->set('height', $oriHeight);
		unlink($path);
		
		$this->response->setHeader('Content-type:text/html;charset=utf-8');
	}
	
	function downpic()
	{
		$url = $this->get('url');
		if (!$url) {
			$this->show404();
		}
		$img= Com::get('image');
		$info = $img->parseUrl($url);
		
		if ($info === false || $info['type'] == 'origin') {
			$this->show404();
			return;
		}
		$imageId = $info['id'];
		$type = $info['type'];
		$width = $info['width'];
		$height = $info['height'];
		
		$conf = Conf::get('hapn.host');
		$cdnHost = $conf['cdn'];
		$staticHost = $conf['static'];
		if (!$imageId) {
			$this->response->redirect('http://'.$staticHost.'/static/img/default/picture.png');
		}
		
		// 下载的图片地址，用来解决图片下载出错时的跟踪
		Logger::addBasic(array('pu' => $url));
		$originPath = $img->getFilePath($imageId);
		if (!file_exists($originPath)) {
			$this->show404();
			return;
		}
			
		// 检查图片规格
		if (!$img->getRuleName($width, $height, $type)) {
			$this->show404();
			return;
		}
		
		// 是否需要打水印
		$watermark = $info['watermark'];
		if ($watermark && !$img->needWatermark($originPath)) {
			$this->show404();
			return;
		}
		
		$newUrl = $img->resize($imageId, $width, $height, $type, $watermark);
		if (!isset($newUrl)) {
			$this->response->redirect('http://'.$staticHost.'/static/img/default/picture.png');
		}
		$conf = Conf::get('hapn.com');
		$newPath = $conf['image']['savedir'].'/'.$newUrl;
		$imgInfo = getimagesize($newPath);
		$this->response->setHeader('Content-type: '. $imgInfo['mime']);
		$this->response->setRaw(file_get_contents($newPath));
	}
	
	private function show404()
	{
		$this->response->setHeader('HTTP/1.1 404 Not Found');
		$this->response->setRaw('');
	}
}