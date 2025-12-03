<script setup>
import IconGithub from "@/components/icons/IconGithub.vue";
import { authApi } from "@/services/api.js";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const errorMessage = ref("");

onMounted(() => {
  // Check for error in URL query params
  if (route.query.error) {
    const errors = {
      no_code: "No authorization code received from GitHub",
      auth_failed: "Authentication failed. Please try again.",
    };
    errorMessage.value =
      errors[route.query.error] || "An error occurred during authentication";
  }

  // Check if already authenticated
  authApi
    .getCurrentUser()
    .then(() => {
      router.push("/dashboard");
    })
    .catch(() => {
      // User not authenticated, stay on login page
      console.log("User not authenticated");
    });
});

const handleLogin = () => {
  authApi.login();
};
</script>

<template>
  <div
    class="flex items-center justify-center p-5 min-h-screen bg-gradient-to-br from-[#667eea] to-[#764BA2FF]"
  >
    <div
      class="flex flex-col gap-2 bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full"
    >
      <div class="flex items-center justify-center text-gray-900">
        <IconGithub />
      </div>

      <h1 class="text-2xl font-bold">GitHub Auth App</h1>
      <p class="text-sm text-gray-500">
        View your starred repositories and commit statistics
      </p>
      <button
        @click="handleLogin"
        class="flex w-full py-4 px-6 mt-4 items-center justify-center gap-2 bg-gray-900 text-white rounded-lg text-sm font-bold transition-all duration-300 hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-gray-300 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
      >
        <IconGithub class="w-5 h-5" />
        Sign in with GitHub
      </button>

      <p
        class="mt-4 text-red-400 p-3 bg-red-100 rounded-md"
        v-if="errorMessage"
      >
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>
