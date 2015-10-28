<?php

class ActionController extends PageController
{
	const MOBILE_HOST = 'http://3g.chinaventure.com.cn/news.asp?id=';

	private $cates = array(
		'touzi' => array(
			'name' => '投资',
			'url'  => 'http://news.chinaventure.com.cn/2-0-0.aspx',
		),
		'gongsi' => array(
			'name' => '公司',
			'url'  => 'http://news.chinaventure.com.cn/47-0-0.aspx',
		),
		'chanye' => array(
			'name' => '产业',
			'url'  => 'http://news.chinaventure.com.cn/3-0-0.aspx',
		),
		'renwu' => array(
			'name' => '人物',
			'url'  => 'http://news.chinaventure.com.cn/people.aspx',
		),
		'pinglun' => array(
			'name' => '评论',
			'url'  => 'http://news.chinaventure.com.cn/Special_Comment.aspx',
		),
	);

	function _before()
	{
		$this->request->of = 'json';
	}
	

	function index($ename)
	{
		if (!isset($this->cates[$ename])) {
			throw new Exception('hapn.u_notfound');
		}

		$cate = $this->cates[$ename];
		$url = $cate['url'];

		$lists = $this->getListByUrl($url);
		$this->set('lists', $lists);
	}

	function cates()
	{
		$cates = array();
		foreach($this->cates as $ename => $cate) {
			$cates[] = array(
				'ename' => $ename,
				'name'  => $cate['name'],
			);
		}
		$this->set('cates', $cates);
	}


	private function getListByUrl($url)
	{
		$dir = TMP_ROOT.'/sites/cn.com.chinaverture/';
		if (!is_dir($dir)) {
			mkdir($dir, 0777, true);
		}
		$file = $dir.md5($url).'.txt';

		if ( !is_file($file) ||  time() - filemtime($file)  > 300) {
			$curl = LibUtil::load('Curl');
			$body = $curl->get($url);
			$content = iconv('gbk', 'utf-8', $body['content']);
			file_put_contents($file, $content);
		} else {
			$content = file_get_contents($file);
		}

		$regex = '{<div class="vs_Analysis_div">(.+)</table>}ism';

		$lists = array();

		if (preg_match($regex, $content, $matches)) {
			$mcontent = $matches[1];

			if (preg_match_all('{<a href="http\:\/\/news\.chinaventure\.com\.cn\/\d+\/(\d+)\/(\d+)\.shtml" target="_blank">([^<]+)</a>}', $mcontent, $links)) {
				foreach($links[2] as $key => $id) {
					$title = $links[3][$key];
					$lists[] = array(
						'id'  	=> $id,
						'url' 	=> 'http://www.tiaoshei.com/api/cn.com.chinaventure/arti/'.$id,
						'title' => $title,
						'time' 	=> date('Y-m-d', strtotime($links[1][$key])),
					);
				}

			}
		}	
		return $lists;
	}

	function arti($id)
	{
		$id = intval($id);
		if ($id <= 0) {
			throw new Exception('hapn.u_notfound');
		}
		$url = self::MOBILE_HOST.$id;
		$dir = TMP_ROOT.'/sites/cn.com.chinaverture/';
		if (!is_dir($dir)) {
			mkdir($dir, 0777, true);
		}
		$file = $dir.md5($url).'.txt';

		$html = "";
		if (!is_file($file)) {
			$curl = LibUtil::load('Curl');
			$ret = $curl->get($url);
			$content = $ret['content'];
			if (preg_match("{(<h4>.+)(?:</?P><STRONG>)?>>}ism", $content, $matches)) {
				$html = "<!doctype html><html><head></head><body>{$matches[1]}</body></html>";
				file_put_contents($file, $html);
			}
		} else {
			$html = file_get_contents($file);
		}
		$this->request->of = 'html';
		$this->response->setRaw($html);
	}
}
