<template>
  <div id="app">
    <el-container class="container">
      <el-header class="relative">
        <navigation class="navigation" :active="activeIndex"></navigation>
      </el-header>
      <router-view/>
    </el-container>
  </div>
</template>

<script>
  import navigation from "./views/navigation.vue";
  export default {
    computed: {
      activeIndex: function () {
        return this.$route.path;
      }
    },
    components: {
      navigation
    }
  }

</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

</style>
