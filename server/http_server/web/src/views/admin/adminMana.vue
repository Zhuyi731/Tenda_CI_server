<template>
    <el-container>
      <el-aside>
        <div class="asideTitle">后台管理</div>
        <el-menu :router="true" :default-active="activeIndex" class="el-menu-vertical-demo" mode="vertical">
          <el-menu-item index="/admin/adminMana/userMana">用户管理</el-menu-item>
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
              activeIndex:"/admin/adminMana/userMana"
          }
      }
    }
  
  </script>
  