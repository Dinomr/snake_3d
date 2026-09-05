import { GRID_SIZE } from "@/lib/constants";
import type { Coordinate } from "@/lib/types";

/**
 * Convierte una celda del grid (x: 0..N-1, y: 0..N-1) a coordenadas del mundo 3D.
 *
 * La cámara mira desde el eje +Z hacia el origen. Con `z = y - half`:
 *  - fila y=0 (arriba en el grid)  -> -z  -> arriba en pantalla
 *  - fila y=N-1 (abajo en el grid) -> +z  -> abajo en pantalla
 * De este modo las flechas/swipes (arriba/abajo/izq/der) coinciden con la vista.
 */
export function cellToWorld(c: Coordinate): { x: number; z: number } {
  const half = (GRID_SIZE - 1) / 2;
  return { x: c.x - half, z: c.y - half };
}