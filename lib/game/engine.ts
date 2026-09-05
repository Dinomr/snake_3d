import {
  BASE_TICK_MS,
  GRID_SIZE,
  MAGNET_RADIUS_CELLS,
  MIN_TICK_MS,
  POWERUP_EFFECT_DURATION_MS,
  POWERUP_LIFETIME_MS,
  POWERUP_MAX_ACTIVE,
  POWERUP_SPAWN_INTERVAL_MAX_MS,
  POWERUP_SPAWN_INTERVAL_MIN_MS,
  REVERSE_MIN_LENGTH,
  REVERSE_SHRINK_INTERVAL_MS,
  TIME_ATTACK_DURATION,
  TIME_ATTACK_PENALTY,
  TICK_DECREMENT_PER_SCORE,
} from "@/lib/constants";
import type {
  Coordinate,
  Direction,
  GameMode,
  PowerUp,
  PowerUpType,
} from "@/lib/types";
import {
  applyBoundary,
  directionToDelta,
  isObstacleCollision,
  isOpposite,
  isSelfCollision,
  pointEquals,
  randomEmptyCell,
} from "@/lib/game/collisions";
import { generateObstacles } from "@/lib/game/maze";

export type GameOverReason =
  | "wall"
  | "obstacle"
  | "self"
  | "timeout"
  | "reverse_shrunk";

export type GameState = {
  mode: GameMode;
  snake: Coordinate[];
  previousSnake: Coordinate[];
  direction: Direction;
  pendingDirections: Direction[];
  food: Coordinate;
  obstacles: Coordinate[];
  powerUps: PowerUp[];
  activePowerUps: Record<PowerUpType, boolean>;
  powerUpsUntil: Record<PowerUpType, number>;
  score: number;
  length: number;
  foodEaten: number;
  round: number;
  nextPowerUpSpawnAt: number;
  nextReverseShrinkAt: number;
  timeLeft: number;
  startTime: number;
  scoreMultiplier: number;
  isOver: boolean;
  overReason: GameOverReason | null;
};

const POWER_UP_TYPES: PowerUpType[] = ["speed", "magnet", "double"];

/** Máximo de direcciones en cola pendientes de aplicar. */
export const MAX_QUEUED_DIRECTIONS = 3;

export function nextId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function spawnDelay(): number {
  return (
    POWERUP_SPAWN_INTERVAL_MIN_MS +
    Math.random() * (POWERUP_SPAWN_INTERVAL_MAX_MS - POWERUP_SPAWN_INTERVAL_MIN_MS)
  );
}

export function tickMs(score: number): number {
  return Math.max(MIN_TICK_MS, BASE_TICK_MS - score * TICK_DECREMENT_PER_SCORE);
}

export function initGame(mode: GameMode, round = 0): GameState {
  const center = Math.floor(GRID_SIZE / 2);
  const snake: Coordinate[] = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
  const obstacles = mode === "maze" ? generateObstacles(round) : [];
  const state: GameState = {
    mode,
    snake,
    previousSnake: snake.map((c) => ({ ...c })),
    direction: "right",
    pendingDirections: [],
    food: { x: center + 3, y: center },
    obstacles,
    powerUps: [],
    activePowerUps: { speed: false, magnet: false, double: false },
    powerUpsUntil: { speed: 0, magnet: 0, double: 0 },
    score: 0,
    length: snake.length,
    foodEaten: 0,
    round,
    nextPowerUpSpawnAt: performance.now() + spawnDelay(),
    nextReverseShrinkAt: performance.now() + REVERSE_SHRINK_INTERVAL_MS,
    timeLeft: TIME_ATTACK_DURATION,
    startTime: performance.now(),
    scoreMultiplier: 1,
    isOver: false,
    overReason: null,
  };

  const food = randomEmptyCell(snake, obstacles, []);
  if (food) state.food = food;
  return state;
}

/** Controla la caducidad de los efectos de power-ups. */
function refreshPowerUps(state: GameState, now: number): GameState {
  const active = { ...state.activePowerUps };
  const until = { ...state.powerUpsUntil };
  for (const type of POWER_UP_TYPES) {
    if (active[type] && now >= until[type]) {
      active[type] = false;
    }
  }
  state.activePowerUps = active;
  state.powerUpsUntil = until;
  state.scoreMultiplier = active.double ? 2 : 1;
  return state;
}

function spawnPowerUps(state: GameState, now: number): GameState {
  state.powerUps = state.powerUps.filter((p) => p.expiresAt > now);

  if (state.powerUps.length >= POWERUP_MAX_ACTIVE) return state;
  if (now < state.nextPowerUpSpawnAt) return state;

  const type = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
  const position = randomEmptyCell(state.snake, state.obstacles, state.powerUps);
  if (position) {
    state.powerUps.push({
      id: nextId(),
      type,
      position,
      spawnedAt: now,
      expiresAt: now + POWERUP_LIFETIME_MS,
    });
  }
  state.nextPowerUpSpawnAt = now + spawnDelay();
  return state;
}

function eatFood(state: GameState): void {
  state.foodEaten += 1;
  const multiplier = state.scoreMultiplier;
  state.score += Math.round(10 * multiplier);
}

/**
 * Un tick de juego. Devuelve el nuevo estado o una señal de game over.
 */
