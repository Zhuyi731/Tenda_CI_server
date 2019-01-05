# 环境安装 #

为了统一OEM开发环境，您需要安装整个CI服务器来进行OEM的本地开发。

## 安装CI服务器 ##

### 前置软件安装:  ###
1. Git Bash  [下载链接](https://git-scm.com/downloads)  
2. Mysql Server  [下载链接](https://dev.mysql.com/downloads/windows/installer/)     选择Windows (x86, 32-bit), MSI Installer  300M左右的那个   
3. Navicat mysql  [下载链接](http://www.navicat.com.cn/products/navicat-for-mysql)   

### Mysql server安装注意事项:   ###
1.安装时，请选择自定义(custom)安装。然后选择只安装mysql server 和 mysql workbench  
2.安装时, 在数据库配置时，密码配置为Fireitup。其余一律点默认    
3.安装后，可能出现各种异常BUG，请自行百度解决。  


### Navicat Mysql安装注意事项:   ###
从下载链接下载的为正版Navicat。试用期14天。如果需要永久的。你懂得~  


## 创建数据库 ##
打开Navicat软件  
1. 点击文件->新建链接->Mysql
![](./imgs/OEM/createDB.png)  

2. 填入连接名 ci  密码 Fireitup  然后点击创建
![](./imgs/OEM/newConnection.png)  

3. 下面会出现CI的连接 右键CI，选择新建数据库。  
数据库名填入ciserver。字符集 选择UTF-8
![](./imgs/OEM/newDB.png)  

4.完成以上步骤后，数据库创建完成


## 开启CI服务器 ##
进入CI服务器根路径,输入指令

>  npm run init  

服务器会自动帮你安装好依赖然后编译web目录  

然后找到server>http_server>server.js  找到第5行  global.debug定义部分   
将global.debug.oemProduct设置为true ，开启本地调试OEM模式

然后运行npm run server即可本地开启服务器   

开启服务器后，浏览器输入localhost即可进入服务器页面  

## 通过VS Code开启服务器 ## 
通过VSCode打开服务器文件夹  
找到  server>http_server>server.js  
进入server.js文件，将global.debug.oemProduct设置为true  
然后F5即可开启服务器


开启服务器后，浏览器输入localhost即可进入服务器页面  