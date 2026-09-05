"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import type { Coordinate, GameMode, PowerUp } from "@/lib/types";
import { COLORS } from "@/lib/constants";
import { Board } from "@/components/three/Board";
import { Snake } from "@/components/three/Snake";
import { Food } from "@/components/three/Food";
import { PowerUps } from "@/components/three/PowerUp";
import { Obstacles } from "@/components/three/Obstacle";

type SceneProps = {
  snake: Coordinate[];
  food: Coordinate;
  powerUps: PowerUp[];
  obstacles: Coordinate[];
  mode: GameMode;
};

function Scene({ snake, food, powerUps, obstacles }: SceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[11.5, 13, 11.5]} fov={40} />
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.background, 28, 45]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-6, 8, -6]} intensity={0.4} color="#88aaff" />

      <Board />
      <Snake snake={snake} />
      <Food food={food} />
      <PowerUps powerUps={powerUps} />
      <Obstacles obstacles={obstacles} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.4}
        minAzimuthAngle={-0.5}
        maxAzimuthAngle={0.5}
      />
    </>
  );
}

function GameScene(props: SceneProps) {
  return (
    <div className="h-full w-full">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 40 }}>
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Se carga solo en cliente (necesario para WebGL + React Three Fiber).
export default dynamic(() => Promise.resolve(GameScene), { ssr: false });