"use client";

type Props = {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
};

/** Menú de pausa. */
export function PauseMenu({ onResume, onRestart, onMenu }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-2xl border border-border bg-panel p-6 text-center shadow-2xl">
        <h2 className="mb-1 text-2xl font-black text-zinc-50">Pausa</h2>
        <p className="mb-5 text-sm text-zinc-400">Espacio o Esc para reanudar</p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onResume}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-bg transition hover:brightness-110"
          >
            Reanudar
          </button>
          <button
            onClick={onRestart}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-surface"
          >
            Reiniciar
          </button>
          <button
            onClick={onMenu}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-surface"
          >
            Menú principal
          </button>
        </div>
      </div>
    </div>
  );
}