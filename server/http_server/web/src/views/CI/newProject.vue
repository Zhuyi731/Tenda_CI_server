<template>
  <div class="container-box">
    <el-form ref="form" status-icon :model="form" label-width="120px" :rules="formRules" class="r-form" v-loading="isLoading">

      <el-form-item label="项目名称" prop="product">
        <el-input v-model="form.product"></el-input>
      </el-form-item>

      <el-form-item label="归入产品线" prop="productLine">
        <el-select allow-create filterable v-model="form.productLine" placeholder="填入或选择项目对应的产品线">
          <el-option v-for="item in form.productLines" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="项目成员" prop="members">
        <el-select multiple v-model="form.members" placeholder="选择项目成员(多选)">
          <el-option v-for="item in form.allMembers" :key="item.mail" :label="item.name" :value="item.mail">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="邮件抄送" prop="copyTo">
        <el-select allow-create filterable multiple v-model="form.copyTo" placeholder="写入抄送人员邮箱前缀(例如:pengjuanli)">
          <el-option v-for="item in form.allMembers" :key="item.mail" :label="item.mail" :value="item.mail">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="是否为老代码" prop="isOld">
        <el-switch v-model="form.isOld" active-value="1" inactive-value="0"></el-switch>
      </el-form-item>

      <el-form-item label="项目开始时间" prop="startTime">
        <el-date-picker v-model="form.startTime" type="date" placeholder="选择日期" value-format="timestamp">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="项目状态" prop="schedule">
        <el-input v-model="form.schedule" placeholder="项目状态(选填)"></el-input>
      </el-form-item>

      <el-form-item label="编译类型" prop="compiler">
        <el-select v-model="form.compiler" placeholder="打包工具">
          <el-option v-for="item in cps" :key="item.type" :label="item.name" :value="item.type">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="项目src路径" prop="src">
        <el-input v-model="form.src" placeholder="svn上项目的src路径"></el-input>
      </el-form-item>

      <div v-if="isCompileProduct">
        <el-form-item label="编译后本地相对路径" prop="localDist">
          <el-input v-model="form.localDist" placeholder="例如编译后在dist路径下，输入./dist"></el-input>
        </el-form-item>

        <el-form-item label="项目dist路径" prop="dist">
          <el-input v-model="form.dist" placeholder="svn上项目的dist路径"></el-input>
        </el-form-item>
      </div>

      <el-form-item label="检测间隔" prop="interval">
        <el-input-number v-model="form.interval" controls-position="right" :step="0.5" :min="1" :max="120" label="检测间隔"></el-input-number>
        <span>单位(小时)</span>
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input type="textarea" v-model="form.remarks" placeholder="项目备注"></el-input>
      </el-form-item>


      <el-form-item>
        <el-button type="primary" @click="submitForm('form')">立即创建</el-button>
        <el-button @click="resetForm('form')">重置</el-button>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
  export default {
    data() {
      let checkInterval = (rule, value, callback) => {
        if (!value) {
          return callback(new Error("时间间隔不能为空"));
        }
        //为了让那个转一下
        let tail = value.toString().split(".")[1];
        if (!!tail && tail.length > 1) {
          return callback(new Error("时间间隔只能为0.5小时的整数倍"));
        } else if (!!tail && tail.length == 1 && parseInt(tail) % 5 != 0) {
          return callback(new Error("时间间隔只能为0.5小时的整数倍"));
        } else {
          callback();
        }
      };
      return {
        cps: [{
          name: "无",
          type: "none"
        }, {
          name: "Webpack",
          type: "webpack"
        }, {
          name: "Fis",
          type: "fis"
        }, {
          name: "Gulp",
          type: "gulp"
        }, {
          name: "Grunt",
          type: "grunt"
        }],
        form: {
          product: "",
          productLines: [""],
          productLine: "",
          isOld: false,
          compiler: "none",
          src: "",
          localDist:"",
          dist: "",
          members: [],
          allMembers: [],
          copyTo: [],
          interval: "0",
          startTime: "1523227200000",
          remarks: "",
          schedule: ""
        },
        /**
         * 验证规则
         */
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
            min: 2,
            max: 30,
            message: "项目状态长度为2~30个中文或英文字符",
            trigger: "blur"
          }],
          src: [{
            required: true,
            message: '请输入src路径',
            trigger: "blur"
          }],
          interval: [{
            required: true,
            message: "请输入检测时间间隔",
            trigger: "blur"
          }, {
            validator: checkInterval,
            trigger: 'blur'
          }]

        },
        //还在获取数据时爆出true
        isLoading: true
      }
    },
    computed: {
      isCompileProduct: function () {
        return this.form.compiler == "none" ? false : true;
      }
    },
    methods: {
      submitForm: function () {

        this.$refs["form"].validate((valid) => {
          if (valid) {
            this.isLoading = true;

            this.$http.post("/api/CI/setNewPro", this.form).then((res) => {
              this.isLoading = false;
              this.notify(res.data);
            });

          } else {
            this.$message.error("请检查表单输入");
            return false;
          }
        });

      },
      resetForm: function (formName) {
        this.$refs[formName].resetFields();
      }
    },
    mounted: function () {
      this.$http.post("/api/CI/getProLine").then((res) => {
        if (res.data.error) {
          alert(res.data.error);
          return;
        }

        this.form.productLines = res.data.productLines.map((arr) => {
          return arr.productLine
        });
        this.form.allMembers = res.data.allMembers;
        this.isLoading = false;
      }).catch(err => {
        console.log(err)
      });
    }
  }

</script>
