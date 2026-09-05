# Snake 3D Minimalista

Juego web de **Snake en 3D** con estética minimalista, construido con Next.js (App Router), React Three Fiber y Three.js. Incluye **6 modos de juego**, controles de teclado y táctiles, y un **leaderboard por modo** respaldado por Supabase.

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Render 3D**: React Three Fiber + drei (sobre Three.js)
- **Backend de puntajes**: Supabase (Postgres + RLS)
- **Estilos UI**: Tailwind CSS

## Modos de juego

| Modo | Descripción |
| --- | --- |
| Clásico | Come, crece y evita chocar contigo y con los bordes. |
| Laberinto | Bloques fijos actúan como paredes; los layouts rotan por partida. |
| Portales | Los bordes están conectados: sal por un lado y reapareces por el opuesto. |
| Power-ups | Velocidad, imán y doble puntos aparecen junto a la comida normal. |
| Reverso | Pierdes segmentos con el tiempo; maximiza el puntaje antes de quedarte sin cuerpo. |
| Contrarreloj | 75 segundos para recolectar la mayor cantidad de comida; chocar resta 5s. |

Cada modo guarda sus puntajes en un **leaderboard separado y filtrable**.

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.local.example .env.local
```

Completa con los datos de tu proyecto de Supabase (ver sección siguiente):

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY
```

> Sin estas variables la app funciona igual (solo el leaderboard queda desactivado y se usa el récord local).

### 3. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Supabase

### Crear la tabla y las políticas RLS

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** > **New query**.
3. Copia el contenido de [`sql/schema.sql`](./sql/schema.sql) y ejecútalo.
4. Ve a **Settings** > **API** y copia la **Project URL** y la **anon key** en tu `.env.local`.

El esquema crea la tabla `scores` con:

- `id` (uuid, PK)
- `nickname` (`text`, con CHECK de longitud 1–20)
- `score` (`integer`, rango 0–1.000.000)
- `game_mode` (enum: `classic`, `maze`, `portals`, `powerups`, `reverse`, `time_attack`)
- `created_at` (timestamptz)

Con RLS habilitado y dos políticas públicas:

- `select` para mostrar el leaderboard.
- `insert` con validación básica anti-abuso (longitud de nickname y rango de puntaje).

## Despliegue en Vercel

1. Sube el repositorio a GitHub/GitLab.
2. En [Vercel](https://vercel.com) → **Add New…** → **Project** → importa el repo.
3. Vercel detecta automáticamente Next.js (usa `vercel.json`).
4. En la configuración del proyecto añade las mismas variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy**. El build es `next build`.

## Controles

- **Escritorio**: flechas ↑ ↓ ← → o WASD. `Espacio` / `Esc` para pausar.
- **Móvil**: desliza (swipe) sobre el tablero para cambiar de dirección.

## Estructura

```
/app                     → rutas (menú, partida por modo, leaderboard)
/components/three        → componentes 3D (serpiente, tablero, comida, power-ups, obstáculos)
/components/ui           → HUD, menús, formulario de nickname, tabla de puntajes
/hooks                   → useGame (motor) y useControls (teclado + táctil)
/lib/game                → lógica separada del render (movimiento, colisiones, reglas por modo)
/sql/schema.sql          → tabla scores + políticas RLS
```

## Ajustes de diseño

Las constantes de juego están en [`/lib/constants.ts`](./lib/constants.ts):

- Velocidad base/velocidad mínima y aceleración progresiva (`BASE_TICK_MS`, `MIN_TICK_MS`).
- Tamaño del tablero (`GRID_SIZE`).
- Duración del modo contrarreloj y penalización (`TIME_ATTACK_DURATION`, `TIME_ATTACK_PENALTY`).
- Cadencia de pérdida de segmentos en modo Reverso (`REVERSE_SHRINK_INTERVAL_MS`).
- Frecuencia, duración y radio del imán de los power-ups.
- Paleta de colores (`COLORS`).