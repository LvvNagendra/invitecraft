import { motion } from 'framer-motion';
import {
  CalendarHeart, Check, ChevronDown, Clock, Gift, Globe2, Heart, Image as ImageIcon, MapPin, MessageCircle, Music, QrCode, Send, Sparkles, Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { BusinessProfile, PublicInvitation } from '../types';
import { demos } from '../lib/demos';
import { profileQuery } from '../lib/business';
import { newInvitation } from '../lib/store';
import { toPublic, waLink } from '../lib/util';
import { Experience } from '../guest/Experience';
import { PhoneFrame, cx } from '../admin/ui';
import { Mandala } from '../components/Ornaments';

export function demoInvitation(key: string, brand?: string): PublicInvitation | null {
  const d = demos().find((x) => x.key === key);
  if (!d) return null;
  const inv = { ...newInvitation(d.inv.type!), ...d.inv } as any;
  return { ...toPublic(inv), brand };
}

const FEATURES = [
  { icon: Gift, t: 'Surprise envelope', d: 'Golden envelope opens with petals, sparkles & music' },
  { icon: Users, t: 'Personal greeting', d: '“Dear Uncle Ramesh Garu…” — every guest gets their own link' },
  { icon: Clock, t: 'Live countdown', d: 'Days, hours, minutes and seconds to your big day' },
  { icon: ImageIcon, t: 'Photos & gallery', d: 'Couple portraits and a cinematic photo slideshow' },
  { icon: MapPin, t: 'One-tap location', d: 'Google Maps directions straight to the venue' },
  { icon: CalendarHeart, t: 'Save the date', d: 'Adds the event to the guest’s phone calendar' },
  { icon: Send, t: 'RSVP on WhatsApp', d: 'Guests confirm attendance and guest count instantly' },
  { icon: Globe2, t: 'Telugu · Hindi · English', d: 'Traditional wording in your language' },
  { icon: Music, t: 'Background music', d: 'Soft traditional melody or your own song' },
  { icon: QrCode, t: 'QR, HD image & PDF', d: 'For WhatsApp status and printed cards too' },
];

const FAQ = [
  ['Do guests need to install an app?', 'No. It opens like a website on any phone — just tap the link on WhatsApp.'],
  ['How do I share it with relatives?', 'We give you a ready WhatsApp message with your link. Send it to family groups or individually — each relative can even get their own name on it.'],
  ['Can we make changes later?', 'Yes. Changes to date, venue or photos can be made and a fresh link is shared.'],
  ['How long does it take?', 'Usually within 24 hours after we receive your details and photos.'],
  ['Will it work on old phones?', 'Yes — it is mobile-first, light and has a Skip button for quick viewing.'],
];

export function Showcase({ profile }: { profile: BusinessProfile }) {
  const q = profileQuery(profile);
  const [open, setOpen] = useState<number | null>(0);
  const wedding = demoInvitation('wedding', profile.name)!;
  useEffect(() => { document.title = `${profile.name} — Premium Digital Invitations`; }, [profile.name]);
  const contact = waLink(`Hi ${profile.name}! 👋 I saw your invitation designs and would like to know more.`, profile.phone);

  return (
    <div className="h-full overflow-y-auto bg-[#faf7f2] text-stone-800">
      {/* hero */}
      <section className="relative overflow-hidden bg-wine-900 text-white">
        <Mandala color="#d4a437" className="spin-slow pointer-events-none absolute -right-40 -top-40 w-[620px] opacity-[0.12]" />
        <Mandala color="#d4a437" className="spin-slower pointer-events-none absolute -bottom-60 -left-40 w-[520px] opacity-[0.08]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div className="text-center md:text-left">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-[#f6e27a]">{profile.name}</p>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-5xl">
              Invitations that open like a <span className="bg-[linear-gradient(100deg,#d4a437,#f6e27a,#d4a437)] bg-clip-text text-transparent">surprise</span> ✨
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/75 md:mx-0">
              Not just a digital card — a cinematic invitation website your relatives open on WhatsApp: golden envelope, music, countdown, location and RSVP.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <a href={`#/order${q}`} className="rounded-full bg-[linear-gradient(100deg,#d4a437,#f6e27a,#d4a437)] px-7 py-3.5 text-center font-semibold text-wine-900 shadow-xl">💌 Create my invitation</a>
              <a href="#demos" className="rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-center font-medium">See live demos</a>
            </div>
            <div className="mt-6 flex justify-center gap-5 text-xs text-white/60 md:justify-start">
              <span>✓ No app needed</span><span>✓ Works on every phone</span><span>✓ Ready in 24 hrs</span>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[300px]">
            <PhoneFrame><Experience data={wedding} embedded link={location.href} /></PhoneFrame>
            <p className="mt-3 text-center text-xs text-white/60">👆 Tap the envelope — it’s live</p>
          </div>
        </div>
      </section>

      {/* demos */}
      <section id="demos" className="mx-auto max-w-6xl px-5 py-16">
        <Heading kicker="Live demos" title="Open one — just like your guests will" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {demos().map((d) => (
            <a key={d.key} href={`#/demo/${d.key}${q}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={d.cover} alt={d.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-wine-900 sm:bottom-3 sm:left-3 sm:text-xs">▶ Open demo</span>
              </div>
              <div className="p-3 sm:p-4">
                <p className="font-display text-sm font-semibold text-wine-900 sm:text-base">{d.title}</p>
                <p className="text-[11px] text-stone-500 sm:text-xs">{d.blurb}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <Heading kicker="Everything included" title="A complete celebration in one link" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {FEATURES.map((f) => (
              <div key={f.t} className="rounded-2xl border border-stone-100 bg-[#fdfaf5] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#d4a437,#f6e27a)] text-wine-900"><f.icon className="h-5 w-5" /></span>
                <p className="mt-3 text-sm font-semibold">{f.t}</p>
                <p className="mt-1 text-xs text-stone-500">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Heading kicker="How it works" title="Three simple steps" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['1', 'Fill your details', 'Names, date, venue and photos in our simple form — with a live preview.'],
            ['2', 'We design it', 'We craft your premium invitation and share a preview for approval.'],
            ['3', 'Share on WhatsApp', 'Send to family groups or personally to every relative. Watch RSVPs arrive!'],
          ].map(([n, t, d]) => (
            <div key={n} className="relative rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
              <span className="font-deco text-5xl text-brand-400/40">{n}</span>
              <p className="mt-2 font-display text-lg font-semibold text-wine-900">{t}</p>
              <p className="mt-1 text-sm text-stone-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* packages */}
      {profile.packages.length > 0 && (
        <section className="bg-wine-900 py-16 text-white">
          <div className="mx-auto max-w-6xl px-5">
            <Heading dark kicker="Packages" title="Choose what suits your celebration" />
            <div className="grid gap-5 md:grid-cols-3">
              {profile.packages.map((p) => (
                <div key={p.name} className={cx('relative flex flex-col rounded-3xl p-6', p.popular ? 'bg-white text-stone-800 shadow-2xl md:-translate-y-3' : 'bg-white/5 ring-1 ring-white/15')}>
                  {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[linear-gradient(100deg,#d4a437,#f6e27a)] px-4 py-1 text-xs font-bold text-wine-900">MOST POPULAR</span>}
                  <p className="font-display text-xl font-semibold">{p.name}</p>
                  <p className={cx('mt-2 font-display text-4xl font-semibold', p.popular ? 'text-wine-800' : 'text-[#f6e27a]')}>₹{p.price.toLocaleString('en-IN')}</p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm">
                    {p.features.filter(Boolean).map((f) => <li key={f} className="flex gap-2"><Check className={cx('mt-0.5 h-4 w-4 shrink-0', p.popular ? 'text-brand-500' : 'text-[#f6e27a]')} />{f}</li>)}
                  </ul>
                  <a href={`#/order${q}`} className={cx('mt-6 rounded-full py-3 text-center text-sm font-semibold', p.popular ? 'bg-wine-800 text-white' : 'bg-white/10 ring-1 ring-white/25')}>Choose {p.name}</a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* faq */}
      <section className="mx-auto max-w-3xl px-5 py-16">
        <Heading kicker="Questions" title="Frequently asked" />
        <div className="space-y-2">
          {FAQ.map(([qq, a], i) => (
            <div key={qq} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left font-medium">
                {qq}<ChevronDown className={cx('h-4 w-4 transition', open === i && 'rotate-180')} />
              </button>
              {open === i && <p className="px-4 pb-4 text-sm text-stone-600">{a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="px-5 pb-28">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#3b0a14,#7a1426)] p-10 text-center text-white">
          <Mandala color="#d4a437" className="pointer-events-none absolute left-1/2 top-1/2 w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-10" />
          <Heart className="relative mx-auto h-8 w-8 text-[#f6e27a]" fill="currentColor" />
          <p className="relative mt-3 font-display text-2xl font-semibold sm:text-3xl">Let’s make your invitation unforgettable</p>
          <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={`#/order${q}`} className="rounded-full bg-[linear-gradient(100deg,#d4a437,#f6e27a,#d4a437)] px-7 py-3.5 font-semibold text-wine-900">💌 Fill my details</a>
            <a href={contact} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 font-semibold"><MessageCircle className="h-5 w-5" /> Chat on WhatsApp</a>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-stone-400">© {new Date().getFullYear()} {profile.name} · {profile.tagline}</p>
      </section>

      {/* floating whatsapp */}
      <a href={contact} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl" aria-label="WhatsApp">
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}

function Heading({ kicker, title, dark }: { kicker: string; title: string; dark?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 text-center">
      <p className={cx('font-display text-xs uppercase tracking-[0.3em]', dark ? 'text-[#f6e27a]' : 'text-brand-500')}>{kicker}</p>
      <h2 className={cx('mt-2 font-display text-2xl font-semibold sm:text-3xl', dark ? 'text-white' : 'text-wine-900')}>{title}</h2>
      <Sparkles className={cx('mx-auto mt-3 h-4 w-4', dark ? 'text-[#f6e27a]' : 'text-brand-400')} />
    </motion.div>
  );
}

export function DemoView({ demoKey, profile }: { demoKey: string; profile: BusinessProfile }) {
  const data = demoInvitation(demoKey, profile.name);
  const q = profileQuery(profile);
  if (!data) return null;
  return (
    <div className="flex h-[100dvh] flex-col bg-black">
      <div className="z-50 flex h-11 shrink-0 items-center justify-between gap-2 bg-wine-900 px-3 text-xs text-white">
        <a href={`#/showcase${q}`} className="rounded-full px-2 py-1.5 text-white/80">← All demos</a>
        <span className="truncate font-display text-[11px] uppercase tracking-[0.2em] text-[#f6e27a]">Live demo</span>
        <a href={`#/order${q}`} className="rounded-full bg-[linear-gradient(100deg,#d4a437,#f6e27a)] px-3 py-1.5 font-semibold text-wine-900">Get yours</a>
      </div>
      <div className="relative min-h-0 flex-1" style={{ transform: 'translateZ(0)' }}>
        <Experience key={demoKey} data={data} embedded backdrop link={location.href} />
      </div>
    </div>
  );
}
