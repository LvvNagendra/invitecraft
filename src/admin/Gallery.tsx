import { Copy, Eye, Pencil, Plus, Search, Share2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { EventType } from '../types';
import { deleteInvitation, duplicateInvitation, useStore } from '../lib/store';
import { go } from '../lib/router';
import { EVENTS } from '../lib/themes';
import { displayNames, fmtDate } from '../lib/util';
import { Btn, Card, cx, PageHeader, toast } from './ui';
import { InviteThumb } from './Thumb';
import { StatusBadge } from './Dashboard';

export function Gallery() {
  const invitations = useStore((s) => s.invitations);
  const clients = useStore((s) => s.clients);
  const [q, setQ] = useState('');
  const [type, setType] = useState<EventType | 'all'>('all');
  const list = invitations.filter((i) => (type === 'all' || i.type === type) && `${displayNames(i)} ${i.code} ${i.venueName}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader title="Invitation Gallery" sub={`${invitations.length} invitations created`} actions={<Btn variant="primary" onClick={() => go('/create')}><Plus className="h-4 w-4" /> New</Btn>} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input className="input !pl-9" placeholder="Search names, code or venue" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {(['all', ...Object.keys(EVENTS)] as (EventType | 'all')[]).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} className={cx('shrink-0 rounded-full px-3 py-2 text-xs font-medium', type === t ? 'bg-wine-800 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200')}>
              {t === 'all' ? 'All' : `${EVENTS[t].emoji} ${EVENTS[t].label}`}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="p-12 text-center text-stone-400">No invitations match.</Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((i) => (
            <Card key={i.id} className="group overflow-hidden">
              <button type="button" onClick={() => go(`/share/${i.id}`)} className="block w-full">
                <InviteThumb inv={i} className="aspect-[3/4] w-full transition duration-500 group-hover:scale-[1.03]" />
              </button>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{displayNames(i) || 'Untitled'}</p>
                  <StatusBadge status={i.status} />
                </div>
                <p className="text-xs text-stone-500">{i.code} · {fmtDate(i.date, 'en', { day: 'numeric', month: 'short' })}{i.clientId && ` · ${clients.find((c) => c.id === i.clientId)?.name ?? ''}`}</p>
                <div className="mt-3 flex justify-between">
                  <Btn size="sm" variant="ghost" onClick={() => go(`/edit/${i.id}`)} aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></Btn>
                  <Btn size="sm" variant="ghost" onClick={() => go(`/preview/${i.id}`)} aria-label="Preview"><Eye className="h-3.5 w-3.5" /></Btn>
                  <Btn size="sm" variant="ghost" onClick={async () => { await duplicateInvitation(i.id); toast('Duplicated ✓'); }} aria-label="Duplicate"><Copy className="h-3.5 w-3.5" /></Btn>
                  <Btn size="sm" variant="ghost" onClick={() => go(`/share/${i.id}`)} aria-label="Share"><Share2 className="h-3.5 w-3.5" /></Btn>
                  <Btn size="sm" variant="ghost" onClick={() => { if (confirm(`Delete ${i.code} (${displayNames(i)})? This cannot be undone.`)) deleteInvitation(i.id); }} aria-label="Delete"><Trash2 className="h-3.5 w-3.5 text-red-400" /></Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
