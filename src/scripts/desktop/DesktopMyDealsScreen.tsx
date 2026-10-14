import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useClaims, type ClaimRecord } from '../../context/ClaimsContext';
import { useProfile } from '../../context/ProfileContext';
import { maskPhone } from '../../utils/format';

interface DesktopMyDealsScreenProps {
  onNav: (key: DesktopNavKey) => void;
}

const FILTERS = [
  { key: 'active', label: 'Active Deals', pill: true },
  { key: 'past', label: 'Redeemed & Past', pill: false },
  { key: 'gifted', label: 'Gifted to Others', pill: false },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'VT';

const INCLUDED = [
  'Choice of Dry-aged Angus burger or marinated grilled chicken supreme',
  'Truffle parmesan hand-cut fries or garden crisp salad',
  'Cold-pressed peach cooler or signature hibiscus iced tea',
];

export function DesktopMyDealsScreen({ onNav }: DesktopMyDealsScreenProps) {
  const { claims, removeClaim } = useClaims();
  const profile = useProfile();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('active');
  const [selectedRef, setSelectedRef] = useState<string | null>(null);

  const activeClaims = claims.filter((claim) => claim.kind !== 'gift');
  const giftedClaims = claims.filter((claim) => claim.kind === 'gift');
  const counts: Record<FilterKey, number> = {
    active: activeClaims.length,
    // Backend gap: redeemed/expired status is not tracked yet.
    past: 0,
    gifted: giftedClaims.length,
  };
  const list: ClaimRecord[] =
    activeFilter === 'gifted' ? giftedClaims : activeFilter === 'active' ? activeClaims : [];
  const selected = list.find((claim) => claim.ref === selectedRef) ?? list[0] ?? null;
  const pass = selected;
  const isGiftPass = pass?.kind === 'gift';
  const passHolderName = pass?.recipient?.name || profile.fullName;
  const passHolderContact = pass?.recipient?.phone
    ? maskPhone(pass.recipient.phone)
    : pass?.recipient?.email || profile.maskedPhone;

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="my-deals" withCustomerRail>
      <div className="w-full bg-surface-canvas">
        <section className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8">
          <div className="flex flex-col gap-1 mb-6">
            <nav className="flex items-center gap-2 text-text-tertiary font-caption text-caption">
              <button className="hover:text-primary transition-colors" onClick={() => onNav('discover')} type="button">
                Home
              </button>
              <Icon name="chevron_right" className="text-[14px]" />
              <button className="hover:text-primary transition-colors" onClick={() => onNav('dashboard')} type="button">
                Customer Dashboard
              </button>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-text-primary font-medium">My Deals</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-1">
              <div>
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                  My Deals &amp; Passes
                </h1>
                <p className="font-body-md text-body-md text-text-secondary mt-1 max-w-2xl">
                  Manage your claimed vouchers, present offline QR passes at local Abuja merchants, and track live
                  redemption status.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto bg-surface-subtle px-3 py-2 rounded-xl shadow-sm">
                <Icon name="verified" className="text-primary text-[18px]" />
                <span className="font-label-sm text-label-sm text-text-secondary">
                  Claimed Wallet:{' '}
                  <strong className="text-text-primary font-semibold">₦26,900 Total Savings</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-surface-canvas p-1.5 rounded-xl shadow-sm mb-6">
            <div className="flex items-center gap-1 overflow-x-auto">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-surface-tint-blue text-primary font-semibold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                  }`}
                  type="button"
                >
                  <span>{filter.label}</span>
                  {filter.pill ? (
                    <span
                      className={
                        activeFilter === filter.key
                          ? 'w-5 h-5 rounded-full bg-primary text-on-primary font-caption text-caption flex items-center justify-center'
                          : 'px-1 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption'
                      }
                    >
                      {counts[filter.key]}
                    </span>
                  ) : (
                    <span className="px-1 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption">
                      {counts[filter.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-1 lg:max-w-md">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary"
                />
                <input
                  className="w-full h-10 pl-9 pr-3 bg-surface-subtle rounded-lg font-body-md text-body-md placeholder:text-text-tertiary text-text-primary focus:outline-none focus:bg-surface-canvas shadow-inner"
                  placeholder="Search your claimed deals..."
                  type="text"
                />
              </div>
              <div className="relative shrink-0">
                <button
                  className="h-10 px-3 bg-surface-subtle hover:bg-surface-container-high rounded-lg flex items-center gap-1.5 font-label-sm text-label-sm text-text-primary transition-colors"
                  type="button"
                >
                  <Icon name="near_me" className="text-[18px] text-primary" />
                  <span>All Abuja Hubs</span>
                  <Icon name="arrow_drop_down" className="text-[16px] text-text-tertiary" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
                  {activeFilter === 'gifted'
                    ? `Gifts You Sent (${giftedClaims.length})`
                    : activeFilter === 'past'
                      ? `Redeemed & Past (${counts.past})`
                      : `Your Active Passes (${activeClaims.length})`}
                </span>
                <span className="font-caption text-caption text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  <span>Sync Updated Just Now</span>
                </span>
              </div>

              {list.length === 0 ? (
                <div className="p-6 rounded-xl bg-surface-canvas shadow-sm flex flex-col items-center gap-2 text-center">
                  <Icon name="confirmation_number" className="text-[28px] text-primary" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">
                    {activeFilter === 'past'
                      ? 'No redeemed or expired passes yet'
                      : activeFilter === 'gifted'
                        ? 'No gifts sent yet'
                        : 'No active passes yet'}
                  </h3>
                  <p className="font-caption text-caption text-text-secondary max-w-sm leading-relaxed">
                    {activeFilter === 'past'
                      ? 'Once a merchant scans your pass it moves here together with its redemption receipt.'
                      : activeFilter === 'gifted'
                        ? 'Gift a deal from any voucher screen and its dispatch receipt will appear here.'
                        : 'Claim a deal to get an offline-ready QR pass you can present in store.'}
                  </p>
                  <button
                    className="mt-1 h-10 px-4 rounded-lg bg-primary-container text-on-primary font-button-secondary text-button-secondary shadow-sm hover:bg-primary transition-colors"
                    onClick={() => onNav('deals')}
                    type="button"
                  >
                    Explore deals
                  </button>
                </div>
              ) : (
                list.map((claim) => {
                  const isSelected = selected?.ref === claim.ref;
                  const isGift = claim.kind === 'gift';
                  return (
                    <article
                      key={claim.ref}
                      onClick={() => setSelectedRef(claim.ref)}
                      className={`relative flex flex-col bg-surface-canvas rounded-xl overflow-hidden cursor-pointer transition-all group ${
                        isSelected ? 'shadow-md hover:shadow-lg' : 'shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container z-10" />}
                      <div className="flex p-3 gap-3">
                        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 relative bg-surface-container-high">
                          <img
                            alt={claim.dealTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={claim.dealImage}
                          />
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold tracking-tight">
                            {claim.code}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-caption text-caption text-text-tertiary flex items-center gap-1.5">
                                <Icon name="confirmation_number" className="text-[14px] text-primary" />
                                <span>{claim.ref}</span>
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-caption text-caption ${
                                  isGift
                                    ? 'bg-surface-subtle text-text-secondary font-medium'
                                    : 'bg-surface-tint-blue text-primary font-semibold'
                                }`}
                              >
                                {!isGift && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                <span>{isGift ? 'Gift Sent' : 'Ready'}</span>
                              </span>
                            </div>
                            <h3 className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate mt-0.5">
                              {claim.dealBusiness}
                            </h3>
                            <p className="font-body-md text-body-md text-text-secondary line-clamp-1">
                              {claim.dealTitle}
                            </p>
                          </div>
                          <div className="flex items-baseline justify-between mt-0.5 pt-0.5">
                            <span className="font-label-md text-label-md font-mono font-bold tracking-wide text-text-primary">
                              {claim.code}
                            </span>
                            <span className="font-caption text-caption font-medium flex items-center gap-1 text-text-secondary">
                              <Icon
                                name={isGift ? 'card_giftcard' : 'schedule'}
                                className={`text-[14px] ${isGift ? 'text-primary' : 'text-text-tertiary'}`}
                              />
                              <span>
                                {isGift ? `Sent ${formatDate(claim.createdAt)}` : `Claimed ${formatDate(claim.createdAt)}`}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-surface-subtle flex items-center justify-between text-text-secondary font-caption text-caption">
                        <span className="flex items-center gap-1.5">
                          <Icon name="person" className="text-[15px] text-text-tertiary" />
                          <span>
                            {isGift
                              ? `Gifted to ${claim.recipient?.name ?? 'recipient'}`
                              : claim.recipient
                                ? `Redeeming: ${claim.recipient.name}`
                                : `Pass holder: ${profile.fullName}`}
                          </span>
                        </span>
                        {isSelected ? (
                          <span className="text-primary font-medium flex items-center gap-0.5">
                            <span>Viewing Pass</span>
                            <Icon name="arrow_forward" className="text-[14px]" />
                          </span>
                        ) : (
                          <span className="text-text-tertiary group-hover:text-primary transition-colors flex items-center gap-0.5 font-medium">
                            <span>Select to inspect</span>
                            <Icon name="chevron_right" className="text-[14px]" />
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })
              )}

              <div className="p-4 rounded-xl bg-surface-subtle flex items-start gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0 text-primary">
                  <Icon name="cloud_off" className="text-[20px]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                    Instant Offline Verification
                  </h4>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 leading-relaxed">
                    Your passes are cryptographically stored on your device. Present the dynamic QR code directly to
                    the merchant even without active MTN or Airtel data signal.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-high/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Icon name="explore" className="text-[18px]" />
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm font-semibold text-text-primary">
                      Looking for coffee or treats?
                    </p>
                    <p className="font-caption text-caption text-text-secondary">
                      4 limited vouchers unlock in Apo District at noon.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNav('deals')}
                  className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
                  type="button"
                >
                  Explore →
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-4 sticky top-24">
              <div className="relative bg-surface-canvas rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-surface-container-lowest via-surface-canvas to-surface-tint-blue/30 relative">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-heading-md text-heading-md flex items-center justify-center font-bold shadow-md">
                        {initialsOf(pass?.dealBusiness ?? 'Vemtap')}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-bold">
                            VEMTAP PASS ID {pass ? `• ${pass.ref}` : ''}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                            <Icon name="verified" className="text-[12px]" />
                            <span>Verified Partner</span>
                          </span>
                        </div>
                        <h2 className="font-heading-md text-heading-md text-text-primary font-bold tracking-tight">
                          {pass?.dealBusiness ?? 'No pass selected'}
                        </h2>
                        <p className="font-caption text-caption text-text-secondary flex items-center gap-1 mt-0.5">
                          <Icon name="location_on" className="text-[14px] text-primary" />
                          <span>Abuja merchant network • offline POS verified</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold shadow-xs ${
                          isGiftPass ? 'bg-surface-subtle text-text-secondary' : 'bg-badge-discount-bg text-badge-discount-text'
                        }`}
                      >
                        {!isGiftPass && <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />}
                        <span>{pass ? (isGiftPass ? 'Gift Sent' : 'Ready to Redeem') : 'Nothing selected'}</span>
                      </span>
                      <p className="font-caption text-caption text-text-tertiary mt-1">
                        {pass ? `${isGiftPass ? 'Sent' : 'Claimed'} ${formatDate(pass.createdAt)}` : 'Select a pass'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-surface-container-low/70 backdrop-blur flex items-center justify-between">
                    <div>
                      <span className="font-caption text-caption text-text-tertiary">Entitlement Offer</span>
                      <p className="font-label-md text-label-md font-semibold text-text-primary">
                        {pass?.dealTitle ?? 'Select a pass on the left to preview its voucher'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-caption text-caption text-text-tertiary">Voucher</span>
                      <p className="font-heading-sm text-heading-sm font-bold text-primary font-mono tracking-wide">
                        {pass?.code ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative w-full h-8 flex items-center justify-between px-0 bg-surface-container-lowest">
                  <div className="w-4 h-8 bg-surface-canvas rounded-r-full -ml-0 shadow-inner" />
                  <div className="flex-1 mx-3 border-b-2 border-dashed border-border-subtle" />
                  <div className="w-4 h-8 bg-surface-canvas rounded-l-full -mr-0 shadow-inner" />
                </div>

                <div className="p-6 pt-3 bg-surface-container-lowest flex flex-col items-center">
                  <div className="w-full max-w-sm flex flex-col items-center p-4 rounded-2xl bg-surface-subtle shadow-sm relative group">
                    <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-text-primary text-on-primary font-caption text-caption font-semibold flex items-center gap-1.5 shadow-sm">
                      <Icon name="wifi_off" className="text-[13px] text-badge-discount-text" />
                      <span>Offline POS Authorized</span>
                    </div>
                    <div className="p-3 bg-surface-container-lowest rounded-xl shadow-md my-2 relative">
                      <svg className="w-48 h-48 text-text-primary" fill="currentColor" viewBox="0 0 160 160">
                        <path d="M10,10 h45 v45 h-45 z M20,20 v25 h25 v-25 z M27,27 h11 v11 h-11 z" />
                        <path d="M105,10 h45 v45 h-45 z M115,20 v25 h25 v-25 z M122,27 h11 v11 h-11 z" />
                        <path d="M10,105 h45 v45 h-45 z M20,115 v25 h25 v-25 z M27,122 h11 v11 h-11 z" />
                        <rect height="8" width="8" x="62" y="15" />
                        <rect height="8" width="8" x="76" y="15" />
                        <rect height="8" width="8" x="90" y="15" />
                        <rect height="8" width="8" x="15" y="62" />
                        <rect height="8" width="8" x="15" y="76" />
                        <rect height="8" width="8" x="15" y="90" />
                        <rect className="text-primary" height="30" width="30" x="65" y="65" />
                        <rect fill="#ffffff" height="14" width="14" x="73" y="73" />
                        <rect height="8" width="10" x="40" y="65" />
                        <rect height="10" width="12" x="110" y="65" />
                        <rect height="10" width="15" x="130" y="70" />
                        <rect height="12" width="10" x="65" y="40" />
                        <rect height="10" width="12" x="65" y="110" />
                        <rect height="15" width="15" x="85" y="105" />
                        <rect height="15" width="10" x="105" y="90" />
                        <rect height="10" width="20" x="125" y="100" />
                        <rect height="15" width="15" x="110" y="125" />
                        <rect height="10" width="15" x="40" y="85" />
                        <rect height="20" width="10" x="35" y="105" />
                        <rect height="15" width="25" x="70" y="130" />
                        <rect height="15" width="15" x="130" y="135" />
                      </svg>
                      <span className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-primary" />
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-primary" />
                      <span className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-primary" />
                      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-primary" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-caption text-caption text-text-tertiary">Voucher Code:</span>
                      <span
                        className="font-heading-sm text-heading-sm font-mono font-bold tracking-widest text-text-primary"
                        id="voucherCode"
                      >
                        {pass?.code ?? '—'}
                      </span>
                      <button
                        aria-label="Copy Voucher Code"
                        onClick={() => pass && navigator.clipboard?.writeText(pass.code)}
                        className="p-1 rounded-md text-text-secondary hover:text-primary hover:bg-surface-canvas transition-colors"
                        id="copyCodeBtn"
                        title="Copy Voucher Code"
                        type="button"
                      >
                        <Icon name="content_copy" className="text-[16px]" />
                      </button>
                    </div>
                    <p className="font-caption text-caption text-text-tertiary mt-0.5 text-center">
                      Merchant scans using VEMTAP Smart POS or enters code manually.
                    </p>
                  </div>

                  <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-surface-subtle">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        {isGiftPass ? 'Gift Recipient' : 'Pass Holder'}
                      </span>
                      <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                        {passHolderName}
                      </p>
                      <p className="font-caption text-caption text-text-secondary">{passHolderContact}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-subtle">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        {isGiftPass ? 'Dispatched' : 'Claimed On'}
                      </span>
                      <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                        {pass ? formatDate(pass.createdAt) : '—'}
                      </p>
                      <p className="font-caption text-caption text-text-secondary">
                        {isGiftPass
                          ? 'Recipient redeems the pass, not the sender.'
                          : 'Valid at the merchant until redeemed.'}
                      </p>
                    </div>
                  </div>

                  <div className="w-full mt-3 p-3 rounded-xl bg-surface-subtle">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Included Items in this Claim
                      </span>
                      <span className="font-caption text-caption text-primary font-medium">3 of 3 Included</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 font-body-md text-body-md text-text-primary">
                      {INCLUDED.map((item) => (
                        <li className="flex items-center gap-2" key={item}>
                          <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
                          <span>
                            <strong>1x</strong> {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="w-full mt-3 p-3 rounded-xl bg-surface-tint-blue/80 flex items-start gap-2 text-text-primary">
                    <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
                    <p className="font-caption text-caption leading-relaxed">
                      <strong>Settlement Notice:</strong> Pay the discounted bill directly to the{' '}
                      <strong>{pass?.dealBusiness ?? 'merchant'}</strong> cashier at redemption via card or cash. Zero
                      upfront checkout fees charged by VEMTAP.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-surface-subtle flex flex-col gap-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        if (!pass) return;
                        const body = [
                          'VEMTAP PASS',
                          `Reference: ${pass.ref}`,
                          `Voucher: ${pass.code}`,
                          `Business: ${pass.dealBusiness}`,
                          `Offer: ${pass.dealTitle}`,
                          `Holder: ${passHolderName}`,
                          `Claimed: ${formatDate(pass.createdAt)}`,
                        ].join('\n');
                        const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${pass.ref}.txt`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="h-12 px-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                      type="button"
                    >
                      <Icon name="download" className="text-[20px]" />
                      <span>Download Pass</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!pass) return;
                        const text = `${pass.dealBusiness} — ${pass.dealTitle} (${pass.code}) claimed on VEMTAP`;
                        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
                      }}
                      className="h-12 px-3 rounded-xl bg-surface-canvas hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-sm transition-all"
                      type="button"
                    >
                      <Icon name="share" className="text-[20px] text-badge-discount-text" />
                      <span>Share WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!pass) return;
                        navigator.clipboard?.writeText(pass.code);
                      }}
                      className="h-12 px-3 rounded-xl bg-surface-canvas hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-sm transition-all"
                      type="button"
                    >
                      <Icon name="content_copy" className="text-[20px] text-primary" />
                      <span>Copy Voucher</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-2 px-1">
                    <button
                      onClick={() => {
                        if (!pass) return;
                        removeClaim(pass.ref);
                        setSelectedRef(null);
                      }}
                      className="font-label-sm text-label-sm text-text-tertiary hover:text-error transition-colors flex items-center gap-1"
                      type="button"
                    >
                      <Icon name="cancel" className="text-[16px]" />
                      <span>Cancel Claim &amp; Release Spot</span>
                    </button>
                    <button
                      onClick={() => onNav('storefront')}
                      className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1"
                      type="button"
                    >
                      <span>View Merchant Menu &amp; Location Map</span>
                      <Icon name="open_in_new" className="text-[16px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 rounded-xl bg-surface-subtle flex items-center justify-between text-text-secondary">
                <div className="flex items-center gap-2">
                  <Icon name="verified_user" className="text-badge-discount-text text-[18px]" />
                  <span className="font-caption text-caption">
                    VEMTAP NDPR Protected • Encrypted Token: VT-SEC-84092-ABJ
                  </span>
                </div>
                <button className="font-caption text-caption text-primary hover:underline" type="button">
                  Voucher Policy
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DesktopPage>
  );
}
