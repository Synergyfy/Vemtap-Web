import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { MessagesSubNav, type MessagesChannelKey } from '../components/campaigns/MessagesSubNav';
import { useBusinessBranch } from '../context/BusinessBranchContext';

interface BusinessMessagesHomeScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenSearch: () => void;
  onNewMessage: () => void;
  onOpenConversation: (thread: 'deal' | 'order' | 'general' | 'booking') => void;
  /** Sub-navigation between In-App Chat and the campaign channels. */
  onSelectChannel?: (key: MessagesChannelKey) => void;
}

type InboxChipKey = 'all' | 'unread' | 'orders' | 'deals' | 'bookings';

const INBOX_CHIPS: { key: InboxChipKey; label: string; count: string; icon?: string; pulse?: boolean }[] = [
  { key: 'all', label: 'All', count: '(18)' },
  { key: 'unread', label: 'Unread', count: '(4)', pulse: true },
  { key: 'orders', label: 'Orders', count: '(6)', icon: 'receipt_long' },
  { key: 'deals', label: 'Deals', count: '(5)', icon: 'local_offer' },
  { key: 'bookings', label: 'Bookings', count: '(3)', icon: 'calendar_today' },
];

interface ConversationRow {
  id: string;
  img: string;
  alt: string;
  name: string;
  time: string;
  timePrimary?: boolean;
  online?: boolean;
  unread?: boolean;
  chipIcon: string;
  chipLabel: string;
  chipClass: string;
  message: string;
  messagePrimary?: boolean;
  showYouPrefix?: boolean;
  readIcon?: 'done_all' | null;
  thread: 'deal' | 'order' | 'general' | 'booking';
  tags: ('unread' | 'orders' | 'deals' | 'bookings')[];
}

const SARAH_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBrrOEMOQzm8EpeGl3bQAfoRBSDD7gsfxogspSKnvfrJmGrXnBsEvFFXrN6he-t3yWtZ-R-RTyyhiJOkFs4ffgKO1q6d5WxfSufqYCFxhH1-gvutwFGaVyvZZA4FRZmXLqnsEb-DtmXfDVH7wGuHY3aOkv1KwCXPy1ZLqqmyd47aSoOSdL65_9vW9ANkjZA49ZBQxTB-XuGIImVr40KrosVGH9D1f7ZoK4Etqh1jA6yvTVXOFY-L3sRDw';
const SARAH_ALT =
  'Close-up portrait of a warm smiling Nigerian businesswoman wearing a sleek navy blazer in an upscale Lagos office, soft diffused natural daylight, high detail, authentic commercial look';
const MICHAEL_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD_bZAFywj_PMC-4e0wIKR_ecVEFvH5f4zAyo0Bm95vUvBVQ0KPedqsMticFZKnXj6UUy4q-gz6do0s6VnuP3V5I4XhGl1MZadPcgtQhPmpV3hV9uu4ZkTl01wVs_-oaw7xdn-cMlXYNqQeLfx28DpNAqx195i6xGl7P2tI6gBl0OducTYAScByvWjdlQtaypwvIs3EAZ1gFCJEkkX7SPoVOioKVmktdCApieIZmXdCE-2LRG6ni5TgkA';
const MICHAEL_ALT =
  'Sharp portrait shot of a young Nigerian male professional wearing a tailored polo shirt with subtle background cafe lighting, modern smartphone photography style, friendly gaze';
const AMAKA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBx6PI9gwK3EO4UziCosrtyqNgS5YL3st269XuhCpFdJtOF5Cb36GTxYhhq-y8P52pqP7E32MlKnFX94d1dOCXtVg414YdkArLe88gIGru25wi-o6kgXiaY8KKny5e7Zqjpnqpuf2q0nV1Gq3Sea7F7uwcV6IGzClCVq3ms3ImcSvR3f7M0e6m_g_yd3KLl-QziWsx-IGBPfig-__2uTKLqMlG8-Q6-ojOFP7o4WTeoEmNs58axOQKW6A';
const AMAKA_ALT =
  'Portrait of an elegant West African beauty boutique owner with glowing skin, soft studio light, warm beige tones, minimalist and professional look';
const CHIDI_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC9TI5Diz7tLvY-v5o6EkY97ulssRsvN0ZEVh76n_lolNINVXFJ0iIZbyWT1iOO73Ea0Pt44wp_C-_5DOiyLNlmoa5xfkwt05ec431ozln88KZrJzgzCcfmyK6DStHFOj5s3mCsbUoAQ_Ij_smGGAdRDMlrt1p3507psO6EDX0tnzz3CRS3RuHoVKfAjZii1VPhdqvfKaphksWv9sdADXjv-oVokLhV_YOzmhceuo-WGBNiX61RXU7p_w';
const CHIDI_ALT =
  'Editorial portrait of a mature distinguished Nigerian medical consultant with spectacles and tailored button-down shirt, warm cinematic indoor lighting';
