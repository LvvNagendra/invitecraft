import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { ParticleKind } from '../lib/themes';

export interface ParticlesHandle {
  burst: (x?: number, y?: number, kinds?: ParticleKind[], count?: number) => void;
  fireworks: (n?: number) => void;
}

interface P {
  kind: ParticleKind | 'spark';
  x: number; y: number; vx: number; vy: number;
  size: number; rot: number; vr: number; phase: number;
  color: string; life: number; maxLife: number; ambient: boolean;
  g: number;
}

interface Rocket { x: number; y: number; vy: number; ty: number; color: string }

const RISING: ParticleKind[] = ['balloon', 'diya', 'bubble'];
const CONFETTI = ['#f6c344', '#e85d75', '#4fc3f7', '#81c784', '#ba68c8', '#ff8a65'];
const BALLOONS = ['#e63950', '#f4b400', '#4285f4', '#9c27b0', '#ff7043', '#26a69a'];
const PETALS = ['#c2185b', '#d81b60', '#e04a6e', '#b71c1c', '#f06292'];

function pick<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }

export const Particles = forwardRef<ParticlesHandle, {
  kinds: ParticleKind[];
  density?: number;
  gold?: string;
  active?: boolean;
  className?: string;
}>(function Particles({ kinds, density = 26, gold = '#e8c25a', active = true, className }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const parts = useRef<P[]>([]);
  const rockets = useRef<Rocket[]>([]);
  const size = useRef({ w: 300, h: 600 });
  const cfg = useRef({ kinds, density, gold, active });
  cfg.current = { kinds, density, gold, active };

  const colorFor = (k: ParticleKind | 'spark') => {
    switch (k) {
      case 'petal': return pick(PETALS);
      case 'heart': return pick(['#e0245e', '#ff4d6d', '#ff8fab', '#c9184a']);
      case 'confetti': return pick(CONFETTI);
      case 'balloon': return pick(BALLOONS);
      case 'marigold': return pick(['#ff9800', '#ffb300', '#f57c00']);
      case 'star': return pick(['#fff3b0', '#ffe082', '#ffffff']);
      case 'bubble': return pick(['#b3e5fc', '#f8bbd0', '#e1bee7']);
      default: return cfg.current.gold;
    }
  };

  const spawn = (kind: ParticleKind, ambient: boolean, x?: number, y?: number): P => {
    const { w, h } = size.current;
    const rising = RISING.includes(kind);
    const base: P = {
      kind, ambient,
      x: x ?? Math.random() * w,
      y: y ?? (rising ? h + 30 + Math.random() * h * 0.3 : -30 - Math.random() * h * 0.5),
      vx: (Math.random() - 0.5) * 0.4,
      vy: rising ? -(0.35 + Math.random() * 0.5) : 0.45 + Math.random() * 0.7,
      size: 6 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.04,
      phase: Math.random() * Math.PI * 2,
      color: colorFor(kind), life: 0, maxLife: Infinity, g: 0,
    };
    if (kind === 'sparkle' || kind === 'star') { base.size = 2 + Math.random() * 3.5; base.vy *= 0.5; }
    if (kind === 'balloon') base.size = 14 + Math.random() * 10;
    if (kind === 'diya') base.size = 5 + Math.random() * 4;
    if (kind === 'confetti') base.size = 5 + Math.random() * 5;
    return base;
  };

  useImperativeHandle(ref, () => ({
    burst(x, y, kinds = cfg.current.kinds, count = 70) {
      const { w, h } = size.current;
      const cx = x ?? w / 2, cy = y ?? h / 2;
      for (let i = 0; i < count; i++) {
        const k = kinds[i % kinds.length];
        const p = spawn(k, false, cx, cy);
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 6;
        p.vx = Math.cos(a) * s;
        p.vy = Math.sin(a) * s - 2.5;
        p.g = 0.09;
        p.maxLife = 110 + Math.random() * 80;
        if (k === 'sparkle') p.size = 2 + Math.random() * 3;
        parts.current.push(p);
      }
    },
    fireworks(n = 5) {
      const { w, h } = size.current;
      for (let i = 0; i < n; i++) {
        setTimeout(() => {
          rockets.current.push({
            x: w * (0.15 + Math.random() * 0.7), y: h + 10, vy: -(7 + Math.random() * 3),
            ty: h * (0.15 + Math.random() * 0.3), color: pick([cfg.current.gold, ...CONFETTI]),
          });
        }, i * 380);
      }
    },
  }));

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext('2d')!;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size.current = { w: r.width, h: r.height };
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c.parentElement!);

    let raf = 0;
    let t = 0;
    const loop = () => {
      t++;
      const { w, h } = size.current;
      const { kinds, density, active } = cfg.current;
      ctx.clearRect(0, 0, w, h);

      // keep ambient population
      const target = active ? Math.round((reduce ? density / 3 : density) * Math.min(1.4, (w * h) / (390 * 800))) : 0;
      const ambient = parts.current.filter((p) => p.ambient).length;
      if (ambient < target && t % 6 === 0 && kinds.length) parts.current.push(spawn(pick(kinds), true));

      // rockets
      rockets.current = rockets.current.filter((r) => {
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = r.color;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.ty || r.vy > -1.5) {
          for (let i = 0; i < 60; i++) {
            const a = (i / 60) * Math.PI * 2;
            const s = 2 + Math.random() * 2.6;
            parts.current.push({
              kind: 'spark', ambient: false, x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
              size: 2, rot: 0, vr: 0, phase: 0, color: Math.random() > 0.3 ? r.color : '#fff', life: 0,
              maxLife: 60 + Math.random() * 30, g: 0.04,
            });
          }
          return false;
        }
        return true;
      });

      const next: P[] = [];
      for (const p of parts.current) {
        p.life++;
        p.phase += 0.03;
        p.vy += p.g;
        if (!p.ambient) { p.vx *= 0.985; p.vy *= 0.99; }
        p.x += p.vx + (p.ambient ? Math.sin(p.phase) * 0.5 : 0);
        p.y += p.vy;
        p.rot += p.vr;
        const fade = p.maxLife === Infinity ? 1 : Math.max(0, 1 - p.life / p.maxLife);
        const out = p.y > h + 60 || p.y < -h * 0.9 || p.x < -60 || p.x > w + 60;
        if (fade <= 0 || (p.ambient && out && p.life > 30)) continue;
        if (!p.ambient && out) continue;
        next.push(p);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        draw(ctx, p, t);
        ctx.restore();
      }
      parts.current = next;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvas} className={className ?? 'pointer-events-none absolute inset-0 z-20'} aria-hidden />;
});

