/*
Navicat MySQL Data Transfer

Source Server         : C
Source Server Version : 50722
Source Host           : localhost:3306
Source Database       : ciserver

Target Server Type    : MYSQL
Target Server Version : 50722
File Encoding         : 65001

Date: 2018-06-05 11:05:35
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for product
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `product` varchar(255) NOT NULL,
  `productLine` varchar(255) NOT NULL,
  `isOld` tinyint(1) NOT NULL DEFAULT '0',
  `startTime` bigint(50) DEFAULT NULL COMMENT '时间戳  14位',
  `localPath` varchar(255) DEFAULT NULL,
  `compiler` varchar(10) NOT NULL DEFAULT 'none',
  `src` varchar(255) NOT NULL,
  `localDist` varchar(255) DEFAULT NULL,
  `dist` varchar(255) DEFAULT NULL,
  `schedule` varchar(255) DEFAULT NULL,
  `interval` int(11) NOT NULL DEFAULT '0',
  `testCase` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'closed',
  `remarks` varchar(255) DEFAULT '',
  PRIMARY KEY (`product`),
  UNIQUE KEY `products` (`product`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for productcopyto
-- ----------------------------
DROP TABLE IF EXISTS `productcopyto`;
CREATE TABLE `productcopyto` (
  `product` varchar(255) NOT NULL,
  `copyTo` varchar(20) DEFAULT NULL,
  KEY `productCopyTo` (`product`),
  CONSTRAINT `productCopyTo` FOREIGN KEY (`product`) REFERENCES `product` (`product`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for productmember
-- ----------------------------
DROP TABLE IF EXISTS `productmember`;
CREATE TABLE `productmember` (
  `product` varchar(255) NOT NULL,
  `member` varchar(20) DEFAULT NULL,
  KEY `productMember` (`product`),
  CONSTRAINT `productMember` FOREIGN KEY (`product`) REFERENCES `product` (`product`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for systemlog
-- ----------------------------
DROP TABLE IF EXISTS `systemlog`;
CREATE TABLE `systemlog` (
  `No` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `event` varchar(255) DEFAULT NULL,
  `messages` varchar(255) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`No`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `number` int(10) NOT NULL AUTO_INCREMENT,
  `mail` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL,
  `auth` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`number`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
