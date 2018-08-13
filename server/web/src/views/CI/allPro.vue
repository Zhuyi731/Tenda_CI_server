<template>
  <el-container>
    <el-aside>
      <div class="asideTitle">CI集成</div>
      <el-menu router default-active="$router.path" class="el-menu-vertical-demo" mode="vertical">
        <el-menu-item index="/CI/allPro/proManager">所有项目</el-menu-item>
        <el-menu-item index="/CI/allPro/newProject">新建项目</el-menu-item>
        <el-menu-item index="/CI/allPro/onlineCompile">在线编译</el-menu-item>
        <el-menu-item index="/CI/allPro/preview"> 项目预览 </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-container">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
  export default {}
</script>

