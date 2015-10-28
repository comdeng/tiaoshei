create database if not exists `ts_site` default charset utf8;
use `ts_site`;
CREATE TABLE `s_site` (
  `site_id` mediumint unsigned NOT NULL,
  `site_name` varchar(10) NOT NULL,
  `site_sname` varchar(5) NOT NULL,
  `site_ename` varchar(10) NOT NULL,
  `site_host` varchar(50) NOT NULL,
  `site_status` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`site_id`),
  UNIQUE KEY `site_host`(`site_host`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `s_line` (
  `line_id` mediumint unsigned NOT NULL,
  `site_id` mediumint unsigned NOT NULL,
  `line_name` varchar(10) NOT NULL,
  `item_host` varchar(50) NOT NULL,
  `item_regex` varchar(200) NOT NULL,
  `item_url` varchar(200) NOT NULL,
  `meta_selector` varchar(50) NOT NULL,
  `title_selector` varchar(50) NOT NULL,
  `price_selector` varchar(50) NOT NULL,
  `image_regex` varchar(200) NOT NULL,
  `line_status` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`line_id`),
  UNIQUE KEY `item_host`(`item_host`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert ignore into `ts_common`.`c_guid` values('site_id', 1000);
insert ignore into `ts_common`.`c_guid` values('line_id', 1000);
