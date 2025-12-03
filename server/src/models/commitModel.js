import pool from '../config/database.js';

export const createOrUpdateCommit = async (repoId, commitDate, commitCount) => {
  const result = await pool.query(
    `INSERT INTO commits (repo_id, commit_date, commit_count)
     VALUES ($1, $2, $3)
     ON CONFLICT (repo_id, commit_date)
     DO UPDATE SET
       commit_count = EXCLUDED.commit_count,
       last_fetched = CURRENT_TIMESTAMP
     RETURNING *`,
    [repoId, commitDate, commitCount]
  );

  return result.rows[0];
};

export const getCommitsByRepoId = async (repoId) => {
  const result = await pool.query(
    'SELECT commit_date, commit_count FROM commits WHERE repo_id = $1 ORDER BY commit_date ASC',
    [repoId]
  );
  return result.rows;
};

export const getCommitsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT sr.id as repo_id, sr.repo_full_name, c.commit_date, c.commit_count
     FROM starred_repositories sr
     LEFT JOIN commits c ON sr.id = c.repo_id
     WHERE sr.user_id = $1
     ORDER BY sr.repo_full_name, c.commit_date ASC`,
    [userId]
  );
  return result.rows;
};
