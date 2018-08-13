import Vue from 'vue'
import Router from 'vue-router'
import index from '@/views/index'
Vue.use(Router)

//导入路由
import CIRouter from "./CIRouter";
import DBRouter from "./DBRouter";
import adminRouter from "./adminRouter";
import toolRouter from "./toolRouter";
let routes = [{
  path: '/',
  name: 'index',
  component: index
}, ...CIRouter, ...DBRouter, ...adminRouter, ...toolRouter];

export default new Router({
  routes
})
