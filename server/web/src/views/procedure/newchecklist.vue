<template>
  <div>
    <el-form ref="form"  size="small" :model="procedure" label-width="120px" :rules = "formRules">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-form-item label="项目名称" prop="name" >
            <el-input v-model="procedure.name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="web责任人" prop="response" >
            <el-select v-model="procedure.response" multiple placeholder="请选择" style="width: 100%;">
              <el-option v-for="item in members" :key="item.mail" :label="item.name" :value="item.mail"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-form-item label="PL/导师" prop="teacher" >
            <el-select v-model="procedure.teacher" multiple placeholder="请选择" style="width: 100%;">
              <el-option v-for="item in members" :key="item.mail" :label="item.name" :value="item.mail"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="项目责任人邮箱" prop="mail" >
            <el-select  v-model="procedure.mail" multiple placeholder="请选择" style="width: 100%;" allow-create filterable default-first-option ></el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-form-item label="阶段" prop="process" >
            <el-select v-model="procedure.process" placeholder="请选择转测阶段" style="width: 100%;">
              <el-option label="第一轮测试" value="1"></el-option>
              <el-option label="第二轮测试" value="2"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="简要描述" prop="remarks" >
            <el-input type="textarea" v-model="procedure.remarks"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="checklist表" prop="remarks" >
            <el-button type="text" @click="dialogTableVisible = true">填写checklist表</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- <checklistTable :checklistData="checklistData"></checklistTable> -->
      <el-button type="primary" @click="beforeSubmit" class="submit">立即创建</el-button>
      <el-button>取消</el-button>
    </el-form>

    <el-dialog title="checklist表" width="80%" height="50%"  :visible.sync="dialogTableVisible">
        <checklistTable :checklistData="checklistData"></checklistTable>
    </el-dialog>
  </div>
</template>

<script>
import checklistTable from "./checkListTable.vue";

export default {
  props:["name","members","checklistData"],
  data() {
    return {
      dialogTableVisible: false,
      procedure: {
        name: "",
        response: [],
        teacher: ["pengjuanli"],
        mail: [],
        process: "",
        remarks: "",
        status: "pending",
        opinion:""
      },
      formRules:{
        name: [{
          required: true,
          message: '请输入项目名称',
          trigger: 'blur'
        }],
        response: [{
          required: true,
          message: '请输入负责人',
          trigger: 'blur'
        }],
        teacher:[{
          required: true,
          message: '请输入导师/PL',
          trigger: 'blur'
        }],
        mail: [{
          required: true,
          message: '请输入软件负责人邮箱名（不带@tenda.cn）',
          trigger: 'blur'
        }],
        process: [{
          required: true,
          message: '请输入评审意见',
          trigger: 'blur'
        }],
        remarks: "",
      }
    };
  },
  components: {
    checklistTable
  },
  watch:{
    "members":function(newvalue,oldvalue){
      
    }
  },
  methods: {
    beforeSubmit:function(){
      var that = this;
      this.$refs["form"].validate((valid) => {
          if (valid) {
              that.onSubmit();
          } else {
              this.$message.error("请检查表单输入");
              return false;
          }
      });
    },
    onSubmit: function() {
      let submitData = {};
      submitData.procedure = this._.cloneDeep(this.procedure);
      submitData.checklist = [];
      submitData.checklist[0] = this.checklistData;

      //处理一下数据
      submitData.procedure.response = submitData.procedure.response.join(",");
      submitData.procedure.teacher = submitData.procedure.teacher.join(",");
      submitData.procedure.mail = submitData.procedure.mail.join(",");

      this.$http.post("/api/procedure/setProcedure", submitData).then(res => {
        this.notify(res.data);
      });
    }
  },
  mounted() {
   
  },
};
</script>

<style lang="scss" scoped>
  .submit {
    margin-top:20px;
  }
  
</style>