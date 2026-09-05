import { GRID_SIZE } from "@/lib/constants";
import type { Coordinate, Direction, PowerUp, PowerUpType } from "@/lib/types";

export function serialize(c: Coordinate): string {
  return `${c.x},${c.y}`;
}

export function pointEquals(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

export function directionToDelta(dir: Direction): Coordinate {
  switch (dir) {
    case "up":
      return { x: 0, y: -1 };
    case "down":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
  }
}

export function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}

/**
 * Aplica reglas de borde según el modo.
 * En modo portales: wrap-around. En el resto: fuera de límites = colisión.
 */
export function applyBoundary(
  next: Coordinate,
  mode: "classic" | "maze" | "portals" | "powerups" | "reverse" | "time_attack",
): { position: Coordinate; collided: boolean } {
  if (mode === "portals") {
    return {
      position: {
        x: ((next.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
        y: ((next.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
      },
      collided: false,
    };
  }
  if (next.x < 0 || next.x >= GRID_SIZE || next.y < 0 || next.y >= GRID_SIZE) {
    return { position: next, collided: true };
  }
  return { position: next, collided: false };
}

/**
 * Calcula la colisión con el propio cuerpo.
 * Si la serpiente no va a crecer, la celda que ocupaba la cola se libera,
 * por lo que pisarla en el mismo tick no cuenta como colisión.
 */
export function isSelfCollision(
  next: Coordinate,
  snake: Coordinate[],
  grow: boolean,
): boolean {
  const check = grow ? snake : snake.slice(0, -1);
  return check.some((seg) => seg.x === next.x && seg.y === next.y);
}

export function isObstacleCollision(next: Coordinate, obstacles: Coordinate[]): boolean {
  return obstacles.some((o) => o.x === next.x && o.y === next.y);
}

/** Celdas vacías dentro del tablero (posición de la comida genérica). */
export function randomEmptyCell(
  snake: Coordinate[],
  obstacles: Coordinate[],
  powerUps: PowerUp[],
  rng: () => number = Math.random,
): Coordinate | null {
  const taken = new Set<string>([
    ...snake.map(serialize),
    ...obstacles.map(serialize),
    ...powerUps.map((p) => serialize(p.position)),
  ]);
  const free: Coordinate[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!taken.has(serialize({ x, y }))) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  return free[Math.floor(rng() * free.length)];
}