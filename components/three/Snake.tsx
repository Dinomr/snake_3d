"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "@/lib/constants";
import type { Coordinate } from "@/lib/types";
import { cellToWorld } from "@/components/three/transform";

type Props = { snake: Coordinate[] };

const RADIUS = 0.36;
const HEAD_RADIUS = 0.44;
const SMOOTHING = 0.28;

/** Serpiente como cadena de esferas con movimiento interpolado (follow-the-leader). */
export function Snake({ snake }: Props) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const positions = useRef<{ x: number; z: number }[]>([]);

  useFrame((_, dt) => {
    const damp = Math.min(1, SMOOTHING * dt * 60);
    const pos = positions.current;

    if (snake.length === 0) return;
    // Asegurar la longitud correcta del buffer de posiciones.
    while (pos.length < snake.length) {
      const last = pos.length > 0 ? pos[pos.length - 1] : { x: 0, z: 0 };
      pos.push({ x: last.x, z: last.z });
    }
    while (pos.length > snake.length) pos.pop();

    const target = cellToWorld(snake[0]);
    pos[0].x += (target.x - pos[0].x) * damp;
    pos[0].z += (target.z - pos[0].z) * damp;

    for (let i = 1; i < pos.length; i++) {
      const prev = pos[i - 1];
      pos[i].x += (prev.x - pos[i].x) * damp;
      pos[i].z += (prev.z - pos[i].z) * damp;
    }

    for (let i = 0; i < refs.current.length; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      const p = pos[i];
      if (!p) continue;
      mesh.position.set(p.x, RADIUS, p.z);
    }
  });

  return (
    <group>
      {snake.map((_, i) => {
        const isHead = i === 0;
        return (
          <mesh
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            castShadow
          >
            <sphereGeometry args={[isHead ? HEAD_RADIUS : RADIUS, 24, 24]} />
            <meshStandardMaterial
              color={isHead ? COLORS.snakeHead : COLORS.snake}
              roughness={0.35}
              metalness={0.1}
              emissive={isHead ? COLORS.snakeHead : COLORS.snake}
              emissiveIntensity={isHead ? 0.25 : 0.08}
            />
          </mesh>
        );
      })}
    </group>
  );
}