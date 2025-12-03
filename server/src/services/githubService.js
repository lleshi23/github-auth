import axios from "axios";

const GITHUB_API_BASE = "https://api.github.com";

export const getAccessToken = async (code) => {
  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to get access token from GitHub");
  }
};

export const getGitHubUser = async (accessToken) => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching GitHub user:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to fetch user from GitHub");
  }
};

export const getStarredRepositories = async (accessToken, username) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/users/${username}/starred`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          per_page: 100, // Fetch up to 100 starred repos
        },
      },
    );

    return response.data.map((repo) => ({
      github_repo_id: repo.id.toString(),
      repo_name: repo.name,
      repo_owner: repo.owner.login,
      repo_full_name: repo.full_name,
      description: repo.description,
      stars_count: repo.stargazers_count,
    }));
  } catch (error) {
    console.error(
      "Error fetching starred repos:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to fetch starred repositories");
  }
};

export const getRepositoryCommits = async (
  accessToken,
  owner,
  repo,
  page = 1,
) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          per_page: 100,
          page,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      // Empty repository
      return [];
    }
    console.error(
      `Error fetching commits for ${owner}/${repo}:`,
      error.response?.data || error.message,
    );
    return [];
  }
};
