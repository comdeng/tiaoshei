create database if not exists `ts_tiao` default charset utf8;
use `ts_tiao`;

CREATE TABLE `t_tiao` (
  `tiao_id` int(10) unsigned NOT NULL,
  `tiao_name` varchar(100) NOT NULL,
  `tiao_desc` varchar(255) NOT NULL,
  `expire_time` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `create_time` int(10) unsigned NOT NULL,
  `update_time` int(10) unsigned NOT NULL,
  `tiao_status` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`tiao_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_product` (
  `product_id` int(10) unsigned NOT NULL,
  `tiao_id` int(10) unsigned NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `product_url` varchar(200) NOT NULL,
  `site_id` smallint(5) unsigned NOT NULL,
  `line_id` mediumint(8) unsigned NOT NULL,
  `product_img_id` bigint(20) NOT NULL DEFAULT '0',
  `product_price` int(10) unsigned NOT NULL DEFAULT '0',
  `user_id` int(10) unsigned NOT NULL,
  `create_time` int(10) unsigned NOT NULL,
  `update_time` int(10) unsigned NOT NULL,
  `yes_num` smallint unsigned NOT NULL default 0,
  `no_num` smallint unsigned NOT NULL default 0,
  `product_status` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_choose` (
  `product_id` int(10) unsigned NOT NULL,
  `choose_type` tinyint(3) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `choose_remark` varchar(255) DEFAULT NULL,
  `create_time` int(10) unsigned NOT NULL,
  `update_time` int(10) unsigned NOT NULL,
  `choose_status` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`product_id`,`user_id`,`choose_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


insert ignore into `ts_common`.`c_guid` values('tiao_id', 10000),('product_id', 10000),('choose_id', 10000);
