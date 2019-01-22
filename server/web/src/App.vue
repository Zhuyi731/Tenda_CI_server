<template>
    <div id="app">
        <el-container class="container">
            <el-header class="relative">
                <el-row>
                    <el-col :span="12">
                        <div class="grid-content bg-purple-dark">
                            <navigation class="navigation" :active="activeIndex"></navigation>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="grid-content bg-purple-dark user">
                            <span>当前用户：{{name}}</span>
                            <el-button class="logout" @click="logout"> 退出</el-button>
                        </div>
                    </el-col>
                </el-row>
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
            return {name:'无'};
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
                .get("/api/CI/getSession", this.form)
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
               .post("/api/logout")
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
    .user{
        position: absolute;
        top: 0;
        right: 10px;
        height: 60px;
        line-height: 60px;
        color: #909399;
    }
    .logout{
        border: none;
    }
    .logout:hover,.logout:focus{
        background: none;
    }
</style>