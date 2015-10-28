<?php

Conf::set('hapn.debug', 'manual');
//记录代码覆盖率日志
//日志文件位置在tmp/cov下
Conf::set('hapn.logcov', false);//
Conf::set('hapn.log.file','tiaoshei');
Conf::set('hapn.log.level',16);
Conf::set('hapn.log.request', 'request.log');
Conf::set('hapn.view','ZendView');
Conf::set('hapn.encodeinput',true);

Conf::set('hapn.cookie', array(
	'user' => array(
//		'host' => 'localhost',
		'host' => 'www.tiaoshei.com',
		'key' => 'tsu',
		'expire' => 24 * 3600 * 30,
	),
	'sessionId' => array(
//		'host' => 'localhost',
		'host' => 'www.tiaoshei.com',
		'key' => 'tid',
		'expire' => 24 * 3600 * 365,
	)
));

Conf::set('hapn.error.redirect', array(
	'hapn.error'=>'/util/err/error',
	'hapn.u_notfound'=>'/util/err/notfound',
	'hapn.u_login'=>'/account/login?u=[url]',
	'hapn.u_power'=>'/util/err/power'
));
Conf::set('hapn.error.retrycode', '/\.net_/');
Conf::set('hapn.error.retrymax', 2);
Conf::set('hapn.error.userreg', '/\.u_/');

//实际单元测试时不应该加载此配置
//* 
//Conf::set('hapn.filter.init',array(/*'DumpLogFilter'*/));
Conf::set('hapn.filter.input',array('TsFilter'/*,'CSRFFilter'*/));
//Conf::set('hapn.filter.clean',array());
//*/

Conf::set('hapn.encoding','UTF-8');
//Conf::set('hapn.ie','GBK');
//Conf::set('hapn.oe','GBK');
//


Conf::set('db.conf',array(
	'text_db'=>'ts_text',
    'text_table'=>'t_text',
    'text_compress_len'=>1,
    'max_text_len'=>65535,
	//1是取模分表
    'splits'=>array('t_text'=>array('text_id',array(1=>10))),
    'log_func'=>'Logger::trace',
    'test_mode'=>0,
	'guid_db'=>'ts_common',
	'guid_table'=>'c_guid',
	'db_pool'=>array(
		'ip1'=>array('ip'=>'127.0.0.1','user'=>'HapN','pass'=>'HapN','port'=>3306,'charset'=>'utf8'),
	),
	'dbs'=>array(
		'ts_common' => 'ip1',
		'ts_text' => 'ip1',
		'ts_tiao' => 'ip1',
		'ts_user' => 'ip1',
		'ts_site' => 'ip1',
	)
));
Conf::set('db.readonly', false);

Conf::set('apiproxy.intercepters',array(
//	'UserActionIntercepter',
	));

//默认curl的配置
Conf::set('curl.options',array(
		//seconds
		CURLOPT_TIMEOUT =>30,
		CURLOPT_CONNECTTIMEOUT=>10,
		CURLOPT_USERAGENT => 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:14.0) Gecko/20100101 Firefox/14.0.1',
		CURLOPT_COOKIEJAR => TMP_ROOT.'/cookie/curl.cookie',
		CURLOPT_COOKIEFILE => TMP_ROOT.'/cookie/curl.cookie',
		CURLOPT_SSL_VERIFYPEER => false,
		CURLOPT_SSL_VERIFYHOST => false,
));

Conf::set('hapn.com', array(
	'image' => array(
		'savedir' => '/storage/tiaoshei/',
		'quality' => 96,
		'rules' => array(
			'origin' => array(
				'width' => 2000,
				'height' => null,
				'type' => 'thumb',
			),
			'size400' => array(
				'width' => 400,
				'height' => 400,
				'type' => 'fill',
			),
			'size270' => array(
				'width' => 270,
				'height' => 270,
				'type' => 'fill',
			),
			'size100' => array(
				'width' => 100,
				'height' => 100,
				'type' => 'crop',
			),
			'size60' => array(
				'width' => 60,
				'height' => 60,
				'type' => 'crop',
			),
			'size50' => array(
				'width' => 50,
				'height' => 50,
				'type' => 'crop',
			),
		)
	),
	'cache' => array(
		'servers'=>array(
				'127.0.0.1:11211'
		),
		'connect_timeout'=>10, //s
		'rw_timeout'=>50000, //ms
		'retry'=>3, //3次连接重试
		'zip_threshold'=>1024 //>1024bytes启用压缩
	),
));

Conf::set('hapn.host', array(
	'site' => 'www.tiaoshei.com',
	'cdn' => 'c.tiaoshei.com',
	'static' => 's.tiaoshei.com',
));
