import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarHeart, CalendarPlus, ChevronDown, Clock, Gem, Heart, MapPin, Music, Music2, RotateCcw, Send, Shirt, Sparkles, X,
} from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { PublicInvitation } from '../types';
import { EVENTS, LANG_FONT, T, THEMES, type Theme } from '../lib/themes';
import { displayNames, downloadBlob, eventDate, fmtDate, fmtTime, mapsLink, waLink } from '../lib/util';
import { buildIcs, googleCalendarLink } from '../lib/media';
import { MusicPlayer } from '../lib/music';
import { Particles, type ParticlesHandle } from '../components/Particles';
import { Avatar, Corner, Divider, GoldText, Mandala } from '../components/Ornaments';
import { Envelope } from './Envelope';

type Stage = 'envelope' | 'intro' | 'main';

interface Ctx {
  inv: PublicInvitation;
  theme: Theme;
  t: Record<string, string>;
  root: RefObject<HTMLDivElement>;
  guest?: string;
  link?: string;
}
const C = createContext<Ctx>(null as any);
const useC = () => useContext(C);

export function Experience({ data, guest, embedded, link, startAt }: {
  data: PublicInvitation; guest?: string; embedded?: boolean; link?: string; startAt?: Stage;
}) {
  const theme = THEMES[data.theme] || THEMES.royal;
  const ev = EVENTS[data.type] || EVENTS.wedding;
  const t = T[data.lang] || T.en;
  const [stage, setStage] = useState<Stage>(startAt ?? 'envelope');
  const [musicOn, setMusicOn] = useState(false);
  const fx = useRef<ParticlesHandle>(null);
  const root = useRef<HTMLDivElement>(null);
  const player = useMemo(() => new MusicPlayer(data.music, data.musicUrl), [data.music, data.musicUrl]);

  useEffect(() => () => player.dispose(), [player]);
  useEffect(() => setStage(startAt ?? 'envelope'), [startAt]);

  const startMusic = () => {
    if (data.music === 'none') return;
    player.start();
    setMusicOn(true);
  };

  const monogram = ev.twoHosts && data.hostB?.name
    ? `${data.hostA.name.charAt(0)}${data.hostB.name.charAt(0)}`
    : data.hostA.name.charAt(0) || '✦';

  const ctx: Ctx = { inv: data, theme, t, root, guest, link };

  return (
    <C.Provider value={ctx}>
      <div
        className={`relative overflow-hidden ${embedded ? 'h-full w-full' : 'h-[100dvh] w-full'}`}
        style={{ background: `linear-gradient(170deg, ${theme.bg1} 0%, ${theme.bg2} 55%, ${theme.bg1} 100%)`, color: theme.ink, fontFamily: LANG_FONT[data.lang] }}
      >
        <Particles
          ref={fx}
          kinds={ev.particles}
          gold={theme.gold2}
          active={data.effects !== false && stage !== 'envelope'}
          density={stage === 'intro' ? 34 : 16}
          className={`pointer-events-none absolute inset-0 ${stage === 'main' ? 'z-[1]' : 'z-20'}`}
        />

        <AnimatePresence mode="wait">
          {stage === 'envelope' && (
            <Envelope
              key="env"
              theme={theme}
              monogram={monogram}
              title={ev.title[data.lang]}
              awaits={t.awaits}
              tapLabel={t.tap}
              skipLabel={t.skip}
              dear={t.dear}
              guest={guest}
              envelopeText={data.envelopeText}
              onTap={() => {
                startMusic();
                setTimeout(() => fx.current?.burst(undefined, undefined, ev.burst, 90), 700);
              }}
              onOpened={() => setStage('intro')}
              onSkip={() => {
                startMusic();
                setStage('main');
              }}
            />
          )}
          {stage === 'intro' && <Welcome key="intro" onDone={() => setStage('main')} />}
          {stage === 'main' && (
            <motion.div
              key="main"
              ref={root}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
              className="no-scrollbar absolute inset-0 z-[2] overflow-y-auto overflow-x-hidden scroll-smooth"
            >
              <Main onReplay={() => setStage('envelope')} onFireworks={() => fx.current?.fireworks(6)} />
            </motion.div>
          )}
        </AnimatePresence>

        {stage !== 'envelope' && data.music !== 'none' && (
          <button
            type="button"
            onClick={() => setMusicOn(player.toggle())}
            aria-label={t.music}
            className="absolute right-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md"
            style={{ borderColor: `${theme.gold}88`, background: '#00000040', color: theme.gold2 }}
          >
            {musicOn ? <Music className="h-4 w-4 animate-pulse" /> : <Music2 className="h-4 w-4 opacity-50" />}
            {!musicOn && <span className="absolute h-[2px] w-5 rotate-45 rounded" style={{ background: theme.gold2 }} />}
          </button>
        )}
      </div>
    </C.Provider>
  );
}

