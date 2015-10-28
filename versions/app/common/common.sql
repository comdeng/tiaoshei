create database if not exists `ts_common` default charset utf8;
use `ts_common`;
CREATE TABLE `c_guid` (
  `guid_name` varchar(32) NOT NULL,
  `guid_value` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`guid_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create database if not exists `ts_text` default charset utf8;
use `ts_text`;
CREATE TABLE `t_text0` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_text1` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_text2` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_text3` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_text4` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_text5` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_text6` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_text7` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_text8` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_text9` (
  `text_id` bigint(20) unsigned NOT NULL,
  `text_content` blob,
  `text_zip_flag` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`text_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
