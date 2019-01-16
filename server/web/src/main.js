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
import VueCropper from 'vue-cropper'
import { isArray } from 'util';

//Use element-ui framework
Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(vue_http);
Vue.use(VueCropper)

Vue.prototype._ = _;

Vue.prototype.mes = function(res) {
    if (res.status == "ok") {
        this.$message({
            message: "保存成功!",
            type: 'success'
        });
    } else {
        this.$message.error(`保存失败!错误码:${res.status}`);
    }
}

Vue.prototype.notify = function(res) {
    const typeMap = {
        error: {
            type: "error",
            title: "错误！"
        },
        warn: {
            type: "error",
            title: "警告！"
        },
        ok: {
            type: "success",
            title: "成功！"
        }
    };

    res.status == "error" && (res.message = res.errMessage);
    !isArray(res.message) && (res.message = [res.message]);
    res.message.forEach(singleMes => {
        setTimeout(() => {
            this.$notify({
                title: typeMap[res.status].title,
                message: singleMes || "",
                dangerouslyUseHTMLString: true,
                type: typeMap[res.status].type,
                offset: 100,
                duration: 0
            });
        }, 100);
    });
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
});
/* eslint-enable no-new */