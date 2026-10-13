import { useState, type FormEvent } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopMessagesScreenProps {
  onNav: (key: DesktopNavKey) => void;
}

interface ThreadStrip {
  icon: string;
  title: string;
  chip: string;
  price: string;
  items: string;
  cta: string;
  nav: DesktopNavKey;
}

interface Thread {
  id: string;
  name: string;
  verified: boolean;
  time: string;
  tag: string;
  tagClass: string;
  tagIcon: string;
  preview: string;
  avatar: string;
  alt: string;
  unread: boolean;
  categories: ('deals' | 'bookings')[];
  target?: DesktopNavKey;
  location: string;
  replies: string;
  status: string;
  callLabel: string;
  phone: string;
  whatsapp: string;
  voucher?: string;
  booking?: string;
  notice?: string;
  strip?: ThreadStrip;
}

interface ChatMessage {
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

const THREADS: Thread[] = [
  {
    id: 'urban',
    name: 'Urban Grill & Bistro',
    verified: true,
    time: '10:42 AM',
    tag: 'Order #UG-9021 • Prime Ribeye',
    tagClass: 'bg-secondary-fixed text-on-secondary-fixed font-semibold',
    tagIcon: 'restaurant',
    preview: 'Hi Zainab! Chef Ibrahim here. We have noted your request for steak sauce on the side...',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAI--zdhCQDqNIaUAFQUyyScD32B6PaFE8PYNPlwAAEUS3hvyURD_3XYhNE2ZssLu5cp1F51uX9_OJd2-F9zXtPPzyZDGx3PLSijXXJR7o0RYbFx2EPQ0JLA4pWSRlyejuc-I0MP3ps0FVbccbgwEQcsn5vt1_UUrHiJLzrXe_y0tOjDFe9tI_nByQxsEhv4gjxkXD-FKJyK57YQinUWWstMkdrx27HK_zhRFkspQSI',
    alt: 'Woodfire dining grill interior with warm incandescent lighting and artisanal tables at Urban Grill and Bistro Apo Abuja',
    unread: true,
    categories: ['deals', 'bookings'],
    target: 'storefront',
    location: 'Plot 14 Apo Boulevard (0.8 km)',
    replies: 'Replies in ~5 mins',
    status: 'Kitchen Active • Open until 10:30 PM',
    callLabel: 'Call Bistro',
    phone: '+2348039204491',
    whatsapp: '2348039204491',
    voucher: 'VT-48F2G1',
    booking: 'Table #07 • Today 1:00 PM',
    notice: 'Deal Pass VT-48F2G1 claimed today at 10:30 AM (20% OFF Prime Lunch Combo)',
    strip: {
      icon: 'receipt_long',
      title: 'Order #UG-9021',
      chip: 'In-Store Dining (Table #07)',
      price: '₦19,000',
      items: '1x Woodfire Aged Ribeye Steak, 1x Truffle Parmesan Fries, 1x House Craft Peach Iced Tea',
      cta: 'View Order Details',
      nav: 'orders',
    },
  },
  {
    id: 'glow',
    name: 'Glow & Serenity Spa',
    verified: true,
    time: 'Yesterday',
    tag: 'Upcoming Booking Tomorrow 1:15 PM',
    tagClass: 'bg-surface-container text-on-surface-variant font-medium',
    tagIcon: 'event_available',
    preview: 'Your appointment with Amara K. is confirmed. Complimentary valet parking is available...',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCvPDiI1HY_kmgTwi-eVu0GLT8lvuFgOzG95QeQsUfatbuVmwj7kwKYeDUbbtr4EETbCZ_ejNMg6uBgyFxG_cn1uFJdwfCGTLAbCrZmd_GUlKdL8a97NwwfSIniiMVcdGRdWhM-IaPabMr2rOnyZ2RBo-cuPE43VbYg3vbAj21b0Y3a8_2y8n0mHkISpOptF2Uwtd6MA-LOZ_IaShQ2R67xbK2Cpn-xuuNmgk7LHQwT',
    alt: 'Modern organic wellness spa interior with neutral stone textures bamboo accents and calming amber lighting in Apo',
    unread: true,
    categories: ['bookings'],
    target: 'spa-storefront',
    location: '12 Aminu Kano Crescent, Maitama (1.4 km)',
    replies: 'Replies in ~15 mins',
    status: 'Spa Desk Active • Open until 8:00 PM',
    callLabel: 'Call Spa',
    phone: '+2348035550192',
    whatsapp: '2348035550192',
    booking: 'GS-4829 • Tomorrow 1:15 PM',
    notice: 'Booking confirmed today at 9:15 AM (Weekend Glow Facial & Sauna Detox)',
    strip: {
      icon: 'event_available',
      title: 'Booking GS-4829',
      chip: 'Tomorrow 1:15 PM • Amara K.',
      price: '₦12,000',
      items: '1x Weekend Glow Facial & Sauna Detox Session • Complimentary valet parking',
      cta: 'View Booking Details',
      nav: 'orders',
    },
  },
  {
    id: 'daily',
    name: 'The Daily Knead',
    verified: false,
    time: 'Oct 09',
    tag: 'Pickup Order #DK-3312',
    tagClass: 'bg-secondary-fixed text-on-secondary-fixed font-semibold',
    tagIcon: 'shopping_bag',
    preview: 'Your pickup order #DK-3312 is boxed and ready — see you at 4:30 PM!',
    avatar: '',
    alt: 'Artisan bakery counter with fresh sourdough loaves and pastries in Abuja',
    unread: false,
    categories: ['bookings'],
    location: '5 Adetokunbo Ademola Crescent, Wuse II (1.9 km)',
    replies: 'Replies in ~20 mins',
    status: 'Bakery Open • Open until 7:30 PM',
    callLabel: 'Call Bakery',
    phone: '+2348065550166',
    whatsapp: '2348065550166',
    notice: 'Pickup order #DK-3312 confirmed today (Sourdough Loaf, Sausage Rolls & Cinnamon Buns)',
  },
  {
    id: 'cafe',
    name: 'Cafe Neo Artisanal',
    verified: false,
    time: 'Oct 11',
    tag: 'Cold Brew Voucher VT-8821',
    tagClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold',
    tagIcon: 'confirmation_number',
    preview: 'Thanks for claiming our deal! See you soon.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLSUdPB0S9q1mjfhwPgtg4379_cbmhTQFg9g9abp3Y6hG2OBaihf6eVIs9WhFWXmj7sBanzoKcIFtE35a10aZRZvTx_tIoYqKR8d6Q6dSwhC8hxyOlZ6lwrKmYFLaBP2xXaAOYf7DeQK0IqKpVu86oJpq1DUY9P3n6T5IypYxfPcPVqPnGoZHq64bl3oshzZ1EoLK8o0SGh3WHjBkhAX7vy434_GLxzZPGzF0D-HzL',
    alt: 'Minimalist specialty coffee roastery bar with pour over equipment and warm timber shelves in Abuja Nigeria',
    unread: false,
    categories: ['deals'],
    location: '5 Adetokunbo Ademola Crescent, Apo (0.5 km)',
    replies: 'Replies in ~20 mins',
    status: 'Counter Open • Open until 9:00 PM',
    callLabel: 'Call Cafe',
    phone: '+2348065550147',
    whatsapp: '2348065550147',
    voucher: 'VT-8821',
    notice: 'Voucher VT-8821 claimed today at 8:40 AM (BOGO Cold Brew & Warm Almond Pastry)',
    strip: {
      icon: 'confirmation_number',
      title: 'Voucher VT-8821',
      chip: 'Cold Brew BOGO Free',
      price: '₦4,500',
      items: '1x Buy One Get One Cold Brew & Warm Almond Pastry Box',
      cta: 'View Voucher',
      nav: 'my-deals',
    },
  },
  {
    id: 'sole',
    name: 'Sole District Boutique',
    verified: false,
    time: 'Oct 08',
    tag: 'Product Inquiry',
    tagClass: 'bg-surface-container text-on-surface-variant font-medium',
    tagIcon: 'help',
    preview: 'Yes, the size 43 in white/navy is currently in stock at our showroom.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBe4nIvAQc3cWN_ywPl8fOO7cJuF8r-Xq1ONAi6-sbFDoBeCt4ilOj5FH4wmOoJflcYU3jq42etvP7BKCvIukWqjlc1By9jrNvX11RYDkE8WI-6dQAX2Bn0DZUOBKA3oZwlqR6aKvdGiAJT7-RusyOD4S-vliZBCJvzqT9-DQA9LxeMyVd58kC9gAftk8RdPZHLRjO4eLA4piDL-FbyclUQEqZNLWYzycTt5DCvSGC5',
    alt: 'Contemporary streetwear boutique showing luxury sneakers illuminated on floating acrylic shelves in Abuja',
    unread: false,
    categories: ['deals'],
    location: '14 Adetokunbo Ademola Crescent, Garki (1.2 km)',
    replies: 'Replies in ~30 mins',
    status: 'Showroom Open • Open until 9:00 PM',
    callLabel: 'Call Store',
    phone: '+2348075550193',
    whatsapp: '2348075550193',
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  urban: [
    {
      id: 1,
      sender: 'merchant',
      author: 'Urban Grill Front Desk',
      time: '10:35 AM',
      body: 'Hello Zainab! Thank you for reserving your lunch combo with us today. Table #07 in our patio garden is prepped for your arrival.',
      avatar: THREADS[0].avatar,
      avatarAlt: THREADS[0].alt,
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
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCB-Xjt2yU9KoW80OqiT5QTHaJF_VRXqkLOMz6gTp2nbol94ih89z50F6yQaAogksU1ejODmqd9RLuHgfJSYliJpthg2Wz5IQNBkzlNe-PIPHaNvlkEgz4V-uu9bQ30CjyqOQHlKR_b3EWXf-MEuLkDv43_3mXLjeMx9ABjik0st2w8NDP0QKiY2K-MCdNAPguYBjF9PjTvdyjEnhRwBE8mgF239kTIlXgKwUES6Zk3',
      avatarAlt: 'Head Chef Ibrahim wearing spotless white executive chef jacket and apron smiling in restaurant kitchen',
    },
  ],
  glow: [
    {
      id: 1,
      sender: 'merchant',
      author: 'Glow & Serenity Front Desk',
      time: '9:02 AM',
      body: 'Good morning Zainab! Your appointment with Amara K. is confirmed for tomorrow at 1:15 PM. Complimentary valet parking is available at the lobby.',
      avatar: THREADS[1].avatar,
      avatarAlt: THREADS[1].alt,
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
      avatar: THREADS[1].avatar,
      avatarAlt: THREADS[1].alt,
    },
  ],
  daily: [
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
  cafe: [
    {
      id: 1,
      sender: 'merchant',
      author: 'Cafe Neo Artisanal',
      time: '8:40 AM',
      body: 'Thanks for claiming our deal! See you soon.',
      avatar: THREADS[3].avatar,
      avatarAlt: THREADS[3].alt,
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
      avatar: THREADS[3].avatar,
      avatarAlt: THREADS[3].alt,
    },
  ],
  sole: [
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
      avatar: THREADS[4].avatar,
      avatarAlt: THREADS[4].alt,
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
};

const QUICK_ATTACH = [
  { icon: 'confirmation_number', label: '+ Attach Deal Voucher', kind: 'voucher' as const },
  { icon: 'event', label: '+ Reference Booking', kind: 'booking' as const },
  { icon: 'near_me', label: '+ Send Location Pin', kind: 'location' as const },
];

function nowTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function threadInitials(name: string): string {
  const words = name.split(' ').filter((word) => word.length > 2 && word !== 'And');
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function DesktopMessagesScreen({ onNav }: DesktopMessagesScreenProps) {
  const [activeThread, setActiveThread] = useState('urban');
  const [messageStore, setMessageStore] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [tab, setTab] = useState<'all' | 'unread' | 'deals' | 'bookings'>('all');
  const [query, setQuery] = useState('');
  const [readIds, setReadIds] = useState<string[]>([]);

  const active = THREADS.find((thread) => thread.id === activeThread) ?? THREADS[0];
  const target = active.target;
  const strip = active.strip;
  const messages = messageStore[activeThread] ?? [];

  const isUnread = (thread: Thread) => thread.unread && !readIds.includes(thread.id);
  const unreadCount = THREADS.filter(isUnread).length;
  const bookingsCount = THREADS.filter((thread) => thread.categories.includes('bookings')).length;
  const dealsCount = THREADS.filter((thread) => thread.categories.includes('deals')).length;

  const visibleThreads = THREADS.filter((thread) => {
    if (tab === 'unread' && !isUnread(thread)) return false;
    if (tab === 'bookings' && !thread.categories.includes('bookings')) return false;
    if (tab === 'deals' && !thread.categories.includes('deals')) return false;
    if (query.trim()) {
      const haystack = `${thread.name} ${thread.tag} ${thread.preview}`.toLowerCase();
      if (!haystack.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  });

  const openThread = (thread: Thread) => {
    setActiveThread(thread.id);
    if (thread.unread) {
      setReadIds((current) => (current.includes(thread.id) ? current : [...current, thread.id]));
    }
    setDraft('');
  };

  const startNewMessage = () => {
    setQuery('');
    setTab('all');
    window.setTimeout(() => document.getElementById('thread-search')?.focus(), 0);
  };

  const appendMessage = (body: string) => {
    setMessageStore((current) => ({
      ...current,
      [activeThread]: [
        ...(current[activeThread] ?? []),
        { id: Date.now(), sender: 'you', author: 'You', time: nowTime(), body, delivered: true },
      ],
    }));
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    appendMessage(text);
    setDraft('');
  };

  const quickAttach = (kind: 'voucher' | 'booking' | 'location') => {
    if (kind === 'voucher') {
      appendMessage(
        active.voucher
          ? `Voucher ${active.voucher} attached for this conversation — please redeem it on my order.`
          : 'I have attached my latest deal voucher to this conversation for redemption.',
      );
      return;
    }
    if (kind === 'booking') {
      appendMessage(
        active.booking
          ? `Booking reference ${active.booking} shared with you.`
          : 'I would like to reference my upcoming booking with you.',
      );
      return;
    }
    appendMessage('Location pin shared: Apo, Abuja (Within 5 km).');
  };

  const tabClass = (key: 'all' | 'unread' | 'deals' | 'bookings') =>
    key === tab
      ? 'px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold shrink-0 shadow-sm'
      : 'px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium shrink-0 transition-colors';

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="messages">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
              <button className="hover:text-primary cursor-pointer transition-colors" onClick={() => onNav('discover')} type="button">
                VEMTAP Hub
              </button>
              <Icon name="chevron_right" className="text-[14px] text-outline" />
              <button className="hover:text-primary cursor-pointer transition-colors" type="button">
                Direct Messages
              </button>
              <Icon name="chevron_right" className="text-[14px] text-outline" />
              <span className="text-on-surface font-semibold">
                {active.name}
                {strip ? ' (Active Ticket)' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-badge-discount-bg text-badge-discount-text px-3 py-1 rounded-full font-caption text-caption font-semibold">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span>Apo Merchant Gateway: Connected via Low Latency POS Socket</span>
            </div>
          </div>

          <div className="w-full h-[calc(100vh-175px)] min-h-[660px] bg-surface-container-lowest rounded-2xl shadow-xl flex overflow-hidden">
            <aside className="w-[380px] shrink-0 bg-surface-container-low flex flex-col justify-between">
              <div className="flex flex-col overflow-hidden h-full">
                <div className="p-4 pb-3 flex flex-col gap-3 bg-surface-container-low">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-heading-md text-heading-md text-on-surface font-bold tracking-tight">
                        Messages
                      </span>
                      {unreadCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-caption text-caption font-semibold">
                          {unreadCount} new
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                        title="New message"
                        onClick={startNewMessage}
                        type="button"
                      >
                        <Icon name="edit_square" className="text-[18px]" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                        title="Message Settings"
                        type="button"
                      >
                        <Icon name="tune" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                  <div className="relative flex items-center w-full">
                    <Icon name="search" className="absolute left-3 text-outline text-[18px]" />
                    <input
                      className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none shadow-sm"
                      id="thread-search"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search conversations, dishes, orders..."
                      type="text"
                      value={query}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                    <button className={tabClass('all')} type="button" onClick={() => setTab('all')}>
                      All ({THREADS.length})
                    </button>
                    <button className={tabClass('unread')} type="button" onClick={() => setTab('unread')}>
                      Unread ({unreadCount})
                    </button>
                    <button className={tabClass('deals')} type="button" onClick={() => setTab('deals')}>
                      Deals &amp; Inquiries ({dealsCount})
                    </button>
                    <button className={tabClass('bookings')} type="button" onClick={() => setTab('bookings')}>
                      Bookings &amp; Orders ({bookingsCount})
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-1">
                  {visibleThreads.length === 0 ? (
                    <p className="p-4 text-center font-body-md text-body-md text-on-surface-variant">
                      No conversations match your filters.
                    </p>
                  ) : (
                    visibleThreads.map((thread) => {
                      const isActive = activeThread === thread.id;
                      const unread = isUnread(thread);
                      return (
                        <div
                          key={thread.id}
                          onClick={() => openThread(thread)}
                          className={`relative p-3 rounded-xl cursor-pointer transition-all ${
                            isActive
                              ? 'bg-surface-container-lowest shadow-md'
                              : 'hover:bg-surface-container-lowest/80'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <div
                                aria-hidden="true"
                                className="w-12 h-12 rounded-xl bg-cover bg-center shadow-inner overflow-hidden flex items-center justify-center"
                                style={{ backgroundImage: thread.avatar ? `url('${thread.avatar}')` : undefined }}
                                title={thread.alt}
                              >
                                {!thread.avatar && (
                                  <span className="bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold w-full h-full flex items-center justify-center">
                                    {threadInitials(thread.name)}
                                  </span>
                                )}
                              </div>
                              {unread ? (
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-badge-discount-text ring-2 ring-surface-container-lowest flex items-center justify-center text-on-primary">
                                  <Icon name="check" className="text-[10px]" />
                                </span>
                              ) : (
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-badge-discount-text ring-2 ring-surface-container-low" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                                    {thread.name}
                                  </span>
                                  {thread.verified && (
                                    <Icon name="verified" className="text-primary text-[15px] shrink-0" />
                                  )}
                                </div>
                                <span
                                  className={`font-caption text-caption shrink-0 ${isActive ? 'text-primary font-semibold' : 'text-outline'}`}
                                >
                                  {thread.time}
                                </span>
                              </div>
                              <div
                                className={`inline-flex items-center gap-1 my-1 px-2 py-[2px] rounded font-caption text-caption tracking-tight ${thread.tagClass}`}
                              >
                                <Icon name={thread.tagIcon} className="text-[12px]" />
                                <span className="truncate">{thread.tag}</span>
                              </div>
                              <p
                                className={`font-body-md text-body-md truncate leading-snug ${isActive ? 'text-text-secondary' : 'text-on-surface-variant'}`}
                              >
                                {thread.preview}
                              </p>
                            </div>
                          </div>
                          {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-3 bg-surface-container/60 rounded-b-none flex items-start gap-2">
                <Icon name="verified_user" className="text-primary text-[16px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-on-surface-variant leading-tight">
                  VEMTAP In-App Chat is encrypted and protected under NDPR standards. Direct merchant communication.
                </p>
              </div>
            </aside>

            <section className="flex-1 flex flex-col bg-surface-container-lowest min-w-0 overflow-hidden">
              <div className="px-6 py-3 bg-surface-container-lowest shadow-sm flex items-center justify-between gap-4 z-10 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      aria-hidden="true"
                      className="w-12 h-12 rounded-xl bg-cover bg-center shadow overflow-hidden flex items-center justify-center"
                      style={{ backgroundImage: active.avatar ? `url('${active.avatar}')` : undefined }}
                      title={active.alt}
                    >
                      {!active.avatar && (
                        <span className="bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold w-full h-full flex items-center justify-center">
                          {threadInitials(active.name)}
                        </span>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-badge-discount-text ring-2 ring-surface-container-lowest" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      {target ? (
                        <button
                          className="font-heading-sm text-heading-sm text-on-surface font-bold truncate hover:text-primary transition-colors"
                          onClick={() => onNav(target)}
                          type="button"
                        >
                          {active.name}
                        </button>
                      ) : (
                        <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold truncate">
                          {active.name}
                        </h2>
                      )}
                      {active.verified && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                          <Icon name="verified" className="text-[13px]" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-on-surface-variant font-caption text-caption">
                      <span className="flex items-center gap-1">
                        <Icon name="location_on" className="text-[14px] text-primary" />
                        <span>{active.location}</span>
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="flex items-center gap-1 text-badge-discount-text font-medium">
                        <Icon name="bolt" className="text-[14px]" />
                        <span>{active.replies}</span>
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="text-on-surface-variant font-medium">{active.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${active.phone}`}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold transition-colors"
                  >
                    <Icon name="call" className="text-[17px] text-primary" />
                    <span>{active.callLabel}</span>
                  </a>
                  <a
                    href={`https://wa.me/${active.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-label-sm text-label-sm font-semibold transition-colors"
                  >
                    <Icon name="chat" className="text-[17px]" />
                    <span>WhatsApp</span>
                  </a>
                  {target ? (
                    <button
                      onClick={() => onNav(target)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-colors"
                      type="button"
                    >
                      <Icon name="storefront" className="text-[17px]" />
                      <span className="hidden sm:inline">Storefront &amp; Menu</span>
                    </button>
                  ) : null}
                  <button
                    className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                    title="More options"
                    type="button"
                  >
                    <Icon name="more_vert" className="text-[20px]" />
                  </button>
                </div>
              </div>

              {strip ? (
                <div className="bg-surface-tint-blue/80 px-6 py-2 shadow-inner flex flex-wrap items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                      <Icon name={strip.icon} className="text-[20px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-label-sm text-label-sm text-on-surface font-bold">{strip.title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-canvas text-primary font-caption text-caption font-bold shadow-xs">
                          {strip.chip}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface font-bold">{strip.price}</span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary truncate max-w-xl">{strip.items}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNav(strip.nav)}
                    className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-sm text-label-sm font-bold shrink-0 transition-colors"
                    type="button"
                  >
                    <span>{strip.cta}</span>
                    <Icon name="open_in_new" className="text-[16px]" />
                  </button>
                </div>
              ) : null}

              <div
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-surface-container-lowest flex flex-col justify-end"
                id="chat-stream"
              >
                <div className="flex justify-center my-1">
                  <span className="bg-surface-container text-on-surface-variant font-caption text-caption px-3 py-1 rounded-full shadow-sm">
                    Today
                  </span>
                </div>
                {active.notice ? (
                  <div className="flex justify-center my-1">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shadow-xs">
                      <Icon name="local_activity" className="text-[15px]" />
                      <span>{active.notice}</span>
                    </div>
                  </div>
                ) : null}
                {messages.map((message) =>
                  message.sender === 'merchant' ? (
                    <div className="flex items-end gap-2 max-w-2xl" key={message.id}>
                      <div
                        aria-hidden="true"
                        className="w-7 h-7 rounded-full bg-primary bg-cover bg-center shrink-0 mb-1"
                        style={{
                          backgroundImage: message.avatar ? `url('${message.avatar}')` : undefined,
                        }}
                        title={message.avatarAlt}
                      />
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 pl-1">
                          <span className="font-caption text-caption font-semibold text-on-surface">
                            {message.author}
                          </span>
                          {message.badge && (
                            <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold">
                              {message.badge}
                            </span>
                          )}
                          <span className="font-caption text-caption text-outline">{message.time}</span>
                        </div>
                        <div className="p-4 bg-surface-container-low text-on-surface rounded-2xl rounded-bl-xs font-body-md text-body-md shadow-xs leading-relaxed">
                          {message.body}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end justify-end gap-2 max-w-2xl ml-auto" key={message.id}>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 pr-1">
                          <span className="font-caption text-caption text-outline">{message.time}</span>
                          <span className="font-caption text-caption font-semibold text-primary">{message.author}</span>
                        </div>
                        <div className="p-4 bg-primary text-on-primary rounded-2xl rounded-br-xs font-body-md text-body-md shadow-md leading-relaxed">
                          {message.body}
                        </div>
                        {message.delivered && (
                          <div className="flex items-center gap-1 pr-1 font-caption text-caption text-outline">
                            <span>Delivered</span>
                            <Icon
                              name="done_all"
                              filled
                              className="text-[14px] text-primary"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-[11px] font-bold shrink-0 mb-5">
                        ZA
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="px-6 py-1 bg-surface-container-lowest flex items-center gap-2 overflow-x-auto shrink-0">
                <span className="font-caption text-caption text-outline font-semibold uppercase tracking-wider shrink-0 mr-1">
                  Quick Attach
                </span>
                {QUICK_ATTACH.map((item) => (
                  <button
                    key={item.label}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-tint-blue text-primary font-caption text-caption font-bold transition-all shrink-0"
                    type="button"
                    onClick={() => quickAttach(item.kind)}
                  >
                    <Icon name={item.icon} className="text-[15px]" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-surface-container-lowest shadow-lg shrink-0">
                <form
                  className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-1 pl-4 focus-within:ring-2 focus-within:ring-primary/30 transition-all shadow-inner"
                  id="message-form"
                  onSubmit={sendMessage}
                >
                  <button
                    className="text-outline hover:text-on-surface transition-colors p-1"
                    title="Add Emoji"
                    type="button"
                  >
                    <Icon name="mood" className="text-[22px]" />
                  </button>
                  <button
                    className="text-outline hover:text-on-surface transition-colors p-1"
                    title="Attach file or photo"
                    type="button"
                  >
                    <Icon name="attach_file" className="text-[22px]" />
                  </button>
                  <input
                    className="flex-1 bg-transparent py-2 text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none"
                    id="message-input"
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={`Type a message to ${active.name}...`}
                    type="text"
                    value={draft}
                  />
                  <button
                    className="w-11 h-11 rounded-xl bg-primary-container text-on-primary hover:opacity-90 active:scale-95 flex items-center justify-center shadow-md transition-all shrink-0"
                    id="send-btn"
                    title="Send message"
                    type="submit"
                  >
                    <Icon name="send" className="text-[20px]" />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-1 px-1">
                  <div className="flex items-center gap-1 text-outline font-caption text-caption">
                    <Icon name="point_of_sale" className="text-[14px] text-badge-discount-text" />
                    <span>Merchant will receive instant push alert on their VEMTAP POS terminal.</span>
                  </div>
                  <span className="font-caption text-caption text-outline">
                    Press{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[11px]">
                      Enter ↵
                    </kbd>{' '}
                    to send
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
