<template>
    <div id="login">
        <el-form class="login" ref="form" :model="form" label-width="80px" @submit.native="onSubmit" @submit.native.prevent>
          <el-form-item prop="name" label="用户名"
          :rules="[
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]"
        >
          <el-input @keyup.enter.native="onSubmit" v-model="form.name" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="pwd" label="密码"
          :rules="[
            { required: true, message: '请输入密码', trigger: 'blur' }
          ]"
        >
          <el-input @keyup.enter.native="onSubmit" type="password" v-model="form.pwd"  placeholder="请输入密码">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" native-type="onSubmit" autofocus>登录</el-button>
        </el-form-item>
        </el-form>
    </div>
</template>
<script>
import md5 from 'js-md5';
  export default {
    data() {
      return {
        form: {
          name: '',
          pwd: '',
          password:''
        }
      }
    },
    methods: {
      onSubmit(){
        var that = this;
        this.$refs["form"].validate((valid) => {
          if (valid) {
              that.Submit();
          } else {
              this.$message.error("请检查表单输入");
              return false;
          }
      });
      },
      Submit() {
        this.form.password = md5(this.form.pwd);
        this.form.pwd = '';
        this
            .$http
            .post("/login", this.form)
            .then(res => {
                res = res.data;
                if (res.retCode === '1') {
                  this.$message.error(`登录失败!${res.retMsg}`);
                } else {
                    this.$message({
                        message: "登录成功!",
                        type: 'success'
                    });
                    window.location.href ="/";
                }
            });
      }
    }
  }
</script>

<style lang="css">
.login{
    width: 300px;
    margin: auto;
    margin-top: 150px;
}    
</style>