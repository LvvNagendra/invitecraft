import type { EventType, Lang, ThemeId } from '../types';

export interface Theme {
  id: ThemeId;
  name: string;
  bg1: string; // page background (dark end)
  bg2: string; // page background (light end)
  card: string; // card surface
  cardInk: string; // text on card
  gold: string; // primary metallic accent
  gold2: string; // highlight
  accent: string; // secondary (rose / emerald ...)
  ink: string; // text on page background
  envelope: [string, string];
  seal: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  royal: {
    id: 'royal', name: 'Royal Maroon & Gold',
    bg1: '#2a0610', bg2: '#5a0f1f', card: '#fff8ea', cardInk: '#4a1020',
    gold: '#d4a437', gold2: '#f6e27a', accent: '#b3172e', ink: '#fff3d6',
    envelope: ['#7a1426', '#4a0a16'], seal: '#b3172e',
  },
  temple: {
    id: 'temple', name: 'Temple Red & Marigold',
    bg1: '#3a0a00', bg2: '#8a1c06', card: '#fff4dc', cardInk: '#5a1a02',
    gold: '#e0a526', gold2: '#ffd86b', accent: '#e8590c', ink: '#fff0cf',
    envelope: ['#a8240a', '#5e1203'], seal: '#c2410c',
  },
  blush: {
    id: 'blush', name: 'Ivory Blush Rose',
    bg1: '#5c2a3a', bg2: '#c98a9b', card: '#fffaf6', cardInk: '#5c2a3a',
    gold: '#c9a063', gold2: '#f3dcae', accent: '#d26a86', ink: '#fff6f2',
    envelope: ['#f2d4d9', '#d9a6b3'], seal: '#b4485f',
  },
  emerald: {
    id: 'emerald', name: 'Emerald Mughal',
    bg1: '#021f17', bg2: '#0b4a37', card: '#fbf7ec', cardInk: '#0b3b2c',
    gold: '#cfa646', gold2: '#f1dc95', accent: '#14805e', ink: '#f4ecd2',
    envelope: ['#0e5a43', '#063426'], seal: '#9b1c2e',
  },
  midnight: {
    id: 'midnight', name: 'Midnight Navy & Gold',
    bg1: '#050a1f', bg2: '#16224f', card: '#fbf8f1', cardInk: '#16224f',
    gold: '#d6b25e', gold2: '#f5e3a8', accent: '#5d74d6', ink: '#f1ecdc',
    envelope: ['#1c2a63', '#0b1333'], seal: '#a8323e',
  },
  peacock: {
    id: 'peacock', name: 'Peacock Teal',
    bg1: '#031b24', bg2: '#0b5160', card: '#f8fbf7', cardInk: '#08404c',
    gold: '#d1a94c', gold2: '#f3dd98', accent: '#7b3fa0', ink: '#eef7f3',
    envelope: ['#0d6a7a', '#06323b'], seal: '#6d2f91',
  },
};

export type ParticleKind =
  | 'petal' | 'sparkle' | 'heart' | 'confetti' | 'balloon' | 'marigold' | 'diya' | 'star' | 'bubble';

export interface EventConfig {
  type: EventType;
  label: string;
  emoji: string;
  twoHosts: boolean;
  hostALabel: string;
  hostBLabel?: string;
  ageLabel?: string;
  particles: ParticleKind[];
  burst: ParticleKind[];
  defaultTheme: ThemeId;
  defaultTimeLabel: string;
  welcomeLine: Record<Lang, string>;
  tagline: Record<Lang, string>;
  countdownTail: Record<Lang, string>;
  title: Record<Lang, string>;
  scheduleIdeas: string[];
}

