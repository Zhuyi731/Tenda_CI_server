/*
Navicat MySQL Data Transfer

Source Server         : C
Source Server Version : 50722
Source Host           : localhost:3306
Source Database       : ciserver

Target Server Type    : MYSQL
Target Server Version : 50722
File Encoding         : 65001

Date: 2018-06-11 15:56:52
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
  `compileOrder` varchar(255) DEFAULT NULL,
  `localDist` varchar(255) DEFAULT NULL,
  `dist` varchar(255) DEFAULT NULL,
  `schedule` varchar(255) DEFAULT NULL,
  `interval` int(11) NOT NULL DEFAULT '24',
  `testCase` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'closed',
  `remarks` varchar(255) DEFAULT '',
  PRIMARY KEY (`product`),
  UNIQUE KEY `products` (`product`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of product
-- ----------------------------
INSERT INTO `product` VALUES ('11AC-ecos', '微企', '1', '1523227200000', null, 'none', 'http://192.168.100.233:18080/svn/ECOSV2.0_11AC/SourceCodes/Trunk/RTK_819X/userSpace/prod/http/web/AC5_cn_normal_src', null, '', '', '', '2', null, 'running', '');
INSERT INTO `product` VALUES ('11AC2', 'AP', '0', '1523227200000', null, 'none', 'http://192.168.100.233:18080/svn/ECOSV2.0_11AC/SourceCodes/Trunk/RTK_819X/userSpace/prod/http/web/AC5_cn_normal_src', 'null', 'null', 'null', 'preDev', '2', null, 'running', '');
INSERT INTO `product` VALUES ('asd', '微企', '0', '1528128000000', null, 'none', 'http://192.168.100.233:18080/svn/ECOSV2.0_11AC/SourceCodes/Trunk/RTK_819X/userSpace/prod/http/web/AC5_cn_normal_src', null, '', '', 'set', '1', null, 'running', '');
INSERT INTO `product` VALUES ('MR9', '微企', '0', null, null, 'none', 'http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/EWRT/src-new/src', null, null, null, null, '1', null, 'running', '');

-- ----------------------------
-- Table structure for productcopyto
-- ----------------------------
DROP TABLE IF EXISTS `productcopyto`;
CREATE TABLE `productcopyto` (
  `product` varchar(255) NOT NULL,
  `copyTo` varchar(20) DEFAULT NULL,
  KEY `productcopyTo` (`product`),
  CONSTRAINT `productcopyTo` FOREIGN KEY (`product`) REFERENCES `product` (`product`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of productcopyto
-- ----------------------------
INSERT INTO `productcopyto` VALUES ('11AC-ecos', 'zhuyi');

-- ----------------------------
-- Table structure for productmember
-- ----------------------------
DROP TABLE IF EXISTS `productmember`;
CREATE TABLE `productmember` (
  `product` varchar(255) NOT NULL,
  `member` varchar(20) DEFAULT NULL,
  KEY `productmember` (`product`),
  CONSTRAINT `productmember` FOREIGN KEY (`product`) REFERENCES `product` (`product`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of productmember
-- ----------------------------
INSERT INTO `productmember` VALUES ('11AC2', 'zhuyi');
INSERT INTO `productmember` VALUES ('11AC-ecos', 'zhuyi');
INSERT INTO `productmember` VALUES ('MR9', 'zhuyi');

-- ----------------------------
-- Table structure for systemlog
-- ----------------------------
DROP TABLE IF EXISTS `systemlog`;
CREATE TABLE `systemlog` (
  `No` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `event` varchar(255) DEFAULT NULL,
  `messages` varchar(255) DEFAULT NULL,
  `time` datetime DEFAULT CURRENT_TIMESTAMP,
  `user` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`No`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of systemlog
-- ----------------------------

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1', 'zhuyi', '朱义', '1');
INSERT INTO `users` VALUES ('2', 'pengjuanli', '彭娟莉', '1');
INSERT INTO `users` VALUES ('3', 'zhouan', '周安', '1');
INSERT INTO `users` VALUES ('4', 'xiechang', '谢昌', '1');
INSERT INTO `users` VALUES ('5', 'liushuanghuan', '刘双欢', '1');
INSERT INTO `users` VALUES ('6', 'zoumengli', '邹梦丽', '1');
INSERT INTO `users` VALUES ('7', 'tianzehao', '田泽浩', '1');
