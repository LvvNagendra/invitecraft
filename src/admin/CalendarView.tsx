import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../lib/store';
import { go } from '../lib/router';
import { EVENTS } from '../lib/themes';
import { displayNames } from '../lib/util';
import { Btn, Card, cx, PageHeader } from './ui';

export function CalendarView() {
  const invitations = useStore((s) => s.invitations);
  const [cur, setCur] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const y = cur.getFullYear(), m = cur.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  // main dates + sub events
  const items = invitations.flatMap((i) => [
    { date: i.date, label: `${EVENTS[i.type].emoji} ${displayNames(i)}`, id: i.id, main: true },
    ...i.events.filter((e) => e.date !== i.date || e.title).map((e) => ({ date: e.date, label: `${e.title} · ${displayNames(i)}`, id: i.id, main: false })),
  ]);
  const key = (d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div>
      <PageHeader
        title="Event Calendar"
        sub="All client events and functions at a glance"
        actions={
          <div className="flex items-center gap-2">
            <Btn size="sm" onClick={() => setCur(new Date(y, m - 1, 1))} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></Btn>
            <span className="w-36 text-center font-display font-semibold text-wine-900">{cur.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
            <Btn size="sm" onClick={() => setCur(new Date(y, m + 1, 1))} aria-label="Next"><ChevronRight className="h-4 w-4" /></Btn>
          </div>
        }
      />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-stone-100 bg-stone-50 text-center text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: first }).map((_, i) => <div key={`b${i}`} className="min-h-20 border-b border-r border-stone-100 bg-stone-50/50 sm:min-h-28" />)}
          {Array.from({ length: days }).map((_, i) => {
            const d = i + 1;
            const k = key(d);
            const its = items.filter((x) => x.date === k);
            return (
              <div key={d} className={cx('min-h-20 border-b border-r border-stone-100 p-1 sm:min-h-28 sm:p-2', k === today && 'bg-brand-50')}>
                <p className={cx('mb-1 text-xs', k === today ? 'font-bold text-wine-800' : 'text-stone-500')}>{d}</p>
                <div className="space-y-1">
                  {its.slice(0, 3).map((x, j) => (
                    <button key={j} type="button" onClick={() => go(`/share/${x.id}`)} className={cx('block w-full truncate rounded px-1 py-0.5 text-left text-[10px] sm:text-[11px]', x.main ? 'bg-wine-800 text-white' : 'bg-brand-100 text-brand-600')}>{x.label}</button>
                  ))}
                  {its.length > 3 && <p className="text-[10px] text-stone-400">+{its.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
