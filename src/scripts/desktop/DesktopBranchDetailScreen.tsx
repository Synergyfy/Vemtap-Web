import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { downloadCsv } from '../../utils/exportCsv';
import { printKvTable, printReport } from '../../utils/printReport';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { useBranchMutations, useBranches } from '../../hooks/business/useBranchesAndTeam';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { catalogueItemsService } from '../../services/catalogueItemsService';
import { offersService } from '../../services/offersService';
import { posService } from '../../services/posService';
import { apiErrorMessage } from '../../services/errorMessages';
import { branchAddressLabel, branchOpenLabel } from '../branchLive';
import { isLowStock } from '../catalogueLive';

interface DesktopBranchDetailScreenProps {
  /** Live: the branch to show; defaults to the active branch. */
  branchId?: string | null;
  onNav: (key: BusinessPortalNavKey) => void;
  onBackToLocations?: () => void;
}

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWyKF22R99b8Cr49s10vmf8kmNSEdUyaCTGpxF8Q2C_LPGD59iBxhNIc3LiUeEJrJcylAsnpvQ7FyNswF5S0Ws1I1av1LvsCQ9xGTtfB4Gn8dIW1i-ZLtjjKB-T4offZf3dKg0yuZWSiT9BrxY_79BuYWGXmpfdjE1mXnTM_T6dmcxEMQNQhYJ7izIiqecoefRIi--GTTsiQvXfFoqVatV57ot5QapInFAypIOx1rR06t6mKOdUtIatg';

const INVENTORY_METRICS = [
  {
    label: 'Products Assigned',
    labelIcon: 'category',
    labelIconClass: 'text-primary',
    value: '42',
    valueNote: '+4 this week',
    valueNoteClass: 'text-badge-discount-text',
    sub: '₦1,840,000 floor value',
    footerLeft: '96.2% in-stock health',
    footerRight: '2 low-stock alerts',
    footerRightClass: 'text-on-surface',
  },
  {
    label: 'Services & Stations',
    labelIcon: 'spa',
    labelIconClass: 'text-secondary',
    value: '8',
    valueNote: 'Active Menus',
    valueNoteClass: 'text-on-surface-variant',
    sub: '4 treatment bays occupied',
    footerLeft: 'Average dwell: 45 min',
    footerRight: '100% capacity',
    footerRightClass: 'text-badge-discount-text',
  },
  {
    label: 'Tap Promotions',
    labelIcon: 'local_offer',
    labelIconClass: 'text-tertiary-container',
    value: '5',
    valueNote: 'Active Flash Deals',
    valueNoteClass: 'text-tertiary',
    sub: '218 redemptions today',
    footerLeft: '₦320k deal turnover',
    footerRight: '12.4% conv. rate',
    footerRightClass: 'text-primary',
  },
];

const POS_UNITS = [
  { name: 'POS Terminal 01', icon: 'point_of_sale' },
  { name: 'POS Terminal 02', icon: 'point_of_sale' },
  { name: 'POS Terminal 03', icon: 'point_of_sale' },
  { name: 'Bar Tap Station', icon: 'contactless' },
];

const DOSSIER_ROWS: Array<{ label: string; value: string; valueClass?: string; mono?: boolean; icon?: string }> = [
  { label: 'Municipal Jurisdiction', value: 'Abuja Municipal (AMAC)' },
  { label: 'Zoning Code', value: 'Wuse II Commercial Zone' },
  { label: 'Direct Hotline', value: '+234 803 219 8831', valueClass: 'text-primary', mono: true },
  { label: 'State Compliance', value: 'FCT Permit Verified', valueClass: 'text-badge-discount-text', icon: 'check_circle' },
  { label: 'Tax ID / TIN', value: '10984429-0001', mono: true },
];

