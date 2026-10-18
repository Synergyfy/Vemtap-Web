import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { EnterpriseShell } from './EnterpriseShell';
import { useContacts, type BusinessContact } from '../../context/ContactsContext';
import { DesktopModal, ModalCloseButton } from '../../components/desktop/DesktopModal';
import { AddCustomerMethodsDialog } from '../../components/customers/AddCustomerMethodsDialog';
import { SendInviteDialog } from '../../components/customers/SendInviteDialog';
import { downloadCsv } from '../../utils/exportCsv';

interface DesktopBusinessCustomersScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onViewProfile?: (name: string) => void;
  /** Opens the public invite page so staff can preview the Send Invite link. */
  onPreviewInvite?: (url: string) => void;
}

interface SegmentPill {
  label: string;
  className: string;
  icon: string;
}

interface MetricLine {
  icon: string;
  label: string;
  title: string;
  className: string;
}

interface DealPill {
  label: string;
  className: string;
}

interface LtvTrend {
  text: string;
  className: string;
}

interface LastTag {
  text: string;
  className: string;
}

interface PatronRow {
  name: string;
  avatar: string;
  avatarAlt: string;
  verified: boolean;
  segment: SegmentPill;
  phone: string;
  email: string;
  memberId: string;
  metrics: MetricLine[];
  deal: DealPill;
  points: string;
  ltv: string;
  ltvNote: string;
  ltvTrend: LtvTrend;
  lastIcon?: string;
  lastDot: boolean;
  lastWhen: string;
  lastRef: string;
  lastTag: LastTag;
  tabs: Array<'frequent' | 'returning' | 'new' | 'vip'>;
}

