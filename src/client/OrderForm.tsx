import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Check, ChevronLeft, ChevronRight, Download, Eye, ImagePlus, MessageCircle, Plus, Share2, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { BusinessProfile, ClientOrder, EventItem, EventType, Invitation, Lang, Person, ThemeId } from '../types';
import { EVENTS, THEMES } from '../lib/themes';
import { BLESSINGS, studioMessages } from '../lib/messages';
import { compressImage } from '../lib/media';
import { orderCode } from '../lib/business';
import { plusDays } from '../lib/demos';
import { displayNames, downloadBlob, fmtDate, fmtTime, slug, uid, waLink } from '../lib/util';
import { Experience } from '../guest/Experience';
import { Btn, cx, Field, Toaster, toast } from '../admin/ui';

const STEPS = ['Occasion', 'Names', 'Date & Venue', 'Message', 'Photos', 'Send'] as const;
const DRAFT_KEY = 'invitecraft-client-form';

const blank = (): Partial<Invitation> => ({
  type: 'wedding', theme: 'royal', lang: 'en',
  hostA: { name: '' }, hostB: { name: '' },
  blessing: '|| Sri Ganeshaya Namaha ||', headline: 'Together with their families',
  message: '', invitedBy: '', date: plusDays(45), time: '10:30', timeLabel: 'Muhurtham',
  venueName: '', venueAddress: '', mapUrl: '', events: [], gallery: [], hostPhone: '',
  rsvpEnabled: true, effects: true, music: 'melody',
});

