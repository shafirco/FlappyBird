const { Pool } = require("pg");

let pool = null;

function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) return null;
    pool = new Pool({
      connectionString: url,
      ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function connectPg() {
  const p = getPool();
  if (!p) {
    console.warn("DATABASE_URL not set — using JSON file for scores");
    return;
  }
  try {
    const client = await p.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        score INTEGER NOT NULL CHECK (score >= 0),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_scores_score ON scores (score DESC);
    `);
    client.release();
    console.log("PostgreSQL connected");
  } catch (e) {
    console.error("PostgreSQL connection failed:", e.message);
    throw e;
  }
}

module.exports = { getPool, connectPg };
