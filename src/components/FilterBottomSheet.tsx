'use client';

import React from 'react';
import { X, Filter } from 'lucide-react';
import { EducationLevel, PhysicsBranch } from '@/types/physics';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedLevel: EducationLevel | 'Todos';
  selectedBranch: PhysicsBranch | 'Todas';
  onChangeLevel: (lvl: EducationLevel | 'Todos') => void;
  onChangeBranch: (br: PhysicsBranch | 'Todas') => void;
}

const LEVELS: (EducationLevel | 'Todos')[] = ['Todos', 'ESO', 'Bachillerato', 'Universidad'];
const BRANCHES: (PhysicsBranch | 'Todas')[] = [
  'Todas',
  'Cinemática',
  'Dinámica',
  'Energía',
  'Electricidad',
  'Óptica',
];

export default function FilterBottomSheet({
  open,
  onClose,
  selectedLevel,
  selectedBranch,
  onChangeLevel,
  onChangeBranch,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-t-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Filtrar Contenido</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Nivel Educativo
            </p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onChangeLevel(lvl)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedLevel === lvl
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Rama de la Física
            </p>
            <div className="flex flex-wrap gap-2">
              {BRANCHES.map((br) => (
                <button
                  key={br}
                  onClick={() => onChangeBranch(br)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedBranch === br
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {br}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm mt-2"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
