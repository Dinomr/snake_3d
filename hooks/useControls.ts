"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * `onDirection` recibe la nueva dirección, `onPause` se dispara con Espacio/Escape.
 */
export function useControls(
  onDirection: (dir: Direction) => void,
  onPause?: () => void,
) {
  const [enabled, setEnabled] = useState(false);

  const enable = useCallback(() => setEnabled(true), []);
  const disable = useCallback(() => setEnabled(false), []);

  const onDirectionRef = useRef(onDirection);
  const onPauseRef = useRef(onPause);
  onDirectionRef.current = onDirection;
  onPauseRef.current = onPause;

  useEffect(() => {
    if (!enabled) return;
    const handleKey = (e: KeyboardEvent) => {
      const dir = directionFromKey(e.key);
      if (dir) {
        e.preventDefault();
        onDirectionRef.current(dir);
        return;
      }
      if (e.key === " " || e.key === "Escape") {
        e.preventDefault();
        onPauseRef.current?.();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enabled]);

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
          onDirectionRef.current(dx > 0 ? "right" : "left");
        } else {
          onDirectionRef.current(dy > 0 ? "down" : "up");
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
  }, [enabled]);

  return { enable, disable };
}