import QRCode from 'qrcode';
import type { PublicInvitation } from '../types';
import { EVENTS, THEMES } from './themes';
import { eventDate, fmtDate, fmtTime } from './util';

const W = 1080;
const H = 1920;

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line);
        line = word;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

function mandala(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, alpha: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  [1, 0.86, 0.66, 0.45, 0.22].forEach((k) => {
    ctx.beginPath();
    ctx.arc(0, 0, r * k, 0, Math.PI * 2);
    ctx.stroke();
  });
  const rings = [{ n: 32, rr: 0.92, l: 0.1, w: 0.04 }, { n: 24, rr: 0.76, l: 0.13, w: 0.06 }, { n: 16, rr: 0.56, l: 0.16, w: 0.08 }];
  for (const ring of rings) {
    for (let j = 0; j < ring.n; j++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * j) / ring.n);
      const R = r * ring.rr, L = r * ring.l, Wd = r * ring.w;
      ctx.beginPath();
      ctx.moveTo(0, -R + L);
      ctx.quadraticCurveTo(Wd, -R + L / 2, 0, -R);
      ctx.quadraticCurveTo(-Wd, -R + L / 2, 0, -R + L);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function goldGrad(ctx: CanvasRenderingContext2D, x0: number, x1: number, g1: string, g2: string) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, g1);
  g.addColorStop(0.35, g2);
  g.addColorStop(0.65, g1);
  g.addColorStop(1, '#a8791d');
  return g;
}

