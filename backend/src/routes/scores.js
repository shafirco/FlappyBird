const express = require("express");
const { getLeaderboard, submitScore } = require("../controllers/scoresController");

const router = express.Router();

router.get("/", getLeaderboard);
router.post("/", submitScore);

module.exports = router;
