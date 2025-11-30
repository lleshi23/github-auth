<script setup>
import IconGithub from "@/components/icons/IconGithub.vue";
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
        @click="console.log('login')"
        class="flex w-full py-4 px-6 mt-4 items-center justify-center gap-2 bg-gray-900 text-white rounded-lg text-sm font-bold github-login-btn"
      >
        <IconGithub class="w-5 h-5" />
        Sign in with GitHub
      </button>
    </div>
  </div>
</template>

<style scoped>
.github-login-btn {
  transition: all 0.3s ease;
}

.github-login-btn:hover {
  background: #1a1e22;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.github-login-btn:active {
  transform: translateY(0);
}
</style>
