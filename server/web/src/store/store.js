import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

const state = {
    asideTitle:"",
    showAside:true
};

const mutations = {

};
const store = new Vuex.Store({
    state,
    mutations
  })

export default store;