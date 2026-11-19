import type { PublicInvitation } from '../types';
import { displayNames, eventDate, mapsLink } from './util';
import { EVENTS } from './themes';

/** Resize + compress an uploaded image to a small JPEG data URL (keeps share links short). */
export function compressImage(file: File, maxSize = 360, quality = 0.62): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
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
