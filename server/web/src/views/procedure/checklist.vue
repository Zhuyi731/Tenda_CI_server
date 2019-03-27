<template>
  <el-tabs type="border-card">
    <el-tab-pane label="新增">
      <newChecklist :name="name" :members="members" :checklistData = "checklistData"></newChecklist>
    </el-tab-pane>
    <el-tab-pane label="未办理">
      <handleChecklist v-bind:status="status[0]" :checklistData = "checklistData"></handleChecklist>
    </el-tab-pane>
    <el-tab-pane label="已办理">
      <handleChecklist v-bind:status="status[1]" :checklistData = "checklistData"></handleChecklist>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import NewChecklist from "./NewChecklist.vue";
import HandleChecklist from "./handleChecklist.vue";
export default {
  data() {
    return {
      status: ["pending", "ending"],
      name : "",
      members:[],
      checklistData: [
        {
          checklist: "需求包检查",
          checklistDetail: "需求包、原型&设计稿、软件规格满足开发",
          step:
            "1、检查需求包与原型，需要通过界面配置的功能是否一一映射 \n2、检查设计稿能满足界面的设计\n3、检查软件规格，至少包含兼容性规格、各项配置的限制条件",
          Result:
            "1、需求包与原型中需通过界面配置的功能一致\n2、设计稿能满足界面设计\n3、软件规格提供且规格内容合理",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "界面设计",
          checklistDetail: "视觉设计",
          step:
            "根据设计稿及指定的分辨率，依次检视在各待兼容浏览器中，界面表现一致1、进入DUT，对比软件界面整体及细节的布局（如边距、长&宽）、排版（如对齐方式）、图片、字体、颜色是否与设计图一致",
          Result: "布局、排版、图片、颜色、字体与设计稿一致",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "界面设计",
          checklistDetail: "交互细节",
          step:
            "检查界面中的交互细节与设计一致1、进入DUT，检查按钮、图片、表格、错误提示、弹出框的交互设计与设计一致",
          Result: "按钮、图片、表格、错误提示、弹出框的交互细节与设计一致",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "界面语言",
          checklistDetail: "界面文字与原型一致性",
          step: "对照原型，检查软件界面文字及功能的排列与原型一致",
          Result: "与原型保持一致",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "界面语言",
          checklistDetail: "无翻译错误",
          step: "进入配置界面，检查多语言选项位置",
          Result: "语言选框在界面上的位置与需求一致",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "界面语言",
          checklistDetail: "无翻译错误",
          step: "进入配置界面，点击查看语言选项列表，并切换语言选项",
          Result:
            "下拉选项中包含了所有需要实现的语言项，切换后的界面文字显示内容与切换前有明显的区别",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "界面语言",
          checklistDetail: "各语言下文字显示不影响排版",
          step:
            "检查文字是否显示不全,进入配置界面，切换不同语言选项，检查各语言项下输入框中的默认文字显示是否完整",
          Result: "各语言选项下，输入框中的默认文字显示完整",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "界面语言",
          checklistDetail: "各语言下文字显示不影响排版",
          step:
            "检查文字是否显示过长,进入配置界面，切换语言选项，检查各语言选项下文字显示是否重叠、换行.",
          Result: "各语言选项下，所有文字显示无重叠、需要一行显示的内容未换行",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist:
            "业务逻辑 1、必须先熟悉业务知识，考虑可能存在的场景。2、必须在实际设备中测试 3、单个功能项至少测试2种以上的场景，并考虑对关联功能的影响",
          checklistDetail: "业务逻辑及场景与需求一致",
          step:"进入DUT，将设备恢复出厂设置。以单项功能为颗粒度，检查业务逻辑与原型上的逻辑一致性。单个功能至少测试2种以上的场景，是否存在问题如SSID扫描功能：成功，扫描中、扫描失败3种场景。Wifi开关功能：WIFI开启、关闭场景",
          Result: "与原型一致，符合需求",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist:
            "业务逻辑 1、必须先熟悉业务知识，考虑可能存在的场景。 2、必须在实际设备中测试 3、单个功能项至少测试2种以上的场景，并考虑对关联功能的影响",
          checklistDetail: "软件界面规格与软件规格一致",
          step:"进入DUT，将设备恢复出厂设置。检查各项功能规格与软件规格一致性，且至少测试2种以上的场景。如添加MAC过滤（最多添加16条）：测试添加0条，1条，17条的场景。如SSID设置：测试输入为空，特殊字符，超长字符的场景",
          Result: "与软件规格一致，且多种场景测试通过",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "自动化测试",
          checklistDetail: "1、代码文件中无中文",
          step: "打开b28n.exe，选择提取>仅中文。查看导出的结果中是否包含中文",
          Result: "导出的excell表中没有需要翻译的中文",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "自动化测试",
          checklistDetail: "2、代码文件中的文字圴包含在JSON包",
          step: "打开b28n.exe>翻译检查，查看导出的日志",
          Result: "打开b28n.exe>翻译检查，查看导出的日志",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "自动化测试",
          checklistDetail: "3、JSON包中的key|value与语言包中的key|value一致",
          step:"打开compare.exe程序所在目录1、将各JSON语言包拖至文件夹下，命名为translate-xx.json(xx为语言代码)2、将xlsx文件拖入。文件第一列为英文，其它列为各国语言执行cmd>compare.exe，查看result.txt文件",
          Result: "result.txt中各语言项下无错误输出",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "自动化测试",
          checklistDetail: "编程规范性",
          step: "执行编码自动化检查",
          Result: "无编码错误error",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "自动化测试",
          checklistDetail: "兼容属性",
          step: "执行浏览器兼容属性的检查",
          Result: "检视出的兼容性属性在各待兼容的浏览器的运行正常",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "流程动作",
          checklistDetail: "界面语言评审（资料）",
          step:
            "导入翻译后，转测试前需要在界面完成语言评审后发软件给资料部及项目成员评审界面语言",
          Result:
            "界面文字描述项目成员达成一致，转测后bugfree上无语言建议性bug",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "流程动作",
          checklistDetail: "界面设计确认（产品线）",
          step: "在转测试前发升级软件给产品线及项目成员验收界面设计及交互设计",
          Result:
            "产品线项目项目开发成员对界面设计达成一致，转测试后bugfree上无建议性问题",
          ifchecked: "",
          response: "",
          remarks: ""
        },
        {
          checklist: "流程动作",
          checklistDetail: "代码检视（组内）",
          step: "至少有一项功能模块由组内其它成员检视过需求、开发、自测试场景",
          Result:
            "通过检视，发现工作方法上的改进项，并将检视模块中的问题修复（包括未检视的模块）",
          ifchecked: "",
          response: "",
          remarks: ""
        }
      ]
    };
  },
  components: {
    //key 是组件名 value 是组件对象 可简写
    newChecklist: NewChecklist,
    handleChecklist: HandleChecklist
  },
  methods: {
    showName(){
        this
        .$http
        .get("/api/CI/getSession")
        .then(res => {
            res = res.data;
            if (res.name != null) {
                this.name = res.name;
            }
        });
    },
    getAllMembers:function(){
       this.$http.post("/api/CI/getAllMembers","").then(res =>{
        if(res.body.indexOf('<!DOCTYPE') !=-1){
            window.location.href ="./";
         }
         this.members =res.body.members;
         this.members.splice(0,1); // admin 需要去掉
      });
    }
          
  },
  template: "<newChecklist/>,</handleChecklist>", //调用组件
  mounted() {
    this.showName();
    this.getAllMembers();
  },
};
</script>

