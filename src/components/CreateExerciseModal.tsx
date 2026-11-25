'use client';

import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { EducationLevel, PhysicsBranch, PhysicsExercise } from '@/types/physics';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (exercise: Omit<PhysicsExercise, 'id'>) => Promise<void>;
}

export default function CreateExerciseModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<EducationLevel>('Bachillerato');
  const [branch, setBranch] = useState<PhysicsBranch>('Cinemática');
  const [statement, setStatement] = useState('');
  const [formula, setFormula] = useState('');
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !statement.trim()) return;
    setSaving(true);
    try {
      await onCreate({
        title: title.trim(),
        level,
        branch,
        statement: statement.trim(),
        formula: formula.trim() || 'F = m · a',
        answer: answer.trim() || 'Ver desarrollo',
      });
      setTitle('');
      setStatement('');
      setFormula('');
      setAnswer('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Crear Ejercicio en la Nube</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Título del ejercicio</label>
            <input
              required
              placeholder="Ej. Caída libre desde una torre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Nivel</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as EducationLevel)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="ESO">ESO</option>
                <option value="Bachillerato">Bachillerato</option>
                <option value="Universidad">Universidad</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Rama</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as PhysicsBranch)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="Cinemática">Cinemática</option>
                <option value="Dinámica">Dinámica</option>
                <option value="Energía">Energía</option>
                <option value="Electricidad">Electricidad</option>
                <option value="Óptica">Óptica</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Enunciado</label>
            <textarea
              required
              rows={3}
              placeholder="Describe los datos iniciales y qué se pide calcular..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Fórmula clave</label>
              <input
                placeholder="Ej. y = ½ · g · t²"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Respuesta esperada</label>
              <input
                placeholder="Ej. 44.1 m"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando en Supabase...' : 'Publicar Ejercicio'}
          </button>
        </form>
      </div>
    </div>
  );
}
