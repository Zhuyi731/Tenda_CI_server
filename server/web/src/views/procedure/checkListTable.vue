<template>
  <!-- <el-collapse> -->
    <!-- <el-collapse-item title="checklist表" name="1"> -->
      <el-table
        :data="checklistData"
        class="tb-edit"
        style="width: 100%"
        highlight-current-row
        :span-method="arraySpanMethod"
      >
        <el-table-column label="checklist项" >
          <el-table-column label >
            <template slot-scope="scope" width="150">
              <span v-html="scope.row.checklist"></span>
            </template>
          </el-table-column>
          <el-table-column label >
            <template slot-scope="scope" width="150">
              <span v-html="scope.row.checklistDetail"></span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="步骤动作" width="220">
          <template slot-scope="scope">
            <span v-html="scope.row.step"></span>
          </template>
        </el-table-column>
        <el-table-column prop="期望的结果" label="结果" width="180">
          <template slot-scope="scope">
            <span v-html="scope.row.Result"></span>
          </template>
        </el-table-column>
        <el-table-column prop="是否已检视" label="检视" width="160">
          <template slot-scope="scope">
            <el-input  type="textarea" autosize v-model="scope.row.ifchecked" placeholder="请输入内容"></el-input>
            <span>{{scope.row.ifchecked}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="责任人" label="责任人" width="160">
          <template slot-scope="scope">
            <el-input type="textarea" autosize v-model="scope.row.response" placeholder="请输入内容"></el-input>
            <span>{{scope.row.response}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="备注" label="备注" width="160">
          <template slot-scope="scope">
            <el-input type="textarea" autosize v-model="scope.row.remarks" placeholder="请输入内容"></el-input>
            <span>{{scope.row.remarks}}</span>
          </template>
        </el-table-column>
      </el-table>
    <!-- </el-collapse-item>
  </el-collapse> -->
</template>

<script>
export default {
  props: ["checklistData"],
  data() {
    return {
      rowsarr: [
        [1, 2, 0, 5, 0, 0, 0, 0, 2, 0, 5, 0, 0, 0, 0, 3, 0, 0],
        [1, 1, 1, 1, 2, 0, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ],
      members: [
        {
          value: "yangchunmei",
          label: "杨春梅"
        },
        {
          value: "zhuyi",
          label: "朱义"
        },
        {
          value: "yanhuan",
          label: "闫欢"
        },
        {
          value: "pengjuanli",
          label: "彭娟莉"
        },
        {
          value: "zoumengli",
          label: "邹梦丽"
        }
      ]
    };
  },
  methods: {
    arraySpanMethod: function({ row, column, rowIndex, columnIndex }) {
      //    console.log(row, column, rowIndex, columnIndex);
      if (columnIndex === 0 || columnIndex === 1) {
        return {
          rowspan: this.rowsarr[columnIndex][rowIndex],
          colspan: this.rowsarr[columnIndex][rowIndex] == 0 ? 0 : 1
        };
      }
    }
  }
};
</script>

<style>
  .tb-edit .el-textarea {
    display: none;
  }
  .tb-edit .current-row .el-textarea {
    display: block;
  }
  .tb-edit .current-row .el-textarea + span {
    display: none;
  }
  </style>