<?php
require_once dirname(dirname(__FILE__)).'/OpenidInterface.php';
final class TaobaoOpenidImpl implements OpenidInterface
{
	private $conf;
	
	function __construct($conf)
	{
		$this->conf = $conf;
	}
	
	/**
	 * 
	 * @return TopClient
	 */
	private function _getClient()
	{
		require_once EXLIB_ROOT.'/taobao/TopClient.php';
		$tc = new TopClient();
		$tc->appkey = $this->conf['app_key'];
		$tc->secretKey = $this->conf['app_secret'];
		return $tc;
	}
	
	/**
	 * 获取口令
	 * @param string $code
	 * @return array
	 */
	function getToken($code)
	{
		$params = array(
			'grant_type'    => 'authorization_code',
			'client_id'     => $this->conf['app_key'],
			'client_secret' => $this->conf['app_secret'],
			'code'          => $code,
			'redirect_uri'  => $this->conf['callback_url'],
		);
		
		$token = $this->_getClient()->curl('https://oauth.taobao.com/token', $params);
		return json_decode($token, true);
	}
	
	/**
	 * 获取用来验证的地址
	 * @return string
	 */
	function getAuthorizeURL()
	{
		return 'https://oauth.taobao.com/authorize?response_type=code&client_id='.
			$this->conf['app_key'].'&redirect_uri='.
			urlencode($this->conf['callback_url']).
			'&state=1';
	}
	
	/**
	 * (non-PHPdoc)
	 * @see OpenidInterface::parseToken()
	 */
	function parseToken($token)
	{
		$info = $this->getUserInfo($token['access_token']);
		return array(
			'bind_site_user_id' => $token['taobao_user_id'],
			'bind_info' => array(
				'nickname' => $token['taobao_user_nick'],
				'token' => $token['access_token'],		
			),		
			'avatar' => $info['avatar'],
			'sex' => isset($info['sex']) ? ($info['sex'] == 'm' ? 1 : 2) : 0,
		);
	}
	
	/**
	 * (non-PHPdoc)
	 * @see OpenidInterface::getUserInfo()
	 */
	function getUserInfo($sessionKey)
	{
		require_once EXLIB_ROOT.'/taobao/request/UserBuyerGetRequest.php';
		require_once EXLIB_ROOT.'/taobao/RequestCheckUtil.php';
		$req = new UserBuyerGetRequest();
		$req->setFields('nick,sex,avatar');
		$ret = $this->_getClient()->execute($req, $sessionKey);
		if ($ret->user) {
			return get_object_vars($ret->user);
		}
		return false;
	}
}