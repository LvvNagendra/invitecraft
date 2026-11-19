import { useEffect, useMemo } from 'react';
import { useHash } from './lib/router';
import { decodeInvite, inviteLink } from './lib/util';
import { getState, loadStore, useStore } from './lib/store';
import { toPublic } from './lib/util';
import { Experience } from './guest/Experience';
import { AdminApp } from './admin/AdminApp';

export default function App() {
  const hash = useHash();

  if (hash.startsWith('/i/')) return <GuestPage hash={hash} />;
  if (hash.startsWith('/preview/')) return <PreviewPage id={hash.split('/')[2]} />;
  return <AdminApp hash={hash} />;
}

function GuestPage({ hash }: { hash: string }) {
  const [data, query] = hash.slice(3).split('?');
  const inv = useMemo(() => decodeInvite(data), [data]);
  const guest = new URLSearchParams(query || '').get('to') || undefined;
  useEffect(() => {
    if (inv) document.title = `💌 ${inv.hostA.name}${inv.hostB?.name ? ' & ' + inv.hostB.name : ''} — Invitation`;
  }, [inv]);
  if (!inv) return <Broken />;
  return <Experience data={inv} guest={guest} link={location.href} />;
}

function PreviewPage({ id }: { id: string }) {
  const ready = useStore((s) => s.ready);
  const inv = useStore((s) => s.invitations.find((i) => i.id === id));
  const settings = useStore((s) => s.settings);
  useEffect(() => { if (!getState().ready) loadStore(); }, []);
  if (!ready) return null;
  if (!inv) return <Broken />;
  return <Experience data={toPublic(inv, settings)} link={inviteLink(inv, settings)} />;
}

function Broken() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#2a0610] p-8 text-center text-[#fff3d6]">
      <p className="font-script text-5xl text-[#f6e27a]">Oops!</p>
      <p className="mt-4 max-w-xs font-serif text-lg">This invitation link looks incomplete. Please ask the family to share the link again.</p>
    </div>
  );
}
