# OEM规则模板  
将一些常用的替换规则写成模板，仅供参考，具体规则请酌情参考项目实际情况。 

# 模板导航 

- 替换颜色 \(文字颜色，背景颜色\)  [Color](#color)
- 替换

## color 
标签: 
```css
.menu {
    color:#000;
    /*main-bg-color*/
    background-color:#ed7020;
    /*main-bg-color*/
}

.font{
    size:16px;
    /*main-color*/
    color:#ed7020
    /*main-color*/
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
            tag:"main-bg-color",
            where:["./css/reasy-ui.css","./css/login.css","./css/quickset.css",
            "./phone/css/login.css"],
            how:(match,userInput)=>{
                //match =  background-color:#ed7020;
                //用()来匹配捕获组，用.*?来进行非贪婪匹配！！！
                return match.replace(/background-color:(.*?);?/,`background-color:${userInput}`);
            }
        },{//用于替换字体色  
            tag:"main-color" ，
            where:["./css/reasy-ui.css"],
            how:(match,userInput)=>{
                //match =  color:#ed7020;
                //用()来匹配捕获组，用.*?来进行非贪婪匹配！！！
                return match.replace(/color:(.*?);?/,`color:${userInput}`);
        }]
    }

``` 

## html中的超链接  
