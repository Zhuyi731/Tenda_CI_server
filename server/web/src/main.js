// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import store from "./store/store";
import vue_http from "vue-resource";
import App from "./App.vue";

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/custom.css';
import _ from "lodash";


//Use element-ui framework
Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(vue_http);

Vue.prototype._ = _;

Vue.prototype.mes = function (res) {
  if (res.status == "ok") {
    this.$message({
      message: "保存成功!",
      type: 'success'
    });
  } else {
    this.$message.error(`保存失败!错误码:${res.status}`);
  }
}

Vue.prototype.notify = function (res) {
  if (res.status == "ok") {
    this.$notify({
      title: "保存成功!",
      message: res.message || "",
      type: "success",
      offset: 100
    })
  } else {
    if (res.errMessage == "undefined") res.errMessage = "未知错误";
    this.$notify.error({
      title: "保存失败!",
      dangerouslyUseHTMLString: true,
      message: "好像出了点小错误呢~<br/>错误信息:" + res.errMessage,
      offset: 100
    });
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  vue_http,
  components: {
    App
  },
  template: '<App/>'
})
