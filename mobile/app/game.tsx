import { useEffect, useRef, useState } from "react";
import { ImageBackground, Pressable, StyleSheet } from "react-native";

import { GameBird } from "../src/components/GameBird";
import { GamePipes } from "../src/components/GamePipes";
import { GameGround } from "../src/components/GameGround";
import { GameOverlay } from "../src/components/GameOverlay";
import { DeathParticles } from "../src/components/DeathParticles";
import { FlashOverlay } from "../src/components/FlashOverlay";
import { CountdownOverlay } from "../src/components/CountdownOverlay";
import { BackgroundPhase } from "../src/components/BackgroundPhase";
import { NamePromptOverlay } from "../src/components/NamePromptOverlay";

import {
  BIRD_SIZE,
  BIRD_X,
  FLOOR_Y,
  INITIAL_BIRD_Y,
  JUMP_FORCE,
  PIPE_GAP,
  PIPE_WIDTH,
} from "../src/game/constants";
import { createInitialPipes } from "../src/game/utils";
import type { Pipe } from "../src/game/types";
import { useGameLoop } from "../src/game/useGameLoop";
import {
  initGameSound,
  playFlapSound,
  playPointSound,
  disposeGameSound,
  setSfxMuted,
  setBgMuted,
  startBackgroundMusic,
  pauseBackgroundMusic,
  getSfxMuted,
  getBgMuted,
} from "../src/services/sound";
import { addHighScore, getHighScores, type HighScoreEntry } from "../src/services/highScores";
import {
  fetchLeaderboard,
  getApiBase,
  submitToLeaderboard,
  type LeaderboardEntry,
} from "../src/services/leaderboardApi";

const BACKGROUND_IMAGE = require("../assets/images/background.png");

