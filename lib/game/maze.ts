import { GRID_SIZE } from "@/lib/constants";
import type { Coordinate } from "@/lib/types";

/**
 * Genera obstáculos para el modo laberinto.
 * Combina layouts predefinidos + generación procedural con ruido simple,
 * garantizando que nunca tape los bordes ni las celdas iniciales.
 */

const GUARANTEED_FREE: Coordinate[] = [
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 1, y: 2 },
];

export function isInside(x: number, y: number): boolean {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

export function isFreeCell(x: number, y: number, obstacles: Coordinate[]): boolean {
  if (!isInside(x, y)) return false;
  return obstacles.every((o) => o.x !== x || o.y !== y);
}

/** Layouts predefinidos (binario 1 = bloque). 9x9 centrados en el grid 15x15. */
const LAYOUTS: number[][] = [
  // Cruz central
  [
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,1,0,0,1,0,0,
    0,0,0,1,0,0,1,0,0,
    0,0,1,1,1,1,1,0,0,
    0,0,0,1,0,0,1,0,0,
    0,0,0,1,0,0,1,0,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
  ],
  // Dos rectángulos verticales
  [
    0,0,0,0,0,0,0,0,0,
    0,1,1,0,0,0,1,1,0,
    0,1,1,0,0,0,1,1,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
    0,1,1,0,0,0,1,1,0,
    0,1,1,0,0,0,1,1,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
  ],
  // Aros / pasillos
  [
    0,0,0,0,0,0,0,0,0,
    0,0,1,1,1,1,1,0,0,
    0,0,1,0,0,0,1,0,0,
    0,0,1,0,0,0,1,0,0,
    0,0,1,0,0,0,1,0,0,
    0,0,1,0,0,0,1,0,0,
    0,0,1,1,1,1,1,0,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
  ],
  // Espiral
  [
    1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,1,
    1,0,1,1,1,1,1,0,1,
    1,0,1,0,0,0,1,0,1,
    1,0,1,0,0,0,1,0,1,
    1,0,1,1,1,1,1,0,1,
    1,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0,0,
  ],
];

function offsetForLayout(): { x: number; y: number } {
  // Centra el layout 9x9 en un grid de GRID_SIZE (15).
  return { x: Math.floor((GRID_SIZE - 9) / 2), y: Math.floor((GRID_SIZE - 9) / 2) };
}

function randomSeed(seed: number): number {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  return s - Math.floor(s);
}

function proceduralObstacles(): Coordinate[] {
  const obstacles: Coordinate[] = [];
  const { x: ox, y: oy } = offsetForLayout();
  const density = 0.18;
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (x < 1 || y < 1 || x > GRID_SIZE - 2 || y > GRID_SIZE - 2) continue;
      if (GUARANTEED_FREE.some((g) => g.x === x && g.y === y)) continue;
      const noise = randomSeed(x * 12.9898 + y * 78.233);
      if (noise < density) {
        obstacles.push({ x, y });
      }
    }
  }
  return obstacles;
}

function predefinedObstacles(index: number): Coordinate[] {
  const layout = LAYOUTS[index % LAYOUTS.length];
  const obstacles: Coordinate[] = [];
  const { x: ox, y: oy } = offsetForLayout();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = layout[row * 9 + col];
      const x = ox + col;
      const y = oy + row;
      if (cell === 1 && isInside(x, y) && !GUARANTEED_FREE.some((g) => g.x === x && g.y === y)) {
        obstacles.push({ x, y });
      }
    }
  }
  return obstacles;
}

/** Devuelve obstáculos para una partida dada (rotación por ronda). */
export function generateObstacles(round: number): Coordinate[] {
  // Alterna predefinidos (controlados) con procedural para variar.
  if (round % 3 === 2) {
    return proceduralObstacles();
  }
  return predefinedObstacles(Math.floor(round / 3));
}