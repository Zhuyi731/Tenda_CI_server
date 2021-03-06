import Vue from 'vue'
import Router from 'vue-router'
import index from '@/views/Home/index'
Vue.use(Router)

//导入路由
import CIRouter from "./CIRouter";
import adminRouter from "./adminRouter";
import toolRouter from "./toolRouter";
import procedureRouter from "./procedureRouter";
let routes = [{
  path: '/',
  name: 'home',
  component: index
}, ...CIRouter, ...adminRouter, ...toolRouter,...procedureRouter];

export default new Router({
  routes
})
