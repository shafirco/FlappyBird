import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const BIRD_SIZE = 42;
export const BIRD_X = 80;

export const PIPE_WIDTH = 80;
export const PIPE_GAP = 210;
export const PIPE_SPACING = 320;
export const PIPE_SPEED_BASE = 2.5;
export const PIPE_SPEED_MAX = 5.2;
export const PIPE_SPEED_INC_PER_POINT = 0.12;

export function getPipeSpeed(score: number): number {
  const s = PIPE_SPEED_BASE + score * PIPE_SPEED_INC_PER_POINT;
  return Math.min(s, PIPE_SPEED_MAX);
}

export const GRAVITY = 4.2;
/** Base jump on tap */
export const JUMP_FORCE = 98;
/** Extra upward force per frame while holding (hold to fly higher) */
export const HOLD_LIFT_PER_FRAME = 3.8;
/** Max upward speed cap while holding */
export const HOLD_MAX_LIFT = 18;

export const FLOOR_HEIGHT = 110;
export const FLOOR_Y = SCREEN_HEIGHT - FLOOR_HEIGHT - BIRD_SIZE;

export const INITIAL_BIRD_Y = SCREEN_HEIGHT / 2;
export const INITIAL_PIPE_X = SCREEN_WIDTH + 100;

/** Background phase: 0–4 day, 5–9 sunset, 10+ night */
export const PHASE_SUNSET = 5;
export const PHASE_NIGHT = 10;

/** Medals by score (end of game) */
export const MEDAL_BRONZE = 0;
export const MEDAL_SILVER = 5;
export const MEDAL_GOLD = 10;
export const MEDAL_PLATINUM = 20;
