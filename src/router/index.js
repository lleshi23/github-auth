import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
