<template>
  <el-container>
    <el-aside>
      <div class="asideTitle">所有项目</div>
      <el-menu :router="true" :default-active="activeIndex" class="el-menu-vertical-demo" mode="vertical">
        <el-menu-item index="/CI/allPro/proManager">管理项目</el-menu-item>
        <el-menu-item index="/CI/newPro/proLine">新建项目</el-menu-item>
      </el-menu>
    </el-aside>
    <el-main v-loading="isLoading" class="main-container">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
    export default {
        data(){
            return {
                activeIndex:"/CI/allPro/proManager",
                isLoading:false
            }
        }
    }

</script>

<style>
    
</style>