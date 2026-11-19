import { compressToEncodedURIComponent as enc, decompressFromEncodedURIComponent as dec } from 'lz-string';
import type { BusinessProfile, ClientOrder, Settings } from '../types';
import { DEFAULT_PACKAGES } from './demos';
import { baseUrl } from './util';

export function profileOf(s: Settings): BusinessProfile {
  return { name: s.businessName, tagline: s.tagline, phone: s.phone, packages: s.packages };
}

export function readProfile(query: string): BusinessProfile {
  const p = new URLSearchParams(query).get('p');
  const fallback: BusinessProfile = { name: 'InviteCraft', tagline: 'Premium Digital Invitations', phone: '', packages: DEFAULT_PACKAGES };
  if (!p) return fallback;
  try {
    return { ...fallback, ...JSON.parse(dec(p) || '{}') };
  } catch {
    return fallback;
  }
}

const q = (s: Settings) => `?p=${enc(JSON.stringify(profileOf(s)))}`;
export const showcaseLink = (s: Settings) => `${baseUrl(s)}#/showcase${q(s)}`;
export const orderLink = (s: Settings) => `${baseUrl(s)}#/order${q(s)}`;
export const profileQuery = (p: BusinessProfile) => `?p=${enc(JSON.stringify(p))}`;

/* ---------------- client orders ---------------- */

const PREFIX = 'IC1-';

/**
 * Code for the WhatsApp message. Portrait photos (small, ~10 KB each) are included so they
 * arrive with the details; gallery photos are too big for a message and travel in the details file.
 */
export function orderCode(o: ClientOrder): { code: string; portraits: boolean } {
  const inv = { ...o.inv, gallery: [] };
  const code = PREFIX + enc(JSON.stringify({ ...o, inv }));
  if (code.length <= 45000) return { code, portraits: true };
  const noPhotos = { ...inv, hostA: inv.hostA && { ...inv.hostA, photo: undefined }, hostB: inv.hostB && { ...inv.hostB, photo: undefined } };
  return { code: PREFIX + enc(JSON.stringify({ ...o, inv: noPhotos })), portraits: false };
}

/** Accepts a pasted WhatsApp message, a bare code, or the JSON details file. */
export function parseOrder(text: string): ClientOrder | null {
  const t = text.trim();
  try {
    if (t.startsWith('{')) {
      const j = JSON.parse(t);
      if (j.v === 1 && j.inv) return j;
    }
    const m = t.match(/IC1-([A-Za-z0-9+\-$]+)/);
    if (m) {
      const j = JSON.parse(dec(m[1]) || 'null');
      if (j?.inv) return j;
    }
  } catch { /* fallthrough */ }
  return null;
}
