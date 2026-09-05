"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
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

const GRID_HALF_VISIBLE = 8.5;

/**
 * Cámara cenital ligeramente inclinada, fija sobre el eje +Z.
 * Mantiene la vista coherente con los controles: "arriba" = fila y=0 = -z = parte
 * superior de la pantalla. La distancia se ajusta para que el tablero quepa completo
 * en el EJE MÁS ESTRECHO de la pantalla (escritorio o móvil retrato).
 */
function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const aspect = useThree((s) => s.viewport.aspect);

  useEffect(() => {
    const halfBoard = GRID_HALF_VISIBLE;
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const smallerAspect = Math.min(aspect, 1);
    const distance = halfBoard / (smallerAspect * tanHalfFov);
    const y = distance * Math.SQRT1_2;
    const z = distance * Math.SQRT1_2;
    camera.position.set(0, y, z);
    camera.near = 0.1;
    camera.far = 400;
    camera.lookAt(0, 0, 0);
  }, [camera, aspect]);

  return null;
}

function Scene({ snake, food, powerUps, obstacles }: SceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 16, 16]} fov={40} />
      <CameraRig />
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.background, 30, 55]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[-6, 8, -6]} intensity={0.4} color="#88aaff" />

      <Board />
      <Snake snake={snake} />
      <Food food={food} />
      <PowerUps powerUps={powerUps} />
      <Obstacles obstacles={obstacles} />
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
export default dynamic(async () => ({ default: GameScene }), { ssr: false });