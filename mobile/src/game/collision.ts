import { BIRD_SIZE, BIRD_X, PIPE_WIDTH } from "./constants";

export function checkCollision(
  birdY: number,
  pipeX: number,
  pipeHeight: number
) {
  const birdTop = birdY;
  const birdBottom = birdY + BIRD_SIZE;

  const birdLeft = BIRD_X;
  const birdRight = BIRD_X + BIRD_SIZE;

  const pipeLeft = pipeX;
  const pipeRight = pipeX + PIPE_WIDTH;

  const hitPipe =
    birdRight > pipeLeft &&
    birdLeft < pipeRight &&
    (birdTop < pipeHeight || birdBottom > pipeHeight + 210);

  return hitPipe;
}