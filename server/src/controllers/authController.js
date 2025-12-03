import dotenv from "dotenv";
import { generateToken } from "../utils/jwt.js";
import {
  getAccessToken,
  getGitHubUser,
  getStarredRepositories,
} from "../services/githubService.js";
import {
  createUser,
  findUserByGithubId,
  findUserById,
  updateUser,
} from "../models/userModel.js";
import {
  createOrUpdateStarredRepo,
  deleteStarredReposNotInList,
} from "../models/repositoryModel.js";
import { queueCommitFetchJob } from "../workers/commitWorker.js";

dotenv.config();

export const githubLogin = (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,repo`;
  res.redirect(githubAuthUrl);
};

export const githubCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const accessToken = await getAccessToken(code);

    // Get user info from GitHub
    const githubUser = await getGitHubUser(accessToken);

    // Find or create user in database
    let user = await findUserByGithubId(githubUser.id.toString());

    const userData = {
      github_id: githubUser.id.toString(),
      username: githubUser.login,
      name: githubUser.name || githubUser.login,
      avatar_url: githubUser.avatar_url,
      access_token: accessToken,
    };

    if (user) {
      user = await updateUser(githubUser.id.toString(), userData);
    } else {
      user = await createUser(userData);
    }

    // Fetch and store starred repositories
    const starredRepos = await getStarredRepositories(
      accessToken,
      githubUser.login,
    );
    const githubRepoIds = [];

    for (const repo of starredRepos) {
      const savedRepo = await createOrUpdateStarredRepo(user.id, repo);
      githubRepoIds.push(repo.github_repo_id);

      // Queue background job to fetch commits
      await queueCommitFetchJob({
        repoId: savedRepo.id,
        userId: user.id,
        repoFullName: repo.repo_full_name,
        repoOwner: repo.repo_owner,
        repoName: repo.repo_name,
      });
    }

    // Remove repos that are no longer starred
    await deleteStarredReposNotInList(user.id, githubRepoIds);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      githubId: user.github_id,
      username: user.username,
    });

    // Set cookie and redirect to frontend
    res.cookie("github-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("GitHub callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("github-auth-token");
  res.json({ message: "Logged out successfully" });
};
