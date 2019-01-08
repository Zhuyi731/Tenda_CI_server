# OEM规则模板  
将一些常用的替换规则写成模板，仅供参考，具体规则请酌情参考项目实际情况。 

# 模板导航 

- 替换颜色 \(文字颜色，背景颜色\)  [Color](#color)
- 替换超链接 

## color 
标签: 
```css
.menu {
    color:#000;
    /*oem-main-bg-color*/
    background-color:#ed7020;
    /*oem-main-bg-color*/
}

.font{
    size:16px;
    /*oem-main-color*/
    color:#ed7020
    /*oem-main-color*/
}
```

oem.config.js

```js
    {
        title:"主题色",
        detail:"页面的整体风格",
        webOptions:{
            type:"colorPicker",
            "alow-alph":false//如果为true  则颜色格式变为rgba()
        },
        validator(userInput){
            if(/(backgroud|color|:)/.test(userInput)){
                //实际上colorPicker不会出现这种文字，只是做个示例
                return "该项不能包含background或color或者:冒号";
            }
        },
        //多个rule共享一个用户输入
        rules:[{//用于替换背景色
            tag:"oem-main-bg-color",
            where:["./css/reasy-ui.css","./css/login.css","./css/quickset.css",
            "./phone/css/login.css"],
            how:(match,userInput)=>{
                //match =  background-color:#ed7020;
                //用()来匹配捕获组，用.*?来进行非贪婪匹配！！！
                return match.replace(/background-color:(.*?);?/,`background-color:${userInput}`);
            }
        },{//用于替换字体色  
            tag:"oem-main-color" ，
            where:["./css/reasy-ui.css"],
            how:(match,userInput)=>{
                //match =  color:#ed7020;
                //用()来匹配捕获组，用.*?来进行非贪婪匹配！！！
                return match.replace(/color:(.*?);?/,`color:${userInput}`);
        }]
    }

``` 

## html中的超链接  

index.html

```html
<div class="href">
    <!--oem-href-->
    <a href="http://www.tenda.com.cn">Tenda官网</a>
     <!--oem-href-->
</div>
```
oem.config.js
```js
 {
        title:"官网链接",
        detail:"xxxxx",
        webOptions:{
            type:"input"//其实也可以不填，默认就是input
        },
        validator(userInput){
            if(!/^https?:\/\//){
                return `必须以http://或者https://开头`;
            }
            if(/(href=)/.test(userInput)){
                return `该项不能包含"href="`;
            }
        },
        //多个rule共享一个用户输入
        rules:[{//用于替换背景色
            tag:"oem-href",
            where:["index.html"],
            how:(match,userInput)=>{
                //match =  background-color:#ed7020;
                //用()来匹配捕获组，用.*?来进行非贪婪匹配！！！
                return match.replace(/href="(.*?)"/,`href="${userInput}"`);
            }
        }]
    }

```
