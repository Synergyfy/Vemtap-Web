import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { useClaims, type ClaimRecord } from '../context/ClaimsContext';

export type MyDealsTarget = 'orders' | 'gift-sent' | 'help';

interface MyDealsScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onShowPass: () => void;
  onNavigate: (target: MyDealsTarget) => void;
}

const URBAN_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBtUv6B8-bTHQgNJ5PXGNef2gEEXADX5DcmFBbYUJ-93hUriTuC5gdhgOpWuXr8-DhBStRXQunlJY5F9SdbkcdBi8xvdvz-GntvTSaV6q5gL_NewJ4iBPOb1hcQhqeF_PpIhen2N-Ge140mAfbDyY6ul2n97u9nvM3MeYDbipHkt775pu0Me4sJkMWmMlYa29eu16r-L8ZOymw6wi-sxBPMQhh0dCKUVc4qc6ZPE6yNd5QRd57GJbL29w';


const FILTERS = [
  { key: 'active', label: 'Active' },
  { key: 'gifted', label: 'Gifted' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

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
  const recipientName = claim.recipient?.name;
  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm relative overflow-hidden transition-all hover:shadow-md">
      <div className="flex gap-space-sm items-start">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
          <img
            className="w-full h-full object-cover"
            alt={claim.dealTitle}
            src={claim.dealImage ?? URBAN_IMG}
          />
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold tracking-tight">
            {claim.code}
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-caption text-[11px] font-semibold ${
                isGift
                  ? 'bg-surface-tint-blue text-primary'
                  : 'bg-badge-discount-bg text-badge-discount-text'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isGift ? 'bg-primary' : 'bg-badge-discount-text animate-pulse'
                }`}
              />
              {isGift ? 'GIFT SENT' : 'READY TO REDEEM'}
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

      <VoucherStrip code={claim.ref} onCopy={onCopy} copied={copied === claim.ref} />

      <div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption px-1">
        <Icon name="info" className="text-[15px] text-primary" />
        <span>
          {isGift
            ? 'The recipient redeems this pass — your account is the sender of record.'
            : 'Show QR code to your server prior to ordering.'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-space-xs pt-1">
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
      </div>
    </article>
  );
}

export function MyDealsScreen({ onTab, onShowPass, onNavigate }: MyDealsScreenProps) {
  const [filter, setFilter] = useState<FilterKey>('active');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [qr, setQr] = useState<{ business: string; code: string; source?: 'claim' | 'gift' } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const openQrForClaim = async (claim: ClaimRecord) => {
    const identifier = claim.id ?? claim.ref ?? claim.code;
    try {
      if (claim.kind === 'gift') {
        await getGift(identifier);
      } else {
        await getClaimQr(identifier);
      }
    } catch {
      // The UI keeps the local voucher fallback if the live endpoint is unavailable.
    }

    setQr({ business: claim.dealBusiness, code: claim.ref, source: claim.kind === 'gift' ? 'gift' : 'claim' });
  };

  useEffect(() => {
    return () => undefined;
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopied(code);
    window.setTimeout(() => setCopied((current) => (current === code ? null : current)), 2000);
  };

  // Source of truth: the customer claim list from `/me/claims`, hydrated into the UI.
  const { claims, getClaimQr, getGift } = useClaims();
  const needle = query.trim().toLowerCase();
  const matchesSearch = (claim: ClaimRecord) =>
    !needle ||
    [claim.dealBusiness, claim.dealTitle, claim.ref, claim.recipient?.name ?? '', claim.recipient?.email ?? '']
      .join(' ')
      .toLowerCase()
      .includes(needle);
  const activeClaims = claims.filter((claim) => claim.kind !== 'gift' && matchesSearch(claim));
  const giftedClaims = claims.filter((claim) => claim.kind === 'gift' && matchesSearch(claim));
  const counts: Record<FilterKey, number> = {
    active: activeClaims.length,
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
              Sent on {formatDate(latestGift.createdAt)} • {latestGift.ref}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('gift-sent')}
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
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs active:scale-95 transition-transform"
            >
              <Icon name="person" className="text-on-primary text-[18px]" />
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
                  {activeClaims.length > 0 ? 'Live' : '—'}
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
                  onShowPass={onShowPass}
                  onShowQr={() => void openQrForClaim(claim)}
                  onReceipt={() => onNavigate('orders')}
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
                  onShowQr={() => void openQrForClaim(claim)}
                  onReceipt={() => onNavigate('gift-sent')}
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
            <h3 className="font-heading-md text-heading-md text-text-primary text-center mb-0.5">{qr.business}</h3>
            <p className="font-caption text-caption text-text-secondary text-center mb-space-md">
              Present this voucher code to your cashier or attendant.
            </p>
            <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm mb-space-md flex flex-col items-center">
              <svg className="w-48 h-48 text-text-primary" fill="currentColor" viewBox="0 0 100 100">
                <rect fill="none" height="26" rx="2" stroke="currentColor" strokeWidth="4" width="26" x="10" y="10" />
                <rect height="12" rx="1" width="12" x="17" y="17" />
                <rect fill="none" height="26" rx="2" stroke="currentColor" strokeWidth="4" width="26" x="64" y="10" />
                <rect height="12" rx="1" width="12" x="71" y="17" />
                <rect fill="none" height="26" rx="2" stroke="currentColor" strokeWidth="4" width="26" x="10" y="64" />
                <rect height="12" rx="1" width="12" x="17" y="71" />
                <rect height="5" width="5" x="42" y="14" />
                <rect height="6" width="6" x="50" y="22" />
                <rect height="4" width="6" x="42" y="32" />
                <rect height="6" width="6" x="12" y="44" />
                <rect height="4" width="8" x="24" y="48" />
                <rect height="6" width="6" x="38" y="44" />
                <rect height="8" width="8" x="48" y="46" />
                <rect height="6" width="5" x="62" y="42" />
                <rect height="6" width="6" x="74" y="44" />
                <rect height="8" width="6" x="84" y="42" />
                <rect height="6" width="8" x="42" y="62" />
                <rect height="8" width="6" x="56" y="60" />
                <rect height="5" width="8" x="68" y="64" />
                <rect height="6" width="6" x="82" y="68" />
                <rect height="8" width="6" x="44" y="76" />
                <rect height="6" width="10" x="56" y="80" />
                <rect height="8" width="8" x="72" y="78" />
                <rect height="6" width="6" x="84" y="82" />
              </svg>
              <span className="font-mono text-heading-sm font-bold tracking-widest text-text-primary mt-2">
                {qr.code}
              </span>
            </div>
            <div className="flex items-center gap-2 text-badge-discount-text font-label-sm text-label-sm mb-space-lg">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
              <span>Valid for in-store checkout right now</span>
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
