import { ArrowRight, CalendarClock, CheckCircle2, Eye, IndianRupee, Send, Share2, Sparkles, Users } from 'lucide-react';
import { useStore } from '../lib/store';
import { go } from '../lib/router';
import { EVENTS } from '../lib/themes';
import { daysUntil, displayNames, fmtDate } from '../lib/util';
import type { EventType } from '../types';
import { Badge, Btn, Card } from './ui';
import { InviteThumb } from './Thumb';

export function Dashboard() {
  const invitations = useStore((s) => s.invitations);
  const clients = useStore((s) => s.clients);
  const settings = useStore((s) => s.settings);

  const upcoming = invitations.filter((i) => daysUntil(i.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const guests = invitations.reduce((n, i) => n + i.guests.length, 0);
  const sent = invitations.reduce((n, i) => n + i.guests.filter((g) => g.sent).length, 0);
  const revenue = invitations.reduce((n, i) => n + (i.paid ? i.price || 0 : 0), 0);
  const pending = invitations.reduce((n, i) => n + (!i.paid ? i.price || 0 : 0), 0);
  const hour = new Date().getHours();

  return (
    <div className="space-y-8">
      {/* hero */}
      <div className="relative overflow-hidden rounded-3xl bg-wine-900 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#d4a437]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/60">{hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'} 👋</p>
            <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              Create invitations that feel like a <span className="bg-[linear-gradient(100deg,#d4a437,#f6e27a,#d4a437)] bg-clip-text text-transparent">surprise</span>.
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/70">Cinematic envelope opening, live countdown, RSVP on WhatsApp and personalised greetings — ready to share in minutes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn variant="gold" size="lg" onClick={() => go('/create')}><Sparkles className="h-4 w-4" /> New Invitation</Btn>
            {invitations[0] && <Btn size="lg" className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/20" onClick={() => go(`/preview/${invitations[0].id}`)}><Eye className="h-4 w-4" /> Live Demo</Btn>}
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Sparkles />} label="Invitations" value={invitations.length} sub={`${upcoming.length} upcoming`} />
        <Stat icon={<Users />} label="Clients" value={clients.length} sub="in your book" />
        <Stat icon={<Send />} label="Guests invited" value={`${sent}/${guests}`} sub="sent on WhatsApp" />
        <Stat icon={<IndianRupee />} label="Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} sub={pending ? `₹${pending.toLocaleString('en-IN')} pending` : 'all collected'} />
      </div>

      {/* quick create */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-wine-900">Start from an occasion</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {(Object.keys(EVENTS) as EventType[]).map((t) => (
            <button key={t} type="button" onClick={() => go(`/create/${t}`)} className="group rounded-2xl border border-stone-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg">
              <span className="text-3xl transition group-hover:scale-110 inline-block">{EVENTS[t].emoji}</span>
              <p className="mt-2 text-xs font-medium text-stone-700">{EVENTS[t].label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* recent */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-wine-900">Recent invitations</h2>
            <button type="button" onClick={() => go('/gallery')} className="flex items-center gap-1 text-sm text-brand-600 hover:underline">View all <ArrowRight className="h-4 w-4" /></button>
          </div>
          {invitations.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-400">No invitations yet — create your first one!</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {invitations.slice(0, 6).map((i) => (
                <div key={i.id} className="flex items-center gap-3 py-3">
                  <InviteThumb inv={i} className="h-16 w-12 shrink-0 rounded-lg [&_p]:hidden [&_span]:text-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-stone-800">{displayNames(i) || 'Untitled'} <span className="text-xs text-stone-400">· {i.code}</span></p>
                    <p className="text-xs text-stone-500">{EVENTS[i.type].label} · {fmtDate(i.date, 'en', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <StatusBadge status={i.status} />
                  <Btn size="sm" variant="ghost" onClick={() => go(`/share/${i.id}`)} aria-label="Share"><Share2 className="h-4 w-4" /></Btn>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* upcoming */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-wine-900"><CalendarClock className="h-5 w-5 text-brand-500" /> Upcoming events</h2>
          {upcoming.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-400">Nothing scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((i) => {
                const d = daysUntil(i.date);
                return (
                  <button key={i.id} type="button" onClick={() => go(`/share/${i.id}`)} className="flex w-full items-center gap-3 rounded-xl border border-stone-100 p-3 text-left hover:border-brand-400">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-wine-800">
                      <span className="text-lg font-bold leading-none">{d}</span>
                      <span className="text-[9px] uppercase">{d === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{EVENTS[i.type].emoji} {displayNames(i)}</p>
                      <p className="truncate text-xs text-stone-500">{i.venueName || 'Venue TBD'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card className="grid gap-4 p-5 sm:grid-cols-3">
        {[
          ['1. Create', 'Pick an occasion, theme and fill details with a live phone preview.'],
          ['2. Personalise', 'Add guest names — every relative gets a link with their own greeting.'],
          ['3. Share', 'One tap WhatsApp message, QR code, HD image & PDF for print.'],
        ].map(([t, d]) => (
          <div key={t} className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            <div><p className="font-semibold text-stone-800">{t}</p><p className="text-sm text-stone-500">{d}</p></div>
          </div>
        ))}
      </Card>
      {!settings.publicUrl && (
        <p className="text-center text-xs text-stone-400">Tip: set your published website address in Settings so shared links open for relatives.</p>
      )}
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-stone-500 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-brand-500">{icon}<span className="text-xs font-medium uppercase tracking-wide">{label}</span></div>
      <p className="mt-2 font-display text-2xl font-semibold text-wine-900">{value}</p>
      <p className="text-xs text-stone-400">{sub}</p>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return status === 'sent' ? <Badge tone="green">Sent</Badge> : status === 'ready' ? <Badge tone="blue">Ready</Badge> : <Badge tone="amber">Draft</Badge>;
}
