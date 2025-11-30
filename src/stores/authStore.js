import { defineStore } from "pinia";
import { authApi } from "@/services/api.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),

  actions: {
    async login() {
      await authApi.login();
    },

    async fetchCurrentUser() {
      this.isLoading = true;
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
      } finally {
        this.isLoading = false;
      }
    },
  },
});
