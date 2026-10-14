import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ServiceDraft } from './desktopServiceDraft';

interface DesktopServicePublishedScreenProps {
  draft: ServiceDraft;
  onMakeDeal: () => void;
  onViewCatalog: () => void;
  onAddAnother: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const PUBLISHED_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCr9zyuSKHFEndj9CsvaqxvIfTc5PcA1u9uBNPnT6rWRTJqmsl_LNemKsx6aSX8ZUXQy6AuI3ojXlpE-GFjnN0WnjPpjN0iDH_Fvf2iiy6RXpvFRqlT_S1heyI3Pv-d85eIYxdTdE7yufcGnKbTXLzxTDNf0H0aizSR6seYBjWLjI9AF9geHA6wkMlizfeYL0qcKW09ZgpcGwfE4floYKYVPk2Y8afAZ3NFZFLYrhmBuenCsL7a9Xz5VQ';

const PUBLISHED_ALT =
  'A luxurious close-up of a client undergoing a deep hydration radiance facial in an upscale aesthetic spa. Soft botanical ambient lighting, fresh steam dew, clean minimalist white and natural stone textures, serene spa environment.';

const ROOMS: Array<{
  branch: boolean;
  name: string;
  specialists: string;
  slots: Array<{ room: string; state: 'open' | 'booked' | 'walkin'; status: string }>;
}> = [
  {
    branch: true,
    name: 'Maitama Heights Branch',
    specialists: '2 Specialists',
    slots: [
      { room: 'Room 1 (Esthetics)', state: 'open', status: 'Open 2:00 PM' },
      { room: 'Room 2 (Laser Care)', state: 'booked', status: 'Booked until 1:15 PM' },
    ],
  },
  {
    branch: true,
    name: 'Wuse II Flagship Studio',
    specialists: '3 Specialists',
    slots: [
      { room: 'Room A (VIP Suite)', state: 'open', status: 'Open 3:30 PM' },
      { room: 'Room B (Facial Bar)', state: 'walkin', status: 'Walk-in Slot 4:00 PM' },
    ],
  },
];

const BRANCH_LABELS: Array<{ key: keyof ServiceDraft['branches']; label: string }> = [
  { key: 'maitama', label: 'Maitama Heights' },
  { key: 'wuseII', label: 'Wuse II' },
  { key: 'garki', label: 'Garki' },
];

const toNumber = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const segmentClass = (active: boolean) =>
  `px-3.5 py-1 text-label-sm font-label-sm rounded-md transition-all flex items-center gap-1.5 ${
    active
      ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
      : 'text-text-secondary hover:text-text-primary'
  }`;

export function DesktopServicePublishedScreen({
  draft,
  onMakeDeal,
  onViewCatalog,
  onAddAnother,
  onNav,
}: DesktopServicePublishedScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [mode, setMode] = useState<'live' | 'draft'>('live');
  const [dealState, setDealState] = useState<'idle' | 'importing' | 'success'>('idle');
  const [copied, setCopied] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const tierPrices = draft.tiers.map((tier) => toNumber(tier.price)).filter((price) => price > 0);
  const priceMin = tierPrices.length > 0 ? Math.min(...tierPrices) : toNumber(draft.basePrice);
  const priceMax = tierPrices.length > 0 ? Math.max(...tierPrices) : toNumber(draft.basePrice);
  const tierDurations = draft.tiers.map((tier) => toNumber(tier.duration)).filter((mins) => mins > 0);
  const durationMin = tierDurations.length > 0 ? Math.min(...tierDurations) : draft.durationMins;
  const durationMax = tierDurations.length > 0 ? Math.max(...tierDurations) : draft.durationMins;
  const activeBranches = BRANCH_LABELS.filter((branch) => draft.branches[branch.key]);
  const activeLocationText =
    activeBranches.length > 0 ? `${activeBranches.map((branch) => branch.label).join(' & ')} Studios` : 'No active studios';
  const bookingUrl = `vemtap.com/s/${draft.skuCode.toLowerCase()}`;

  const handleMakeDeal = () => {
    if (dealState !== 'idle') return;
    setDealState('importing');
    timers.current.push(window.setTimeout(() => setDealState('success'), 900));
    timers.current.push(window.setTimeout(() => onMakeDeal(), 2100));
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://${bookingUrl}`).catch(() => undefined);
    }
    setCopied(true);
    timers.current.push(window.setTimeout(() => setCopied(false), 1800));
  };

  const slotDotClass = (state: 'open' | 'booked' | 'walkin') =>
    state === 'booked'
      ? 'bg-outline-variant'
      : state === 'walkin'
        ? 'bg-primary'
        : 'bg-badge-discount-text';

