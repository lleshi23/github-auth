import { getStarredReposByUserId } from "../models/repositoryModel.js";
import {
  getCommitsByRepoId,
  getCommitsByUserId,
} from "../models/commitModel.js";

export const getStarredRepositories = async (req, res) => {
  try {
    const { userId } = req.user;
    const repos = await getStarredReposByUserId(userId);

    res.json(repos);
  } catch (error) {
    console.error("Get starred repositories error:", error);
    res.status(500).json({ error: "Failed to fetch starred repositories" });
  }
};

export const getRepositoryCommits = async (req, res) => {
  try {
    const { repoId } = req.params;
    const commits = await getCommitsByRepoId(repoId);

    res.json(commits);
  } catch (error) {
    console.error("Get repository commits error:", error);
    res.status(500).json({ error: "Failed to fetch repository commits" });
  }
};

export const getAllCommits = async (req, res) => {
  try {
    const { userId } = req.user;
    const commits = await getCommitsByUserId(userId);

    // Group commits by repository
    const groupedCommits = commits.reduce((accumulator, commit) => {
      if (!accumulator[commit.repo_full_name]) {
        accumulator[commit.repo_full_name] = {
          repoId: commit.repo_id,
          repoFullName: commit.repo_full_name,
          commits: [],
        };
      }

      if (commit.commit_date) {
        accumulator[commit.repo_full_name].commits.push({
          date: commit.commit_date,
          count: commit.commit_count,
        });
      }

      return accumulator;
    }, {});

    res.json(Object.values(groupedCommits));
  } catch (error) {
    console.error("Get all commits error:", error);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
};
