import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { useCustomerDossier, useSaveCustomerNote } from '../../hooks/business/useBusinessCustomers';
import { formatNaira } from '../../utils/format';
import {
  CUSTOMER_AVATAR,
  customerName,
  dayLabel,
  interactionLabel,
  memberRef,
  nextTierLabel,
  noteEntries,
  plural,
  pointsLabel,
  segmentLabel,
  spendLabel,
  whenLabel,
  withNoteLine,
} from '../customersLive';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { EnterpriseShell } from './EnterpriseShell';

interface DesktopCustomerProfileScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack?: () => void;
  /** Live: the customer's user id; the dossier loads their real record. */
  customerId?: string | null;
}

const KPI_CARDS = [
  {
    label: 'Total Visits',
    icon: 'pin_drop',
    iconBox: 'bg-surface-container text-primary',
    value: '14',
    valueClass: 'text-text-primary',
    note: 'Avg 2.2 visits / mo',
    noteClass: 'text-text-secondary',
    bar: 'bg-primary',
    barWidth: '72%',
  },
  {
    label: 'Orders Placed',
    icon: 'shopping_bag',
    iconBox: 'bg-surface-container text-primary',
    value: '11',
    valueClass: 'text-text-primary',
    note: '₦318,500 Lifetime',
    noteClass: 'text-text-secondary font-medium',
    bar: 'bg-badge-discount-text',
    barWidth: '86%',
  },
  {
    label: 'Deals Claimed',
    icon: 'percent',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
    value: '4 Claimed',
    valueClass: 'text-text-primary',
    note: '100% redemption rate',
    noteClass: 'text-badge-discount-text font-semibold',
    footer: 'Saved ₦18,500 on promos',
  },
  {
    label: 'Loyalty Points',
    icon: 'toll',
    iconBox: 'bg-tertiary-fixed text-on-tertiary-fixed',
    value: '2,450 pts',
    valueClass: 'text-tertiary',
    note: 'VIP Gold Tier',
    noteClass: 'text-text-secondary',
    footer: '₦2,450 redeemable value',
  },
];

interface LedgerItem {
  icon: string;
  iconBox: string;
  title: string;
  badge: string;
  badgeClass: string;
  time: string;
  description: string;
  meta: string;
  metaClass: string;
  amount: string;
  amountClass: string;
  link: string;
  rowClass: string;
}

const LEDGER_ITEMS: LedgerItem[] = [
  {
    icon: 'restaurant_menu',
    iconBox: 'bg-primary-fixed text-primary',
    title: 'Order #VG-94021',
    badge: 'Paid via POS',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    time: 'Today, 9:24 AM',
    description: 'Woodfire Ribeye Steak (x1) • Vintage Cabernet Sauvignon Pairing (x1)',
    meta: 'Terminal: Wuse Bar Deck 03 • Cashier: Amina T.',
    metaClass: 'text-text-tertiary',
    amount: '₦51,600',
    amountClass: 'text-text-primary',
    link: 'View in Orders Hub →',
    rowClass: 'bg-surface-subtle hover:bg-surface-container-low',
  },
  {
    icon: 'confirmation_number',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Deal Voucher #VT-48F2G1',
    badge: 'Redeemed Voucher',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    time: 'Oct 10, 1:15 PM',
    description: '20% Off Prime Lunch Combo • Redeemed at Wuse Branch POS Terminal 1',
    meta: 'Direct Merchant Discount Applied • Patron Saved ₦2,400',
    metaClass: 'text-badge-discount-text font-medium',
    amount: '-₦2,400',
    amountClass: 'text-badge-discount-text',
    link: 'View Deal Voucher →',
    rowClass: 'bg-badge-discount-bg/40 hover:bg-badge-discount-bg/60',
  },
  {
    icon: 'dinner_dining',
    iconBox: 'bg-surface-container-highest text-on-surface-variant',
    title: 'Order #VG-92100',
    badge: 'Paid via POS',
    badgeClass: 'bg-surface-container text-text-secondary',
    time: 'Oct 02, 8:40 PM',
    description: 'Double Smash Burger (x2) • Craft Beer Flight (x1) • Loaded Wedges',
    meta: 'Table 14 (Patio Booth) • Waiter: Emeka K.',
    metaClass: 'text-text-tertiary',
    amount: '₦28,500',
    amountClass: 'text-text-primary',
    link: 'View in Orders Hub →',
    rowClass: 'bg-surface-subtle hover:bg-surface-container-low',
  },
];

