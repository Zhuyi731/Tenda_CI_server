
# pageRule.rules  
@type:Array   
pageRule.rules是包含一个或多个rule的**数组**。数组中的每个rule则指明如何替换代码  

更多示例请[点击这里](./OEM规则模板.md)


**注意事项**  
pageRule.rules中的所有rule都共用一个用户输入，请保证这些规则需要用到的输入是一致的  

每个rule都是一个对象,包含如下属性:  

| prop       | type            | detail                                         |
| :--------- | :-------------- | :--------------------------------------------- |
| rule.tag   | String          | 必填，指明注释标记的内容 [详细说明](#tag)      |
| rule.where | Array\<String\> | 必填，指明去哪些文件中替换  [详细说明](#where) |
| rule.how   | Function        | 必填，输入框的placeholder   [详细说明](#how)   |

## tag 
@type:String 指明用于标记的tag  

在html中标记用```<!--tagName-->```注释来做标记  
在css和js中用```/*tagName*/```做标记  

rule.tag不需要携带注释  

e.g：
你的标记为 ```<!--main-color-->```   
则rule.tag配置为```"main-color"```。 

**建议直接在需要修改的地方做标记，不要包含冗余的代码。**

正确示范: 
```css
.menu{
    color:#FFF;
    /*main-color*/
    background-color:#ed7020
    /*main-color*/
}
```
~~错误示范~~
```css
/*main-color*/
.menu{
    color:#FFF;
    background-color:#ed7020
}
/*main-color*/

.menu{   
    /*main-color*/
    color:#FFF;
    background-color:#ed7020
    /*main-color*/
}

```

## where  
@type:Array\<String\>  

该配置项指明需要去哪些文件中替换。  
每个where配置项都是一个相对路径(相对于oem.config.js，也是相对于项目根目录)    

例：
项目目录结构如下
```
js
 |-xxx.js
 |-xxx.css
css
 |-reasy-ui.css
 |-login
 |   |-login.css
oem.config.js

``` 
js、css、oem.config.js同一层级  
如果要去替换reasy-ui.css和login.css中的某个tag。  
则配置rule.tag如下 
```js
rules:[{
    tag:"main-color",
    where:["./css/reasy-ui.css","./css/login/login.css]
}]
```
**注意**   
多个where直接共享how方法，请保证这些where文件中的替换规则是一致的。  

## how  
@type Function  
@params (match,userInput) 函数接收两个参数   
**match**： 两个标记之间的内容  即上面例子中的background:xxx;  
**userInput**： 用户输入的值   
@return 返回修改后的值  

e.g:
```js 
  return match.replace(/background-color:(.*?);/,`background-color:${userInput}`);
```

**注意**  
1.需要考虑用户多次上传配置的情况。  
例如：  
用户第一次修改背景色为#000,第二次又修改其为#FFF   

2.考虑用户输入乱码或者特殊的重复字段  
例如：    
用户输入 backgroud:xxx;    
第一次替换之后，会变成 backgroud:backgroud:xxx;    
此时代码就出错了。    
这种情况尽量在validator中去验证    

