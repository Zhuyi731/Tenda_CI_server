#CI集成部分接口

##新建项目

###选择产品线页面
- 接口   

	/api/CI/getProLine  

- 说明 
  请求当前所有产品线  
 
- 示例:

	{  
		proLines:["AP","商用","PLC"]  
	}

-------

- 接口  
	
	/api/CI/setNewPro  

- 说明   
  创建新的项目  

- 示例:
	
	{
	 product: "",        //项目名称
     proLine: [],
     proValue:"",       //项目value
     proSrc: "",        //源路径
     proDist: ""        //目标路径
	}

- 接口
	
	/api/CI/getAllProducts

- 说明  
	获取所有产品信息

- 示例

	{
	"products": [{  
    "productLine": "AP",  //产品线
    "product": "O2V2.0",  //产品名
    "members": [{  
      "name": "邹梦丽",  
      "mail": "zoumengli"  
    }, {  
      "name": "彭娟莉",  
      "mail": "pengjuanli"  
    }, {  
      "name": "周安",  
      "mail": "zhouan"  
    }],  
    "copyTo":[ {  
      "name": "周安",  
      "mail": "zhouan"  
    }],  
    "schedule": "tr1",  
    "status": "running",  
    "compiler": "webpack",  
    "src": "./!Documents/12",  
    "localDist": "./dist",  
    "dist": "/123//321",  
    "startTime": "2018-8-12",  
    "interval": "3",  
    "remarks": "asdasdsadasdsadsadasdasdasdddddddddddddddddddddddddddddddddddddddddddddd"  
  }


- 接口
 /api/CI/getTranslateCheck

-说明  
 获取所有产品的翻译检查信息

-示例
		
	{
	  	"productLines": [{
	      "name": "AP",
	      "products": [{
	        "product": "O3V1.0",
			"isMultiLang":"true",
	        "hasExcel": "true",
	        "localJsonPath": "./common/lang"
	      },{
	          "product":"02V1.0",
			  "isMultiLang":"false",
	          "hasExcel":"false",
	          "localJsonPath":""
	      }]
	  },{
	      "name":"微企",
	      "products":[
	          {
	              "product":"MR9",
	              "hasExcel":"true",
	              "localJsonPath":"./common/lang"
	          }
	      ]
	  }]
}