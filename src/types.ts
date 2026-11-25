export type EventType =
  | 'wedding'
  | 'engagement'
  | 'birthday'
  | 'housewarming'
  | 'anniversary'
  | 'naming';

export type Lang = 'en' | 'te' | 'hi';

export type ThemeId = 'royal' | 'temple' | 'blush' | 'emerald' | 'midnight' | 'peacock' | 'sage' | 'ivory';

export type MusicMode = 'melody' | 'love' | 'custom' | 'none';

export interface Person {
  name: string;
  photo?: string; // data URL or https URL
  parents?: string; // "S/o Sri Ramesh & Smt. Lakshmi"
  family?: string; // surname / native place
  grand?: string; // "Granddaughter of Late Sri …"
  bio?: string; // "Meet the couple" description
}

export interface StoryItem {
  id: string;
  emoji: string;
  title: string;
  text: string;
  when?: string; // "2021", "March 2023"
}

export interface FamilyGroup {
  id: string;
  title: string; // "Bride's Family"
  members: string; // one name per line
}

export interface Wish {
  id: string;
  name: string;
  text: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  venue?: string;
  note?: string; // short description: "An evening of song and dance"
  endTime?: string; // HH:mm
  dress?: string; // per-event dress code
}

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  group?: string;
  sent?: boolean;
}

export interface Invitation {
  id: string;
  code: string; // INV1001
  type: EventType;
  theme: ThemeId;
  lang: Lang;

  hostA: Person; // bride / celebrant / baby / family
  hostB?: Person; // groom / partner
  age?: string; // birthday age, anniversary years

  blessing: string; // top invocation line
  headline: string; // "Together with their families"
  message: string;
  invitedBy: string; // "With love, ..."

  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timeLabel: string; // "Muhurtham" / "Time"
  venueName: string;
  venueAddress: string;
  mapUrl?: string;

  events: EventItem[];
  gallery: string[];
  story?: StoryItem[]; // love story / journey timeline
  families?: FamilyGroup[]; // "awaiting your gracious presence"
  wishes?: Wish[]; // wishes wall (curated by the family)
  scratchReveal?: boolean; // scratch card to reveal the date
  slug?: string; // pretty short link: #/v/lilly-nagendra

  hostPhone: string; // WhatsApp number for RSVP and wishes
  dressCode?: string;
  hashtag?: string;
  rsvpEnabled: boolean;
  rsvpBy?: string; // YYYY-MM-DD

  envelopeText?: string;
  effects: boolean;
  music: MusicMode;
  musicUrl?: string;

  // ---------- admin-only (never put into share links) ----------
  clientId?: string;
  guests: Guest[];
  status: 'draft' | 'ready' | 'sent';
  price?: number;
  paid?: boolean;
  notes?: string;
  photoInLink: 'none' | 'couple' | 'all';
  publishedSig?: string; // fingerprint of the version published as a short link
  publishedPath?: string; // the short link name it was published under
  createdAt: number;
  updatedAt: number;
}

/** What actually travels inside the share link. */
export type PublicInvitation = Omit<
  Invitation,
  'clientId' | 'guests' | 'status' | 'price' | 'paid' | 'notes' | 'photoInLink' | 'publishedSig' | 'publishedPath' | 'createdAt' | 'updatedAt'
> & { brand?: string };

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  notes?: string;
  createdAt: number;
}

export interface Settings {
  businessName: string;
  tagline: string;
  phone: string;
  publicUrl: string; // where the site is hosted, e.g. https://you.github.io/invitecraft/
  showBranding: boolean;
  defaultLang: Lang;
  defaultTheme: ThemeId;
  nextCode: number;
  packages: Package[];
  ghToken?: string; // optional GitHub token for photo hosting (never exported / shared)
  ghRepo?: string; // owner/repo
}

export interface Package {
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

/** Public business profile carried in showcase / client-form links. */
export interface BusinessProfile {
  name: string;
  tagline: string;
  phone: string;
  packages: Package[];
}

/** What a client submits through the details form. */
export interface ClientOrder {
  v: 1;
  client: { name: string; phone: string; city?: string; notes?: string };
  pkg?: string;
  inv: Partial<Invitation>;
}
