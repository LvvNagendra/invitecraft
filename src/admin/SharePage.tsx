import {
  AlertTriangle, Check, Copy, Download, ExternalLink, FileText, Image as ImageIcon, Link2, MessageCircle, Pencil, QrCode, Share, Smartphone, Trash2, UserPlus, Users,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';
import type { Guest, Invitation } from '../types';
import { saveInvitation, useStore } from '../lib/store';
import { go } from '../lib/router';
import { EVENTS } from '../lib/themes';
import { whatsappMessage } from '../lib/messages';
import { posterPdf, posterPng } from '../lib/poster';
import { fitPublic, copyText, displayNames, downloadDataUrl, fmtDate, inviteLink, isLocalUrl, kb, slug, toPublic, uid, waLink, baseUrl, WA_LIMIT } from '../lib/util';
import { hostAllPhotos, hostingReady } from '../lib/hosting';
import { shrinkDataUrl } from '../lib/media';
import { Experience } from '../guest/Experience';
import { Badge, Btn, Card, cx, Field, Modal, PageHeader, PhoneFrame, toast } from './ui';
import { InviteThumb } from './Thumb';
import { StatusBadge } from './Dashboard';

export function SharePage({ id }: { id: string }) {
  const inv = useStore((s) => s.invitations.find((i) => i.id === id));
  const settings = useStore((s) => s.settings);
  const [qrOpen, setQrOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const link = useMemo(() => (inv ? inviteLink(inv, settings) : ''), [inv, settings]);
  const defaultMsg = useMemo(() => (inv ? whatsappMessage(inv, link) : ''), [inv, link]);
  useEffect(() => setMsg(defaultMsg), [defaultMsg]);

  if (!inv) return <div className="p-10 text-center text-stone-500">Invitation not found. <button className="text-brand-600 underline" onClick={() => go('/gallery')}>Back</button></div>;

  const local = isLocalUrl(baseUrl(settings));
  const pub = fitPublic(inv, settings); // exactly what guests receive
  const fname = `${slug(displayNames(inv))}-${inv.code}`;
  const markSent = () => inv.status !== 'sent' && saveInvitation({ ...inv, status: 'sent' });

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try { await fn(); } catch (e) { console.error(e); toast('Something went wrong — please try again'); }
    setBusy(null);
  };

  const qrLink = link.length > 2300 ? inviteLink(inv, settings, undefined, { noPhotos: true }) : link;

  const actions = [
    { key: 'wa', icon: <MessageCircle />, label: 'Share on WhatsApp', sub: 'Pick a contact or family group', tone: 'wa', onClick: () => { window.open(waLink(msg), '_blank'); markSent(); } },
    { key: 'copy', icon: <Link2 />, label: 'Copy Invitation Link', sub: kb(link.length), onClick: async () => { await copyText(link); toast('Link copied ✓'); } },
    { key: 'msg', icon: <Copy />, label: 'Copy Message', sub: 'For SMS, Telegram, Instagram', onClick: async () => { await copyText(msg); toast('Message copied ✓'); } },
    { key: 'native', icon: <Share />, label: 'More apps…', sub: 'Phone share sheet', onClick: async () => {
      if (navigator.share) await navigator.share({ title: EVENTS[inv.type].title.en, text: msg }).catch(() => {});
      else { await copyText(msg); toast('Sharing not supported here — message copied'); }
    } },
    { key: 'png', icon: <ImageIcon />, label: 'Download HD Image', sub: qrLink !== link ? '1080×1920 · its QR opens without photos' : '1080×1920 · WhatsApp status ready', onClick: () => run('png', async () => downloadDataUrl(await posterPng(pub, qrLink), `${fname}.png`)) },
    { key: 'pdf', icon: <FileText />, label: 'Download PDF', sub: 'Print-ready, clickable', onClick: () => run('pdf', async () => { (await posterPdf(pub, link)).save(`${fname}.pdf`); }) },
    { key: 'qr', icon: <QrCode />, label: 'Generate QR Code', sub: qrLink !== link ? 'Opens without photos (link too long for QR)' : 'For printed cards & banners', onClick: () => setQrOpen(true) },
    { key: 'phone', icon: <Smartphone />, label: 'Preview on Mobile', sub: 'Exactly what guests see', onClick: () => setPhoneOpen(true) },
  ];

  return (
    <div>
      <PageHeader
        title="Share Invitation"
        sub={`${inv.code} · ${EVENTS[inv.type].label}`}
        actions={
          <>
            <Btn onClick={() => go(`/edit/${inv.id}`)}><Pencil className="h-4 w-4" /> Edit</Btn>
            <Btn onClick={() => window.open(link, '_blank')}><ExternalLink className="h-4 w-4" /> Open link</Btn>
          </>
        }
      />

      {local && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Links currently point to this computer ({baseUrl(settings)})</p>
            <p className="mt-0.5">Relatives can’t open localhost links. Publish the site (e.g. GitHub Pages) and set its address in <button className="font-semibold underline" onClick={() => go('/settings')}>Settings → Website address</button>.</p>
          </div>
        </div>
      )}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Card className="flex items-center gap-4 p-4">
            <InviteThumb inv={inv} className="h-28 w-20 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="font-script text-3xl leading-tight text-wine-800">{displayNames(inv)}</p>
              <p className="text-sm text-stone-500">{fmtDate(inv.date)} {inv.venueName && `· ${inv.venueName}`}</p>
              <div className="mt-2 flex flex-wrap gap-1.5"><StatusBadge status={inv.status} /><Badge>{inv.guests.length} guests</Badge></div>
            </div>
          </Card>

          <PhotoCheck
            inv={inv}
            pub={pub}
            hosting={hostingReady(settings)}
            busy={busy === 'host'}
            onShrink={() => run('host', async () => {
              const fix = async (p?: string) => (p?.startsWith('data:') ? shrinkDataUrl(p) : p);
              await saveInvitation({ ...inv, photoInLink: 'all', hostA: { ...inv.hostA, photo: await fix(inv.hostA.photo) }, hostB: inv.hostB && { ...inv.hostB, photo: await fix(inv.hostB.photo) } });
              toast('Portraits resized — they now fit in the link ✓');
            })}
            onHost={() => run('host', async () => {
              const next = await hostAllPhotos(inv, settings, (d, t) => toast(`Uploading photos ${d}/${t}…`));
              await saveInvitation(next);
              toast('All photos uploaded — every photo is in the link now ✓');
            })}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {actions.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={a.onClick}
                disabled={busy === a.key}
                className={cx(
                  'group flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60',
                  a.tone === 'wa' ? 'col-span-2 border-transparent bg-[#25D366] text-white sm:col-span-2' : 'border-stone-200 bg-white hover:border-brand-400',
                )}
              >
                <span className={cx('flex h-10 w-10 items-center justify-center rounded-xl [&_svg]:h-5 [&_svg]:w-5', a.tone === 'wa' ? 'bg-white/20' : 'bg-brand-50 text-brand-600')}>{a.icon}</span>
                <span>
                  <span className="block text-sm font-semibold">{busy === a.key ? 'Preparing…' : a.label}</span>
                  <span className={cx('block text-xs', a.tone === 'wa' ? 'text-white/80' : 'text-stone-400')}>{a.sub}</span>
                </span>
              </button>
            ))}
          </div>

          <GuestList inv={inv} />
        </div>

        <div className="min-w-0 space-y-4">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 bg-[#efe7dc] px-4 py-2.5">
              <p className="flex items-center gap-2 text-sm font-semibold text-stone-700"><MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp message</p>
              {msg !== defaultMsg && <button type="button" onClick={() => setMsg(defaultMsg)} className="text-xs text-brand-600">Reset</button>}
            </div>
            <div className="bg-[#e5ddd5] p-3" style={{ backgroundImage: 'radial-gradient(#d5cbc0 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="h-[420px] w-full resize-none rounded-xl rounded-tr-none bg-[#dcf8c6] p-3 text-[13px] leading-relaxed text-stone-800 shadow outline-none"
              />
            </div>
          </Card>
        </div>
      </div>

      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} link={qrLink} trimmed={qrLink !== link} name={fname} />
      <Modal open={phoneOpen} onClose={() => setPhoneOpen(false)} title="Mobile preview">
        <PhoneFrame className="max-w-[320px]"><Experience data={pub} embedded link={link} /></PhoneFrame>
        <p className="mt-3 text-center text-xs text-stone-400">Tap the envelope — music starts after the tap, just like on a guest's phone.</p>
      </Modal>
    </div>
  );
}

