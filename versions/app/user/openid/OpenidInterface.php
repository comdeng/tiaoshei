<?php
interface OpenidInterface
{
	/**
	 * 获取用来验证登录的地址
	 * @return string
	 */
	function getAuthorizeURL();	
	
	
	/**
	 * 获取口令
	 * @param string $code
	 */
	function getToken($code);
	
	/**
	 * 解析用户信息
	 * @param array $token
	 */
	function parseToken($token);
	
}