const TUNDE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAz7xRAbkyQkR27O8Eblzm50XFC1lcexp4SSN43oa9jhZssIrGlELyXy7X9YyeIhggmFmh2aGZZLO2-LyvmK7cI4x_IHz8izn3m1v_O-ICoZRllCW1rWyqrrxLug7VMum3rxRc9YoEtlZ9HOd99GUjBXKPIDz19C79n3BOhthtrJjJPxOZOpML2TgqtMuZW0SOUybFsu91dqc1rlfUCLu2znuLzrgZ-YSqPV1oczt2i59D7uLxvOjLxiw';
const TUNDE_ALT =
  'Modern professional headshot of a confident Nigerian tech founder smiling, crisp corporate casual background, natural sunlight, vibrant clean tones';
const HALIMA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBCIIJuhjD7PEcV5_EI4oaOSkwvoaxtsle4iHmiixmlUr3nqAicOp5A7Cfa0fmbg-Ef1KQIaQu-FssT_O2h7C_zZugyfevfiVHhvLWEboqpKmkpvG_lHa0e6CycscGXv_EfhEzTaenG-qB3gTvSorhnp0Gb1qU4as9Ivv98_s9NKqSduik1jiHIr6MyFPTu6eMU2M6WKteaK0XsoguivKl-KN-FKuUGpKlYubOg_VOdjsk_L7GKVZHIMQ';
const HALIMA_ALT =
  'Authentic vibrant lifestyle portrait of a stylish young Nigerian woman with braided hair wearing pastel blazer, warm studio lighting, pleasant expression';

const CONVERSATIONS: ConversationRow[] = [
  {
    id: 'sarah',
    img: SARAH_IMG,
    alt: SARAH_ALT,
    name: 'Sarah Adams',
    time: '10:42 AM',
    timePrimary: true,
    online: true,
    unread: true,
    chipIcon: 'local_offer',
    chipLabel: 'Deal Â· 20% Lunch Combo',
    chipClass: 'bg-badge-discount-bg text-badge-discount-text',
    message: 'Hi, is the 20% lunch combo discount still available for 4 people today?',
    messagePrimary: true,
    thread: 'deal',
    tags: ['unread', 'deals'],
  },
  {
    id: 'michael',
    img: MICHAEL_IMG,
    alt: MICHAEL_ALT,
    name: 'Michael James',
    time: '9:24 AM',
    chipIcon: 'receipt',
    chipLabel: 'Order #VG-94021 Â· Ribeye Steak',
    chipClass: 'bg-surface-container text-secondary',
    message: 'Your order is packed and ready for counter pickup!',
    showYouPrefix: true,
    readIcon: 'done_all',
    thread: 'order',
    tags: ['orders'],
  },
  {
    id: 'amaka',
    img: AMAKA_IMG,
    alt: AMAKA_ALT,
    name: 'Amaka Beauty & Wellness',
    time: 'Yesterday',
    timePrimary: true,
    online: true,
    unread: true,
    chipIcon: 'inventory_2',
    chipLabel: 'Product Â· Glow Radiance Serum',
    chipClass: 'bg-surface-container text-on-secondary-container',
    message: 'Do you have the 100ml bottle available in your Wuse II store?',
    messagePrimary: true,
    thread: 'general',
    tags: ['unread'],
  },
  {
    id: 'chidi',
    img: CHIDI_IMG,
    alt: CHIDI_ALT,
    name: 'Dr. Chidi Okafor',
    time: 'Yesterday',
    chipIcon: 'event_seat',
    chipLabel: 'Booking Â· Table Reservation (Sat 7:30 PM)',
    chipClass: 'bg-surface-container-high text-on-surface-variant',
    message: 'I would like to confirm our anniversary table booking for Saturday.',
    readIcon: 'done_all',
    thread: 'booking',
    tags: ['bookings'],
  },
  {
    id: 'tunde',
    img: TUNDE_IMG,
    alt: TUNDE_ALT,
    name: 'Tunde Bakare',
    time: 'Mon',
    chipIcon: 'help_outline',
    chipLabel: 'General Inquiry',
    chipClass: 'bg-surface-container-low text-text-secondary',
    message: 'Yes, we accept direct bank transfers at the counter.',
    showYouPrefix: true,
    readIcon: 'done_all',
    thread: 'general',
    tags: ['unread'],
  },
  {
    id: 'halima',
    img: HALIMA_IMG,
    alt: HALIMA_ALT,
    name: 'Halima Yusuf',
    time: 'Oct 14',
    timePrimary: true,
    unread: true,
    chipIcon: 'spa',
    chipLabel: 'Booking Â· Swedish Massage',
    chipClass: 'bg-secondary-container text-on-secondary-container',
    message: 'Can I reschedule my 5:15 PM appointment to Thursday?',
    messagePrimary: true,
    thread: 'booking',
    tags: ['bookings'],
  },
];