interface PointsEntry {
  op: 'add' | 'remove';
  title: string;
  meta: string;
  delta: string;
  deltaClass: string;
  iconBox: string;
}

const POINTS_ENTRIES: PointsEntry[] = [
  {
    op: 'add',
    title: 'Order #VG-94021 Accrual (10 pts per ₦1,500 spend)',
    meta: 'Today, 9:24 AM • Automated Ledger Post',
    delta: '+350 pts',
    deltaClass: 'text-badge-discount-text',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
  },
  {
    op: 'remove',
    title: 'Redeemed for Artisan Dessert Voucher',
    meta: 'Oct 04, 7:10 PM • Authorized by Wuse Host',
    delta: '-500 pts',
    deltaClass: 'text-error',
    iconBox: 'bg-error-container text-on-error-container',
  },
  {
    op: 'add',
    title: 'Order #VG-92100 Accrual',
    meta: 'Oct 02, 8:40 PM • Automated Ledger Post',
    delta: '+250 pts',
    deltaClass: 'text-badge-discount-text',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
  },
  {
    op: 'add',
    title: 'Bonus Check-in & Review Streak (3rd in month)',
    meta: 'Sep 20, 1:45 PM • Consumer App Geo-Verification',
    delta: '+50 pts',
    deltaClass: 'text-badge-discount-text',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
  },
];

const DIETARY_TAGS = [
  { label: 'Halal preferences', icon: 'check_circle', iconClass: 'text-badge-discount-text', className: 'bg-surface-subtle text-text-primary' },
  { label: 'Nut allergy (mild)', icon: 'warning', iconClass: '', className: 'bg-error-container text-on-error-container' },
  { label: 'Red Meat Enthusiast', icon: 'local_fire_department', iconClass: 'text-tertiary', className: 'bg-surface-subtle text-text-primary' },
  { label: 'Loves Craft Cocktails', icon: 'local_bar', iconClass: 'text-primary', className: 'bg-surface-subtle text-text-primary' },
];

const FAVORITES = [
  {
    name: 'Woodfire Ribeye Steak',
    meta: 'Ordered 6 times • ₦38,000 avg',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNPzbToDUHgaUf7HTPrqk3P83XYKvENivDH_UWaCDrSxqKii-_QTRmXBynX7jJu-h-3WivZ9k1hUpf_SX8RmYJ0oEG9DFUnh1Wvz8mbDNsJTX1rzN6mRlMi2vrVmuioQHOIjurzxrSPolnAHdhEFkgabxHP-ngdl0Jddtiu4ngqb8roK-0s_6OsZfme95ZFWKIMzH9dEkrcCnjpBJzs-C5fS0ajIch8mPMcNzfp7_SP2PWh_dIxWl2YA',
    alt: 'Woodfire grilled ribeye steak with golden garlic butter glaze and fresh rosemary garnish on dark slate plate, warm ambient restaurant table lighting, high dynamic range culinary photography',
  },
  {
    name: 'Truffle Parmesan Fries',
    meta: 'Ordered 8 times • Favorite side',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBR28UVq3P5cdOkdqR4dNJ1Z31q4BJqvCIOP9LsmtjneRgwbfsd-kTiebPO-wf0F-SODm86dqRKfjiegmph5V55CIBKJG3yBNu9QG_Pjgw3NyPnWOcXPipKBb2ccySuf_XKTBbZFNcofOCo41aZfyHs6UHYtwpXaycMuTTqudK-ie2fzVtpgKTt0fIDrMO7bOhwU89Y3Rt3a9zPa0t9w6xstgMJWt2bBhWWFv08dgxosW0ZORoDfuHxhA',
    alt: 'Crispy golden truffle parmesan fries sprinkled with fresh micro herbs and sea salt in an artisanal ceramic bowl, shallow depth of field, high-end bistro lighting',
  },
  {
    name: 'Passionfruit Mojito',
    meta: 'Ordered 5 times • Signature pairing',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzNUfyPAFNAEsW-xXg7E9eOmZThmeQa8r_Ocr1MXbWub3A1AS_rQYk9yh-IDH9S_W6yZSg8ygTvW2m9devRkYTC2Kg11fLEm_YHezs5R_0I8V3-InTtS0f8pcbwu7CwQmU1mQahU79e2iz_aZ6G77za5_Dhw9gC_R52zim-JQT6pIvwb2o1zLbOTMynKss0Lmqu9W4uOtyL7LPYcsvxnMlQsUoxEL8lpcAbHtC54bEaYOJD-jRmJqd2A',
    alt: 'Chilled passionfruit craft mojito garnished with fresh mint sprigs and lime wheel with crushed ice in tall crystal highball glass, refreshing vibrant cocktail photography',
  },
];