/* ====================================================================== */
/* Stage 2 — cinematic welcome                                           */
/* ====================================================================== */

function Welcome({ onDone }: { onDone: () => void }) {
  const { inv, theme, t } = useC();
  const ev = EVENTS[inv.type];
  const line = ev.welcomeLine[inv.lang];
  const two = ev.twoHosts && !!inv.hostB?.name;
  const [canGo, setCanGo] = useState(false);

  useEffect(() => {
    const a = setTimeout(() => setCanGo(true), 2600);
    const b = setTimeout(onDone, 7500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  const Icon = inv.type === 'birthday' ? Sparkles : inv.type === 'housewarming' ? Sparkles : two ? Gem : Heart;

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: `radial-gradient(ellipse at 50% 40%, ${theme.bg2}, ${theme.bg1} 80%)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.8 } }}
      onClick={() => canGo && onDone()}
    >
      <Mandala color={theme.gold} className="spin-slow pointer-events-none absolute left-1/2 top-1/2 w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]" />

      <motion.p
        className="relative z-10 mb-10 max-w-xs font-serif text-xl italic leading-relaxed"
        initial="h" animate="s"
        variants={{ s: { transition: { staggerChildren: 0.12 } } }}
      >
        {line.split(' ').map((w, i) => (
          <motion.span key={i} className="inline-block whitespace-pre" variants={{ h: { opacity: 0, y: 12, filter: 'blur(6px)' }, s: { opacity: 1, y: 0, filter: 'blur(0px)' } }} transition={{ duration: 0.7 }}>
            {w}{' '}
          </motion.span>
        ))}
      </motion.p>

      <div className="relative z-10 flex items-center justify-center">
        <motion.div initial={{ x: -140, opacity: 0, rotate: -12 }} animate={{ x: two ? 14 : 0, opacity: 1, rotate: 0 }} transition={{ delay: 0.9, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}>
          <Avatar person={inv.hostA} ring={theme.gold} size={two ? 118 : 150} />
        </motion.div>
        {two && (
          <>
            <motion.div
              className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: `radial-gradient(circle, ${theme.gold2}, ${theme.gold})`, boxShadow: `0 0 30px ${theme.gold}` }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 2, type: 'spring', stiffness: 160, damping: 12 }}
            >
              <Icon className="h-6 w-6" style={{ color: theme.bg1 }} fill={theme.bg1} />
            </motion.div>
            <motion.div initial={{ x: 140, opacity: 0, rotate: 12 }} animate={{ x: -14, opacity: 1, rotate: 0 }} transition={{ delay: 0.9, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}>
              <Avatar person={inv.hostB} ring={theme.gold} size={118} />
            </motion.div>
          </>
        )}
      </div>

      <motion.h1
        className="relative z-10 mt-10 font-script text-5xl leading-tight sm:text-6xl"
        initial={{ opacity: 0, scale: 0.85, letterSpacing: '0.2em' }}
        animate={{ opacity: 1, scale: 1, letterSpacing: '0em' }}
        transition={{ delay: 2.3, duration: 1.4 }}
      >
        <GoldText gold={theme.gold} gold2={theme.gold2}>
          {two ? (
            <>
              {inv.hostA.name} <span className="font-serif text-3xl not-italic" style={{ color: theme.accent, WebkitTextFillColor: theme.accent }}>❤</span> {inv.hostB!.name}
            </>
          ) : (
            inv.hostA.name
          )}
        </GoldText>
      </motion.h1>
      <motion.p className="relative z-10 mt-3 font-display text-sm uppercase tracking-[0.4em]" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 3.4, duration: 1 }}>
        {ev.tagline[inv.lang]}
        {inv.age ? ` · ${inv.age}` : ''}
      </motion.p>

      <motion.button
        type="button"
        onClick={onDone}
        className="relative z-10 mt-12 flex items-center gap-2 rounded-full border px-6 py-2.5 font-display text-xs tracking-[0.3em] backdrop-blur"
        style={{ borderColor: theme.gold, color: theme.gold2, background: '#0003' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: canGo ? 1 : 0, y: canGo ? 0 : 10 }}
      >
        {t.continue.toUpperCase()} <ChevronDown className="h-4 w-4" />
      </motion.button>

      <button type="button" onClick={onDone} className="absolute left-4 top-4 z-20 text-xs tracking-wider opacity-60">
        {t.skip} ›
      </button>
    </motion.div>
  );
}

/* ====================================================================== */
/* Stage 3+ — scrolling invitation                                        */
/* ====================================================================== */

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { root } = useC();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ root, once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  const { theme } = useC();
  return (
    <div className="mb-6 text-center">
      <h2 className="font-display text-lg uppercase tracking-[0.3em]">
        <GoldText gold={theme.gold} gold2={theme.gold2}>{children}</GoldText>
      </h2>
      <Divider color={theme.gold} className="mx-auto mt-2 h-5 w-48" />
    </div>
  );
}

function Main({ onReplay, onFireworks }: { onReplay: () => void; onFireworks: () => void }) {
  const { inv, theme, t, guest } = useC();
  const ev = EVENTS[inv.type];
  const two = ev.twoHosts && !!inv.hostB?.name;
  const [calOpen, setCalOpen] = useState(false);

  return (
    <div className="relative mx-auto max-w-md pb-28">
      {/* hero */}
      <section className="relative flex min-h-[100%] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-20 text-center" style={{ minHeight: '92vh' }}>
        <Mandala color={theme.gold} className="spin-slow pointer-events-none absolute left-1/2 top-[44%] w-[460px] -translate-x-1/2 -translate-y-1/2 opacity-[0.1]" />
        {guest && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative mb-8 rounded-2xl border px-5 py-3 backdrop-blur-sm" style={{ borderColor: `${theme.gold}66`, background: '#00000025' }}>
            <p className="font-serif text-lg italic" style={{ color: theme.gold2 }}>{t.dear} {guest},</p>
            <p className="mt-1 font-serif text-[15px] leading-snug opacity-90">
              {inv.lang === 'en' ? 'we warmly invite you to bless us on our special day.' : t.celebrate}
            </p>
          </motion.div>
        )}
        {inv.blessing && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 0.4 }} className="relative font-serif text-sm tracking-wider" style={{ color: theme.gold2 }}>{inv.blessing}</motion.p>}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.6 }} className="relative mt-4 font-display text-xs uppercase tracking-[0.45em]">{ev.title[inv.lang]}</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.2 }} className="relative mt-6 font-script text-[3.6rem] leading-[1.05]">
          <GoldText gold={theme.gold} gold2={theme.gold2}>
            {two ? (<>{inv.hostA.name}<br /><span className="font-serif text-3xl">&amp;</span><br />{inv.hostB!.name}</>) : inv.hostA.name}
          </GoldText>
        </motion.h1>
        {inv.age && <p className="relative mt-2 font-display text-sm tracking-[0.3em] opacity-80">{inv.age}</p>}
        <Divider color={theme.gold} className="relative mx-auto mt-6 h-6 w-60" />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="relative mt-4 font-display text-base tracking-[0.2em]">
          {fmtDate(inv.date, inv.lang, { day: 'numeric', month: 'long', year: 'numeric' })}
        </motion.p>
        {inv.venueName && <p className="relative mt-1 font-serif text-base italic opacity-80">{inv.venueName}</p>}
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown className="h-6 w-6" style={{ color: theme.gold }} />
        </motion.div>
      </section>

      {/* main card */}
      <section className="px-4">
        <Reveal>
          <InviteCard />
        </Reveal>
      </section>

      {/* schedule */}
      {inv.events?.length > 0 && (
        <section className="px-5 pt-20">
          <SectionTitle>{t.schedule}</SectionTitle>
          <div className="relative ml-3 border-l pl-6" style={{ borderColor: `${theme.gold}66` }}>
            {inv.events.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.08} className="relative mb-6">
                <span className="absolute -left-[33px] top-3 h-4 w-4 rotate-45 border-2" style={{ borderColor: theme.gold, background: theme.bg1 }} />
                <div className="rounded-2xl border p-4 backdrop-blur-sm" style={{ borderColor: `${theme.gold}55`, background: '#ffffff0d' }}>
                  <p className="font-display text-base tracking-wider" style={{ color: theme.gold2 }}>{e.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm opacity-90">
                    <CalendarHeart className="h-3.5 w-3.5" /> {fmtDate(e.date, inv.lang, { weekday: 'short', day: 'numeric', month: 'short' })}
                    {e.time && <><Clock className="ml-2 h-3.5 w-3.5" /> {fmtTime(e.time, inv.lang)}</>}
                  </p>
                  {e.venue && <p className="mt-1 flex items-center gap-1.5 text-sm opacity-75"><MapPin className="h-3.5 w-3.5" /> {e.venue}</p>}
                  {e.note && <p className="mt-1 font-serif text-sm italic opacity-75">{e.note}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* countdown */}
      <section className="px-5 pt-20">
        <Reveal><Countdown /></Reveal>
      </section>

      {/* gallery */}
      {inv.gallery?.length > 0 && (
        <section className="pt-20">
          <SectionTitle>{t.gallery}</SectionTitle>
          <Gallery />
        </section>
      )}

      {/* location & actions */}
      <section className="px-5 pt-20">
        <SectionTitle>{t.venue}</SectionTitle>
        <Reveal>
          <div className="overflow-hidden rounded-3xl border" style={{ borderColor: `${theme.gold}66`, background: '#ffffff0d' }}>
            {(inv.venueName || inv.venueAddress) && (
              <iframe
                title="map"
                loading="lazy"
                className="h-48 w-full border-0 grayscale-[30%]"
                src={`https://www.google.com/maps?q=${encodeURIComponent([inv.venueName, inv.venueAddress].filter(Boolean).join(', '))}&output=embed`}
              />
            )}
            <div className="p-5 text-center">
              <p className="font-display text-lg tracking-wider" style={{ color: theme.gold2 }}>{inv.venueName}</p>
              {inv.venueAddress && <p className="mt-1 font-serif text-base opacity-85">{inv.venueAddress}</p>}
            </div>
          </div>
        </Reveal>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <ActionBtn icon={<MapPin className="h-5 w-5" />} label={t.location} href={mapsLink(inv)} />
          <ActionBtn icon={<CalendarPlus className="h-5 w-5" />} label={t.save} onClick={() => setCalOpen(true)} />
          <ActionBtn icon={<Heart className="h-5 w-5" />} label={t.wishes} href={waLink(wishText(inv, guest), inv.hostPhone)} />
        </div>
        {(inv.dressCode || inv.hashtag) && (
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            {inv.dressCode && <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5" style={{ borderColor: `${theme.gold}55` }}><Shirt className="h-3.5 w-3.5" /> {t.dress}: {inv.dressCode}</span>}
            {inv.hashtag && <span className="rounded-full border px-3 py-1.5" style={{ borderColor: `${theme.gold}55`, color: theme.gold2 }}>{inv.hashtag}</span>}
          </div>
        )}
      </section>

      {/* RSVP */}
      {inv.rsvpEnabled && (
        <section className="px-5 pt-20">
          <SectionTitle>RSVP</SectionTitle>
          <Reveal><Rsvp /></Reveal>
        </section>
      )}

      {/* thank you */}
      <section className="px-6 pb-10 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1 }}
          onViewportEnter={() => inv.effects !== false && onFireworks()}
        >
          <p className="font-script text-6xl"><GoldText gold={theme.gold} gold2={theme.gold2}>{t.thanks}</GoldText></p>
          <p className="mx-auto mt-4 max-w-xs font-serif text-lg italic opacity-90">{t.thanksMsg}</p>
          <Divider color={theme.gold} className="mx-auto mt-6 h-6 w-56" />
          {inv.invitedBy && <p className="mt-4 whitespace-pre-line font-serif text-lg" style={{ color: theme.gold2 }}>{inv.invitedBy}</p>}
          <button type="button" onClick={onReplay} className="mx-auto mt-10 flex items-center gap-2 rounded-full border px-5 py-2 text-xs tracking-widest opacity-80" style={{ borderColor: `${theme.gold}88` }}>
            <RotateCcw className="h-3.5 w-3.5" /> {t.replay}
          </button>
          {inv.brand && <p className="mt-10 text-[11px] tracking-wider opacity-50">Crafted with ❤ by {inv.brand}</p>}
        </motion.div>
      </section>

      {/* sticky dock */}
      <div className="pointer-events-none sticky bottom-3 z-30 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border p-1.5 shadow-2xl backdrop-blur-xl" style={{ borderColor: `${theme.gold}66`, background: `${theme.bg1}cc` }}>
          <DockBtn href={mapsLink(inv)} label={t.location}><MapPin className="h-4 w-4" /></DockBtn>
          <DockBtn onClick={() => setCalOpen(true)} label={t.save}><CalendarPlus className="h-4 w-4" /></DockBtn>
          {inv.rsvpEnabled && <DockBtn onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })} label="RSVP"><Send className="h-4 w-4" /></DockBtn>}
          <DockBtn href={waLink(wishText(inv, guest), inv.hostPhone)} label={t.wishes} primary><Heart className="h-4 w-4" fill="currentColor" /></DockBtn>
        </div>
      </div>

      <AnimatePresence>{calOpen && <CalendarSheet onClose={() => setCalOpen(false)} />}</AnimatePresence>
    </div>
  );
}

