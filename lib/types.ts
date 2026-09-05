export type GameMode =
  | "classic"
  | "maze"
  | "portals"
  | "powerups"
  | "reverse"
  | "time_attack";

export type Direction = "up" | "down" | "left" | "right";

export type Coordinate = { x: number; y: number };

export type PowerUpType = "speed" | "magnet" | "double";

export type PowerUp = {
  id: string;
  type: PowerUpType;
  position: Coordinate;
  spawnedAt: number;
  expiresAt: number;
};

export type GamePhase = "idle" | "playing" | "paused" | "gameover";

export type GameStatus = {
  score: number;
  bestScore: number;
  length: number;
  reversing: boolean;
  mode: GameMode;
  phase: GamePhase;
  timeLeft: number;
  totalTime: number;
  lastDirection: Direction;
  speedMultiplier: number;
  powerUpMultiplier: number;
};

export type ScoreRow = {
  id: string;
  nickname: string;
  score: number;
  game_mode: GameMode;
  created_at: string;
};

export const GAME_MODES: { mode: GameMode; label: string; description: string }[] = [
  { mode: "classic", label: "Clásico", description: "Come, crece y no choques contigo ni con los bordes." },
  { mode: "maze", label: "Laberinto", description: "Bloques fijos actúan como paredes. ¡Evítalos!" },
  { mode: "portals", label: "Portales", description: "Los bordes están conectados. Atraviesa sin miedo." },
  { mode: "powerups", label: "Power-ups", description: "Velocidad, imán y doble puntos aparecen en la partida." },
  { mode: "reverse", label: "Reverso", description: "Pierdes segmentos con el tiempo. Sobrevive y maximiza." },
  { mode: "time_attack", label: "Contrarreloj", description: "Maximiza comida antes de que acabe el reloj." },
];