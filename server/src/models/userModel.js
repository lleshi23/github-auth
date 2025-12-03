import pool from "../config/database.js";

export const findUserByGithubId = async (githubId) => {
  const result = await pool.query("SELECT * FROM users WHERE github_id = $1", [
    githubId,
  ]);
  return result.rows[0];
};

export const createUser = async (userData) => {
  const { github_id, username, name, avatar_url, access_token } = userData;

  const result = await pool.query(
    `INSERT INTO users (github_id, username, name, avatar_url, access_token)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [github_id, username, name, avatar_url, access_token],
  );

  return result.rows[0];
};

export const updateUser = async (githubId, userData) => {
  const { username, name, avatar_url, access_token } = userData;

  const result = await pool.query(
    `UPDATE users
     SET username = $1, name = $2, avatar_url = $3, access_token = $4, updated_at = CURRENT_TIMESTAMP
     WHERE github_id = $5
     RETURNING *`,
    [username, name, avatar_url, access_token, githubId],
  );

  return result.rows[0];
};

export const findUserById = async (userId) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  return result.rows[0];
};
