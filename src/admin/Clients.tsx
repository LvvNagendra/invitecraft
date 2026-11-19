import { Mail, MapPin, Pencil, Phone, Plus, Search, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import type { Client } from '../types';
import { deleteClient, saveClient, useStore } from '../lib/store';
import { go } from '../lib/router';
import { EVENTS } from '../lib/themes';
import { displayNames, uid, waLink } from '../lib/util';
import { Btn, Card, Field, Modal, PageHeader, toast } from './ui';

export function Clients() {
  const clients = useStore((s) => s.clients);
  const invitations = useStore((s) => s.invitations);
  const [edit, setEdit] = useState<Client | null>(null);
  const [q, setQ] = useState('');
  const list = clients.filter((c) => `${c.name} ${c.phone} ${c.city}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader title="Clients" sub={`${clients.length} families you work with`} actions={<Btn variant="primary" onClick={() => setEdit({ id: uid(), name: '', createdAt: Date.now() })}><Plus className="h-4 w-4" /> Add client</Btn>} />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input className="input !pl-9" placeholder="Search by name, phone or city" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length === 0 ? (
        <Card className="p-12 text-center text-stone-400"><UserRound className="mx-auto mb-2 h-10 w-10" />No clients yet</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const invs = invitations.filter((i) => i.clientId === c.id);
            const due = invs.reduce((n, i) => n + (!i.paid ? i.price || 0 : 0), 0);
            return (
              <Card key={c.id} className="p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wine-800 font-display text-lg text-[#f6e27a]">{c.name.charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-stone-800">{c.name}</p>
                    <div className="mt-1 space-y-0.5 text-xs text-stone-500">
                      {c.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</p>}
                      {c.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {c.email}</p>}
                      {c.city && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {c.city}</p>}
                    </div>
                  </div>
                  <button type="button" onClick={() => setEdit(c)} className="rounded-lg p-1.5 hover:bg-stone-100" aria-label="Edit"><Pencil className="h-4 w-4 text-stone-500" /></button>
                </div>
                {invs.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {invs.map((i) => (
                      <button key={i.id} type="button" onClick={() => go(`/share/${i.id}`)} className="flex w-full items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-left text-xs hover:bg-brand-50">
                        <span>{EVENTS[i.type].emoji} {displayNames(i)}</span><span className="text-stone-400">{i.code}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                  <span className={due ? 'text-xs font-semibold text-amber-600' : 'text-xs text-stone-400'}>{due ? `₹${due.toLocaleString('en-IN')} due` : `${invs.length} invitation(s)`}</span>
                  <div className="flex gap-1">
                    {c.phone && <Btn size="sm" variant="whatsapp" onClick={() => window.open(waLink(`Hello ${c.name}, `, c.phone), '_blank')}>WhatsApp</Btn>}
                    <Btn size="sm" onClick={() => go('/create')}><Plus className="h-3.5 w-3.5" /></Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={clients.some((c) => c.id === edit?.id) ? 'Edit client' : 'New client'}>
        {edit && (
          <div className="space-y-3">
            <Field label="Name"><input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} autoFocus /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone"><input className="input" value={edit.phone || ''} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
              <Field label="City"><input className="input" value={edit.city || ''} onChange={(e) => setEdit({ ...edit, city: e.target.value })} /></Field>
            </div>
            <Field label="Email"><input className="input" value={edit.email || ''} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
            <Field label="Notes"><textarea className="input" rows={3} value={edit.notes || ''} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></Field>
            <div className="flex justify-between pt-2">
              {clients.some((c) => c.id === edit.id) ? (
                <Btn variant="danger" onClick={async () => { if (confirm(`Delete ${edit.name}? Their invitations are kept.`)) { await deleteClient(edit.id); setEdit(null); } }}><Trash2 className="h-4 w-4" /> Delete</Btn>
              ) : <span />}
              <Btn variant="primary" onClick={async () => { if (!edit.name.trim()) return toast('Name is required'); await saveClient(edit); setEdit(null); toast('Client saved ✓'); }}>Save client</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
