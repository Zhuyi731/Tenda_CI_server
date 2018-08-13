<template>
  <div class="container-box">
    <el-table :data="tableData" style="width: 100%" :default-sort="{prop: 'productLine', order: 'ascending'}" v-loading="isLoadingData">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" label-width="120px" inline class="demo-table-expand table-form">
            <el-form-item label="产品线">
              <span>{{ props.row.productLine}}</span>
            </el-form-item>

            <el-form-item label="项目">
              <span>{{ props.row.product}}</span>
            </el-form-item>

            <el-form-item label="项目状态">
              <span>{{ projectStatus[props.row.schedule]}}</span>
            </el-form-item>

            <el-form-item label="项目开始时间">
              <span>{{ props.row.startTime}}</span>
            </el-form-item>

            <el-form-item label="运行状态">
              <span>{{ props.row.status}}</span>
            </el-form-item>

            <el-form-item label="检测间隔" prop="interval">
              <span>{{ props.row.interval}}天</span>
            </el-form-item>

            <el-form-item label="测试用例" prop="testCase">
              <span v-if="props.row.testCase"><el-button type="primary" icon="el-icon-download" size="mini">下载</el-button></span>
              <span v-else>无</span>
            </el-form-item>

            <el-form-item label="项目成员">
              <el-tag type="small" v-for="tag in props.row.members" :key="tag.mail">{{tag.name}} </el-tag>
            </el-form-item>

            <el-form-item label="多国语言项目?" prop="isMultiLang">
              <span>{{ props.row.isMultiLang==1?"是":"否"}}</span>
            </el-form-item>

            <el-form-item v-if="props.row.isMultiLang == 1" label="语言包" prop="languagePack">
              <span v-if="props.row.hasExcel=='1'">
              <span class="text-success">已有语言包</span>
              <el-upload ref="upload" :action="'/API/CI/update/excel/'+props.row.product" :limit="1">
                <el-button size="mini" type="primary">更新<i class="el-icon-upload2 el-icon--right"></i></el-button>
                <el-button size="mini" type="primary" @click="downloadExcel(props.row.product)">下载<i class="el-icon-download el-icon--right"></i></el-button>
                <div slot="tip" class="el-upload__tip">只能更新.xlsx文件，且不超过500kb</div>
              </el-upload>
              </span>
              <span v-else>
              <span class="text-danger">暂无语言包</span>
              <el-upload ref="upload" :action="'/API/CI/upload/excel/'+props.row.product" :limit="1">
                <el-button type="primary" size="mini" @click="uploadExcel(props.row.product)">上传<i class="el-icon-upload2 el-icon--right"></i></el-button>
                <div slot="tip" class="el-upload__tip">只能上传.xlsx文件，且不超过500kb</div>
              </el-upload>
              </span>
            </el-form-item>


          </el-form>
        </template>
      </el-table-column>

      <el-table-column prop="productLine" label="产品线" sortable width="180">
      </el-table-column>

      <el-table-column prop="product" label="项目" sortable width="180">
      </el-table-column>

      <el-table-column prop="schedule" :formatter="scheduleFormatter" label="项目状态" sortable width="180">
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
    <el-dialog title="编辑项目" :visible.sync="dialogVisible" width="600px">
      <project-form :form-model="dialogForm" :is-edit="true" :is-loading="dialogLoading" @submit="submit"></project-form>
    </el-dialog>

  </div>
</template>

<script>
  import projectForm from "@/components/projectForm.vue";
  import projectStatus from "@/components/statusMap.js";

  export default {
    components: {
      projectForm
    },
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
        projectStatus,
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
          startTime: "",
          interval: "",
          key: "" //原有数据标记
        },
        dialogFormRules: {},
        //表格数据    通过/api/getAllProducts获取
        tableData: []
      }
    },
    computed: {

    },
    methods: {
      scheduleFormatter: function (row, clounm) {
        return projectStatus[row.schedule];
      },
      handleEdit: function (index, data) {
        this.dialogForm = this._.cloneDeep(data);
        this.dialogForm.members = this.dialogForm.members.map((mb) => {
          return mb.mail
        });
        this.dialogForm.copyTo = this.dialogForm.copyTo || [];
        this.dialogForm.allMembers = this.allMembers;
        this.dialogForm.productLines = this.productLines;
        this.dialogForm.key = data.product;
        this.dialogVisible = true;
      },
      handleDelete: function () {
        this.$alert('为了防止意外删除项目，请前往数据库管理页面手动删除', '提示', {
          confirmButtonText: '确定'
        });
      },
      getAllDatas: function () {
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
        });
      },
      submit: function () {
        let submitData = this._.cloneDeep(this.dialogForm),
          that = this;
        delete submitData.allMembers;
        delete submitData.productLines;

        this.$http.post("/api/CI/editProduct", submitData).then((res) => {
          that.dialogLoading = false;
          that.notify(res.data);
          if (res.data.status == "ok") {
            that.dialogVisible = false;
            that.getAllDatas();
          }

        });
      },
      refreshExcel: function () {

      },
      downloadExcel: function () {

      },
      uploadExcel: function () {

      }
    },
    mounted: function () {
      this.getAllDatas();
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
