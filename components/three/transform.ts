"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { COLORS, GRID_SIZE } from "@/lib/constants";
import type { Coordinate } from "@/lib/types";

/** Convierte una celda del grid (x: 0..N-1, y: 0..N-1) a coordenadas del mundo 3D. */
export function cellToWorld(c: Coordinate): { x: number; z: number } {
  const half = (GRID_SIZE - 1) / 2;
  return { x: c.x - half, z: -(c.y - half) };
}

export function useBoardTransform() {
  return { min: -(GRID_SIZE / 2), max: GRID_SIZE / 2 };
}

export { COLORS, GRID_SIZE };