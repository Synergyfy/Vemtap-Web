import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantPortalChrome } from './MerchantPortalChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { hasApiConfig } from '../../services/api/client';
import { useOfferGroup, useOfferGroupMutations, useOffers } from '../../hooks/business/useOffers';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';

interface DesktopDealLocationPricingScreenProps {
  /** Live: the deal group whose branches, prices and caps are edited. */
  dealGroupId?: string | null;
  onNav: (key: BusinessPortalNavKey) => void;
  onCancel?: () => void;
  onSave?: () => void;
}

interface Outlet {
  id: string;
  image: string;
  imageAlt: string;
  name: string;
  tags: ReactNode;
  address: string;
  meta: ReactNode;
  statusDot: string;
  grayscale?: boolean;
  panelClass: string;
  originalLabel: string;
  originalPrice: string;
  originalNote: string;
  dealPriceLabel: string;
  dealPrice: string;
  discountLabel: string;
  savings: string;
  quotaLabel: string;
  quotaValue: string;
  quotaNote: string;
  maintenanceNote?: string;
}

const OUTLETS: Outlet[] = [
  {
    id: 'wuse',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJvkpoAY78lVMkyqXExE8U5vzJYwlC3UTPCL3qaZE5AeryMwgPEo-8INWOVLz-kAFJIDOu7FB3FgWKHIHM7qdsq5XxNdeCvV1NhdwQQDXb4Pm3Em5z9wyXok3mdwrujuU7dz8r1nTkAiCcDEoek0T63gBbdGW51PAT30xdic2cYExTstcmfgtdV2yswUYofFm7b0qKx3QqusvmEsDQSC0CCZy0EREzJc6WcdaTO2JgE-6afIIiBxW87g',
    imageAlt:
      'Modern architectural view of the Wuse II flagship restaurant branch with clean minimalist glass windows, warm ambient interior lighting, welcoming streetfront facade in Abuja, Nigeria.',
    name: 'Wuse II Flagship Branch',
    tags: (
      <>
        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
          HQ Store
        </span>
        <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
          Participating
        </span>
      </>
    ),
    address: 'Plot 12 Ademola Adetokunbo Cres, Wuse II, Abuja',
    meta: (
      <>
        <span className="flex items-center gap-1">
          <Icon name="point_of_sale" className="text-[15px] text-primary" /> 4 Terminals Synced
        </span>
        <span className="flex items-center gap-1">
          <Icon name="speed" className="text-[15px] text-badge-discount-text" /> Latency: 42ms
        </span>
      </>
    ),
    statusDot: 'bg-badge-discount-text',
    panelClass:
      'bg-gradient-to-r from-surface-tint-blue/30 via-surface-canvas to-surface-canvas',
    originalLabel: 'Original Price (MSRP)',
    originalPrice: '₦12,000',
    originalNote: 'Global catalog baseline',
    dealPriceLabel: 'Deal Price (Override)',
    dealPrice: '9,600',
    discountLabel: '20.0% OFF',
    savings: 'Customer saves ₦2,400',
    quotaLabel: 'Daily Voucher Quota',
    quotaValue: '30',
    quotaNote: 'Resets nightly at 00:00 WAT',
  },
  {
    id: 'maitama',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAtdaXQ5VpO_SMdLOO2BMcGIqYMXuTwON3uOA8-ShJBzsV0bNk7vKeIrhb4hpTVH6UjeS2gNgOxVRijoTDCm7YW8xTk-UOSPnCb8JIGs-poGpDDplF2_w5wJEp9WLOge1BRErgboYB_8Oxhtcac_XMJ91kuXAZEREH7oV2cPOFOguDovmHuQ9QhaRleS3fvx4D0ZD6B1NacRyyL73TCFQcOk2gu44AhbSJ1HITdLamFlEDp3r7K9LgT1Q',
    imageAlt:
      'Upscale restaurant interior in Maitama, Abuja featuring rich teak tables, ambient warm ceiling downlights, lush indoor planters, and an elegant dining room atmosphere.',
    name: 'Maitama Heights Branch',
    tags: (
      <>
        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-caption text-caption font-semibold">
          Premium District
        </span>
        <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-caption text-caption font-medium flex items-center gap-1">
          <Icon name="price_change" className="text-[13px]" />
          Custom Branch Price
        </span>
      </>
    ),
    address: 'Plot 14 Amazon Street, Maitama, Abuja',
    meta: (
      <>
        <span className="flex items-center gap-1">
          <Icon name="point_of_sale" className="text-[15px] text-primary" /> 2 Terminals Synced
        </span>
        <span className="flex items-center gap-1">
          <Icon name="speed" className="text-[15px] text-badge-discount-text" /> Latency: 38ms
        </span>
      </>
    ),
    statusDot: 'bg-badge-discount-text',
    panelClass: 'bg-gradient-to-r from-surface-tint-blue/20 via-surface-canvas to-surface-canvas',
    originalLabel: 'Original Price (Local)',
    originalPrice: '₦13,000',
    originalNote: '+₦1,000 prime location delta',
    dealPriceLabel: 'Deal Price (Premium Tier)',
    dealPrice: '10,200',
    discountLabel: '21.5% OFF',
    savings: 'Customer saves ₦2,800',
    quotaLabel: 'Daily Voucher Quota',
    quotaValue: '20',
    quotaNote: 'Controlled supply allocation',
  },
  {
    id: 'garki',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCfCIcevNadHCiU3lJ8O4mryZYckEfqfy8ASal3Jd1gIl49lKHFJ5XHwWEhe9J0BudciFK4VugQqHolQoliIgvU-JZRrYxdG6LdCA79zIZ26aQN8mGiO_fd06CMbmtNA7XnuajjPp0x_V42V6o8XAVRxdGcr8A9_TnnVyWlgCxMJVKdWAoQJ_CGczE0QW7j7uPAHAwGGnG57XQdhl6V1rznddBwYfte9AFRs4BML9vhzE6zP59bvsL8-A',
    imageAlt:
      'Commercial arcade storefront in Garki Area 11 Abuja with signage, modern glass facade under daylight, clean pavement exterior.',
    name: 'Garki Area 11 Branch',
    tags: (
      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-semibold flex items-center gap-1">
        <Icon name="pause_circle" className="text-[13px]" />
        Paused / Excluded
      </span>
    ),
    address: 'Suite 4 Commercial Arcade, Garki Area 11, Abuja',
    meta: (
      <div className="flex items-center gap-2 p-space-xs bg-error-container/40 rounded-lg text-text-secondary font-caption text-caption">
        <Icon name="build" className="text-error text-[18px]" />
        <span>
          <strong>Maintenance Note:</strong> Kitchen maintenance until next Monday. Deal paused.
        </span>
      </div>
    ),
    statusDot: 'bg-outline',
    grayscale: true,
    panelClass: 'bg-surface-subtle opacity-85 hover:opacity-100 transition-opacity',
    originalLabel: 'Original Price (MSRP)',
    originalPrice: '₦12,000',
    originalNote: 'Global catalog baseline',
    dealPriceLabel: 'Deal Price (Override)',
    dealPrice: '9,600',
    discountLabel: '20.0% OFF',
    savings: 'Customer saves ₦2,400',
    quotaLabel: 'Daily Voucher Quota',
    quotaValue: '30',
    quotaNote: 'Resets nightly at 00:00 WAT',
    maintenanceNote:
      'Pricing matrix and quotas are inactive for this branch. Enabling will inherit MSRP (₦12,000 / ₦9,600).',
  },
];

