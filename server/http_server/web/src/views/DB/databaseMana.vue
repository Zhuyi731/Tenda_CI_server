<template>
  <el-container>
    <el-aside>
      <div class="asideTitle">数据库管理</div>
      <el-menu :router="true" :default-active="activeIndex" class="el-menu-vertical-demo" mode="vertical">
        <el-menu-item index="/DB/databaseMana/allTable">所有表格</el-menu-item>
        <el-menu-item index="/DB/databaseMana/sql">SQL</el-menu-item>
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
            isLoading:false,
            activeIndex:"/DB/databaseMana/allTable"
        }
    }
  }

</script>
