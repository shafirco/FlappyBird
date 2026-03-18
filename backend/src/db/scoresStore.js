const fs = require("fs");
const path = require("path");
const { getPool } = require("./pg");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const FILE_PATH = path.join(DATA_DIR, "scores.json");
const MAX_ENTRIES = 100;
const TOP_N = 20;

function usePg() {
  return !!process.env.DATABASE_URL && getPool();
}

// ——— JSON fallback (when no DATABASE_URL) ———
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readScoresFile() {
  ensureDir();
  if (!fs.existsSync(FILE_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeScoresFile(scores) {
  ensureDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(scores, null, 0), "utf8");
}

function getTopScoresFile() {
  const scores = readScoresFile()
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);
  return scores.map((e, i) => ({ rank: i + 1, name: e.name, score: e.score, date: e.date || Date.now() }));
}

function addScoreFile(name, score) {
  const nameStr = String(name || "Player").trim().slice(0, 20);
  const scoreNum = Math.max(0, Math.floor(Number(score) || 0));
  const scores = readScoresFile();
  scores.push({ name: nameStr || "Player", score: scoreNum, date: Date.now() });
  const sorted = scores.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
  writeScoresFile(sorted);
  return getTopScoresFile();
}

// ——— PostgreSQL ———
async function getTopScoresPg() {
  const p = getPool();
  const res = await p.query(
    `SELECT name, score, EXTRACT(EPOCH FROM created_at)::bigint * 1000 AS date
     FROM scores ORDER BY score DESC LIMIT $1`,
    [TOP_N]
  );
  return res.rows.map((row, i) => ({
    rank: i + 1,
    name: row.name,
    score: row.score,
    date: Number(row.date) || Date.now(),
  }));
}

async function addScorePg(name, score) {
  const nameStr = String(name || "Player").trim().slice(0, 20);
  const scoreNum = Math.max(0, Math.floor(Number(score) || 0));
  const p = getPool();
  await p.query("INSERT INTO scores (name, score) VALUES ($1, $2)", [nameStr || "Player", scoreNum]);
  await p.query(
    `WITH top AS (SELECT id FROM scores ORDER BY score DESC LIMIT $1)
     DELETE FROM scores WHERE id NOT IN (SELECT id FROM top)`,
    [MAX_ENTRIES]
  );
  return getTopScoresPg();
}

// ——— Public API ———
async function getTopScores() {
  if (usePg()) return getTopScoresPg();
  return getTopScoresFile();
}

async function addScore(name, score) {
  if (usePg()) return addScorePg(name, score);
  return addScoreFile(name, score);
}

module.exports = { getTopScores, addScore };
