<template>
  <div class="container-box">
    <el-table :data="tableData" style="width: 100%" :default-sort="{prop: 'productLine', order: 'ascending'}" v-loading="isLoadingData">
      <el-table-column type="expand">
        <!-- 表内填充slot -->
        <template slot-scope="props">
          <el-form label-position="left" label-width="120px" inline class="demo-table-expand table-form">
            <el-form-item label="产品线">
              <span>{{ props.row.productLine }}</span>
            </el-form-item>
            <el-form-item label="项目">
              <span>{{ props.row.product }}</span>
            </el-form-item>
            <el-form-item label="项目状态">
              <span>{{ props.row.schedule }}</span>
            </el-form-item>
            <el-form-item label="项目开始时间">
              <span>{{ props.row.startTime }}</span>
            </el-form-item>
            <el-form-item label="运行状态">
              <span>{{ props.row.status }}</span>
            </el-form-item>
            <el-form-item label="检测间隔" prop="interval">
              <span>{{ props.row.interval }}小时</span>
            </el-form-item>
            <el-form-item label="测试用例" prop="testCase">
              <span v-if="props.row.testCase"><el-button type="primary" icon="el-icon-download" size="mini">下载</el-button></span>
              <span v-else>无</span>
            </el-form-item>
            <el-form-item label="项目成员">
              <el-tag type="small" v-for="tag in props.row.members" :key="tag.mail">{{tag.name}} </el-tag>
            </el-form-item>
            <el-form-item label="备注" prop="remarks">
              <span>{{ props.row.remarks }}</span>
            </el-form-item>

          </el-form>
        </template>
        <!-- 表头 -->
      </el-table-column>

      <el-table-column prop="productLine" label="产品线" sortable width="180">
      </el-table-column>

      <el-table-column prop="product" label="项目" sortable width="180">
      </el-table-column>

      <el-table-column prop="schedule" label="项目状态" sortable width="180">
      </el-table-column>

      <el-table-column prop="status" label="检测状态" sortable>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" icon="el-icon-edit" type="primary" @click="handleEdit(scope.$index, scope.row)"></el-button>
          <el-button size="mini" icon="el-icon-delete" type="danger" @click="handleDelete(scope.$index, scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 点击编辑按钮弹出的编辑框 -->
    <el-dialog title="编辑项目" :visible.sync="dialogVisible" width="600px" v-loading="dialogLoading">
      <el-form ref="dialogForm" status-icon :rules="dialogFormRules" class="r-form" :model="dialogForm" label-width="120px">

        <el-form-item label="项目检测状态" prop="status">
          <el-switch v-model="dialogForm.status" active-value="running" inactive-value="closed" active-text="运行" inactive-text="关闭"></el-switch>
          <span>(关闭后将停止运行检测)</span>
        </el-form-item>

        <el-form-item label="归入产品线" prop="productLine">
          <el-select allow-create filterable v-model="dialogForm.productLine" placeholder="填入或选择项目对应的产品线">
            <el-option v-for="pro in dialogForm.productLines" :key="pro" :label="pro" :value="pro">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="产品" prop="product">
          <el-input v-model="dialogForm.product"></el-input>
        </el-form-item>

        <el-form-item label="项目成员" prop="members">
          <el-select multiple v-model="dialogForm.members" value-key="mail" placeholder="选择项目成员(多选)">
            <el-option v-for="mb in allMembers" :key="mb.mail" :label="mb.name" :value="mb.mail">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="抄送" prop="copyTo">
          <el-select multiple allow-create filterable v-model="dialogForm.copyTo" value-key="mail" placeholder="选择项目成员(多选)">
            <el-option v-for="mb in copyTo" :key="mb" :label="mb" :value="mb">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="是否为老代码" prop="isOld">
          <el-switch v-model="dialogForm.isOld" active-value="1" inactive-value="0"></el-switch>
        </el-form-item>

        <el-form-item label="项目开始时间" prop="startTime">
          <el-date-picker v-model="dialogForm.startTime" type="date" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="项目状态" prop="schedule">
          <el-input v-model="dialogForm.schedule" placeholder="项目状态"></el-input>
        </el-form-item>

        <el-form-item label="编译类型" prop="compiler">
          <el-select v-model="dialogForm.compiler" placeholder="打包工具">
            <el-option v-for="item in cps" :key="item.type" :label="item.name" :value="item.type">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="项目src路径" prop="src">
          <el-input v-model="dialogForm.src" placeholder="如果是非编译的代码请直接填写路径"></el-input>
        </el-form-item>

        <div v-if="isCompileProduct">
          <el-form-item label="编译后本地相对路径" prop="localDist">
            <el-input v-model="dialogForm.localDist" placeholder="例如编译后在dist路径下，输入./dist"></el-input>
          </el-form-item>

          <el-form-item label="项目dist路径" prop="dist">
            <el-input v-model="dialogForm.dist" placeholder="如果是非编译的代码可不填"></el-input>
          </el-form-item>
        </div>

        <el-form-item label="检测间隔" prop="interval">
          <el-input-number v-model="dialogForm.interval" controls-position="right" :step="0.5" :min="1" :max="120" label="检测间隔"></el-input-number>
          <span>单位(小时)</span>
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input v-model="dialogForm.remarks" type="textarea" placeholder="项目备注"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm()">修改</el-button>
          <el-button @click="resetForm()">重置</el-button>
        </el-form-item>

      </el-form>

    </el-dialog>

  </div>