export function OrderForm({ profile }: { profile: BusinessProfile }) {
  const [step, setStep] = useState(0);
  const [inv, setInv] = useState<Partial<Invitation>>(() => {
    try { return { ...blank(), ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}').inv }; } catch { return blank(); }
  });
  const [client, setClient] = useState<ClientOrder['client']>(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}').client || { name: '', phone: '' }; } catch { return { name: '', phone: '' }; }
  });
  const [pkg, setPkg] = useState<string>(profile.packages.find((p) => p.popular)?.name || profile.packages[0]?.name || '');
  const [preview, setPreview] = useState(false);
  const [sent, setSent] = useState(false);
  const [ownSong, setOwnSong] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = `Invitation details — ${profile.name}`; }, [profile.name]);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ inv, client })); } catch { /* storage full or blocked */ }
  }, [inv, client]);
  useEffect(() => { top.current?.scrollIntoView({ behavior: 'smooth' }); }, [step]);

  const type = (inv.type || 'wedding') as EventType;
  const ev = EVENTS[type];
  const up = (p: Partial<Invitation>) => setInv((x) => ({ ...x, ...p }));
  const upA = (p: Partial<Person>) => setInv((x) => ({ ...x, hostA: { ...(x.hostA || { name: '' }), ...p } }));
  const upB = (p: Partial<Person>) => setInv((x) => ({ ...x, hostB: { ...(x.hostB || { name: '' }), ...p } }));

  const full = useMemo(() => ({
    id: 'preview', code: 'PREVIEW', ...blank(), ...inv,
    hostA: { name: inv.hostA?.name || ev.hostALabel, ...inv.hostA, ...(inv.hostA?.name ? {} : { name: ev.hostALabel }) },
    hostB: ev.twoHosts ? { ...(inv.hostB || { name: '' }), name: inv.hostB?.name || ev.hostBLabel! } : undefined,
    brand: profile.name,
  }) as any, [inv, ev, profile.name]);

  const validate = (s: number) => {
    if (s === 1 && !inv.hostA?.name?.trim()) return `Please enter the ${ev.hostALabel.toLowerCase()}'s name`;
    if (s === 1 && ev.twoHosts && !inv.hostB?.name?.trim()) return `Please enter the ${ev.hostBLabel!.toLowerCase()}'s name`;
    if (s === 2 && !inv.date) return 'Please choose the date';
    if (s === 2 && !inv.venueName?.trim()) return 'Please enter the venue name';
    if (s === 5 && !client.name.trim()) return 'Please enter your name';
    if (s === 5 && client.phone.replace(/\D/g, '').length < 10) return 'Please enter your WhatsApp number';
    return '';
  };
  const next = () => {
    const e = validate(step);
    if (e) return toast(e);
    setStep((x) => Math.min(STEPS.length - 1, x + 1));
  };

  const order = (): ClientOrder => ({ v: 1, client: { ...client, notes: [client.notes, ownSong && 'Will send our own song for music'].filter(Boolean).join('. ') }, pkg, inv: { ...inv, hostB: ev.twoHosts ? inv.hostB : undefined } });
  const photoCount = [inv.hostA?.photo, ev.twoHosts ? inv.hostB?.photo : undefined].filter(Boolean).length;
  const galleryCount = inv.gallery?.length || 0;

  const summary = () => {
    const o = order();
    const { code, portraits: portraitsIn } = orderCode(o);
    const L = [
      `🙏 New Invitation Request — ${profile.name}`,
      '',
      `📦 Package: ${pkg}`,
      `👤 ${client.name} · ${client.phone}${client.city ? ` · ${client.city}` : ''}`,
      '',
      `${ev.emoji} Occasion: ${ev.label}`,
      `• ${ev.hostALabel}: ${inv.hostA?.name}${inv.hostA?.parents ? ` (${inv.hostA.parents})` : ''}`,
      ev.twoHosts ? `• ${ev.hostBLabel}: ${inv.hostB?.name}${inv.hostB?.parents ? ` (${inv.hostB.parents})` : ''}` : '',
      inv.age ? `• ${inv.age}` : '',
      `📅 ${fmtDate(inv.date!)} · ${inv.timeLabel || 'Time'} ${fmtTime(inv.time!)}`,
      `📍 ${inv.venueName}${inv.venueAddress ? `, ${inv.venueAddress}` : ''}`,
      inv.events?.length ? `🗓️ Functions: ${inv.events.map((e) => e.title).filter(Boolean).join(', ')}` : '',
      `🎨 Theme: ${THEMES[inv.theme as ThemeId].name} · ${inv.lang === 'te' ? 'Telugu' : inv.lang === 'hi' ? 'Hindi' : 'English'}`,
      photoCount ? `📸 Portrait photos: ${photoCount} ${portraitsIn ? '(included below ✓)' : '(will send in this chat)'}` : '📸 Portrait photos: none',
      galleryCount ? `🖼️ Gallery photos: ${galleryCount} (sharing the details file in this chat)` : '',
      ownSong ? '🎶 Music: we will send our own song' : '',
      client.notes ? `📝 ${client.notes}` : '',
      '',
      `Details code (for ${profile.name} — please don't edit):`,
      code,
    ];
    return L.filter((x, i) => x !== '' || L[i - 1] !== '').join('\n');
  };

  const fileName = `${slug(displayNames(full))}-invitation-details.json`;
  const fileBlob = () => new Blob([JSON.stringify(order())], { type: 'application/json' });

  const sendWhatsApp = () => {
    const e = validate(5);
    if (e) return toast(e);
    window.open(waLink(summary(), profile.phone), '_blank');
    setSent(true);
  };
  const shareFile = async () => {
    const e = validate(5);
    if (e) return toast(e);
    const file = new File([fileBlob()], fileName, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Invitation details' }).catch(() => {});
    } else {
      downloadBlob(fileBlob(), fileName);
      toast('File downloaded — attach it in WhatsApp');
    }
  };

  return (
    <div className="min-h-full bg-[#faf7f2]">
      <div ref={top} />
      <header className="relative overflow-hidden bg-wine-900 px-5 pb-8 pt-8 text-center text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#d4a437]/25 blur-3xl" />
        <p className="relative font-display text-xs uppercase tracking-[0.3em] text-[#f6e27a]">{profile.name}</p>
        <h1 className="relative mt-2 font-display text-2xl font-semibold">Your Invitation Details</h1>
        <p className="relative mx-auto mt-1 max-w-sm text-sm text-white/70">Fill in your details — see a live preview anytime — and send them to us on WhatsApp.</p>
        <div className="relative mx-auto mt-5 flex max-w-md items-center gap-1">
          {STEPS.map((s, i) => (
            <button key={s} type="button" onClick={() => i < step && setStep(i)} className="flex flex-1 flex-col items-center gap-1">
              <span className={cx('h-1.5 w-full rounded-full transition', i <= step ? 'bg-[#f6e27a]' : 'bg-white/20')} />
              <span className={cx('hidden text-[10px] sm:block', i === step ? 'text-[#f6e27a]' : 'text-white/50')}>{s}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-36 pt-6">
        <p className="mb-4 font-display text-lg font-semibold text-wine-900">{step + 1}. {STEPS[step]}</p>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
            {step === 0 && (
              <>
                <Field label="What are you celebrating?">
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(EVENTS) as EventType[]).map((t) => (
                      <button key={t} type="button" onClick={() => up({ type: t, theme: EVENTS[t].defaultTheme, timeLabel: EVENTS[t].defaultTimeLabel, headline: EVENTS[t].twoHosts ? 'Together with their families' : 'With joy in our hearts' })} className={cx('rounded-2xl border bg-white p-3 text-center transition', type === t ? 'border-brand-500 ring-2 ring-brand-400/30' : 'border-stone-200')}>
                        <span className="text-2xl">{EVENTS[t].emoji}</span>
                        <p className="mt-1 text-[11px] font-medium">{EVENTS[t].label}</p>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Choose your colours">
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                      const th = THEMES[id];
                      return (
                        <button key={id} type="button" onClick={() => up({ theme: id })} className={cx('overflow-hidden rounded-2xl border-2 bg-white text-left', inv.theme === id ? 'border-brand-500 shadow-md' : 'border-transparent ring-1 ring-stone-200')}>
                          <div className="flex h-14 items-center justify-center gap-1" style={{ background: `linear-gradient(135deg, ${th.bg1}, ${th.bg2})` }}>
                            <span className="h-5 w-5 rounded-full ring-2 ring-white/50" style={{ background: th.gold }} />
                            <span className="h-5 w-5 rounded-full ring-2 ring-white/50" style={{ background: th.accent }} />
                            <span className="h-5 w-5 rounded-full ring-2 ring-white/50" style={{ background: th.card }} />
                          </div>
                          <p className="flex items-center justify-between px-3 py-2 text-xs font-medium">{th.name}{inv.theme === id && <Check className="h-3.5 w-3.5 text-brand-500" />}</p>
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Invitation language">
                  <div className="flex gap-2">
                    {([['en', 'English'], ['te', 'తెలుగు'], ['hi', 'हिन्दी']] as [Lang, string][]).map(([l, n]) => (
                      <button key={l} type="button" onClick={() => up({ lang: l, blessing: BLESSINGS[l][0] })} className={cx('flex-1 rounded-xl border bg-white px-3 py-2.5 text-sm', inv.lang === l ? 'border-brand-500 font-semibold ring-2 ring-brand-400/30' : 'border-stone-200')}>{n}</button>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <PersonCard label={ev.hostALabel} p={inv.hostA || { name: '' }} onChange={upA} />
                {ev.twoHosts && <PersonCard label={ev.hostBLabel!} p={inv.hostB || { name: '' }} onChange={upB} />}
                {ev.ageLabel && <Field label={ev.ageLabel}><input className="input" value={inv.age || ''} onChange={(e) => up({ age: e.target.value })} placeholder={type === 'birthday' ? '1st Birthday' : '25 Years Together'} /></Field>}
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date"><input type="date" className="input" value={inv.date} onChange={(e) => up({ date: e.target.value })} /></Field>
                  <Field label={inv.timeLabel || 'Time'}><input type="time" className="input" value={inv.time} onChange={(e) => up({ time: e.target.value })} /></Field>
                </div>
                <Field label="Venue name"><input className="input" value={inv.venueName} onChange={(e) => up({ venueName: e.target.value })} placeholder="Sri Convention Hall" /></Field>
                <Field label="Venue address / city"><input className="input" value={inv.venueAddress} onChange={(e) => up({ venueAddress: e.target.value })} placeholder="Banjara Hills, Hyderabad" /></Field>
                <Field label="Google Maps location link (optional)" hint="Open Google Maps → find the venue → Share → Copy link."><input className="input" value={inv.mapUrl} onChange={(e) => up({ mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" /></Field>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Other functions (optional)</p>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {ev.scheduleIdeas.map((s) => (
                      <button key={s} type="button" onClick={() => up({ events: [...(inv.events || []), { id: uid(), title: s, date: inv.date!, time: '10:00' }] })} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs text-brand-600">+ {s}</button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {(inv.events || []).map((e, i) => (
                      <EventRow key={e.id} e={e} onChange={(p) => up({ events: inv.events!.map((x, k) => (k === i ? { ...x, ...p } : x)) })} onRemove={() => up({ events: inv.events!.filter((_, k) => k !== i) })} />
                    ))}
                  </div>
                  <button type="button" onClick={() => up({ events: [...(inv.events || []), { id: uid(), title: '', date: inv.date!, time: '18:00' }] })} className="mt-2 flex items-center gap-1 text-sm font-medium text-brand-600"><Plus className="h-4 w-4" /> Add function</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Field label="Invitation message" hint="Tap a suggestion or write your own.">
                  <textarea className="input" rows={5} value={inv.message} onChange={(e) => up({ message: e.target.value })} />
                </Field>
                <div className="space-y-2">
                  {[...studioMessages(type, inv.lang as Lang), ...(inv.lang !== 'en' ? studioMessages(type, 'en').slice(0, 1) : [])].map((m, i) => (
                    <button key={i} type="button" onClick={() => up({ message: m.text })} className={cx('block w-full rounded-2xl border bg-white p-3 text-left text-sm', inv.message === m.text ? 'border-brand-500 ring-2 ring-brand-400/30' : 'border-stone-200')}>
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-600">{m.tone}</span>{m.text}
                    </button>
                  ))}
                </div>
                <Field label="Blessing line (top of card)">
                  <div className="flex flex-wrap gap-1.5">
                    {[...BLESSINGS[inv.lang as Lang], ''].map((b) => (
                      <button key={b || 'none'} type="button" onClick={() => up({ blessing: b })} className={cx('rounded-full border px-3 py-1.5 text-xs', inv.blessing === b ? 'border-brand-500 bg-brand-50 font-semibold' : 'border-stone-200 bg-white')}>{b || 'None'}</button>
                    ))}
                  </div>
                </Field>
                <Field label="Signed by" hint='e.g. "With love, Sharma & Rao Families"'>
                  <textarea className="input" rows={2} value={inv.invitedBy} onChange={(e) => up({ invitedBy: e.target.value })} />
                </Field>
                <Field label="WhatsApp number for guest RSVPs & wishes"><input className="input" inputMode="tel" value={inv.hostPhone} onChange={(e) => up({ hostPhone: e.target.value })} placeholder="98765 43210" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Dress code (optional)"><input className="input" value={inv.dressCode || ''} onChange={(e) => up({ dressCode: e.target.value })} /></Field>
                  <Field label="Hashtag (optional)"><input className="input" value={inv.hashtag || ''} onChange={(e) => up({ hashtag: e.target.value })} /></Field>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <Field label={`Gallery photos (${galleryCount}/6)`} hint="Pre-wedding shoot or family photos. Shown as a slideshow.">
                  <GalleryPick gallery={inv.gallery || []} onChange={(g) => up({ gallery: g })} />
                </Field>
                <Field label="Background music">
                  <div className="grid gap-2">
                    {([['melody', '🎵 Soft traditional melody'], ['own', '🎶 Our own song (we will send it)'], ['none', '🔇 No music']] as const).map(([m, l]) => {
                      const on = m === 'own' ? ownSong : !ownSong && inv.music === m;
                      return (
                        <button key={m} type="button" onClick={() => { setOwnSong(m === 'own'); up({ music: m === 'none' ? 'none' : 'melody' }); }} className={cx('rounded-xl border bg-white px-4 py-3 text-left text-sm', on ? 'border-brand-500 font-semibold ring-2 ring-brand-400/30' : 'border-stone-200')}>
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </>
            )}

            {step === 5 && (
              <>
                {profile.packages.length > 0 && (
                  <Field label="Choose your package">
                    <div className="space-y-2">
                      {profile.packages.map((p) => (
                        <button key={p.name} type="button" onClick={() => setPkg(p.name)} className={cx('relative flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left', pkg === p.name ? 'border-brand-500 ring-2 ring-brand-400/30' : 'border-stone-200')}>
                          <span>
                            <span className="font-semibold">{p.name}</span>
                            {p.popular && <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600">Most popular</span>}
                            <span className="mt-0.5 block text-xs text-stone-500">{p.features.filter(Boolean).slice(0, 3).join(' · ')}</span>
                          </span>
                          <span className="font-display text-lg font-semibold text-wine-800">₹{p.price.toLocaleString('en-IN')}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                )}
                <Field label="Your name"><input className="input" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Your WhatsApp"><input className="input" inputMode="tel" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} /></Field>
                  <Field label="City"><input className="input" value={client.city || ''} onChange={(e) => setClient({ ...client, city: e.target.value })} /></Field>
                </div>
                <Field label="Anything else? (optional)"><textarea className="input" rows={2} value={client.notes || ''} onChange={(e) => setClient({ ...client, notes: e.target.value })} placeholder="Special requests, deadline…" /></Field>

                <div className="rounded-2xl border border-brand-100 bg-white p-4 text-sm">
                  <p className="font-semibold text-wine-900">Summary</p>
                  <p className="mt-1 text-stone-600">{ev.emoji} {ev.label} — <b>{displayNames(full)}</b></p>
                  <p className="text-stone-600">📅 {fmtDate(inv.date!)} · {fmtTime(inv.time!)}</p>
                  <p className="text-stone-600">📍 {inv.venueName || '—'}</p>
                  <p className="text-stone-600">📸 {photoCount} portrait(s), {galleryCount} gallery photo(s)</p>
                </div>

                <div className="space-y-2">
                  <Btn variant="whatsapp" size="lg" className="w-full" onClick={sendWhatsApp}><MessageCircle className="h-5 w-5" /> Send details on WhatsApp</Btn>
                  {(photoCount + galleryCount > 0) && (
                    <Btn size="lg" className="w-full" onClick={shareFile}>{typeof navigator !== 'undefined' && 'share' in navigator ? <Share2 className="h-5 w-5" /> : <Download className="h-5 w-5" />} Share details file with photos</Btn>
                  )}
                  <p className="text-center text-xs text-stone-500">
                    {photoCount + galleryCount > 0 ? 'Step 1: send details on WhatsApp. Step 2: share the file (it carries your photos) in the same chat.' : 'Tip: you can also send your photos in the same WhatsApp chat.'}
                  </p>
                </div>
                {sent && (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-center text-sm text-emerald-800">
                    <p className="text-2xl">🎉</p>
                    <p className="font-semibold">Thank you, {client.name.split(' ')[0]}!</p>
                    <p>{profile.name} will share your invitation preview soon.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <Btn size="lg" variant="ghost" disabled={step === 0} onClick={() => setStep((x) => x - 1)} aria-label="Back"><ChevronLeft className="h-5 w-5" /></Btn>
          <Btn size="lg" className="flex-1" onClick={() => setPreview(true)}><Eye className="h-4 w-4" /> Preview</Btn>
          {step < STEPS.length - 1 && <Btn size="lg" variant="primary" className="flex-1" onClick={next}>Next <ChevronRight className="h-4 w-4" /></Btn>}
        </div>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div className="fixed inset-0 z-50 bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mx-auto h-full max-w-md" style={{ transform: 'translateZ(0)' }}>
              <Experience data={full} embedded link={location.href} />
            </div>
            <button type="button" onClick={() => setPreview(false)} className="absolute left-3 top-3 z-[60] flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-semibold text-stone-800 shadow-lg"><X className="h-4 w-4" /> Close preview</button>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </div>
  );
}

function PersonCard({ label, p, onChange }: { label: string; p: Person; onChange: (p: Partial<Person>) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <p className="mb-3 font-display text-base font-semibold text-wine-900">{label}</p>
      <div className="flex items-start gap-4">
        <button type="button" onClick={() => ref.current?.click()} className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-brand-400 bg-brand-50">
          {p.photo ? <img src={p.photo} alt="" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center text-[10px] text-brand-600"><Camera className="mb-0.5 h-5 w-5" />Photo</span>}
        </button>
        <input ref={ref} type="file" accept="image/*" hidden onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onChange({ photo: await compressImage(f, 220, 0.6) }); // small enough to travel in the WhatsApp message
          e.target.value = '';
        }} />
        <div className="flex-1 space-y-2">
          <input className="input" value={p.name} onChange={(e) => onChange({ name: e.target.value })} placeholder={`${label}'s name`} />
          {p.photo && <button type="button" onClick={() => onChange({ photo: undefined })} className="text-xs text-red-500">Remove photo</button>}
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        <input className="input" value={p.parents || ''} onChange={(e) => onChange({ parents: e.target.value })} placeholder="Parents (e.g. D/o Sri Venkat Rao & Smt. Lakshmi)" />
        <input className="input" value={p.family || ''} onChange={(e) => onChange({ family: e.target.value })} placeholder="Family surname / native place (optional)" />
      </div>
    </div>
  );
}

function EventRow({ e, onChange, onRemove }: { e: EventItem; onChange: (p: Partial<EventItem>) => void; onRemove: () => void }): ReactNode {
  return (
    <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-3">
      <div className="flex gap-2">
        <input className="input" value={e.title} onChange={(x) => onChange({ title: x.target.value })} placeholder="Function name" />
        <button type="button" onClick={onRemove} className="rounded-xl px-2 text-red-500" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" className="input" value={e.date} onChange={(x) => onChange({ date: x.target.value })} />
        <input type="time" className="input" value={e.time} onChange={(x) => onChange({ time: x.target.value })} />
      </div>
      <input className="input" value={e.venue || ''} onChange={(x) => onChange({ venue: x.target.value })} placeholder="Venue (if different)" />
    </div>
  );
}

function GalleryPick({ gallery, onChange }: { gallery: string[]; onChange: (g: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {gallery.map((g, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
            <img src={g} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange(gallery.filter((_, k) => k !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white" aria-label="Remove"><X className="h-3 w-3" /></button>
          </div>
        ))}
        {gallery.length < 6 && (
          <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white text-stone-400">
            {busy ? <span className="text-xs">Adding…</span> : <><ImagePlus className="h-6 w-6" /><span className="mt-1 text-[10px]">Add photos</span></>}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={async (e) => {
        const files = Array.from(e.target.files || []).slice(0, 6 - gallery.length);
        setBusy(true);
        const imgs = await Promise.all(files.map((f) => compressImage(f, 1080, 0.72)));
        setBusy(false);
        onChange([...gallery, ...imgs]);
        e.target.value = '';
      }} />
    </>
  );
}