const VISIT_WINDOWS = [
  { icon: 'wb_sunny', iconClass: 'text-primary', label: 'Thursday & Friday Lunch', time: '12:30 PM – 2:00 PM' },
  { icon: 'nightlight', iconClass: 'text-secondary', label: 'Saturday Dinner Service', time: '7:30 PM – 9:45 PM' },
];

export function DesktopCustomerProfileScreen({ onNav, onBack, customerId }: DesktopCustomerProfileScreenProps) {
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const live = hasApiConfig();
  const dossierQuery = useCustomerDossier(live ? (customerId ?? null) : null);
  const d = dossierQuery.data;
  const saveNote = useSaveCustomerNote(customerId ?? '');
  const v = <T,>(liveValue: T, demoValue: T) => (live ? liveValue : demoValue);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    if (dossierQuery.error) showToast(apiErrorMessage(dossierQuery.error, 'Could not load this customer.'));
  }, [dossierQuery.error]);

  const name = d ? customerName(d) : '—';
  const notes = noteEntries(d);

  const kpiCards = live
    ? [
        { ...KPI_CARDS[0], value: d ? String(d.visits) : '—', note: d?.metrics ? `Avg ${d.metrics.visitsPerMonth} visits / mo` : '—' },
        { ...KPI_CARDS[1], value: d ? String(d.orders) : '—', note: d ? `${spendLabel(d)} Lifetime` : '—' },
        {
          ...KPI_CARDS[2],
          value: d ? `${d.claims} Claimed` : '—',
          note: d?.metrics ? `${Math.round(d.metrics.redemptionRate * 100)}% redemption rate` : '—',
          footer: d?.metrics ? `${plural(d.metrics.redeemed, 'voucher')} redeemed` : '—',
        },
        {
          ...KPI_CARDS[3],
          value: d ? pointsLabel(d.pointsBalance) : '—',
          note: d?.tier ? `${d.tier} Tier` : '—',
          footer: d ? nextTierLabel(d.pointsBalance) : '—',
        },
      ]
    : KPI_CARDS;

  const ledgerItems: LedgerItem[] = live
    ? [
        ...(d?.recentPurchases ?? []).map((purchase) => ({
          at: purchase.at,
          item: {
            icon: 'receipt_long',
            iconBox: 'bg-primary-fixed text-primary',
            title: `${purchase.kind === 'pos' ? 'Sale' : 'Order'} #${purchase.reference ?? purchase.id.slice(0, 8).toUpperCase()}`,
            badge: purchase.paymentMethod ? `Paid via ${purchase.paymentMethod}` : purchase.kind === 'pos' ? 'POS' : 'Order',
            badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
            time: whenLabel(purchase.at),
            description: purchase.items || '—',
            meta: purchase.branchName ?? '',
            metaClass: 'text-text-tertiary',
            amount: formatNaira(Number(purchase.total) || 0),
            amountClass: 'text-text-primary',
            link: 'View in Orders Hub →',
            rowClass: 'bg-surface-subtle hover:bg-surface-container-low',
          },
        })),
        ...(d?.recentClaims ?? []).map((claim) => ({
          at: claim.redeemedAt ?? claim.claimedAt,
          item: {
            icon: 'confirmation_number',
            iconBox: 'bg-badge-discount-bg text-badge-discount-text',
            title: claim.claimCode ? `Deal Voucher #${claim.claimCode}` : 'Deal Voucher',
            badge: claim.redeemedAt ? 'Redeemed Voucher' : 'Claimed',
            badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
            time: whenLabel(claim.redeemedAt ?? claim.claimedAt),
            description: [claim.offerName, claim.branchName].filter(Boolean).join(' • '),
            meta: Number(claim.saved) ? `Patron Saved ${formatNaira(Number(claim.saved))}` : '',
            metaClass: 'text-badge-discount-text font-medium',
            amount: Number(claim.saved) ? `-${formatNaira(Number(claim.saved))}` : '—',
            amountClass: 'text-badge-discount-text',
            link: 'View Deal Voucher →',
            rowClass: 'bg-badge-discount-bg/40 hover:bg-badge-discount-bg/60',
          },
        })),
      ]
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .map(({ item }) => item)
    : LEDGER_ITEMS;

  const pointsEntries: PointsEntry[] = live
    ? (d?.loyaltyLedger ?? []).map((entry) => ({
        op: entry.points < 0 ? 'remove' : 'add',
        title: entry.reason || (entry.points < 0 ? 'Points redeemed' : 'Points earned'),
        meta: whenLabel(entry.at),
        delta: `${entry.points < 0 ? '-' : '+'}${pointsLabel(Math.abs(entry.points))}`,
        deltaClass: entry.points < 0 ? 'text-error' : 'text-badge-discount-text',
        iconBox:
          entry.points < 0 ? 'bg-error-container text-on-error-container' : 'bg-badge-discount-bg text-badge-discount-text',
      }))
    : POINTS_ENTRIES;

  const dietaryTags = live
    ? (d?.note?.tags ?? []).map((label) => ({
        label,
        icon: 'sell',
        iconClass: 'text-primary',
        className: 'bg-surface-subtle text-text-primary',
      }))
    : DIETARY_TAGS;

  const placeholderRow = { name: '—', meta: 'Not tracked yet', image: '', alt: '' };
  const favorites = live ? [placeholderRow] : FAVORITES;
  const visitWindows = live ? [{ icon: 'schedule', iconClass: 'text-text-tertiary', label: '—', time: '—' }] : VISIT_WINDOWS;

  const submitNote = () => {
    if (live) {
      const value = note.trim();
      if (!value || !customerId) return;
      saveNote.mutate(
        { note: withNoteLine(d, value), tags: d?.note?.tags ?? [] },
        {
          onSuccess: () => {
            setNote('');
            showToast(`Staff note saved to ${name}'s dossier.`);
          },
          onError: (error) => showToast(apiErrorMessage(error, 'Could not save the note.')),
        },
      );
      return;
    }
    if (note.trim()) {
      showToast('Staff note logged successfully to Michael James dossier.');
      setNote('');
    }
  };

  return (
    <EnterpriseShell activeNav="business-customers" onNav={onNav}>
      <div className="w-full py-space-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
          <div className="flex flex-col gap-space-2xs min-w-0">
            <nav className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption flex-wrap">
              <button type="button" className="hover:text-primary transition-colors" onClick={() => onNav('overview')}>
                Business Hub
              </button>
              <Icon name="chevron_right" className="text-[13px]" />
              <span className="hover:text-primary transition-colors cursor-pointer">Customer CRM</span>
              <Icon name="chevron_right" className="text-[13px]" />
              <span className="hover:text-primary transition-colors cursor-pointer">Customer Directory</span>
              <Icon name="chevron_right" className="text-[13px]" />
              <span className="text-text-primary font-medium bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                {v(d ? `${name} (${memberRef(d)})` : '—', 'Michael James (#VEM-882049)')}
              </span>
            </nav>
            <div className="flex items-center gap-space-sm mt-1">
              <button
                type="button"
                className="flex items-center gap-space-2xs text-text-secondary hover:text-primary transition-colors font-label-md text-label-md"
                onClick={onBack}
              >
                <Icon name="arrow_back" className="text-[18px]" />
                <span>Back to CRM Directory</span>
              </button>
              <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
              <span className="text-text-tertiary font-caption text-caption">{v(
                d ? `Member since ${dayLabel(d.memberSince)}` : '—',
                'Active Session #NG-ABJ-8910',
              )}</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs flex-wrap">
            <button
              type="button"
              className="h-10 px-space-md rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-primary shadow-sm hover:shadow transition-all flex items-center gap-space-2xs font-button-secondary text-button-secondary"
            >
              <Icon name="receipt_long" className="text-primary text-[18px]" />
              <span>Log Visit / Order</span>
            </button>
            <button
              type="button"
              className="h-10 px-space-md rounded-lg bg-surface-canvas hover:bg-surface-subtle text-primary shadow-sm hover:shadow transition-all flex items-center gap-space-2xs font-button-secondary text-button-secondary"
              onClick={() => onNav('deals')}
            >
              <Icon name="local_offer" className="text-primary text-[18px]" />
              <span>+ Custom Deal Offer</span>
            </button>
            <button
              type="button"
              className="h-10 px-space-lg rounded-lg bg-primary hover:bg-primary-container text-on-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-2xs font-button-primary text-button-primary"
              onClick={() => onNav('messages')}
            >
              <Icon name="chat_bubble" className="text-[18px]" />
              <span>Start In-App Chat</span>
            </button>
            <button
              type="button"
              aria-label="Patron actions"
              className="w-10 h-10 rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-secondary flex items-center justify-center shadow-sm transition-colors"
              onClick={() =>
                showToast(
                  live
                    ? 'More patron actions are coming soon.'
                    : 'Patron Actions:\n- Edit Customer Profile Details\n- Merge Duplicate Dossier\n- Restrict Loyalty Redemption\n- Export NDPR Subject Access Archive\n- Archive Patron Record',
                )
              }
            >
              <Icon name="more_horiz" className="text-[20px]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          <div className="xl:col-span-8 flex flex-col gap-space-lg min-w-0">
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-surface-tint-blue rounded-full pointer-events-none blur-2xl opacity-60" />
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-lg relative z-10">
                <div className="flex items-start gap-space-md">
                  <div className="relative shrink-0">
                    <img
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-sm ring-4 ring-surface-canvas"
                      alt={v(`${name} profile`, "High-contrast modern portrait photograph of a confident 35-year-old Nigerian gentleman wearing an indigo linen blazer against clean soft studio lighting, crisp focus, hyper-realistic, sophisticated urban styling")}
                      src={live ? d?.avatarUrl || CUSTOMER_AVATAR : "https://lh3.googleusercontent.com/aida-public/AB6AXuB4pP5DeLuqz8v5Wtl3BqcL8pxRw56M-uOfFpVkuI38vM9ZHsfOeAYR_w1c13IgD3OcVwsytv8i6s5TiUrPQg_2uHfucw9CKqdJJpO_FcdKhUW7bZ0CsBjhz-MnezWnzDoT-AQiZ8OW6vOjfmmWUJcdsPEm28fmGWitfflMkmlkR4UZaBocdTvjw1-z4aK2XgeIxYHDPstZ9K3i15aGV_0k8ZAccr8JEvVa3TrPh2Fj_C48G2xx_FsFEQ"}
                    />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md ring-2 ring-surface-canvas">
                      <Icon name="verified" filled className="text-[15px]" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{v(name, 'Michael James')}</h1>
                      <span className="px-space-xs py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold flex items-center gap-1">
                        <Icon name="star" filled className="text-[13px]" />
                        {v(d?.tier ? `${d.tier} Member` : '—', 'VIP Gold Member')}
                      </span>
                    </div>
                    <p className="font-label-sm text-label-sm text-text-secondary flex items-center gap-2 flex-wrap">
                      <span>{v(d ? segmentLabel(d) : '—', 'Frequent Patron')}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <span className="text-tertiary-container font-semibold">
                        {v(d ? `${spendLabel(d)} lifetime spend` : '—', 'Top 5% Spender (F&B Category)')}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <span className="font-mono text-caption text-text-tertiary">ID: {v(d ? memberRef(d) : '—', '#VEM-882049')}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-space-xs mt-2">
                      <div className="flex items-center gap-1 bg-surface-subtle px-2.5 py-1 rounded-lg">
                        <Icon name="call" className="text-primary text-[15px]" />
                        <span className="font-label-sm text-label-sm text-text-primary">{v(d?.phone || '—', '+234 803 219 8831')}</span>
                        <button
                          type="button"
                          title="Direct Click to Call"
                          onClick={() => {
                            if (live && d?.phone) window.location.href = `tel:${d.phone}`;
                          }}
                          className="text-primary hover:text-primary-container ml-1 flex items-center"
                        >
                          <Icon name="phone_forwarded" className="text-[14px]" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-subtle px-2.5 py-1 rounded-lg">
                        <Icon name="mail" className="text-primary text-[15px]" />
                        <span className="font-label-sm text-label-sm text-text-primary">{v(d?.email || '—', 'michael.j@example.com')}</span>
                        <button
                          type="button"
                          title="Copy Email"
                          className="text-text-tertiary hover:text-text-primary ml-1 flex items-center"
                          onClick={() => navigator.clipboard?.writeText(v(d?.email ?? '', 'michael.j@example.com'))}
                        >
                          <Icon name="content_copy" className="text-[14px]" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-subtle px-2.5 py-1 rounded-lg">
                        <Icon name="storefront" className="text-secondary text-[15px]" />
                        <span className="font-label-sm text-label-sm text-text-secondary">
                          {v(d?.preferredBranch?.name ?? '—', 'Wuse Branch (Abuja Flagship)')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 bg-surface-container-high rounded-xl p-space-sm flex flex-col justify-between w-full md:w-56 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary font-semibold uppercase tracking-wider">
                      VEMTAP PRIVILEGE
                    </span>
                    <Icon name="workspace_premium" filled className="text-tertiary text-[18px]" />
                  </div>
                  <div className="my-2">
                    <span className="text-caption text-text-tertiary block">Token Tier</span>
                    <span className="font-heading-sm text-heading-sm text-text-primary">
                      {v(d ? `${d.tier ?? ''} ${pointsLabel(d.pointsBalance)}`.trim() : '—', 'VIP Gold 2,450 pts')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-caption font-mono text-text-secondary pt-1">
                    <span>{v('EXP: —', 'EXP: 12/26')}</span>
                    <span className="text-badge-discount-text font-semibold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-space-md pt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs text-text-secondary font-caption text-caption bg-surface-container-low rounded-lg p-space-sm">
                <div className="flex items-center gap-space-xs">
                  <Icon name="how_to_reg" className="text-primary text-[16px]" />
                  <span>
                    <strong>First Interaction:</strong>{' '}
                    {v(
                      d?.firstInteraction
                        ? `${dayLabel(d.firstInteraction.at)} (${interactionLabel(d.firstInteraction.kind)})`
                        : '—',
                      'June 12, 2024 (Walk-in acquisition via VEMTAP Table QR)',
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <Icon name="schedule" className="text-badge-discount-text text-[16px]" />
                  <span>
                    <strong>Latest:</strong>{' '}
                    {v(
                      d
                        ? `${whenLabel(d.lastSeenAt)} (${interactionLabel(d.lastInteraction?.kind)}${d.lastInteraction?.reference ? ` • ${d.lastInteraction.reference}` : ''})`
                        : '—',
                      'Today, 9:24 AM (Order #VG-94021 • Woodfire Ribeye)',
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
              {kpiCards.map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="font-label-sm text-label-sm">{kpi.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.iconBox}`}>
                      <Icon name={kpi.icon} className="text-[18px]" />
                    </div>
                  </div>
                  <div className="mt-space-xs">
                    <span className={`font-heading-lg text-heading-lg font-bold ${kpi.valueClass}`}>{kpi.value}</span>
                    <span className={`block font-caption text-caption mt-0.5 ${kpi.noteClass}`}>{kpi.note}</span>
                  </div>
                  {kpi.bar ? (
                    <div className="mt-space-xs w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                      <div className={`${kpi.bar} h-full rounded-full`} style={{ width: kpi.barWidth }} />
                    </div>
                  ) : (
                    <div className="mt-space-xs text-caption text-text-tertiary">
                      <span>{kpi.footer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-heading-md text-heading-md text-text-primary font-bold">
                    Recent Transactions &amp; Orders Ledger
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Consolidated POS receipts, kitchen items, and claimed hyper-local promotions
                  </p>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-1 rounded bg-surface-subtle text-caption font-label-sm text-text-secondary">
                    Filter: All Records
                  </span>
                  <button
                    type="button"
                    className="text-primary hover:text-primary-container font-label-md text-label-md flex items-center gap-1 font-semibold"
                  >
                    <span>Export CSV</span>
                    <Icon name="download" className="text-[16px]" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-space-sm">
                {ledgerItems.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className={`${item.rowClass} transition-colors rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md`}
                  >
                    <div className="flex items-start gap-space-md min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${item.iconBox}`}
                      >
                        <Icon name={item.icon} className="text-[24px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-xs flex-wrap">
                          <span className="font-heading-sm text-heading-sm text-text-primary">{item.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${item.badgeClass}`}
                          >
                            {item.badge}
                          </span>
                          <span className="text-text-tertiary text-caption font-mono">{item.time}</span>
                        </div>
                        <p className="text-body-md font-body-md text-text-secondary mt-0.5 truncate">
                          {item.description}
                        </p>
                        <span className={`text-caption mt-1 ${item.metaClass}`}>{item.meta}</span>
                      </div>
                    </div>
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 pt-2 md:pt-0">
                      <span className={`font-heading-md text-heading-md font-bold ${item.amountClass}`}>
                        {item.amount}
                      </span>
                      <button
                        type="button"
                        className="text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-0.5 mt-1"
                        onClick={() => onNav(item.link.includes('Deal') ? 'deals' : 'orders')}
                      >
                        <span>{item.link}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-heading-md text-heading-md text-text-primary font-bold">
                    Comprehensive Loyalty Points Ledger
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Audit trail of points minted, converted, or redeemed via VEMTAP core
                  </p>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="text-caption font-caption text-text-secondary">Current Balance:</span>
                  <span className="px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold font-mono text-label-sm">
                    {v(d ? pointsLabel(d.pointsBalance) : '—', '2,450 pts')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {pointsEntries.map((entry, index) => (
                  <div
                    key={`${entry.title}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${entry.iconBox}`}
                      >
                        <Icon name={entry.op} className="text-[18px]" />
                      </div>
                      <div>
                        <span className="font-label-md text-label-md text-text-primary font-semibold block">
                          {entry.title}
                        </span>
                        <span className="font-caption text-caption text-text-tertiary">{entry.meta}</span>
                      </div>
                    </div>
                    <span className={`font-label-md text-label-md font-bold ${entry.deltaClass}`}>{entry.delta}</span>
                  </div>
                ))}
              </div>
              <div className="mt-space-xs p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary font-semibold">
                    Tier Progress Trajectory
                  </span>
                  <span className="text-caption text-text-tertiary">{v(
                    d ? nextTierLabel(d.pointsBalance) : '—',
                    'Only 550 pts until VIP Platinum Status',
                  )}</span>
                </div>
                <div className="w-36 h-8 shrink-0">
                  <svg className="w-full h-full overflow-visible text-primary" viewBox="0 0 144 32">
                    <polyline
                      fill="none"
                      points="4,28 32,22 64,26 96,14 128,8 140,4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                    <circle cx="140" cy="4" fill="currentColor" r="3.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 flex flex-col gap-space-lg min-w-0">
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-2xs text-text-primary">
                  <Icon name="lock" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm font-bold">Staff Notes &amp; Insights</h2>
                </div>
                <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-caption text-caption font-semibold">
                  Confidential
                </span>
              </div>
              <div className="text-caption text-text-tertiary italic">
                Visible to Front-of-House Host, Restaurant Manager &amp; Sommelier only.
              </div>
              <div className="bg-surface-tint-blue rounded-xl p-space-md flex flex-col gap-2">
                <div className="flex items-center justify-between text-caption font-semibold text-primary">
                  <span className="flex items-center gap-1">
                    <Icon name="push_pin" filled className="text-[15px]" />
                    VIP Preference Dossier
                  </span>
                  <span className="text-text-tertiary font-normal">
                    {v(d?.note?.updatedAt ? dayLabel(d.note.updatedAt) : '—', 'Sep 28')}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-primary leading-relaxed">
                  {live ? (
                    notes.length ? `“${notes.join(' · ')}”` : 'No staff notes yet.'
                  ) : (
                    <>
                      “Prefers quiet booth seating near patio. Medium-rare steak. Always orders red wine pairings. Wife’s
                      birthday on <strong className="text-primary">Nov 14</strong> — prepare complimentary champagne toast.”
                    </>
                  )}
                </p>
                <div className="pt-2 text-caption text-text-secondary flex items-center justify-between">
                  <span>Logged by: {v(d?.note?.updatedBy || '—', 'Head Sommelier (Tariq E.)')}</span>
                  <span className="text-badge-discount-text font-semibold flex items-center gap-1">
                    <Icon name="done_all" className="text-[14px]" /> {v('Saved', 'Verified')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-space-xs pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="privateNoteText">
                    Add Internal Note
                  </label>
                  <span className="text-caption text-text-tertiary">Shift handoff</span>
                </div>
                <textarea
                  id="privateNoteText"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter private dining preference, VIP guest notes or dietary observation..."
                  className="w-full rounded-xl bg-surface-subtle p-3 text-body-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-tertiary transition-all resize-none"
                />
                <button
                  type="button"
                  className="w-full h-11 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-button-secondary text-button-secondary transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  onClick={submitNote}
                >
                  <Icon name="add_circle" className="text-[18px]" />
                  <span>+ Add Private Staff Note</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-2xs text-text-primary">
                  <Icon name="restaurant" className="text-tertiary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm font-bold">Dietary &amp; Culinary Profile</h2>
                </div>
                <span className="text-caption text-badge-discount-text font-semibold bg-badge-discount-bg px-2 py-0.5 rounded-full">
                  {v('Staff tags', 'High Affinity')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dietaryTags.map((tag) => (
                  <span
                    key={tag.label}
                    className={`px-3 py-1 rounded-full font-caption text-caption font-semibold flex items-center gap-1 ${tag.className}`}
                  >
                    <Icon name={tag.icon} className={`text-[15px] ${tag.iconClass}`} />
                    {tag.label}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                  Frequent Favorite Selections
                </span>
                {favorites.map((fav) => (
                  <div key={fav.name} className="flex items-center gap-space-sm p-2 rounded-lg bg-surface-subtle">
                    {fav.image && (
                      <img
                        className="w-12 h-12 rounded-lg object-cover shrink-0 shadow-sm"
                        alt={fav.alt}
                        src={fav.image}
                      />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        {fav.name}
                      </span>
                      <span className="text-caption text-text-tertiary">{fav.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-2xs text-text-primary">
                  <Icon name="near_me" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm font-bold">Catchment &amp; Visit Rhythm</h2>
                </div>
                <span className="text-caption font-mono text-text-secondary">{v('Radius —', 'Radius 1.2km')}</span>
              </div>
              <div
                className="w-full h-36 bg-cover bg-center rounded-xl relative overflow-hidden shadow-inner flex flex-col justify-end p-space-sm"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCK4ZgqWoIyIJ5W7d9YqQs_mLPYYjfO5N2fShS-XLHcqU0HApCa6tVWKEpYOiTooHJ9v1sQDmG0OaaAAfdbMk9sjmZnBCK5btVftI_KppaosPZwSf67R7MwlJ24xQonGjvH66JDJ8EVTjcOL0OmH5BFAiA95rWqGi9hGg8_WeJK4Wq6SOvF1H34EjAOJUgFH-3B9m_AzeyfbtMQkOpaQvnO2Ib7sg_Gq0qSTGbMfePLF2GSpswWNR8YGg')",
                }}
              >
                <div className="bg-surface-canvas/90 backdrop-blur-md rounded-lg p-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon name="location_on" className="text-primary text-[18px]" />
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                      Living District: {v('—', 'Wuse II, Abuja')}
                    </span>
                  </div>
                  <span className="text-caption text-badge-discount-text font-bold shrink-0">{v('—', 'Within 1.2km')}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                  Predictable Visit Windows
                </span>
                {visitWindows.map((window_) => (
                  <div
                    key={window_.label}
                    className="flex items-center justify-between text-body-md bg-surface-subtle px-3 py-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={window_.icon} className={`text-[16px] ${window_.iconClass}`} />
                      <span className="font-label-sm text-label-sm text-text-primary">{window_.label}</span>
                    </div>
                    <span className="font-mono text-caption text-text-secondary font-semibold">{window_.time}</span>
                  </div>
                ))}
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-caption text-text-secondary font-medium">Return Probability (Next 7 Days)</span>
                  <span className="font-heading-sm text-heading-sm text-primary font-bold">{v('—', '88.4% Likelihood')}</span>
                </div>
                <Icon name="trending_up" className="text-primary text-[28px]" />
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-2xs text-text-primary">
                <Icon name="gavel" className="text-badge-discount-text text-[18px]" />
                <h3 className="font-label-md text-label-md font-bold">Compliance &amp; Privacy Assurance</h3>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Patron data is encrypted and archived under the <strong>Nigeria Data Protection Regulation (NDPR)</strong>{' '}
                standard. Explicit direct-marketing consent verified on registration.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-caption text-text-tertiary font-mono">
                <span>• Tokenized Identifiers</span>
                <span>• Right to Portability (Active)</span>
                <span>• Audit Trail Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md px-space-md py-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface font-label-md text-label-md shadow-xl whitespace-pre-line">
          {toast}
        </div>
      )}
    </EnterpriseShell>
  );
}
