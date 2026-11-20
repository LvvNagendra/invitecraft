import type { Invitation, PublicInvitation, Settings } from '../types';
import { DEFAULT_REPO } from './util';

/**
 * Optional free photo hosting on GitHub.
 * Photos are committed to a `media` branch of your repository and served from
 * raw.githubusercontent.com, so share links contain a short URL instead of the whole picture.
 */
const BRANCH = 'media';

export const hostingReady = (s: Settings) => !!(s.ghToken?.trim() && s.ghRepo?.trim());

function headers(s: Settings) {
  return { Authorization: `Bearer ${s.ghToken!.trim()}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
}

async function ensureBranch(s: Settings) {
  const repo = s.ghRepo!.trim();
  const info = await fetch(`https://api.github.com/repos/${repo}`, { headers: headers(s) });
  if (!info.ok) throw new Error(`Cannot access ${repo} (${info.status})`);
  const def = (await info.json()).default_branch;
  const ref = await fetch(`https://api.github.com/repos/${repo}/git/ref/heads/${def}`, { headers: headers(s) });
  const sha = (await ref.json()).object?.sha;
  const r = await fetch(`https://api.github.com/repos/${repo}/git/refs`, { method: 'POST', headers: headers(s), body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha }) });
  if (!r.ok && r.status !== 422) throw new Error(`Could not create media branch (${r.status})`);
}

export async function uploadPhoto(dataUrl: string, s: Settings): Promise<string> {
  const repo = s.ghRepo!.trim();
  const path = `photos/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const put = () =>
    fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: headers(s),
      body: JSON.stringify({ message: 'Add invitation photo', content: dataUrl.split(',')[1], branch: BRANCH }),
    });
  let r = await put();
  if (r.status === 404 || r.status === 422) {
    await ensureBranch(s);
    r = await put();
  }
  if (!r.ok) throw new Error(r.status === 401 ? 'GitHub token is invalid or expired' : `Upload failed (${r.status})`);
  return `https://raw.githubusercontent.com/${repo}/${BRANCH}/${path}`;
}

export async function testHosting(s: Settings) {
  const r = await fetch(`https://api.github.com/repos/${s.ghRepo!.trim()}`, { headers: headers(s) });
  if (!r.ok) throw new Error(r.status === 401 ? 'Token is invalid' : r.status === 404 ? 'Repository not found (check owner/repo and token access)' : `GitHub error ${r.status}`);
  const j = await r.json();
  if (j.permissions && !j.permissions.push) throw new Error('Token can read but not write this repository — give it "Contents: Read and write"');
  return true;
}

/** Uploads every embedded (data:) photo of an invitation and returns the updated copy. */
export async function hostAllPhotos(inv: Invitation, s: Settings, onProgress?: (done: number, total: number) => void) {
  const isData = (x?: string) => !!x && x.startsWith('data:');
  const jobs = [inv.hostA.photo, inv.hostB?.photo, ...inv.gallery].filter(isData).length;
  let done = 0;
  const up = async (x?: string) => {
    if (!isData(x)) return x;
    const url = await uploadPhoto(x!, s);
    onProgress?.(++done, jobs);
    return url;
  };
  return {
    ...inv,
    hostA: { ...inv.hostA, photo: await up(inv.hostA.photo) },
    hostB: inv.hostB ? { ...inv.hostB, photo: await up(inv.hostB.photo) } : undefined,
    gallery: await Promise.all(inv.gallery.map(up)) as string[],
  };
}

/* ---------------- short links ---------------- */


function utf8ToBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

/** Stores the public invitation as invites/<id>.json on the media branch (creates or updates). */
export async function publishInvite(id: string, pub: PublicInvitation, s: Settings): Promise<'ok' | 'taken'> {
  const repo = s.ghRepo!.trim();
  const url = `https://api.github.com/repos/${repo}/contents/invites/${id}.json`;
  const existing = await fetch(`${url}?ref=${BRANCH}`, { headers: headers(s) });
  if (existing.status === 404) await ensureBranch(s).catch(() => {});
  let sha: string | undefined;
  if (existing.ok) {
    const j = await existing.json();
    sha = j.sha;
    // never overwrite another client's invitation that uses the same link name
    try {
      const other = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(j.content.replace(/\s/g, '')), (c) => c.charCodeAt(0))));
      if (other.id && other.id !== pub.id) return 'taken';
    } catch { /* unreadable — treat as ours */ }
  }
  const r = await fetch(url, {
    method: 'PUT',
    headers: headers(s),
    body: JSON.stringify({ message: `Publish invitation ${id}`, content: utf8ToBase64(JSON.stringify(pub)), branch: BRANCH, ...(sha ? { sha } : {}) }),
  });
  if (!r.ok) throw new Error(r.status === 401 ? 'GitHub token is invalid or expired' : `Publish failed (${r.status})`);
  return 'ok';
}

/** Loads a published invitation for the guest page. */
export async function fetchPublished(id: string, repo = DEFAULT_REPO): Promise<PublicInvitation> {
  if (!/^[a-z0-9-]{2,80}$/i.test(id) || !/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('bad link');
  const r = await fetch(`https://raw.githubusercontent.com/${repo}/${BRANCH}/invites/${id}.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!r.ok) throw new Error('not found');
  const p = await r.json();
  return { events: [], gallery: [], rsvpEnabled: false, effects: true, music: 'melody', ...p, hostA: p.hostA || { name: '' } };
}

