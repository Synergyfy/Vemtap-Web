import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useDealDetail } from '../../hooks/useDealDetail';
import { useVoucherQr } from '../../hooks/useVoucherQr';
import { mapEmbedUrl } from '../../hooks/usePublicBusiness';
import { NO_IMAGE } from '../../utils/homeOffer';
import { Skeleton, SkeletonGroup } from '../../components/ui/Skeleton';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { currentVoucher, useClaims, type ClaimRecord } from '../../context/ClaimsContext';
import { useProfile } from '../../context/ProfileContext';

interface DesktopClaimedDealScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onContact: () => void;
  onReview: () => void;
  onCancelClaim: () => Promise<void>;
  /** Open this voucher; otherwise the latest one. */
  claim?: ClaimRecord | null;
}

const formatCurrency = (value: number | undefined) => {
  const safeValue = Number(value ?? 0);
  if (!Number.isFinite(safeValue) || safeValue <= 0) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

const REDEEM_STEPS = (business: string, code: string): { title: string; body: ReactNode }[] => [
  {
    title: 'Visit the Branch',
    body: `Head to ${business} to redeem your voucher.`,
  },
  {
    title: 'Notify Your Server',
    body: 'Mention you have an active VEMTAP voucher when placing your order.',
  },
  {
    title: 'Scan or Enter Code',
    body: (
      <>
        Show your QR Code or provide Claim Code <span className="font-semibold text-primary">{code}</span>.
      </>
    ),
  },
  {
    title: 'Enjoy & Save',
    body: 'Pay the discounted bill directly at the checkout counter.',
  },
];

export function DesktopClaimedDealScreen({
  onNav,
  onBack,
  onContact,
  onReview,
  onCancelClaim, claim: openClaim,
}: DesktopClaimedDealScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<null | 'redeem' | 'cancel'>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  // From `GET /me/claims`.
  const { claims, claimsLoading } = useClaims();
  const profile = useProfile();
  // `null` from a scanned link means that voucher isn't this account's.
  const claim = openClaim === undefined ? currentVoucher(claims) ?? null : openClaim;
  const liveDeal = useDealDetail(claim?.offerId);
  const terms = claim?.terms?.length ? claim.terms : liveDeal.detail?.terms ?? [];
  const claimCode = claim?.code ?? '';
  const businessName = claim?.dealBusiness ?? '';
  const offerTitle = claim?.dealTitle ?? '';
  const heroImage = claim?.dealImage ?? NO_IMAGE;
  const dealPrice = Number(claim?.dealPrice ?? 0);
  const dealOldPrice = Number(claim?.dealOldPrice ?? (claim?.dealPrice ?? dealPrice) ?? 0);
  const discountAmount = dealOldPrice > dealPrice ? Math.max(dealOldPrice - dealPrice, 0) : 0;
  const discountLabel = claim?.discountLabel ?? (discountAmount > 0 ? `Save ${formatCurrency(discountAmount)}` : 'Special offer');
  const holderName = claim?.recipient?.name || profile.fullName;
  const holderContact = claim?.recipient?.phone || claim?.recipient?.email || profile.maskedPhone;
  const redeemSteps = REDEEM_STEPS(businessName, claimCode);
  const expiryLabel = claim?.expiresAt
    ? new Date(claim.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;
  const claimState = claim?.state ?? 'ACTIVE';
  const usable = claimState === 'ACTIVE';
  const stateLabel = claimState === 'REDEEMED' ? 'REDEEMED' : claimState === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE CLAIM • READY TO USE';
  const hasPoint = claim?.dealLatitude != null && claim.dealLongitude != null;
  const directionsUrl = hasPoint
    ? `https://www.google.com/maps/search/?api=1&query=${claim.dealLatitude},${claim.dealLongitude}`
    : claim?.dealLocation
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(claim.dealLocation)}`
      : null;
  const mapUrl = mapEmbedUrl(claim?.dealLatitude ?? null, claim?.dealLongitude ?? null);
  const businessInitials = businessName.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();

  // Scanning opens this voucher's own pass page.
  const qrImage = useVoucherQr(claim?.id);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const showToast = (message: string) => {
    setToast(message);
    timers.current.push(
      window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200),
    );
  };

  const copyCode = () => {
    if (!navigator.clipboard) {
      showToast('Could not copy the code');
      return;
    }
    navigator.clipboard.writeText(claimCode).then(
      () => {
        setCopied(true);
        showToast(`Merchant Code Copied: ${claimCode}`);
        timers.current.push(window.setTimeout(() => setCopied(false), 2000));
      },
      () => showToast('Could not copy the code'),
    );
  };

  const sharePass = () => {
    const text = `${businessName} — ${offerTitle} (${claimCode})`;
    if (navigator.share) {
      navigator.share({ title: 'Claimed Deal Pass', text }).catch(() => undefined);
      return;
    }
    navigator.clipboard?.writeText(text).catch(() => undefined);
    showToast('Pass details copied to clipboard');
  };

  const handleConfirm = () => {
    if (confirming === 'redeem') {
      setConfirming(null);
      showBarcode();
    } else if (confirming === 'cancel') {
      setConfirming(null);
      onCancelClaim().catch(() => showToast('This claim couldn’t be cancelled. Please try again.'));
    }
  };

  const showBarcode = () => {
    qrRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Displaying full scannable pass');
  };

  if (!claim && claimsLoading) {
    return (
      <DesktopPage withHeader withFooter onNav={onNav} activeNav="my-deals">
        <SkeletonGroup label="Loading your voucher" className="w-full max-w-[1200px] mx-auto px-6 py-space-lg grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-space-md">
          <Skeleton className="h-[520px] w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </SkeletonGroup>
      </DesktopPage>
    );
  }

  if (!claim) {
    return (
      <DesktopPage withHeader withFooter onNav={onNav} activeNav="my-deals">
        <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
          <div className="max-w-md mx-auto px-margin pt-space-3xl">
            <div className="rounded-3xl bg-surface-canvas p-6 text-center shadow-sm space-y-3">
              <Icon name="local_activity" className="text-[32px] text-primary" />
              <p className="font-label-md text-label-md text-text-primary font-semibold">We couldn’t find this voucher.</p>
              <button type="button" onClick={onBack} className="h-11 w-full rounded-xl bg-primary text-on-primary font-button-primary text-button-primary">Go back</button>
            </div>
          </div>
        </div>
      </DesktopPage>
    );
  }

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="my-deals">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <nav className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-tertiary">
              <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
                Home
              </button>
              <Icon name="chevron_right" className="text-[16px]" />
              <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
                My Deals
              </button>
              <Icon name="chevron_right" className="text-[16px]" />
              <span className="text-text-primary font-semibold">Claimed Deal Pass</span>
            </nav>

            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Share deal"
                type="button"
                onClick={sharePass}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-text-secondary hover:text-text-primary font-label-sm text-label-sm shadow-sm transition-colors"
              >
                <Icon name="share" className="text-[18px]" />
                <span>Share</span>
              </button>
              <button
                aria-label="More options"
                type="button"
                onClick={() => showToast('Pass options: report issue, redeem rules, cancel')}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-text-secondary hover:text-text-primary shadow-sm transition-colors"
              >
                <Icon name="more_vert" className="text-[20px]" />
              </button>
            </div>
          </div>

          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-xs py-1 rounded-full mb-space-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Active Claim • Ready to Use
              </span>
            </span>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">Claimed Deal Pass</h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-space-2xs leading-relaxed">
              Your {businessName} claim is active — present the QR pass or claim code below to your
              server or cashier before billing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="flex flex-col gap-4 min-w-0">
              <div className="relative bg-surface-canvas rounded-2xl shadow-xl overflow-hidden">
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-surface-tint-blue blur-2xl pointer-events-none" />

                <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="inline-flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-xs py-1 rounded-full w-fit">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                      {stateLabel}
                    </span>
                  </div>
                  {expiryLabel ? (
<div className="inline-flex items-center gap-1 text-text-secondary">
                    <Icon name="hourglass_top" className="text-[16px] text-primary" />
                    <span className="font-caption text-caption">Expires {expiryLabel}</span>
                  </div>
) : null}
                </div>

                <div className="p-space-md space-y-space-sm">
                  <div className="relative w-full h-56 lg:h-64 rounded-xl overflow-hidden">
                    <img className="w-full h-full object-cover" alt={offerTitle} src={heroImage} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-space-xs left-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-xs py-0.5 rounded-full flex items-center gap-1 text-primary shadow-sm">
                      <Icon name="local_fire_department" className="text-[16px]" />
                      <span className="font-label-sm text-label-sm font-semibold">{discountLabel}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        {businessName}
                      </span>
                      <Icon name="verified" className="text-[16px] text-primary" filled />
                    </div>
                    <h2 className="font-heading-md text-heading-md text-text-primary font-semibold tracking-tight">
                      {offerTitle}
                    </h2>
                    <div className="flex items-start gap-1 text-text-secondary mt-1">
                      <Icon name="pin_drop" className="text-[16px] mt-0.5 text-primary" />
                      <p className="font-caption text-caption">
                        Nearby local branch • Your selected area
                      </p>
                    </div>
                  </div>

                  <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center justify-between">
                    <div>
                      <p className="font-caption text-caption text-text-secondary">Discounted Total</p>
                      <p className="font-heading-md text-heading-md text-primary font-bold">{formatCurrency(dealPrice)}</p>
                    </div>
                    <div className="text-right">
                      {dealOldPrice > dealPrice ? (
                        <p className="font-caption text-caption text-text-tertiary line-through">{formatCurrency(dealOldPrice)} Reg.</p>
                      ) : null}
                      {discountAmount > 0 ? (
                        <span className="inline-block bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded-md">
                          {discountLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center justify-center my-1">
                  <div className="absolute -left-3 w-6 h-6 rounded-full bg-surface" />
                  <div className="w-full border-t border-dashed border-border-subtle mx-4" />
                  <div className="absolute -right-3 w-6 h-6 rounded-full bg-surface" />
                </div>

                <div className="p-space-md text-center space-y-space-sm bg-surface-subtle" ref={qrRef}>
                  <div className="inline-block p-space-sm bg-surface-canvas rounded-2xl shadow-sm">
                    <div className="w-56 h-56 mx-auto flex items-center justify-center relative bg-surface rounded-lg p-2">
                      {qrImage ? <img alt={`QR code for ${claimCode}`} className="w-full h-full" src={qrImage} /> : <span className="font-caption text-caption text-text-secondary text-center px-2">Show code {claimCode} to the cashier</span>}
                    </div>
                    <span className="inline-block mt-2 font-caption text-caption text-text-secondary font-medium">
                      Scan to Open This Pass
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-space-xs">
                    <div className="bg-surface-canvas p-space-xs rounded-xl flex flex-col items-center justify-center">
                      <span className="font-caption text-caption text-text-secondary">Merchant Code</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-heading-sm text-heading-sm font-bold text-text-primary tracking-wider">
                          {claimCode}
                        </span>
                        <button
                          type="button"
                          onClick={copyCode}
                          title="Copy code"
                          aria-label="Copy claim code"
                          className="w-7 h-7 flex items-center justify-center text-primary rounded-full hover:bg-surface-tint-blue"
                        >
                          <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="font-caption text-caption text-text-secondary px-space-sm">
                    Present this digital pass to your server or cashier before billing.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left pt-1">
                    <div className="p-3 rounded-xl bg-surface-canvas shadow-sm">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Pass Holder
                      </span>
                      <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                        {holderName}
                      </p>
                      <p className="font-caption text-caption text-text-secondary">{holderContact}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-canvas shadow-sm">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Validity Window
                      </span>
                      <p className="font-caption text-caption text-error font-medium">
                        {expiryLabel ? `Expires ${expiryLabel}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-tint-blue flex items-start gap-2 text-text-primary text-left">
                    <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
                    <p className="font-caption text-caption leading-relaxed">
                      <strong>Settlement Notice:</strong> Pay the discounted bill directly to the{' '}
                      <strong>{businessName}</strong> cashier at redemption. Zero upfront checkout
                      fees charged by VEMTAP.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Claim Verification</h3>
                  <span className="bg-surface-container-high text-text-secondary px-2 py-0.5 rounded-full font-label-sm text-label-sm">
                    #{claimCode}
                  </span>
                </div>
                <div className="space-y-space-xs text-body-md font-body-md">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-secondary font-caption text-caption">Claimed On</span>
                    <span className="text-text-primary font-medium text-caption">
                      {claim
                        ? new Date(claim.createdAt).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                    : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-secondary font-caption text-caption">Claim Holder</span>
                    <div className="flex items-center gap-1">
                      <span className="text-text-primary font-medium text-caption">{holderName}</span>
                      <Icon name="verified_user" className="text-primary text-[14px]" filled />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-secondary font-caption text-caption">Contact</span>
                    <span className="text-text-primary font-medium text-caption text-right">{holderContact}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-secondary font-caption text-caption">Payment Mode</span>
                    <span className="text-text-primary font-medium text-caption text-right">
                      In-person (Cash / POS / Transfer)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-secondary font-caption text-caption">Usage Allocation</span>
                    <span className="bg-surface-tint-blue text-primary px-2 py-0.5 rounded-md font-label-sm text-label-sm font-medium">
                      {claim?.kind === 'someone-else' && claim.recipient
                        ? `For ${claim.recipient.name}`
                        : 'Personal Use'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="verified" className="text-[18px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">How to Redeem</h3>
                    <p className="font-caption text-caption text-text-secondary">4 quick steps at the business</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                  {redeemSteps.map((step, index) => (
                    <div
                      className="flex items-start gap-space-sm p-3 rounded-xl bg-surface-subtle"
                      key={step.title}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm font-semibold shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-body-md text-body-md font-medium text-text-primary">{step.title}</p>
                        <p className="font-caption text-caption text-text-secondary">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {terms.length ? (
<div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-xs">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Terms &amp; Deal Rules</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-space-xs text-text-secondary font-caption text-caption">
                  {terms.map((term) => (
                <li key={term} className="flex items-center gap-2">
                  <Icon name="check_circle" className="text-[16px] text-primary" />
                  <span>{term}</span>
                </li>
              ))}
                </ul>
              </div>
) : null}

              <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold">
                      {businessInitials}
                    </div>
                    <div>
                      <h4 className="font-heading-sm text-heading-sm text-text-primary">{businessName}</h4>
                    </div>
                  </div>
                </div>

                {mapUrl ? <iframe title={`Map of ${businessName}`} className="w-full h-32 rounded-xl shadow-inner" src={mapUrl} loading="lazy" /> : null}

                <div className="grid grid-cols-2 gap-space-xs pt-1">
                  {claim?.dealPhone ? (
<a
 href={`tel:${claim.dealPhone}`}
                    className="h-10 rounded-xl bg-surface-container-low text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="call" className="text-[18px] text-primary" />
                    <span>Call Branch</span>
                  </a>
) : null}
                  <button
                    type="button"
                    onClick={onContact}
                    className="h-10 rounded-xl bg-surface-container-low text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="forum" className="text-[18px] text-primary" />
                    <span>In-App Chat</span>
                  </button>
                </div>
              </div>
            </div>

            <aside className="w-full flex flex-col gap-4 lg:sticky lg:top-24">
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
                    Pass Actions
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-semibold">{usable ? 'Ready' : claimState === 'REDEEMED' ? 'Redeemed' : 'Expired'}</span>
                </div>

                {usable && (
                <button
                  type="button"
                  onClick={() => setConfirming('redeem')}
                  className="h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md hover:bg-primary active:scale-[0.98] transition-all"
                >
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Use Deal Now (Confirm In-Store)</span>
                </button>
                )}

                <div className="grid grid-cols-2 gap-space-xs">
                  <button
                    type="button"
                    onClick={onContact}
                    className="h-11 rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="chat" className="text-[18px]" />
                    <span>Direct Chat</span>
                  </button>
                  {directionsUrl ? (
<a
 href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="directions" className="text-[18px]" />
                    <span>Get Directions</span>
                  </a>
) : null}
                </div>

                <div className="h-px bg-border-subtle" />

                <div className="grid grid-cols-2 gap-space-xs">
                  <button
                    type="button"
                    onClick={showBarcode}
                    className="h-11 px-2 rounded-xl bg-surface-container-low text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="qr_code_scanner" className="text-[20px]" />
                    <span>Barcode</span>
                  </button>
                  {usable && (
                  <button
                    type="button"
                    onClick={() => setConfirming('redeem')}
                    className="h-11 px-2 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md hover:bg-primary active:scale-[0.98] transition-all"
                  >
                    <Icon name="bolt" className="text-[20px]" />
                    <span>Use Deal</span>
                  </button>
                  )}
                </div>

                <div className="h-px bg-border-subtle" />

                <div className="grid grid-cols-2 gap-space-xs">
                  <button
                    type="button"
                    onClick={sharePass}
                    className="h-10 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md font-medium flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="share" className="text-[18px] text-primary" />
                    <span>Share Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={onReview}
                    className="h-10 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md font-medium flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="rate_review" className="text-[18px] text-primary" />
                    <span>Review Merchant</span>
                  </button>
                </div>

                {usable && (
                <button
                  type="button"
                  onClick={() => setConfirming('cancel')}
                  className="font-caption text-caption text-text-tertiary hover:text-error transition-colors underline pt-1"
                >
                  Cancel this claim (releases voucher for others)
                </button>
                )}
              </div>

              <div className="px-4 py-3 rounded-xl bg-surface-tint-blue flex items-start gap-2">
                <Icon name="info" className="text-primary text-[18px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  In-person settlement: pay the discounted bill directly at{' '}
                  <strong className="text-text-primary">{businessName}</strong>.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-canvas rounded-2xl p-space-lg w-full max-w-sm space-y-space-md shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center mx-auto">
              <Icon name="storefront" className="text-[28px]" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-heading-md text-heading-md text-text-primary font-semibold">
                {confirming === 'cancel' ? 'Cancel Claim?' : 'Confirm In-Store Redemption'}
              </h4>
              <p className="font-body-md text-body-md text-text-secondary">
                {confirming === 'cancel'
                  ? 'This voucher will be returned to the pool for other foodies. This cannot be undone.'
                  : `Make sure your server is ready to scan or note code ${claimCode} before closing this session.`}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center hover:bg-primary transition-colors"
              >
                {confirming === 'cancel' ? 'Yes, Cancel Claim' : 'Yes, Present Now'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="w-full h-10 rounded-xl bg-transparent text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center hover:text-text-primary transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-text-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </DesktopPage>
  );
}
