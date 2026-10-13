export interface MobileMessage {
  id: number;
  sender: 'merchant' | 'you';
  author: string;
  time: string;
  body: string;
  badge?: string;
  avatar?: string;
  avatarAlt?: string;
  delivered?: boolean;
}

export type MessageFilter = 'deals' | 'bookings';

export type ThreadSecondaryRoute = 'deal-detail' | 'booking-detail' | 'order-detail' | 'deals';

export interface MobileThread {
  id: string;
  name: string;
  initials: string;
  verified: boolean;
  time: string;
  tag: string;
  tagClass: string;
  tagIcon: string;
  preview: string;
  avatar?: string;
  alt?: string;
  unread: boolean;
  filters: MessageFilter[];
  location: string;
  status: string;
  phone: string;
  deal?: { title: string; code: string };
  secondaryLabel: string;
  secondaryRoute: ThreadSecondaryRoute;
  messages: MobileMessage[];
  quickReplies: string[];
}

export function getMobileThread(id: string): MobileThread {
  return MOBILE_THREADS.find((thread) => thread.id === id) ?? MOBILE_THREADS[0];
}

const URBAN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAI--zdhCQDqNIaUAFQUyyScD32B6PaFE8PYNPlwAAEUS3hvyURD_3XYhNE2ZssLu5cp1F51uX9_OJd2-F9zXtPPzyZDGx3PLSijXXJR7o0RYbFx2EPQ0JLA4pWSRlyejuc-I0MP3ps0FVbccbgwEQcsn5vt1_UUrHiJLzrXe_y0tOjDFe9tI_nByQxsEhv4gjxkXD-FKJyK57YQinUWWstMkdrx27HK_zhRFkspQSI';
const URBAN_ALT =
  'Woodfire dining grill interior with warm incandescent lighting and artisanal tables at Urban Grill and Bistro Apo Abuja';

const CHEF_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCB-Xjt2yU9KoW80OqiT5QTHaJF_VRXqkLOMz6gTp2nbol94ih89z50F6yQaAogksU1ejODmqd9RLuHgfJSYliJpthg2Wz5IQNBkzlNe-PIPHaNvlkEgz4V-uu9bQ30CjyqOQHlKR_b3EWXf-MEuLkDv43_3mXLjeMx9ABjik0st2w8NDP0QKiY2K-MCdNAPguYBjF9PjTvdyjEnhRwBE8mgF239kTIlXgKwUES6Zk3';
const CHEF_ALT = 'Head Chef Ibrahim wearing spotless white executive chef jacket and apron smiling in restaurant kitchen';

const GLOW_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCvPDiI1HY_kmgTwi-eVu0GLT8lvuFgOzG95QeQsUfatbuVmwj7kwKYeDUbbtr4EETbCZ_ejNMg6uBgyFxG_cn1uFJdwfCGTLAbCrZmd_GUlKdL8a97NwwfSIniiMVcdGRdWhM-IaPabMr2rOnyZ2RBo-cuPE43VbYg3vbAj21b0Y3a8_2y8n0mHkISpOptF2Uwtd6MA-LOZ_IaShQ2R67xbK2Cpn-xuuNmgk7LHQwT';
const GLOW_ALT =
  'Modern organic wellness spa interior with neutral stone textures bamboo accents and calming amber lighting in Apo';

const SOLE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBe4nIvAQc3cWN_ywPl8fOO7cJuF8r-Xq1ONAi6-sbFDoBeCt4ilOj5FH4wmOoJflcYU3jq42etvP7BKCvIukWqjlc1By9jrNvX11RYDkE8WI-6dQAX2Bn0DZUOBKA3oZwlqR6aKvdGiAJT7-RusyOD4S-vliZBCJvzqT9-DQA9LxeMyVd58kC9gAftk8RdPZHLRjO4eLA4piDL-FbyclUQEqZNLWYzycTt5DCvSGC5';
const SOLE_ALT =
  'Contemporary streetwear boutique showing luxury sneakers illuminated on floating acrylic shelves in Abuja';

const CAFE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLSUdPB0S9q1mjfhwPgtg4379_cbmhTQFg9g9abp3Y6hG2OBaihf6eVIs9WhFWXmj7sBanzoKcIFtE35a10aZRZvTx_tIoYqKR8d6Q6dSwhC8hxyOlZ6lwrKmYFLaBP2xXaAOYf7DeQK0IqKpVu86oJpq1DUY9P3n6T5IypYxfPcPVqPnGoZHq64bl3oshzZ1EoLK8o0SGh3WHjBkhAX7vy434_GLxzZPGzF0D-HzL';
const CAFE_ALT =
  'Minimalist specialty coffee roastery bar with pour over equipment and warm timber shelves in Abuja Nigeria';

