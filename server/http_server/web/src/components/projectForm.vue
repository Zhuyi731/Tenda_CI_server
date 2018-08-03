<template>
  <div>
    <div style="margin:20px auto">
      <el-steps :space="500" :active="activeStep" align-center finish-status="success" process-status="procecss">
        <el-step title="基础配置"></el-step>
        <el-step title="编译配置"></el-step>
      </el-steps>
    </div>
    <el-form ref="form1" v-show="activeStep==0" status-icon :model="formModel" label-width="160px" :rules="formRules" class="r-form"
      v-loading="isLoading">
      <el-form-item label="项目名称" prop="product">
        <el-input v-model="formModel.product"></el-input>
      </el-form-item>

      <el-form-item label="项目状态" prop="schedule">
        <el-select v-model="formModel.schedule" placeholder="选择项目状态">
          <el-option v-for="(key,value) in projectStatus" :key="value" :label="key" :value="value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="归入产品线" prop="productLine">
        <el-select allow-create filterable v-model="formModel.productLine" placeholder="填入或选择项目对应的产品线">
          <el-option v-for="item in formModel.productLines" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="项目成员" prop="members">
        <el-select multiple v-model="formModel.members" placeholder="选择项目成员(多选)">
          <el-option v-for="item in formModel.allMembers" :key="item.mail" :label="item.name" :value="item.mail">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="邮件抄送" prop="copyTo">
        <el-select allow-create filterable multiple v-model="formModel.copyTo" placeholder="写入抄送人员邮箱前缀(例如:pengjuanli)">
          <el-option v-for="item in formModel.allMembers" :key="item.mail" :label="item.mail" :value="item.mail">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="项目开始时间" prop="startTime">
        <el-date-picker v-model="formModel.startTime" type="date" placeholder="选择日期" value-format="timestamp">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="项目src路径" prop="src">
        <el-input v-model="formModel.src" placeholder="svn上项目的src路径"></el-input>
      </el-form-item>

      <el-form-item label="检测间隔" prop="interval">
        <el-input-number v-model="formModel.interval" controls-position="right" :step="1" :min="1" :max="7" label="检测间隔" :precision="0"></el-input-number>
        <span>(天)</span>
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input type="textarea" v-model="formModel.remarks" placeholder="项目备注"></el-input>
      </el-form-item>
    </el-form>

    <el-form ref="form2" v-show="activeStep==1" status-icon :model="formModel" label-width="160px" :rules="formRules" class="r-form"
      v-loading="isLoading">
      <el-form-item label="编译类型" prop="compiler">
        <el-select v-model="formModel.compiler" placeholder="打包工具">
          <el-option v-for="item in cps" :key="item.value" :label="item.name" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <div v-if="formModel.compiler != 'none'">
        <el-form-item label="编译后本地相对路径" prop="localDist">
          <el-input v-model="formModel.localDist" placeholder="例如编译后在dist路径下，输入./dist"></el-input>
        </el-form-item>

        <el-form-item label="编译指令" prop="compileOrder">
          <el-input v-model="formModel.compilerOrde" placeholder="npm run build"></el-input>
        </el-form-item>

        <el-form-item label="项目dist路径" prop="dist">
          <el-input v-model="formModel.dist" placeholder="svn上项目的dist路径"></el-input>
        </el-form-item>
      </div>
    </el-form>

    <el-button :disabled="activeStep==0" type="primary" @click="lastStep">上一步</el-button>
    <el-button type="primary" @click="nextStep">{{nextButtonText}}</el-button>
  </div>

</template>


<script>
  import projectStatus from "@/components/statusMap.js";

  function pathValidator(rule, value, callback) {
    // value = value.replace(/\\/g, "/");
    var regex = /^(http|https|\.\/|..\/)(.*)[^\/]$/;

    if (regex.test(value) && !/\s/.test(value)) {
      callback();
    } else {
      callback("请输入一个正确的地址");
    }
  }
  export default {
    props: ["formModel", "isLoading"],
    data() {
      return {
        projectStatus,
        activeStep: 0,
        nextButtonText: "下一步",
        cps: [{
          name: "无",
          value: "none"
        }, {
          name: "Webpack",
          value: "webpack"
        }],
        formRules: {
          product: [{
              required: true,
              message: '请输入项目名称',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 30,
              message: "项目名称长度为3~30个中文或英文字符",
              trigger: "blur"
            }
          ],
          productLine: [{
            required: true,
            message: '请选择产品线',
            trigger: 'change'
          }],
          members: [{
            required: true,
            message: '请加入至少一个项目成员'
          }],
          startTime: [{
            required: true,
            message: '请选择日期'
          }],
          schedule: [{
            required: true,
            message: '请选择项目状态'
          }],
          src: [{
            required: true,
            message: '请输入src路径',
            trigger: "blur"
          }, {
            validator: pathValidator,
            trigger: 'blur'
          }],
          interval: [{
            required: true,
            message: "请输入检测时间间隔",
            trigger: "blur"
          }],
          localDist: [{
            required: true,
            message: "请输入编译后本地相对路径",
            trigger: "blur"
          }, {
            validator: pathValidator,
            trigger: 'blur'
          }],
          compilerOrde: [{
            required: true,
            message: "请输入编译指令",
            trigger: "blur"
          }],
          dist: [{
            required: true,
            message: "请输入项目dist路径",
            trigger: "blur"
          }, {
            validator: pathValidator,
            trigger: 'blur'
          }]
        }
      }
    },
    methods: {
      lastStep: function () {
        this.nextButtonText = "下一步";
        this.activeStep--;
      },
      nextStep: function () {
        if (this.activeStep == 0) {
          this.$refs["form1"].validate((valid) => {
            if (valid) {
              this.nextButtonText = "立即创建";
              this.activeStep++;
            } else {
              this.$message.error("请检查表单输入");
              return false;
            }
          });

        } else {
          this.$refs["form2"].validate((valid) => {
            if (valid) {
              this.$emit("submit");
            } else {
              this.$message.error("请检查表单输入");
              return false;
            }
          });
        }
      }
    },
    computed: {
      isCompileProduct: function () {
        return this.formModel.compiler == "none" ? false : true;
      }
    }
  }

</script>
