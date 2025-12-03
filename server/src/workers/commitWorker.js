import Bull from "bull";
import pool from "../config/database.js";
import { getRepositoryCommits } from "../services/githubService.js";
import { createOrUpdateCommit } from "../models/commitModel.js";

const commitQueue = new Bull("commit-fetch", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

commitQueue.process(async (job) => {
  const { repoId, userId, repoFullName, repoOwner, repoName } = job.data;

  try {
    const userResult = await pool.query(
      "SELECT access_token FROM users WHERE id = $1",
      [userId],
    );

    if (!userResult.rows[0]) {
      throw new Error("User not found");
    }

    const accessToken = userResult.rows[0].access_token;

    // Fetch commits from GitHub
    let page = 1;
    let allCommits = [];
    let hasMore = true;

    while (hasMore && page <= 10) {
      // Limit to 10 fetches
      const commits = await getRepositoryCommits(
        accessToken,
        repoOwner,
        repoName,
        page,
      );

      if (commits.length === 0) {
        hasMore = false;
      } else {
        allCommits = allCommits.concat(commits);
        page++;

        if (commits.length < 100) {
          hasMore = false;
        }
      }

      // Add small delay for the next fetch
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    const commitsByDate = {};

    allCommits.forEach((commit) => {
      const commitDate = commit.commit.author.date.split("T")[0]; // Get YYYY-MM-DD

      if (!commitsByDate[commitDate]) {
        commitsByDate[commitDate] = 0;
      }

      commitsByDate[commitDate]++;
    });

    // Store in database
    for (const [date, count] of Object.entries(commitsByDate)) {
      await createOrUpdateCommit(repoId, date, count);
    }

    return {
      repoId,
      repoFullName,
      totalCommits: allCommits.length,
      uniqueDates: Object.keys(commitsByDate).length,
    };
  } catch (error) {
    console.error(
      `Error processing commits for ${repoFullName}:`,
      error.message,
    );
    throw error;
  }
});

commitQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

commitQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

export const queueCommitFetchJob = async (jobData) => {
  try {
    const job = await commitQueue.add(jobData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    return job;
  } catch (error) {
    console.error("Error queuing job:", error);
    throw error;
  }
};
