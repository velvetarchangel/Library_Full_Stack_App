import Vue from "vue";
import VueRouter from "vue-router";
import Signup from "../views/Signup.vue";
import Signin from "../views/Login.vue";
import UserProfile from "../views/UserProfile.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Signin",
    component: Signin,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/profile/:card_no",
    name: "UserProfile",
    component: UserProfile,
    props: (route) => ({ card_no: route.params.card_no }),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