function wishText(inv: PublicInvitation, guest?: string) {
  const ev = EVENTS[inv.type];
  return `💐 Heartiest congratulations, ${displayNames(inv)}! 💐\n\nWishing you a lifetime of love, happiness and togetherness on your ${ev.label.toLowerCase()}. 🎉❤️${guest ? `\n\n— ${guest}` : ''}`;
}

function ActionBtn({ icon, label, href, onClick }: { icon: ReactNode; label: string; href?: string; onClick?: () => void }) {
  const { theme } = useC();
  const cls = 'flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-center text-[12px] font-medium leading-tight transition active:scale-95';
  const style = { borderColor: `${theme.gold}66`, background: `linear-gradient(160deg, #ffffff14, #ffffff05)` };
  const inner = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: `linear-gradient(135deg, ${theme.gold}, ${theme.gold2})`, color: theme.bg1 }}>{icon}</span>
      {label}
    </>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer" className={cls} style={style}>{inner}</a> : <button type="button" onClick={onClick} className={cls} style={style}>{inner}</button>;
}

function DockBtn({ children, label, href, onClick, primary }: { children: ReactNode; label: string; href?: string; onClick?: () => void; primary?: boolean }) {
  const { theme } = useC();
  const cls = 'flex h-11 items-center gap-1.5 rounded-full px-4 text-xs font-medium';
  const style = primary ? { background: `linear-gradient(135deg, ${theme.gold}, ${theme.gold2})`, color: theme.bg1 } : { color: theme.ink };
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls} style={style} aria-label={label}>{children}{primary && <span>{label}</span>}</a>
  ) : (
    <button type="button" onClick={onClick} className={cls} style={style} aria-label={label}>{children}</button>
  );
}

