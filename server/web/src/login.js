import Vue from 'vue'

import vue_http from "vue-resource";
import login from "./views/login.vue";

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/custom.css';
import _ from "lodash";


Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(vue_http);

new Vue({
    el: '#login',
    vue_http,
    components: {
        login
    },
    template: '<login/>'
})