"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { GameMode } from "@/lib/types";
import { GAME_MODES } from "@/lib/types";
import type { GameOverReason } from "@/lib/game/engine";

type Props = {
  score: number;
  bestScore: number;
  mode: GameMode;
  reason: GameOverReason | null;
  isNewBest: boolean;
  submitScore: (nickname: string) => Promise<{ ok: boolean; error?: string }>;
  onRestart: () => void;
  onMenu: () => void;
};

const REASON_MESSAGES: Record<GameOverReason, string> = {
  wall: "Chocaste contra la pared",
  obstacle: "Chocaste contra un obstáculo",
  self: "Te mordiste la cola",
  timeout: "Se acabó el tiempo",
  reverse_shrunk: "Te quedaste sin cuerpo",
};

export function GameOverModal({
  score,
  bestScore,
  mode,
  reason,
  isNewBest,
  submitScore,
  onRestart,
  onMenu,
}: Props) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const label = GAME_MODES.find((g) => g.mode === mode)?.label ?? mode;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!nickname.trim() || submitting) return;
      setSubmitting(true);
      const res = await submitScore(nickname.trim());
      setResult(res);
      setSubmitting(false);
    },
    [nickname, submitting, submitScore],
  );

  useEffect(() => {
    // Limpia el formulario cuando cambia la partida.
    setNickname("");
    setResult(null);
  }, [score, reason]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <div className="mb-1 text-center">
          <span className="text-xs uppercase tracking-widest text-danger">Game Over</span>
          <h2 className="mt-1 text-2xl font-black text-zinc-50">
            {reason ? REASON_MESSAGES[reason] : "Fin de la partida"}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">Modalidad: {label}</p>
        </div>

        <div className="my-4 flex items-center justify-center gap-6 rounded-xl border border-border bg-surface py-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{score}</div>
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">Puntaje</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-lg font-bold text-zinc-100">{bestScore}</div>
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">Récord</div>
          </div>
        </div>

        {isNewBest && (
          <div className="mb-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-center text-sm font-semibold text-primary">
            ¡Nuevo récord personal!
          </div>
        )}

        {result?.ok ? (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-300">
            ¡Puntaje guardado en el leaderboard!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-4">
            <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
              Nickname (guarda tu puntaje en el leaderboard)
            </label>
            <div className="flex gap-2">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder="Tu nombre"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={!nickname.trim() || submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Guardando…" : "Guardar"}
              </button>
            </div>
            {result?.error && (
              <p className="mt-2 text-xs text-danger">{result.error}</p>
            )}
          </form>
        )}

        <div className="flex gap-2">
          <button
            onClick={onRestart}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-bg transition hover:brightness-110"
          >
            Jugar de nuevo
          </button>
          <button
            onClick={onMenu}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-surface"
          >
            Menú
          </button>
          <button
            onClick={() => router.push("/leaderboard")}
            className="flex-1 rounded-lg border border-accent/40 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}