export default function GameScreen() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [birdY, setBirdY] = useState(INITIAL_BIRD_Y);
  const [pipes, setPipes] = useState<Pipe[]>(createInitialPipes());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [birdRotation, setBirdRotation] = useState(0);
  const [groundOffset, setGroundOffset] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [pressCharge, setPressCharge] = useState(0);
  const [squishTrigger, setSquishTrigger] = useState(0);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sfxMuted, setSfxMutedState] = useState<boolean>(getSfxMuted());
  const [bgMuted, setBgMutedState] = useState<boolean>(getBgMuted());

  const scoreRef = useRef(0);
  const prevScoreRef = useRef(0);
  const submittedScoreRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  scoreRef.current = score;

  function loadLeaderboard() {
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    fetchLeaderboard()
      .then(setGlobalLeaderboard)
      .catch((e) => {
        setGlobalLeaderboard([]);
        setLeaderboardError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => setLoadingLeaderboard(false));
  }

  useEffect(() => {
    initGameSound();
    getHighScores().then(setHighScores);
    loadLeaderboard();
    return () => disposeGameSound();
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver && !bgMuted) {
      startBackgroundMusic();
    } else {
      pauseBackgroundMusic();
    }
  }, [gameStarted, gameOver, bgMuted]);

  useEffect(() => {
    if (gameOver) loadLeaderboard();
  }, [gameOver]);

  useEffect(() => {
    if (score > prevScoreRef.current) {
      playPointSound(score);
      prevScoreRef.current = score;
    }
  }, [score]);

  useEffect(() => {
    if (gameOver && score > 0) {
      addHighScore(score).then(setHighScores);
    }
  }, [gameOver, score]);

  useEffect(() => {
    if (!gameOver || score <= 0 || !playerName) return;
    if (submittedScoreRef.current === score) return;
    submittedScoreRef.current = score;
    submitToLeaderboard(playerName, score)
      .then((scores) => {
        setGlobalLeaderboard(scores);
        setSubmitError(null);
      })
      .catch((e) => {
        setSubmitError(e instanceof Error ? e.message : "Failed to submit");
      });
  }, [gameOver, score, playerName]);

  useGameLoop({
    gameStarted,
    gameOver,
    isPressing,
    scoreRef,
    setBirdY,
    setBirdRotation,
    setPipes,
    setScore,
    setGameOver,
    setGroundOffset,
  });

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const birdTop = birdY;
    const birdBottom = birdY + BIRD_SIZE;
    const birdLeft = BIRD_X;
    const birdRight = BIRD_X + BIRD_SIZE;

    const hasCollision = pipes.some((pipe) => {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;
      if (birdRight <= pipeLeft || birdLeft >= pipeRight) return false;
      const hitsTop = birdTop < pipe.height;
      const hitsBottom = birdBottom > pipe.height + PIPE_GAP;
      return hitsTop || hitsBottom;
    });

    if (hasCollision) {
      setGameOver(true);
      setBirdRotation(90);
    }
  }, [birdY, pipes, gameOver, gameStarted]);

  function applyJump(force: number) {
    setBirdY((prev) => Math.max(0, prev - force));
    setBirdRotation(-25);
    setSquishTrigger((t) => t + 1);
  }

  function stopHoldCharge() {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }

  function handlePressIn() {
    if (gameOver || !gameStarted || !playerName) return;
    setIsPressing(true);
    setPressCharge(0);
    applyJump(JUMP_FORCE);
    playFlapSound();
    stopHoldCharge();
    holdIntervalRef.current = setInterval(() => {
      setPressCharge((p) => Math.min(p + 1, 12));
    }, 60);
  }

  function handlePressOut() {
    if (gameOver || !gameStarted || !playerName) return;
    setIsPressing(false);
    stopHoldCharge();
    if (pressCharge > 0) {
      applyJump(pressCharge * 3.2);
      playFlapSound();
    }
    setPressCharge(0);
  }

  function restartGame() {
    stopHoldCharge();
    setBirdY(INITIAL_BIRD_Y);
    setPipes(createInitialPipes());
    setScore(0);
    setGameOver(false);
    setBirdRotation(0);
    setGroundOffset(0);
    setPressCharge(0);
    setIsPressing(false);
    setSquishTrigger(0);
    setSubmitError(null);
    setLeaderboardError(null);
    submittedScoreRef.current = null;
    prevScoreRef.current = 0;
    getHighScores().then(setHighScores);
  }

  async function toggleSfx() {
    const next = !sfxMuted;
    setSfxMutedState(next);
    await setSfxMuted(next);
  }

  async function toggleBg() {
    const next = !bgMuted;
    setBgMutedState(next);
    await setBgMuted(next);
  }

  return (
    <Pressable
      style={styles.container}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <ImageBackground
        source={BACKGROUND_IMAGE}
        style={styles.background}
        resizeMode="cover"
      >
        <BackgroundPhase score={score} />
        <GamePipes pipes={pipes} />
        <GameBird
          birdY={birdY}
          birdRotation={birdRotation}
          squishTrigger={squishTrigger}
          gameOver={gameOver}
        />
        <GameGround offset={groundOffset} />
        <DeathParticles active={gameOver} birdY={birdY} />
        <FlashOverlay trigger={gameOver} />
        <GameOverlay
          score={score}
          gameOver={gameOver}
          highScores={highScores}
          globalLeaderboard={globalLeaderboard}
          loadingLeaderboard={loadingLeaderboard}
          apiBase={getApiBase()}
          leaderboardError={leaderboardError}
          onRefreshLeaderboard={loadLeaderboard}
          submitError={submitError}
          playerName={playerName}
          sfxMuted={sfxMuted}
          bgMuted={bgMuted}
          onToggleSfx={toggleSfx}
          onToggleBg={toggleBg}
          onRestart={restartGame}
        />
      </ImageBackground>
      {!playerName && (
        <NamePromptOverlay
          onSubmit={(name) => {
            setPlayerName(name);
            setGameStarted(false);
          }}
        />
      )}
      {!gameStarted && playerName && (
        <CountdownOverlay onFinish={() => setGameStarted(true)} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
