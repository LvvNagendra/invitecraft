import { Download, Globe, Save, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Lang, Settings } from '../types';
import { exportBackup, importBackup, saveSettings, useStore } from '../lib/store';
import { downloadBlob, isLocalUrl } from '../lib/util';
import { Btn, Card, Field, PageHeader, toast, Toggle } from './ui';

export function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const [s, setS] = useState<Settings>(settings);
  const file = useRef<HTMLInputElement>(null);
  const up = (p: Partial<Settings>) => setS((x) => ({ ...x, ...p }));
  const current = location.origin + location.pathname;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Business Settings" sub="Your brand, website address and data backup" actions={<Btn variant="primary" onClick={async () => { await saveSettings(s); toast('Settings saved ✓'); }}><Save className="h-4 w-4" /> Save</Btn>} />

      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <h2 className="font-display text-lg font-semibold text-wine-900">Brand</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name"><input className="input" value={s.businessName} onChange={(e) => up({ businessName: e.target.value })} /></Field>
            <Field label="Tagline"><input className="input" value={s.tagline} onChange={(e) => up({ tagline: e.target.value })} /></Field>
            <Field label="Business phone"><input className="input" value={s.phone} onChange={(e) => up({ phone: e.target.value })} /></Field>
          </div>
          <Toggle label={`Show “Crafted with ❤ by ${s.businessName}” on invitations`} checked={s.showBranding} onChange={(v) => up({ showBranding: v })} />
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-wine-900"><Globe className="h-5 w-5 text-brand-500" /> Website address</h2>
          <Field label="Published site URL" hint={<>Where this app is hosted, e.g. <code>https://yourname.github.io/invitecraft/</code>. Leave empty to use the current address ({current}).</>}>
            <input className="input" value={s.publicUrl} onChange={(e) => up({ publicUrl: e.target.value })} placeholder="https://yourname.github.io/invitecraft/" />
          </Field>
          {isLocalUrl(s.publicUrl || current) && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">You're on a local address. Shared links will only work after you publish the site and enter its URL here.</p>
          )}
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
      </div>
    </div>
  );
}
