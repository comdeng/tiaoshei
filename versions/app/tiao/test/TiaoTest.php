<?php
require_once dirname(__FILE__).'/../logic/TiaoImpl.php';
require_once '/home/ronnie/eclipse/workspace/HapN/lib/libutil/LibUtil.php';
$info = TiaoImpl::parseUrl('http://item.taobao.com/item.htm?spm=a2106.m874.1000384.d11.a5af99&id=15744392974&scm=1029.0.1.1');
var_dump($info);