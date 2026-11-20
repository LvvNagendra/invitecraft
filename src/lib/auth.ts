/**
 * Admin login. Only a PBKDF2 fingerprint of "email + password" is stored here — never the email or password.
 * Note: this is a static site, so this lock keeps the admin screens private on shared devices;
 * invitation data itself lives only in the browser where it was created.
 */
const SALT = '1a504fa889b6647452e4efa0d60a16a7';
const HASH = '0fbda1659bd85065656a75d321ae7106a92767e686fa81f792d5cc8d6db4e30d';
const ITERATIONS = 210000;
const KEY = 'invitecraft-session';
const DAYS = 30;

function hex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function derive(email: string, password: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(email.trim().toLowerCase() + String.fromCharCode(10) + password), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(SALT.match(/../g)!.map((x) => parseInt(x, 16)));
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256);
  return hex(bits);
}

export async function login(email: string, password: string, remember: boolean) {
  const ok = (await derive(email, password)) === HASH;
  if (ok) {
    const session = JSON.stringify({ h: HASH.slice(0, 16), until: Date.now() + DAYS * 864e5 });
    (remember ? localStorage : sessionStorage).setItem(KEY, session);
  }
  return ok;
}

export function isLoggedIn() {
  try {
    const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    return s.h === HASH.slice(0, 16) && s.until > Date.now();
  } catch {
    return false;
  }
}

export function logout() {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
}
