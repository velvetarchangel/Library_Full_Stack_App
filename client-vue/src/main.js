import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";

//Disable "You are running Vue in development mode" warning
// Vue.config.productionTip = false;
//this will prevent user from being logged out on page refresh
let app;

Vue.use(vuetify);

if (!app) {
  app = new Vue({
    vuetify,
    router,
    render: (h) => h(App),
  }).$mount("#app");
}
