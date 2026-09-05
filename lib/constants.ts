export const GRID_SIZE = 15;
export const CELL_SIZE = 1;

/** Duración de la partida de contrarreloj (segundos). */
export const TIME_ATTACK_DURATION = 75;
export const TIME_ATTACK_PENALTY = 5;

/** Velocidad base: ms entre ticks.
 *  Se reduce (acelera) ligeramente con el puntaje. */
export const BASE_TICK_MS = 170;
export const MIN_TICK_MS = 70;
export const TICK_DECREMENT_PER_SCORE = 1.5;

/** Modo Reverso: cadencia de pérdida de segmentos. */
export const REVERSE_SHRINK_INTERVAL_MS = 3500;
export const REVERSE_MIN_LENGTH = 3;

/** Power-ups. */
export const POWERUP_SPAWN_INTERVAL_MIN_MS = 9000;
export const POWERUP_SPAWN_INTERVAL_MAX_MS = 15000;
export const POWERUP_LIFETIME_MS = 10000;
export const POWERUP_EFFECT_DURATION_MS = 7000;
export const MAGNET_RADIUS_CELLS = 3;
export const SPEED_MULTIPLIER = 0.7;
export const POWERUP_MAX_ACTIVE = 3;

/** Colores para la paleta minimalista (también usados en Tailwind). */
export const COLORS = {
  background: "#0f1115",
  surface: "#16181f",
  panel: "#1d2028",
  border: "#2a2e3a",
  primary: "#7CFC9B",
  accent: "#4FA8FF",
  danger: "#FF6B6B",
  snake: "#7CFC9B",
  snakeHead: "#A2FFC0",
  food: "#FF5C7A",
  speed: "#FFD166",
  magnet: "#C77DFF",
  double: "#4FA8FF",
  obstacle: "#3a3f4d",
  gridLine: "#20242e",
} as const;