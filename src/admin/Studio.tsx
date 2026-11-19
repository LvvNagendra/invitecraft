import { Copy, MessageCircle, Wand2 } from 'lucide-react';
import { useState } from 'react';
import type { EventType, Lang } from '../types';
import { EVENTS } from '../lib/themes';
import { BLESSINGS, studioMessages } from '../lib/messages';
import { copyText, waLink } from '../lib/util';
import { Btn, Card, cx, PageHeader, toast } from './ui';

const LANGS: [Lang, string][] = [['en', 'English'], ['te', 'తెలుగు'], ['hi', 'हिन्दी']];

export function Studio() {
  const [type, setType] = useState<EventType>('wedding');
  const [lang, setLang] = useState<Lang>('en');
  const msgs = studioMessages(type, lang);
  return (
    <div>
      <PageHeader title="Message Studio" sub="Ready-made invitation wording for every occasion, tone and language" />
      <Card className="mb-6 space-y-4 p-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {(Object.keys(EVENTS) as EventType[]).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} className={cx('shrink-0 rounded-full px-4 py-2 text-sm', type === t ? 'bg-wine-800 text-white' : 'bg-stone-100 text-stone-700')}>{EVENTS[t].emoji} {EVENTS[t].label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {LANGS.map(([l, n]) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={cx('rounded-xl border px-4 py-1.5 text-sm', lang === l ? 'border-brand-500 bg-brand-50 font-semibold' : 'border-stone-200')}>{n}</button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {msgs.map((m, i) => (
          <Card key={i} className="flex flex-col p-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600"><Wand2 className="h-3.5 w-3.5" /> {m.tone}</p>
            <p className="flex-1 font-serif text-lg leading-relaxed text-stone-800">{m.text}</p>
            <div className="mt-4 flex gap-2">
              <Btn size="sm" onClick={async () => { await copyText(m.text); toast('Copied ✓'); }}><Copy className="h-3.5 w-3.5" /> Copy</Btn>
              <Btn size="sm" variant="whatsapp" onClick={() => window.open(waLink(m.text), '_blank')}><MessageCircle className="h-3.5 w-3.5" /> Send</Btn>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-wine-900">Blessing lines</h2>
      <div className="flex flex-wrap gap-2">
        {BLESSINGS[lang].map((b) => (
          <button key={b} type="button" onClick={async () => { await copyText(b); toast('Copied ✓'); }} className="rounded-full bg-white px-4 py-2 font-serif text-base ring-1 ring-stone-200 hover:ring-brand-400">{b}</button>
        ))}
      </div>
      <p className="mt-6 text-xs text-stone-400">Tip: inside the invitation editor, the Message tab shows these suggestions for the selected occasion — one tap to use.</p>
    </div>
  );
}
