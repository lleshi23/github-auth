import { defineStore } from "pinia";
import { authApi } from "@/services/api.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    error: null,
  }),

  actions: {
    async login() {
      await authApi.login();
    },

    async fetchCurrentUser() {
      this.error = null;

      try {
        const response = await authApi.getCurrentUser();
        this.user = response.data;
        this.isAuthenticated = true;
        return response.data;
      } catch (error) {
        this.isAuthenticated = false;
        this.user = null;
        this.error = error.response?.data?.error || "Failed to fetch user";
        throw error;
      }
    },

    async logout() {
      try {
        await authApi.logout();
        this.user = null;
        this.isAuthenticated = false;
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
});