const PATRONS: PatronRow[] = [
  {
    name: 'Michael James',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSBMsmi4sc4Osxkddec8cYO_enE_boWoXZY2o2QL-1YYjvXU05fZzuz-F2jnz5t8_Ve4IrcTsAf5UEh09BmSYA-nKlpKItjSheUM53-v30tE6W-CerReCw0hOEP9e_T1MySrBekf9JD7vdkH6bslc3bLy4HoBMNjDMxA90PZHmxR_2-oxL8LvViVZOmRKZ8j9GSaSl_ocBZ28gmihVStel_kco7wK_ZTJfS4t3KSV0zlNHgd4LcUeClw',
    avatarAlt:
      'Photorealistic headshot of Michael James, a modern Nigerian gentleman in his early thirties with a groomed short beard, wearing a crisp navy blazer in a sophisticated cafe ambient lighting.',
    verified: true,
    segment: {
      label: 'Frequent • Top 5% Spender',
      className: 'bg-tertiary-fixed text-on-tertiary-fixed',
      icon: 'military_tech',
    },
    phone: '+234 803 219 8831',
    email: 'michael.j@example.com',
    memberId: '#VEM-882049',
    metrics: [
      { icon: 'storefront', label: '14 Visits', title: 'Visits', className: 'text-primary' },
      { icon: 'receipt_long', label: '11 Orders', title: 'Completed Orders', className: 'text-secondary' },
    ],
    deal: { label: '4 Deals (100% used)', className: 'bg-badge-discount-bg text-badge-discount-text' },
    points: '2,450 Pts',
    ltv: '₦318,500',
    ltvNote: 'High-Frequency Dine-In',
    ltvTrend: { text: '₦28,950 avg / order', className: 'text-badge-discount-text' },
    lastDot: true,
    lastWhen: 'Today, 9:24 AM',
    lastRef: 'Order #VG-94021',
    lastTag: { text: 'Curbside Pickup', className: 'bg-surface-container text-text-secondary' },
    tabs: ['frequent', 'returning'],
  },
  {
    name: 'Sarah Adams',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA2wyVm8c34vOxuBIsPQMNMg9u_DzYYpSHwV1KzidEk4k1m_cGeq7o7eZrf5tCRFb15yBOBkq5M4ek_aDnPFXk67k67M25ijWc8Zu06nJEVy329VZ_TDMjJGWubLagMCFW2R8ZQlItyxNmv_kU6a7WtE_6iYGdICGqAjqhOwGWeVz0kSBHP2JgkevOfVjOxY3m_yT3_wsERfx3LPUN4QZt6lbUz858I7cAu6Q0PqX21jNWF7EUiuG_x9g',
    avatarAlt:
      'Portrait of Sarah Adams, an energetic young professional woman in Abuja with chic braided hair, warm smiling expression, wearing a minimalist cream sweater, well-lit portrait photography.',
    verified: true,
    segment: {
      label: 'Frequent • Deal Enthusiast',
      className: 'bg-badge-discount-bg text-badge-discount-text',
      icon: 'loyalty',
    },
    phone: '+234 812 443 0912',
    email: 'sarah.a@example.com',
    memberId: '#VEM-410928',
    metrics: [
      { icon: 'storefront', label: '8 Visits', title: 'Visits', className: 'text-primary' },
      { icon: 'receipt_long', label: '6 Orders', title: 'Completed Orders', className: 'text-secondary' },
    ],
    deal: { label: '5 Deals (100%)', className: 'bg-badge-discount-bg text-badge-discount-text' },
    points: '1,120 Pts',
    ltv: '₦146,200',
    ltvNote: 'Promotion Sensitive',
    ltvTrend: { text: '₦24,360 avg / order', className: 'text-text-tertiary' },
    lastDot: true,
    lastWhen: 'Today, 10:42 AM',
    lastRef: 'Claimed 20% Lunch Deal',
    lastTag: { text: 'Active Deal in Cart', className: 'bg-badge-discount-bg text-badge-discount-text font-semibold' },
    tabs: ['frequent', 'returning'],
  },
  {
    name: 'Dr. Chidi Okafor',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCE5b5d5REi5PvnDdAVq6Dpzi_1xu7LGyUmF6bbfLiVq2y1oVIqW_l-QGae0cqkVAeRE0jXGfl9FIA-nPj2iD0PJ-o7ERLCs7LE4IoMJb11MnMjuGe6_YzkYELO4uts_FU3tQCaqVQKYz07UGIQhUYvXcoARJN7XIGEY7cWQWqOa4CDDlQdpbf62vWsxS0Y4teQiUw3IfJrufgsOb1W90zC8wH7eKtL5pEnANZNLzsOlUqmNMWZHU_JiQ',
    avatarAlt:
      'Editorial portrait of Dr. Chidi Okafor, a distinguished senior Nigerian gentleman wearing modern rounded spectacles and an elegant deep grey traditional attire, studio lit against clean architectural background.',
    verified: true,
    segment: {
      label: 'VIP Silver • Table Regular',
      className: 'bg-surface-container-high text-on-surface-variant',
      icon: 'table_restaurant',
    },
    phone: '+234 802 771 9044',
    email: 'c.okafor@wusehealth.ng',
    memberId: '#VEM-194032',
    metrics: [
      { icon: 'storefront', label: '5 Visits', title: 'Visits', className: 'text-primary' },
      { icon: 'event_seat', label: '4 Bookings', title: 'Bookings', className: 'text-secondary' },
    ],
    deal: { label: '1 Deal', className: 'bg-surface-container text-text-secondary font-medium' },
    points: '890 Pts',
    ltv: '₦342,000',
    ltvNote: 'Large Party Host',
    ltvTrend: { text: '₦68,400 avg spend', className: 'text-badge-discount-text' },
    lastIcon: 'history',
    lastDot: false,
    lastWhen: 'Yesterday, 7:30 PM',
    lastRef: 'Booking #BK-77402',
    lastTag: { text: 'Party of 6 • Private Booth', className: 'bg-surface-container text-text-secondary' },
    tabs: ['returning', 'vip'],
  },
  {
    name: 'Amaka Kalu',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCd9cDQyzNONFsH3A_xW3yFEDeruoupcP69E2mbkW16i3Tr1X5gne_SP-eE12hWN-RpHI5ZAnTsUobii7gWjzDtMsZTCKYVuWRQAvBsjKgjj2qPNjuQtYIpcVxaANZl7mP-zq0tODV1aY6lpbEnX8FWNe6HI4p0k5-V7mPerkhAcAmBp_qJF8plpzqtAMLkPPdsEP3DOqDc0rG1wgxoI6Gn_26pki4GHmxiup-gGo7pVpHpxkSz9UlIXw',
    avatarAlt:
      'Close-up portrait of Amaka Kalu, a youthful stylish creative woman in Lagos with natural textured hair, wearing subtle gold earrings and a vibrant orange top with cheerful expression, soft natural sunlight.',
    verified: false,
    segment: {
      label: 'New Patron • Glow Radiance Lead',
      className: 'bg-tertiary-fixed text-on-tertiary-fixed',
      icon: 'bolt',
    },
    phone: '+234 818 902 3341',
    email: 'amaka.k@example.com',
    memberId: '#VEM-039182',
    metrics: [
      { icon: 'storefront', label: '1 Visit', title: 'Visits', className: 'text-primary' },
      { icon: 'receipt_long', label: '1 Order', title: 'Orders', className: 'text-secondary' },
    ],
    deal: { label: '1 Deal', className: 'bg-badge-discount-bg text-badge-discount-text' },
    points: '150 Pts',
    ltv: '₦18,500',
    ltvNote: 'First-Time Trial',
    ltvTrend: { text: 'High Upsell Potential', className: 'text-primary' },
    lastIcon: 'schedule',
    lastDot: false,
    lastWhen: '2 days ago',
    lastRef: 'Truffle Fries Takeaway',
    lastTag: { text: 'Mobile Order', className: 'bg-surface-container text-text-secondary' },
    tabs: ['new'],
  },
];

