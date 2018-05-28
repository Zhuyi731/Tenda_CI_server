<template>
  <div class="container-box">
    <el-table :data="tableData" style="width: 100%" :default-sort="{prop: 'proLine', order: 'ascending'}" v-loading="isLoadingData">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" label-width="120px" inline class="demo-table-expand table-form">
            <el-form-item label="产品线">
              <span>{{ props.row.proLine }}</span>
            </el-form-item>
            <el-form-item label="项目">
              <span>{{ props.row.product }}</span>
            </el-form-item>
            <el-form-item label="项目 Src路径">
              <span>{{ props.row.src }}</span>
            </el-form-item>
            <el-form-item label="项目 Dist路径">
              <span>{{ props.row.dist }}</span>
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
            <el-form-item label="是否为老代码">
              <span>{{ props.row.isOld }}</span>
            </el-form-item>
            <el-form-item label="检测间隔" prop="interval">
              <span>{{ props.row.interval }}小时</span>
            </el-form-item>
            <el-form-item label="备注" prop="remarks">
              <span>{{ props.row.remarks }}</span>
            </el-form-item>
          </el-form>
        </template>
        <!-- 表头 -->
      </el-table-column>
      <el-table-column prop="proLine" label="产品线" sortable width="180">
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
      <el-form :model="dialogForm" label-width="120px" class="r-form">

        <el-form-item label="产品线" prop="proLine">
          <el-select allow-create filterable v-model="dialogForm.proLine" placeholder="填入或选择项目对应的产品线">
            <el-option v-for="item in proLine" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="产品" prop="product">
          <el-input v-model="dialogForm.product"></el-input>
        </el-form-item>

        <el-form-item label="是否为老代码" prop="isOld">
          <el-switch v-model="dialogForm.isOld"></el-switch>
        </el-form-item>

        <el-form-item label="项目开始时间" prop="startTime">
          <el-date-picker v-model="dialogForm.startTime" type="date" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="项目状态" prop="schedule">
          <el-input v-model="dialogForm.schedule" placeholder="项目状态"></el-input>
        </el-form-item>


        <el-form-item label="项目src路径" prop="src">
          <el-input v-model="dialogForm.src" placeholder="如果是非编译的代码请直接填写路径"></el-input>
        </el-form-item>

        <el-form-item label="项目dist路径" prop="dist">
          <el-input v-model="dialogForm.dist" placeholder="如果是非编译的代码可不填"></el-input>
        </el-form-item>

        <el-form-item label="检测间隔" prop="interval">
          <el-input v-model="dialogForm.interval" placeholder="0表示一天只检测一次"></el-input>
          <span>单位(小时)(0表示一天只检测一次)</span>
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input v-model="dialogForm.remarks" type="textarea" placeholder="项目备注"></el-input>
        </el-form-item>

      </el-form>


      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editForm">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        isLoadingData: false,
        dialogVisible: false,
        dialogLoading: false,
        dialogForm: {
          proLine: "",
          product: "",
          schedule: "",
          status: "",
          src: "",
          dist: "",
          isOld: "",
          startTime: "",
          interval: "",
          key: "",
          remarks:""
        },
        proLine: ["AP", "家用", "商用"],
        tableData: [{
          proLine: "AP",
          product: "O3V2.0",
          schedule: "TR1",
          status: "运行中",
          src: "/!Documents/12",
          dist: "/123//321",
          isOld: "否",
          startTime: "2018-8-12",
          interval: "3",
          remarks:"asdasd"
        }, {
          proLine: "AP",
          product: "O3V2.0",
          schedule: "TR1",
          status: "运行中",
          src: "",
          dist: "",
          isOld: "否",
          interval: "3h",
          remarks:""
        }, {
          proLine: "家用",
          product: "AC9 GDDX",
          schedule: "TR1",
          status: "停止测试",
          src: "",
          dist: "",
          isOld: "否",
          interval: "",
          remarks:""
        }]
      }
    },
    methods: {
      handleEdit: function (index, data) {
        this.dialogForm = data;
        this.dialogForm.key = data.product;
        this.dialogVisible = true;
      },
      handleDelete: function () {
        this.$alert('为了防止意外删除项目，请前往数据库管理页面手动删除', '提示', {
          confirmButtonText: '确定'
        });
      },
      editForm: function () {
        this.dialogLoading = true;

        this.$http.post("/api/CI/editProduct", this.dialogForm).then((res) => {
          this.dialogLoading = false;
          this.dialogVisible = false;
        }).catch((err) => {
          console.log(err)
        });
      }
    },
    mounted: function () {
      this.isLoadingData = true;
      this.$http.post("/api/CI/getAllProducts").then((res) => {
        this.isLoadingData = false;
        this.tableData = res.data.products;
      }).catch((err) => {
        console.log(err)
      });
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