interface AuditEntry {
  dotClass: string;
  title: string;
  detail: string;
  time: string;
}

const AUDIT_LOG: AuditEntry[] = [
  {
    dotClass: 'bg-primary',
    title: 'Maitama branch price adjusted',
    detail: '₦10,500 updated to ₦10,200 by Musa D.',
    time: 'Today, 11:24 AM WAT',
  },
  {
    dotClass: 'bg-error',
    title: 'Garki Area 11 participation paused',
    detail: 'Kitchen maintenance trigger applied.',
    time: 'Yesterday, 04:15 PM WAT',
  },
  {
    dotClass: 'bg-text-tertiary',
    title: 'Matrix created from Draft Deal',
    detail: 'Initial scope assigned to 3 outlets.',
    time: '18 Oct, 09:00 AM WAT',
  },
];

const LIVE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

const money = (value: number) => `₦${Math.round(value).toLocaleString('en-US')}`;
const digits = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;

/** One editable branch row of the live matrix. */
interface LiveRow {
  branchId: string;
  name: string;
  address: string;
  isMain: boolean;
  inDeal: boolean;
  included: boolean;
  price: string;
  quota: string;
  claims: number;
  redeemed: number;
}

export function DesktopDealLocationPricingScreen({
  dealGroupId,
  onNav,
  onCancel,
  onSave,
}: DesktopDealLocationPricingScreenProps) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  const [customPrices, setCustomPrices] = useState(true);
  const [included, setIncluded] = useState<Record<string, boolean>>({
    wuse: true,
    maitama: true,
    garki: false,
  });

  // Live: the deal's real branches, prices, caps and price history; demo keeps the samples.
  const live = hasApiConfig() && Boolean(dealGroupId);
  const offersQuery = useOffers();
  const group = useOfferGroup(live ? dealGroupId : null);
  const groupMutations = useOfferGroupMutations(live ? dealGroupId : null);
  const { branches } = useBusinessBranch();
  const offer = (offersQuery.data ?? []).find((entry) => (entry.dealGroupId ?? entry.id) === dealGroupId);
  const original = Number(offer?.originalPrice ?? 0);
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  };
  useEffect(() => {
    const pricing = group.pricing.data;
    if (!live || !pricing) return;
    const inDeal = new Map(pricing.branches.map((row) => [row.branchId, row]));
    setRows(
      branches
        .filter((branch) => branch.id)
        .map((branch) => {
          const row = inDeal.get(branch.id as string);
          return {
            branchId: branch.id as string,
            name: branch.name,
            address: branch.area || '—',
            isMain: branch.isMainBranch === true,
            inDeal: Boolean(row),
            included: row?.isActive ?? false,
            price: row ? String(Math.round(Number(row.calculatedPrice))) : '',
            quota: row?.quantity != null ? String(row.quantity) : '',
            claims: row?.claimedCount ?? 0,
            redeemed: row?.redeemedCount ?? 0,
          };
        }),
    );
  }, [live, group.pricing.data, branches]);
  const updateRow = (branchId: string, patch: Partial<LiveRow>) =>
    setRows((current) => current.map((row) => (row.branchId === branchId ? { ...row, ...patch } : row)));
  const includedRows = rows.filter((row) => (scope === 'all' ? true : row.included));
  const totalQuota = includedRows.reduce((sum, row) => sum + digits(row.quota), 0);
  const maxYield = includedRows.reduce((sum, row) => sum + digits(row.price) * digits(row.quota), 0);
  const QUOTA_COLORS = ['bg-primary', 'bg-tertiary-container', 'bg-secondary', 'bg-badge-discount-text'];

  /** The live rows in the outlet card shape. */
  const liveOutlets: Outlet[] = rows.map((row) => {
    const price = digits(row.price);
    const off = original && price && price < original ? ((original - price) / original) * 100 : 0;
    return {
      id: row.branchId,
      image: LIVE_IMAGE_PLACEHOLDER,
      imageAlt: row.name,
      name: row.name,
      tags: (
        <>
          {row.isMain && (
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
              Main Branch
            </span>
          )}
          {row.included && (
            <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
              Participating
            </span>
          )}
        </>
      ),
      address: row.address,
      meta: (
        <span className="flex items-center gap-1">
          <Icon name="confirmation_number" className="text-[15px] text-primary" /> {row.claims} claims • {row.redeemed} redeemed
        </span>
      ),
      statusDot: row.included ? 'bg-badge-discount-text' : 'bg-outline-variant',
      panelClass: 'bg-gradient-to-r from-surface-tint-blue/30 via-surface-canvas to-surface-canvas',
      originalLabel: 'Original Price (MSRP)',
      originalPrice: original ? money(original) : '—',
      originalNote: 'Catalogue price',
      dealPriceLabel: 'Deal Price (Override)',
      dealPrice: row.price,
      discountLabel: off ? `${off.toFixed(1)}% OFF` : '—',
      savings: off ? `Customer saves ${money(original - price)}` : '—',
      quotaLabel: 'Voucher Cap',
      quotaValue: row.quota,
      quotaNote: row.quota ? 'Vouchers for this branch' : 'No cap',
      maintenanceNote: row.inDeal
        ? 'Paused at this branch. Existing claims are kept.'
        : `Not in this deal yet. Enabling adds it at ${original ? money(original) : 'the catalogue price'}.`,
    };
  });
  const outlets = live ? liveOutlets : OUTLETS;
  const isIncluded = (id: string) => (live ? rows.find((row) => row.branchId === id)?.included ?? false : included[id]);

  const toggleIncluded = (id: string) => {
    if (live) {
      const row = rows.find((entry) => entry.branchId === id);
      if (row) updateRow(id, { included: !row.included });
      return;
    }
    setIncluded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /** Live: one PUT with every branch's on/off state, price and voucher cap. */
  const saveLive = () => {
    const percentage = offer?.pricingType === 'percentage_discount';
    const uniform = rows.find((row) => row.included)?.price ?? '';
    groupMutations.setPricing.mutate(
      {
        branches: rows
          .filter((row) => row.inDeal || row.included || scope === 'all')
          .map((row) => {
            const isActive = scope === 'all' ? true : row.included;
            const price = digits(customPrices ? row.price : uniform);
            const quota = digits(row.quota);
            const base = { branchId: row.branchId, isActive, ...(quota ? { quantity: quota } : {}) };
            if (!price) return base;
            return percentage && original
              ? { ...base, discountValue: Math.max(0, Math.round(((original - price) / original) * 1000) / 10) }
              : { ...base, fixedPrice: price };
          }),
      },
      {
        onSuccess: () => {
          showToast('Branch pricing saved.');
          onSave?.();
        },
        onError: (error) => showToast(planErrorMessage(error) ?? apiErrorMessage(error, 'Could not save the branch pricing.')),
      },
    );
  };

  const auditLog: AuditEntry[] = live
    ? (group.history.data ?? []).map((change) => ({
        dotClass: Number(change.newPrice) < Number(change.oldPrice) ? 'bg-badge-discount-text' : 'bg-primary',
        title: `${change.branchName ?? 'Branch'} price adjusted`,
        detail: `${money(Number(change.oldPrice))} updated to ${money(Number(change.newPrice))}`,
        time: new Date(change.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      }))
    : AUDIT_LOG;

  return (
    <MerchantPortalChrome activeNav="business-deals" onNav={onNav}>
      {/* Deal Context & Breadcrumb Bar */}
      <section className="w-full bg-surface-canvas shadow-[0_1px_3px_rgba(0,0,0,0.03)] py-space-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1 min-w-0">
            <nav className="flex items-center gap-space-xs text-caption font-caption text-text-tertiary flex-wrap">
              <button
                type="button"
                onClick={() => onNav('deals')}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Icon name="local_offer" className="text-[15px]" />
                <span>Deals &amp; Promotions</span>
              </button>
              <Icon name="chevron_right" className="text-[13px] text-text-tertiary" />
              <span className="text-text-secondary truncate max-w-[200px] sm:max-w-none">
                {live ? offer?.name ?? 'Deal' : 'Weekend Prime Lunch Combo'}
              </span>
              <Icon name="chevron_right" className="text-[13px] text-text-tertiary" />
              <span className="text-primary font-medium">Location Assignment &amp; Pricing</span>
            </nav>
            <div className="flex items-center gap-space-sm flex-wrap mt-1">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Deal Location Assignment &amp; Branch Pricing Matrix
              </h1>
              <div className="flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-medium">
                  {live
                    ? `${offer?.status === 'active' ? 'Live Deal' : 'Paused Deal'} • Ref #${(dealGroupId ?? '').slice(0, 8).toUpperCase()}`
                    : 'Draft Deal • Ref #VT-48F261'}
                </span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary">
              Manage branch-level availability, price overrides, and voucher caps for{' '}
              {live ? offer?.name ?? 'this deal' : 'Weekend Prime Lunch Combo'}.
            </p>
          </div>
          <div className="flex items-center gap-space-md self-start md:self-auto bg-surface-subtle p-space-sm rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="sync_saved_locally" className="text-[22px]" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-text-primary font-semibold">Sync Active</span>
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              </div>
              <span className="font-caption text-caption text-text-secondary">
                {live
                  ? `${rows.filter((row) => row.included).length} of ${rows.length} branches participating`
                  : '2 of 3 branches participating'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Grid */}
      <div className="w-full py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          {/* Left/Center Column */}
          <div className="lg:col-span-8 flex flex-col gap-space-xl">
            {/* Scope Configuration Card */}
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
              <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-label-md text-label-md font-semibold">
                    1
                  </span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Scope Configuration</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">Step 1 of 2</span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                Specify how store branches subscribe to this deal offer and whether price overrides apply across
                disparate zones.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-md">
                <label
                  className={`relative flex flex-col p-space-md rounded-xl cursor-pointer transition-all shadow-sm ${
                    scope === 'selected' ? 'bg-surface-tint-blue' : 'bg-surface-subtle hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    className="sr-only peer"
                    name="deal_scope"
                    type="radio"
                    value="selected"
                    checked={scope === 'selected'}
                    onChange={() => setScope('selected')}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      {scope === 'selected' ? (
                        <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary">
                          <Icon name="check" className="text-[14px]" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-surface-variant flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-surface-canvas opacity-0" />
                        </span>
                      )}
                      <span className="font-label-md text-label-md text-text-primary font-semibold">Selected locations</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-medium">
                      Custom Matrix
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-space-xs pl-7">
                    Branch-by-branch activation. Tailor pricing tiers and voucher caps to localized neighborhood rent
                    &amp; demand.
                  </p>
                </label>

                <label
                  className={`relative flex flex-col p-space-md rounded-xl cursor-pointer transition-all ${
                    scope === 'all' ? 'bg-surface-tint-blue shadow-sm' : 'bg-surface-subtle hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    className="sr-only peer"
                    name="deal_scope"
                    type="radio"
                    value="all"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      {scope === 'all' ? (
                        <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary">
                          <Icon name="check" className="text-[14px]" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-surface-variant flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-surface-canvas opacity-0" />
                        </span>
                      )}
                      <span className="font-label-md text-label-md text-text-primary font-medium">
                        {live ? `All locations (${rows.length} ${rows.length === 1 ? 'Branch' : 'Branches'})` : 'All locations (3 Branches)'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-variant text-text-secondary font-caption text-caption">
                      Uniform
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-space-xs pl-7">
                    Uniform pricing across all retail locations. Global stock limit and unified marketing banner.
                  </p>
                </label>
              </div>

              {/* Price Customization Switch */}
              <div className="mt-space-lg p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div className="flex items-start gap-space-sm min-w-0">
                  <Icon name="payments" className="text-primary text-[22px] mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Use different price for selected locations
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-0.5">
                      Allow each branch to set custom deal pricing or discounts based on operating costs or prime
                      district rent.
                    </span>
                  </div>
                </div>
                <button
                  aria-checked={customPrices}
                  role="switch"
                  type="button"
                  onClick={() => setCustomPrices((prev) => !prev)}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    customPrices ? 'bg-primary-container' : 'bg-surface-variant'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-on-primary shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                      customPrices ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    <Icon name="check" className="text-primary text-[14px]" />
                  </span>
                </button>
              </div>
            </div>

            {/* Branch Pricing Matrix */}
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-label-md text-label-md font-semibold">
                    2
                  </span>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Branch Pricing Matrix</h2>
                    <p className="font-caption text-caption text-text-secondary">
                      3 registered physical outlets detected in Abuja territory
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button
                    type="button"
                    className="px-space-sm py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-low text-text-secondary font-caption text-caption flex items-center gap-1 transition-colors"
                  >
                    <Icon name="tune" className="text-[16px]" />
                    <span>Reset to MSRP</span>
                  </button>
                </div>
              </div>

              {outlets.map((outlet) => {
                const active = isIncluded(outlet.id);
                return (
                  <div
                    key={outlet.id}
                    className={`rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${
                      outlet.id === 'garki' ? outlet.panelClass : `bg-surface-canvas ${outlet.panelClass}`
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-md">
                      <div className="flex items-start gap-space-md">
                        <div
                          className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-high shadow-sm ${
                            outlet.grayscale ? 'grayscale' : ''
                          }`}
                        >
                          <img className="w-full h-full object-cover" alt={outlet.imageAlt} src={outlet.image} />
                          <span
                            className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-surface-canvas ${outlet.statusDot}`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-xs flex-wrap">
                            <h3 className="font-label-md text-label-md font-bold text-text-primary">{outlet.name}</h3>
                            {outlet.tags}
                          </div>
                          <span className="font-caption text-caption text-text-secondary mt-0.5 flex items-center gap-1">
                            <Icon name="pin_drop" className="text-[14px] text-text-tertiary" />
                            {outlet.address}
                          </span>
                          <div className="flex items-center gap-space-md mt-space-sm font-caption text-caption text-text-secondary flex-wrap">
                            {outlet.meta}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-xs self-start">
                        <label className="flex items-center gap-2 cursor-pointer font-caption text-caption text-text-secondary">
                          <span>Include in Deal</span>
                          <input
                            className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleIncluded(outlet.id)}
                          />
                        </label>
                      </div>
                    </div>

                    {active ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-lg pt-space-md bg-surface-subtle p-space-md rounded-xl">
                        <div className="flex flex-col">
                          <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-medium">
                            {outlet.originalLabel}
                          </span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                              {outlet.originalPrice}
                            </span>
                            <span className="font-caption text-caption text-text-tertiary">NGN</span>
                          </div>
                          <span className="font-caption text-caption text-text-secondary mt-1">{outlet.originalNote}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-caption text-caption text-text-primary font-medium flex items-center justify-between">
                            <span>{outlet.dealPriceLabel}</span>
                            <span className="font-caption text-caption text-badge-discount-text font-bold">
                              {outlet.discountLabel}
                            </span>
                          </span>
                          <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-label-md text-text-tertiary">
                              ₦
                            </span>
                            <input
                              className="w-full h-11 pl-8 pr-3 bg-surface-canvas rounded-xl font-label-md text-label-md text-text-primary font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              type="text"
                              {...(live
                                ? { value: outlet.dealPrice, onChange: (event: React.ChangeEvent<HTMLInputElement>) => updateRow(outlet.id, { price: event.target.value.replace(/[^\d]/g, '') }) }
                                : { defaultValue: outlet.dealPrice })}
                            />
                          </div>
                          <span className="font-caption text-caption text-badge-discount-text mt-1 font-medium">
                            {outlet.savings}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-caption text-caption text-text-primary font-medium flex items-center justify-between">
                            <span>{outlet.quotaLabel}</span>
                            <span className="font-caption text-caption text-primary font-medium">
                              {live
                                ? totalQuota && digits(outlet.quotaValue)
                                  ? `${Math.round((digits(outlet.quotaValue) / totalQuota) * 100)}% of total`
                                  : '—'
                                : outlet.id === 'wuse'
                                  ? '60% of total'
                                  : '40% of total'}
                            </span>
                          </span>
                          <div className="relative mt-1">
                            <input
                              className="w-full h-11 px-3 bg-surface-canvas rounded-xl font-label-md text-label-md text-text-primary font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              type="number"
                              {...(live
                                ? { value: outlet.quotaValue, onChange: (event: React.ChangeEvent<HTMLInputElement>) => updateRow(outlet.id, { quota: event.target.value }) }
                                : { defaultValue: outlet.quotaValue })}
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none font-caption text-caption text-text-tertiary">
                              {live ? 'vouchers' : 'vouchers/day'}
                            </span>
                          </div>
                          <span className="font-caption text-caption text-text-secondary mt-1">{outlet.quotaNote}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-space-md p-space-md rounded-xl bg-surface-container-lowest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs">
                        <span className="font-caption text-caption text-text-tertiary italic">
                          {outlet.maintenanceNote ??
                            'Pricing matrix and quotas are inactive for this branch. Enabling will inherit MSRP (₦12,000 / ₦9,600).'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleIncluded(outlet.id)}
                          className="px-space-sm py-1 rounded-lg bg-surface-subtle text-primary font-caption text-caption font-semibold hover:bg-surface-container-low transition-colors"
                        >
                          Enable Branch
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-space-xl">
            {/* POS Real-time Sync Explainer Card */}
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden">
              <div className="flex items-center justify-between pb-space-sm">
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                  Infrastructure Sync
                </span>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                  100% Online
                </span>
              </div>
              <div className="flex items-center gap-space-sm mt-space-xs">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <Icon name="contactless" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary leading-tight">
                    Catalog Continuity &amp; POS Sync
                  </h3>
                  <p className="font-caption text-caption text-text-secondary">Instant edge terminal updates</p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary mt-space-md">
                Upon saving, location overrides propagate instantaneously across all physical in-store{' '}
                <strong>VEMTAP Smart NFC POS terminals</strong>. Customers tapping to redeem will be charged the exact
                localized pricing tier configured here.
              </p>
              <div className="mt-space-md p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-sm">
                {live ? (
                  includedRows.map((row, index) => (
                    <div key={row.branchId} className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between font-caption text-caption">
                        <span className="text-text-secondary flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                          {row.name}
                        </span>
                        <span className="font-semibold text-text-primary">{digits(row.price) ? `${money(digits(row.price))} Synced` : '—'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className={`h-full rounded-full w-full ${QUOTA_COLORS[index % QUOTA_COLORS.length]}`} />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                <div className="flex items-center justify-between font-caption text-caption">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    Wuse II (4 Terminals)
                  </span>
                  <span className="font-semibold text-text-primary">₦9,600 Synced</span>
                </div>
                <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-full" />
                </div>
                <div className="flex items-center justify-between font-caption text-caption mt-1">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    Maitama (2 Terminals)
                  </span>
                  <span className="font-semibold text-text-primary">₦10,200 Synced</span>
                </div>
                <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-container rounded-full w-full" />
                </div>
                  </>
                )}
              </div>
            </div>

            {/* Quota Allocation Breakdown Card */}
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Daily Quota Capacity</h3>
                <span className="font-label-md text-label-md text-primary font-bold">
                  {live ? (totalQuota ? `${totalQuota} Vouchers` : 'No cap') : '50 Vouchers / Day'}
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary">
                Aggregate redemption volume cap across all active branches to maintain kitchen operational buffer.
              </p>
              <div className="flex flex-col gap-1.5 mt-space-xs">
                <div className="h-4 w-full bg-surface-variant rounded-full overflow-hidden flex shadow-inner">
                  {live ? (
                    includedRows.map((row, index) => (
                      <div
                        key={row.branchId}
                        className={`${QUOTA_COLORS[index % QUOTA_COLORS.length]} h-full transition-all duration-500`}
                        style={{ width: totalQuota ? `${(digits(row.quota) / totalQuota) * 100}%` : '0%' }}
                        title={`${row.name} (${digits(row.quota)} vouchers)`}
                      />
                    ))
                  ) : (
                    <>
                      <div className="bg-primary h-full transition-all duration-500" style={{ width: '60%' }} title="Wuse II (30 Vouchers - 60%)" />
                      <div className="bg-tertiary-container h-full transition-all duration-500" style={{ width: '40%' }} title="Maitama Heights (20 Vouchers - 40%)" />
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-secondary pt-1">
                  {live ? (
                    includedRows.map((row, index) => (
                      <div key={row.branchId} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${QUOTA_COLORS[index % QUOTA_COLORS.length]}`} />
                        <span>
                          {row.name} ({digits(row.quota) || '—'}
                          {totalQuota && digits(row.quota) ? ` / ${Math.round((digits(row.quota) / totalQuota) * 100)}%` : ''})
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span>Wuse II (30 / 60%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container" />
                        <span>Maitama (20 / 40%)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary uppercase">Max Daily Promotion Yield</span>
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold mt-0.5">
                  {live ? (maxYield ? money(maxYield) : '—') : '₦492,000'}
                </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-surface-canvas text-primary flex items-center justify-center shadow-sm">
                  <Icon name="trending_up" className="text-[20px]" />
                </div>
              </div>
            </div>

            {/* Audit Log & Change History */}
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
              <div className="flex items-center justify-between pb-space-sm">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Matrix Audit Log</h3>
                <Icon name="history" className="text-text-tertiary text-[18px]" />
              </div>
              <div className="flex flex-col gap-space-md mt-space-sm relative">
                {live && auditLog.length === 0 && (
                  <span className="font-caption text-caption text-text-tertiary">No price changes yet.</span>
                )}
                {auditLog.map((entry, index) => (
                  <div key={`${entry.title}-${index}`} className="flex items-start gap-space-sm">
                    <div className={`w-2 h-2 rounded-full ${entry.dotClass} mt-1.5 flex-shrink-0`} />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-primary font-medium">{entry.title}</span>
                      <span className="font-caption text-caption text-text-secondary">{entry.detail}</span>
                      <span className="font-caption text-caption text-text-tertiary mt-0.5">{entry.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating/Sticky Action Bar */}
      <div className="w-full bg-surface-canvas/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] py-space-md mt-space-xl sticky bottom-0 z-40">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm text-text-secondary font-caption text-caption text-center sm:text-left">
            <Icon name="info" className="text-primary text-[20px]" />
            <span>
              {live ? (
                <>Changes apply to every branch of this deal as soon as you save.</>
              ) : (
                <>
                  Changes will deploy instantly across <strong>6 connected POS terminals</strong> upon confirmation.
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-space-lg h-[52px] rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              Cancel Changes
            </button>
            <button
              type="button"
              onClick={live ? saveLive : onSave}
              className="w-full sm:w-auto px-space-xl h-[52px] rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Save Location Assignment &amp; Pricing</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </MerchantPortalChrome>
  );
}
