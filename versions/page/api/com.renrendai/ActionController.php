<?php

class ActionController extends PageController
{
	const LEND_PAGE = 'http://www.renrendai.com/lend/loanList.action?id=all_biao_list&orderid=&amountAsc=&monthsAsc=&interestAsc=&creditAsc=&versionAsc=&endTimeAsc=&pageIndex=';
	const HOST = 'http://www.renrendai.com/';



	function lends()
	{
		$dir = TMP_ROOT.'/sites/com.renrendai/';
		if (!is_dir($dir)) {
			mkdir($dir, 0777, true);
		}

		$page = $this->get('_pn', 1);
		$url = self::LEND_PAGE.$page;
		$path = $dir.md5($url).'.txt';
		$content = false;
		$keys = array('type', 'url', 'name', 'user_url', 'username', 'total', 'rate', 'month', 'auth_level', 'percent', 'left_time');
		if (!is_file($path) || time() - filemtime($path) > 300) {
			$curl = LibUtil::load('Curl');
			$ret = $curl->get($url);
			if ($ret['code'] == 200) {
				$content = $ret['content'];
				file_put_contents($path, $content);
				$updateTime = time();
			}
		} else {
			$updateTime = filemtime($path);
			$content = file_get_contents($path);
		}
		if (!$content) {
			throw new Exception('hapn.u_notfound');
		}
		$ret = array();

		if (preg_match_all("{<img src=\"\.\./images/biao_icon/[^\"]+\" alt=\"([^\"]+)\".+?<a href=\"(\.\./lend/detailPage.action\?loanId=\d+)\" target=\"_blank\">[\r\n\s\t]*([^<]+?)[\r\n\s\t]*</a>.+?<a href=\"(\.\./lend/userHomePage.action\?userId=\d+)\" target=\"_blank\">([^<]+)</a>.+?￥([\d,]+).+?([\d\.]+)%.+?(\d+)个月.+?\/level\/([a-z0-9]+)\.png.+?(?:([\d\.]+)%.+?)?(<div class=\"(?:f_dgray\".+?|l f_red w115\">[^\<]+)</div>)}ims", $content, $matches)) {

			$l = count($matches[0]);
			for($i = 1; $i < count($matches); $i++) {
				for($j = 0; $j < $l; $j++) {
					if (!isset($ret[$j])) {
						$ret[$j] = array();
					}
					$ret[$j][$keys[$i - 1]] = $matches[$i][$j];
				}
			}
		}

		foreach($ret as $key=>$row) {
			$ret[$key]['url'] = self::HOST. str_replace('../', '', $row['url']);
			$ret[$key]['user_url'] = self::HOST. str_replace('../', '', $row['user_url']);
			$ret[$key]['left_time'] = strip_tags($row['left_time']);
		}

		$this->set('lists', $ret);
		$this->set('page', $page);
		$this->set('updateTime', $updateTime);
		if ($this->request->of == 'default') {
			$this->setView('api/com.renrendai/tpl/lends.phtml');
		}
	}
}

