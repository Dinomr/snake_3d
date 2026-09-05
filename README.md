# Prompt para opencode: Snake 3D Minimalista

## Contexto y objetivo

Construye una aplicación web completa de **Snake en 3D con estética minimalista**, lista para desplegar en **Vercel**, usando **Supabase** como backend para el sistema de puntajes (leaderboard). El juego debe sentirse moderno, fluido y visualmente limpio — nada de texturas recargadas ni modelos complejos: formas geométricas simples (cubos, esferas, cápsulas), iluminación suave, paleta de colores reducida y buen uso de sombras/ambient occlusion para dar profundidad sin saturar.

## Stack técnico

- **Framework**: Next.js (App Router), TypeScript.
- **Render 3D**: React Three Fiber + drei (sobre Three.js). El tablero, la serpiente y la comida son objetos 3D reales, con cámara en perspectiva isométrica o cenital ligeramente inclinada (a definir por opencode, priorizando legibilidad del juego).
- **Backend de puntajes**: Supabase (Postgres). Crear el esquema, las políticas de RLS y el cliente de conexión.
- **Despliegue**: configurado para Vercel (variables de entorno vía `.env.local` / Vercel dashboard, `vercel.json` si hace falta).
- **Estilos UI (HUD, menús)**: Tailwind CSS.

## Mecánica base (modo clásico)

- Tablero cuadriculado en 3D, serpiente que crece al comer, colisión con el propio cuerpo y con los bordes = game over.
- Velocidad progresiva: el juego se acelera ligeramente a medida que aumenta el puntaje.
- HUD minimalista: puntaje actual, mejor puntaje local, modo activo.

## Modos de juego a implementar

Además del modo clásico, incluir los siguientes modos seleccionables desde un menú principal:

1. **Modo Laberinto/Obstáculos**: aparecen bloques fijos en el tablero que actúan como paredes; chocar contra ellos termina la partida. Generar el layout de obstáculos de forma procedural o con unos pocos layouts predefinidos que roten.
2. **Modo Portales**: los bordes del tablero están conectados (salir por un lado reaparece por el lado opuesto), sin colisión de borde.
3. **Power-ups**: ítems especiales que aparecen ocasionalmente en el tablero junto a la comida normal:
   - Velocidad (acelera o ralentiza temporalmente).
   - Imán (atrae la comida cercana hacia la serpiente por un tiempo limitado).
   - Doble puntos (la siguiente comida vale el doble).
4. **Modo Reverso**: la serpiente pierde segmentos con el tiempo en lugar de crecer indefinidamente; el objetivo es sobrevivir y maximizar puntaje antes de quedarse sin cuerpo.
5. **Modo Contrarreloj (Time Attack)**: partida a tiempo fijo (ej. 60-90 segundos); el objetivo es maximizar la comida recolectada antes de que se acabe el reloj, sin condición de derrota por colisión con el cuerpo (o con una penalización de tiempo en vez de game over, a criterio de diseño).

Cada modo debe guardar su puntaje en un leaderboard **separado** (filtrable por modo).

## Sistema de puntajes (Supabase)

- Sin autenticación de cuentas: el jugador ingresa un **nickname simple** antes de enviar su puntaje al terminar la partida.
- Tabla `scores` con al menos: `id`, `nickname`, `score`, `game_mode`, `created_at`.
- Políticas de RLS: permitir `insert` público (con alguna validación básica anti-abuso, por ejemplo límites de longitud de nickname y rango razonable de puntaje) y `select` público para mostrar el leaderboard.
- Leaderboard visible en UI: top puntajes globales, filtrable por modo de juego.
- Documentar el SQL de creación de la tabla y políticas para poder correrlo directamente en el editor SQL de Supabase.

## Controles

- **Teclado**: flechas y WASD para escritorio.
- **Táctil**: swipe (deslizar) en pantallas móviles para cambiar de dirección, con la UI adaptada responsivamente (el tablero y HUD deben verse bien tanto en desktop como en móvil).

## Estética y diseño 3D

- Modelos minimalistas: la serpiente puede representarse como una cadena de cápsulas o cubos redondeados; la comida y los power-ups como esferas o formas simples con un color distintivo y quizás una animación sutil (flotación, rotación lenta, pulso de brillo).
- Paleta de colores reducida y consistente (fondo oscuro o neutro con acentos de color vivo para elementos interactivos).
- Iluminación suave (luz ambiental + una luz direccional/point light) y sombras suaves para dar sensación de profundidad sin recargar la escena.
- Transiciones/animaciones sutiles entre menú, partida y pantalla de game over.

## Estructura sugerida del proyecto

- `/app` — rutas de Next.js (menú, juego, leaderboard).
- `/components` — componentes 3D (serpiente, tablero, comida, power-ups) y componentes de UI (HUD, menú, formulario de nickname, tabla de puntajes).
- `/lib/supabase.ts` — cliente de Supabase.
- `/lib/game` — lógica de juego separada del render (estado del tablero, movimiento, colisiones, reglas por modo).
- `sql/` — scripts de creación de tabla y políticas RLS.
- `README.md` — instrucciones de setup local, variables de entorno necesarias y pasos de despliegue en Vercel.

## Entregables esperados

1. Proyecto Next.js funcional y tipado en TypeScript.
2. Los 5 modos de juego adicionales implementados y seleccionables, más el modo clásico.
3. Integración completa con Supabase para guardar y consultar puntajes por modo.
4. Controles de teclado y táctiles funcionando correctamente.
5. Diseño 3D minimalista coherente en todas las pantallas.
6. Documentación clara para desplegar en Vercel (variables de entorno de Supabase incluidas).

## Preguntas abiertas que opencode puede resolver con su propio criterio de diseño

- Ángulo exacto de cámara y si se permite rotarla ligeramente con el mouse/gesto.
- Paleta de colores específica (mientras sea minimalista y coherente).
- Si el modo Reverso termina en game over al quedarse sin cuerpo o si simplemente congela el puntaje final.
- Cadencia y probabilidad de aparición de power-ups.
