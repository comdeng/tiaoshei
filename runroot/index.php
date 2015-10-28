<?php
define('_ROOT', dirname(dirname(__FILE__)));
define('FR_ROOT',_ROOT.'/HapN/');
define('RUN_ROOT',_ROOT.'/runroot/');
define('LIB_ROOT',_ROOT.'/lib/');
define('PLUGIN_ROOT',_ROOT.'/versions/plugin/');
define('LOG_ROOT',_ROOT.'/log/');
define('CONF_ROOT',_ROOT.'/versions/conf/');
define('TMP_ROOT',_ROOT.'/tmp/');
define('EXLIB_ROOT',_ROOT.'/versions/exlib/');
define('PAGE_ROOT',_ROOT.'/versions/page/');
define('APP_ROOT',_ROOT.'/versions/app/');

define('runmode','web');

require_once FR_ROOT.'BaseApp.php';
require_once FR_ROOT.'WebApp.php';
$obj = new WebApp();
$obj->run();
