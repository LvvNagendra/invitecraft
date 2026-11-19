import type { EventType, Invitation, Lang, PublicInvitation } from '../types';
import { EVENTS } from './themes';
import { displayNames, fmtDate, fmtTime } from './util';

/* ---------------- WhatsApp share message ---------------- */

const OPENERS: Record<EventType, string> = {
  wedding: '💐 With immense joy and happiness, we invite you! 💐\n\n❤️ A beautiful new journey begins...',
  engagement: '💞 With hearts full of joy, we invite you! 💞\n\n💍 Two families, one beautiful promise...',
  birthday: '🎉 You are invited to a celebration! 🎉\n\n🎂 Let’s make this birthday unforgettable...',
  housewarming: '🪔 Shubh Gruhapravesam! 🪔\n\n🏡 With the blessings of the Almighty, we step into our new home...',
  anniversary: '🌹 Celebrating years of love! 🌹\n\n❤️ A journey of togetherness continues...',
  naming: '⭐ A little star has arrived! ⭐\n\n👶 Join us as we give our bundle of joy a beautiful name...',
};

export function whatsappMessage(inv: Invitation | PublicInvitation, link: string, guestName?: string) {
  const ev = EVENTS[inv.type];
  const lines: string[] = [];
  if (guestName) lines.push(`🙏 Dear ${guestName},\n`);
  lines.push(OPENERS[inv.type]);
  lines.push('');
  if (ev.twoHosts) {
    lines.push(`${inv.type === 'anniversary' ? '👩' : '👰'} ${ev.hostALabel}: ${inv.hostA.name}`);
    if (inv.hostB?.name) lines.push(`${inv.type === 'anniversary' ? '👨' : '🤵'} ${ev.hostBLabel}: ${inv.hostB.name}`);
  } else {
    lines.push(`${ev.emoji} ${ev.hostALabel}: ${inv.hostA.name}${inv.age ? ` (${inv.age})` : ''}`);
  }
  lines.push('');
  lines.push(
    inv.type === 'birthday'
      ? 'We would love to have you with us to make the day extra special.'
      : 'Our families would be delighted to have your presence and blessings on our special day.',
  );
  lines.push('');
  lines.push(`📅 Date: ${fmtDate(inv.date, 'en', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  if (inv.time) lines.push(`⏰ ${inv.timeLabel || 'Time'}: ${fmtTime(inv.time)}`);
  if (inv.venueName) lines.push(`📍 Venue: ${inv.venueName}`);
  lines.push('');
  lines.push('✨ We have a special invitation for you!');
  lines.push('');
  lines.push('🎁 OPEN YOUR INVITATION HERE:');
  lines.push(link);
  lines.push('');
  lines.push('Your presence will make our celebration even more memorable.');
  lines.push('');
  lines.push(`${inv.invitedBy || `With love,\n${displayNames(inv)}'s Family`} ❤️`);
  return lines.join('\n');
}

/* ---------------- Message Studio ---------------- */

export type Tone = 'traditional' | 'modern' | 'short' | 'poetic';
export const TONES: { id: Tone; label: string }[] = [
  { id: 'traditional', label: 'Traditional' },
  { id: 'modern', label: 'Modern' },
  { id: 'short', label: 'Short & Sweet' },
  { id: 'poetic', label: 'Poetic' },
];

type Lib = Record<EventType, Partial<Record<Tone, string>>>;

const EN: Lib = {
  wedding: {
    traditional: 'With the divine blessings of the Almighty and our elders, we cordially invite you and your family to grace the auspicious occasion of the marriage of our beloved children. Your gracious presence and heartfelt blessings will make this day complete.',
    modern: 'Two hearts. One love. A lifetime together. We would love for you to join us as we begin our forever — come celebrate, laugh, dance and bless the newlyweds!',
    short: 'We’re getting married! Join us to celebrate and bless our new beginning.',
    poetic: 'Like the river meets the sea, two souls are coming home to each other. On this sacred day, under the canopy of love and tradition, we would be honoured to have you witness our union.',
  },
  engagement: {
    traditional: 'With the blessings of our families, we are delighted to invite you to the engagement ceremony of our beloved children. Kindly grace the occasion with your presence and blessings.',
    modern: 'She said yes! 💍 Come celebrate the start of our forever with an evening of love, laughter and good food.',
    short: 'We’re engaged! Join us to celebrate the promise of forever.',
    poetic: 'A ring, a promise, a beginning — join us as two hearts exchange a vow of forever.',
  },
  birthday: {
    traditional: 'We joyfully invite you and your family to the birthday celebration of our dear one. Please join us and shower your love and blessings.',
    modern: 'Cake, laughter, games and lots of love — come celebrate a very special birthday with us!',
    short: 'It’s a birthday party! Come celebrate with us.',
    poetic: 'Another year of smiles, another chapter of joy — help us light the candles and make a wish.',
  },
  housewarming: {
    traditional: 'By the grace of God, we are entering our new home. We cordially invite you and your family to the Gruhapravesam ceremony and seek your blessings.',
    modern: 'New home, new memories! Join us as we open the doors to our happy place.',
    short: 'We have a new home! Come bless it with us.',
    poetic: 'Walls make a house, but love makes a home. Come fill ours with your blessings and warmth.',
  },
  anniversary: {
    traditional: 'With gratitude to God and our elders, we invite you to celebrate our wedding anniversary. Your presence and blessings are our greatest gift.',
    modern: 'Still choosing each other, every single day. Join us to celebrate our anniversary!',
    short: 'Celebrating our anniversary — join us!',
    poetic: 'Through every season, hand in hand — come celebrate the story that love wrote for us.',
  },
  naming: {
    traditional: 'With the blessings of the Almighty, we invite you and your family to the naming ceremony of our little one. Kindly bless our baby with your presence.',
    modern: 'Our little bundle of joy is getting a name! Join us for the big reveal and a celebration of love.',
    short: 'Join us for our baby’s naming ceremony!',
    poetic: 'A tiny heart, a world of joy — come bless our little star as they receive their name.',
  },
};

const TE: Partial<Lib> = {
  wedding: {
    traditional: 'మా ఇంట జరుగు వివాహ మహోత్సవమునకు మీరు సకుటుంబ సపరివార సమేతంగా విచ్చేసి, నూతన వధూవరులను ఆశీర్వదించవలసిందిగా సాదరంగా ఆహ్వానిస్తున్నాము.',
    modern: 'రెండు హృదయాలు ఒక్కటయ్యే ఈ శుభ సమయంలో మీరు మాతో ఉండాలని కోరుకుంటున్నాము. తప్పక విచ్చేసి మమ్మల్ని ఆశీర్వదించండి.',
    short: 'మా పెళ్లికి తప్పకుండా రండి, ఆశీర్వదించండి.',
  },
  engagement: { traditional: 'మా ఇంట జరిగే నిశ్చితార్థ వేడుకకు మీరు సకుటుంబంగా విచ్చేసి ఆశీర్వదించవలసిందిగా ఆహ్వానిస్తున్నాము.' },
  birthday: { traditional: 'మా చిన్నారి పుట్టినరోజు వేడుకకు మీరు విచ్చేసి, మీ ఆశీస్సులు అందించవలసిందిగా కోరుతున్నాము.' },
  housewarming: { traditional: 'భగవంతుని కృపతో మా నూతన గృహప్రవేశ మహోత్సవానికి మీరు సకుటుంబ సమేతంగా విచ్చేసి మమ్మల్ని ఆశీర్వదించవలసిందిగా ఆహ్వానిస్తున్నాము.' },
  anniversary: { traditional: 'మా వివాహ వార్షికోత్సవ వేడుకకు మీరు విచ్చేసి మీ ఆశీస్సులు అందించవలసిందిగా కోరుతున్నాము.' },
  naming: { traditional: 'మా చిన్నారి నామకరణ మహోత్సవానికి మీరు సకుటుంబంగా విచ్చేసి ఆశీర్వదించవలసిందిగా ఆహ్వానిస్తున్నాము.' },
};

const HI: Partial<Lib> = {
  wedding: {
    traditional: 'हमारे परिवार में होने वाले शुभ विवाह समारोह में आप सपरिवार सादर आमंत्रित हैं। कृपया पधारकर नवदंपति को अपना आशीर्वाद प्रदान करें।',
    short: 'हमारी शादी में ज़रूर आइए और आशीर्वाद दीजिए।',
  },
  engagement: { traditional: 'हमारे बच्चों की सगाई के शुभ अवसर पर आप सपरिवार सादर आमंत्रित हैं।' },
  birthday: { traditional: 'हमारे प्रिय के जन्मदिन समारोह में आप सपरिवार सादर आमंत्रित हैं।' },
  housewarming: { traditional: 'ईश्वर की कृपा से हम अपने नए घर में प्रवेश कर रहे हैं। गृह प्रवेश के शुभ अवसर पर आप सपरिवार सादर आमंत्रित हैं।' },
  anniversary: { traditional: 'हमारी विवाह वर्षगांठ के अवसर पर आप सादर आमंत्रित हैं।' },
  naming: { traditional: 'हमारे नन्हे के नामकरण संस्कार में आप सपरिवार सादर आमंत्रित हैं।' },
};

export function studioMessages(type: EventType, lang: Lang): { tone: string; text: string }[] {
  const lib = lang === 'te' ? TE : lang === 'hi' ? HI : EN;
  const set = lib[type] || {};
  return TONES.filter((t) => set[t.id]).map((t) => ({ tone: t.label, text: set[t.id]! }));
}

export const BLESSINGS: Record<Lang, string[]> = {
  en: ['|| Sri Ganeshaya Namaha ||', '|| Shubh Vivah ||', '|| Om Namah Shivaya ||', '|| Sri Venkateswara Prasanna ||', '|| Sri Rama Jayam ||'],
  te: ['|| శ్రీ గణేశాయ నమః ||', '|| శ్రీ వేంకటేశ్వర ప్రసన్న ||', '|| శ్రీ రామ జయం ||', '|| శుభమస్తు ||', '|| ఓం నమః శివాయ ||'],
  hi: ['|| श्री गणेशाय नमः ||', '|| शुभ विवाह ||', '|| ॐ नमः शिवाय ||', '|| शुभमस्तु ||'],
};

export function greetingFor(name: string) {
  return `Dear ${name}, we warmly invite you to bless us on our special day.`;
}
