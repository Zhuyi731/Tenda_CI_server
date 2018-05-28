#CI集成部分接口

##新建项目

###选择产品线页面
@接口  
/api/CI/getProLine  
@说明 请求当前所有产品线
示例:
{
	proLines:["AP","商用","PLC"]
}


@接口  
/api/CI/setNewPro  
@说明 创建新的项目
示例:
{
	 product: "",        //项目名称
     proLine: [],
     proValue:"",       //项目value
     isOld: false,      //是否为老代码
     proSrc: "",        //源路径
     proDist: ""        //目标路径
}