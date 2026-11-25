-- Ejecuta este script en el SQL Editor de Supabase
create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  level text not null check (level in ('ESO', 'Bachillerato', 'Universidad')),
  branch text not null check (branch in ('Cinemática', 'Dinámica', 'Energía', 'Electricidad', 'Óptica')),
  statement text not null,
  formula text not null,
  answer text not null,
  simulator_preset jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS) con acceso público de lectura y creación para el aula
alter table public.exercises enable row level security;

create policy "Permitir lectura publica de ejercicios"
  on public.exercises for select
  using (true);

create policy "Permitir creacion publica de ejercicios"
  on public.exercises for insert
  with check (true);

create policy "Permitir eliminacion publica de ejercicios"
  on public.exercises for delete
  using (true);

-- Datos iniciales de ejemplo
insert into public.exercises (title, level, branch, statement, formula, answer, simulator_preset)
values
  (
    'Alcance de un proyectil en fútbol',
    'Bachillerato',
    'Cinemática',
    'Un balón es pateado desde el suelo con una velocidad inicial de 22 m/s y un ángulo de 35°. Calcula el alcance horizontal máximo (g = 9.81 m/s²).',
    'R = (v0² · sen(2θ)) / g',
    '46.37 m',
    '{"sim": "projectile", "v0": 22, "angle": 35, "h0": 0, "g": 9.81}'::jsonb
  ),
  (
    'Deslizamiento en rampa sin fricción',
    'ESO',
    'Dinámica',
    'Un bloque de 5 kg se suelta sobre un plano inclinado de 30° sin rozamiento. ¿Cuál es su aceleración?',
    'a = g · sen(θ)',
    '4.91 m/s²',
    '{"sim": "incline", "angle": 30, "mass": 5, "mu": 0}'::jsonb
  ),
  (
    'Periodo de un péndulo de reloj',
    'Universidad',
    'Energía',
    'Determina el periodo de oscilación de un péndulo simple de 1.5 m de longitud en la Tierra.',
    'T = 2π · √(L / g)',
    '2.46 s',
    '{"sim": "pendulum", "length": 1.5, "angle": 20, "g": 9.81}'::jsonb
  );
