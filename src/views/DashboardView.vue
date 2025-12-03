<template>
  <div class="min-h-screen bg-gray-100">
    <header
      class="bg-white border-b-gray-200 border-b py-4 sticky top-0 z-99 shadow"
    >
      <div
        class="flex w-full justify-between items-center px-6 m-auto max-w-[1200px]"
      >
        <h1 class="text-2xl font-bold">GitHub Profile Dashboard</h1>
        <button
          @click="handleLogout"
          class="py-2 px-5 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-red-100 text-red-600 hover:bg-red-200 focus:outline-hidden focus:bg-red-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Logout
        </button>
      </div>
    </header>

    <main class="max-w-[1200px] m-auto p-7">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-16">
        <div class="spinner" />
        <p>Loading your data...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center text-center font-bold p-5 text-red-500 gap-4"
      >
        <p>{{ error }}</p>
        <button
          @click="loadData"
          class="py-2 px-5 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-hidden focus:bg-blue-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Retry
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- User Profile Section -->
        <section class="bg-white rounded-xl p-8 mb-8 shadow">
          <!-- Profile Info -->
          <div class="flex items-center gap-6 mb-8">
            <img
              v-if="authStore.user?.avatar_url"
              :src="authStore.user.avatar_url"
              :alt="authStore.user.name"
              class="size-20 rounded-full border-3 border-blue-500"
            />
            <div>
              <h2 class="text-3xl font-bold mb-1">
                {{ authStore.user?.name || "GitHub User" }}
              </h2>
              <p class="text-gray-500">@{{ authStore.user?.username }}</p>
            </div>
          </div>

          <!-- Profile Stats -->
          <div class="grid grid-cols-2 gap-5">
            <div
              class="p-7 rounded-xl text-white text-center bg-gradient-to-br from-[#667eea] to-[#764BA2FF]"
            >
              <h3 class="text-4xl font-bold mb-4">
                {{ repoStore.starredRepos.length }}
              </h3>
              <p class="text-sm">Starred Repos</p>
            </div>
            <div
              class="p-7 rounded-xl text-white text-center bg-gradient-to-br from-[#667eea] to-[#764BA2FF]"
            >
              <h3 class="text-4xl font-bold mb-4">
                {{ repoStore.reposWithCommits.length }}
              </h3>
              <p class="text-sm">With Commit Data</p>
            </div>
          </div>
        </section>

        <!-- Starred Repositories Section -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-2">Your Starred Repositories</h2>

          <div
            v-if="repoStore.starredRepos.length === 0"
            class="bg-white p-15 text-center rounded-xl text-gray-500"
          >
            <p>You haven't starred any repositories yet.</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div
              v-for="repo in repoStore.starredRepos"
              :key="repo.id"
              class="bg-white rounded-xl p-6 shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-semibold">
                  {{ repo.repo_name }}
                </h3>
                <span class="text-amber-500 font-semibold whitespace-nowrap"
                  >★ {{ repo.stars_count }}</span
                >
              </div>
              <p class="text-sm text-blue-400 mb-3">
                {{ repo.repo_owner }}
              </p>
              <p class="text-sm text-gray-400 mb-4 min-h-20">
                {{ repo.description || "No description available" }}
              </p>
              <div class="repo-footer">
                <a
                  :href="`https://github.com/${repo.repo_full_name}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm font-semibold transition-colors duration-300 text-blue-400 hover:text-blue-600"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Commit Visualization Section -->
        <section class="mb-8" v-if="repoStore.reposWithCommits.length > 0">
          <h2 class="text-2xl font-bold mb-2">Commit Statistics</h2>
          <p class="text-sm mb-6 text-gray-400">
            Commits per day for your starred repositories
          </p>

          <div class="grid gap-8 overflow-scroll">
            <CommitChart
              v-for="repoCommits in repoStore.reposWithCommits"
              :key="repoCommits.repoId"
              :repo-name="repoCommits.repoFullName"
              :commits="repoCommits.commits"
            />
          </div>
        </section>

        <section class="mb-8" v-else>
          <div class="bg-white p-10 rounded-xl text-center shadow">
            <h3 class="text-xl mb-3 font-bold">Fetching Commit Data</h3>
            <p class="text-sm text-gray-500">
              Commit data is being processed in the background. This may take a
              few minutes depending on the number of starred repositories.
              Please refresh the page shortly.
            </p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { useRepositoryStore } from "../stores/repositoryStore";
import CommitChart from "../components/charts/CommitChart.vue";

const router = useRouter();
const authStore = useAuthStore();
const repoStore = useRepositoryStore();

const isLoading = ref(true);
const error = ref(null);

const loadData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    await Promise.all([
      repoStore.fetchStarredRepos(),
      repoStore.fetchAllCommits(),
    ]);
  } catch (err) {
    error.value = err.response?.data?.error || "Failed to load dashboard data";
  } finally {
    isLoading.value = false;
  }
};

const handleLogout = async () => {
  await authStore.logout();
  await router.push("/");
};

onMounted(() => {
  loadData();
});
</script>
