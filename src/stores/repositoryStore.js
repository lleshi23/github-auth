import { defineStore } from "pinia";
import { repositoryApi } from "../services/api";

export const useRepositoryStore = defineStore("repository", {
  state: () => ({
    starredRepos: [],
    commits: [],
    error: null,
  }),

  actions: {
    async fetchStarredRepos() {
      this.error = null;

      try {
        const response = await repositoryApi.getStarredRepos();
        this.starredRepos = response.data;
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.error || "Failed to fetch starred repositories";
        throw error;
      }
    },

    async fetchAllCommits() {
      this.error = null;

      try {
        const response = await repositoryApi.getAllCommits();
        this.commits = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to fetch commits";
        throw error;
      }
    },
  },

  getters: {
    reposWithCommits: (state) => {
      return state.commits.filter((repo) => repo.commits);
    },
  },
});