  const slotStatusClass = (state: 'open' | 'booked' | 'walkin') =>
    state === 'booked'
      ? 'text-text-tertiary font-medium'
      : state === 'walkin'
        ? 'text-primary font-semibold'
        : 'text-badge-discount-text font-semibold';

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="max-w-7xl mx-auto w-full px-margin py-space-xl flex flex-col gap-8">
        <div className="w-full bg-surface-container-low rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-badge-discount-text opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-badge-discount-text" />
            </span>
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md font-semibold text-text-primary tracking-wide">
                {mode === 'live' ? 'Status: Live Online' : 'Status: Saved as Draft'}
              </span>
              <span className="text-text-tertiary text-caption">•</span>
              <span className="font-label-md text-label-md text-text-secondary flex items-center gap-1.5">
                <Icon name="radar" className="text-[16px] text-primary" />
                Radius: 4.0 km Hyperlocal Discovery
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
              Storefront Sync:
            </span>
            <div className="inline-flex items-center p-1 bg-surface-container rounded-lg">
              <button type="button" onClick={() => setMode('live')} className={segmentClass(mode === 'live')}>
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                Live on Storefront
              </button>
              <button type="button" onClick={() => setMode('draft')} className={segmentClass(mode === 'draft')}>
                <span className="w-2 h-2 rounded-full bg-outline-variant" />
                Saved as Draft
              </button>
            </div>
          </div>
        </div>