</template>

<script>
  export default {
    data() {
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
        isLoadingData: false,
        dialogVisible: false,
        dialogLoading: false,
        //所有产品线数据  通过/api/getProLine获取
        //所有成员数据
        allMembers: [],
        productLines: [],

        dialogForm: {
          productLine: "",
          product: "",
          members: [],
          copyTo: [],
          schedule: "",
          status: "",
          compiler: "",
          src: "",
          localDist: "",
          dist: "",
          isOld: "",
          startTime: "",
          interval: "",
          remarks: "",
          key: "" //原有数据标记
        },
        dialogFormRules: {},
        //表格数据    通过/api/getAllProducts获取
        tableData: []
      }
    },
    computed: {
      isCompileProduct: function () {
        return this.dialogForm.compiler == "none" ? false : true;
      }
    },
    methods: {
      handleEdit: function (index, data) {
        this.dialogForm = this._.cloneDeep(data);
        this.dialogForm.members = this.dialogForm.members.map((mb) => {
          return mb.mail
        });
        this.dialogForm.copyTo = this.dialogForm.copyTo || [];
        this.dialogForm.key = data.product;
        this.dialogVisible = true;
      },
      handleDelete: function () {
        this.$alert('为了防止意外删除项目，请前往数据库管理页面手动删除', '提示', {
          confirmButtonText: '确定'
        });
      },
      submitForm: function () {
        let that = this;
        this.$refs["dialogForm"].validate((valid) => {
          if (valid) {
            this.dialogLoading = true;
            let submitData = this._.cloneDeep(this.dialogForm);
            submitData.copyTo = submitData.copyTo.map((el)=>{return el.mail});

            this.$http.post("/api/CI/editProduct", submitData).then((res) => {
              this.dialogLoading = false;
              this.notify(res.data);
              this.dialogVisible = false;
            });

          } else {
            this.$message.error("请检查表单输入");
            return false;
          }
        });

      },
      resetForm: function () {
        this.$refs["dialogForm"].resetFields();
      }
    },
    mounted: function () {
      let that = this;
      this.isLoadingData = true;
      //获取所有成员的数据以及所有产品的数据
      Promise.all([this.$http.post("/api/CI/getAllProducts"), this.$http.post("/api/CI/getProLine")]).then((res) => {
        that.isLoadingData = false;
        that.tableData = res[0].data.products;
        that.allMembers = res[1].data.allMembers;
        that.productLines = res[1].data.productLines.map((arr) => {
          return arr.productLine
        });
      })

    }
  }

</script>

<style lang="scss">
  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }

</style>
