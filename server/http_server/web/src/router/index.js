import Vue from 'vue'
import Router from 'vue-router'
import index from '@/views/index'

import allPro from "@/views/CI/allPro";
import newPro from "@/views/CI/newPro";
import proLine from "@/views/CI/proLine";
import proManager from "@/views/CI/proManager";

import databaseMana from "@/views/DB/databaseMana";
import allTable from "@/views/DB/allTable";
import sql from "@/views/DB/sql";

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'index',
    component: index
  }, {
    path: '/CI/allPro',
    name: "all project",
    component: allPro,
    children: [{
      path: "proManager",
      name: "project running",
      component: proManager
    }]
  }, {
    path: '/CI/newPro',
    name: "new project",
    component: newPro,
    children: [{
      path: "proLine",
      name: "product line",
      component: proLine
    }]
  }, {
    path: '/DB/databaseMana',
    name: "database management",
    component: databaseMana,
    children: [{
      path: "allTable",
      name: "show all table",
      component: allTable
    }, {
      path: "sql",
      name: "sql",
      component: sql
    }]
  }]
})
