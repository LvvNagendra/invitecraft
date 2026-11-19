import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Theme } from '../lib/themes';
import { GoldText, Mandala } from '../components/Ornaments';

interface Props {
  theme: Theme;
  monogram: string;
  title: string;
  awaits: string;
  tapLabel: string;
  skipLabel: string;
  dear?: string;
  guest?: string;
  envelopeText?: string;
  onTap: () => void;
  onOpened: () => void;
  onSkip: () => void;
}

export function Envelope({ theme, monogram, title, awaits, tapLabel, skipLabel, dear, guest, envelopeText, onTap, onOpened, onSkip }: Props) {
  const [open, setOpen] = useState(false);
  const [e1, e2] = theme.envelope;

  const tap = () => {
    if (open) return;
    setOpen(true);
    onTap();
    setTimeout(onOpened, 2300);
  };

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: `radial-gradient(ellipse at 50% 35%, ${theme.bg2} 0%, ${theme.bg1} 75%)`, color: theme.ink }}
      exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.8 } }}
    >
      <Mandala color={theme.gold} className="spin-slow pointer-events-none absolute -top-40 left-1/2 w-[640px] -translate-x-1/2 opacity-[0.09]" />
      <Mandala color={theme.gold} className="spin-slower pointer-events-none absolute -bottom-56 left-1/2 w-[560px] -translate-x-1/2 opacity-[0.07]" />

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: open ? 0 : 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="relative z-10 mb-8">
        {guest && (
          <p className="mb-2 font-serif text-lg italic opacity-90">
            {dear} {guest},
          </p>
        )}
        <h1 className="font-display text-[1.35rem] leading-snug tracking-wide sm:text-2xl">
          <GoldText gold={theme.gold} gold2={theme.gold2}>{envelopeText || awaits}</GoldText>
          <span className="ml-1">❤️</span>
        </h1>
        <p className="mt-2 font-serif text-sm italic tracking-wide opacity-70">{title}</p>
      </motion.div>

      {/* envelope */}
      <motion.button
        type="button"
        onClick={tap}
        aria-label={tapLabel}
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={open ? { opacity: 1, scale: 1.04, y: 40 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: open ? 1.2 : 1, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 h-[190px] w-[290px] cursor-pointer select-none sm:h-[210px] sm:w-[320px] ${open ? '' : 'float-y'}`}
        style={{ perspective: 1200 }}
      >
        {/* back */}
        <div className="absolute inset-0 rounded-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,.6)]" style={{ background: `linear-gradient(160deg, ${e2}, ${e1})` }} />
        {/* letter */}
        <motion.div
          className="paper-texture absolute inset-x-4 top-3 bottom-3 rounded-md border shadow-lg"
          style={{ background: theme.card, borderColor: theme.gold, zIndex: 2 }}
          animate={open ? { y: -150 } : { y: 0 }}
          transition={{ delay: 0.75, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="m-2 flex h-[calc(100%-1rem)] flex-col items-center justify-center rounded border border-dashed" style={{ borderColor: theme.gold }}>
            <span className="font-script text-4xl" style={{ color: theme.cardInk }}>{monogram}</span>
            <span className="mt-1 font-display text-[10px] tracking-[0.3em]" style={{ color: theme.gold }}>INVITATION</span>
          </div>
        </motion.div>
        {/* front pocket */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            zIndex: 3,
            background: `linear-gradient(200deg, ${e1}, ${e2})`,
            clipPath: 'polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)',
          }}
        >
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top right, transparent 49.6%, ${theme.gold}55 50%, transparent 50.4%), linear-gradient(to top left, transparent 49.6%, ${theme.gold}55 50%, transparent 50.4%)` }} />
          <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-lg" style={{ background: `linear-gradient(90deg, ${theme.gold}, ${theme.gold2}, ${theme.gold})` }} />
        </div>
        {/* flap */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[62%] origin-top"
          style={{ transformStyle: 'preserve-3d', zIndex: 4 }}
          animate={open ? { rotateX: 180, zIndex: 1 } : { rotateX: 0, zIndex: 4 }}
          transition={{ duration: 0.8, ease: 'easeInOut', zIndex: { delay: open ? 0.4 : 0 } }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${e1}, ${e2})`,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.4))',
            }}
          />
          <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', background: `linear-gradient(to bottom left, transparent 49.3%, ${theme.gold} 50%, transparent 50.7%), linear-gradient(to bottom right, transparent 49.3%, ${theme.gold} 50%, transparent 50.7%)` }} />
        </motion.div>
        {/* wax seal */}
        <motion.div
          className="absolute left-1/2 top-[62%] z-[5] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full glow-pulse"
          style={{ background: `radial-gradient(circle at 35% 30%, ${theme.seal}, #3a0008)`, boxShadow: `0 0 0 3px ${theme.gold}, 0 6px 16px rgba(0,0,0,.5)` }}
          animate={open ? { scale: 0, opacity: 0, rotate: 90 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="font-script text-2xl leading-none" style={{ color: theme.gold2 }}>{monogram}</span>
        </motion.div>
      </motion.button>

      <motion.div animate={{ opacity: open ? 0 : 1 }} className="relative z-10 mt-12 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={tap}
          className="glow-pulse rounded-full px-8 py-3 font-display text-sm font-semibold tracking-[0.25em] text-[#3b0a14] shadow-xl"
          style={{ background: `linear-gradient(100deg, ${theme.gold}, ${theme.gold2}, ${theme.gold})` }}
        >
          💌 {tapLabel.toUpperCase()}
        </button>
        <button type="button" onClick={onSkip} className="text-xs tracking-wider underline-offset-4 opacity-60 hover:underline">
          {skipLabel} ›
        </button>
      </motion.div>
    </motion.div>
  );
}
