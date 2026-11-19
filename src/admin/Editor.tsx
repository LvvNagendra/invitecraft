import { Camera, Eye, ImagePlus, Link2, Plus, RotateCcw, Save, Share2, Trash2, Wand2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { EventItem, EventType, Invitation, Lang, Person, ThemeId } from '../types';
import { EVENTS, THEMES } from '../lib/themes';
import { getState, newInvitation, saveInvitation, useStore } from '../lib/store';
import { go } from '../lib/router';
import { compressImage } from '../lib/media';
import { BLESSINGS, studioMessages } from '../lib/messages';
import { encodeInvite, fitPublic, kb, toPublic, uid, WA_LIMIT } from '../lib/util';
import { hostingReady, uploadPhoto } from '../lib/hosting';
import type { Settings } from '../types';
import { Experience } from '../guest/Experience';
import { Btn, Card, cx, Field, PageHeader, PhoneFrame, toast, Toggle } from './ui';

const TABS = ['Occasion', 'People', 'Date & Venue', 'Message', 'Experience', 'Client'] as const;
type Tab = (typeof TABS)[number];

export function Editor({ id, newType }: { id?: string; newType?: EventType }) {
  const existing = useStore((s) => s.invitations.find((i) => i.id === id));
  const clients = useStore((s) => s.clients);
  const settings = useStore((s) => s.settings);
  const [inv, setInv] = useState<Invitation>(() => existing ? JSON.parse(JSON.stringify(existing)) : newInvitation(newType && EVENTS[newType] ? newType : 'wedding'));
  const [tab, setTab] = useState<Tab>(existing ? 'People' : 'Occasion');
  const [previewStage, setPreviewStage] = useState<'envelope' | 'intro' | 'main'>('main');
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const ev = EVENTS[inv.type];
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>(existing ? 'saved' : 'unsaved');
  const firstRun = useRef(true);

  // Autosave: every change (including uploaded photos) is stored automatically
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setSaveState('unsaved');
    if (!inv.hostA.name.trim()) return; // a new invitation is saved once it has a name
    const t = setTimeout(async () => {
      setSaveState('saving');
      await saveInvitation(inv);
      setSaveState('saved');
    }, 700);
    return () => clearTimeout(t);
  }, [inv]);

  const up = (patch: Partial<Invitation>) => setInv((x) => ({ ...x, ...patch }));
  const upA = (p: Partial<Person>) => setInv((x) => ({ ...x, hostA: { ...x.hostA, ...p } }));
  const upB = (p: Partial<Person>) => setInv((x) => ({ ...x, hostB: { ...(x.hostB || { name: '' }), ...p } }));

  const full = useMemo(() => toPublic(inv, settings), [inv, settings]);
  const pub = useMemo(() => fitPublic(inv, settings), [inv, settings]); // what guests actually receive
  const fullSize = useMemo(() => encodeInvite(full).length, [full]);
  const linkSize = useMemo(() => encodeInvite(pub).length, [pub]);
  const droppedGallery = full.gallery.length - pub.gallery.length;

  const setType = (t: EventType) => {
    const e = EVENTS[t];
    setInv((x) => ({
      ...x, type: t, theme: e.defaultTheme, timeLabel: e.defaultTimeLabel,
      hostB: e.twoHosts ? x.hostB || { name: '' } : undefined,
      headline: e.twoHosts ? 'Together with their families' : 'With joy in our hearts',
    }));
  };

  const save = async (andShare?: boolean) => {
    if (!inv.hostA.name.trim()) {
      setTab('People');
      return toast(`Please enter the ${ev.hostALabel.toLowerCase()}'s name`);
    }
    if (!inv.date) {
      setTab('Date & Venue');
      return toast('Please choose the event date');
    }
    const saved = await saveInvitation({ ...inv, status: inv.status === 'draft' && andShare ? 'ready' : inv.status });
    setSaveState('saved');
    toast(andShare ? 'Saved! Ready to share 🎉' : 'Saved ✓');
    if (andShare) go(`/share/${saved.id}`);
    else if (!existing) go(`/edit/${saved.id}`);
  };

  const preview = (
    <div className="space-y-3">
      <PhoneFrame>
        <Experience key={previewKey} data={pub} embedded startAt={previewStage} link="#" />
      </PhoneFrame>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {(['envelope', 'intro', 'main'] as const).map((s) => (
          <button key={s} type="button" onClick={() => { setPreviewStage(s); setPreviewKey((k) => k + 1); }} className={cx('rounded-full px-3 py-1 text-xs font-medium', previewStage === s ? 'bg-wine-800 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200')}>
            {s === 'envelope' ? '💌 Envelope' : s === 'intro' ? '✨ Welcome' : '📜 Invitation'}
          </button>
        ))}
        <button type="button" onClick={() => setPreviewKey((k) => k + 1)} className="rounded-full p-1.5 text-stone-500 ring-1 ring-stone-200 hover:bg-white" aria-label="Replay"><RotateCcw className="h-3.5 w-3.5" /></button>
      </div>
      {fullSize > linkSize ? (
        <div className="rounded-xl bg-amber-50 p-3 text-center text-xs text-amber-900">
          <b>{pub.gallery.length} of {full.gallery.length} gallery photos</b> fit in a WhatsApp link{droppedGallery ? '' : ' (portraits trimmed)'}.
          <button type="button" onClick={() => go('/settings?hosting')} className="ml-1 font-semibold underline">Turn on free photo hosting</button> to include all photos.
        </div>
      ) : (
        <p className={cx('text-center text-xs', linkSize > 15000 ? 'text-amber-600' : 'text-stone-400')}>
          Share link size: {kb(linkSize)} {linkSize > 15000 ? '— works; photo hosting makes it shorter' : '✓ all photos included'}
        </p>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title={existing ? `Edit ${inv.code}` : 'Create Invitation'}
        sub={`${ev.emoji} ${ev.label} · ${THEMES[inv.theme].name} · ${saveState === 'saved' ? '✓ All changes saved' : saveState === 'saving' ? 'Saving…' : inv.hostA.name.trim() ? 'Unsaved changes' : 'Enter a name to start auto-saving'}`}
        actions={
          <>
            <Btn className="xl:hidden" onClick={() => setShowPreviewMobile(true)}><Eye className="h-4 w-4" /> Preview</Btn>
            <Btn onClick={() => save(false)}><Save className="h-4 w-4" /> Save</Btn>
            <Btn variant="primary" onClick={() => save(true)}><Share2 className="h-4 w-4" /> Save & Share</Btn>
          </>
        }
      />

      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="no-scrollbar -mx-4 mb-5 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {TABS.map((t, i) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={cx('flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition', tab === t ? 'bg-wine-800 text-white shadow' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-brand-400')}>
                <span className={cx('flex h-5 w-5 items-center justify-center rounded-full text-[10px]', tab === t ? 'bg-white/20' : 'bg-stone-100')}>{i + 1}</span>{t}
              </button>
            ))}
          </div>

          <Card className="p-5 sm:p-6">
            {tab === 'Occasion' && (
              <div className="space-y-6">
                <Field label="Occasion">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {(Object.keys(EVENTS) as EventType[]).map((t) => (
                      <button key={t} type="button" onClick={() => setType(t)} className={cx('rounded-xl border p-3 text-center transition', inv.type === t ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-400/30' : 'border-stone-200 hover:border-brand-400')}>
                        <span className="text-2xl">{EVENTS[t].emoji}</span>
                        <p className="mt-1 text-[11px] font-medium">{EVENTS[t].label}</p>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Design theme">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                      const th = THEMES[id];
                      return (
                        <button key={id} type="button" onClick={() => up({ theme: id })} className={cx('overflow-hidden rounded-xl border-2 text-left transition', inv.theme === id ? 'border-brand-500 shadow-lg' : 'border-transparent ring-1 ring-stone-200 hover:ring-brand-400')}>
                          <div className="relative flex h-20 items-center justify-center" style={{ background: `linear-gradient(135deg, ${th.bg1}, ${th.bg2})` }}>
                            <div className="flex h-12 w-9 items-center justify-center rounded border-2 font-script text-lg" style={{ background: th.card, borderColor: th.gold, color: th.cardInk }}>A</div>
                            <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full ring-2 ring-white/60" style={{ background: th.gold }} />
                            <span className="absolute bottom-2 right-7 h-4 w-4 rounded-full ring-2 ring-white/60" style={{ background: th.accent }} />
                          </div>
                          <p className="px-3 py-2 text-xs font-medium">{th.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Guest-facing language" hint="Buttons, countdown labels and greetings on the invitation.">
                  <div className="flex gap-2">
                    {([['en', 'English'], ['te', 'తెలుగు'], ['hi', 'हिन्दी']] as [Lang, string][]).map(([l, n]) => (
                      <button key={l} type="button" onClick={() => up({ lang: l })} className={cx('rounded-xl border px-4 py-2 text-sm', inv.lang === l ? 'border-brand-500 bg-brand-50 font-semibold' : 'border-stone-200')}>{n}</button>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {tab === 'People' && (
              <div className="space-y-6">
                <PersonEditor settings={settings} label={ev.hostALabel} p={inv.hostA} onChange={upA} parentsHint={inv.type === 'wedding' || inv.type === 'engagement' ? 'D/o Sri … & Smt. …' : inv.type === 'birthday' || inv.type === 'naming' ? 'Son/Daughter of …' : ''} />
                {ev.twoHosts && <PersonEditor settings={settings} label={ev.hostBLabel!} p={inv.hostB || { name: '' }} onChange={upB} parentsHint="S/o Sri … & Smt. …" />}
                {ev.ageLabel && (
                  <Field label={ev.ageLabel} hint={inv.type === 'birthday' ? 'e.g. "1st Birthday" or "Turning 60"' : 'e.g. "25 Years Together"'}>
                    <input className="input" value={inv.age || ''} onChange={(e) => up({ age: e.target.value })} />
                  </Field>
                )}
              </div>
            )}

            {tab === 'Date & Venue' && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Date"><input type="date" className="input" value={inv.date} onChange={(e) => up({ date: e.target.value })} /></Field>
                  <Field label="Time"><input type="time" className="input" value={inv.time} onChange={(e) => up({ time: e.target.value })} /></Field>
                  <Field label="Time label"><input className="input" value={inv.timeLabel} onChange={(e) => up({ timeLabel: e.target.value })} placeholder="Muhurtham" /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Venue name"><input className="input" value={inv.venueName} onChange={(e) => up({ venueName: e.target.value })} placeholder="Sri Convention Hall" /></Field>
                  <Field label="Address / City"><input className="input" value={inv.venueAddress} onChange={(e) => up({ venueAddress: e.target.value })} placeholder="Banjara Hills, Hyderabad" /></Field>
                </div>
                <Field label="Google Maps link (optional)" hint="Paste the exact pin from Google Maps → Share. If empty we search the venue name.">
                  <input className="input" value={inv.mapUrl || ''} onChange={(e) => up({ mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
                </Field>

                <div className="border-t border-stone-100 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Event schedule</p>
                    <Btn size="sm" onClick={() => up({ events: [...inv.events, { id: uid(), title: '', date: inv.date, time: '18:00' }] })}><Plus className="h-3.5 w-3.5" /> Add event</Btn>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {ev.scheduleIdeas.map((s) => (
                      <button key={s} type="button" onClick={() => up({ events: [...inv.events, { id: uid(), title: s, date: inv.date, time: '10:00', venue: inv.venueName }] })} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-600 hover:bg-brand-100">+ {s}</button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {inv.events.map((e, idx) => (
                      <EventRow key={e.id} e={e} onChange={(p) => up({ events: inv.events.map((x, i) => (i === idx ? { ...x, ...p } : x)) })} onRemove={() => up({ events: inv.events.filter((_, i) => i !== idx) })} />
                    ))}
                    {inv.events.length === 0 && <p className="rounded-xl border border-dashed border-stone-200 p-4 text-center text-sm text-stone-400">Optional — add Haldi, Sangeet, Reception etc.</p>}
                  </div>
                </div>

                <div className="grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-2">
                  <Field label="Dress code (optional)"><input className="input" value={inv.dressCode || ''} onChange={(e) => up({ dressCode: e.target.value })} placeholder="Traditional attire" /></Field>
                  <Field label="Hashtag (optional)"><input className="input" value={inv.hashtag || ''} onChange={(e) => up({ hashtag: e.target.value })} placeholder="#PriyaWedsRahul" /></Field>
                </div>
              </div>
            )}

            {tab === 'Message' && (
              <div className="space-y-5">
                <Field label="Blessing / invocation line">
                  <input className="input" value={inv.blessing} onChange={(e) => up({ blessing: e.target.value })} />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {BLESSINGS[inv.lang].map((b) => (
                      <button key={b} type="button" onClick={() => up({ blessing: b })} className="rounded-full bg-stone-100 px-3 py-1 text-xs hover:bg-brand-100">{b}</button>
                    ))}
                    <button type="button" onClick={() => up({ blessing: '' })} className="rounded-full px-3 py-1 text-xs text-stone-400 hover:bg-stone-100">None</button>
                  </div>
                </Field>
                <Field label="Headline"><input className="input" value={inv.headline} onChange={(e) => up({ headline: e.target.value })} /></Field>
                <Field label="Invitation message">
                  <textarea className="input" rows={5} value={inv.message} onChange={(e) => up({ message: e.target.value })} placeholder="Write your message or pick one below…" />
                </Field>
                <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-rose-50 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-wine-800"><Wand2 className="h-4 w-4" /> Message Studio suggestions</p>
                  <div className="space-y-2">
                    {[...studioMessages(inv.type, inv.lang), ...(inv.lang !== 'en' ? studioMessages(inv.type, 'en').slice(0, 2) : [])].map((m, i) => (
                      <button key={i} type="button" onClick={() => up({ message: m.text })} className="block w-full rounded-xl bg-white/80 p-3 text-left text-sm text-stone-700 ring-1 ring-black/5 hover:ring-brand-400">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-600">{m.tone}</span>{m.text}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Signed by" hint="Shown at the end of the card and WhatsApp message.">
                  <textarea className="input" rows={2} value={inv.invitedBy} onChange={(e) => up({ invitedBy: e.target.value })} placeholder={"With love,\nSharma & Rao Families"} />
                </Field>
              </div>
            )}

            {tab === 'Experience' && (
              <div className="space-y-5">
                <Field label="Envelope headline" hint="Shown before the guest taps to open.">
                  <input className="input" value={inv.envelopeText || ''} onChange={(e) => up({ envelopeText: e.target.value })} placeholder="A Special Invitation Awaits You" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Toggle label={`Animated effects (${ev.particles.join(' + ')})`} checked={inv.effects} onChange={(v) => up({ effects: v })} />
                  <Toggle label="RSVP on WhatsApp" checked={inv.rsvpEnabled} onChange={(v) => up({ rsvpEnabled: v })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Family WhatsApp number" hint="RSVPs & wishes are sent here. 10-digit Indian numbers get +91.">
                    <input className="input" inputMode="tel" value={inv.hostPhone} onChange={(e) => up({ hostPhone: e.target.value })} placeholder="98765 43210" />
                  </Field>
                  {inv.rsvpEnabled && <Field label="RSVP by (optional)"><input type="date" className="input" value={inv.rsvpBy || ''} onChange={(e) => up({ rsvpBy: e.target.value })} /></Field>}
                </div>
                <Field label="Background music">
                  <div className="flex flex-wrap gap-2">
                    {([['melody', '🎵 Soft veena melody'], ['custom', '🔗 My music link'], ['none', '🔇 No music']] as const).map(([m, l]) => (
                      <button key={m} type="button" onClick={() => up({ music: m })} className={cx('rounded-xl border px-4 py-2 text-sm', inv.music === m ? 'border-brand-500 bg-brand-50 font-semibold' : 'border-stone-200')}>{l}</button>
                    ))}
                  </div>
                  {inv.music === 'custom' && <input className="input mt-2" value={inv.musicUrl || ''} onChange={(e) => up({ musicUrl: e.target.value })} placeholder="https://…/song.mp3 (direct MP3 link you have rights to)" />}
                </Field>
                <Field label="Couple / host photos inside the share link" hint={hostingReady(settings) ? 'Photo hosting is ON — photos are uploaded and the link stays short.' : 'Without photo hosting, photos travel inside the link and a WhatsApp link can only carry about 2 small photos. Turn on free photo hosting (Settings) for bigger galleries.'}>
                  <div className="flex flex-wrap gap-2">
                    {([['all', 'All photos'], ['couple', 'Portraits only'], ['none', 'No photos']] as const).map(([m, l]) => (
                      <button key={m} type="button" onClick={() => up({ photoInLink: m })} className={cx('rounded-xl border px-4 py-2 text-sm', inv.photoInLink === m ? 'border-brand-500 bg-brand-50 font-semibold' : 'border-stone-200')}>{l}</button>
                    ))}
                  </div>
                </Field>
                <GalleryEditor settings={settings} gallery={inv.gallery} onChange={(g) => up({ gallery: g })} />
              </div>
            )}

            {tab === 'Client' && (
              <div className="space-y-5">
                <Field label="Client">
                  <select className="input" value={inv.clientId || ''} onChange={(e) => up({ clientId: e.target.value || undefined })}>
                    <option value="">— No client —</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>)}
                  </select>
                  <button type="button" onClick={() => go('/clients')} className="mt-1 text-xs text-brand-600 hover:underline">+ Manage clients</button>
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Price (₹)"><input type="number" className="input" value={inv.price ?? ''} onChange={(e) => up({ price: e.target.value ? Number(e.target.value) : undefined })} /></Field>
                  <Field label="Payment"><select className="input" value={inv.paid ? '1' : '0'} onChange={(e) => up({ paid: e.target.value === '1' })}><option value="0">Pending</option><option value="1">Paid</option></select></Field>
                  <Field label="Status"><select className="input" value={inv.status} onChange={(e) => up({ status: e.target.value as any })}><option value="draft">Draft</option><option value="ready">Ready</option><option value="sent">Sent</option></select></Field>
                </div>
                <Field label="Private notes"><textarea className="input" rows={3} value={inv.notes || ''} onChange={(e) => up({ notes: e.target.value })} placeholder="Never shown to guests" /></Field>
              </div>
            )}

            <div className="mt-6 flex justify-between border-t border-stone-100 pt-5">
              <Btn variant="ghost" disabled={tab === TABS[0]} onClick={() => setTab(TABS[TABS.indexOf(tab) - 1])}>← Back</Btn>
              {tab !== TABS[TABS.length - 1] ? (
                <Btn variant="primary" onClick={() => setTab(TABS[TABS.indexOf(tab) + 1])}>Next →</Btn>
              ) : (
                <Btn variant="gold" onClick={() => save(true)}><Share2 className="h-4 w-4" /> Save & Share</Btn>
              )}
            </div>
          </Card>
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-6">{preview}</div>
        </div>
      </div>

      {showPreviewMobile && (
        <div className="fixed inset-0 z-50 flex flex-col bg-stone-900/95 p-4 xl:hidden">
          <div className="mb-3 flex justify-end"><button type="button" onClick={() => setShowPreviewMobile(false)} className="rounded-full bg-white/10 p-2 text-white" aria-label="Close"><X className="h-5 w-5" /></button></div>
          <div className="flex-1 overflow-y-auto">{preview}</div>
        </div>
      )}
    </div>
  );
}

function PersonEditor({ label, p, onChange, parentsHint, settings }: { label: string; p: Person; onChange: (p: Partial<Person>) => void; parentsHint?: string; settings: Settings }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4">
      <p className="mb-3 font-display text-base font-semibold text-wine-900">{label}</p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <PhotoInput settings={settings} value={p.photo} onChange={(photo) => onChange({ photo })} />
        <div className="grid flex-1 gap-3">
          <Field label="Name"><input className="input" value={p.name} onChange={(e) => onChange({ name: e.target.value })} placeholder={label} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Parents / relation"><input className="input" value={p.parents || ''} onChange={(e) => onChange({ parents: e.target.value })} placeholder={parentsHint} /></Field>
            <Field label="Family surname / native"><input className="input" value={p.family || ''} onChange={(e) => onChange({ family: e.target.value })} placeholder="Kommineni family" /></Field>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compresses, and uploads to photo hosting when it is set up. */
export async function preparePhoto(file: File, settings: Settings, kind: 'portrait' | 'gallery') {
  const hosted = hostingReady(settings);
  const data = kind === 'portrait'
    ? await compressImage(file, hosted ? 640 : 300, hosted ? 0.82 : 0.6)
    : await compressImage(file, hosted ? 1080 : 480, hosted ? 0.78 : 0.5);
  if (!hosted) return data;
  try {
    return await uploadPhoto(data, settings);
  } catch (e: any) {
    toast(`Photo hosting failed (${e.message}) — photo kept inside the link`);
    return data;
  }
}

function PhotoInput({ value, onChange, settings }: { value?: string; onChange: (v?: string) => void; settings: Settings }) {
  const ref = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <button type="button" onClick={() => ref.current?.click()} className="group relative h-28 w-28 overflow-hidden rounded-full border-2 border-dashed border-brand-400 bg-white">
        {busy ? <span className="text-xs text-brand-600">Uploading…</span> : value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <Camera className="mx-auto h-7 w-7 text-brand-400" />}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">{value ? 'Change' : 'Upload'}</span>
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0];
        if (f) { setBusy(true); onChange(await preparePhoto(f, settings, 'portrait')); setBusy(false); }
        e.target.value = '';
      }} />
      <div className="flex gap-2 text-[11px]">
        <button type="button" onClick={() => setUrl(!url)} className="flex items-center gap-1 text-brand-600"><Link2 className="h-3 w-3" /> URL</button>
        {value && <button type="button" onClick={() => onChange(undefined)} className="text-red-500">Remove</button>}
      </div>
      {url && <input className="input !py-1.5 !text-xs" placeholder="https://…jpg" onBlur={(e) => e.target.value && onChange(e.target.value)} />}
    </div>
  );
}

function EventRow({ e, onChange, onRemove }: { e: EventItem; onChange: (p: Partial<EventItem>) => void; onRemove: () => void }) {
  return (
    <div className="grid gap-2 rounded-xl border border-stone-200 p-3 sm:grid-cols-[1.4fr_1fr_.8fr_1.2fr_auto]">
      <input className="input" value={e.title} onChange={(x) => onChange({ title: x.target.value })} placeholder="Event name" />
      <input type="date" className="input" value={e.date} onChange={(x) => onChange({ date: x.target.value })} />
      <input type="time" className="input" value={e.time} onChange={(x) => onChange({ time: x.target.value })} />
      <input className="input" value={e.venue || ''} onChange={(x) => onChange({ venue: x.target.value })} placeholder="Venue" />
      <Btn variant="ghost" onClick={onRemove} aria-label="Remove"><Trash2 className="h-4 w-4 text-red-500" /></Btn>
    </div>
  );
}

function GalleryEditor({ gallery, onChange, settings }: { gallery: string[]; onChange: (g: string[]) => void; settings: Settings }): ReactNode {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Field label={`Photo gallery (${gallery.length}/8)`} hint="Pre-wedding shoot or family photos. Shown as a cinematic slideshow.">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {gallery.map((g, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-xl">
            <img src={g} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange(gallery.filter((_, k) => k !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100" aria-label="Remove"><X className="h-3 w-3" /></button>
          </div>
        ))}
        {gallery.length < 8 && (
          <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-400 hover:border-brand-400 hover:text-brand-500">{busy ? <span className="text-[10px]">Uploading…</span> : <ImagePlus className="h-6 w-6" />}</button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={async (e) => {
        const files = Array.from(e.target.files || []).slice(0, 8 - gallery.length);
        setBusy(true);
        const imgs = await Promise.all(files.map((f) => preparePhoto(f, settings, 'gallery')));
        setBusy(false);
        onChange([...gallery, ...imgs]);
        e.target.value = '';
      }} />
    </Field>
  );
}
