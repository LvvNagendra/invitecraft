import type { Invitation, Settings } from '../types';

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
