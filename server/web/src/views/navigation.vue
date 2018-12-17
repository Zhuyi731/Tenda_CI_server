<template>
  <el-menu router :default-active="active" class="el-menu-demo" mode="horizontal" @select="handleSelect">
    <el-menu-item index="/">首页</el-menu-item>

    <el-submenu index="/CI/newPro">
      <template slot="title">CI集成</template>
      <el-menu-item index="/CI/allProject"> 所有项目 </el-menu-item>
      <el-menu-item index="/CI/newProject"> 新建项目 </el-menu-item>
      <el-menu-item index="/CI/onlineCompile">在线编译</el-menu-item>
    </el-submenu>

    <el-submenu index="/OEM/newBaseLine">
      <template slot="title">工具库</template>
      <el-menu-item index="/tool/customOemTool"> OEM定制 </el-menu-item>
    </el-submenu>

    <el-menu-item index="/admin/adminMana">后台管理</el-menu-item>

  </el-menu>
</template>

<script>
  export default {
    props: ["active"],
    data() {
      return {}
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
