import { useEffect, useState, type CSSProperties } from 'react';
import type { Person } from '../types';
import { initials } from '../lib/util';

export function Mandala({ color = 'currentColor', className, style }: { color?: string; className?: string; style?: CSSProperties }) {
  const rings = [
    { n: 32, r: 92, len: 10, w: 4 },
    { n: 24, r: 76, len: 13, w: 6 },
    { n: 16, r: 56, len: 16, w: 8 },
    { n: 12, r: 34, len: 14, w: 7 },
  ];
  return (
    <svg viewBox="-100 -100 200 200" className={className} style={style} aria-hidden>
      <g fill="none" stroke={color} strokeWidth="0.8">
        <circle r="98" />
        <circle r="86" strokeDasharray="1 3" />
        <circle r="66" />
        <circle r="45" strokeDasharray="2 2" />
        <circle r="22" />
        {rings.map((ring, i) =>
          Array.from({ length: ring.n }).map((_, j) => (
            <path
              key={`${i}-${j}`}
              transform={`rotate(${(360 / ring.n) * j + (i % 2 ? 180 / ring.n : 0)})`}
              d={`M0 ${-ring.r + ring.len} Q ${ring.w} ${-ring.r + ring.len / 2} 0 ${-ring.r} Q ${-ring.w} ${-ring.r + ring.len / 2} 0 ${-ring.r + ring.len}Z`}
            />
          )),
        )}
        {Array.from({ length: 8 }).map((_, j) => (
          <circle key={j} r="2" cx="0" cy="-14" transform={`rotate(${j * 45})`} fill={color} />
        ))}
      </g>
    </svg>
  );
}

export function Corner({ color, className, style }: { color: string; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 60 V4 H60" />
        <path d="M10 48 V10 H48" strokeWidth="0.8" />
        <path d="M4 4 Q 30 10 34 34 Q 10 30 4 4Z" fill={color} fillOpacity=".15" />
        <path d="M18 18 C 30 18 40 26 42 42" />
        <path d="M42 42 c 6 -2 10 -8 8 -14 c -5 2 -8 8 -8 14z" fill={color} fillOpacity=".5" />
        <path d="M42 42 c -2 6 -8 10 -14 8 c 2 -5 8 -8 14 -8z" fill={color} fillOpacity=".5" />
        <path d="M60 4 q 8 4 14 0 q -4 8 -14 0" fill={color} />
        <path d="M4 60 q 4 8 0 14 q 8 -4 0 -14" fill={color} />
        <circle cx="68" cy="4" r="1.8" fill={color} />
        <circle cx="4" cy="68" r="1.8" fill={color} />
        <circle cx="76" cy="4" r="1.2" fill={color} />
        <circle cx="4" cy="76" r="1.2" fill={color} />
      </g>
    </svg>
  );
}

export function Divider({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={className ?? 'mx-auto h-6 w-56'} aria-hidden>
      <g fill="none" stroke={color} strokeWidth="1">
        <path d="M0 12 H92" />
        <path d="M148 12 H240" />
        <path d="M20 12 q 10 -6 20 0 q 10 6 20 0" strokeWidth=".7" />
        <path d="M180 12 q 10 -6 20 0 q 10 6 20 0" strokeWidth=".7" />
        {/* lotus */}
        <path d="M120 4 C 126 9 126 15 120 20 C 114 15 114 9 120 4Z" fill={color} fillOpacity=".85" />
        <path d="M120 20 C 112 18 106 13 104 8 C 111 9 117 13 120 20Z" fill={color} fillOpacity=".5" />
        <path d="M120 20 C 128 18 134 13 136 8 C 129 9 123 13 120 20Z" fill={color} fillOpacity=".5" />
        <circle cx="98" cy="12" r="2" fill={color} />
        <circle cx="142" cy="12" r="2" fill={color} />
      </g>
    </svg>
  );
}

export function Avatar({ person, size = 120, ring, ink, className }: { person?: Person; size?: number; ring: string; ink?: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [person?.photo]);
  return (
    <div
      className={`relative shrink-0 rounded-full p-[3px] ${className ?? ''}`}
      style={{ width: size, height: size, background: `conic-gradient(from 0deg, ${ring}, #fff7d1, ${ring}, #8a6414, ${ring})` }}
    >
      <div className="h-full w-full overflow-hidden rounded-full border-2 border-white/70 bg-black/10">
        {person?.photo && !broken ? (
          <img src={person.photo} alt={person.name} className="h-full w-full object-cover" onError={() => setBroken(true)} />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-deco"
            style={{ fontSize: size * 0.38, color: ink || '#7a1426', background: 'radial-gradient(circle at 35% 30%, #fffaf0, #f1e2c2 70%, #e2cc9c)' }}
          >
            {initials(person)}
          </div>
        )}
      </div>
    </div>
  );
}

export function GoldText({ children, gold, gold2, className, style }: { children: React.ReactNode; gold: string; gold2: string; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`gold-shimmer bg-clip-text text-transparent ${className ?? ''}`}
      style={{ backgroundImage: `linear-gradient(100deg, ${gold} 0%, ${gold2} 25%, ${gold} 50%, #a8791d 75%, ${gold} 100%)`, ...style }}
    >
      {children}
    </span>
  );
}
