"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Direction, GameMode } from "@/lib/types";
import type { GameState, GameOverReason } from "@/lib/game/engine";
import { initGame, stepGame, tickMs } from "@/lib/game/engine";
import {
  GRID_SIZE,
  REVERSE_SHRINK_INTERVAL_MS,
  TIME_ATTACK_DURATION,
} from "@/lib/constants";
import { saveScore } from "@/lib/game/leaderboard";

export type GamePhase = "idle" | "playing" | "paused" | "gameover";

const BEST_SCORE_KEY = "snake3d:best";
const LAST_MODE_KEY = "snake3d:lastMode";

export function useGame() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [mode, setMode] = useState<GameMode>("classic");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [length, setLength] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIME_ATTACK_DURATION);
  const [overReason, setOverReason] = useState<GameOverReason | null>(null);
  const [saved, setSaved] = useState(false);
  const [newBest, setNewBest] = useState(false);
  // tick force de re-render HUD/escena tras cada avance lógico.
  const [tick, setTick] = useState(0);

  const gameRef = useRef<GameState | null>(null);
  const phaseRef = useRef<GamePhase>("idle");
  const bestRef = useRef(0);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? "0");
    if (Number.isFinite(stored)) {
      bestRef.current = stored;
      setBestScore(stored);
    }
    const last = window.localStorage.getItem(LAST_MODE_KEY) as GameMode | null;
    if (last) setMode(last);
  }, []);

  const syncHud = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    setScore(g.score);
    setLength(g.length);
    setTimeLeft(Math.ceil(g.timeLeft));
  }, []);

  const gameOver = useCallback(
    (reason: GameOverReason) => {
      const g = gameRef.current;
      if (!g) return;
      g.isOver = true;
      g.overReason = reason;
      setOverReason(reason);
      setSaved(false);
      setPhase("gameover");
      phaseRef.current = "gameover";
      const isNuevo = g.score > bestRef.current;
      bestRef.current = Math.max(bestRef.current, g.score);
      setNewBest(isNuevo);
      setBestScore(bestRef.current);
      window.localStorage.setItem(BEST_SCORE_KEY, String(bestRef.current));
    },
    [],
  );

  // Loop de juego.
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const loop = (now: number) => {
      if (phaseRef.current === "paused") {
        last = now;
        acc = 0;
        raf = requestAnimationFrame(loop);
        return;
      }
      if (phaseRef.current !== "playing") {
        cancelAnimationFrame(raf);
        return;
      }
      const dt = now - last;
      last = now;
      const g = gameRef.current;
      if (!g) {
        cancelAnimationFrame(raf);
        return;
      }
      acc += dt;
      let currentMs = tickMs(g.score);
      while (acc >= currentMs && phaseRef.current === "playing") {
        acc -= currentMs;
        const result = stepGame(gameRef.current!, now);
        if ("gameOver" in result) {
          gameOver(result.reason);
          cancelAnimationFrame(raf);
          return;
        }
        gameRef.current = result.state;
        currentMs = tickMs(gameRef.current.score);
        setTick((t) => t + 1);
      }
      syncHud();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, gameOver, syncHud]);

  const startGame = useCallback(
    (gameMode: GameMode) => {
      setMode(gameMode);
      setRound((r) => r + 1);
      const g = initGame(gameMode, round + 1);
      gameRef.current = g;
      setScore(g.score);
      setLength(g.length);
      setTimeLeft(g.timeLeft);
      setOverReason(null);
      setSaved(false);
      setNewBest(false);
      gameRef.current.pendingDirection = null;
      setPhase("playing");
      phaseRef.current = "playing";
      window.localStorage.setItem(LAST_MODE_KEY, gameMode);
      setTick((t) => t + 1);
    },
    [round],
  );

  const queueDirection = useCallback((dir: Direction) => {
    if (gameRef.current && (phaseRef.current === "playing" || phaseRef.current === "paused")) {
      gameRef.current.pendingDirection = dir;
    }
  }, []);

  const pause = useCallback(() => {
    if (phaseRef.current === "playing") {
      setPhase("paused");
      phaseRef.current = "paused";
    }
  }, []);

  const resume = useCallback(() => {
    if (phaseRef.current === "paused") {
      setPhase("playing");
      phaseRef.current = "playing";
      gameRef.current!.startTime = performance.now();
    }
  }, []);

  const restart = useCallback(() => {
    if (!gameRef.current) return;
    const g = initGame(gameRef.current.mode, gameRef.current.round + 1);
    gameRef.current = g;
    setScore(g.score);
    setLength(g.length);
    setTimeLeft(g.timeLeft);
    setOverReason(null);
    setSaved(false);
    setNewBest(false);
    setPhase("playing");
    phaseRef.current = "playing";
    setTick((t) => t + 1);
  }, []);

  const backToMenu = useCallback(() => {
    gameRef.current = null;
    setPhase("idle");
    phaseRef.current = "idle";
    setOverReason(null);
  }, []);

  const submitScore = useCallback(async (nickname: string) => {
    const g = gameRef.current;
    if (!g || saved) return { ok: false as const };
    const result = await saveScore(nickname, g.score, g.mode);
    if (result.ok) setSaved(true);
    return result;
  }, [saved]);

  // Para acelerar la digestión del modo Reverso, exponemos su intervalo.
  const shrinkInterval = REVERSE_SHRINK_INTERVAL_MS;

  return {
    phase,
    mode,
    round,
    score,
    bestScore,
    length,
    timeLeft,
    overReason,
    newBest,
    tick,
    game: gameRef.current,
    gameRef,
    gridSize: GRID_SIZE,
    shrinkInterval,
    isTimeAttack: mode === "time_attack",
    isReverse: mode === "reverse",
    startGame,
    queueDirection,
    pause,
    resume,
    restart,
    backToMenu,
    submitScore,
  };
}