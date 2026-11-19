import { ClipboardPaste, Copy, ExternalLink, FileUp, Inbox, MessageCircle, Presentation, Send } from 'lucide-react';
import { useRef, useState } from 'react';
import { importOrder, useStore } from '../lib/store';
import { orderLink, parseOrder, showcaseLink } from '../lib/business';
import { go } from '../lib/router';
import { copyText, waLink } from '../lib/util';
import { Btn, Card, Modal, toast } from './ui';

/** Import a client's form submission (pasted WhatsApp message or details file). */
export function ImportOrderButton({ variant = 'outline' as const }: { variant?: 'outline' | 'primary' | 'gold' }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const doImport = async (raw: string) => {
    const order = parseOrder(raw);
    if (!order) return toast('Could not find client details — paste the whole WhatsApp message or choose the file');
    const inv = await importOrder(order);
    setOpen(false);
    setText('');
    const pics = [order.inv.hostA?.photo, order.inv.hostB?.photo].filter(Boolean).length + (order.inv.gallery?.length || 0);
    toast(pics ? `Imported ${order.client.name}'s details with ${pics} photo(s) ✓` : `Imported ${order.client.name}'s details ✓ — no photos received, add them in the editor`);
    go(`/edit/${inv.id}`);
  };

  return (
    <>
      <Btn variant={variant} onClick={() => setOpen(true)}><Inbox className="h-4 w-4" /> Import client details</Btn>
      <Modal open={open} onClose={() => setOpen(false)} title="Import client details">
        <p className="mb-3 text-sm text-stone-500">When a client fills your details form, you receive a WhatsApp message with a code (IC1-…) and optionally a details file with photos.</p>
        <textarea className="input font-mono !text-xs" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the client's whole WhatsApp message here…" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn variant="primary" onClick={() => doImport(text)}><ClipboardPaste className="h-4 w-4" /> Import message</Btn>
          <Btn onClick={() => file.current?.click()}><FileUp className="h-4 w-4" /> Choose details file (with photos)</Btn>
          <input ref={file} type="file" accept=".json,application/json" hidden onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) await doImport(await f.text());
            e.target.value = '';
          }} />
        </div>
        <p className="mt-3 text-xs text-stone-400">A new client and a draft invitation are created — then you just review, polish and share.</p>
      </Modal>
    </>
  );
}

export function ClientLinksCard() {
  const settings = useStore((s) => s.settings);
  const rows = [
    {
      icon: <Presentation className="h-5 w-5" />,
      title: 'Showcase & price list',
      desc: 'Your premium sales page — live demos, features, packages and FAQ. Send it to new enquiries.',
      link: showcaseLink(settings),
      msg: `🙏 Namaste! Here are our premium digital invitations — open a live demo and see the packages:\n`,
    },
    {
      icon: <Send className="h-5 w-5" />,
      title: 'Client details form',
      desc: 'Clients fill names, date, venue, photos & package with a live preview, then send it to you on WhatsApp.',
      link: orderLink(settings),
      msg: `🙏 Please fill your invitation details here (takes 5 minutes, you can preview it live):\n`,
    },
  ];
  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-wine-900">Share with clients</h2>
          <p className="text-sm text-stone-500">Win new orders and collect details without typing them yourself.</p>
        </div>
        <ImportOrderButton variant="gold" />
      </div>
      {!settings.phone && (
        <p className="mb-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Add your business WhatsApp number in <button className="font-semibold underline" onClick={() => go('/settings')}>Settings</button> so client forms are sent to you.</p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r) => (
          <div key={r.title} className="flex flex-col rounded-2xl border border-stone-200 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{r.icon}</span>
              <div>
                <p className="font-semibold text-stone-800">{r.title}</p>
                <p className="text-xs text-stone-500">{r.desc}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn size="sm" variant="whatsapp" onClick={() => window.open(waLink(r.msg + r.link), '_blank')}><MessageCircle className="h-3.5 w-3.5" /> Send</Btn>
              <Btn size="sm" onClick={async () => { await copyText(r.link); toast('Link copied ✓'); }}><Copy className="h-3.5 w-3.5" /> Copy link</Btn>
              <Btn size="sm" variant="ghost" onClick={() => window.open(r.link, '_blank')}><ExternalLink className="h-3.5 w-3.5" /> Open</Btn>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
