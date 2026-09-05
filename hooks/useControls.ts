"use client";

import { useCallback, useEffect, useState } from "react";
import type { Direction } from "@/lib/types";

const MIN_SWIPE_DISTANCE = 40;

function directionFromKey(key: string): Direction | null {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return "up";
    case "ArrowDown":
    case "s":
    case "S":
      return "down";
    case "ArrowLeft":
    case "a":
    case "A":
      return "left";
    case "ArrowRight":
    case "d":
    case "D":
      return "right";
    default:
      return null;
  }
}

/**
 * Hook de controles: teclado (flechas/WASD) + swipe táctil.
 * `onDirection` se invoca con la nueva dirección intencional.
 * También expone `isPaused`/`setPaused` controlado por Espacio o Escape.
 */
export function useControls(onDirection: (dir: Direction) => void) {
  const [enabled, setEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  const enable = useCallback(() => setEnabled(true), []);
  const disable = useCallback(() => setEnabled(false), []);

  useEffect(() => {
    if (!enabled) return;
    const handleKey = (e: KeyboardEvent) => {
      const dir = directionFromKey(e.key);
      if (dir) {
        e.preventDefault();
        onDirection(dir);
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsPaused(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enabled, onDirection]);

  useEffect(() => {
    if (!enabled) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!tracking || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > MIN_SWIPE_DISTANCE || Math.abs(dy) > MIN_SWIPE_DISTANCE) {
        tracking = false;
        if (Math.abs(dx) > Math.abs(dy)) {
          onDirection(dx > 0 ? "right" : "left");
        } else {
          onDirection(dy > 0 ? "down" : "up");
        }
      }
    };
    const onTouchEnd = () => {
      tracking = false;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, onDirection]);

  return { enabled: enable, disabled: disable, isPaused, togglePause };
}