import { BIRD_X, PIPE_WIDTH } from "./constants";

export function shouldIncreaseScore(
  pipeX: number,
  passedPipe: boolean
) {
  if (!passedPipe && pipeX + PIPE_WIDTH < BIRD_X) {
    return true;
  }

  return false;
}