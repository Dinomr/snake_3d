"use client";

/** Overlay táctil pasivo para captar swipes (solo se muestra brevemente en móvil). */
export function SwipeOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-4 sm:hidden">
      <div className="rounded-full border border-border bg-panel/70 px-4 py-1.5 text-xs text-zinc-400 backdrop-blur">
        Desliza para moverte
      </div>
    </div>
  );
}