/* ---------------- the premium card ---------------- */

export function InviteCard() {
  const { inv, theme, t } = useC();
  const ev = EVENTS[inv.type];
  const two = ev.twoHosts && !!inv.hostB?.name;
  const ink = theme.cardInk;
  return (
    <div className="relative rounded-[28px] p-[3px] shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)]" style={{ background: `linear-gradient(135deg, ${theme.gold}, ${theme.gold2}, ${theme.gold}, #8a6414, ${theme.gold})` }}>
      <div className="paper-texture relative overflow-hidden rounded-[25px] px-6 py-12 text-center" style={{ background: theme.card, color: ink }}>
        <div className="pointer-events-none absolute inset-3 rounded-[18px] border" style={{ borderColor: `${theme.gold}aa` }} />
        <div className="pointer-events-none absolute inset-[18px] rounded-[14px] border border-dashed" style={{ borderColor: `${theme.gold}66` }} />
        <Corner color={theme.gold} className="absolute left-2 top-2 h-20 w-20" />
        <Corner color={theme.gold} className="absolute right-2 top-2 h-20 w-20 -scale-x-100" />
        <Corner color={theme.gold} className="absolute bottom-2 left-2 h-20 w-20 -scale-y-100" />
        <Corner color={theme.gold} className="absolute bottom-2 right-2 h-20 w-20 -scale-100" />
        <Mandala color={theme.gold} className="pointer-events-none absolute left-1/2 top-1/2 w-[380px] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" />

        <div className="relative">
          {inv.blessing && <p className="font-serif text-sm font-semibold tracking-wide" style={{ color: theme.accent }}>{inv.blessing}</p>}
          <p className="mt-3 font-display text-[11px] uppercase tracking-[0.35em] opacity-70">{inv.headline}</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Avatar person={inv.hostA} ring={theme.gold} size={two ? 92 : 120} />
            {two && <Avatar person={inv.hostB} ring={theme.gold} size={92} />}
          </div>

          <div className="mt-6">
            <PersonBlock name={inv.hostA.name} parents={inv.hostA.parents} family={inv.hostA.family} />
            {two && (
              <>
                <p className="my-2 font-script text-3xl" style={{ color: theme.accent }}>weds</p>
                <PersonBlock name={inv.hostB!.name} parents={inv.hostB!.parents} family={inv.hostB!.family} />
              </>
            )}
            {inv.age && <p className="mt-1 font-display text-sm tracking-[0.25em]">{inv.age}</p>}
          </div>

          <Divider color={theme.gold} className="mx-auto my-6 h-6 w-52" />

          {inv.message && <p className="mx-auto max-w-[19rem] whitespace-pre-line font-serif text-[17px] leading-relaxed">{inv.message}</p>}

          <div className="mx-auto mt-8 grid max-w-[18rem] grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="border-y py-2 font-display text-xs uppercase tracking-[0.2em]" style={{ borderColor: `${theme.gold}aa` }}>
              {fmtDate(inv.date, inv.lang, { weekday: 'long' })}
            </div>
            <div className="leading-none">
              <p className="font-display text-[11px] uppercase tracking-widest opacity-70">{fmtDate(inv.date, inv.lang, { month: 'short' })}</p>
              <p className="font-deco text-5xl" style={{ color: theme.accent }}>{eventDate(inv.date).getDate()}</p>
              <p className="font-display text-[11px] tracking-widest opacity-70">{eventDate(inv.date).getFullYear()}</p>
            </div>
            <div className="border-y py-2 font-display text-xs uppercase tracking-[0.2em]" style={{ borderColor: `${theme.gold}aa` }}>
              {fmtTime(inv.time, inv.lang)}
            </div>
          </div>
          {inv.time && <p className="mt-3 font-serif text-sm italic opacity-80">{inv.timeLabel}: {fmtTime(inv.time, inv.lang)}</p>}

          {inv.venueName && (
            <div className="mt-6">
              <p className="font-display text-[11px] uppercase tracking-[0.35em] opacity-60">{t.venue}</p>
              <p className="mt-1 font-display text-base font-semibold tracking-wide">{inv.venueName}</p>
              {inv.venueAddress && <p className="font-serif text-[15px] opacity-80">{inv.venueAddress}</p>}
            </div>
          )}

          {inv.invitedBy && (
            <p className="mt-8 whitespace-pre-line font-serif text-base italic" style={{ color: theme.accent }}>{inv.invitedBy}</p>
          )}
        </div>
      </div>
    </div>
  );

  function PersonBlock({ name, parents, family }: { name: string; parents?: string; family?: string }) {
    return (
      <div>
        <p className="font-script text-[2.6rem] leading-tight" style={{ color: ink }}>{name}</p>
        {family && <p className="font-display text-[11px] uppercase tracking-[0.3em]" style={{ color: theme.gold }}>{family}</p>}
        {parents && <p className="mt-1 font-serif text-[15px] italic opacity-80">{parents}</p>}
      </div>
    );
  }
}

