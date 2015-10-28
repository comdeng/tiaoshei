<?php
/**
 * @file TencentOpenidImpl.php
 * @author comdeng
 * @date 2012-10-7 下午7:47:53
 * @version 1.0
 * @brief 
 *  
 **/
require_once dirname(dirname(__FILE__)).'/OpenidInterface.php';
final class TencentOpenidImpl implements OpenidInterface
{
	private $conf;
	private $authUrl = 'http://redfox.oauth.com/oauth/qq_callback.php';
	private $scope = 'get_user_info';
	
	function __construct($conf)
	{
		$this->conf = $conf;
	}
	
	/**
	 * (non-PHPdoc)
	 * @see OpenidInterface::getAuthorizeURL()
	 */
	function getAuthorizeURL()
	{
		return 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id='
			. $this->conf['app_key'] 
			. "&redirect_uri=" . urlencode($this->conf['callback_url'])
			. "&scope=".$this->scope;
	}
	
	/**
	 * (non-PHPdoc)
	 * @see OpenidInterface::getToken()
	 */
	function getToken($code)
	{
		$token_url = 'https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&'
			. 'client_id=' . $this->conf['app_key']. '&redirect_uri=' . urlencode($this->conf['callback_url'])
			. "&client_secret=" . $this->conf['app_secret']. "&code=" . $code;
		$response = file_get_contents($token_url);
		
		if (strpos($response, 'callback') !== false) {
			$lpos = strpos($response, '(');
			$rpos = strrpos($response, ')');
			$response  = substr($response, $lpos + 1, $rpos - $lpos -1);
			$msg = json_decode($response);
			if (isset($msg->error)) {
				throw new Exception('openid.u_tencentGetTokenError error:'.$msg->error.';msg:'.$msg->error_description);
			}
		}
		$params = array();
		parse_str($response, $params);
		return $params;
	}
	
	/**
	 * (non-PHPdoc)
	 * @see OpenidInterface::parseToken()
	 */
	function parseToken($token)
	{
		$openId = $this->get_openid($token['access_token']);
		
		$get_user_info = "https://graph.qq.com/user/get_user_info?"
			. "access_token=" . $token['access_token']
			. "&oauth_consumer_key=" . $this->conf['app_key']
			. "&openid=" . $openId
			. "&format=json";
		
		$response = file_get_contents($get_user_info);
		$info = json_decode($response, true);
		
		$ret['bind_site_user_id'] = self::create_sign64($openId);
		$ret['bind_info'] = array(
			'nickname' 	=> $info['nickname'],
			'open_id'	=> $openId,
			'token' 	=> $token['access_token'],
		);
		foreach(array('figureurl_2', 'figureurl_1', 'figureurl') as $key) {
			if (!empty($info[$key])) {
				$ret['avatar'] = $info[$key];
				break;
			}
		}
		$ret['sex'] = $info['gender'] == '男' ? 1 : 2;
		return $ret;
	}
	
	private function get_openid($token)
	{
		$graph_url = "https://graph.qq.com/oauth2.0/me?access_token="
				. $token;
	
		$response = file_get_contents($graph_url);
		if (strpos($response, 'callback') !== false)
		{
			$lpos = strpos($response, '(');
			$rpos = strrpos($response, ')');
			$response  = substr($response, $lpos + 1, $rpos - $lpos -1);
		}
		
		$user = json_decode($response);
		if (isset($user->error)) {
			throw new Exception('openid.u_tencentGetOpenidError error:'.$user->error.';msg:'.$user->error_description);
		}
		
		return $user->openid;
	}
	
	private static function create_sign64($s)
	{
		$hash = md5 ( $s, true );
		$high = substr ( $hash, 0, 8 );
		$low = substr ( $hash, 8, 8 );
		$sign = $high ^ $low;
		$sign1 = hexdec ( bin2hex ( substr ( $sign, 0, 4 ) ) );
		$sign2 = hexdec ( bin2hex ( substr ( $sign, 4, 4 ) ) );
		return sprintf('%u', ($sign1 << 32) | $sign2);
	}
}