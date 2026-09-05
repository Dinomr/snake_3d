"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { GAME_MODES, type GameMode } from "@/lib/types";
import { useGame } from "@/hooks/useGame";
import { useControls } from "@/hooks/useControls";
import GameScene from "@/components/three/GameScene";
import { HUD } from "@/components/ui/HUD";
import { GameOverModal } from "@/components/ui/GameOverModal";
import { PauseMenu } from "@/components/ui/PauseMenu";
import { SwipeOverlay } from "@/components/ui/SwipeOverlay";

export default function PlayPage() {
  const router = useRouter();
  const params = useParams<{ mode: string }>();
  const rawMode = typeof params?.mode === "string" ? params.mode : "";
  const mode = useMemo<GameMode>(() => {
    if (GAME_MODES.some((g) => g.mode === rawMode)) return rawMode as GameMode;
    return "classic";
  }, [rawMode]);

  const game = useGame();
  const startedRef = useRef(false);

  // Inicia/asegura la partida al entrar con el modo de la URL.
  useEffect(() => {
    if (game.mode !== mode || !startedRef.current) {
      game.startGame(mode);
      startedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const onPauseToggle = useCallback(() => {
    if (game.phase === "playing") game.pause();
    else if (game.phase === "paused") game.resume();
  }, [game]);

  const { enable: enableControls, disable: disableControls } = useControls(
    game.queueDirection,
    onPauseToggle,
  );

  // Activa/desactiva controles según la fase.
  useEffect(() => {
    if (game.phase === "playing" || game.phase === "paused") {
      enableControls();
    } else {
      disableControls();
    }
  }, [game.phase, enableControls, disableControls]);

  const g = game.game;
  const snake = g?.snake ?? [];
  const food = g?.food ?? { x: 0, y: 0 };
  const powerUps = g?.powerUps ?? [];
  const obstacles = g?.obstacles ?? [];

  const isNewBest = game.phase === "gameover" && game.newBest;

  return (
    <div className="no-select relative h-screen w-screen overflow-hidden bg-bg">
      <GameScene
        snake={snake}
        food={food}
        powerUps={powerUps}
        obstacles={obstacles}
        mode={mode}
      />

      {game.phase !== "idle" && (
        <HUD
          score={game.score}
          bestScore={game.bestScore}
          mode={mode}
          length={game.length}
          timeLeft={game.timeLeft}
          isTimeAttack={game.isTimeAttack}
          isReverse={game.isReverse}
          onPause={game.pause}
        />
      )}

      <SwipeOverlay />

      {game.phase === "paused" && (
        <PauseMenu
          onResume={game.resume}
          onRestart={game.restart}
          onMenu={() => {
            game.backToMenu();
            router.push("/");
          }}
        />
      )}

      {game.phase === "gameover" && (
        <GameOverModal
          score={game.score}
          bestScore={game.bestScore}
          mode={mode}
          reason={game.overReason}
          isNewBest={isNewBest}
          submitScore={game.submitScore}
          onRestart={game.restart}
          onMenu={() => {
            game.backToMenu();
            router.push("/");
          }}
        />
      )}

      {game.phase === "idle" && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <button
            onClick={() => game.startGame(mode)}
            className="rounded-xl bg-primary px-8 py-4 text-lg font-black text-bg transition hover:brightness-110"
          >
            Jugar
          </button>
        </div>
      )}
    </div>
  );
}