export const EVENTS: Record<EventType, EventConfig> = {
  wedding: {
    type: 'wedding', label: 'Wedding', emoji: '💍', twoHosts: true,
    hostALabel: 'Bride', hostBLabel: 'Groom',
    particles: ['petal', 'sparkle'], burst: ['sparkle', 'petal', 'heart'],
    defaultTheme: 'royal', defaultTimeLabel: 'Muhurtham',
    welcomeLine: { en: 'Two hearts, one beautiful journey…', te: 'రెండు హృదయాలు, ఒక అందమైన ప్రయాణం…', hi: 'दो दिल, एक खूबसूरत सफ़र…' },
    tagline: { en: 'Together Forever', te: 'కలకాలం కలిసి', hi: 'सदा के लिए साथ' },
    countdownTail: { en: 'Until Forever ❤️', te: 'శుభ ఘడియకు ❤️', hi: 'शुभ घड़ी तक ❤️' },
    title: { en: 'Wedding Invitation', te: 'వివాహ ఆహ్వానం', hi: 'विवाह निमंत्रण' },
    scheduleIdeas: ['Haldi', 'Mehendi', 'Sangeet', 'Pellikoduku / Pellikuthuru', 'Wedding', 'Reception', 'Vratham'],
  },
  engagement: {
    type: 'engagement', label: 'Engagement', emoji: '💞', twoHosts: true,
    hostALabel: 'Bride-to-be', hostBLabel: 'Groom-to-be',
    particles: ['heart', 'petal'], burst: ['heart', 'sparkle'],
    defaultTheme: 'blush', defaultTimeLabel: 'Time',
    welcomeLine: { en: 'A promise, a ring, a forever…', te: 'ఒక వాగ్దానం, ఒక ఉంగరం, ఒక జీవితం…', hi: 'एक वादा, एक अंगूठी, एक ज़िंदगी…' },
    tagline: { en: 'Are Getting Engaged', te: 'నిశ్చితార్థం', hi: 'सगाई' },
    countdownTail: { en: 'Until we say yes 💍', te: 'నిశ్చితార్థానికి 💍', hi: 'सगाई तक 💍' },
    title: { en: 'Engagement Ceremony', te: 'నిశ్చితార్థ వేడుక', hi: 'सगाई समारोह' },
    scheduleIdeas: ['Ring Ceremony', 'Lunch', 'Dinner', 'Cocktail Evening'],
  },
  birthday: {
    type: 'birthday', label: 'Birthday', emoji: '🎂', twoHosts: false,
    hostALabel: 'Birthday Star', ageLabel: 'Turning (age)',
    particles: ['balloon', 'confetti'], burst: ['confetti', 'star'],
    defaultTheme: 'midnight', defaultTimeLabel: 'Time',
    welcomeLine: { en: 'Let’s celebrate a very special day…', te: 'ఒక ప్రత్యేకమైన రోజును కలిసి జరుపుకుందాం…', hi: 'आइए एक ख़ास दिन मनाएं…' },
    tagline: { en: 'Birthday Celebration', te: 'పుట్టినరోజు వేడుక', hi: 'जन्मदिन समारोह' },
    countdownTail: { en: 'Until the party 🎉', te: 'వేడుకకు 🎉', hi: 'पार्टी तक 🎉' },
    title: { en: 'Birthday Party', te: 'పుట్టినరోజు వేడుక', hi: 'जन्मदिन पार्टी' },
    scheduleIdeas: ['Cake Cutting', 'Games', 'Dinner', 'Return Gifts'],
  },
  housewarming: {
    type: 'housewarming', label: 'Housewarming', emoji: '🏡', twoHosts: false,
    hostALabel: 'Family / Host',
    particles: ['marigold', 'diya'], burst: ['marigold', 'sparkle'],
    defaultTheme: 'temple', defaultTimeLabel: 'Muhurtham',
    welcomeLine: { en: 'A new home, filled with new blessings…', te: 'కొత్త ఇల్లు, కొత్త ఆశీస్సులు…', hi: 'नया घर, नए आशीर्वाद…' },
    tagline: { en: 'Gruhapravesam', te: 'గృహప్రవేశం', hi: 'गृह प्रवेश' },
    countdownTail: { en: 'Until we welcome you home 🪔', te: 'గృహప్రవేశానికి 🪔', hi: 'गृह प्रवेश तक 🪔' },
    title: { en: 'Housewarming Ceremony', te: 'గృహప్రవేశ మహోత్సవం', hi: 'गृह प्रवेश समारोह' },
    scheduleIdeas: ['Ganapathi Pooja', 'Gruhapravesam', 'Satyanarayana Vratham', 'Lunch'],
  },
  anniversary: {
    type: 'anniversary', label: 'Anniversary', emoji: '🌹', twoHosts: true,
    hostALabel: 'Wife', hostBLabel: 'Husband', ageLabel: 'Years together',
    particles: ['petal', 'heart'], burst: ['heart', 'sparkle', 'petal'],
    defaultTheme: 'blush', defaultTimeLabel: 'Time',
    welcomeLine: { en: 'Years of love, a lifetime of memories…', te: 'ఎన్నో ఏళ్ల ప్రేమ, జీవితకాల జ్ఞాపకాలు…', hi: 'बरसों का प्यार, ज़िंदगी भर की यादें…' },
    tagline: { en: 'Wedding Anniversary', te: 'వివాహ వార్షికోత్సవం', hi: 'विवाह वर्षगांठ' },
    countdownTail: { en: 'Until we celebrate love ❤️', te: 'వేడుకకు ❤️', hi: 'जश्न तक ❤️' },
    title: { en: 'Anniversary Celebration', te: 'వార్షికోత్సవ వేడుక', hi: 'वर्षगांठ समारोह' },
    scheduleIdeas: ['Cake Cutting', 'Vow Renewal', 'Dinner'],
  },
  naming: {
    type: 'naming', label: 'Naming Ceremony', emoji: '👶', twoHosts: false,
    hostALabel: 'Baby',
    particles: ['star', 'bubble'], burst: ['star', 'sparkle'],
    defaultTheme: 'peacock', defaultTimeLabel: 'Muhurtham',
    welcomeLine: { en: 'A little star has arrived…', te: 'ఒక చిన్నారి తార మా ఇంట వెలిసింది…', hi: 'एक नन्हा सितारा आया है…' },
    tagline: { en: 'Naming Ceremony', te: 'నామకరణ మహోత్సవం', hi: 'नामकरण संस्कार' },
    countdownTail: { en: 'Until the little one’s big day ⭐', te: 'నామకరణానికి ⭐', hi: 'नामकरण तक ⭐' },
    title: { en: 'Naming Ceremony', te: 'నామకరణ మహోత్సవం', hi: 'नामकरण संस्कार' },
    scheduleIdeas: ['Pooja', 'Naming (Barasala)', 'Cradle Ceremony', 'Lunch'],
  },
};

