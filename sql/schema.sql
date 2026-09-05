-- ============================================================
-- Snake 3D Minimalista - Esquema de puntajes (Supabase)
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.
-- ============================================================

-- Modos de juego válidos (para el CHECK del game_mode).
drop type if exists public.game_mode cascade;
create type public.game_mode as enum (
  'classic',
  'maze',
  'portals',
  'powerups',
  'reverse',
  'time_attack'
);

-- Tabla de puntajes.
drop table if exists public.scores cascade;
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  score integer not null,
  game_mode public.game_mode not null,
  created_at timestamptz not null default now()
);

-- Índices para ordenar rápido por modo y puntuación.
create index scores_game_mode_idx on public.scores (game_mode);
create index scores_score_idx on public.scores (score desc);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.scores enable row level security;

-- Permite a cualquiera leer el leaderboard.
create policy "select scores public" on public.scores
  for select using (true);

-- Permite a cualquiera insertar un puntaje, con validaciones básicas
-- anti-abuso: nickname acotado, puntaje dentro de un rango razonable
-- y un modo de juego válido (garantizado además por el enum).
create policy "insert scores public" on public.scores
  for insert with check (
    length(nickname) between 1 and 20
    and score between 0 and 1000000
    and game_mode in ('classic','maze','portals','powerups','reverse','time_attack')
  );
