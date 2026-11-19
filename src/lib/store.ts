import { createStore, get, set } from 'idb-keyval';
import { useSyncExternalStore } from 'react';
import type { Client, EventType, Invitation, Settings } from '../types';
import { EVENTS } from './themes';
import { uid } from './util';

const idb = createStore('invitecraft-db', 'kv');

interface State {
  ready: boolean;
  invitations: Invitation[];
  clients: Client[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  businessName: 'InviteCraft',
  tagline: 'Premium Digital Invitations',
  phone: '',
  publicUrl: '',
  showBranding: true,
  defaultLang: 'en',
  defaultTheme: 'royal',
  nextCode: 1001,
};

let state: State = { ready: false, invitations: [], clients: [], settings: DEFAULT_SETTINGS };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => sel(state),
  );
}

export const getState = () => state;

async function persist() {
  await Promise.all([
    set('invitations', state.invitations, idb),
    set('clients', state.clients, idb),
    set('settings', state.settings, idb),
  ]);
}

export async function loadStore() {
  let [invitations, clients, settings] = await Promise.all([
    get<Invitation[]>('invitations', idb),
    get<Client[]>('clients', idb),
    get<Settings>('settings', idb),
  ]);
  const firstRun = !invitations;
  settings = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  state = { ready: true, invitations: invitations || [], clients: clients || [], settings };
  if (firstRun) {
    const client: Client = { id: uid(), name: 'Rahul Sharma', phone: '9876543210', city: 'Hyderabad', createdAt: Date.now() };
    const demo = newInvitation('wedding', settings);
    Object.assign(demo, DEMO_WEDDING, { clientId: client.id, status: 'ready' });
    state.clients = [client];
    state.invitations = [demo];
    state.settings = { ...settings, nextCode: settings.nextCode + 1 };
    await persist();
  }
  emit();
}

/* ---------------- invitations ---------------- */

function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function newInvitation(type: EventType, settings: Settings = state.settings): Invitation {
  const ev = EVENTS[type];
  const now = Date.now();
  return {
    id: uid(),
    code: `INV${settings.nextCode}`,
    type,
    theme: ev.defaultTheme,
    lang: settings.defaultLang,
    hostA: { name: '' },
    hostB: ev.twoHosts ? { name: '' } : undefined,
    blessing: type === 'birthday' ? '' : '|| Sri Ganeshaya Namaha ||',
    headline: ev.twoHosts ? 'Together with their families' : 'With joy in our hearts',
    message: '',
    invitedBy: '',
    date: plusDays(45),
    time: '10:30',
    timeLabel: ev.defaultTimeLabel,
    venueName: '',
    venueAddress: '',
    events: [],
    gallery: [],
    hostPhone: '',
    rsvpEnabled: true,
    effects: true,
    music: 'melody',
    guests: [],
    status: 'draft',
    photoInLink: 'couple',
    createdAt: now,
    updatedAt: now,
  };
}

export async function saveInvitation(inv: Invitation) {
  const exists = state.invitations.some((i) => i.id === inv.id);
  const next = { ...inv, updatedAt: Date.now() };
  const invitations = exists
    ? state.invitations.map((i) => (i.id === inv.id ? next : i))
    : [next, ...state.invitations];
  const settings = exists ? state.settings : { ...state.settings, nextCode: state.settings.nextCode + 1 };
  setState({ invitations, settings });
  await persist();
  return next;
}

export async function deleteInvitation(id: string) {
  setState({ invitations: state.invitations.filter((i) => i.id !== id) });
  await persist();
}

export async function duplicateInvitation(id: string) {
  const src = state.invitations.find((i) => i.id === id);
  if (!src) return;
  const copy: Invitation = {
    ...JSON.parse(JSON.stringify(src)),
    id: uid(),
    code: `INV${state.settings.nextCode}`,
    status: 'draft',
    guests: [],
    createdAt: Date.now(),
  };
  return saveInvitation(copy);
}

/* ---------------- clients ---------------- */

export async function saveClient(c: Client) {
  const exists = state.clients.some((x) => x.id === c.id);
  setState({ clients: exists ? state.clients.map((x) => (x.id === c.id ? c : x)) : [c, ...state.clients] });
  await persist();
}

export async function deleteClient(id: string) {
  setState({
    clients: state.clients.filter((c) => c.id !== id),
    invitations: state.invitations.map((i) => (i.clientId === id ? { ...i, clientId: undefined } : i)),
  });
  await persist();
}

/* ---------------- settings ---------------- */

export async function saveSettings(s: Settings) {
  setState({ settings: s });
  await persist();
}

/* ---------------- backup ---------------- */

export function exportBackup() {
  return JSON.stringify({ app: 'invitecraft', version: 1, exportedAt: new Date().toISOString(), ...state, ready: undefined }, null, 2);
}

export async function importBackup(json: string) {
  const data = JSON.parse(json);
  if (data.app !== 'invitecraft') throw new Error('Not an InviteCraft backup file');
  setState({
    invitations: data.invitations || [],
    clients: data.clients || [],
    settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
  });
  await persist();
}

/* ---------------- demo ---------------- */

const DEMO_WEDDING: Partial<Invitation> = {
  hostA: { name: 'Priya', parents: 'D/o Sri Venkat Rao & Smt. Lakshmi', family: 'Kommineni' },
  hostB: { name: 'Rahul', parents: 'S/o Sri Suresh Sharma & Smt. Anitha', family: 'Sharma' },
  blessing: '|| Sri Venkateswara Prasanna ||',
  headline: 'Together with their families',
  message:
    'With the divine blessings of the Almighty and our elders, we cordially invite you and your family to grace the auspicious occasion of the marriage of our beloved children. Your gracious presence and heartfelt blessings will make this day complete.',
  invitedBy: "With love,\nRahul & Priya's Family",
  date: plusDays(26),
  time: '10:30',
  timeLabel: 'Muhurtham',
  venueName: 'Sri Convention Hall',
  venueAddress: 'Road No. 10, Banjara Hills, Hyderabad',
  hostPhone: '9876543210',
  dressCode: 'Traditional Indian attire',
  hashtag: '#PriyaWedsRahul',
  events: [
    { id: 'e1', title: 'Haldi & Mehendi', date: plusDays(24), time: '16:00', venue: 'Bride’s Residence' },
    { id: 'e2', title: 'Sangeet Night', date: plusDays(25), time: '19:00', venue: 'Sri Convention Hall' },
    { id: 'e3', title: 'Wedding (Muhurtham)', date: plusDays(26), time: '10:30', venue: 'Sri Convention Hall' },
    { id: 'e4', title: 'Reception', date: plusDays(26), time: '19:30', venue: 'Sri Convention Hall' },
  ],
};
