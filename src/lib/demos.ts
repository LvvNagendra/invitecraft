import type { Invitation, Package } from '../types';

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
        hostA: { name: 'Priya', photo: 'demo/bride.jpg', parents: 'D/o Sri Venkat Rao & Smt. Lakshmi', family: 'Kommineni' },
        hostB: { name: 'Rahul', photo: 'demo/groom.jpg', parents: 'S/o Sri Suresh Sharma & Smt. Anitha', family: 'Sharma' },
        blessing: '|| Sri Venkateswara Prasanna ||',
        headline: 'Together with their families',
        message: 'With the divine blessings of the Almighty and our elders, we cordially invite you and your family to grace the auspicious occasion of the marriage of our beloved children. Your gracious presence and heartfelt blessings will make this day complete.',
        invitedBy: "With love,\nRahul & Priya's Family",
        date: plusDays(26), time: '10:30', timeLabel: 'Muhurtham',
        venueName: 'Sri Convention Hall', venueAddress: 'Road No. 10, Banjara Hills, Hyderabad',
        hostPhone: '9876543210', dressCode: 'Traditional Indian attire', hashtag: '#PriyaWedsRahul',
        gallery: ['demo/couple1.jpg', 'demo/couple2.jpg', 'demo/couple3.jpg'],
        events: [
          { id: 'e1', title: 'Haldi & Mehendi', date: plusDays(24), time: '16:00', venue: 'Bride’s Residence' },
          { id: 'e2', title: 'Sangeet Night', date: plusDays(25), time: '19:00', venue: 'Sri Convention Hall' },
          { id: 'e3', title: 'Wedding (Muhurtham)', date: plusDays(26), time: '10:30', venue: 'Sri Convention Hall' },
          { id: 'e4', title: 'Reception', date: plusDays(26), time: '19:30', venue: 'Sri Convention Hall' },
        ],
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
      title: 'Blush Engagement',
      blurb: 'Ivory blush · hearts · ring ceremony',
      cover: 'demo/couple2.jpg',
      inv: {
        type: 'engagement', theme: 'blush', lang: 'en',
        hostA: { name: 'Ananya', photo: 'demo/bride.jpg', parents: 'D/o Sri Mohan & Smt. Kavitha' },
        hostB: { name: 'Vikram', photo: 'demo/groom.jpg', parents: 'S/o Sri Prakash & Smt. Radha' },
        blessing: '|| Sri Ganeshaya Namaha ||', headline: 'Together with their families',
        message: 'She said yes! 💍 Come celebrate the start of our forever with an evening of love, laughter and good food.',
        invitedBy: 'With love,\nAnanya & Vikram',
        date: plusDays(40), time: '19:00', timeLabel: 'Time',
        venueName: 'Taj Krishna', venueAddress: 'Banjara Hills, Hyderabad',
        hostPhone: '9876543210', gallery: ['demo/couple2.jpg', 'demo/couple3.jpg'],
        events: [], rsvpEnabled: true, effects: true, music: 'melody',
      },
    },
  ];
}