export function stepGame(
  state: GameState,
  now: number,
): { state: GameState } | { gameOver: true; reason: GameOverReason } {
  if (state.isOver) return { gameOver: true, reason: state.overReason ?? "self" };

  state = refreshPowerUps(state, now);

  // Aplica la primera dirección encolada que no invierta el sentido.
  // Las restantes se conservan para los siguientes ticks (permite giros rápidos).
  {
    let next = state.direction;
    const queue = state.pendingDirections;
    let i = 0;
    while (i < queue.length) {
      const candidate = queue[i];
      if (!isOpposite(candidate, next)) {
        next = candidate;
        queue.splice(i, 1);
        break;
      }
      i++;
    }
    state.direction = next;
    state.pendingDirections = queue.slice(0, MAX_QUEUED_DIRECTIONS);
  }

  // Cabeza candidata según dirección.
  const delta = directionToDelta(state.direction);
  let head: Coordinate = {
    x: state.snake[0].x + delta.x,
    y: state.snake[0].y + delta.y,
  };

  // Imán: la comida cercana se atrae un paso hacia la cabeza (eje con mayor delta).
  if (state.mode === "powerups" && state.activePowerUps.magnet) {
    const dx = state.food.x - state.snake[0].x;
    const dy = state.food.y - state.snake[0].y;
    if (Math.abs(dx) + Math.abs(dy) > 0 && Math.abs(dx) + Math.abs(dy) <= MAGNET_RADIUS_CELLS) {
      let target: Coordinate;
      if (Math.abs(dx) >= Math.abs(dy)) {
        target = { x: state.food.x - Math.sign(dx), y: state.food.y };
      } else {
        target = { x: state.food.x, y: state.food.y - Math.sign(dy) };
      }
      const occupied = state.snake.some((s) => s.x === target.x && s.y === target.y);
      if (!occupied && target.x >= 0 && target.x < GRID_SIZE && target.y >= 0 && target.y < GRID_SIZE) {
        state.food = target;
      }
    }
  }

  const boundary = applyBoundary(head, state.mode);
  head = boundary.position;

  // Comida.
  const ate = pointEquals(head, state.food);
  const grow = ate;
  if (ate) eatFood(state);

  // Colisión de pared (fuera de límites en modos que no son portales).
  if (boundary.collided) {
    state.isOver = true;
    state.overReason = "wall";
    return { gameOver: true, reason: "wall" };
  }

  // Obstáculos (modo laberinto).
  if (state.mode === "maze" && isObstacleCollision(head, state.obstacles)) {
    state.isOver = true;
    state.overReason = "obstacle";
    return { gameOver: true, reason: "obstacle" };
  }

  // Colisión con el propio cuerpo.
  if (isSelfCollision(head, state.snake, grow)) {
    if (state.mode === "time_attack") {
      state.timeLeft = Math.max(0, state.timeLeft - TIME_ATTACK_PENALTY);
      if (state.timeLeft <= 0) {
        state.isOver = true;
        state.overReason = "timeout";
        return { gameOver: true, reason: "timeout" };
      }
    } else {
      state.isOver = true;
      state.overReason = "self";
      return { gameOver: true, reason: "self" };
    }
  }

  // Avanzar la serpiente.
  state.previousSnake = state.snake.map((c) => ({ ...c }));
  state.snake = grow
    ? [head, ...state.snake]
    : [{ ...head }, ...state.snake.slice(0, -1)];
  state.length = state.snake.length;

  // Nueva comida tras comer.
  if (ate) {
    const nextFood = randomEmptyCell(state.snake, state.obstacles, state.powerUps);
    if (!nextFood) {
      state.isOver = true;
      state.overReason = "wall";
      return { gameOver: true, reason: "wall" };
    }
    state.food = nextFood;
  }

  // Power-ups (modo powerups).
  if (state.mode === "powerups") {
    state = spawnPowerUps(state, now);

    const collected = state.powerUps.filter((p) => pointEquals(p.position, head));
    for (const p of collected) {
      state.activePowerUps = { ...state.activePowerUps, [p.type]: true };
      state.powerUpsUntil = { ...state.powerUpsUntil, [p.type]: now + POWERUP_EFFECT_DURATION_MS };
    }
    state.powerUps = state.powerUps.filter((p) => !pointEquals(p.position, head));
    state.scoreMultiplier = state.activePowerUps.double ? 2 : 1;
  }

  // Modo reverso: perder segmentos con el tiempo.
  if (state.mode === "reverse" && now >= state.nextReverseShrinkAt) {
    state.nextReverseShrinkAt = now + REVERSE_SHRINK_INTERVAL_MS;
    if (state.snake.length > REVERSE_MIN_LENGTH) {
      state.snake = state.snake.slice(0, -1);
      state.length = state.snake.length;
    } else {
      state.isOver = true;
      state.overReason = "reverse_shrunk";
      return { gameOver: true, reason: "reverse_shrunk" };
    }
  }

  // Contrarreloj: cuenta atrás.
  if (state.mode === "time_attack") {
    state.timeLeft = Math.max(0, TIME_ATTACK_DURATION - (now - state.startTime) / 1000);
    if (state.timeLeft <= 0) {
      state.isOver = true;
      state.overReason = "timeout";
      return { gameOver: true, reason: "timeout" };
    }
  }

  return { state };
}