export function DesktopBranchDetailScreen({
  branchId, onNav, onBackToLocations }: DesktopBranchDetailScreenProps) {
  // Live: the branch's real record, catalogue, deals and tills; demo keeps the sample branch.
  const live = hasApiConfig();
  const { activeBranchId, switchTo } = useBusinessBranch();
  const branchesQuery = useBranches();
  const branch = (branchesQuery.data ?? []).find((entry) => entry.id === (branchId ?? activeBranchId));
  const id = branch?.id ?? '';
  const itemsQuery = useQuery({
    queryKey: ['catalogue-items', id, 'any'],
    queryFn: () => catalogueItemsService.list({ branchId: id, limit: 100 }),
    enabled: live && Boolean(id),
  });
  const offersQuery = useQuery({ queryKey: ['offers', 'list', id], queryFn: () => offersService.list(id), enabled: live && Boolean(id) });
  const tillsQuery = useQuery({ queryKey: ['pos', 'tills', id], queryFn: () => posService.tills(id), enabled: live && Boolean(id) });
  const { update } = useBranchMutations();
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };
  const items = itemsQuery.data ?? [];
  const products = items.filter((item) => item.itemType !== 'service');
  const services = items.filter((item) => item.itemType === 'service');
  const tracked = products.filter((item) => typeof item.stockQuantity === 'number');
  const inStock = tracked.filter((item) => (item.stockQuantity ?? 0) > 0).length;
  const floorValue = tracked.reduce((sum, item) => sum + Number(item.price ?? 0) * (item.stockQuantity ?? 0), 0);
  const activeDeals = (offersQuery.data ?? []).filter((offer) => offer.status === 'active');
  const dealClaims = activeDeals.reduce((sum, offer) => sum + (offer.claimedCount ?? 0), 0);
  const dealRedeemed = activeDeals.reduce((sum, offer) => sum + (offer.redeemedCount ?? 0), 0);
  const money = (value: number) => `₦${Math.round(value).toLocaleString('en-US')}`;
  const hours = (branch?.businessHours ?? {}) as Record<string, { open?: string; close?: string; closed?: boolean }>;
  const dayLabel = (day: string) => {
    const entry = hours[day];
    if (!entry) return '—';
    return entry.closed || !entry.open || !entry.close ? 'Closed' : `${entry.open} – ${entry.close}`;
  };
  const initials = (branch?.managerName ?? '').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '—';
  const lat = Number(branch?.latitude);
  const lng = Number(branch?.longitude);
  const hasGps = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
  const paused = branch?.isActive === false;
  const metrics = live
    ? [
        {
          ...INVENTORY_METRICS[0],
          value: String(products.length),
          valueNote: 'Products',
          sub: tracked.length ? `${money(floorValue)} floor value` : 'Stock not tracked',
          footerLeft: tracked.length ? `${Math.round((inStock / tracked.length) * 100)}% in-stock health` : '—',
          footerRight: `${products.filter(isLowStock).length} low-stock alerts`,
        },
        { ...INVENTORY_METRICS[1], value: String(services.length), valueNote: 'Services', sub: `${services.filter((item) => item.isBookable).length} bookable online`, footerLeft: '—', footerRight: '—' },
        {
          ...INVENTORY_METRICS[2],
          value: String(activeDeals.length),
          valueNote: 'Active Deals',
          sub: `${dealRedeemed} redemptions`,
          footerLeft: `${dealClaims} claims`,
          footerRight: dealClaims ? `${Math.round((dealRedeemed / dealClaims) * 100)}% redeemed` : '—',
        },
      ]
    : INVENTORY_METRICS;
  const posUnits = live
    ? (tillsQuery.data ?? []).map((till) => ({ name: till.name, icon: 'point_of_sale', status: till.status }))
    : POS_UNITS.map((unit) => ({ ...unit, status: 'active' as const }));
  const dossier = live
    ? [
        { label: 'District', value: branch?.district || '—' },
        { label: 'Zoning Code', value: '—' },
        { label: 'Direct Hotline', value: branch?.phone || '—', valueClass: 'text-primary', mono: true },
        { label: 'State Compliance', value: '—' },
        { label: 'Tax ID / TIN', value: '—', mono: true },
      ]
    : DOSSIER_ROWS;
  const setActive = (isActive: boolean) => {
    if (!branch) return;
    update.mutate(
      { id: branch.id, input: { isActive } },
      {
        onSuccess: () => showToast(isActive ? `${branch.name} is active again.` : `${branch.name} is paused.`),
        onError: (error) => showToast(apiErrorMessage(error, 'Could not update this branch.')),
      },
    );
  };
  const v = <T,>(liveValue: T, demoValue: T) => (live ? liveValue : demoValue);
  return (
    <MerchantShell activeNav="business-locations" onNav={onNav}>
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption pb-space-sm">
        <button
          type="button"
          onClick={() => onNav('overview')}
          className="hover:text-primary transition-colors flex items-center gap-space-2xs"
        >
          <Icon name="storefront" className="text-[16px]" />
          <span>Business Hub</span>
        </button>
        <Icon name="chevron_right" className="text-[14px]" />
        <button
          type="button"
          onClick={onBackToLocations}
          className="hover:text-primary transition-colors"
        >
          Locations & Branches
        </button>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface font-label-sm text-label-sm font-semibold">{v(branch?.name ?? 'Branch', 'Wuse Branch #01 (Flagship)')}</span>
      </div>

      {/* Top Hero Banner & Command Strip */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low shadow-sm p-space-lg mb-space-lg">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                onClick={onBackToLocations}
                className="inline-flex items-center gap-space-2xs text-primary font-label-md text-label-md font-semibold hover:text-on-primary-fixed-variant transition-colors"
              >
                <Icon name="arrow_back" className="text-[18px]" />
                <span>Back to Locations</span>
              </button>
              <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                {v(`${paused ? 'Paused' : 'Active'}${branch?.isMainBranch ? ' • Main Branch' : ''}`, 'Active Terminal • Primary Hub')}
              </span>
              <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-secondary font-caption text-caption font-medium">
                {v(`Code: ${branch?.uniqueCode ?? '—'}`, 'Node ID: #WSE-01-ABJ')}
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              {v(`${branch?.name ?? 'Branch'} — Details & Operations`, 'Wuse Branch #01 — Flagship Details & Operations')}
            </h1>
            <p className="font-body-md text-body-md text-text-secondary flex items-center gap-space-xs">
              <Icon name="pin_drop" className="text-primary text-[18px]" />
              {v(branch ? branchAddressLabel(branch) : '—', 'Adetokunbo Ademola Corridor, Wuse II • Synced to Abuja Regional Gateway')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              type="button"
              onClick={live && branch ? () => switchTo(branch.id) : undefined}
              className="px-space-md py-space-xs rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-button-primary text-button-primary shadow-sm hover:shadow transition-all flex items-center gap-space-2xs"
            >
              <Icon name="sync_alt" className="text-[18px]" />
              <span>Switch to this Operating View</span>
            </button>
            <button
              type="button"
              className="px-space-md py-space-xs rounded-xl bg-surface-canvas hover:bg-surface-container-high text-on-surface font-button-secondary text-button-secondary shadow-sm transition-colors flex items-center gap-space-2xs"
            >
              <Icon name="edit" className="text-[18px]" />
              <span>Edit Branch Details</span>
            </button>
            <button
              type="button"
              onClick={live ? () => setActive(paused) : undefined}
              className="px-space-md py-space-xs rounded-xl bg-error-container hover:bg-error/20 text-on-error-container font-button-secondary text-button-secondary transition-colors flex items-center gap-space-2xs"
            >
              <Icon name="power_settings_new" className="text-[18px]" />
              <span>{v(paused ? 'Reactivate Location' : 'Deactivate Location', 'Deactivate Location')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Desktop Grid (8 cols left / 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Section 1: Branch Overview & Identification */}
          <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="domain" className="text-[22px]" />
                </div>
                <div>
                  <h2 className="font-heading-md text-heading-md font-semibold text-on-surface">
                    Branch Overview & Identification
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Physical presence, manager on-duty, and geo-fence perimeter
                  </p>
                </div>
              </div>
              <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                {v(branch?.isMainBranch ? 'Main Branch' : 'Branch', 'Tier-1 Flagship')}
              </span>
            </div>

            {/* Address & Manager Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between">
                <div>
                  <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                    Physical Location
                  </span>
                  <p className="font-label-md text-label-md font-semibold text-on-surface mt-space-2xs">
                    {v(branch?.address || '—', 'Plot 12 Adetokunbo Ademola Crescent')}
                  </p>
                  <p className="font-body-md text-body-md text-text-secondary">
                    {v([branch?.city, branch?.state].filter(Boolean).join(', ') || '—', 'Wuse II, Abuja 900288, Federal Capital Territory')}
                  </p>
                </div>
                <div className="flex items-center gap-space-xs mt-space-md pt-space-xs">
                  <Icon name="near_me" className="text-primary text-[18px]" />
                  <span className="font-caption text-caption text-on-surface-variant">
                    {v(branch?.district || '—', 'Access via AP Plaza Roundabout')}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                      Manager in Charge
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                      {v(branch?.managerName ? 'Branch Lead' : 'Not set', 'Active On-Duty')}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm mt-space-xs">
                    <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-label-md shadow-sm">
                      {v(initials, 'JP')}
                    </div>
                    <div>
                      <h3 className="font-label-md text-label-md font-bold text-on-surface leading-tight">{v(branch?.managerName || '—', 'John Peter')}</h3>
                      <p className="font-caption text-caption text-text-secondary">
                        {v(branch?.managerEmail || '—', 'Operations Director & Store Lead')}
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface font-medium mt-0.5">
                        {v(branch?.managerPhone || '—', '+234 803 219 8831')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs mt-space-md">
                  <a
                    className="flex-1 py-space-2xs px-space-xs rounded-lg bg-surface-canvas hover:bg-surface-container-high text-primary font-button-secondary text-button-secondary text-center shadow-sm transition-colors flex items-center justify-center gap-1"
                    href={v(branch?.managerPhone ? `tel:${branch.managerPhone.replace(/\s+/g, '')}` : undefined, 'tel:+2348032198831')}
                  >
                    <Icon name="call" className="text-[16px]" />
                    <span>Direct Call</span>
                  </a>
                  <button
                    type="button"
                    title="Send internal message"
                    className="px-space-xs py-space-2xs rounded-lg bg-surface-canvas hover:bg-surface-container-high text-on-surface-variant font-button-secondary text-button-secondary shadow-sm transition-colors flex items-center gap-1"
                  >
                    <Icon name="chat" className="text-[16px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Map & Coordinates View */}
            <div className="relative rounded-xl overflow-hidden shadow-sm bg-surface-container">
              <div
                className="w-full h-80 bg-cover bg-center"
                data-location="Plot 12 Adetokunbo Ademola Crescent, Wuse II, Abuja, Nigeria"
                style={{ backgroundImage: `url('${MAP_IMAGE}')` }}
              />
              <div className="absolute inset-x-space-md top-space-md flex flex-wrap items-center justify-between gap-space-xs pointer-events-none">
                <div className="pointer-events-auto bg-surface-canvas/95 backdrop-blur-md px-space-sm py-space-xs rounded-xl shadow-md flex items-center gap-space-xs">
                  <Icon name="explore" className="text-primary text-[20px]" />
                  <div>
                    <p className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                      GPS Benchmark
                    </p>
                    <p className="font-label-sm text-label-sm font-semibold text-on-surface font-mono">
                      {v(hasGps ? `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E` : '—', '9.0765° N, 7.4735° E')}
                    </p>
                  </div>
                </div>
                <div className="pointer-events-auto bg-surface-canvas/95 backdrop-blur-md px-space-sm py-space-xs rounded-xl shadow-md flex items-center gap-space-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-ping" />
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                    {v('—', '300m Geofence Active')}
                  </span>
                </div>
              </div>
              <div className="absolute inset-x-space-md bottom-space-md bg-inverse-surface/90 backdrop-blur-md rounded-xl p-space-sm flex items-center justify-between text-inverse-on-surface">
                <div className="flex items-center gap-space-xs">
                  <Icon name="radar" className="text-primary-fixed text-[20px]" />
                  <div>
                    <p className="font-label-sm text-label-sm font-semibold text-white">Continuous Tap Radar</p>
                    <p className="font-caption text-caption text-inverse-on-surface/80">
                      {v('Customers near this branch see its deals in discovery', 'Broadcasting offers to VEMTAP mobile passes in 300m perimeter')}
                    </p>
                  </div>
                </div>
                <a
                  className="px-space-sm py-space-2xs rounded-lg bg-primary-container text-on-primary font-button-secondary text-button-secondary hover:bg-primary transition-all flex items-center gap-1 shadow-sm"
                  href={v(
                    hasGps ? `https://maps.google.com/?q=${lat},${lng}` : `https://maps.google.com/?q=${encodeURIComponent(branch ? branchAddressLabel(branch) : '')}`,
                    'https://maps.google.com/?q=9.0765,7.4735',
                  )}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon name="directions" className="text-[16px]" />
                  <span>Open Directions</span>
                </a>
              </div>
            </div>
          </div>

          {/* Section 2: Operating Hours & Shift Schedule */}
          <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                  <Icon name="schedule" className="text-[22px]" />
                </div>
                <div>
                  <h2 className="font-heading-md text-heading-md font-semibold text-on-surface">
                    Operating Hours & Shift Schedule
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Standard customer trading and checkout acceptance windows
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 font-label-sm text-label-sm text-badge-discount-text font-semibold">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                {v(branch ? (paused ? 'Paused' : branchOpenLabel(branch)) : '—', 'Currently Open (Closing in 4 hrs)')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between">
                <div className="flex items-center justify-between pb-space-xs">
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                    {v('Monday', 'Monday – Saturday')}
                  </span>
                  <Icon name="wb_sunny" className="text-primary text-[18px]" />
                </div>
                <div className="my-space-xs">
                  <p className="font-heading-sm text-heading-sm font-bold text-on-surface">{v(dayLabel('monday'), '9:00 AM – 10:00 PM')}</p>
                  <p className="font-caption text-caption text-text-secondary">West Africa Time (WAT)</p>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-space-2xs">
                  <div className="bg-primary h-full rounded-full w-3/4" />
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between">
                <div className="flex items-center justify-between pb-space-xs">
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface">{v('Sunday', 'Sunday Trading')}</span>
                  <Icon name="bedtime" className="text-secondary text-[18px]" />
                </div>
                <div className="my-space-xs">
                  <p className="font-heading-sm text-heading-sm font-bold text-on-surface">{v(dayLabel('sunday'), '12:00 PM – 9:00 PM')}</p>
                  <p className="font-caption text-caption text-text-secondary">West Africa Time (WAT)</p>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-space-2xs">
                  <div className="bg-secondary h-full rounded-full w-1/2" />
                </div>
              </div>
              <div className="bg-surface-tint-blue rounded-xl p-space-md flex flex-col justify-between">
                <div className="flex items-center justify-between pb-space-xs text-primary">
                  <span className="font-label-sm text-label-sm font-semibold">Kitchen & Last Order</span>
                  <Icon name="restaurant" className="text-[18px]" />
                </div>
                <div className="my-space-xs">
                  <p className="font-heading-sm text-heading-sm font-bold text-primary">{v('—', '30 mins prior')}</p>
                  <p className="font-caption text-caption text-on-secondary-fixed-variant">
                    {v('—', 'Automatic POS lock for fresh ticketing at 9:30 PM (Mon-Sat)')}
                  </p>
                </div>
                <p className="font-caption text-caption text-primary font-semibold flex items-center gap-1">
                  <Icon name="info" className="text-[14px]" />
                  Enforced by VEMTAP POS Gateway
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Branch Inventory & Live Commerce Velocity */}
          <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                  <Icon name="inventory_2" className="text-[22px]" />
                </div>
                <div>
                  <h2 className="font-heading-md text-heading-md font-semibold text-on-surface">
                    Branch Inventory & Live Commerce Velocity
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Assigned SKUs, service terminal status, and smart edge hardware
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-primary hover:text-on-primary-fixed-variant font-label-md text-label-md font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Manage Catalog Stock</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="font-caption text-caption font-semibold uppercase tracking-wider">
                      {metric.label}
                    </span>
                    <Icon name={metric.labelIcon} className={`${metric.labelIconClass} text-[20px]`} />
                  </div>
                  <div className="mt-space-sm">
                    <div className="flex items-baseline gap-space-2xs">
                      <span className="font-display-hero text-display-hero font-bold text-on-surface">
                        {metric.value}
                      </span>
                      <span
                        className={`font-label-sm text-label-sm font-semibold ${metric.valueNoteClass}`}
                      >
                        {metric.valueNote}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary font-medium mt-1">{metric.sub}</p>
                  </div>
                  <div className="mt-space-md pt-space-xs flex items-center justify-between text-text-secondary font-caption text-caption">
                    <span>{metric.footerLeft}</span>
                    <span className={`font-semibold ${metric.footerRightClass}`}>{metric.footerRight}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Terminal Health Diagnostics Strip */}
            <div className="bg-surface-subtle rounded-xl p-space-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <div className="w-3 h-3 rounded-full bg-badge-discount-text animate-pulse" />
                  <h3 className="font-label-md text-label-md font-bold text-on-surface">
                    {v(`POS Terminals (${branch?.name ?? 'Branch'})`, 'Real-Time Terminal Edge Mesh (Wuse II Station)')}
                  </h3>
                </div>
                <span className="font-caption text-caption text-text-secondary font-mono">
                  {v(`${posUnits.length} ${posUnits.length === 1 ? 'till' : 'tills'}`, 'Gateway Ping: 12ms • Zero packet drop')}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs mt-space-sm">
                {posUnits.map((unit) => (
                  <div
                    key={unit.name}
                    className="bg-surface-canvas rounded-lg p-space-xs shadow-sm flex items-center gap-space-xs"
                  >
                    <Icon name={unit.icon} className="text-primary text-[20px]" />
                    <div>
                      <p className="font-label-sm text-label-sm font-semibold text-on-surface leading-tight">
                        {unit.name}
                      </p>
                      <p className="font-caption text-caption text-badge-discount-text leading-tight">
                        {v(unit.status === 'active' ? 'Online' : unit.status === 'idle' ? 'Idle' : unit.status === 'offline' ? 'Offline' : 'Disabled', 'NFC Sync • 0s Latency')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Card 1: Regional Geofence & Customer Catchment */}
          <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="podcasts" className="text-[20px]" />
                </div>
                <div>
                  <h2 className="font-label-md text-label-md font-bold text-on-surface">
                    Regional Geofence Beacon
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">Footfall Catchment Area</p>
                </div>
              </div>
              <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                Broadcasting
              </span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-space-md">
              <div className="flex items-baseline justify-between">
                <span className="font-display-hero-mobile text-display-hero-mobile font-bold text-primary">{v('—', '1,420')}</span>
                <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold flex items-center">
                  <Icon name="trending_up" className="text-[16px]" />
                  {v('—', '+18.4% vs last week')}
                </span>
              </div>
              <p className="font-label-sm text-label-sm font-semibold text-on-surface mt-1">
                Estimated Daily Footfall Reach
              </p>
              <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                Unique smartphone consumers equipped with active VEMTAP pass pass-through within 300 meters today.
              </p>
            </div>
            <div className="bg-surface-subtle rounded-xl p-space-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between text-caption font-caption text-text-secondary">
                <span className="font-semibold text-on-surface">Corridor Saturation</span>
                <span>{v('—', 'Amina Kano • Adetokunbo')}</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <svg className="w-16 h-16 shrink-0 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-high"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={4}
                  />
                  <path
                    className="text-primary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="78, 100"
                    strokeLinecap="round"
                    strokeWidth={4}
                  />
                </svg>
                <div className="flex flex-col text-caption font-caption">
                  <span className="font-semibold text-on-surface text-label-sm font-label-sm">
                    {v('—', '78% Core Catchment')}
                  </span>
                  <span className="text-text-secondary">
                    {v('No footfall data yet', 'Strongest density: 12:30 PM & 7:45 PM Peak commuting windows')}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-space-xs flex items-center justify-between text-caption font-caption text-text-secondary">
              <span>{v('Beacon Radius: —', 'Beacon Radius: 300m')}</span>
              <button type="button" className="text-primary font-semibold hover:underline">
                Adjust Perimeter
              </button>
            </div>
          </div>

          {/* Card 2: Branch Dossier & Legal Entity */}
          <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs pb-space-xs">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <Icon name="verified" className="text-[20px]" />
              </div>
              <div>
                <h2 className="font-label-md text-label-md font-bold text-on-surface">
                  Branch Dossier & Legal Entity
                </h2>
                <p className="font-caption text-caption text-text-secondary">
                  Statutory compliance & registration
                </p>
              </div>
            </div>
            <div className="space-y-space-sm text-label-sm font-label-sm">
              {dossier.map((row) => (
                <div
                  key={row.label}
                  className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between"
                >
                  <span className="text-text-secondary font-caption text-caption">{row.label}</span>
                  <span
                    className={`font-semibold ${row.valueClass ?? 'text-on-surface'} ${row.mono ? 'font-mono' : ''} inline-flex items-center gap-1`}
                  >
                    {row.icon && <Icon name={row.icon} className="text-[16px]" />}
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                downloadCsv(
                  live ? `${(branch?.name ?? 'branch').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-dossier.csv` : 'wuse-branch-compliance-dossier.csv',
                  ['Field', 'Value'],
                  dossier.map((row) => [row.label, row.value]),
                );
                printReport(
                  v(`Compliance Dossier — ${branch?.name ?? 'Branch'}`, 'Compliance Dossier — Wuse II Branch'),
                  `${printKvTable('Outlet', [
                    ['Branch', v(branch?.name ?? '—', 'Wuse II — Apo Boulevard')],
                    ['Jurisdiction', v(branch?.district || '—', 'Abuja Municipal (AMAC)')],
                    ['Status', v(paused ? 'Paused' : 'Live & Accepting', 'Live & Accepting')],
                  ])}
                   ${printKvTable(
                     'Statutory compliance',
                     dossier.map((row) => [row.label, row.value] as [string, string]),
                   )}
                   ${printKvTable('Inventory & POS', [
                     ...metrics.map(
                       (metric) => [metric.label, `${metric.value} — ${metric.sub}`] as [string, string],
                     ),
                     ['POS units', posUnits.map((unit) => unit.name).join(', ') || '—'],
                   ])}
                   <p class="foot">A CSV copy of this dossier downloaded alongside the PDF.</p>`,
                );
              }}
              className="w-full py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-button-secondary text-button-secondary transition-colors flex items-center justify-center gap-space-2xs"
            >
              <Icon name="download" className="text-[18px]" />
              <span>Download Compliance Dossier (PDF)</span>
            </button>
          </div>

          {/* Card 3: Deactivation & Safety Policy Card */}
          <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md">
            <div className="flex items-start gap-space-xs">
              <Icon name="shield_lock" className="text-error text-[24px] mt-0.5" />
              <div>
                <h3 className="font-label-md text-label-md font-bold text-on-surface">
                  Outlet Deactivation & Safety Policy
                </h3>
                <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                  Deactivating this branch immediately removes the outlet from the consumer discovery map and disables
                  customer NFC tap checkouts.
                </p>
              </div>
            </div>
            <div className="bg-surface-canvas rounded-lg p-space-sm flex items-center gap-space-xs">
              <Icon name="inventory" className="text-badge-discount-text text-[20px]" />
              <p className="font-caption text-caption text-on-surface-variant leading-tight">
                <strong className="font-semibold text-on-surface">100% Ledger Integrity:</strong> All historical sales,
                order logs, VAT reporting, and staff shifts remain completely accessible for audits.
              </p>
            </div>
            <div className="flex items-center justify-between pt-space-2xs">
              <button
                type="button"
                className="font-caption text-caption text-text-secondary hover:text-on-surface transition-colors underline"
              >
                Review Branch Protocol
              </button>
              <button
                type="button"
                onClick={live ? () => setActive(paused) : undefined}
                className="text-error font-label-sm text-label-sm font-semibold hover:underline flex items-center gap-1"
              >
                <span>{v(paused ? 'Reactivate Outlet' : 'Deactivate Outlet', 'Deactivate Outlet')}</span>
                <Icon name="chevron_right" className="text-[14px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </MerchantShell>
  );
}
