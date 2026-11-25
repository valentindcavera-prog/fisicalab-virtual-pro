export type EducationLevel = 'ESO' | 'Bachillerato' | 'Universidad';
export type PhysicsBranch = 'Cinemática' | 'Dinámica' | 'Energía' | 'Electricidad' | 'Óptica';
export type SimulatorId = 'projectile' | 'incline' | 'pendulum' | 'collisions' | 'spring' | 'optics';

export interface PhysicsExercise {
  id: string;
  title: string;
  level: EducationLevel;
  branch: PhysicsBranch;
  statement: string;
  formula: string;
  answer: string;
  simulator_preset?: Record<string, any>;
  created_at?: string;
}

export interface TelemetryPoint {
  t: number;
  x: number;
  v: number;
  a: number;
}
