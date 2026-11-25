'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

type FormulaKey = 'newton2' | 'kinetic' | 'ohm' | 'projectile_range';

export default function PhysicsCalculator() {
  const [formula, setFormula] = useState<FormulaKey>('newton2');
  const [valA, setValA] = useState<string>('10');
  const [valB, setValB] = useState<string>('9.81');

  const a = parseFloat(valA) || 0;
  const b = parseFloat(valB) || 0;

  const getCalculation = () => {
    switch (formula) {
      case 'newton2':
        return {
          title: 'Segunda Ley de Newton (F = m · a)',
          labelA: 'Masa m (kg)',
          labelB: 'Aceleración a (m/s²)',
          steps: [
            '1. Identificar la ecuación fundamental: F = m · a',
            `2. Sustituir en el Sistema Internacional: F = (${a} kg) · (${b} m/s²)`,
            `3. Resultado final: F = ${(a * b).toFixed(3)} N`,
          ],
        };
      case 'kinetic':
        return {
          title: 'Energía Cinética (Ec = ½ · m · v²)',
          labelA: 'Masa m (kg)',
          labelB: 'Velocidad v (m/s)',
          steps: [
            '1. Fórmula de energía cinética: Ec = 0.5 · m · v²',
            `2. Elevar velocidad al cuadrado: v² = ${b}² = ${(b * b).toFixed(2)} m²/s²`,
            `3. Multiplicar por ½·m: Ec = 0.5 · ${a} · ${(b * b).toFixed(2)} = ${(0.5 * a * b * b).toFixed(3)} J`,
          ],
        };
      case 'ohm':
        return {
          title: 'Ley de Ohm (V = I · R)',
          labelA: 'Corriente I (A)',
          labelB: 'Resistencia R (Ω)',
          steps: [
            '1. Ecuación de Ohm: V = I · R',
            `2. Sustituir valores: V = (${a} A) · (${b} Ω)`,
            `3. Diferencia de potencial: V = ${(a * b).toFixed(3)} V`,
          ],
        };
      case 'projectile_range':
        const rad = (b * Math.PI) / 180;
        const range = (a * a * Math.sin(2 * rad)) / 9.81;
        return {
          title: 'Alcance Horizontal Máximo (g = 9.81 m/s²)',
          labelA: 'Velocidad inicial v₀ (m/s)',
          labelB: 'Ángulo de lanzamiento θ (°)',
          steps: [
            '1. Ecuación de alcance: R = (v₀² · sen(2θ)) / g',
            `2. Calcular 2θ = ${2 * b}° → sen(${2 * b}°) = ${Math.sin(2 * rad).toFixed(4)}`,
            `3. Sustituir: R = (${a}² · ${Math.sin(2 * rad).toFixed(4)}) / 9.81 = ${range.toFixed(3)} m`,
          ],
        };
    }
  };

  const calc = getCalculation();

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold">Calculadora Paso a Paso (SI)</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'newton2', name: 'F = m · a' },
          { id: 'kinetic', name: 'Ec = ½mv²' },
          { id: 'ohm', name: 'V = I · R' },
          { id: 'projectile_range', name: 'Alcance R' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFormula(item.id as FormulaKey)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
              formula === item.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">{calc.labelA}</label>
          <input
            type="number"
            value={valA}
            onChange={(e) => setValA(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">{calc.labelB}</label>
          <input
            type="number"
            value={valB}
            onChange={(e) => setValB(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-1.5">
        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{calc.title}</p>
        {calc.steps.map((step, idx) => (
          <p key={idx} className="text-sm font-mono text-slate-700 dark:text-slate-200">
            {step}
          </p>
        ))}
      </div>
    </div>
  );
}
