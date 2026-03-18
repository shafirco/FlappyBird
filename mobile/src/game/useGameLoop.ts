import React, { useEffect, useRef } from "react";
import {
  BIRD_X,
  FLOOR_Y,
  GRAVITY,
  getPipeSpeed,
  HOLD_LIFT_PER_FRAME,
  PIPE_SPACING,
  PIPE_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "./constants";
import { getNextPipeId, randomHeight } from "./utils";
import type { Pipe } from "./types";

type GameLoopParams = {
  gameStarted: boolean;
  gameOver: boolean;
  isPressing: boolean;
  scoreRef: React.MutableRefObject<number>;
  setBirdY: (fn: (prev: number) => number) => void;
  setBirdRotation: (fn: (prev: number) => number) => void;
  setPipes: (fn: (prev: Pipe[]) => Pipe[]) => void;
  setScore: (fn: (prev: number) => number) => void;
  setGameOver: (v: boolean) => void;
  setGroundOffset: (fn: (prev: number) => number) => void;
};

export function useGameLoop({
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
}: GameLoopParams): void {
  const isPressingRef = useRef(false);
  isPressingRef.current = isPressing;

  useEffect(() => {
    function loop() {
      if (!gameStarted || gameOver) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }
      const pipeSpeed = getPipeSpeed(scoreRef.current);
        setBirdY((prevBirdY) => {
          if (prevBirdY >= FLOOR_Y) {
            setGameOver(true);
            setBirdRotation(() => 90);
            return FLOOR_Y;
          }
          let next = prevBirdY + GRAVITY;
          if (isPressingRef.current) {
            next -= HOLD_LIFT_PER_FRAME;
            if (next < 0) next = 0;
          }
          return next;
        });

        setBirdRotation((prev) => Math.min(prev + 2, 90));

        setGroundOffset((prev) => {
          const next = prev - pipeSpeed * 2;
          if (next <= -SCREEN_WIDTH) return 0;
          return next;
        });

        setPipes((prevPipes) => {
          const maxX = Math.max(...prevPipes.map((p) => p.x));
          let scoreAddedThisFrame = false;

          const updatedPipes = prevPipes.map((pipe) => {
            const newX = pipe.x - pipeSpeed;

            if (newX < -PIPE_WIDTH) {
              return {
                id: getNextPipeId(),
                x: maxX + PIPE_SPACING,
                height: randomHeight(),
                passed: false,
              };
            }

            const pipeRight = newX + PIPE_WIDTH;
            const birdPassedPipe = pipeRight < BIRD_X;

            if (!pipe.passed && birdPassedPipe) {
              scoreAddedThisFrame = true;
              return { ...pipe, x: newX, passed: true };
            }

            return { ...pipe, x: newX };
          });

          if (scoreAddedThisFrame) {
            setScore((prev) => prev + 1);
          }

          return updatedPipes;
        });

      frameRef.current = requestAnimationFrame(loop);
    }

    const frameRef = { current: null as number | null };
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [
    gameStarted,
    gameOver,
    scoreRef,
    setBirdY,
    setBirdRotation,
    setPipes,
    setScore,
    setGameOver,
    setGroundOffset,
  ]);
}