function draw(ctx: CanvasRenderingContext2D, p: P, t: number) {
  const s = p.size;
  switch (p.kind) {
    case 'petal': {
      ctx.rotate(p.rot);
      ctx.scale(1, 0.55 + Math.abs(Math.sin(p.phase * 2)) * 0.45);
      const g = ctx.createLinearGradient(-s, 0, s, 0);
      g.addColorStop(0, p.color);
      g.addColorStop(1, '#ffb3c6');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.8, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.8, -s * 0.9, -s * 0.6, 0, -s);
      ctx.fill();
      break;
    }
    case 'sparkle':
    case 'spark': {
      const tw = p.kind === 'spark' ? 1 : 0.5 + Math.abs(Math.sin(p.phase * 3)) * 0.5;
      ctx.globalAlpha *= tw;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -s * 2);
      ctx.quadraticCurveTo(0, 0, s * 2, 0);
      ctx.quadraticCurveTo(0, 0, 0, s * 2);
      ctx.quadraticCurveTo(0, 0, -s * 2, 0);
      ctx.quadraticCurveTo(0, 0, 0, -s * 2);
      ctx.fill();
      break;
    }
    case 'heart': {
      ctx.rotate(Math.sin(p.phase) * 0.3);
      ctx.fillStyle = p.color;
      const k = s / 10;
      ctx.scale(k, k);
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(0, 0, -5, -2, -9, 1);
      ctx.bezierCurveTo(-13, 5, -8, 11, 0, 16);
      ctx.bezierCurveTo(8, 11, 13, 5, 9, 1);
      ctx.bezierCurveTo(5, -2, 0, 0, 0, 3);
      ctx.fill();
      break;
    }
    case 'confetti': {
      ctx.rotate(p.rot);
      ctx.scale(1, Math.sin(p.phase * 4));
      ctx.fillStyle = p.color;
      ctx.fillRect(-s / 2, -s / 4, s, s / 2);
      break;
    }
    case 'balloon': {
      ctx.rotate(Math.sin(p.phase) * 0.12);
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, s * 1.2);
      ctx.quadraticCurveTo(4, s * 1.8, 0, s * 2.6);
      ctx.stroke();
      const g = ctx.createRadialGradient(-s * 0.3, -s * 0.4, 1, 0, 0, s * 1.2);
      g.addColorStop(0, '#ffffffaa');
      g.addColorStop(0.25, p.color);
      g.addColorStop(1, p.color);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.85, s * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2, s * 1.08);
      ctx.lineTo(2, s * 1.08);
      ctx.lineTo(0, s * 1.25);
      ctx.fill();
      break;
    }
    case 'marigold': {
      ctx.rotate(p.rot);
      for (let i = 0; i < 10; i++) {
        ctx.rotate((Math.PI * 2) / 10);
        ctx.fillStyle = i % 2 ? p.color : '#ffc107';
        ctx.beginPath();
        ctx.ellipse(s * 0.45, 0, s * 0.45, s * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#e65100';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'diya': {
      const flick = 1 + Math.sin(t * 0.3 + p.phase * 10) * 0.12;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 4);
      g.addColorStop(0, 'rgba(255,200,80,.55)');
      g.addColorStop(1, 'rgba(255,140,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, s * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.6 * flick);
      ctx.quadraticCurveTo(s * 0.8, 0, 0, s * 0.5);
      ctx.quadraticCurveTo(-s * 0.8, 0, 0, -s * 1.6 * flick);
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.8, s * 1.3, s * 0.5, 0, 0, Math.PI);
      ctx.fill();
      break;
    }
    case 'star': {
      ctx.globalAlpha *= 0.5 + Math.abs(Math.sin(p.phase * 2)) * 0.5;
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#fff6c0';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? s : s * 2.4;
        const a = (i * Math.PI) / 5;
        ctx.lineTo(Math.sin(a) * r, -Math.cos(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'bubble': {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha *= 0.7;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath();
      ctx.arc(-s * 0.35, -s * 0.35, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}
