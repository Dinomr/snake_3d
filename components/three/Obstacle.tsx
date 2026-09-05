"use client";

import { RoundedBox } from "@react-three/drei";
import { COLORS } from "@/lib/constants";
import type { Coordinate } from "@/lib/types";
import { cellToWorld } from "@/components/three/transform";

/** Bloques-pared del modo laberinto. */
export function Obstacles({ obstacles }: { obstacles: Coordinate[] }) {
  return (
    <group>
      {obstacles.map((o, i) => {
        const { x, z } = cellToWorld(o);
        return (
          <RoundedBox
            key={i}
            position={[x, 0.42, z]}
            args={[0.92, 0.84, 0.92]}
            radius={0.08}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={COLORS.obstacle} roughness={0.6} metalness={0.1} />
          </RoundedBox>
        );
      })}
    </group>
  );
}