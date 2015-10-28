create database ts_user;
use ts_user;

CREATE TABLE `u_user` (
  `user_id` int(10) unsigned NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` char(32) NOT NULL,
  `nickname` varchar(20) NOT NULL,
  `avatar_id` bigint(20) NOT NULL DEFAULT '0',
  `create_time` int(10) unsigned NOT NULL,
  `update_time` int(10) unsigned NOT NULL,
  `user_status` tinyint(4) NOT NULL DEFAULT '0',
  `last_login_time` int(10) unsigned NOT NULL,
  `last_login_ip` bigint unsigned NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `u_bind` (
  `user_id` int(10) unsigned NOT NULL,
  `bind_site_id` tinyint(3) unsigned NOT NULL,
  `bind_site_user_id` bigint unsigned NOT NULL,
  `bind_info` varchar(256) NOT NULL,
  `bind_status` tinyint NOT NULL default 1,
  `create_time` int(10) unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`bind_site_id`),
  UNIQUE KEY `bind_site_user_id` (`bind_site_user_id`, `bind_site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert ignore into `ts_common`.`c_guid` values('user_id', 10000);