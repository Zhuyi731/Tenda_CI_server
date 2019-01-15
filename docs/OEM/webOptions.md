
# webOptions
webOptions位于pageRule配置下，用于配置页面如何显示  
由于配置项较多，单独列出一个文档  

## pageRule.webOptions  

>该配置项用于设置配置项在WEB界面的展示

| prop                    | type                                     | detail                                                                   |
| :---------------------- | :--------------------------------------- | :----------------------------------------------------------------------- |
| webOptions.type         | "input","select","colorPicker","img"之一 | 必填，配置项的展示方式  [详细说明](#webOptions.type)                     |
| webOptions.title        | String                                   | 必填，配置项左边的标题(label)  [详细说明](#webOptions.title)             |
| webOptions.detail       | String                                   | 必填，悬浮至配置项右边?后，显示的详细说明 [详细说明](#webOptions.detail) |
| webOptions.defaultValue | String\|Array                            | 必填，修改项的默认值 [详细说明](#webOptions.defaultValue)                |

**除了这四项必填之外，根据type的不同还需要配置其余选项**
**type:**
**input**(输入框) [查看选项](#type.input)
**select**(下拉框) [查看选项](#type.select)
**colorPicker**(拾色器) [查看选项](#type.colorPicker)
**img**(图片选择器) [查看选项](#type.img)


## webOptions.title

> 配置项的左边的标题

```js
webOptions:{
     //@type:String
    title:"登陆页标题"
}
```

如图: 
![](../imgs/OEM/title.png)  

## webOptions.detail

> 鼠标悬浮至问号上时，会在右侧出现提示信息。主要用于提示用户详细的内容。  

```js
webOptions:{
    //@type:String
    detail:"当使用电脑访问设备时，在登陆页浏览器头部标签显示的文字"
}
```
如图:  
![](../imgs/OEM/detail.png) 

## webOptions.defaultValue

> 作用有两点:
> 1.当用户没有进行配置时，页面会显示一个默认值。    
> 2.当用户点击回复默认按钮时，表单的值会恢复至默认值    
> 当type为img时,不需要填写此值

**注意:**
当type为select并且配置multiple为true时，defaultValue应当为数组。  
其余情况为字符串

```js
webOptions:{
    //@type String or Array
    defaultValue:"Tenda"
}
```

# webOptions.type
**根据type的不同需要配置其余选项**
**type:**
**input**(输入框) [查看选项](#type.input)
**select**(下拉框) [查看选项](#type.select)
**colorPicker**(拾色器) [查看选项](#type.colorPicker)
**img**(图片选择器) [查看选项](#type.img)


## type.input

> 当webOptions.type === "input" 时可以配置下列选项  

| prop                   | type   | detail                    |
| :--------------------- | :----- | :------------------------ |
| webOptions.placeholder | String | 选填，输入框的placeholder |

e.g:
```js
webOptions:{
    type:"input",
    title:"登陆页标题",
    detail:"xxx",
    defaultValue:"xxx",
    placeholder:"这是一个placeholder"  //选填
}
```  

效果:
![](../imgs/OEM/placeholder.png)  


## type.select  

> 当webOptions.type === "select" 时可以配置下列选项  

| prop                   | type    | detail                              |
| :--------------------- | :------ | :---------------------------------- |
| webOptions.selectArray | Object  | 必填，下拉框选项                    |
| webOptions.multiple    | Boolean | 选填，下拉框是否为多选。默认：false |
| webOptions.placeholder | String  | 选填，下拉框的placeholder           |

**注意**
当webOptions.multiple设置为true时，webOptions.defaultValue应该为数组形式 
并且用户选择时会有顺序关系，例如先选第三个选项，再选第一个选项，则传过来的值为 ["value3","value1"]

e.g:
```js
webOptions:{
    type:"select",
    title:"按顺序选择需要的语言项",
    detail:"xxx",
    multiple:true,
    selectArray:{
        cn:"中文",
        en:"英文",
        ru:"俄文",
        tr:"土耳其语"
    },
    defaultValue:["en","cn","ru","tr"]
}
```  

效果:
![](../imgs/OEM/selectMultiple.png)  

当multiple为false时，defaultValue应当为字符串
```js
webOptions:{
    type:"select",
    title:"快速设置页标题",
    detail:"xxx",
    multiple:false,
    selectArray:{
        value1:"选项1",
        value2:"选项2",
        value3:"选项3"
    },
    defaultValue:"value1"
}
```  

效果：  
![](../imgs/OEM/selectArray.png) 

## type.colorPicker  
| prop                  | type    | detail                                   |
| :-------------------- | :------ | :--------------------------------------- |
| webOptions.show-alpha | Boolean | 选填，是否显示alpha通道选项，默认：false |

**注意**
当webOptions.show-alpha设置为false时，接收到的值和defaultValue为Hex格式。如:#ed7020  
当webOptions.show-alpha设置为true时，接收到的值和defaultValue为RGBA格式。如:rgba(255,255,255,0.8)  

e.g:
```js
webOptions:{
    type: "colorPicker",
    title: "主题色",
    detail: "xxx",
    "show-alpha":false,
    defaultValue: "#ed7020"
}
```  

效果:  
![](../imgs/OEM/color.png)

e.g:
```js
webOptions:{
    type: "colorPicker",
    title: "主题色",
    detail: "xxx",
    "show-alpha":true,
    defaultValue: "rgba(255,0,0,0.8)"
}
```  

效果:  
![](../imgs/OEM/colorAlpha.png)

