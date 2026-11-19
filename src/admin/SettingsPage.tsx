import { CloudUpload, Download, Globe, Plus, Save, Sparkles, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Lang, Settings } from '../types';
import { addDemoInvitations, exportBackup, importBackup, saveSettings, useStore } from '../lib/store';
import { testHosting } from '../lib/hosting';
import { DEFAULT_PACKAGES } from '../lib/demos';
import { go } from '../lib/router';
import { baseUrl, downloadBlob, isLocalUrl } from '../lib/util';
import { Btn, Card, Field, PageHeader, toast, Toggle } from './ui';

const NL = String.fromCharCode(10);

export function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const [s, setS] = useState<Settings>(settings);
  const file = useRef<HTMLInputElement>(null);
  const up = (p: Partial<Settings>) => setS((x) => ({ ...x, ...p }));
  const current = location.origin + location.pathname;
  useEffect(() => {
    if (location.hash.includes('?hosting')) setTimeout(() => document.getElementById('photo-hosting')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Business Settings" sub="Your brand, website address and data backup" actions={<Btn variant="primary" onClick={async () => { await saveSettings(s); toast('Settings saved ✓'); }}><Save className="h-4 w-4" /> Save</Btn>} />

      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <h2 className="font-display text-lg font-semibold text-wine-900">Brand</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name"><input className="input" value={s.businessName} onChange={(e) => up({ businessName: e.target.value })} /></Field>
            <Field label="Tagline"><input className="input" value={s.tagline} onChange={(e) => up({ tagline: e.target.value })} /></Field>
            <Field label="Business WhatsApp number" hint="Client forms & enquiries are sent here."><input className="input" inputMode="tel" value={s.phone} onChange={(e) => up({ phone: e.target.value })} placeholder="98765 43210" /></Field>
          </div>
          <Toggle label={`Show “Crafted with ❤ by ${s.businessName}” on invitations`} checked={s.showBranding} onChange={(v) => up({ showBranding: v })} />
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-wine-900"><Globe className="h-5 w-5 text-brand-500" /> Website address</h2>
          <Field label="Published site URL" hint={<>Where this app is hosted, e.g. <code>https://yourname.github.io/invitecraft/</code>. Leave empty to use {isLocalUrl(current) ? 'the live site automatically' : 'this address'} ({baseUrl(s)}).</>}>
            <input className="input" value={s.publicUrl} onChange={(e) => up({ publicUrl: e.target.value })} placeholder="https://yourname.github.io/invitecraft/" />
          </Field>
          {isLocalUrl(baseUrl(s)) && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Links point to a local address. Shared links only work after you publish the site and enter its URL here.</p>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-wine-900">Packages & prices</h2>
            <Btn size="sm" onClick={() => up({ packages: [...s.packages, { name: 'New package', price: 0, features: [] }] })}><Plus className="h-3.5 w-3.5" /> Add</Btn>
          </div>
          <p className="text-sm text-stone-500">Shown on your showcase page and in the client details form.</p>
          <div className="space-y-3">
            {s.packages.map((p, i) => {
              const set = (patch: Partial<typeof p>) => up({ packages: s.packages.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
              return (
                <div key={i} className="rounded-2xl border border-stone-200 p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto_auto]">
                    <input className="input" value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Package name" />
                    <input className="input" type="number" value={p.price} onChange={(e) => set({ price: Number(e.target.value) || 0 })} placeholder="₹" />
                    <label className="flex items-center gap-2 px-2 text-xs"><input type="checkbox" checked={!!p.popular} onChange={(e) => up({ packages: s.packages.map((x, k) => ({ ...x, popular: k === i ? e.target.checked : e.target.checked ? false : x.popular })) })} /> Popular</label>
                    <Btn size="sm" variant="ghost" onClick={() => up({ packages: s.packages.filter((_, k) => k !== i) })} aria-label="Remove"><Trash2 className="h-4 w-4 text-red-400" /></Btn>
                  </div>
                  <textarea className="input mt-2 !text-xs" rows={3} value={p.features.join(NL)} onChange={(e) => set({ features: e.target.value.split(NL) })} placeholder="One feature per line" />
                </div>
              );
            })}
          </div>
          <button type="button" className="text-xs text-brand-600 hover:underline" onClick={() => up({ packages: DEFAULT_PACKAGES })}>Reset to default packages</button>
        </Card>

        <Card className="space-y-4 p-5 ring-2 ring-brand-400/40">
          <span id="photo-hosting" />
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-wine-900"><CloudUpload className="h-5 w-5 text-brand-500" /> Short links &amp; photo hosting (recommended)</h2>
          <p className="text-sm text-stone-500">Without hosting, photos travel <em>inside</em> the link, so galleries make links too long for WhatsApp. With hosting, photos are saved in your GitHub repository and links stay short.</p>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-stone-500">
            <li>Open <a className="text-brand-600 underline" href="https://github.com/settings/personal-access-tokens/new?name=InviteCraft%20photos&description=Photo%20hosting%20for%20invitations&expires_in=none&contents=write" target="_blank" rel="noreferrer">GitHub → Fine-grained token</a>.</li>
            <li>Repository access: <b>Only select repositories</b> → your invitecraft repo. Permissions → <b>Contents: Read and write</b>.</li>
            <li>Generate, then paste the token below (it stays only in this browser and is never shared or backed up).</li>
          </ol>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Repository (owner/name)"><input className="input" value={s.ghRepo || ''} onChange={(e) => up({ ghRepo: e.target.value })} placeholder="LvvNagendra/invitecraft" /></Field>
            <Field label="GitHub token"><input className="input" type="password" autoComplete="off" value={s.ghToken || ''} onChange={(e) => up({ ghToken: e.target.value })} placeholder="github_pat_…" /></Field>
          </div>
          <Btn size="sm" disabled={!s.ghRepo || !s.ghToken} onClick={async () => {
            try { await testHosting(s); await saveSettings(s); toast('Photo hosting works ✓ (saved)'); } catch (e: any) { toast(e.message); }
          }}>Test & save</Btn>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-wine-900"><Sparkles className="h-5 w-5 text-brand-500" /> Demo invitations</h2>
          <p className="text-sm text-stone-500">Adds 4 ready-made samples (Telugu wedding, 1st birthday, Telugu housewarming, engagement) with photos — great for showing to clients.</p>
          <Btn onClick={async () => { const n = await addDemoInvitations(); toast(`${n} demo invitations added ✓`); go('/gallery'); }}><Plus className="h-4 w-4" /> Add demo invitations</Btn>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-display text-lg font-semibold text-wine-900">Defaults for new invitations</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Language">
              <select className="input" value={s.defaultLang} onChange={(e) => up({ defaultLang: e.target.value as Lang })}>
                <option value="en">English</option><option value="te">తెలుగు (Telugu)</option><option value="hi">हिन्दी (Hindi)</option>
              </select>
            </Field>
            <Field label="Next invitation number">
              <input type="number" className="input" value={s.nextCode} onChange={(e) => up({ nextCode: Number(e.target.value) || 1001 })} />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-display text-lg font-semibold text-wine-900">Backup & restore</h2>
          <p className="text-sm text-stone-500">All invitations and clients are stored privately in this browser (IndexedDB). Download a backup regularly, or to move to another computer.</p>
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => downloadBlob(new Blob([exportBackup()], { type: 'application/json' }), `invitecraft-backup-${new Date().toISOString().slice(0, 10)}.json`)}><Download className="h-4 w-4" /> Download backup</Btn>
            <Btn onClick={() => file.current?.click()}><Upload className="h-4 w-4" /> Restore from file</Btn>
            <input ref={file} type="file" accept="application/json" hidden onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (!confirm('Restoring replaces all current invitations, clients and settings in this browser. Continue?')) return;
              try { await importBackup(await f.text()); toast('Backup restored ✓'); location.reload(); } catch (err: any) { toast(err.message || 'Invalid file'); }
            }} />
          </div>
        </Card>
        <Btn variant="primary" size="lg" className="w-full" onClick={async () => { await saveSettings(s); toast('Settings saved ✓'); }}><Save className="h-4 w-4" /> Save all settings</Btn>
      </div>
    </div>
  );
}
