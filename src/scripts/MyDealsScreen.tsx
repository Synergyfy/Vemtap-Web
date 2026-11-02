import { useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { activeVouchers, pastVouchers, useClaims, voucherExpiryLabel, type ClaimRecord } from '../context/ClaimsContext';
import { useTotalSaved } from '../hooks/useCustomerDashboard';
import { useVoucherQr } from '../hooks/useVoucherQr';
import { NO_IMAGE } from '../utils/homeOffer';
import { UserAvatar } from '../components/ui/UserAvatar';

export type MyDealsTarget = 'orders' | 'help';

interface MyDealsScreenProps {
  onTab: (tab: MobileTabKey) => void;
  /** Opens this voucher's pass. */
  onShowPass: (claim: ClaimRecord) => void;
  /** Opens this gift's dispatch receipt. */
  onGiftReceipt: (claim: ClaimRecord) => void;
  onNavigate: (target: MyDealsTarget) => void;
}

const FILTERS = [
  { key: 'active', label: 'Active' },
  { key: 'past', label: 'Past' },
  { key: 'gifted', label: 'Gifted' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'VT';

function VoucherStrip({ code, onCopy, copied }: { code: string; onCopy: (code: string) => void; copied: boolean }) {
  return (
    <div className="flex items-center justify-between bg-surface-container-low px-space-sm py-1.5 rounded-lg">
      <div className="flex items-center gap-1.5">
        <span className="font-caption text-caption text-text-secondary font-medium">Voucher:</span>
        <span className="font-label-md text-label-md font-mono tracking-wider font-bold text-text-primary">{code}</span>
      </div>
      <button
        type="button"
        onClick={() => onCopy(code)}
        className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold hover:underline active:opacity-75"
      >
        <Icon name={copied ? 'check' : 'content_copy'} className="text-[15px]" />
        <span>{copied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>
  );
}

function ClaimCard({
  claim,
  copied,
  onCopy,
  onShowPass,
  onShowQr,
  onReceipt,
}: {
  claim: ClaimRecord;
  copied: string | null;
  onCopy: (code: string) => void;
  onShowPass?: () => void;
  onShowQr: () => void;
  onReceipt: () => void;
}) {
  const isGift = claim.kind === 'gift';
  const forOther = Boolean(claim.sentForOther);
  const recipientName = claim.recipient?.name;
  const pastLabel = !isGift && !forOther && (claim.state === 'REDEEMED' || claim.state === 'EXPIRED' || (claim.expiresAt ?? Infinity) <= Date.now())
    ? claim.state === 'REDEEMED' ? 'REDEEMED' : 'EXPIRED'
    : null;
  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm relative overflow-hidden transition-all hover:shadow-md">
      <div className="flex gap-space-sm items-start">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
          <img
            className="w-full h-full object-cover"
            alt={claim.dealTitle}
            src={claim.dealImage || NO_IMAGE}
          />
          {isGift || forOther ? null : (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold tracking-tight">
              {claim.code}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-caption text-[11px] font-semibold ${
                isGift || pastLabel
                  ? 'bg-surface-tint-blue text-primary'
                  : 'bg-badge-discount-bg text-badge-discount-text'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isGift || pastLabel ? 'bg-primary' : 'bg-badge-discount-text animate-pulse'
                }`}
              />
              {forOther ? `CLAIMED FOR ${(claim.recipient?.name || 'SOMEONE ELSE').toUpperCase()}` : isGift ? 'GIFT SENT' : pastLabel ?? 'READY TO REDEEM'}
            </span>
            <span className="font-caption text-caption text-text-tertiary shrink-0">{formatDate(claim.createdAt)}</span>
          </div>
          <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">{claim.dealBusiness}</h2>
          <p className="font-label-sm text-label-sm text-text-primary font-medium line-clamp-2">{claim.dealTitle}</p>
          {recipientName ? (
            <div className="flex items-center gap-1 text-text-secondary font-caption text-caption mt-1">
              <Icon name="person" className="text-[14px] text-primary" />
              <span className="truncate">
                {isGift ? `Gifted to ${recipientName}` : `Redeeming: ${recipientName}`}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {forOther || isGift || pastLabel ? null : <VoucherStrip code={claim.ref} onCopy={onCopy} copied={copied === claim.ref} />}

      <div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption px-1">
        <Icon name="info" className="text-[15px] text-primary" />
        <span>
          {forOther
            ? `${claim.recipient?.name || 'The recipient'} holds this voucher and redeems it. Status: ${claim.state ?? 'ACTIVE'}.`
            : isGift
            ? 'The recipient redeems this pass — your account is the sender of record.'
            : pastLabel === 'REDEEMED'
            ? 'This voucher has been redeemed.'
            : pastLabel
            ? 'This voucher has expired.'
            : `Show QR code to your server prior to ordering. ${voucherExpiryLabel(claim)}.`}
        </span>
      </div>

      {forOther || pastLabel ? null : <div className="grid grid-cols-2 gap-space-xs pt-1">
        {isGift ? (
          <>
            <button
              type="button"
              onClick={onShowQr}
              className="h-11 px-space-sm rounded-xl bg-primary-container text-on-primary-container font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
            >
              <Icon name="qr_code_2" className="text-[18px]" />
              <span>View Gift</span>
            </button>
            <button
              type="button"
              onClick={onReceipt}
              className="h-11 px-space-sm rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors active:scale-[0.98]"
            >
              <Icon name="receipt" className="text-[18px]" />
              <span>Receipt</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onShowQr}
              className="h-11 px-space-sm rounded-xl bg-primary-container text-on-primary-container font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
            >
              <Icon name="qr_code_2" className="text-[18px]" />
              <span>Use Deal</span>
            </button>
            <button
              type="button"
              onClick={onShowPass}
              className="h-11 px-space-sm rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors active:scale-[0.98]"
            >
              <Icon name="receipt" className="text-[18px]" />
              <span>View Pass</span>
            </button>
          </>
        )}
      </div>}
    </article>
  );
}

export function MyDealsScreen({ onTab, onShowPass, onGiftReceipt, onNavigate }: MyDealsScreenProps) {
  const [filter, setFilter] = useState<FilterKey>('active');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [qr, setQr] = useState<ClaimRecord | null>(null);
  // A gift belongs to its recipient, so the sender only sees its code.
  const qrImage = useVoucherQr(qr && qr.kind !== 'gift' ? qr.id : undefined);
  const totalSaved = useTotalSaved();
  const searchRef = useRef<HTMLInputElement>(null);

  const openQrForClaim = (claim: ClaimRecord) => {
    if (!claim.sentForOther) setQr(claim);
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopied(code);
    window.setTimeout(() => setCopied((current) => (current === code ? null : current)), 2000);
  };

  // Source of truth: the customer claim list from `/me/claims`, hydrated into the UI.
  const { claims } = useClaims();
  const needle = query.trim().toLowerCase();
  const matchesSearch = (claim: ClaimRecord) =>
    !needle ||
    [claim.dealBusiness, claim.dealTitle, claim.ref, claim.recipient?.name ?? '', claim.recipient?.email ?? '']
      .join(' ')
      .toLowerCase()
      .includes(needle);
  const activeClaims = activeVouchers(claims).filter(matchesSearch);
  const pastClaims = pastVouchers(claims).filter(matchesSearch);
  const giftedClaims = claims.filter((claim) => (claim.kind === 'gift' || claim.sentForOther) && matchesSearch(claim));
  const counts: Record<FilterKey, number> = {
    active: activeClaims.length,
    past: pastClaims.length,
    gifted: giftedClaims.length,
  };
  const latestGift = giftedClaims[0];

  const giftedSection = latestGift ? (
    <section className="px-margin mt-space-xl">
      <div className="flex items-center justify-between mb-space-xs">
        <div className="flex items-center gap-1.5">
          <Icon name="card_giftcard" className="text-[20px] text-primary" />
          <h3 className="font-heading-sm text-heading-sm text-text-primary">Gifted to Others</h3>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-text-secondary font-label-sm text-[12px]">
            {giftedClaims.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFilter('gifted')}
          className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
        >
          View All
        </button>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold font-label-md">
              {initialsOf(latestGift.recipient?.name ?? 'Gift')}
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-text-primary">
                {latestGift.recipient?.name ?? 'Gift recipient'}
              </span>
              <span className="font-caption text-caption text-text-secondary">
                {latestGift.recipient?.email ?? 'No contact on file'}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
            <Icon name="done_all" className="text-[12px]" />
            Sent
          </span>
        </div>
        <div className="bg-surface-subtle p-space-xs rounded-lg mt-1 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-text-primary font-medium">
              {latestGift.dealTitle}
            </span>
            <span className="font-caption text-caption text-text-tertiary">
              Sent on {formatDate(latestGift.createdAt)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onGiftReceipt(latestGift)}
            className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-0.5 hover:underline"
          >
            <span>Receipt</span>
            <Icon name="arrow_forward" className="text-[14px]" />
          </button>
        </div>
      </div>
    </section>
  ) : null;

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <h1 className="font-heading-md text-heading-md text-on-surface tracking-tight truncate">My Deals</h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Search"
              type="button"
              onClick={() => searchRef.current?.focus()}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="search" className="text-[24px]" />
            </button>
            <button
              aria-label="Filter"
              type="button"
              onClick={() => setFilter('active')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="tune" className="text-[24px]" />
            </button>
            <button
              aria-label="Account"
              type="button"
              onClick={() => onTab('account')}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs active:scale-95 transition-transform overflow-hidden"
            >
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-28 bg-surface">
        <div className="px-margin pt-space-xs pb-space-sm">
          <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl shadow-sm">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                <Icon name="savings" className="text-[18px]" filled />
              </div>
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-secondary">Total Savings to Date</span>
                <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
                  {formatCurrency(totalSaved)}
                </span>
              </div>
            </div>
            <div className="h-7 w-[1px] bg-outline-variant/30" />
            <div className="flex flex-col items-end">
                <span className="font-caption text-caption text-text-secondary">Claimed Deals</span>
                <span className="font-label-md text-label-md text-primary font-semibold">{claims.length} Total</span>
            </div>
          </div>
        </div>

        <div className="px-margin mb-space-sm">
          <div className="relative flex items-center">
            <Icon
              name="search"
              className="absolute left-space-md text-text-tertiary text-[20px] pointer-events-none"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full h-12 pl-11 pr-space-md bg-surface-container-lowest text-text-primary placeholder:text-text-tertiary font-body-md text-body-md rounded-xl shadow-sm focus:outline-none focus:bg-surface-canvas transition-all"
              placeholder="Search your claimed deals, businesses..."
              type="text"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar mb-space-md pl-margin">
          <div className="flex items-center gap-space-xs pr-margin">
            {FILTERS.map((item) => {
              const selected = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(item.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-label-md text-label-md transition-transform active:scale-95 whitespace-nowrap ${
                    selected
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'bg-surface-container-high text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] leading-none ${
                      selected ? 'bg-on-primary-container/20 text-on-primary-container font-bold' : 'bg-surface-variant text-text-secondary font-semibold'
                    }`}
                  >
                    {counts[item.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filter === 'active' && (
          <div className="px-margin flex flex-col gap-space-md">
            {activeClaims.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center gap-space-xs text-center">
                <Icon name="confirmation_number" className="text-[28px] text-primary" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">No active claims yet</h2>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Claim a deal and your voucher pass will appear here, ready to redeem in store.
                </p>
              </div>
            ) : (
              activeClaims.map((claim) => (
                <ClaimCard
                  key={claim.ref}
                  claim={claim}
                  copied={copied}
                  onCopy={copyCode}
                  onShowPass={() => onShowPass(claim)}
                  onShowQr={() => openQrForClaim(claim)}
                  onReceipt={() => onNavigate('orders')}
                />
              ))
            )}

          </div>
        )}

        {filter === 'past' && (
          <div className="px-margin flex flex-col gap-space-md">
            {pastClaims.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center gap-space-xs text-center">
                <Icon name="history" className="text-[28px] text-primary" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">No redeemed or expired deals yet</h2>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Once a merchant scans your pass it moves here.
                </p>
              </div>
            ) : (
              pastClaims.map((claim) => (
                <ClaimCard
                  key={claim.ref}
                  claim={claim}
                  copied={copied}
                  onCopy={copyCode}
                  onShowQr={() => undefined}
                  onReceipt={() => undefined}
                />
              ))
            )}
          </div>
        )}

        {filter === 'gifted' && (
          <div className="px-margin flex flex-col gap-space-md">
            {giftedClaims.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center gap-space-xs text-center">
                <Icon name="card_giftcard" className="text-[28px] text-primary" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">No gifts sent yet</h2>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Gift a deal from any voucher screen and it will show up here with its dispatch receipt.
                </p>
              </div>
            ) : (
              giftedClaims.map((claim) => (
                <ClaimCard
                  key={claim.ref}
                  claim={claim}
                  copied={copied}
                  onCopy={copyCode}
                  onShowQr={() => openQrForClaim(claim)}
                  onReceipt={() => onGiftReceipt(claim)}
                />
              ))
            )}
          </div>
        )}
        {filter === 'active' && giftedSection}

        <div className="px-margin mt-space-lg mb-space-md">
          <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm">
            <Icon name="help_outline" className="text-primary text-[22px] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                Need assistance redeeming?
              </h4>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Read our{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('help')}
                  className="text-primary font-semibold hover:underline"
                >
                  redemption guidelines
                </button>{' '}
                or tap the business info on your pass to contact the manager directly.
              </p>
            </div>
          </div>
        </div>
      </main>

      {qr && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) setQr(null);
          }}
        >
          <div className="w-full max-w-md bg-surface-canvas rounded-t-3xl p-space-lg shadow-2xl flex flex-col items-center">
            <div className="w-10 h-1 rounded-full bg-outline-variant/60 mb-space-md" />
            <div className="w-12 h-12 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary mb-space-xs">
              <Icon name="storefront" className="text-[26px]" />
            </div>
            <h3 className="font-heading-md text-heading-md text-text-primary text-center mb-0.5">{qr.dealBusiness}</h3>
            <p className="font-caption text-caption text-text-secondary text-center mb-space-md">
              Present this voucher code to your cashier or attendant.
            </p>
            <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm mb-space-md flex flex-col items-center">
              {qrImage ? <img alt={`QR code for ${qr.code}`} className="w-48 h-48" src={qrImage} /> : null}
              <span className="font-mono text-heading-sm font-bold tracking-widest text-text-primary mt-2">
                {qr.code}
              </span>
            </div>
            <div className="flex items-center gap-2 text-badge-discount-text font-label-sm text-label-sm mb-space-lg">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
              <span>{qr.kind === 'gift' ? 'The recipient redeems this gift' : voucherExpiryLabel(qr)}</span>
            </div>
            <button
              type="button"
              onClick={() => setQr(null)}
              className="w-full h-12 rounded-xl bg-surface-container text-text-primary font-button-primary text-button-primary hover:bg-surface-container-high transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <MobileTabBar active="deals" onTab={onTab} />
    </AppScreen>
  );
}
