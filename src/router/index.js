import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import DashboardView from "@/views/DashboardView.vue";
import { useAuthStore } from "@/stores/authStore.js";

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      try {
        await authStore.fetchCurrentUser();
        next();
      } catch (error) {
        next("/");
      }
    } else {
      next();
    }
  } else {
    // If user is already authenticated and tries to access login page, redirect to dashboard
    if (to.name === "login" && authStore.isAuthenticated) {
      next("/dashboard");
    } else {
      next();
    }
  }
});

export default router;
