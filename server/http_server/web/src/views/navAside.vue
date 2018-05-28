<template>
  <aside >
    <div>{{asideTitle}}</div>
    <el-menu :router="true" :default-active="activeIndex" class="el-menu-demo" mode="vertical" @select="handleSelect">
      <el-submenu index="1">
        <template slot="title">
          选择产品线:
        </template>
        <el-menu-item index="2-1"> AP </el-menu-item>
        <el-menu-item index="2-2"> PLC </el-menu-item>
      </el-submenu>
      <el-menu-item index="2">新建产品线 <i class="el-icon-circle-plus"></i> </el-menu-item>
    </el-menu>
  </aside>
</template>

<script>
  import {
    mapState,
    mapMutations
  } from "vuex";

  export default {
    data() {
      return {
        activeIndex: "1"
      }
    },
    computed: {
      ...mapMutations["asideTitle", "showAside"]
    },
    methods: {
        handleSelect:function(){

        }
    }
  }

</script>
