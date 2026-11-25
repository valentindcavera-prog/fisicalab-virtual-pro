'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Atom,
  Calculator,
  Activity,
  Trophy,
  BookOpen,
  Filter,
  Plus,
  Trash2,
  Cloud,
  HardDrive,
} from 'lucide-react';
import SimulatorCanvas from '@/components/SimulatorCanvas';
import PhysicsCalculator from '@/components/PhysicsCalculator';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import CreateExerciseModal from '@/components/CreateExerciseModal';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  EducationLevel,
  PhysicsBranch,
  PhysicsExercise,
  SimulatorId,
  TelemetryPoint,
} from '@/types/physics';

type TabId = 'simulators' | 'telemetry' | 'calculator' | 'challenge' | 'exercises';

const FALLBACK_EXERCISES: PhysicsExercise[] = [
  {
    id: 'local-1',
    title: 'Alcance de un proyectil en fútbol',
    level: 'Bachillerato',
    branch: 'Cinemática',
    statement:
      'Un balón es pateado con velocidad inicial de 22 m/s y ángulo de 35°. Calcula el alcance horizontal máximo (g = 9.81 m/s²).',
    formula: 'R = (v₀² · sen(2θ)) / g',
    answer: '46.37 m',
  },
  {
    id: 'local-2',
    title: 'Deslizamiento en rampa sin fricción',
    level: 'ESO',
    branch: 'Dinámica',
    statement:
      'Un bloque de 5 kg se suelta sobre un plano inclinado de 30° sin rozamiento. ¿Cuál es su aceleración?',
    formula: 'a = g · sen(θ)',
    answer: '4.91 m/s²',
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>('simulators');
  const [activeSim, setActiveSim] = useState<SimulatorId>('projectile');
  const [schoolName, setSchoolName] = useState('Instituto de Ciencias Aplicadas');

  // Filtros Bottom Sheet
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | 'Todos'>('Todos');
  const [selectedBranch, setSelectedBranch] = useState<PhysicsBranch | 'Todas'>('Todas');

  // Modal FAB
  const [createOpen, setCreateOpen] = useState(false);

  // Ejercicios (Supabase o Local)
  const [exercises, setExercises] = useState<PhysicsExercise[]>(FALLBACK_EXERCISES);
  const [telemetry, setTelemetry] = useState<TelemetryPoint>({ t: 0, x: 0, v: 0, a: 0 });

  // Snackbar Undo
  const [snackbar, setSnackbar] = useState<{ message: string; undo: () => void } | null>(null);

  // Modo reto
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  const triggerUndo = useCallback((message: string, undo: () => void) => {
    setSnackbar({ message, undo });
    setTimeout(() => {
      setSnackbar((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  }, []);

  const loadExercises = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setExercises(data as PhysicsExercise[]);
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleCreateExercise = async (newEx: Omit<PhysicsExercise, 'id'>) => {
    if (supabase) {
      const { data, error } = await supabase.from('exercises').insert([newEx]).select().single();
      if (!error && data) {
        setExercises((prev) => [data as PhysicsExercise, ...prev]);
        return;
      }
    }
    const localItem: PhysicsExercise = { ...newEx, id: `local-${Date.now()}` };
    setExercises((prev) => [localItem, ...prev]);
  };

  const handleDeleteExercise = async (item: PhysicsExercise) => {
    const previousList = [...exercises];
    setExercises((prev) => prev.filter((e) => e.id !== item.id));

    if (supabase && !item.id.startsWith('local-')) {
      await supabase.from('exercises').delete().eq('id', item.id);
    }

    triggerUndo(`Eliminado: "${item.title}"`, async () => {
      setExercises(previousList);
      if (supabase && !item.id.startsWith('local-')) {
        const { id, ...rest } = item;
        await supabase.from('exercises').insert([rest]);
        loadExercises();
      }
    });
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchLevel = selectedLevel === 'Todos' || ex.level === selectedLevel;
    const matchBranch = selectedBranch === 'Todas' || ex.branch === selectedBranch;
    return matchLevel && matchBranch;
  });

  const checkChallenge = () => {
    const val = parseFloat(challengeInput);
    if (Math.abs(val - 44.15) < 0.6) {
      setChallengeFeedback('¡Correcto! y = ½ · 9.81 · 3² = 44.15 m.');
    } else {
      setChallengeFeedback('Revisa el cálculo: usa y = ½ · g · t² con g = 9.81 m/s² y t = 3 s.');
    }
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-12">
      {/* Cabecera */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Atom className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
                FísicaLab Virtual Pro
              </h1>
              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                aria-label="Nombre de la institución"
                className="text-xs text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isSupabaseConfigured ? (
                <>
                  <Cloud className="w-3.5 h-3.5" /> Supabase Conectado
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5" /> Modo Local
                </>
              )}
            </span>

            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              <Filter className="w-4 h-4 text-indigo-600" />
              Filtrar
            </button>
          </div>
        </div>

        {/* Tab Bar Escritorio */}
        <nav className="hidden sm:flex max-w-5xl mx-auto px-4 gap-1 pb-2">
          {[
            { id: 'simulators', label: 'Simuladores', icon: Atom },
            { id: 'telemetry', label: 'Telemetría en Vivo', icon: Activity },
            { id: 'calculator', label: 'Calculadora', icon: Calculator },
            { id: 'challenge', label: 'Modo Reto', icon: Trophy },
            { id: 'exercises', label: `Ejercicios (${filteredExercises.length})`, icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'simulators' && (
          <SimulatorCanvas
            activeSim={activeSim}
            onSelectSim={setActiveSim}
            onTelemetryUpdate={setTelemetry}
            onTriggerUndo={triggerUndo}
          />
        )}

        {activeTab === 'telemetry' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Tiempo (t)', value: `${telemetry.t} s`, color: 'text-indigo-600' },
              { label: 'Posición / d₀ (x)', value: `${telemetry.x} m`, color: 'text-emerald-600' },
              { label: 'Velocidad / dᵢ (v)', value: `${telemetry.v} m/s`, color: 'text-sky-600' },
              { label: 'Aceleración / M (a)', value: `${telemetry.a} m/s²`, color: 'text-amber-600' },
            ].map((card) => (
              <div
                key={card.label}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                <p className={`text-2xl font-extrabold mt-1 font-mono ${card.color}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'calculator' && <PhysicsCalculator />}

        {activeTab === 'challenge' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold">Reto Rápido de Cinemática</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Se deja caer una esfera desde lo alto de un edificio sin velocidad inicial. Si tarda{' '}
              <strong>3 segundos</strong> en tocar el suelo (g = 9.81 m/s²), ¿qué altura en metros
              tiene el edificio?
            </p>
            <div className="flex gap-2 max-w-sm">
              <input
                type="number"
                step="0.01"
                placeholder="Altura en metros..."
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
              <button
                onClick={checkChallenge}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
              >
                Comprobar
              </button>
            </div>
            {challengeFeedback && (
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {challengeFeedback}
              </p>
            )}
          </div>
        )}

        {activeTab === 'exercises' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Banco de Ejercicios ({selectedLevel} · {selectedBranch})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600">
                          {ex.level}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                          {ex.branch}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteExercise(ex)}
                        title="Eliminar ejercicio"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-base">{ex.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{ex.statement}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-600 dark:text-indigo-400">{ex.formula}</span>
                    <span className="font-bold">Sol: {ex.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Tab Bar Móvil Inferior */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-around py-2">
        {[
          { id: 'simulators', label: 'Simular', icon: Atom },
          { id: 'telemetry', label: 'Datos', icon: Activity },
          { id: 'calculator', label: 'Calcular', icon: Calculator },
          { id: 'challenge', label: 'Reto', icon: Trophy },
          { id: 'exercises', label: 'Banco', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
                active ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* FAB (+) Crear */}
      <button
        onClick={() => setCreateOpen(true)}
        aria-label="Crear nuevo ejercicio"
        className="fixed bottom-20 sm:bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl flex items-center justify-center transition transform hover:scale-105"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Snackbar Deshacer */}
      {snackbar && (
        <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-sm">
          <span>{snackbar.message}</span>
          <button
            onClick={() => {
              snackbar.undo();
              setSnackbar(null);
            }}
            className="font-bold text-indigo-400 hover:text-indigo-300 uppercase text-xs tracking-wider"
          >
            Deshacer
          </button>
        </div>
      )}

      {/* Bottom Sheet Filtros */}
      <FilterBottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedLevel={selectedLevel}
        selectedBranch={selectedBranch}
        onChangeLevel={setSelectedLevel}
        onChangeBranch={setSelectedBranch}
      />

      {/* Modal Crear Ejercicio */}
      <CreateExerciseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateExercise}
      />
    </div>
  );
}
