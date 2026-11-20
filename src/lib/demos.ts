import type { Invitation, Package } from '../types';

const NL = String.fromCharCode(10);

export function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const DEFAULT_PACKAGES: Package[] = [
  {
    name: 'Classic',
    price: 999,
    features: ['Surprise envelope opening', 'Premium invitation card', 'Live countdown', 'Google Maps & Save the Date', 'WhatsApp RSVP & wishes', 'Background music'],
  },
  {
    name: 'Premium',
    price: 1999,
    popular: true,
    features: ['Everything in Classic', 'Couple / family photos', 'Photo gallery slideshow', 'Personalised link for every guest', 'HD image + print PDF + QR code', 'Event schedule (Haldi, Sangeet…)'],
  },
  {
    name: 'Royal',
    price: 3499,
    features: ['Everything in Premium', 'Telugu / Hindi invitation', 'Your own song as music', 'Unlimited changes till the event', 'Guest list sending support', 'Priority same-day delivery'],
  },
];

type Demo = { key: string; title: string; blurb: string; cover: string; inv: Partial<Invitation> };

/** Ready-made sample invitations — used by the showcase page and to seed the admin. */
export function demos(): Demo[] {
  return [
    {
      key: 'wedding',
      title: 'Royal Telugu Wedding',
      blurb: 'Maroon & gold · rose petals · gallery',
      cover: 'demo/couple1.jpg',
      inv: {
        type: 'wedding', theme: 'royal', lang: 'en',
        hostA: { name: 'Priya', photo: 'demo/bride.jpg', parents: 'D/o Sri Venkat Rao & Smt. Lakshmi', family: 'Kommineni', grand: 'Granddaughter of Late Sri Ramaiah & Smt. Seethamma', bio: 'The creative soul of the duo — loves Carnatic music, sketching and long drives.' },
        hostB: { name: 'Rahul', photo: 'demo/groom.jpg', parents: 'S/o Sri Suresh Sharma & Smt. Anitha', family: 'Sharma', bio: 'Software engineer, cricket fan and the planner — always with a plan and a backup plan.' },
        blessing: '|| Sri Venkateswara Prasanna ||',
        headline: 'Together with their families',
        message: 'With the divine blessings of the Almighty and our elders, we cordially invite you and your family to grace the auspicious occasion of the marriage of our beloved children. Your gracious presence and heartfelt blessings will make this day complete.',
        invitedBy: "With love,\nRahul & Priya's Family",
        date: plusDays(26), time: '10:30', timeLabel: 'Muhurtham',
        venueName: 'Sri Convention Hall', venueAddress: 'Road No. 10, Banjara Hills, Hyderabad',
        hostPhone: '9876543210', dressCode: 'Traditional Indian attire', hashtag: '#PriyaWedsRahul',
        gallery: ['demo/couple1.jpg', 'demo/couple2.jpg', 'demo/couple3.jpg'],
        events: [
          { id: 'e1', title: 'Haldi & Mehendi', date: plusDays(24), time: '16:00', venue: 'Bride’s Residence, Jubilee Hills', note: 'An afternoon of turmeric, henna and laughter', dress: 'Yellow & green' },
          { id: 'e2', title: 'Sangeet Night', date: plusDays(25), time: '19:00', endTime: '23:00', venue: 'Sri Convention Hall, Banjara Hills', note: 'A spirited night of song, dance and dhol', dress: 'Indo-western' },
          { id: 'e3', title: 'Wedding (Muhurtham)', date: plusDays(26), time: '10:30', venue: 'Sri Convention Hall, Banjara Hills', note: 'The sacred seven vows under the floral mandap', dress: 'Traditional' },
          { id: 'e4', title: 'Reception', date: plusDays(26), time: '19:30', venue: 'Sri Convention Hall, Banjara Hills', note: 'Dinner, music and blessings for the newlyweds' },
        ],
        story: [
          { id: 's1', emoji: '💌', title: 'Where it all began', when: '2019', text: 'A college fest, one shared umbrella and a conversation that never ended.' },
          { id: 's2', emoji: '☕', title: 'Best friends first', when: '2020', text: 'Endless chai, late-night calls and dreams shared across two cities.' },
          { id: 's3', emoji: '💍', title: 'The proposal', when: '2025', text: 'On the steps of Golconda at sunset, he asked — and she said yes!' },
          { id: 's4', emoji: '🌸', title: 'Our forever', text: 'With our families’ blessings, we now begin our forever.' },
        ],
        families: [
          { id: 'f1', title: 'Bride’s Family', members: ['Sri Venkat Rao Kommineni', 'Smt. Lakshmi Kommineni'].join(NL) },
          { id: 'f2', title: 'Groom’s Family', members: ['Sri Suresh Sharma', 'Smt. Anitha Sharma'].join(NL) },
        ],
        wishes: [
          { id: 'w1', name: 'Uncle Ramesh', text: 'Wishing you both a lifetime of love, laughter and togetherness. God bless!' },
          { id: 'w2', name: 'Kavya (best friend)', text: 'From college friends to forever — so happy for you two! ❤️' },
        ],
        scratchReveal: true,
        rsvpEnabled: true, rsvpBy: plusDays(18), effects: true, music: 'melody',
      },
    },
    {
      key: 'birthday',
      title: 'First Birthday Bash',
      blurb: 'Midnight & gold · balloons · confetti',
      cover: 'demo/baby.jpg',
      inv: {
        type: 'birthday', theme: 'midnight', lang: 'en',
        hostA: { name: 'Aarav', photo: 'demo/baby.jpg', parents: 'Son of Kiran & Sneha Reddy' },
        age: '1st Birthday',
        blessing: '', headline: 'With joy in our hearts',
        message: 'Cake, laughter, games and lots of love — come celebrate our little prince’s very first birthday with us!',
        invitedBy: 'With love,\nKiran & Sneha',
        date: plusDays(12), time: '18:30', timeLabel: 'Time',
        venueName: 'The Park Banquet', venueAddress: 'Gachibowli, Hyderabad',
        hostPhone: '9876543210',
        events: [
          { id: 'b1', title: 'Cake Cutting', date: plusDays(12), time: '19:00' },
          { id: 'b2', title: 'Dinner', date: plusDays(12), time: '20:00' },
        ],
        gallery: [], rsvpEnabled: true, effects: true, music: 'melody',
      },
    },
    {
      key: 'housewarming',
      title: 'గృహప్రవేశం (Telugu)',
      blurb: 'Temple red · diyas & marigolds · Telugu',
      cover: 'demo/family.jpg',
      inv: {
        type: 'housewarming', theme: 'temple', lang: 'te',
        hostA: { name: 'Ramesh & Family', photo: 'demo/family.jpg', family: 'శ్రీ నిలయం' },
        blessing: '|| శ్రీ గణేశాయ నమః ||', headline: 'సాదర ఆహ్వానం',
        message: 'భగవంతుని కృపతో మా నూతన గృహప్రవేశ మహోత్సవానికి మీరు సకుటుంబ సమేతంగా విచ్చేసి మమ్మల్ని ఆశీర్వదించవలసిందిగా ఆహ్వానిస్తున్నాము.',
        invitedBy: 'ప్రేమతో,\nరమేష్ & కుటుంబం',
        date: plusDays(33), time: '06:45', timeLabel: 'ముహూర్తం',
        venueName: 'Sri Nilayam', venueAddress: 'Plot 24, Kompally, Hyderabad',
        hostPhone: '9876543210',
        events: [
          { id: 'h1', title: 'Ganapathi Pooja', date: plusDays(33), time: '06:00' },
          { id: 'h2', title: 'Satyanarayana Vratham', date: plusDays(33), time: '09:00' },
          { id: 'h3', title: 'Lunch', date: plusDays(33), time: '12:30' },
        ],
        gallery: [], rsvpEnabled: true, effects: true, music: 'melody',
      },
    },
    {
      key: 'engagement',
      title: 'Sage Garden Engagement',
      blurb: 'Light pastel · hearts · scratch card',
      cover: 'demo/couple2.jpg',
      inv: {
        type: 'engagement', theme: 'sage', lang: 'en',
        hostA: { name: 'Ananya', photo: 'demo/bride.jpg', parents: 'D/o Sri Mohan & Smt. Kavitha' },
        hostB: { name: 'Vikram', photo: 'demo/groom.jpg', parents: 'S/o Sri Prakash & Smt. Radha' },
        blessing: '|| Sri Ganeshaya Namaha ||', headline: 'Together with their families',
        message: 'She said yes! 💍 Come celebrate the start of our forever with an evening of love, laughter and good food.',
        invitedBy: 'With love,\nAnanya & Vikram',
        date: plusDays(40), time: '19:00', timeLabel: 'Time',
        venueName: 'Taj Krishna', venueAddress: 'Banjara Hills, Hyderabad',
        hostPhone: '9876543210', gallery: ['demo/couple2.jpg', 'demo/couple3.jpg'],
        events: [
          { id: 'g1', title: 'Ring Ceremony', date: plusDays(40), time: '19:00', note: 'Exchange of rings and blessings' },
          { id: 'g2', title: 'Dinner', date: plusDays(40), time: '20:30', note: 'Good food, music and celebrations' },
        ],
        scratchReveal: true, rsvpEnabled: true, effects: true, music: 'melody',
      },
    },
  ];
}
