import { CalendarDays, Images, LayoutDashboard, LogOut, PenLine, Plus, Settings as Cog, Sparkles, Users } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { isLoggedIn, logout } from '../lib/auth';
import { Login } from './Login';
import { loadStore, useStore } from '../lib/store';
import { go } from '../lib/router';
import { cx, Toaster } from './ui';
import { Dashboard } from './Dashboard';
import { Editor } from './Editor';
import { SharePage } from './SharePage';
import { Clients } from './Clients';
import { Gallery } from './Gallery';
import { Studio } from './Studio';
import { CalendarView } from './CalendarView';
import { SettingsPage } from './SettingsPage';

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/gallery', label: 'Invitations', icon: Images },
  { path: '/create', label: 'Create', icon: Plus, cta: true },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/studio', label: 'Message Studio', icon: PenLine },
  { path: '/calendar', label: 'Event Calendar', icon: CalendarDays },
  { path: '/settings', label: 'Settings', icon: Cog },
];

export function AdminApp({ hash }: { hash: string }) {
  const ready = useStore((s) => s.ready);
  const settings = useStore((s) => s.settings);
  const [authed, setAuthed] = useState(isLoggedIn());
  useEffect(() => { if (!ready) loadStore(); }, [ready]);
  useEffect(() => { document.title = `${settings.businessName} — Admin`; }, [settings.businessName]);

  const [path, ...rest] = hash.split('?')[0].split('/').filter(Boolean);
  const param = rest[0];

  let page: ReactNode;
  if (!ready) page = <div className="p-10 text-stone-400">Loading…</div>;
  else
    switch (path) {
      case 'create': page = <Editor key={`new-${param || ''}`} newType={param as any} />; break;
      case 'edit': page = <Editor key={param} id={param} />; break;
      case 'share': page = <SharePage id={param} />; break;
      case 'clients': page = <Clients />; break;
      case 'gallery': page = <Gallery />; break;
      case 'studio': page = <Studio />; break;
      case 'calendar': page = <CalendarView />; break;
      case 'settings': page = <SettingsPage />; break;
      default: page = <Dashboard />;
    }

  if (!authed) return <Login businessName={settings.businessName} onDone={() => setAuthed(true)} />;

  const active = (p: string) => (p === '/' ? !path : `/${path}` === p || (p === '/gallery' && (path === 'edit' || path === 'share')));

  return (
    <div className="flex h-full bg-[#faf7f2]">
      {/* sidebar */}
      <aside className="relative hidden w-64 shrink-0 flex-col overflow-hidden bg-wine-900 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl" />
        <button type="button" onClick={() => go('/')} className="relative flex items-center gap-3 px-6 py-6 text-left">
          <img src="./favicon.svg" alt="" className="h-10 w-10" />
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-[#f6e27a]">{settings.businessName}</p>
            <p className="text-[11px] text-white/50">{settings.tagline}</p>
          </div>
        </button>
        <nav className="relative flex-1 space-y-1 px-3">
          {NAV.map((n) =>
            n.cta ? (
              <button key={n.path} type="button" onClick={() => go(n.path)} className="my-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#d4a437,#f6e27a,#d4a437)] px-4 py-2.5 text-sm font-semibold text-wine-900 shadow-lg">
                <Sparkles className="h-4 w-4" /> New Invitation
              </button>
            ) : (
              <button
                key={n.path}
                type="button"
                onClick={() => go(n.path)}
                className={cx('flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition', active(n.path) ? 'bg-white/10 font-medium text-[#f6e27a]' : 'text-white/70 hover:bg-white/5 hover:text-white')}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </button>
            ),
          )}
        </nav>
        <button type="button" onClick={() => { logout(); setAuthed(false); }} className="relative mx-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <div className="relative m-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
          <p className="font-medium text-white/80">Data stays on this device</p>
          <p className="mt-1">Back up regularly from Settings → Backup.</p>
        </div>
      </aside>

      <main className="relative flex-1 overflow-y-auto pb-24 lg:pb-0">
        {/* mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-[#faf7f2]/90 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => go('/')} className="flex items-center gap-2">
            <img src="./favicon.svg" alt="" className="h-8 w-8" />
            <span className="font-display text-base font-semibold text-wine-900">{settings.businessName}</span>
          </button>
          <div className="flex items-center">
            <button type="button" onClick={() => go('/settings')} className="rounded-full p-2 hover:bg-black/5" aria-label="Settings"><Cog className="h-5 w-5 text-stone-600" /></button>
            <button type="button" onClick={() => { logout(); setAuthed(false); }} className="rounded-full p-2 hover:bg-black/5" aria-label="Sign out"><LogOut className="h-5 w-5 text-stone-600" /></button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{page}</div>
      </main>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-stone-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {[NAV[0], NAV[1], NAV[2], NAV[3], NAV[5]].map((n) => (
          <button key={n.path} type="button" onClick={() => go(n.path)} className="flex flex-col items-center gap-0.5 py-2 text-[10px]">
            {n.cta ? (
              <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d4a437,#f6e27a)] text-wine-900 shadow-lg ring-4 ring-white"><Plus className="h-6 w-6" /></span>
            ) : (
              <n.icon className={cx('h-5 w-5', active(n.path) ? 'text-wine-800' : 'text-stone-400')} />
            )}
            <span className={active(n.path) ? 'font-semibold text-wine-800' : 'text-stone-500'}>{n.cta ? 'Create' : n.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
      <Toaster />
    </div>
  );
}
