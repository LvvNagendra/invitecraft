import type { Invitation, Lang, Person, PublicInvitation, Settings } from '../types';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { EVENTS } from './themes';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/* ---------------- dates ---------------- */

export function eventDate(date: string, time?: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = (time || '00:00').split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
}

const LOCALE: Record<Lang, string> = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' };

export function fmtDate(date: string, lang: Lang = 'en', opts?: Intl.DateTimeFormatOptions) {
  if (!date) return '';
  return eventDate(date).toLocaleDateString(LOCALE[lang], opts ?? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function fmtTime(time: string, lang: Lang = 'en') {
  if (!time) return '';
  const d = eventDate('2000-01-01', time);
  return d.toLocaleTimeString(LOCALE[lang], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function daysUntil(date: string) {
  const ms = eventDate(date).getTime() - new Date(new Date().toDateString()).getTime();
  return Math.round(ms / 86400000);
}

/* ---------------- names ---------------- */

export function displayNames(inv: Pick<Invitation, 'type' | 'hostA' | 'hostB'>, joiner = ' & ') {
  const a = inv.hostA?.name?.trim() || '';
  const b = inv.hostB?.name?.trim() || '';
  return EVENTS[inv.type].twoHosts && b ? `${a}${joiner}${b}` : a;
}

export function initials(p?: Person) {
  return (p?.name || '?').trim().charAt(0).toUpperCase();
}

/* ---------------- link encoding ---------------- */

export function toPublic(inv: Invitation, settings?: Settings): PublicInvitation {
  const { clientId, guests, status, price, paid, notes, photoInLink, createdAt, updatedAt, ...pub } = inv;
  const out: PublicInvitation = JSON.parse(JSON.stringify(pub));
  const isData = (s?: string) => !!s && s.startsWith('data:');
  if (photoInLink === 'none') {
    if (isData(out.hostA.photo)) delete out.hostA.photo;
    if (out.hostB && isData(out.hostB.photo)) delete out.hostB.photo;
  }
  if (photoInLink !== 'all') out.gallery = out.gallery.filter((g) => !isData(g));
  if (settings?.showBranding) out.brand = settings.businessName;
  return out;
}

function strip(o: any): any {
  if (Array.isArray(o)) return o.map(strip);
  if (o && typeof o === 'object') {
    const r: any = {};
    for (const [k, v] of Object.entries(o)) {
      if (v === '' || v === undefined || v === null) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      r[k] = strip(v);
    }
    return r;
  }
  return o;
}

export function encodeInvite(pub: PublicInvitation) {
  return compressToEncodedURIComponent(JSON.stringify(strip(pub)));
}

export function decodeInvite(s: string): PublicInvitation | null {
  try {
    const json = decompressFromEncodedURIComponent(s);
    if (!json) return null;
    const p = JSON.parse(json);
    return { events: [], gallery: [], rsvpEnabled: false, effects: true, music: 'melody', ...p, hostA: p.hostA || { name: '' } };
  } catch {
    return null;
  }
}

/** The published GitHub Pages site — used for share links when working locally. */
export const LIVE_URL = 'https://lvvnagendra.github.io/invitecraft/';

export function baseUrl(settings: Settings) {
  let u = (settings.publicUrl || '').trim();
  if (!u) u = isLocalUrl(location.href) ? LIVE_URL : location.origin + location.pathname;
  u = u.split('#')[0];
  return u;
}

export function inviteLink(inv: Invitation, settings: Settings, guestName?: string, opts?: { noPhotos?: boolean }) {
  const pub = toPublic(opts?.noPhotos ? { ...inv, photoInLink: 'none' } : inv, settings);
  if (opts?.noPhotos) {
    if (pub.hostA.photo?.startsWith('data:')) delete pub.hostA.photo;
    if (pub.hostB?.photo?.startsWith('data:')) delete pub.hostB.photo;
  }
  let link = `${baseUrl(settings)}#/i/${encodeInvite(pub)}`;
  if (guestName?.trim()) link += `?to=${encodeURIComponent(guestName.trim())}`;
  return link;
}

export function isLocalUrl(u: string) {
  return /localhost|127\.0\.0\.1|192\.168\.|file:/.test(u);
}

/* ---------------- phone / whatsapp ---------------- */

export function cleanPhone(p?: string) {
  let d = (p || '').replace(/\D/g, '');
  if (d.length === 10) d = '91' + d; // default India
  return d;
}

export function waLink(text: string, phone?: string) {
  const p = cleanPhone(phone);
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

/* ---------------- maps ---------------- */

export function mapsLink(inv: Pick<Invitation, 'mapUrl' | 'venueName' | 'venueAddress'>) {
  if (inv.mapUrl?.trim()) return inv.mapUrl.trim();
  const q = [inv.venueName, inv.venueAddress].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/* ---------------- files ---------------- */

export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function downloadDataUrl(url: string, name: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'invitation';
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** WhatsApp cuts messages at ~65,000 characters. */
export const WA_LIMIT = 60000;

export function kb(n: number) {
  return n < 1024 ? `${n} chars` : `${(n / 1024).toFixed(1)} KB`;
}