interface FilterTab {
  key: 'all' | 'frequent' | 'returning' | 'new' | 'vip';
  label: string;
  count: string;
}

const FILTER_TABS: FilterTab[] = [
  { key: 'all', label: 'All', count: '482' },
  { key: 'frequent', label: 'Frequent', count: '76' },
  { key: 'returning', label: 'Returning', count: '124' },
  { key: 'new', label: 'New Patrons', count: '38' },
  { key: 'vip', label: 'VIP Tier', count: '18' },
];

const KPIS = [
  {
    label: 'Total Base',
    icon: 'groups',
    iconClass: 'text-primary',
    value: '482',
    trend: '+12 this week',
    trendIcon: 'trending_up',
    trendClass: 'text-badge-discount-text',
    note: null as string | null,
    bar: 'bg-primary w-[78%]',
  },
  {
    label: 'VIP Tiers',
    icon: 'military_tech',
    iconClass: 'text-tertiary-container',
    value: '76',
    trend: null as string | null,
    trendIcon: '',
    trendClass: '',
    note: 'Top 15.7% spenders',
    bar: 'bg-tertiary-container w-[65%]',
  },
  {
    label: 'Returning',
    icon: 'repeat',
    iconClass: 'text-secondary',
    value: '124',
    trend: null as string | null,
    trendIcon: '',
    trendClass: '',
    note: '> 3 repeat orders',
    bar: 'bg-secondary w-[52%]',
  },
  {
    label: 'New (Month)',
    icon: 'fiber_new',
    iconClass: 'text-badge-discount-text',
    value: '38',
    trend: '+8.4% intake',
    trendIcon: 'arrow_upward',
    trendClass: 'text-badge-discount-text',
    note: null,
    bar: 'bg-badge-discount-text w-[44%]',
  },
  {
    label: 'Avg LTV',
    icon: 'payments',
    iconClass: 'text-primary',
    value: '₦72,400',
    trend: null,
    trendIcon: '',
    trendClass: '',
    note: 'High basket value',
    bar: 'bg-primary w-[82%]',
    wide: true,
  },
];

/** Neutral silhouette for purchase-derived contacts (no photo on file). */
const CONTACT_AVATAR =
  'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23e7e0ec"/%3E%3Ccircle cx="20" cy="15" r="7" fill="%236750a4"/%3E%3Cpath d="M8 36c0-7 5.4-11 12-11s12 4 12 11" fill="%236750a4"/%3E%3C/svg%3E';