/* ---------------- countdown ---------------- */

function Countdown() {
  const { inv, theme, t } = useC();
  const ev = EVENTS[inv.type];
  const target = eventDate(inv.date, inv.time).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = target - now;
  const passed = diff <= 0;
  const sameDay = passed && now - target < 24 * 3600 * 1000;
  const d = Math.max(0, diff);
  const parts = [
    { v: Math.floor(d / 86400000), l: t.days },
    { v: Math.floor((d / 3600000) % 24), l: t.hours },
    { v: Math.floor((d / 60000) % 60), l: t.mins },
    { v: Math.floor((d / 1000) % 60), l: t.secs },
  ];
  return (
    <div className="relative overflow-hidden rounded-[28px] border px-4 py-10 text-center" style={{ borderColor: `${theme.gold}77`, background: `radial-gradient(ellipse at top, ${theme.bg2}, ${theme.bg1})` }}>
      <Mandala color={theme.gold} className="spin-slow pointer-events-none absolute -right-24 -top-24 w-72 opacity-10" />
      <p className="font-display text-sm uppercase tracking-[0.4em]"><GoldText gold={theme.gold} gold2={theme.gold2}>{t.ourDay}</GoldText></p>
      {passed ? (
        <p className="mt-6 font-script text-4xl" style={{ color: theme.gold2 }}>{sameDay ? t.arrived : t.passed}</p>
      ) : (
        <div className="mt-6 grid grid-cols-4 gap-2">
          {parts.map((p) => (
            <div key={p.l} className="rounded-2xl border py-3" style={{ borderColor: `${theme.gold}55`, background: '#ffffff0d' }}>
              <AnimatePresence mode="popLayout">
                <motion.p key={p.v} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }} className="font-display text-3xl font-semibold tabular-nums" style={{ color: theme.gold2 }}>
                  {String(p.v).padStart(2, '0')}
                </motion.p>
              </AnimatePresence>
              <p className="mt-1 text-[10px] uppercase tracking-wider opacity-75">{p.l}</p>
            </div>
          ))}
        </div>
      )}
      {!passed && <p className="mt-6 font-script text-3xl">{ev.countdownTail[inv.lang]}</p>}
    </div>
  );
}

