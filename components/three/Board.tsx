"use client";

import { Grid as DreiGrid } from "@react-three/drei";
import { COLORS } from "@/lib/constants";

/** Tablero cuadriculado con rejilla sutil y bordes finos. */
export function Board() {
  const size = 15;
  const half = size / 2;
  const h = 0.16;
  const t = 0.08;
  const len = size + 0.6;

  const walls: { position: [number, number, number]; args: [number, number, number] }[] = [
    // ±X
    { position: [-half - 0.15, h / 2, 0], args: [t, h, len] },
    { position: [half + 0.15, h / 2, 0], args: [t, h, len] },
    // ±Z
    { position: [0, h / 2, -half - 0.15], args: [len, h, t] },
    { position: [0, h / 2, half + 0.15], args: [len, h, t] },
  ];

  return (
    <group>
      {/* Base sólida */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={COLORS.surface} roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Líneas de rejilla */}
      <DreiGrid
        position={[0, 0.002, 0]}
        args={[size, size]}
        cellSize={1}
        cellThickness={0.5}
        cellColor={COLORS.gridLine}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={COLORS.border}
        fadeDistance={60}
        fadeStrength={1.5}
        infiniteGrid={false}
      />

      {/* Bordes finos (estéticos) */}
      {walls.map((w, i) => (
        <mesh key={i} position={w.position} castShadow receiveShadow>
          <boxGeometry args={w.args} />
          <meshStandardMaterial
            color={COLORS.border}
            roughness={0.6}
            metalness={0.1}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}