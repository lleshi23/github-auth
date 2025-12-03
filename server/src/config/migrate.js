import pool from "./database.js";

const migrations = [
  // Migration 1: Create users table
  `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      github_id VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      avatar_url TEXT,
      access_token TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Migration 2: Create starred_repositories table
  `
    CREATE TABLE IF NOT EXISTS starred_repositories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      github_repo_id VARCHAR(255) NOT NULL,
      repo_name VARCHAR(255) NOT NULL,
      repo_owner VARCHAR(255) NOT NULL,
      repo_full_name VARCHAR(512) NOT NULL,
      description TEXT,
      stars_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, github_repo_id)
    );
  `,

  // Migration 3: Create commits table
  `
    CREATE TABLE IF NOT EXISTS commits (
      id SERIAL PRIMARY KEY,
      repo_id INTEGER NOT NULL REFERENCES starred_repositories(id) ON DELETE CASCADE,
      commit_date DATE NOT NULL,
      commit_count INTEGER DEFAULT 0,
      last_fetched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(repo_id, commit_date)
    );
  `,

  // Migration 4: Create indexes for the tables
  `
    CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
    CREATE INDEX IF NOT EXISTS idx_starred_repos_user_id ON starred_repositories(user_id);
    CREATE INDEX IF NOT EXISTS idx_commits_repo_id ON commits(repo_id);
    CREATE INDEX IF NOT EXISTS idx_commits_date ON commits(commit_date);
  `,
];

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log("Starting database migrations...");

    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}/${migrations.length}...`);
      await client.query(migrations[i]);
      console.log(`Migration ${i + 1} completed successfully.`);
    }

    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