/** BUG-017: map a purchase-derived contact onto the patron table row. */
function contactToPatron(contact: BusinessContact): PatronRow {
  const avg = contact.orderCount > 0 ? Math.round(contact.totalSpend / contact.orderCount) : contact.totalSpend;
  return {
    name: contact.name,
    avatar: CONTACT_AVATAR,
    avatarAlt: `${contact.name} profile`,
    verified: false,
    segment: {
      label: contact.marketingConsent ? 'From Purchase • Marketing Opt-in' : 'From Purchase • No Marketing Opt-in',
      className: contact.marketingConsent
        ? 'bg-badge-discount-bg text-badge-discount-text'
        : 'bg-surface-container text-text-secondary',
      icon: contact.marketingConsent ? 'loyalty' : 'receipt_long',
    },
    phone: contact.phone ?? '—',
    email: contact.email ?? '—',
    memberId: `#${contact.key.replace(/[^a-zA-Z0-9:-]/g, '').slice(-10).toUpperCase()}`,
    metrics: [
      {
        icon: 'receipt_long',
        label: `${contact.orderCount} ${contact.orderCount === 1 ? 'Order' : 'Orders'}`,
        title: 'Completed Orders',
        className: 'text-secondary',
      },
      {
        icon: 'payments',
        label: `₦${contact.totalSpend.toLocaleString('en-US')} spend`,
        title: 'Total Spend',
        className: 'text-primary',
      },
    ],
    deal: {
      label: contact.marketingConsent ? 'Marketing consented' : 'No marketing consent',
      className: contact.marketingConsent
        ? 'bg-badge-discount-bg text-badge-discount-text'
        : 'bg-surface-container text-text-secondary',
    },
    points: '—',
    ltv: `₦${contact.totalSpend.toLocaleString('en-US')}`,
    ltvNote: 'Purchase-derived contact',
    ltvTrend: { text: `₦${avg.toLocaleString('en-US')} avg / order`, className: 'text-badge-discount-text' },
    lastDot: true,
    lastWhen: new Date(contact.updatedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
    lastRef: contact.lastOrderRef ? `Order #${contact.lastOrderRef}` : '—',
    lastTag: {
      text: contact.marketingConsent ? 'Marketing Opt-in' : 'Transactional Only',
      className: contact.marketingConsent
        ? 'bg-badge-discount-bg text-badge-discount-text'
        : 'bg-surface-container text-text-secondary',
    },
    tabs: ['frequent', 'returning', 'new'],
  };
}

export function DesktopBusinessCustomersScreen({ onNav, onViewProfile, onPreviewInvite }: DesktopBusinessCustomersScreenProps) {
  const { search: searchContacts } = useContacts();
  const [activeTab, setActiveTab] = useState<FilterTab['key']>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [customPatrons, setCustomPatrons] = useState<PatronRow[]>([]);
  const [addView, setAddView] = useState<'methods' | 'manual' | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSegment, setNewSegment] = useState<'Standard Customer' | 'VIP Spender' | 'Deal Enthusiast'>('Standard Customer');
  const [newPoints, setNewPoints] = useState('100');

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    // Consent is also enforced by the disabled submit button; guard here too.
    if (!consentGranted) return;

    const newPatron: PatronRow = {
      name: newName.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      avatarAlt: newName.trim(),
      verified: true,
      segment: {
        label: newSegment === 'VIP Spender' ? 'Frequent • VIP Spender' : newSegment === 'Deal Enthusiast' ? 'Frequent • Deal Enthusiast' : 'New Customer • Verified',
        className: newSegment === 'VIP Spender' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : newSegment === 'Deal Enthusiast' ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container/20 text-primary',
        icon: newSegment === 'VIP Spender' ? 'military_tech' : newSegment === 'Deal Enthusiast' ? 'loyalty' : 'person',
      },
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
      memberId: `#VEM-${Math.floor(100000 + Math.random() * 900000)}`,
      metrics: [
        { icon: 'storefront', label: '1 Visit', title: 'Visits', className: 'text-primary' },
        { icon: 'receipt_long', label: '1 Order', title: 'Completed Orders', className: 'text-secondary' },
      ],
      deal: { label: '0 Deals', className: 'bg-surface-container text-text-secondary' },
      points: `${newPoints || '100'} Pts`,
      ltv: '₦15,000',
      ltvNote: 'Direct CRM Entry',
      ltvTrend: { text: 'New patron', className: 'text-primary' },
      lastDot: true,
      lastWhen: 'Just now',
      lastRef: 'Direct Onboarding',
      lastTag: { text: 'Walk-in / Added', className: 'bg-surface-container text-text-secondary' },
      tabs: ['new', 'returning'],
    };

    setCustomPatrons((prev) => [newPatron, ...prev]);
    setAddView(null);
    setConsentGranted(false);
    setToastMessage(`Customer ${newName.trim()} successfully added to directory!`);
    setTimeout(() => setToastMessage(null), 4000);

    // Reset form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewPoints('100');
  };

  // BUG-017: purchase-derived contacts first, deduped by name against seeds.
  const purchaseRows = searchContacts(query).map(contactToPatron);
  const visibleRows = [
    ...customPatrons,
    ...purchaseRows,
    ...PATRONS.filter((patron) => {
      if (customPatrons.some((row) => row.name.toLowerCase() === patron.name.toLowerCase())) return false;
      if (purchaseRows.some((row) => row.name.toLowerCase() === patron.name.toLowerCase())) return false;
      const matchesTab = activeTab === 'all' || patron.tabs.includes(activeTab);
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        patron.name.toLowerCase().includes(q) ||
        patron.phone.toLowerCase().includes(q) ||
        patron.memberId.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    }),
  ];

  const toggleRow = (name: string) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  return (
    <EnterpriseShell activeNav="business-customers" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-xl relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 p-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-2xl flex items-center gap-3 animate-fade-in">
            <Icon name="check_circle" className="text-[20px]" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs max-w-3xl">
            <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
              <button type="button" className="hover:text-primary transition-colors" onClick={() => onNav('overview')}>
                Business Hub
              </button>
              <Icon name="chevron_right" className="text-outline text-[16px]" />
              <span className="hover:text-primary transition-colors cursor-pointer">Customer CRM</span>
              <Icon name="chevron_right" className="text-outline text-[16px]" />
              <span className="text-text-primary font-semibold">Customer Directory &amp; Intelligence</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Customer CRM Directory &amp; Patron Intelligence
            </h1>
            <p className="font-body-md text-body-md text-text-secondary">
              Omnichannel customer profiles, loyalty balances, transaction frequencies, and direct engagement across Abuja
              and Lagos branches.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={() => {
                downloadCsv(
                  'vemtap_customer_directory',
                  ['Name', 'Phone', 'Email', 'Member ID', 'Segment', 'LTV', 'Points', 'Last Activity'],
                  visibleRows.map((patron) => [
                    patron.name,
                    patron.phone,
                    patron.email,
                    patron.memberId,
                    patron.segment.label,
                    patron.ltv,
                    patron.points,
                    patron.lastWhen,
                  ]),
                );
                setToastMessage(`Exported ${visibleRows.length} patron records (CSV)`);
                setTimeout(() => setToastMessage(null), 4000);
              }}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-canvas shadow-sm text-text-primary font-label-md text-label-md hover:bg-surface-container transition-all active:scale-[0.98]"
            >
              <Icon name="download" className="text-[18px] text-text-secondary" />
              <span>Export Directory (CSV)</span>
            </button>
            <button
              type="button"
              onClick={() => setAddView('methods')}
              className="flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] hover:opacity-95 transition-all active:scale-[0.98]"
            >
              <Icon name="person_add" className="text-[20px]" />
              <span>+ Add Customer</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          <div className="lg:col-span-5 relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-container/10 via-surface-canvas to-surface-tint-blue p-space-lg shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between gap-space-md relative z-10">
              <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-primary-container/15 text-primary font-caption text-caption font-semibold">
                <Icon name="insights" className="text-[15px]" />
                <span>VIP REVENUE MULTIPLIER</span>
              </div>
              <Icon name="workspace_premium" className="text-primary/30 text-[36px]" />
            </div>
            <div className="my-space-md relative z-10 flex flex-col gap-space-xs">
              <p className="font-heading-sm text-heading-sm text-text-primary leading-snug">
                76 Frequent Patrons generate <span className="text-primary font-bold">58%</span> of repeat revenue.
              </p>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                High loyalty engagement in Wuse Branch this month. Personalized re-engagement campaigns are showing a{' '}
                <span className="font-semibold text-text-primary">4.2x ROAS</span>.
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-between pt-space-xs">
              <button
                type="button"
                className="flex items-center gap-space-2xs text-primary font-label-md text-label-md font-semibold hover:gap-space-xs transition-all"
                onClick={() => onNav('deals')}
              >
                <span>Boost VIP Perks</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <span className="font-caption text-caption text-text-tertiary">Calculated 14m ago</span>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-primary-container/5 pointer-events-none" />
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-space-sm">
            {KPIS.map((kpi) => (
              <div
                key={kpi.label}
                className={`bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col justify-between ${
                  'wide' in kpi && kpi.wide ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="font-caption text-caption uppercase tracking-wider font-semibold">{kpi.label}</span>
                  <Icon name={kpi.icon} className={`text-[18px] ${kpi.iconClass}`} />
                </div>
                <div className="my-space-xs">
                  <div className="font-heading-lg text-heading-lg text-text-primary font-bold">{kpi.value}</div>
                  {kpi.trend ? (
                    <div
                      className={`flex items-center gap-space-2xs font-caption text-caption font-semibold mt-0.5 ${kpi.trendClass}`}
                    >
                      <Icon name={kpi.trendIcon} className="text-[14px]" />
                      <span>{kpi.trend}</span>
                    </div>
                  ) : (
                    <div className="text-text-secondary font-caption text-caption mt-0.5">{kpi.note}</div>
                  )}
                </div>
                <div className="w-full bg-surface-container rounded-full h-1 mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${kpi.bar}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-2xs overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={
                    activeTab === tab.key
                      ? 'px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold whitespace-nowrap shadow-sm'
                      : 'px-space-md py-2 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-md text-label-md whitespace-nowrap transition-colors'
                  }
                >
                  {tab.label}{' '}
                  <span className={activeTab === tab.key ? 'ml-1 opacity-80' : 'ml-1 text-text-tertiary'}>
                    ({tab.count})
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="relative flex-1 sm:w-80">
                <Icon
                  name="search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-12 rounded-xl bg-surface-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  placeholder="Search by customer name, phone, or customer ID... (⌘F)"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container text-text-tertiary font-caption text-caption uppercase font-semibold pointer-events-none">
                  ⌘F
                </span>
              </div>
              <button
                type="button"
                className="flex items-center gap-space-xs px-space-md h-10 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-primary font-label-md text-label-md transition-colors"
              >
                <Icon name="sort" className="text-[18px] text-text-secondary" />
                <span>
                  Sort by: <strong className="font-semibold">Recent interaction</strong>
                </span>
                <Icon name="expand_more" className="text-outline text-[16px]" />
              </button>
              <button
                type="button"
                className="flex items-center gap-space-xs px-space-md h-10 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-primary font-label-md text-label-md transition-colors"
              >
                <Icon name="tune" className="text-[18px] text-primary" />
                <span>Advanced Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1080px]">
              <thead>
                <tr className="bg-surface-subtle text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-space-md pl-space-lg pr-space-xs w-12 text-center">
                    <input className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer" type="checkbox" />
                  </th>
                  <th className="py-space-md px-space-md">Patron Profile &amp; Segment</th>
                  <th className="py-space-md px-space-md">Contact &amp; Identifiers</th>
                  <th className="py-space-md px-space-md">Aggregated Metrics</th>
                  <th className="py-space-md px-space-md">Lifetime Value (LTV)</th>
                  <th className="py-space-md px-space-md">Last Interaction</th>
                  <th className="py-space-md pr-space-lg pl-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-subtle text-text-primary font-body-md text-body-md">
                {visibleRows.map((patron) => (
                  <tr key={patron.name} className="hover:bg-surface-subtle/70 transition-colors group">
                    <td className="py-space-lg pl-space-lg pr-space-xs text-center align-middle">
                      <input
                        className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                        type="checkbox"
                        checked={selected.includes(patron.name)}
                        onChange={() => toggleRow(patron.name)}
                      />
                    </td>
                    <td className="py-space-lg px-space-md align-middle">
                      <div className="flex items-center gap-space-md">
                        <div className="relative shrink-0">
                          <img
                            className="w-12 h-12 rounded-xl object-cover shadow-sm"
                            alt={patron.avatarAlt}
                            src={patron.avatar}
                          />
                          {patron.verified && (
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center ring-2 ring-surface-canvas shadow-sm">
                              <Icon name="verified" className="text-[13px] font-bold" />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-heading-sm text-heading-sm text-text-primary font-semibold truncate">
                              {patron.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-space-2xs mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold flex items-center gap-1 ${patron.segment.className}`}
                            >
                              <Icon name={patron.segment.icon} className="text-[13px]" />
                              {patron.segment.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-space-lg px-space-md align-middle">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-space-2xs text-text-primary font-label-md text-label-md">
                          <Icon name="call" className="text-[16px] text-text-tertiary" />
                          <span>{patron.phone}</span>
                        </div>
                        <div className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption">
                          <Icon name="mail" className="text-[16px] text-text-tertiary" />
                          <span className="truncate">{patron.email}</span>
                        </div>
                        <div className="mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container font-caption text-caption text-text-secondary font-mono tracking-wider font-semibold">
                            {patron.memberId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-space-lg px-space-md align-middle">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-space-sm text-label-sm">
                          <span
                            className="flex items-center gap-1 font-semibold text-text-primary"
                            title={patron.metrics[0].title}
                          >
                            <Icon name={patron.metrics[0].icon} className={`text-[16px] ${patron.metrics[0].className}`} />
                            {patron.metrics[0].label}
                          </span>
                          <span className="text-text-tertiary">•</span>
                          <span
                            className="flex items-center gap-1 text-text-secondary"
                            title={patron.metrics[1].title}
                          >
                            <Icon name={patron.metrics[1].icon} className={`text-[16px] ${patron.metrics[1].className}`} />
                            {patron.metrics[1].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-space-xs font-caption text-caption">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${patron.deal.className}`}
                          >
                            <Icon name="local_offer" className="text-[13px]" />
                            {patron.deal.label}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-semibold flex items-center gap-1">
                            <Icon name="stars" className="text-[13px]" />
                            {patron.points}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-space-lg px-space-md align-middle">
                      <div className="flex flex-col">
                        <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{patron.ltv}</span>
                        <span className="font-caption text-caption text-text-secondary">{patron.ltvNote}</span>
                        <span className={`font-caption text-caption font-semibold mt-0.5 ${patron.ltvTrend.className}`}>
                          {patron.ltvTrend.text}
                        </span>
                      </div>
                    </td>
                    <td className="py-space-lg px-space-md align-middle">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-space-2xs text-text-primary font-label-sm text-label-sm font-semibold">
                          {patron.lastDot ? (
                            <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                          ) : (
                            <Icon name={patron.lastIcon ?? 'schedule'} className="text-[16px] text-text-tertiary" />
                          )}
                          <span>{patron.lastWhen}</span>
                        </div>
                        <span className="font-caption text-caption text-text-secondary">{patron.lastRef}</span>
                        <span
                          className={`px-1.5 py-0.5 w-fit rounded font-caption text-caption ${patron.lastTag.className}`}
                        >
                          {patron.lastTag.text}
                        </span>
                      </div>
                    </td>
                    <td className="py-space-lg pr-space-lg pl-space-md align-middle text-right">
                      <div className="flex items-center justify-end gap-space-xs">
                        <button
                          type="button"
                          className="px-space-sm py-1.5 rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold transition-all flex items-center gap-1 active:scale-[0.98]"
                          onClick={() => onNav('messages')}
                        >
                          <Icon name="chat" className="text-[16px]" />
                          <span>In-App Chat</span>
                        </button>
                        <button
                          type="button"
                          title="View Detailed Dossier"
                          className="p-1.5 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-secondary transition-colors"
                          onClick={() => onViewProfile?.(patron.name)}
                        >
                          <Icon name="person_search" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          title="Quick Options"
                          className="p-1.5 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-secondary transition-colors"
                        >
                          <Icon name="more_vert" className="text-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-space-lg py-space-md bg-surface-canvas border-t-0 flex flex-col sm:flex-row items-center justify-between gap-space-md font-label-sm text-label-sm text-text-secondary">
            <div className="flex items-center gap-space-md">
              <span>
                Showing <strong className="text-text-primary font-semibold">1-{visibleRows.length}</strong> of{' '}
                <strong className="text-text-primary font-semibold">482</strong> records
              </span>
              <span className="hidden md:inline text-text-tertiary">|</span>
              <span className="hidden md:inline px-space-xs py-0.5 rounded bg-surface-subtle text-text-secondary font-caption text-caption font-semibold">
                {selected.length} patrons selected
              </span>
              <span className="hidden md:inline text-text-tertiary">|</span>
              <div className="flex items-center gap-space-xs">
                <span>Rows per page:</span>
                <select className="bg-surface-subtle rounded-lg px-2 py-1 text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                disabled
                className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-tertiary cursor-not-allowed flex items-center justify-center"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={
                    page === n
                      ? 'w-8 h-8 rounded-lg bg-primary-container text-on-primary-container font-semibold flex items-center justify-center'
                      : 'w-8 h-8 rounded-lg hover:bg-surface-subtle text-text-primary flex items-center justify-center transition-colors'
                  }
                >
                  {n}
                </button>
              ))}
              <span className="px-1 text-text-tertiary">…</span>
              <button
                type="button"
                onClick={() => setPage(49)}
                className={
                  page === 49
                    ? 'w-8 h-8 rounded-lg bg-primary-container text-on-primary-container font-semibold flex items-center justify-center'
                    : 'w-8 h-8 rounded-lg hover:bg-surface-subtle text-text-primary flex items-center justify-center transition-colors'
                }
              >
                49
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-primary flex items-center justify-center transition-colors"
              >
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-high/60 p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-sm max-w-4xl">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="verified_user" className="text-[20px]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-md text-label-md font-semibold text-text-primary">
                  NDPR Compliance &amp; Customer Privacy Guard
                </span>
                <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Strict Protocol Active
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Customer contact information displayed strictly complies with the Nigeria Data Protection Act (NDPA
                2023). Direct communication is cryptographically authorized through active patron interaction and
                consent tokens granted during order or deal checkout.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 flex items-center gap-space-2xs text-primary font-label-sm text-label-sm font-semibold hover:underline"
            onClick={() => onNav('analytics')}
          >
            <span>Deep-dive cohort analysis in Analytics Hub</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>

        {/* Add Customer — method chooser (Manual / Invite / Bulk coming soon) */}
        <AddCustomerMethodsDialog
          open={addView === 'methods'}
          onClose={() => setAddView(null)}
          onAddManually={() => setAddView('manual')}
          onSendInvite={() => {
            setAddView(null);
            setInviteModalOpen(true);
          }}
        />

        {/* Send Invite Link */}
        <SendInviteDialog
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onPreviewInvite={onPreviewInvite}
        />

        {/* Add Manually */}
        <DesktopModal open={addView === 'manual'} onClose={() => setAddView(null)} maxWidth="max-w-lg">
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
                    <Icon name="person_add" className="text-[22px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Add New Customer</h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Create a verified patron record with omnichannel sync
                    </p>
                  </div>
                </div>
                <ModalCloseButton onClose={() => setAddView(null)} />
              </div>

              <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Adebayo Ogunlesi"
                    className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-container-lowest text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-container-lowest text-text-primary text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-container-lowest text-text-primary text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                      Customer Segment
                    </label>
                    <select
                      value={newSegment}
                      onChange={(e) => setNewSegment(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border-subtle bg-surface-container-lowest text-text-primary text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="Standard Customer">Standard Customer</option>
                      <option value="VIP Spender">VIP Spender</option>
                      <option value="Deal Enthusiast">Deal Enthusiast</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                      Initial Loyalty Points
                    </label>
                    <input
                      type="number"
                      value={newPoints}
                      onChange={(e) => setNewPoints(e.target.value)}
                      placeholder="100"
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-container-lowest text-text-primary text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Consent — required before saving (unchecked by default) */}
                <div className="pt-3 border-t border-border-subtle">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={consentGranted}
                      onChange={(event) => setConsentGranted(event.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                      aria-describedby="add-customer-consent"
                    />
                    <span id="add-customer-consent" className="text-xs leading-relaxed text-text-secondary">
                      I confirm that I have permission to provide and store this customer&apos;s contact details in
                      VEMTAP for legitimate business purposes.
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddView(null)}
                    className="px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary hover:bg-surface-container text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!consentGranted || !newName.trim() || !newPhone.trim()}
                    className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-sm font-semibold shadow-md hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
        </DesktopModal>
      </div>
    </EnterpriseShell>
  );
}
