'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import { SimulatorId, TelemetryPoint } from '@/types/physics';

interface Props {
  activeSim: SimulatorId;
  onSelectSim: (id: SimulatorId) => void;
  onTelemetryUpdate: (point: TelemetryPoint) => void;
  onTriggerUndo: (label: string, restoreFn: () => void) => void;
}

const SIM_LIST: { id: SimulatorId; name: string; branch: string; level: string }[] = [
  { id: 'projectile', name: '1. Tiro Parabólico', branch: 'Cinemática', level: 'ESO' },
  { id: 'incline', name: '2. Plano Inclinado (DCL)', branch: 'Dinámica', level: 'Bachillerato' },
  { id: 'pendulum', name: '3. Péndulo Simple', branch: 'Energía', level: 'Bachillerato' },
  { id: 'collisions', name: '4. Colisiones 1D', branch: 'Dinámica', level: 'Universidad' },
  { id: 'spring', name: '5. Resorte (Hooke)', branch: 'Energía', level: 'ESO' },
  { id: 'optics', name: '6. Óptica (Lentes)', branch: 'Óptica', level: 'Bachillerato' },
];

export default function SimulatorCanvas({
  activeSim,
  onSelectSim,
  onTelemetryUpdate,
  onTriggerUndo,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);
  const [slowMo, setSlowMo] = useState(false);

  // Parámetros compartidos / por simulador
  const [v0, setV0] = useState(24);
  const [angle, setAngle] = useState(45);
  const [g, setG] = useState(9.81);
  const [mass, setMass] = useState(5);
  const [mu, setMu] = useState(0.15);
  const [length, setLength] = useState(1.8);
  const [restitution, setRestitution] = useState(0.9);
  const [kSpring, setKSpring] = useState(25);
  const [focalLength, setFocalLength] = useState(120);

  const timeRef = useRef(0);
  const targetXRef = useRef(460);
  const pendulumAngleRef = useRef(Math.PI / 4);
  const springDispRef = useRef(90);
  const lensObjXRef = useRef(150);

  const handleReset = () => {
    const prev = { v0, angle, g, mass, mu, length, t: timeRef.current };
    timeRef.current = 0;
    pendulumAngleRef.current = (angle * Math.PI) / 180;
    springDispRef.current = 90;
    onTriggerUndo('Simulación reiniciada', () => {
      setV0(prev.v0);
      setAngle(prev.angle);
      setG(prev.g);
      setMass(prev.mass);
      setMu(prev.mu);
      setLength(prev.length);
      timeRef.current = prev.t;
    });
  };

  useEffect(() => {
    let animId: number;
    let lastTs = performance.now();

    const render = (now: number) => {
      const rawDt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      const dt = running ? rawDt * (slowMo ? 0.25 : 1) : 0;
      timeRef.current += dt;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Fondo cuadrícula laboratorio
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      const t = timeRef.current;

      if (activeSim === 'projectile') {
        const rad = (angle * Math.PI) / 180;
        const vx = v0 * Math.cos(rad);
        const vy0 = v0 * Math.sin(rad);
        const totalFlight = (2 * vy0) / g;
        const loopT = totalFlight > 0 ? t % (totalFlight + 0.8) : 0;
        const activeT = Math.min(loopT, totalFlight);

        const scale = 8;
        const originX = 60;
        const groundY = H - 45;

        // Suelo
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, groundY, W, 45);

        // Trayectoria punteada
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let st = 0; st <= totalFlight; st += 0.05) {
          const px = originX + vx * st * scale;
          const py = groundY - (vy0 * st - 0.5 * g * st * st) * scale;
          if (st === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Diana arrastrable
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(targetXRef.current, groundY - 8, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.fillText('Diana (arrastra)', targetXRef.current - 36, groundY - 25);

        // Proyectil
        const curX = originX + vx * activeT * scale;
        const curY = groundY - Math.max(0, vy0 * activeT - 0.5 * g * activeT * activeT) * scale;
        const curVy = vy0 - g * activeT;

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(curX, curY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Vector velocidad
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(curX + vx * 1.8, curY - curVy * 1.8);
        ctx.stroke();

        onTelemetryUpdate({
          t: Number(activeT.toFixed(2)),
          x: Number((vx * activeT).toFixed(2)),
          v: Number(Math.hypot(vx, curVy).toFixed(2)),
          a: Number((-g).toFixed(2)),
        });
      } else if (activeSim === 'incline') {
        const rad = (angle * Math.PI) / 180;
        const gSin = g * Math.sin(rad);
        const gCos = g * Math.cos(rad);
        const acc = Math.max(0, gSin - mu * gCos);
        const dist = (0.5 * acc * (t % 4) * (t % 4)) * 22;

        const baseX = 120;
        const baseY = H - 50;
        const rampLen = 420;
        const topX = baseX;
        const topY = baseY - Math.tan(rad) * 320;

        // Rampa
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(baseX + 340, baseY);
        ctx.lineTo(topX, Math.max(60, topY));
        ctx.closePath();
        ctx.fill();

        const slopeAngle = Math.atan2(baseY - Math.max(60, topY), 340);
        const dClamped = Math.min(dist, 270);
        const bx = topX + 35 + Math.cos(slopeAngle) * dClamped;
        const by = Math.max(60, topY) + Math.sin(slopeAngle) * dClamped;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(slopeAngle);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-20, -32, 40, 32);
        ctx.restore();

        // Vectores DCL
        ctx.strokeStyle = '#ef4444'; // Peso
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx, by - 16);
        ctx.lineTo(bx, by + 45);
        ctx.stroke();
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(`P = ${(mass * g).toFixed(1)} N`, bx + 6, by + 45);

        onTelemetryUpdate({
          t: Number((t % 4).toFixed(2)),
          x: Number((dClamped / 22).toFixed(2)),
          v: Number((acc * (t % 4)).toFixed(2)),
          a: Number(acc.toFixed(2)),
        });
      } else if (activeSim === 'pendulum') {
        const pivotX = W / 2;
        const pivotY = 45;
        const omega = Math.sqrt(g / length);
        const theta0 = (angle * Math.PI) / 180;
        const theta = theta0 * Math.cos(omega * t);
        const pxLen = Math.min(220, length * 95);
        const bobX = pivotX + pxLen * Math.sin(theta);
        const bobY = pivotY + pxLen * Math.cos(theta);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 16, 0, Math.PI * 2);
        ctx.fill();

        const vel = -theta0 * omega * length * Math.sin(omega * t);
        onTelemetryUpdate({
          t: Number(t.toFixed(2)),
          x: Number((length * theta).toFixed(2)),
          v: Number(Math.abs(vel).toFixed(2)),
          a: Number((-g * Math.sin(theta)).toFixed(2)),
        });
      } else if (activeSim === 'collisions') {
        const cycle = t % 4;
        const v1 = 6;
        const v2 = -3;
        const m1 = mass;
        const m2 = 4;
        const impactT = 1.6;
        let x1 = 0;
        let x2 = 0;
        let curV1 = v1;
        let curV2 = v2;

        if (cycle < impactT) {
          x1 = 120 + v1 * cycle * 24;
          x2 = 520 + v2 * cycle * 24;
        } else {
          const dtAfter = cycle - impactT;
          curV1 = (m1 * v1 + m2 * v2 + m2 * restitution * (v2 - v1)) / (m1 + m2);
          curV2 = (m1 * v1 + m2 * v2 + m1 * restitution * (v1 - v2)) / (m1 + m2);
          const impactX = 120 + v1 * impactT * 24;
          x1 = impactX + curV1 * dtAfter * 24;
          x2 = impactX + 44 + curV2 * dtAfter * 24;
        }

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, H - 55, W, 55);

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x1 - 22, H - 99, 44, 44);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${m1}kg`, x1 - 14, H - 72);

        ctx.fillStyle = '#ec4899';
        ctx.fillRect(x2 - 22, H - 99, 44, 44);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${m2}kg`, x2 - 14, H - 72);

        onTelemetryUpdate({
          t: Number(cycle.toFixed(2)),
          x: Number(((x1 - 120) / 24).toFixed(2)),
          v: Number(curV1.toFixed(2)),
          a: 0,
        });
      } else if (activeSim === 'spring') {
        const eqX = W / 2 + 30;
        const omega = Math.sqrt(kSpring / mass);
        const disp = springDispRef.current * Math.cos(omega * t);
        const blockX = eqX + disp;
        const y = H / 2;

        // Pared
        ctx.fillStyle = '#475569';
        ctx.fillRect(40, y - 60, 16, 120);

        // Resorte zigzag
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(56, y);
        const coils = 14;
        for (let i = 1; i <= coils; i++) {
          const sx = 56 + ((blockX - 25 - 56) * i) / coils;
          const sy = y + (i % 2 === 0 ? -14 : 14);
          ctx.lineTo(sx, i === coils ? y : sy);
        }
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.fillRect(blockX - 25, y - 25, 50, 50);

        onTelemetryUpdate({
          t: Number(t.toFixed(2)),
          x: Number((disp / 100).toFixed(2)),
          v: Number(((-springDispRef.current / 100) * omega * Math.sin(omega * t)).toFixed(2)),
          a: Number(((-kSpring / mass) * (disp / 100)).toFixed(2)),
        });
      } else if (activeSim === 'optics') {
        const lensX = W / 2;
        const axisY = H / 2;

        // Eje óptico
        ctx.strokeStyle = '#64748b';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(20, axisY);
        ctx.lineTo(W - 20, axisY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Lente convergente
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(lensX, axisY, 12, 110, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Focos
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(lensX - focalLength, axisY, 5, 0, Math.PI * 2);
        ctx.arc(lensX + focalLength, axisY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Objeto
        const objX = lensObjXRef.current;
        const objH = 60;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(objX, axisY);
        ctx.lineTo(objX, axisY - objH);
        ctx.stroke();

        // Ecuación de lentes delgadas: 1/f = 1/do + 1/di
        const dObj = lensX - objX;
        const dImg = dObj !== focalLength ? (focalLength * dObj) / (dObj - focalLength) : 9999;
        const mag = -dImg / dObj;
        const imgX = lensX + dImg;
        const imgH = objH * mag;

        // Rayos principales
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(objX, axisY - objH);
        ctx.lineTo(lensX, axisY - objH);
        ctx.lineTo(imgX, axisY - imgH);
        ctx.moveTo(objX, axisY - objH);
        ctx.lineTo(imgX, axisY - imgH);
        ctx.stroke();

        // Imagen formada
        if (imgX > 0 && imgX < W) {
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(imgX, axisY);
          ctx.lineTo(imgX, axisY - imgH);
          ctx.stroke();
        }

        onTelemetryUpdate({
          t: Number(t.toFixed(1)),
          x: Number(dObj.toFixed(1)),
          v: Number(dImg.toFixed(1)),
          a: Number(mag.toFixed(2)),
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeSim, running, slowMo, v0, angle, g, mass, mu, length, restitution, kSpring, focalLength, onTelemetryUpdate]);

  const handleCanvasPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 680;
    if (activeSim === 'projectile') {
      targetXRef.current = Math.max(180, Math.min(640, x));
    } else if (activeSim === 'optics') {
      lensObjXRef.current = Math.max(50, Math.min(300, x));
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector horizontal de simuladores */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SIM_LIST.map((sim) => (
          <button
            key={sim.id}
            onClick={() => onSelectSim(sim.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              activeSim === sim.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
            }`}
          >
            {sim.name}
          </button>
        ))}
      </div>

      {/* Lienzo principal */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-lg">
        <canvas
          ref={canvasRef}
          width={680}
          height={340}
          onPointerDown={handleCanvasPointer}
          className="w-full h-[300px] sm:h-[340px] block cursor-crosshair"
        />

        {/* Controles flotantes */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/90 text-white border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning(!running)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? 'Pausar' : 'Reanudar'}
            </button>
            <button
              onClick={() => setSlowMo(!slowMo)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                slowMo ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'border-slate-700 text-slate-300'
              }`}
            >
              <Gauge className="w-4 h-4" />
              Cámara Lenta (0.25x)
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </button>
          </div>
          <span className="text-xs text-slate-400">
            Haz clic en el lienzo para mover la diana u objeto óptico
          </span>
        </div>
      </div>

      {/* Controles paramétricos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {(activeSim === 'projectile' || activeSim === 'incline' || activeSim === 'pendulum') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Ángulo θ: {angle}°
            </label>
            <input
              type="range"
              min={10}
              max={80}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}

        {activeSim === 'projectile' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Velocidad inicial v₀: {v0} m/s
            </label>
            <input
              type="range"
              min={5}
              max={45}
              value={v0}
              onChange={(e) => setV0(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}

        {(activeSim === 'projectile' || activeSim === 'incline' || activeSim === 'pendulum') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Gravedad g: {g} m/s²
            </label>
            <div className="flex gap-1.5">
              {[
                { label: 'Tierra', val: 9.81 },
                { label: 'Luna', val: 1.62 },
                { label: 'Marte', val: 3.71 },
              ].map((planet) => (
                <button
                  key={planet.label}
                  onClick={() => setG(planet.val)}
                  className={`flex-1 py-1 rounded-lg text-xs font-medium border ${
                    g === planet.val
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {planet.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {(activeSim === 'incline' || activeSim === 'collisions' || activeSim === 'spring') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Masa m: {mass} kg
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}

        {activeSim === 'incline' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Coef. Rozamiento μ: {mu}
            </label>
            <input
              type="range"
              min={0}
              max={0.6}
              step={0.05}
              value={mu}
              onChange={(e) => setMu(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}

        {activeSim === 'pendulum' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Longitud L: {length} m
            </label>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}

        {activeSim === 'collisions' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Elasticidad (e): {restitution}
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={restitution}
              onChange={(e) => setRestitution(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}

        {activeSim === 'spring' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Constante k: {kSpring} N/m
            </label>
            <input
              type="range"
              min={5}
              max={80}
              value={kSpring}
              onChange={(e) => setKSpring(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}

        {activeSim === 'optics' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Distancia Focal f: {focalLength} px
            </label>
            <input
              type="range"
              min={60}
              max={180}
              value={focalLength}
              onChange={(e) => setFocalLength(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}