/** Guest-facing UI labels. */
export const T: Record<Lang, Record<string, string>> = {
  en: {
    awaits: 'A Special Invitation Awaits You', tap: 'Tap to Open', dear: 'Dear', skip: 'Skip',
    continue: 'Continue', ourDay: 'Our Special Day', days: 'Days', hours: 'Hours', mins: 'Minutes', secs: 'Seconds',
    arrived: 'The day has arrived! 🎉', passed: 'Thank you for celebrating with us', schedule: 'Event Schedule', venue: 'Venue',
    location: 'View Location', save: 'Save the Date', wishes: 'Send Wishes', rsvp: 'Will you attend?',
    yes: 'Joyfully Attending', no: 'Sorry, Can’t Make It', guests: 'Number of guests', yourName: 'Your name',
    note: 'A note for the family (optional)', sendRsvp: 'Send RSVP on WhatsApp', thanks: 'Thank You',
    thanksMsg: 'Your presence and blessings mean the world to us.', gallery: 'Moments', family: 'With Blessings Of',
    withLove: 'With love', dress: 'Dress Code', rsvpBy: 'Kindly respond by', parents: 'Parents',
    invite: 'warmly invites you', celebrate: 'Celebrate With Us', music: 'Music', replay: 'Replay Experience',
  },
  te: {
    awaits: 'మీ కోసం ఒక ప్రత్యేక ఆహ్వానం', tap: 'తెరవడానికి నొక్కండి', dear: 'ప్రియమైన', skip: 'దాటవేయండి',
    continue: 'కొనసాగించండి', ourDay: 'మా శుభదినం', days: 'రోజులు', hours: 'గంటలు', mins: 'నిమిషాలు', secs: 'సెకన్లు',
    arrived: 'శుభ ఘడియ వచ్చేసింది! 🎉', passed: 'మాతో వేడుక జరుపుకున్నందుకు ధన్యవాదాలు', schedule: 'కార్యక్రమాలు', venue: 'వేదిక',
    location: 'వేదిక చూడండి', save: 'తేదీ గుర్తుంచుకోండి', wishes: 'శుభాకాంక్షలు పంపండి', rsvp: 'మీరు హాజరవుతారా?',
    yes: 'తప్పకుండా వస్తాను', no: 'రాలేకపోతున్నాను', guests: 'అతిథుల సంఖ్య', yourName: 'మీ పేరు',
    note: 'కుటుంబానికి సందేశం (ఐచ్ఛికం)', sendRsvp: 'WhatsApp లో తెలియజేయండి', thanks: 'ధన్యవాదాలు',
    thanksMsg: 'మీ రాక, మీ ఆశీస్సులే మాకు అమూల్యం.', gallery: 'జ్ఞాపకాలు', family: 'ఆశీస్సులతో',
    withLove: 'ప్రేమతో', dress: 'వస్త్రధారణ', rsvpBy: 'దయచేసి తెలియజేయండి', parents: 'తల్లిదండ్రులు',
    invite: 'సాదరంగా ఆహ్వానిస్తున్నారు', celebrate: 'మాతో కలిసి జరుపుకోండి', music: 'సంగీతం', replay: 'మళ్ళీ చూడండి',
  },
  hi: {
    awaits: 'आपके लिए एक विशेष निमंत्रण', tap: 'खोलने के लिए टैप करें', dear: 'प्रिय', skip: 'छोड़ें',
    continue: 'आगे बढ़ें', ourDay: 'हमारा शुभ दिन', days: 'दिन', hours: 'घंटे', mins: 'मिनट', secs: 'सेकंड',
    arrived: 'शुभ दिन आ गया! 🎉', passed: 'हमारे साथ जश्न मनाने के लिए धन्यवाद', schedule: 'कार्यक्रम', venue: 'स्थान',
    location: 'स्थान देखें', save: 'तारीख सेव करें', wishes: 'शुभकामनाएं भेजें', rsvp: 'क्या आप आएंगे?',
    yes: 'ज़रूर आएंगे', no: 'माफ़ कीजिए, नहीं आ पाएंगे', guests: 'मेहमानों की संख्या', yourName: 'आपका नाम',
    note: 'परिवार के लिए संदेश (वैकल्पिक)', sendRsvp: 'WhatsApp पर भेजें', thanks: 'धन्यवाद',
    thanksMsg: 'आपकी उपस्थिति और आशीर्वाद हमारे लिए अनमोल है।', gallery: 'यादें', family: 'आशीर्वाद सहित',
    withLove: 'सप्रेम', dress: 'ड्रेस कोड', rsvpBy: 'कृपया सूचित करें', parents: 'माता-पिता',
    invite: 'सादर आमंत्रित करते हैं', celebrate: 'हमारे साथ जश्न मनाएं', music: 'संगीत', replay: 'फिर से देखें',
  },
};

export const LANG_FONT: Record<Lang, string> = {
  en: "'Cormorant Garamond', serif",
  te: "'Noto Serif Telugu', 'Cormorant Garamond', serif",
  hi: "'Tiro Devanagari Hindi', 'Cormorant Garamond', serif",
};
