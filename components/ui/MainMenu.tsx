"use client";

import Link from "next/link";
import { GAME_MODES } from "@/lib/types";

/** Menú principal: selección de modos y acceso al leaderboard. */
export function MainMenu() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs uppercase tracking-widest text-primary">
          Snake 3D
        </div>
        <h1 className="text-5xl font-black tracking-tight text-zinc-50 sm:text-6xl">
          Snake <span className="text-primary">3D</span>
        </h1>
        <p className="mt-3 text-zinc-400">
          Un juego minimalista en 3D. Elige un modo y empieza a comer.
        </p>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        {GAME_MODES.map((g) => (
          <Link
            key={g.mode}
            href={`/play/${g.mode}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-panel p-5 transition hover:border-primary/50 hover:bg-surface"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-lg font-bold text-zinc-100">{g.label}</span>
              <span className="h-2 w-2 rounded-full bg-primary transition group-hover:scale-125" />
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">{g.description}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/leaderboard"
        className="rounded-xl border border-border bg-panel px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-accent/50 hover:text-accent"
      >
        Ver leaderboard
      </Link>

      <p className="text-center text-xs text-zinc-500">
        Controles: flechas / WASD en escritorio · desliza en móvil · Espacio para pausar
      </p>
    </div>
  );
}