export function BusinessMessagesHomeScreen({
  onTab,
  onOpenSearch,
  onNewMessage,
  onOpenConversation,
  onSelectChannel,
}: BusinessMessagesHomeScreenProps) {
  const [chip, setChip] = useState<InboxChipKey>('all');
  const { branch } = useBusinessBranch();

  const visibleConversations = CONVERSATIONS.filter((row) => {
    if (chip === 'all') return true;
    if (chip === 'unread') return row.unread;
    return row.tags.includes(chip);
  });

  return (
    <AppScreen>
      {/* Messages Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <h1 className="font-heading-md text-heading-md text-on-surface truncate">Messages</h1>
            <div className="flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption text-badge-discount-text font-medium">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Search conversations"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
              onClick={onOpenSearch}
            >
              <Icon name="search" className="text-[22px]" />
            </button>
            <button
              aria-label="More options"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
        {onSelectChannel && <MessagesSubNav active="chat" onSelect={onSelectChannel} />}
      </header>

      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Search Surface */}
        <div className="px-space-md pt-space-xs pb-space-xs">
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-2.5 rounded-xl shadow-sm transition-all">
            <Icon name="search" className="text-text-secondary text-[20px]" />
            <input
              className="bg-transparent flex-1 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
              placeholder="Search customer, deal, order #, or message..."
              type="text"
              readOnly
              onClick={onOpenSearch}
            />
            <button
              aria-label="Voice search or filters"
              className="w-7 h-7 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-high transition-colors"
              type="button"
              onClick={onOpenSearch}
            >
              <Icon name="tune" className="text-[18px]" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-space-md py-space-2xs flex items-center gap-space-xs overflow-x-auto no-scrollbar">
          {INBOX_CHIPS.map((inboxChip) => {
            const active = inboxChip.key === chip;
            return (
              <button
                className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-md text-label-md shrink-0 transition-colors ${
                  active ? 'bg-surface-tint-blue text-primary shadow-sm' : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
                }`}
                key={inboxChip.key}
                type="button"
                onClick={() => setChip(inboxChip.key)}
              >
                {active && inboxChip.pulse && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                <span>{inboxChip.label}</span>
                <span className={`font-caption text-caption ${active ? 'opacity-80' : 'text-text-tertiary'}`}>
                  {inboxChip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Connected Banner */}
        <div className="px-space-md py-space-xs">
          <div className="flex items-center justify-between px-space-md py-2 bg-badge-discount-bg text-badge-discount-text rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="font-caption text-caption font-semibold">Connected</span>
              <span className="font-caption text-caption opacity-75">â€¢ Instant customer sync active</span>
            </div>
            <div className="flex items-center gap-1 font-caption text-caption font-semibold">
              <span>{branch.shortName} Hub</span>
              <Icon name="expand_more" className="text-[14px]" />
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex flex-col px-space-xs mt-space-2xs space-y-1">
          {visibleConversations.map((row) => (
            <button
              className={`flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-canvas transition-transform cursor-pointer text-left w-full ${
                row.unread ? 'shadow-sm active:scale-[0.99]' : 'hover:bg-surface-subtle'
              }`}
              key={row.id}
              type="button"
              onClick={() => onOpenConversation(row.thread)}
            >
              <div className="relative shrink-0">
                <img alt={row.alt} className="w-[50px] h-[50px] rounded-full object-cover shadow-inner" src={row.img} />
                {row.online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-badge-discount-text rounded-full ring-2 ring-surface-canvas" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-space-xs mb-1">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface truncate">{row.name}</h2>
                  <span
                    className={`font-caption text-caption shrink-0 ${row.timePrimary ? 'text-primary font-semibold' : 'text-text-tertiary'}`}
                  >
                    {row.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-caption font-medium ${row.chipClass}`}
                  >
                    <Icon name={row.chipIcon} className="text-[12px]" />
                    {row.chipLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-space-xs">
                  <p
                    className={`font-body-md text-body-md truncate flex items-center gap-1 ${
                      row.messagePrimary ? 'text-text-primary font-medium' : 'text-text-secondary'
                    }`}
                  >
                    {row.showYouPrefix && <span className="text-text-secondary">You:</span>}
                    <span className="truncate">{row.message}</span>
                  </p>
                  {row.unread && (
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold flex items-center justify-center shrink-0">
                      {row.id === 'sarah' ? '2' : '1'}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* New Message FAB */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-40 flex justify-end pointer-events-none">
        <button
          aria-label="New broadcast or customer chat"
          className="flex items-center gap-2 px-space-md py-3 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform pointer-events-auto"
          type="button"
          onClick={onNewMessage}
        >
          <Icon name="add_comment" className="text-[20px]" />
          <span className="font-button-primary text-button-primary">New Message</span>
        </button>
      </div>

      <BusinessTabBar active="messages" onTab={onTab} />
    </AppScreen>
  );
}
