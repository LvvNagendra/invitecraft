import { useEffect, useMemo, useState } from 'react';
import type { PublicInvitation } from './types';
import { fetchPublished } from './lib/hosting';
import { useHash } from './lib/router';
import { decodeInvite, inviteLink } from './lib/util';
import { getState, loadStore, useStore } from './lib/store';
import { toPublic } from './lib/util';
import { Experience } from './guest/Experience';
import { AdminApp } from './admin/AdminApp';
import { readProfile } from './lib/business';
import { DemoView, Showcase } from './client/Showcase';
import { OrderForm } from './client/OrderForm';

export default function App() {
  const hash = useHash();
  const page = hash.split('?')[0].split('/').slice(0, 2).join('/');
  useEffect(() => { window.scrollTo(0, 0); }, [page]); // pages share one document — start each at the top

  if (hash.startsWith('/i/')) return <GuestPage hash={hash} />;
  if (hash.startsWith('/v/')) return <ShortPage hash={hash} />;
  if (hash.startsWith('/preview/')) return <PreviewPage id={hash.split('/')[2]} />;
  const [route, query = ''] = hash.split('?');
  if (route === '/showcase') return <Showcase profile={readProfile(query)} />;
  if (route === '/order') return <OrderForm profile={readProfile(query)} />;
  if (route.startsWith('/demo/')) return <DemoView demoKey={route.split('/')[2]} profile={readProfile(query)} />;
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

/** Short link: #/v/<id>?to=Guest — the invitation is loaded from the repository, so the link can never be cut off. */
function ShortPage({ hash }: { hash: string }) {
  const [path, query] = hash.slice(3).split('?');
  const params = new URLSearchParams(query || '');
  const guest = params.get('to') || undefined;
  const [state, setState] = useState<{ inv?: PublicInvitation; error?: 'missing' | 'network' }>({});
  useEffect(() => {
    fetchPublished(path, params.get('r') || undefined)
      .then((inv) => {
        setState({ inv });
        document.title = `💌 ${inv.hostA.name}${inv.hostB?.name ? ' & ' + inv.hostB.name : ''} — Invitation`;
      })
      .catch((e) => setState({ error: e?.message === 'not found' || e?.message === 'bad link' ? 'missing' : 'network' }));
  }, [path]);
  if (state.error) return <NotFound missing={state.error === 'missing'} />;
  if (!state.inv) return <Loading />;
  return <Experience data={state.inv} guest={guest} link={location.href} />;
}

function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#2a0610] text-[#f6e27a]">
      <div className="h-14 w-14 animate-spin rounded-full border-2 border-[#f6e27a]/20 border-t-[#f6e27a]" />
      <p className="mt-5 font-serif text-lg italic text-[#fff3d6]/80">Preparing your invitation…</p>
    </div>
  );
}

function NotFound({ missing }: { missing?: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#2a0610] p-8 text-center text-[#fff3d6]">
      <p className="font-script text-5xl text-[#f6e27a]">{missing ? 'Coming soon!' : 'Oops!'}</p>
      <p className="mt-4 max-w-xs font-serif text-lg">
        {missing
          ? 'This invitation link isn’t ready yet. Please ask the family to send the link again in a little while.'
          : 'We couldn’t load this invitation. Please check your internet connection and try again.'}
      </p>
      <button type="button" onClick={() => location.reload()} className="mt-6 rounded-full bg-[#f6e27a] px-6 py-2.5 text-sm font-semibold text-[#3b0a14]">Try again</button>
    </div>
  );
}

function PreviewPage({ id }: { id: string }) {
  const ready = useStore((s) => s.ready);
  const inv = useStore((s) => s.invitations.find((i) => i.id === id));
  const settings = useStore((s) => s.settings);
  useEffect(() => { if (!getState().ready) loadStore(); }, []);
  if (!ready) return null;
  if (!inv) return <PrivatePreview />;
  return (
    <div className="flex h-[100dvh] flex-col bg-black">
      <div className="z-50 flex shrink-0 items-center justify-between gap-2 bg-amber-300 px-3 py-2 text-xs text-stone-900">
        <span><b>Private preview</b> — only works on this device. Don’t send this link.</span>
        <a href={`#/share/${inv.id}`} className="shrink-0 rounded-full bg-stone-900 px-3 py-1.5 font-semibold text-white">Get share link</a>
      </div>
      <div className="relative min-h-0 flex-1" style={{ transform: 'translateZ(0)' }}>
        <Experience data={toPublic(inv, settings)} embedded link={inviteLink(inv, settings)} />
      </div>
    </div>
  );
}

/** A #/preview link opened on another device: the invitation only exists in the designer's browser. */
function PrivatePreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#2a0610] p-8 text-center text-[#fff3d6]">
      <p className="font-script text-5xl text-[#f6e27a]">Almost there!</p>
      <p className="mt-4 max-w-xs font-serif text-lg">This is a private preview link — it only opens on the designer’s own device.</p>
      <p className="mt-3 max-w-xs font-serif text-base opacity-80">Please ask the family for the invitation link from the <b>Share</b> page (it looks like …/invitecraft/#/v/…).</p>
    </div>
  );
}

function Broken() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#2a0610] p-8 text-center text-[#fff3d6]">
      <p className="font-script text-5xl text-[#f6e27a]">Oops!</p>
      <p className="mt-4 max-w-xs font-serif text-lg">This invitation link was cut off while it was being shared.</p>
      <p className="mt-3 max-w-xs font-serif text-base opacity-80">Please ask the family to send the link again — or tap the full link in their WhatsApp message (open “Read more” first).</p>
    </div>
  );
}
