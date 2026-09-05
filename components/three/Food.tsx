"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "@/lib/constants";
import type { Coordinate } from "@/lib/types";
import { cellToWorld } from "@/components/three/transform";

type Props = { food: Coordinate };

/** Comida: esfera flotante con pulso de brillo sutil. */
export function Food({ food }: Props) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const { x, z } = cellToWorld(food);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.position.y = 0.55 + Math.sin(t * 2.2) * 0.12;
    const s = 1 + Math.sin(t * 3) * 0.06;
    mesh.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef} position={[x, 0.55, z]} castShadow>
      <sphereGeometry args={[0.34, 24, 24]} />
      <meshStandardMaterial
        color={COLORS.food}
        roughness={0.2}
        metalness={0.2}
        emissive={COLORS.food}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}