function QrModal({ open, onClose, link, trimmed, name }: { open: boolean; onClose: () => void; link: string; trimmed: boolean; name: string }) {
  const [src, setSrc] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(link, { width: 900, margin: 2, errorCorrectionLevel: 'L', color: { dark: '#3b0a14', light: '#ffffff' } })
      .then((s) => { setSrc(s); setErr(''); })
      .catch(() => setErr('This link is too long for a QR code. Remove photos from the link (Edit → Experience) and try again.'));
  }, [open, link]);
  return (
    <Modal open={open} onClose={onClose} title="QR Code">
      {err ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{err}</p> : (
        <div className="text-center">
          {src && <img src={src} alt="QR code" className="mx-auto w-64 rounded-2xl border-4 border-brand-400 p-2" />}
          {trimmed && <p className="mt-3 text-xs text-amber-700">Photos were left out of the QR link to keep it scannable.</p>}
          <Btn variant="primary" className="mt-4" onClick={() => downloadDataUrl(src, `${name}-qr.png`)}><Download className="h-4 w-4" /> Download QR</Btn>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- guest list ---------------- */

function GuestList({ inv }: { inv: Invitation }) {
  const settings = useStore((s) => s.settings);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bulk, setBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');

  const update = (guests: Guest[]) => saveInvitation({ ...inv, guests });
  const add = () => {
    if (!name.trim()) return toast('Enter a guest name');
    update([...inv.guests, { id: uid(), name: name.trim(), phone: phone.trim() || undefined }]);
    setName('');
    setPhone('');
  };
  const addBulk = () => {
    const rows = bulkText.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const [n, p] = l.split(/[,\t]/).map((s) => s.trim());
      return { id: uid(), name: n, phone: p || undefined } as Guest;
    });
    update([...inv.guests, ...rows]);
    setBulkText('');
    setBulk(false);
    toast(`${rows.length} guests added`);
  };
  const send = (g: Guest) => {
    const link = inviteLink(inv, settings, g.name);
    window.open(waLink(whatsappMessage(inv, link, g.name), g.phone), '_blank');
    saveInvitation({ ...inv, status: 'sent', guests: inv.guests.map((x) => (x.id === g.id ? { ...x, sent: true } : x)) });
  };
  const sentCount = inv.guests.filter((g) => g.sent).length;
  const list = inv.guests.filter((g) => filter === 'all' || (filter === 'sent' ? g.sent : !g.sent));

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-wine-900"><Users className="h-5 w-5 text-brand-500" /> Personalised guest links</h2>
        <button type="button" onClick={() => setBulk(!bulk)} className="text-xs font-medium text-brand-600 hover:underline">{bulk ? 'Single add' : 'Bulk paste'}</button>
      </div>
      <p className="mb-4 text-sm text-stone-500">Each relative sees <em>“Dear Uncle Ramesh Garu…”</em> when they open their link.</p>

      {bulk ? (
        <div className="space-y-2">
          <textarea className="input font-mono !text-xs" rows={5} value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={'Uncle Ramesh Garu, 9876543210\nLakshmi Aunty, 9123456780\nSuresh & Family'} />
          <Btn variant="primary" onClick={addBulk}>Add all</Btn>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Field label="Guest name" className="flex-1"><input className="input" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Uncle Ramesh Garu" /></Field>
          <Field label="WhatsApp (optional)" className="sm:w-44"><input className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="98765 43210" /></Field>
          <Btn variant="primary" className="sm:mt-6" onClick={add}><UserPlus className="h-4 w-4" /> Add</Btn>
        </div>
      )}

      {inv.guests.length > 0 && (
        <>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-[#25D366] transition-all" style={{ width: `${(sentCount / inv.guests.length) * 100}%` }} />
            </div>
            <span className="text-xs font-medium text-stone-500">{sentCount}/{inv.guests.length} sent</span>
          </div>
          <div className="mt-3 flex gap-1">
            {(['all', 'pending', 'sent'] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={cx('rounded-full px-3 py-1 text-xs capitalize', filter === f ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600')}>{f}</button>
            ))}
          </div>
          <div className="mt-3 divide-y divide-stone-100">
            {list.map((g) => (
              <div key={g.id} className="flex items-center gap-2 py-2.5">
                <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold', g.sent ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600')}>
                  {g.sent ? <Check className="h-4 w-4" /> : g.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{g.name}</p>
                  <p className="text-xs text-stone-400">{g.phone || 'Choose chat in WhatsApp'}</p>
                </div>
                <Btn size="sm" variant="whatsapp" onClick={() => send(g)}><MessageCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{g.sent ? 'Resend' : 'Send'}</span></Btn>
                <Btn size="sm" variant="ghost" aria-label="Copy link" onClick={async () => { await copyText(inviteLink(inv, settings, g.name)); toast(`Link for ${g.name} copied`); }}><Copy className="h-3.5 w-3.5" /></Btn>
                <Btn size="sm" variant="ghost" aria-label="Remove" onClick={() => update(inv.guests.filter((x) => x.id !== g.id))}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Btn>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

/** Shows whether the invitation's photos are actually inside the share link. */
function PhotoCheck({ inv, pub, hosting, busy, onHost, onShrink }: { inv: Invitation; pub: ReturnType<typeof fitPublic>; hosting: boolean; busy: boolean; onHost: () => void; onShrink: () => void }) {
  const portraits = [inv.hostA.photo, inv.hostB?.photo].filter(Boolean).length;
  const portraitsIn = [pub.hostA.photo, pub.hostB?.photo].filter(Boolean).length;
  const gallery = inv.gallery.length;
  const galleryIn = pub.gallery.length;
  const none = portraits + gallery === 0;
  const missing = portraitsIn < portraits || galleryIn < gallery;
  const switchedOff = inv.photoInLink !== 'all';
  const embedded = [inv.hostA.photo, inv.hostB?.photo, ...inv.gallery].some((x) => x?.startsWith('data:'));
  return (
    <div className={cx('rounded-2xl border p-4 text-sm', none || missing ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900')}>
      <div className="flex gap-3">
        <ImageIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          {none ? (
            <p><b>No photos in this invitation.</b> Guests will see initials. Add portraits in Edit → People and a gallery in Edit → Experience.</p>
          ) : (
            <>
              <p><b>Photos guests will see:</b> {portraitsIn}/{portraits} portrait{portraits === 1 ? '' : 's'} · {galleryIn}/{gallery} gallery {missing ? '' : '✓'}</p>
              {missing && switchedOff && <p className="mt-1">Some photos are switched off. Edit → Experience → Photos in the share link → <b>All photos</b>.</p>}
              {missing && !switchedOff && !hosting && (
                <p className="mt-1">
                  {portraitsIn < portraits ? <>Your portraits are too large for a WhatsApp-safe link — tap <b>Make photos fit</b>. </> : null}
                  {galleryIn < gallery ? <>Gallery photos need <b>free photo hosting</b> (2 minutes, once) — then every photo is included with a short link.</> : null}
                </p>
              )}
              {missing && !switchedOff && hosting && <p className="mt-1">Upload the photos to your photo hosting and every photo will be included.</p>}
            </>
          )}
        </div>
      </div>
      {(none || missing || (hosting && embedded)) && (
        <div className="mt-3 flex flex-wrap gap-2 pl-8">
          {none || switchedOff ? <Btn size="sm" onClick={() => go(`/edit/${inv.id}`)}>Add / fix photos</Btn> : null}
          {!none && hosting && embedded && <Btn size="sm" variant="primary" disabled={busy} onClick={onHost}>{busy ? 'Uploading…' : 'Upload photos'}</Btn>}
          {!none && !switchedOff && !hosting && portraitsIn < portraits && <Btn size="sm" variant="primary" disabled={busy} onClick={onShrink}>{busy ? 'Resizing…' : 'Make photos fit'}</Btn>}
          {!none && !switchedOff && !hosting && galleryIn < gallery && <Btn size="sm" onClick={() => go('/settings?hosting')}>Set up photo hosting</Btn>}
        </div>
      )}
    </div>
  );
}
