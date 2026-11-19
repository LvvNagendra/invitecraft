import type { Invitation } from '../types';
import { EVENTS, THEMES } from '../lib/themes';
import { displayNames, fmtDate } from '../lib/util';
import { Mandala } from '../components/Ornaments';

export function InviteThumb({ inv, className }: { inv: Invitation; className?: string }) {
  const th = THEMES[inv.theme];
  const ev = EVENTS[inv.type];
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={{ background: `radial-gradient(ellipse at 50% 30%, ${th.bg2}, ${th.bg1})`, color: th.ink }}>
      <Mandala color={th.gold} className="absolute left-1/2 top-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-15" />
      <div className="relative flex h-full flex-col items-center justify-center p-4 text-center">
        <span className="text-2xl">{ev.emoji}</span>
        <p className="mt-1 font-display text-[9px] uppercase tracking-[0.3em] opacity-70">{ev.label}</p>
        <p className="mt-1 font-script text-2xl leading-tight" style={{ color: th.gold2 }}>{displayNames(inv) || 'Untitled'}</p>
        <p className="mt-1 font-display text-[10px] tracking-widest opacity-80">{fmtDate(inv.date, 'en', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
      <div className="absolute inset-2 rounded-xl border" style={{ borderColor: `${th.gold}55` }} />
    </div>
  );
}
