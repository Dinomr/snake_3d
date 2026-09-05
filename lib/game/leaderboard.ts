import type { GameMode, ScoreRow } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";

const MAX_NICKNAME_LENGTH = 20;
const MAX_SCORE = 1000000;

/** Guarda el puntaje en Supabase si hay credenciales configuradas. */
export async function saveScore(
  nickname: string,
  score: number,
  gameMode: GameMode,
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  const sanitized = nickname.trim().slice(0, MAX_NICKNAME_LENGTH);

  if (!client) {
    return { ok: false, error: "Backend de Supabase no configurado." };
  }
  if (!sanitized) return { ok: false, error: "El nickname no puede estar vacío." };
  if (sanitized.length > MAX_NICKNAME_LENGTH) {
    return { ok: false, error: `El nickname no puede superar ${MAX_NICKNAME_LENGTH} caracteres.` };
  }
  if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE) {
    return { ok: false, error: "Puntaje inválido." };
  }

  try {
    const { error } = await client.from("scores").insert({
      nickname: sanitized,
      score: Math.floor(score),
      game_mode: gameMode,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "Error de red al guardar el puntaje." };
  }
}

/** Trae los mejores puntajes de una modalidad (top `limit`). */
export async function getScores(gameMode: GameMode | "all", limit = 10): Promise<ScoreRow[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    let query = client
      .from("scores")
      .select("id, nickname, score, game_mode, created_at")
      .order("score", { ascending: false })
      .limit(limit);

    if (gameMode !== "all") {
      query = query.eq("game_mode", gameMode);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as ScoreRow[];
  } catch {
    return [];
  }
}