/* ---------------- gallery ---------------- */

function Gallery() {
  const { inv, theme } = useC();
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  const n = inv.gallery.length;
  useEffect(() => {
    if (n < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), 3500);
    return () => clearInterval(id);
  }, [n]);
  return (
    <div className="px-5">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border-2 shadow-2xl" style={{ borderColor: theme.gold }}>
        <AnimatePresence mode="sync">
          <motion.img
            key={i}
            src={inv.gallery[i]}
            alt=""
            onClick={() => setZoom(inv.gallery[i])}
            className="absolute inset-0 h-full w-full cursor-zoom-in object-cover"
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
          />
        </AnimatePresence>
      </div>
      {n > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {inv.gallery.map((g, k) => (
            <button type="button" key={k} onClick={() => setI(k)} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition" style={{ borderColor: k === i ? theme.gold2 : 'transparent', opacity: k === i ? 1 : 0.6 }}>
              <img src={g} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <AnimatePresence>
        {zoom && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(null)}>
            <img src={zoom} alt="" className="max-h-full max-w-full rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- RSVP ---------------- */

function Rsvp() {
  const { inv, theme, t, guest } = useC();
  const [name, setName] = useState(guest || '');
  const [going, setGoing] = useState<boolean | null>(null);
  const [count, setCount] = useState(2);
  const [note, setNote] = useState('');
  const ev = EVENTS[inv.type];

  const msg = () =>
    [
      `🙏 RSVP — ${ev.title.en} of ${displayNames(inv)}`,
      '',
      `👤 Name: ${name || '-'}`,
      `${going ? '✅ Joyfully attending' : '❌ Sorry, can’t make it'}`,
      going ? `👨‍👩‍👧 Guests: ${count}` : '',
      note ? `💬 ${note}` : '',
    ].filter(Boolean).join('\n');

  const field = 'w-full rounded-xl border bg-white/10 px-4 py-3 text-[15px] outline-none placeholder:opacity-60 focus:bg-white/15';
  return (
    <div id="rsvp" className="rounded-[28px] border p-5" style={{ borderColor: `${theme.gold}66`, background: '#ffffff0d' }}>
      <p className="text-center font-serif text-xl italic">{t.rsvp}</p>
      {inv.rsvpBy && <p className="mt-1 text-center text-xs opacity-70">{t.rsvpBy} {fmtDate(inv.rsvpBy, inv.lang, { day: 'numeric', month: 'long' })}</p>}
      <div className="mt-5 space-y-3">
        <input className={field} style={{ borderColor: `${theme.gold}55` }} placeholder={t.yourName} value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map((v) => (
            <button
              type="button"
              key={String(v)}
              onClick={() => setGoing(v)}
              className="rounded-xl border px-3 py-3 text-sm font-medium transition"
              style={going === v ? { background: `linear-gradient(135deg, ${theme.gold}, ${theme.gold2})`, color: theme.bg1, borderColor: theme.gold2 } : { borderColor: `${theme.gold}55` }}
            >
              {v ? `🎉 ${t.yes}` : `🙏 ${t.no}`}
            </button>
          ))}
        </div>
        {going && (
          <div className="flex items-center justify-between rounded-xl border px-4 py-2" style={{ borderColor: `${theme.gold}55` }}>
            <span className="text-sm opacity-85">{t.guests}</span>
            <div className="flex items-center gap-3">
              <button type="button" className="h-8 w-8 rounded-full border text-lg" style={{ borderColor: theme.gold }} onClick={() => setCount((c) => Math.max(1, c - 1))}>−</button>
              <span className="w-6 text-center font-display text-lg">{count}</span>
              <button type="button" className="h-8 w-8 rounded-full border text-lg" style={{ borderColor: theme.gold }} onClick={() => setCount((c) => Math.min(20, c + 1))}>+</button>
            </div>
          </div>
        )}
        <textarea className={field} style={{ borderColor: `${theme.gold}55` }} rows={2} placeholder={t.note} value={note} onChange={(e) => setNote(e.target.value)} />
        <a
          href={going === null ? undefined : waLink(msg(), inv.hostPhone)}
          target="_blank"
          rel="noreferrer"
          aria-disabled={going === null}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition ${going === null ? 'pointer-events-none opacity-40' : 'active:scale-[.98]'}`}
          style={{ background: '#25D366' }}
        >
          <Send className="h-4 w-4" /> {t.sendRsvp}
        </a>
      </div>
    </div>
  );
}

/* ---------------- calendar sheet ---------------- */

function CalendarSheet({ onClose }: { onClose: () => void }) {
  const { inv, theme, t, link } = useC();
  const ics = () => {
    downloadBlob(new Blob([buildIcs(inv, link || location.href)], { type: 'text/calendar' }), 'save-the-date.ics');
    onClose();
  };
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="w-full max-w-sm rounded-t-3xl p-6 sm:rounded-3xl"
        style={{ background: theme.card, color: theme.cardInk }}
        initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-base tracking-wider">{t.save}</p>
          <button type="button" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-2">
          <a href={googleCalendarLink(inv)} target="_blank" rel="noreferrer" onClick={onClose} className="block rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: `${theme.gold}88` }}>📅 Google Calendar</a>
          <button type="button" onClick={ics} className="block w-full rounded-xl border px-4 py-3 text-left text-sm font-medium" style={{ borderColor: `${theme.gold}88` }}>🍎 Apple / Outlook / Other (.ics)</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
