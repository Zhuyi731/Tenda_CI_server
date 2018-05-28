<template>
  <el-menu :router="true" :default-active="active" class="el-menu-demo" mode="horizontal" @select="handleSelect">
    <el-menu-item index="/"> 首页 </el-menu-item>
    <el-submenu index="/CI/newPro">
      <template slot="title">
        CI集成
      </template>
      <el-menu-item index="/CI/newPro"> 新建项目 <i class="el-icon-circle-plus"></i> </el-menu-item>
      <el-menu-item index="/CI/allPro"> 所有项目 </el-menu-item>
    </el-submenu>
    <el-menu-item index="/DB/databaseMana">
      数据库管理
    </el-menu-item>
  </el-menu>
</template>

<script>
  export default {
    props:["active"],
    data() {
      return {
      }
    },
    methods: {
      handleSelect: function (key, keyPath) {
        // this.activeIndex = key;
      }
    }
  }

</script>

<style lang="scss">
  
</style>