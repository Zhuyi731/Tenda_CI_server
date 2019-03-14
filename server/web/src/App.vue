<template>
    <div id="app">
        <el-container class="container">
            <el-header class="relative">
                <div class="grid-content bg-purple-dark">
                    <navigation class="navigation" :active="activeIndex"></navigation>
                </div>
                <div class="grid-content bg-purple-dark user" id="user">
                    <span>{{name}}</span>
                    <span class="squr"></span>
                    <div id="logout" @click="logout">退出</div>
                </div>
            </el-header>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import navigation from "@/views/navigation.vue";
    export default {
          data(){
            return {name:'用户'};
        },
        mounted:function(){
            this.showName();
        },
        computed: {
            activeIndex: function() {
                return this.$route.path;
            }
        },
        components: {
            navigation
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
           logout(){
               this
               .$http
               .post("/login/logout")
               .then(res =>{
                    this.$message({
                        message: "退出成功!",
                        type: 'success'
                    });
                     window.location.href ="./";
               })
           }   
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

    .el-main {
        margin-top: 40px;
    }
    .navigation{
        right:300px;
    }
    #user{
        position: absolute;
        top: 0;
        right: -30px;
        height: 60px;
        line-height: 60px;
        color: #909399;
        font-size:11px;
    }
    #logout{
        display: none;
        margin-top: -15px;
    }
    #logout:hover,#logout:focus{
        background: none;
        color: #409EFF;
    }
    .squr{
        border: 4px solid transparent;
        border-top-color: currentcolor;
        content: "";
        display: inline-block;
        height: 0;
        vertical-align: middle;
        width: 0;
        color:black;
    }
    #user:hover .squr{
        color: #409EFF;
    }
    #user:hover #logout{
        display: block;
    }
</style>