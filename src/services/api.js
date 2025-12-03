import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth endpoints
export const authApi = {
  login: () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },
  getCurrentUser: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Repository endpoints
export const repositoryApi = {
  getStarredRepos: () => api.get("/repositories/starred"),

  getAllCommits: () => api.get("/repositories/commits"),
};
