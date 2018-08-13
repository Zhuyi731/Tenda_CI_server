<template>
  <div class="new-oem">
    <div class="baseline baseline-left">
      <el-form ref="form1" label-width="80px">
        <el-form-item label="OEM名称">
          <el-input v-model="query.name"></el-input>
        </el-form-item>
        <el-form-item label="svn路径">
          <el-input v-model="query.src" placeholder="该OEM的主线路径"></el-input>
        </el-form-item>
        <el-form-item label="svn版本">
          <el-input v-model="query.version" placeholder="该定制分支的主线svn版本号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="creatOem" type="primary">创建OEM</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="baseline baseline-right">
      <el-container>
        <el-header>
          <div class="el-form-item">
            <label class="el-form-item__label">当前项目</label>
            <div class="el-form-item__content" style="color:#409EFF;font-size:18px;font-weight:bold">{{curBaseLine}}</div>
          </div>
        </el-header>
        <el-main>
          <el-form ref="form2" label-width="180px" v-loading="configLoading"  :element-loading-text="loadingText" show-message
            status-icon>
            <el-tabs tab-position="left">
              <el-tab-pane v-for="tabs in configs" :key="tabs.id" :label="tabs.title">
                <el-form-item v-for="item in tabs.pageRules"  :key="item.name" :label="item.title">
                  <el-col :span="18">
                    <el-input :placeholder="item.description" v-model="item.value"></el-input>
                  </el-col>
                  <el-col :span="6">
                    <tips :type="item.type" :value="item.value" :detail="item.detail"></tips>
                  </el-col>
                </el-form-item>

              </el-tab-pane>
            </el-tabs>

            <el-form-item v-show="hasData">
              <el-button type="primary" @click="submit">上传配置</el-button>
              <el-button type="success" @click="preview">预览界面</el-button>
              <el-button type="danger" @click="download">下载代码</el-button>
            </el-form-item>
          </el-form>
        </el-main>
      </el-container>
    </div>

  </div>
</template>

<script>
  import tips from "../../components/tips.vue";

  export default {
    data() {
      return {
        configLoading: false,
        curBaseLine: "无",
        hasData: false,
        configs: [],
        query: {
          name: "",
          src: "",
          version: ""
        },
        loadingText: "拼命加载配置中"
      }
    },
    components: {
      tips
    },
    methods: {
      creatOem: function () {
        if (this.query.name == "" || this.query.src == "") {
          this.$message.error("请输入配置");
          return;
        }
        this.configLoading = true;
        this.loadingText = "拼命加载配置中";
        this.$http.post(`/api/OEM/creatOem`, this.query)
          .then((res) => {
            res = res.data;
            if (res.status == "error") {
              this.notify(res);
            } else {
              this.hasData = true;
              this.curBaseLine = this.query.name;
              this.configLoading = false;
              this.configs = res.config;
            }
          })
      },
      submit: function () {
        this.loadingText = "正在为您修改配置";
        let submitData = this._.cloneDeep(this.configs).map(el => {
          return {
            id: el.id,
            pageRules: el.pageRules.map(rule => {
              delete rule.title;
              delete rule.description;
              return rule;
            })
          }
        });
        this.configLoading = true;
        this.$http.post(`/api/OEM/setConfig/${this.curBaseLine}`, submitData)
          .then((data) => {
            this.configLoading = false;
            data = data.data;
            if (data.status == "error") {
              this.notify(data);
            } else {
              this.$notify({
                title: "保存成功!",
                message: "配置保存成功，请点击预览",
                type: "success",
                offset: 100
              });
            }
          });
      },
      preview: function () {
        this.$http.post(`/api/OEM/preview/${this.curBaseLine}`).then((data) => {
          data = data.data;
          if (data.status == "error") {
            this.$notify.error("服务器运行web-debug时好像出了点问题");
          } else {
            window.open("http://" + window.location.hostname + ":" + data.port, "_blank");
          }
        });
      },
      download: function () {
        this.$http.post(`/api/OEM/compress/${this.curBaseLine}`).then((data) => {
          let a = document.createElement("a");
          //这种请求时get的
          a.href = `/api/OEM/download/${this.curBaseLine}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        })
      }
    }
  }

</script>


<style lang="scss">
  .baseline {
    border: 1px solid #ebebeb;
    padding: 30px 20px;
    border-radius: 3px;
    width: 300px;
    float: left;
  }

  .baseline-right {
    width: 700px;
    margin-left: 20px;
  }

</style>
