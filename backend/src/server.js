require("dotenv").config();
const express = require("express");
const cors = require("cors");
const scoresRouter = require("./routes/scores");
const { connectPg } = require("./db/pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/scores", scoresRouter);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

async function start() {
  if (process.env.DATABASE_URL) {
    await connectPg();
  }
  app.listen(PORT, () => {
    console.log(`Flappy leaderboard API on port ${PORT}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