async function avatar(ctx: CanvasRenderingContext2D, src: string | undefined, name: string, cx: number, cy: number, r: number, gold: string, gold2: string, ink: string) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
  ctx.fillStyle = goldGrad(ctx, cx - r, cx + r, gold, gold2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const img = src ? await loadImg(src) : null;
  if (img) {
    const s = Math.max((2 * r) / img.width, (2 * r) / img.height);
    ctx.drawImage(img, cx - (img.width * s) / 2, cy - (img.height * s) / 2, img.width * s, img.height * s);
  } else {
    ctx.fillStyle = '#f5ead0';
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.fillStyle = ink;
    ctx.font = `700 ${r}px 'Cinzel Decorative'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((name || '?').charAt(0).toUpperCase(), cx, cy + 4);
  }
  ctx.restore();
}

export async function renderPoster(inv: PublicInvitation, link?: string): Promise<HTMLCanvasElement> {
  const theme = THEMES[inv.theme] || THEMES.royal;
  const ev = EVENTS[inv.type];
  const two = ev.twoHosts && !!inv.hostB?.name;
  await Promise.all([
    document.fonts.load("120px 'Great Vibes'"),
    document.fonts.load("600 40px 'Cinzel'"),
    document.fonts.load("700 40px 'Cinzel Decorative'"),
    document.fonts.load("italic 40px 'Cormorant Garamond'"),
    document.fonts.load("500 40px 'Cormorant Garamond'"),
    inv.lang === 'te' ? document.fonts.load("40px 'Noto Serif Telugu'") : Promise.resolve(),
    inv.lang === 'hi' ? document.fonts.load("40px 'Tiro Devanagari Hindi'") : Promise.resolve(),
  ]).catch(() => {});
  const serif = inv.lang === 'te' ? "'Noto Serif Telugu', 'Cormorant Garamond'" : inv.lang === 'hi' ? "'Tiro Devanagari Hindi', 'Cormorant Garamond'" : "'Cormorant Garamond'";

  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, theme.bg1);
  bg.addColorStop(0.5, theme.bg2);
  bg.addColorStop(1, theme.bg1);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  mandala(ctx, W / 2, 140, 520, theme.gold, 0.12);
  mandala(ctx, W / 2, H - 80, 460, theme.gold, 0.1);

  // card
  const cx = 80, cy = 170, cw = W - 160, ch = H - 340;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  roundRect(ctx, cx - 6, cy - 6, cw + 12, ch + 12, 46);
  ctx.fillStyle = goldGrad(ctx, cx, cx + cw, theme.gold, theme.gold2);
  ctx.fill();
  ctx.restore();
  roundRect(ctx, cx, cy, cw, ch, 40);
  ctx.fillStyle = theme.card;
  ctx.fill();
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 2;
  roundRect(ctx, cx + 22, cy + 22, cw - 44, ch - 44, 28);
  ctx.stroke();
  ctx.setLineDash([6, 8]);
  roundRect(ctx, cx + 36, cy + 36, cw - 72, ch - 72, 22);
  ctx.stroke();
  ctx.setLineDash([]);
  mandala(ctx, W / 2, cy + ch / 2, 420, theme.gold, 0.07);
  // corner dots
  for (const [x, y] of [[cx + 22, cy + 22], [cx + cw - 22, cy + 22], [cx + 22, cy + ch - 22], [cx + cw - 22, cy + ch - 22]]) {
    ctx.fillStyle = theme.gold;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // content is drawn on its own layer, then scaled to fit the card (long names/messages never overflow)
  const layer = document.createElement('canvas');
  layer.width = cw;
  layer.height = 3400;
  const k = layer.getContext('2d')!;
  const CX = cw / 2;
  k.textAlign = 'center';
  k.textBaseline = 'alphabetic';
  let y = 70;

  if (inv.blessing) {
    k.fillStyle = theme.accent;
    k.font = `600 36px ${serif}`;
    k.fillText(inv.blessing, CX, y);
    y += 60;
  }
  k.fillStyle = theme.cardInk;
  k.globalAlpha = 0.75;
  k.font = "600 26px 'Cinzel'";
  k.fillText(ev.title.en.toUpperCase().split('').join(String.fromCharCode(8202)), CX, y);
  k.globalAlpha = 1;
  y += 50;

  // avatars
  const r = two ? 120 : 150;
  y += r + 10;
  if (two) {
    await avatar(k, inv.hostA.photo, inv.hostA.name, CX - 145, y, r, theme.gold, theme.gold2, theme.cardInk);
    await avatar(k, inv.hostB?.photo, inv.hostB!.name, CX + 145, y, r, theme.gold, theme.gold2, theme.cardInk);
  } else {
    await avatar(k, inv.hostA.photo, inv.hostA.name, CX, y, r, theme.gold, theme.gold2, theme.cardInk);
  }
  y += r + 130;

  // names
  k.fillStyle = theme.cardInk;
  k.font = "130px 'Great Vibes'";
  k.fillText(inv.hostA.name, CX, y);
  if (inv.hostA.parents) {
    k.font = `italic 32px ${serif}`;
    k.globalAlpha = 0.8;
    k.fillText(inv.hostA.parents, CX, y + 64);
    k.globalAlpha = 1;
    y += 40;
  }
  if (two) {
    y += 95;
    k.fillStyle = theme.accent;
    k.font = "70px 'Great Vibes'";
    k.fillText(inv.type === 'wedding' ? 'weds' : '&', CX, y);
    y += 130;
    k.fillStyle = theme.cardInk;
    k.font = "130px 'Great Vibes'";
    k.fillText(inv.hostB!.name, CX, y);
    if (inv.hostB!.parents) {
      k.font = `italic 32px ${serif}`;
      k.globalAlpha = 0.8;
      k.fillText(inv.hostB!.parents, CX, y + 64);
      k.globalAlpha = 1;
      y += 40;
    }
  }
  if (inv.age) {
    y += 70;
    k.font = "600 36px 'Cinzel'";
    k.fillText(inv.age, CX, y);
  }

  // divider
  y += 70;
  k.strokeStyle = theme.gold;
  k.lineWidth = 2;
  k.beginPath();
  k.moveTo(CX - 220, y);
  k.lineTo(CX - 30, y);
  k.moveTo(CX + 30, y);
  k.lineTo(CX + 220, y);
  k.stroke();
  k.fillStyle = theme.gold;
  k.save();
  k.translate(CX, y);
  k.rotate(Math.PI / 4);
  k.fillRect(-10, -10, 20, 20);
  k.restore();

  // message
  if (inv.message) {
    y += 70;
    k.fillStyle = theme.cardInk;
    k.font = `500 34px ${serif}`;
    const lines = wrap(k, inv.message, cw - 220).slice(0, 6);
    for (const l of lines) {
      k.fillText(l, CX, y);
      y += 48;
    }
  }

  // date block
  y += 50;
  const d = eventDate(inv.date);
  k.fillStyle = theme.cardInk;
  k.font = "600 30px 'Cinzel'";
  k.fillText(fmtDate(inv.date, 'en', { weekday: 'long' }).toUpperCase(), CX - 250, y + 55);
  k.fillText(fmtTime(inv.time).toUpperCase(), CX + 250, y + 55);
  k.strokeStyle = theme.gold;
  for (const x of [CX - 250, CX + 250]) {
    k.beginPath();
    k.moveTo(x - 130, y + 10);
    k.lineTo(x + 130, y + 10);
    k.moveTo(x - 130, y + 80);
    k.lineTo(x + 130, y + 80);
    k.stroke();
  }
  k.font = "600 28px 'Cinzel'";
  k.globalAlpha = 0.7;
  k.fillText(d.toLocaleDateString('en-IN', { month: 'long' }).toUpperCase(), CX, y);
  k.globalAlpha = 1;
  k.fillStyle = theme.accent;
  k.font = "700 110px 'Cinzel Decorative'";
  k.fillText(String(d.getDate()), CX, y + 105);
  k.fillStyle = theme.cardInk;
  k.font = "600 28px 'Cinzel'";
  k.fillText(String(d.getFullYear()), CX, y + 145);
  y += 210;

  if (inv.venueName) {
    k.font = "600 38px 'Cinzel'";
    k.fillText(inv.venueName, CX, y);
    y += 46;
    if (inv.venueAddress) {
      k.font = `32px ${serif}`;
      k.globalAlpha = 0.8;
      for (const l of wrap(k, inv.venueAddress, cw - 260).slice(0, 2)) {
        k.fillText(l, CX, y);
        y += 40;
      }
      k.globalAlpha = 1;
    }
  }


  const top = cy + 40, avail = ch - 40 - 250;
  const used = y + 10;
  const sc = Math.min(1, avail / used);
  ctx.drawImage(layer, 0, 0, cw, used, cx + (cw - cw * sc) / 2, top + (avail - used * sc) / 2, cw * sc, used * sc);
  ctx.textAlign = 'center';

  // invited by + QR in footer area of card
  const footY = cy + ch - 90;
  if (link && link.length < 2300) {
    try {
      const qr = await QRCode.toDataURL(link, { margin: 1, width: 220, color: { dark: theme.cardInk, light: '#ffffff' } });
      const img = await loadImg(qr);
      if (img) {
        const qs = 170;
        ctx.drawImage(img, cx + cw - qs - 80, footY - qs + 30, qs, qs);
        ctx.font = "600 18px 'Cinzel'";
        ctx.fillStyle = theme.cardInk;
        ctx.fillText('SCAN TO OPEN', cx + cw - qs / 2 - 80, footY + 58);
      }
    } catch { /* link too long for QR */ }
  }
  if (inv.invitedBy) {
    ctx.fillStyle = theme.accent;
    ctx.font = `italic 36px ${serif}`;
    const lines = inv.invitedBy.split('\n');
    lines.forEach((l, i) => ctx.fillText(l, W / 2, footY - (lines.length - 1 - i) * 44));
  }

  // outer header / footer
  ctx.fillStyle = theme.gold2;
  ctx.font = "italic 38px 'Cormorant Garamond'";
  ctx.fillText('You are cordially invited', W / 2, 110);
  if (inv.brand) {
    ctx.globalAlpha = 0.6;
    ctx.font = "24px 'Cormorant Garamond'";
    ctx.fillText(`Crafted with love by ${inv.brand}`, W / 2, H - 60);
    ctx.globalAlpha = 1;
  }
  return c;
}

export async function posterPng(inv: PublicInvitation, link?: string) {
  const c = await renderPoster(inv, link);
  return c.toDataURL('image/png');
}

export async function posterPdf(inv: PublicInvitation, link?: string) {
  const { jsPDF } = await import('jspdf');
  const c = await renderPoster(inv, link);
  const img = c.toDataURL('image/jpeg', 0.92);
  // 108 x 192 mm keeps the 9:16 ratio (phone friendly + printable)
  const pdf = new jsPDF({ unit: 'mm', format: [108, 192], orientation: 'portrait' });
  pdf.addImage(img, 'JPEG', 0, 0, 108, 192);
  if (link) pdf.link(0, 0, 108, 192, { url: link });
  return pdf;
}