export const MOBILE_THREADS: MobileThread[] = [
  {
    id: 'urban',
    name: 'Urban Grill & Bistro',
    initials: 'UG',
    verified: true,
    time: '10:42 AM',
    tag: 'Deal Pass VT-48F261 • 20% Off',
    tagClass: 'bg-badge-discount-bg text-badge-discount-text',
    tagIcon: 'confirmation_number',
    preview: 'Hi Zainab! Chef Ibrahim here. We have noted your request for steak sauce on the side...',
    avatar: URBAN_AVATAR,
    alt: URBAN_ALT,
    unread: true,
    filters: ['deals', 'bookings'],
    location: 'Plot 14 Apo Boulevard, Abuja',
    status: 'Open until 10:30 PM',
    phone: '+2348039204491',
    deal: { title: '20% Off Prime Lunch Gourmet Combo', code: 'VT-48F261' },
    secondaryLabel: 'Deal Details',
    secondaryRoute: 'deal-detail',
    messages: [
      {
        id: 1,
        sender: 'merchant',
        author: 'Urban Grill Front Desk',
        time: '10:35 AM',
        body: 'Hello Zainab! Thank you for reserving your lunch combo with us today. Table #07 in our patio garden is prepped for your arrival.',
        avatar: URBAN_AVATAR,
        avatarAlt: URBAN_ALT,
      },
      {
        id: 2,
        sender: 'you',
        author: 'You',
        time: '10:38 AM',
        body: 'Hi! Thank you. Could we please have the green peppercorn jus served in a separate sauce dish rather than over the ribeye?',
        delivered: true,
      },
      {
        id: 3,
        sender: 'merchant',
        author: 'Chef Ibrahim',
        time: '10:42 AM',
        badge: 'Kitchen Lead',
        body: "Absolutely! We've updated the kitchen ticket notes for Table #07. Our hardwood embers are ready. Let us know when you step into Apo Boulevard!",
        avatar: CHEF_AVATAR,
        avatarAlt: CHEF_ALT,
      },
      {
        id: 4,
        sender: 'you',
        author: 'You',
        time: '10:44 AM',
        body: "Perfect — we're just leaving now. See you at 1:00 PM!",
        delivered: true,
      },
    ],
    quickReplies: ['We are on our way', 'Running 10 minutes late', 'Is our table ready?', 'Thanks, see you soon!'],
  },
  {
    id: 'glow',
    name: 'Glow & Serenity Spa',
    initials: 'GS',
    verified: true,
    time: 'Yesterday',
    tag: 'Upcoming Booking Tomorrow 1:15 PM',
    tagClass: 'bg-surface-container-high text-text-secondary',
    tagIcon: 'event_available',
    preview: 'Your appointment with Amara K. is confirmed. Complimentary valet parking is available...',
    avatar: GLOW_AVATAR,
    alt: GLOW_ALT,
    unread: false,
    filters: ['bookings'],
    location: '12 Aminu Kano Crescent, Maitama',
    status: 'Spa desk open until 8:00 PM',
    phone: '+2348035550192',
    secondaryLabel: 'Booking Details',
    secondaryRoute: 'booking-detail',
    messages: [
      {
        id: 1,
        sender: 'merchant',
        author: 'Glow & Serenity Front Desk',
        time: '9:02 AM',
        body: 'Good morning Zainab! Your appointment with Amara K. is confirmed for tomorrow at 1:15 PM. Complimentary valet parking is available at the lobby.',
        avatar: GLOW_AVATAR,
        avatarAlt: GLOW_ALT,
      },
      {
        id: 2,
        sender: 'you',
        author: 'You',
        time: '9:10 AM',
        body: 'Thank you! Should I arrive 10 minutes early for the skin consultation?',
        delivered: true,
      },
      {
        id: 3,
        sender: 'merchant',
        author: 'Amara K.',
        time: '9:15 AM',
        badge: 'Lead Therapist',
        body: 'Yes, please arrive by 1:00 PM so we can review your skin profile before the session begins. See you tomorrow!',
        avatar: GLOW_AVATAR,
        avatarAlt: GLOW_ALT,
      },
    ],
    quickReplies: ['See you tomorrow', 'Can I arrive 10 minutes early?', 'Please note my nut allergy', 'Thank you!'],
  },
  {
    id: 'sole',
    name: 'Sole District Boutique',
    initials: 'SD',
    verified: false,
    time: 'Oct 08',
    tag: 'Product Inquiry',
    tagClass: 'bg-surface-container-high text-text-secondary',
    tagIcon: 'help',
    preview: 'Yes, the size 43 in white/navy is currently in stock at our showroom.',
    avatar: SOLE_AVATAR,
    alt: SOLE_ALT,
    unread: false,
    filters: ['deals'],
    location: '14 Adetokunbo Ademola Crescent, Garki',
    status: 'Showroom open until 9:00 PM',
    phone: '+2348075550193',
    secondaryLabel: 'Browse Deals',
    secondaryRoute: 'deals',
    messages: [
      {
        id: 1,
        sender: 'you',
        author: 'You',
        time: '4:12 PM',
        body: 'Hi! Do you have the Runner Low in white/navy, size 43?',
        delivered: true,
      },
      {
        id: 2,
        sender: 'merchant',
        author: 'Sole District Boutique',
        time: '4:35 PM',
        body: 'Yes, the size 43 in white/navy is currently in stock at our showroom.',
        avatar: SOLE_AVATAR,
        avatarAlt: SOLE_ALT,
      },
      {
        id: 3,
        sender: 'you',
        author: 'You',
        time: '4:38 PM',
        body: 'Great, I will stop by Saturday afternoon. Can you hold a pair until then?',
        delivered: true,
      },
    ],
    quickReplies: ['Do you deliver to Apo?', 'Can you hold it till Saturday?', 'What is the return policy?', 'Thanks!'],
  },
  {
    id: 'daily',
    name: 'The Daily Knead',
    initials: 'DK',
    verified: false,
    time: 'Oct 09',
    tag: 'Pickup Order #DK-3312',
    tagClass: 'bg-secondary-fixed text-on-secondary-fixed',
    tagIcon: 'shopping_bag',
    preview: 'Your pickup order #DK-3312 is boxed and ready — see you at 4:30 PM!',
    unread: false,
    filters: ['bookings'],
    location: '5 Adetokunbo Ademola Crescent, Wuse II',
    status: 'Bakery open until 7:30 PM',
    phone: '+2348065550166',
    secondaryLabel: 'Order Details',
    secondaryRoute: 'order-detail',
    messages: [
      {
        id: 1,
        sender: 'merchant',
        author: 'The Daily Knead',
        time: '3:40 PM',
        body: 'Hi Zainab! Your sourdough loaf, sausage rolls, and cinnamon buns are boxed and ready for pickup at our Wuse II bakery.',
      },
      {
        id: 2,
        sender: 'you',
        author: 'You',
        time: '3:46 PM',
        body: "Great, I'll be there around 4:15 PM. Can you add a pack of butter croissants too?",
        delivered: true,
      },
      {
        id: 3,
        sender: 'merchant',
        author: 'The Daily Knead',
        time: '3:48 PM',
        body: 'Done — one pack of butter croissants added. Order #DK-3312 now comes to ₦6,200. See you soon!',
      },
    ],
    quickReplies: ['On my way for pickup', 'Running 15 minutes late', 'Please add croissants', 'Thanks!'],
  },
  {
    id: 'cafe',
    name: 'Cafe Neo Artisanal',
    initials: 'CN',
    verified: false,
    time: 'Oct 11',
    tag: 'Cold Brew Voucher VT-8821',
    tagClass: 'bg-badge-discount-bg text-badge-discount-text',
    tagIcon: 'confirmation_number',
    preview: 'Thanks for claiming our deal! See you soon.',
    avatar: CAFE_AVATAR,
    alt: CAFE_ALT,
    unread: false,
    filters: ['deals'],
    location: '5 Adetokunbo Ademola Crescent, Apo',
    status: 'Counter open until 9:00 PM',
    phone: '+2348065550147',
    secondaryLabel: 'Browse Deals',
    secondaryRoute: 'deals',
    messages: [
      {
        id: 1,
        sender: 'merchant',
        author: 'Cafe Neo Artisanal',
        time: '8:40 AM',
        body: 'Thanks for claiming our deal! See you soon.',
        avatar: CAFE_AVATAR,
        avatarAlt: CAFE_ALT,
      },
      {
        id: 2,
        sender: 'you',
        author: 'You',
        time: '8:44 AM',
        body: 'Perfect — can I redeem the cold brew voucher tomorrow morning?',
        delivered: true,
      },
      {
        id: 3,
        sender: 'merchant',
        author: 'Cafe Neo Artisanal',
        time: '8:47 AM',
        body: 'Absolutely. Just show code VT-8821 at the counter and the second brew is on us. We open at 7:30 AM.',
        avatar: CAFE_AVATAR,
        avatarAlt: CAFE_ALT,
      },
    ],
    quickReplies: ['Redeeming tomorrow morning', 'Save my voucher please', 'One cold brew, please', 'Thanks!'],
  },
];
