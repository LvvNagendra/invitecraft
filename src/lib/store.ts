import { createStore, get, set } from 'idb-keyval';
import { useSyncExternalStore } from 'react';
import type { Client, EventType, Invitation, Settings } from '../types';
import { EVENTS } from './themes';
import { uid } from './util';
import { DEFAULT_PACKAGES, demos, plusDays } from './demos';

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
  packages: DEFAULT_PACKAGES,
  ghRepo: 'LvvNagendra/invitecraft',
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
  if (!settings.packages?.length) settings.packages = DEFAULT_PACKAGES;
  // migrations: gallery photos used to be left out of links by default; old demo had no photos
  const wedding = demos()[0].inv;
  invitations = (invitations || []).map((i) => {
    let x = { ...i, photoInLink: i.photoInLink === 'couple' ? 'all' : i.photoInLink } as Invitation;
    if (x.code === 'INV1001' && x.hostA.name === 'Priya' && !x.hostA.photo) {
      x = { ...x, hostA: { ...x.hostA, photo: wedding.hostA!.photo }, hostB: { ...x.hostB!, photo: wedding.hostB!.photo }, gallery: wedding.gallery! };
    }
    return x;
  });
  state = { ready: true, invitations, clients: clients || [], settings };
  if (firstRun) {
    const client: Client = { id: uid(), name: 'Rahul Sharma', phone: '9876543210', city: 'Hyderabad', createdAt: Date.now() };
    const demo = { ...newInvitation('wedding', settings), ...wedding, clientId: client.id, status: 'ready' as const, price: 1999, paid: true };
    state.clients = [client];
    state.invitations = [demo];
    state.settings = { ...settings, nextCode: settings.nextCode + 1 };
  }
  await persist();
  emit();
}

/* ---------------- invitations ---------------- */

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
    photoInLink: 'all',
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
  const { ghToken, ...settings } = state.settings; // never put the token into a file
  return JSON.stringify({ app: 'invitecraft', version: 1, exportedAt: new Date().toISOString(), invitations: state.invitations, clients: state.clients, settings }, null, 2);
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

/** Adds the ready-made sample invitations (for showing to clients). */
export async function addDemoInvitations() {
  let code = state.settings.nextCode;
  const created = demos().map((d) => ({ ...newInvitation(d.inv.type!), ...d.inv, code: `INV${code++}`, status: 'ready' as const, notes: 'Demo invitation' }));
  setState({ invitations: [...created, ...state.invitations], settings: { ...state.settings, nextCode: code } });
  await persist();
  return created.length;
}

/** Creates a client + draft invitation from a client details form submission. */
export async function importOrder(order: import('../types').ClientOrder) {
  const client: Client = { id: uid(), name: order.client.name || 'New client', phone: order.client.phone, city: order.client.city, notes: [order.pkg && `Package: ${order.pkg}`, order.client.notes].filter(Boolean).join(' · '), createdAt: Date.now() };
  const base = newInvitation(order.inv.type && order.inv.type in EVENTS ? order.inv.type : 'wedding');
  const pkg = state.settings.packages.find((p) => p.name === order.pkg);
  const inv: Invitation = {
    ...base, ...order.inv,
    id: base.id, code: base.code, guests: [], status: 'draft', clientId: client.id, photoInLink: 'all',
    price: pkg?.price, paid: false, createdAt: base.createdAt, updatedAt: base.updatedAt,
    hostA: { ...base.hostA, ...(order.inv.hostA || {}) },
    hostB: EVENTS[base.type].twoHosts || order.inv.hostB ? { name: '', ...(order.inv.hostB || {}) } : undefined,
    events: order.inv.events || [], gallery: order.inv.gallery || [],
  } as Invitation;
  setState({ clients: [client, ...state.clients], invitations: [inv, ...state.invitations], settings: { ...state.settings, nextCode: state.settings.nextCode + 1 } });
  await persist();
  return inv;
}
