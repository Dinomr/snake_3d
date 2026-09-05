import { GAME_MODES } from "@/lib/types";
import type { GameMode } from "@/lib/types";
import { TIME_ATTACK_PENALTY } from "@/lib/constants";

type Props = {
  score: number;
  bestScore: number;
  mode: GameMode;
  length: number;
  timeLeft: number;
  isTimeAttack: boolean;
  isReverse: boolean;
  onPause: () => void;
};

/** HUD minimalista: puntaje, récord local, modo activo y timer. */
export function HUD({ score, bestScore, mode, length, timeLeft, isTimeAttack, isReverse, onPause }: Props) {
  const label = GAME_MODES.find((g) => g.mode === mode)?.label ?? mode;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 sm:p-5">
      <div className="flex flex-col gap-1 rounded-xl border border-border bg-panel/80 px-4 py-2 backdrop-blur">
        <span className="text-[11px] uppercase tracking-widest text-zinc-400">Puntaje</span>
        <span className="text-2xl font-bold tabular-nums text-primary">{score}</span>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-panel/80 px-5 py-2 text-center backdrop-blur">
        <span className="text-[11px] uppercase tracking-widest text-zinc-400">Modo</span>
        <span className="text-sm font-semibold text-zinc-100">{label}</span>
        {isTimeAttack && (
          <span
            className={`text-lg font-bold tabular-nums ${
              timeLeft <= 10 ? "text-danger animate-pulse" : "text-accent"
            }`}
          >
            {timeLeft}s
          </span>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 rounded-xl border border-border bg-panel/80 px-4 py-2 text-right backdrop-blur">
        <span className="text-[11px] uppercase tracking-widest text-zinc-400">Récord</span>
        <span className="text-xl font-bold tabular-nums text-zinc-100">{bestScore}</span>
        {isReverse && <span className="text-xs text-danger">-1 seg / 3.5s</span>}
        <span className="text-xs text-zinc-400">Cuerpo: {length}</span>
      </div>

      <button
        onClick={onPause}
        className="pointer-events-auto rounded-lg border border-border bg-panel/80 p-2 text-zinc-300 backdrop-blur transition hover:bg-panel"
        aria-label="Pausar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      </button>
    </div>
  );
}