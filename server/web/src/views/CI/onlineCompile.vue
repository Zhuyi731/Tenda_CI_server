<template>
  <div class="container-box" v-loading.fullscreen.lock="isCompiling" element-loading-text="服务器在拼命编译中(第一次编译需要几分钟,请不要离开页面)" element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-form class="r-form" label-width="160px">
      <el-form-item label="项目名">
        <el-select v-model="product" filterable placeholder="选择你要编译的项目">
          <el-option v-for="item in allProducts" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="compile">
          点击编译
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        product: "",
        allProducts: [],
        isCompiling: false,

      }
    },
    computed: {
      downloadLink: function () {
        return "/api/compile/" + this.product;
      }
    },
    methods: {
      compile() {
        if (this.product == "") {
          this.$alert("请选择一个项目");
        } else {
          this.downloadLink = `/api/compile/${this.product}`;
          this.isCompiling = true;
          this.$http.post(`/api/compile/${this.product}`, {
              _timeout: 300000
            })
            .then(res => {
              this.isCompiling = false;
              res = res.data;
              this.notify(res);
              //到了这一步说明服务器端编译成功了
              //然后创造一个a标签去下载
              if (res.status == "ok") {
                let a = document.createElement("a");
                a.href = this.downloadLink;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }

            }).catch(err => {
              console.log(err)
            });


        }


      }
    },
    mounted: function () {
      this.$http.post("/api/CI/getCompileProducts").then(res => {
        this.allProducts = res.data.products;
      }).catch(err => {
        console.log(err)
      });
    }
  }

</script>
