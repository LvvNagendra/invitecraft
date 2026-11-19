import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'gold' | 'ghost' | 'outline' | 'danger' | 'whatsapp';
export function Btn({ variant = 'outline', className, children, size = 'md', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  const v: Record<Variant, string> = {
    primary: 'bg-wine-800 text-white hover:bg-wine-700 shadow-sm',
    gold: 'text-wine-900 shadow-sm bg-[linear-gradient(100deg,#d4a437,#f6e27a,#d4a437)] hover:brightness-105',
    ghost: 'hover:bg-black/5 text-stone-700',
    outline: 'border border-stone-200 bg-white hover:border-brand-400 hover:bg-brand-50 text-stone-800',
    danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#1ebe5b] shadow-sm',
  };
  const s = { sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-6 text-[15px] gap-2' }[size];
  return (
    <button type="button" className={cx('inline-flex shrink-0 items-center justify-center rounded-xl font-medium transition active:scale-[.98] disabled:opacity-50', v[variant], s, className)} {...rest}>
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)]', className)}>{children}</div>;
}

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>}
    </label>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-wine-900 sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-stone-500">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className={cx('max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-wine-900">{title}</h3>
              <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-stone-100" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- toast ---------- */
let pushToast: (m: string) => void = () => {};
export const toast = (m: string) => pushToast(m);

export function Toaster() {
  const [items, setItems] = useState<{ id: number; m: string }[]>([]);
  useEffect(() => {
    pushToast = (m) => {
      const id = Date.now() + Math.random();
      setItems((x) => [...x, { id, m }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2600);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 lg:bottom-6">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white shadow-xl">
            {t.m}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Badge({ children, tone = 'stone' }: { children: ReactNode; tone?: 'stone' | 'green' | 'amber' | 'wine' | 'blue' }) {
  const t = {
    stone: 'bg-stone-100 text-stone-600',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    wine: 'bg-rose-50 text-wine-700 ring-rose-200',
    blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  }[tone];
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ring-black/5', t)}>{children}</span>;
}

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('relative mx-auto aspect-[9/19] w-full max-w-[340px] rounded-[44px] bg-stone-900 p-[10px] shadow-[0_40px_80px_-20px_rgba(0,0,0,.45)] ring-1 ring-stone-700', className)}>
      <div className="absolute left-1/2 top-[14px] z-50 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
      {/* transform makes position:fixed children stay inside the phone */}
      <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-black" style={{ transform: 'translateZ(0)' }}>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5">
      <span className="text-sm text-stone-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative h-6 w-11 rounded-full transition', checked ? 'bg-brand-500' : 'bg-stone-300')}
      >
        <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </label>
  );
}
