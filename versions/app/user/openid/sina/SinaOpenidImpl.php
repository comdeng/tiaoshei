<?php
require_once dirname(dirname(__FILE__)).'/OpenidInterface.php';
final class SinaOpenidImpl implements OpenidInterface
{
	private $conf;
	
	function __construct($conf)
	{
		$this->conf = $conf;
	}
	
	/**
	 * 
	 * @return SaeTOAuthV2
	 */
	private function _getClient($token = NULL)
	{
		require_once EXLIB_ROOT.'/sina/saetv2.ex.class.php';
		return new SaeTOAuthV2( $this->conf['app_key'] , $this->conf['app_secret'] , $token);
	}
	
	/**
	 * 获取口令
	 * @param string $code
	 * @return array
	 */
	function getToken($code)
	{
		$o = $this->_getClient();
		$keys = array();
		$keys['code'] = $code;
		$keys['redirect_uri'] = $this->conf['callback_url'];
		try {
			return $o->getAccessToken( 'code', $keys ) ;
		} catch (OAuthException $e) {
			return false;
		}
	}
	
	/**
	 * 获取用来验证的地址
	 * @return string
	 */
	function getAuthorizeURL()
	{
		return $this->_getClient()->getAuthorizeURL( $this->conf['callback_url'] );
	}
	
	/**
	 * (non-PHPdoc)
	 * @see OpenidInterface::parseToken()
	 */
	function parseToken($token)
	{
		$ret = array();
		$info = $this->getUserInfo($token['access_token']);
		$ret['bind_site_user_id'] = $info['id'];
		$ret['bind_info'] = array(
			'nickname' 	=> $info['screen_name'],
			'domain'	=> $info['domain'],
			'token' 	=> $token['access_token'],
		);
		$ret['avatar'] = $info['profile_image_url'];
		$ret['sex'] = $info['gender'] == 'm' ? 1 : 2;
		return $ret;
	}
	
	/**
	 * (non-PHPdoc)
	 * @see OpenidInterface::getUserInfo()
	 */
	function getUserInfo($token)
	{
		require_once EXLIB_ROOT.'/sina/saetv2.ex.class.php';
		$c = new SaeTClientV2( $this->conf['app_key'] , $this->conf['app_secret'] , $token );
		$uid = $c->get_uid();
		$uid = $uid['uid'];
		$ret['bind_site_user_id'] = $uid;
		$info = $c->show_user_by_id($uid);
		return $info;
	}
}