        <div className="w-full relative overflow-hidden bg-surface-canvas rounded-2xl p-8 lg:p-10 shadow-sm flex flex-col items-center text-center">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-surface-tint-blue blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-badge-discount-bg blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center max-w-3xl">
            <div className="w-16 h-16 rounded-2xl bg-badge-discount-bg flex items-center justify-center mb-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-badge-discount-text flex items-center justify-center text-on-primary">
                <Icon name="verified" className="text-[24px]" filled />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold mb-3">
              <Icon name="celebration" className="text-[16px]" />
              Step 5 Completed • Live in Hyperlocal Network
            </div>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight mb-3">
              Service is Live on Storefront!
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary max-w-2xl leading-relaxed">
              Clients within 4.0 km in Maitama &amp; Wuse II can now discover, schedule, and book appointments in
              real-time. Instant dispatch and sync are fully active across your studio calendars.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md font-semibold text-text-primary uppercase tracking-wider">
                    Service Record
                  </span>
                  <span className="text-caption font-caption text-text-tertiary">#{draft.skuCode}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  Active in Catalog
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative w-full sm:w-44 h-44 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                  <img alt={PUBLISHED_ALT} className="w-full h-full object-cover" src={PUBLISHED_IMAGE} />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface font-caption text-caption font-medium flex items-center gap-1">
                    <Icon name="photo_camera" className="text-[12px]" />
                    4 Photos
                  </div>
                </div>
                <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                  <div>
                    <span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider">
                      Skin Care • Facial Treatment
                    </span>
                    <h2 className="font-heading-md text-heading-md text-text-primary font-bold mt-1 leading-snug">
                      {draft.title}
                    </h2>
                    <p className="font-body-md text-body-md text-text-secondary mt-1.5 line-clamp-2">
                      Multi-tier sonic pore extraction with bioactive hyaluronic infusion, peptide mask, and lymphatic
                      cryo contouring.
                    </p>
                  </div>
                  <div className="pt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <div className="font-heading-lg text-heading-lg font-bold text-primary tracking-tight">
                      ₦{priceMin.toLocaleString('en-US')}{' '}
                      <span className="font-body-md text-body-md text-text-secondary font-normal">
                        – ₦{priceMax.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary font-label-md text-label-md">
                      <Icon name="schedule" className="text-[16px] text-text-tertiary" />
                      {durationMin}–{durationMax} mins duration
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-surface-subtle rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon name="location_on" className="text-primary text-[20px]" />
                  <span className="font-label-md text-label-md text-text-primary font-semibold">Active Locations:</span>
                  <span className="font-label-md text-label-md text-text-secondary">{activeLocationText}</span>
                </div>
                <span className="font-caption text-caption text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer">
                  Edit Locations
                  <Icon name="chevron_right" className="text-[14px]" />
                </span>
              </div>
            </div>

            <div className="bg-surface-tint-blue rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-canvas text-primary flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="bolt" className="text-[22px]" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary">
                  Instant Booking &amp; WhatsApp Alerts Engaged
                </h3>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  New client bookings register directly on your merchant terminal calendar. Automated booking
                  confirmations and reminder triggers will immediately dispatch via WhatsApp to on-duty specialists.
                </p>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon name="calendar_month" className="text-text-secondary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                    Live Studio Availability
                  </h3>
                </div>
                <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  Real-time feed
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {ROOMS.map((room, index) => {
                  const isActive = index === 0 ? draft.branches.maitama : draft.branches.wuseII;
                  if (!isActive) return null;
                  return (
                    <div key={room.name} className="p-4 rounded-xl bg-surface-subtle flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md font-bold text-text-primary">{room.name}</span>
                        <span className="font-caption text-caption text-text-tertiary">{room.specialists}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {room.slots.map((slot) => (
                          <div
                            key={slot.room}
                            className="flex items-center justify-between text-label-sm font-label-sm p-2 rounded-lg bg-surface-canvas shadow-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${slotDotClass(slot.state)}`} />
                              <span className="text-text-primary font-medium">{slot.room}</span>
                            </div>
                            <span className={slotStatusClass(slot.state)}>{slot.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative bg-surface-canvas rounded-2xl p-7 shadow-sm overflow-hidden flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold tracking-wide">
                  <Icon name="local_fire_department" className="text-[16px] text-tertiary" filled />
                  Growth Booster
                </span>
                <span className="font-caption text-caption text-text-tertiary font-medium">
                  Instant One-Tap Import
                </span>
              </div>
              <div>
                <h2 className="font-heading-lg text-heading-lg font-bold text-text-primary leading-tight">
                  Fill Empty Slots with a VEMTAP Deal 🔥
                </h2>
                <p className="font-body-md text-body-md text-text-secondary mt-2.5 leading-relaxed">
                  Transform this Radiance Facial into a featured promotional voucher for slow hours or weekdays.
                  Photos, duration tiers, and studio branches will pre-fill into Deal Studio automatically.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-subtle p-3.5 rounded-xl flex flex-col justify-between">
                  <span className="font-caption text-caption text-text-secondary font-medium">Expected Reach</span>
                  <div className="font-heading-lg text-heading-lg font-bold text-primary mt-1">4.2x</div>
                  <span className="font-caption text-caption text-text-tertiary text-[11px] leading-tight mt-1">
                    More first-time clients on Map
                  </span>
                </div>
                <div className="bg-surface-subtle p-3.5 rounded-xl flex flex-col justify-between">
                  <span className="font-caption text-caption text-text-secondary font-medium">Slot Fill Rate</span>
                  <div className="font-heading-lg text-heading-lg font-bold text-badge-discount-text mt-1">+65%</div>
                  <span className="font-caption text-caption text-text-tertiary text-[11px] leading-tight mt-1">
                    Weekday afternoon occupancy
                  </span>
                </div>
                <div className="bg-surface-subtle p-3.5 rounded-xl flex flex-col justify-between">
                  <span className="font-caption text-caption text-text-secondary font-medium">Setup Speed</span>
                  <div className="font-heading-lg text-heading-lg font-bold text-text-primary mt-1">
                    {'< 60s'}
                  </div>
                  <span className="font-caption text-caption text-text-tertiary text-[11px] leading-tight mt-1">
                    Zero asset re-uploading
                  </span>
                </div>
              </div>
              <div className="bg-surface-tint-blue rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 font-caption text-caption uppercase text-primary font-bold">
                    <Icon name="auto_awesome" className="text-[15px]" />
                    Recommended Deal Formula
                  </span>
                  <span className="px-2 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                    20% OFF
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-label-md text-label-md font-semibold text-text-primary">
                      Flash Weekday Facial Voucher
                    </div>
                    <div className="font-caption text-caption text-text-secondary mt-0.5">
                      Valid Mon–Thu, 11:00 AM – 3:30 PM
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading-sm text-heading-sm font-bold text-text-primary">₦12,800</div>
                    <div className="font-caption text-caption text-badge-discount-text font-medium">Save ₦3,200</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleMakeDeal}
                  disabled={dealState !== 'idle'}
                  className={`w-full h-14 bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.99] transition-all ${
                    dealState === 'idle'
                      ? 'hover:bg-primary-container cursor-pointer'
                      : 'opacity-90 cursor-not-allowed'
                  }`}
                >
                  {dealState === 'idle' && (
                    <>
                      <span>Make as a Deal 🔥</span>
                      <Icon name="arrow_forward" className="text-[20px]" />
                    </>
                  )}
                  {dealState === 'importing' && (
                    <>
                      <Icon name="progress_activity" className="text-[20px] animate-spin" />
                      <span>Importing into Studio...</span>
                    </>
                  )}
                  {dealState === 'success' && (
                    <>
                      <Icon name="check_circle" className="text-[20px]" />
                      <span>Imported to Deal Studio!</span>
                    </>
                  )}
                </button>
                <p className="font-caption text-caption text-center text-text-tertiary flex items-center justify-center gap-1.5">
                  <Icon name="check_circle" className="text-[14px] text-badge-discount-text" />
                  No upfront fees • Pay only 2.5% on completed appointments
                </p>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center text-primary shrink-0">
                  <Icon name="qr_code_2" className="text-[24px]" />
                </div>
                <div>
                  <div className="font-label-md text-label-md font-bold text-text-primary">
                    Direct Booking Link &amp; QR
                  </div>
                  <div className="font-caption text-caption text-text-secondary">{bookingUrl}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full pt-4 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-secondary font-label-md text-label-md">
            <Icon name="verified_user" className="text-badge-discount-text text-[20px]" />
            <span>Service changes sync across all VEMTAP discovery nodes in real-time</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onViewCatalog}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-surface-canvas hover:bg-surface-subtle text-text-primary font-button-secondary text-button-secondary transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Icon name="inventory_2" className="text-[18px]" />
              View in Services Catalog
            </button>
            <button
              type="button"
              onClick={onAddAnother}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-primary font-button-secondary text-button-secondary transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-semibold"
            >
              <Icon name="add_circle" className="text-[18px]" />
              Add Another Product or Service
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
