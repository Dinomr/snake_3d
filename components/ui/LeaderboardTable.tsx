"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GAME_MODES, type GameMode, type ScoreRow } from "@/lib/types";
import { getScores } from "@/lib/game/leaderboard";
import { getSupabase } from "@/lib/supabase";

const FILTERS: { value: GameMode | "all"; label: string }[] = [
  { value: "all", label: "Global" },
  ...GAME_MODES.map((g) => ({ value: g.mode, label: g.label })),
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "";
  }
}

/** Tabla de puntajes filtrable por modo, cargada de Supabase. */
export function LeaderboardTable({ initialMode }: { initialMode?: GameMode }) {
  const [filter, setFilter] = useState<GameMode | "all">(initialMode ?? "all");
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!getSupabase()) {
      setConfigured(false);
      setRows([]);
      setLoading(false);
      return;
    }
    setConfigured(true);
    const data = await getScores(filter, 25);
    setRows(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const modeLabel = FILTERS.find((f) => f.value === filter)?.label ?? "Global";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent">Leaderboard</div>
          <h1 className="text-3xl font-black text-zinc-50">Puntajes · {modeLabel}</h1>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-border bg-panel px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-surface"
        >
          ← Menú
        </Link>
      </div>

      {/* Filtros por modo */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? "bg-primary text-bg"
                : "border border-border bg-panel text-zinc-300 hover:bg-surface"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!configured ? (
        <p className="rounded-xl border border-border bg-panel p-6 text-center text-sm text-zinc-400">
          El leaderboard no está disponible: configura Supabase (ver README).
        </p>
      ) : loading ? (
        <p className="text-center text-sm text-zinc-500">Cargando puntajes…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-panel p-6 text-center text-sm text-zinc-400">
          Todavía no hay puntajes en este modo. ¡Sé el primero!
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-panel">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nickname</th>
                <th className="px-4 py-3 text-right">Puntaje</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-bold text-zinc-400">
                    {i === 0 ? (
                      <span className="text-primary">1</span>
                    ) : i === 1 ? (
                      <span className="text-zinc-300">2</span>
                    ) : i === 2 ? (
                      <span className="text-amber-500">3</span>
                    ) : (
                      i + 1
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-zinc-100">{row.nickname}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-primary">
                    {row.score}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-zinc-500 sm:table-cell">
                    {formatDate(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}