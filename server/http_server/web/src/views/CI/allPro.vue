<template>
  <el-container>
    <el-aside>
      <div class="asideTitle">{{title}}</div>
      <el-menu router default-active="$router.path"  class="el-menu-vertical-demo" mode="vertical">
        <el-menu-item index="/CI/allPro/proManager">所有项目</el-menu-item>
        <el-menu-item index="/CI/allPro/newProject">新建项目</el-menu-item>
      </el-menu>
    </el-aside>
    <el-main v-loading="isLoading" class="main-container">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
  export default {
    props:["active"],
    data() {
      return {
        activeIndex: "/CI/allPro/proManager",
        isLoading: false
      }
    },
    computed: {
      title: function () {
        let map = {
          "/CI/allPro/proManager": "所有项目",
          "/CI/newPro/proLine": "新建项目"
        }
        return map[this.activeIndex];
      }
    }
  }

</script>

<style>


</style>
