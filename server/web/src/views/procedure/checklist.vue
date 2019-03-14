<template>
  <el-tabs type="border-card">
    <el-tab-pane label="新增">
      <newChecklist/>
    </el-tab-pane>
    <el-tab-pane label="未办理">
      <handleChecklist v-bind:status="status[0]"></handleChecklist>
    </el-tab-pane>
    <el-tab-pane label="已办理">
      <handleChecklist v-bind:status="status[1]"></handleChecklist>
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
      name : ""
    };
  },
  components: {
    //key 是组件名 value 是组件对象
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
  },
  template: "<newChecklist/>,</handleChecklist>", //调用组件
  mounted() {
    this.showName();
  },
};
</script>
<style>
.tb-edit .el-input {
  display: none;
}
.tb-edit .current-row .el-input {
  display: block;
}
.tb-edit .current-row .el-input + span {
  display: none;
}
</style>
