import type { PublicInvitation } from '../types';
import { displayNames, eventDate, mapsLink } from './util';
import { EVENTS } from './themes';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function encode(img: HTMLImageElement, maxSize: number, quality: number, small: boolean) {
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(img.width * scale));
  c.height = Math.max(1, Math.round(img.height * scale));
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  if (small) {
    // WebP is ~15% smaller; Safari can't encode it and returns PNG, so fall back to JPEG
    const webp = c.toDataURL('image/webp', quality);
    if (webp.startsWith('data:image/webp')) return webp;
  }
  return c.toDataURL('image/jpeg', quality);
}

/** Resize + compress an uploaded image to a data URL. */
export async function compressImage(file: File, maxSize = 360, quality = 0.62): Promise<string> {
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(file);
  });
  return encode(await loadImage(data), maxSize, quality, maxSize <= 200);
}

/** Portrait size that fits inside a WhatsApp-safe share link (two of them ≈ 14,000 characters). */
export const LINK_PORTRAIT = { size: 150, quality: 0.5 };

/** Re-compresses an existing data-URL photo (used to make old, large photos fit the link). */
export async function shrinkDataUrl(dataUrl: string, maxSize = LINK_PORTRAIT.size, quality = LINK_PORTRAIT.quality) {
  return encode(await loadImage(dataUrl), maxSize, quality, true);
}

/* ---------------- calendar ---------------- */

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function esc(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function buildIcs(inv: PublicInvitation, link?: string) {
  const start = eventDate(inv.date, inv.time);
  const end = new Date(start.getTime() + 3 * 3600 * 1000);
  const ev = EVENTS[inv.type];
  const title = `${ev.title.en}: ${displayNames(inv)}`;
  const loc = [inv.venueName, inv.venueAddress].filter(Boolean).join(', ');
  const desc = `${inv.message || ''}\n\nMap: ${mapsLink(inv)}${link ? `\nInvitation: ${link}` : ''}`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//InviteCraft//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${inv.id}@invitecraft`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(loc)}`,
    `DESCRIPTION:${esc(desc)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)} tomorrow`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function googleCalendarLink(inv: PublicInvitation) {
  const start = eventDate(inv.date, inv.time);
  const end = new Date(start.getTime() + 3 * 3600 * 1000);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${EVENTS[inv.type].title.en}: ${displayNames(inv)}`,
    dates: `${icsDate(start)}/${icsDate(end)}`,
    details: inv.message || '',
    location: [inv.venueName, inv.venueAddress].filter(Boolean).join(', '),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
