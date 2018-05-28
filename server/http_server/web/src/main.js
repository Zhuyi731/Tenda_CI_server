// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import index from './views/index.vue'
import router from './router'
import store from "./store/store";
import vue_http from "vue-resource";
import App from "./App.vue";

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/custom.css';


//Use element-ui framework
Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(vue_http);

Vue.prototype.mes = function (res) {
  if (res.status = "ok") {
    this.$message({
      message:"保存成功!",
      type: 'success'
    });
  }else{
    this.$message.error(`保存失败!错误码:${res.status}`);
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  vue_http,
  components: { App },
  template: '<App/>'
})
