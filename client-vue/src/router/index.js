import Vue from "vue";
import VueRouter from "vue-router";
import Signup from "../views/Signup.vue";
import Signin from "../views/Login.vue";
import UserProfile from "../views/UserProfile.vue";
import CustomerProfile from "../views/CustomerProfile.vue";
import LibrarianProfile from "../views/LibrarianProfile.vue";
import ResultPage from "../views/ResultPage.vue";
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
  {
    path: "/librarianProfile/:card_no",
    name: "LibrarianProfile",
    component: LibrarianProfile,
    props: (route) => ({ card_no: route.params.card_no }),
  },
  {
    path: "/librarianProfile/:admin_card/:customer_card",
    name: "CustomerProfile",
    component: CustomerProfile,
    props: (route) => ({
      admin_card: route.params.admin_card,
      customer_card: route.params.customer_card,
    }),
  },
  {
    path: "/profile/:searchQuery", // unknown how to code this at this time
    name: "resultPage",
    component: ResultPage,
    props: (route) => ({ card_no: route.params.card_no }),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
