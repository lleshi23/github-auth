import pool from "../config/database.js";

export const getStarredReposByUserId = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM starred_repositories WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return result.rows;
};

export const createOrUpdateStarredRepo = async (userId, repoData) => {
  const {
    github_repo_id,
    repo_name,
    repo_owner,
    repo_full_name,
    description,
    stars_count,
  } = repoData;

  const result = await pool.query(
    `INSERT INTO starred_repositories
     (user_id, github_repo_id, repo_name, repo_owner, repo_full_name, description, stars_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id, github_repo_id)
     DO UPDATE SET
       repo_name = EXCLUDED.repo_name,
       repo_owner = EXCLUDED.repo_owner,
       description = EXCLUDED.description,
       stars_count = EXCLUDED.stars_count,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      userId,
      github_repo_id,
      repo_name,
      repo_owner,
      repo_full_name,
      description,
      stars_count,
    ],
  );

  return result.rows[0];
};

export const deleteStarredReposNotInList = async (userId, githubRepoIds) => {
  if (githubRepoIds.length === 0) {
    await pool.query("DELETE FROM starred_repositories WHERE user_id = $1", [
      userId,
    ]);
    return;
  }

  await pool.query(
    "DELETE FROM starred_repositories WHERE user_id = $1 AND github_repo_id != ALL($2)",
    [userId, githubRepoIds],
  );
};
