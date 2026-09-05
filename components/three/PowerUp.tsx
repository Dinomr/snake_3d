"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "@/lib/constants";
import type { PowerUp, PowerUpType } from "@/lib/types";
import { cellToWorld } from "@/components/three/transform";

const POWERUP_STYLE: Record<PowerUpType, { color: string }> = {
  speed: { color: COLORS.speed },
  magnet: { color: COLORS.magnet },
  double: { color: COLORS.double },
};

function PowerUpMesh({ type, position }: { type: PowerUpType; position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh | null>(null);
  const color = POWERUP_STYLE[type].color;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 1.6;
    const mesh = ref.current;
    if (!mesh) return;
    mesh.rotation.x = t;
    mesh.rotation.y = t * 1.3;
    mesh.position.y = position[1] + Math.sin(t * 2) * 0.12;
    const s = 1 + Math.sin(t * 2.6) * 0.08;
    mesh.scale.setScalar(s);
  });

  const geometry = (): React.ReactElement => {
    switch (type) {
      case "speed":
        return <octahedronGeometry args={[0.34, 0]} />;
      case "magnet":
        return <icosahedronGeometry args={[0.34, 0]} />;
      default:
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
    }
  };

  return (
    <mesh ref={ref} position={position} castShadow>
      {geometry()}
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.3}
        emissive={color}
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

/** Power-ups visibles en el tablero (modo powerups). */
export function PowerUps({ powerUps }: { powerUps: PowerUp[] }) {
  return (
    <group>
      {powerUps.map((p) => {
        const { x, z } = cellToWorld(p.position);
        return (
          <PowerUpMesh
            key={p.id}
            type={p.type}
            position={[x, 0.6, z]}
          />
        );
      })}
    </group>
  );
}