const { getTopScores, addScore } = require("../db/scoresStore");

async function getLeaderboard(req, res) {
  try {
    const top = await getTopScores();
    res.json({ scores: top });
  } catch (e) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
}

async function submitScore(req, res) {
  const { name, score } = req.body || {};
  if (score == null || (typeof score !== "number" && isNaN(Number(score)))) {
    return res.status(400).json({ error: "score is required" });
  }
  try {
    const scores = await addScore(name, score);
    res.json({ scores });
  } catch (e) {
    res.status(500).json({ error: "Failed to save score" });
  }
}

module.exports = { getLeaderboard, submitScore };
