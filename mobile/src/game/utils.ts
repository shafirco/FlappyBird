import { INITIAL_PIPE_X, PIPE_SPACING } from "./constants";
import type { Pipe } from "./types";

let pipeId = 0;

export function getNextPipeId(): number {
  return ++pipeId;
}

export function randomHeight(): number {
  return Math.random() * 220 + 120;
}

export function createInitialPipes(): Pipe[] {
  return [
    { id: getNextPipeId(), x: INITIAL_PIPE_X, height: randomHeight(), passed: false },
    { id: getNextPipeId(), x: INITIAL_PIPE_X + PIPE_SPACING, height: randomHeight(), passed: false },
    {
      id: getNextPipeId(),
      x: INITIAL_PIPE_X + PIPE_SPACING * 2,
      height: randomHeight(),
      passed: false,
    },
  ];
}
