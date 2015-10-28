<?php
final class TsFilter implements IFilter
{
	private $gpc = false;
	private $isgl = false;
	private $cookieConf;

	function execute(WebApp $app)
	{
		// 是否为ajax请求
		$app->request->userData['is_ajax'] = $this->_isAjaxRequest($app);
		
		$this->_loadCom($app);
		
		$this->cookieConf = Conf::get('hapn.cookie');
		
		//输入参数的转义
		$this->gpc = get_magic_quotes_gpc();

		// 过滤提交内容html
		$this->_encodeInput($app,$app->request->inputs);

		// 产生一个唯一的id
		$this->_genSid($app);
		
		// 解析用户
		$this->_parseUser($app);
	}
	
	function _loadCom($app)
	{
		//加载Com模块
		require_once LIB_ROOT.'com/Com.php';
		$conf = Conf::get('hapn.com');
		if ($app->debug) {
			$conf['log_func'] = 'Logger::debug';
		}
		Com::init($conf);
	}
	
	/**
	 * 产生一个Tid
	 * @param WebApp $app
	 */
	function _genSid($app)
	{
		$conf = $this->cookieConf['sessionId'];
		$key = $conf['key'];
		if (($tid = $app->request->getCookie($key))) {
			Logger::addBasic(array($key => $tid));
			$app->request->userData[$key] = $tid;
			return;
		}
		
		$uid = md5(uniqid(mt_rand(),true));
		$app->request->userData[$key] = $uid;
		//设置一年用于追踪用户行为
		$app->response->setCookie($key, $uid, time() + $conf['expire'], '/', $conf['host']);
		Logger::addBasic(array($key => $uid));
		
	}
	
	/**
	 * 解析用户
	 * @param WebApp $app
	 */
	function _parseUser($app)
	{
		$conf = $this->cookieConf['user'];
		$key = $conf['key'];
		$cookie = $app->request->getCookie($key);
		if ($cookie) {
			$userApi = ANew('user');
			$info = $userApi->unpackCookie($cookie);
			if ($info) {
				if ($info['expire'] >= time()) {
					$app->request->userData['user_id'] = $info['user_id'];
					return;
				}
			}
		}
		$app->request->userData['user_id'] = 0;
	}
	
	/**
	 * 判断是否为ajax请求
	 * @param WebApp $app
	 */
	private function _isAjaxRequest($app)
	{
		return $app->request->getHeader('x_requested_with') == 'XMLHttpRequest';
	}

	/**
	 * 格式化输入参数
	 * @param WebApp $app
	 * @param array $inputs
	 */
	function _encodeInput($app, &$arr)
	{
		$sfileds=array();
		foreach($arr as $key=>$value) {
			if (strncmp($key,'rr_',3) === 0) {
				//rr_字段为富文本，需要html格式校验
				$value = $this->tidy($value, $app->encoding);
			} elseif (strncmp($key,'js_',3) !== 0) {
				if (is_array($value)) {
					$this->_encodeInput($app, $value);
				} else {
					$value = $this->text2Data($value);
				}
			}
			$arr[$key] = $value;
		}

	}
	
	private function tidy($value, $encoding)
	{
		// 利用系统的tidy函数过滤内容
		if(!function_exists('tidy_repair_string')){
			Logger::warning('no function tidy_repair_string, miss module tidy');
			return $value;
		}
		
		$conf = array(
				'output-xhtml'    => true,
				'char-encoding'   =>'utf8',
				'drop-empty-paras'=> false,
				'indent'          =>'auto',
				'show-body-only'  => true,
				'quote-marks'     => true,
				'hide-comments'   => true,
		);
		if ($encoding != 'UTF-8') {
			$value = mb_convert_encoding($value, 'UTF-8', $encoding);
		}
		$value = tidy_repair_string($value, $conf, 'utf8');
		if ($encoding != 'UTF-8') {
			$value = mb_convert_encoding($value, $encoding, 'UTF-8');
		}
		return $value;
		
	}

	private function text2Data($v)
	{
		if (is_string($v)) {
			$value = trim($v, " \t\r\n\x0b\v");
			if ($this->gpc){
				$value = stripslashes($value);
			}
			//$value = htmlspecialchars($value, ENT_NOQUOTES|ENT_QUOTES);
			//需要更多的转换处理，所以自己写函数了
			//一定得把&写第一个，否则有循环替换的问题
			$value = str_replace(array('&',"'",'"','>','<','`','{'),array('&amp;','&#039;','&quot;','&gt;','&lt;','&#096;','&#123;'),$value);
			$value = str_replace(array("\r\n", "\r", "\n"), "<br />", $value);
			return $value;
		} elseif (is_array($v)) {
			foreach($v as $key=>$value) {
				$v[$key] = $this->text2Data($value);
			}
			return $v;
		} else {
			return $v;
		}
	}

}