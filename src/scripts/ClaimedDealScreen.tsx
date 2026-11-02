import { useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { useDealDetail } from '../hooks/useDealDetail';
import { useVoucherQr } from '../hooks/useVoucherQr';
import { mapEmbedUrl } from '../hooks/usePublicBusiness';
import { NO_IMAGE } from '../utils/homeOffer';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import { Icon } from '../components/ui/Icon';
import { currentVoucher, useClaims, type ClaimRecord } from '../context/ClaimsContext';
import { useProfile } from '../context/ProfileContext';

interface ClaimedDealScreenProps {
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

const REDEEM_STEPS = (business: string, code: string) => [
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
    body: <>Show your QR Code or provide Claim Code <span className="font-semibold text-primary">{code}</span>.</>,
  },
  {
    title: 'Enjoy & Save',
    body: 'Pay the discounted bill directly at the checkout counter.',
  },
];

export function ClaimedDealScreen({ onBack, onContact, onReview, onCancelClaim, claim: openClaim }: ClaimedDealScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<null | 'redeem' | 'cancel'>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

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

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200);
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
        window.setTimeout(() => setCopied(false), 2000);
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
      <AppScreen>
        <SkeletonGroup label="Loading your voucher" className="px-margin pt-10 space-y-space-sm">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </SkeletonGroup>
      </AppScreen>
    );
  }

  if (!claim) {
    return (
      <AppScreen>
        <div className="px-margin pt-10">
          <div className="rounded-3xl bg-surface-canvas p-6 text-center shadow-sm space-y-3">
            <Icon name="local_activity" className="text-[32px] text-primary" />
            <p className="font-label-md text-label-md text-text-primary font-semibold">We couldn’t find this voucher.</p>
            <button type="button" onClick={onBack} className="h-11 w-full rounded-xl bg-primary text-on-primary font-button-primary text-button-primary">Go back</button>
          </div>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:text-primary transition-colors"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate max-w-[200px]">
              Claimed Deal Pass
            </h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Share deal"
              type="button"
              onClick={sharePass}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="share" className="text-[24px]" />
            </button>
            <button
              aria-label="More options"
              type="button"
              onClick={() => showToast('Pass options: report issue, redeem rules, cancel')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="more_vert" className="text-[24px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface">
        <div className="px-margin pt-space-xs pb-space-2xl space-y-space-md">
          <div className="relative w-full rounded-2xl bg-surface-canvas shadow-xl overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-secondary-fixed/40 blur-2xl pointer-events-none" />

            <div className="p-space-md bg-surface-container-low flex flex-col gap-space-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-xs py-1 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  {stateLabel}
                </span>
              </div>
              {expiryLabel ? (
<div className="inline-flex items-center gap-1 text-on-surface-variant">
                <Icon name="hourglass_top" className="text-[16px] text-tertiary" />
                <span className="font-caption text-caption">Expires {expiryLabel}</span>
              </div>
) : null}
            </div>

            <div className="p-space-md space-y-space-sm">
              <div className="relative w-full h-44 rounded-xl overflow-hidden">
                <img className="w-full h-full object-cover" alt={offerTitle} src={heroImage} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-space-xs left-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-xs py-0.5 rounded-full flex items-center gap-1 text-primary shadow-sm">
                  <Icon name="local_fire_department" className="text-[16px]" />
                  <span className="font-label-sm text-label-sm font-semibold">{discountLabel}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-primary">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">{businessName}</span>
                  <Icon name="verified" className="text-[16px] text-primary-container" filled />
                </div>
                <h2 className="font-heading-md text-heading-md text-on-surface font-semibold tracking-tight">
                  {offerTitle}
                </h2>
                <div className="flex items-start gap-1 text-on-surface-variant mt-1">
                  <Icon name="pin_drop" className="text-[16px] mt-0.5 text-primary" />
                  <p className="font-caption text-caption">
                    Nearby local branch • Your selected area
                  </p>
                </div>
              </div>

              <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center justify-between">
                <div>
                  <p className="font-caption text-caption text-on-surface-variant">Discounted Total</p>
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
              <div className="w-full border-t border-dashed border-outline-variant/50 mx-4" />
              <div className="absolute -right-3 w-6 h-6 rounded-full bg-surface" />
            </div>

            <div className="p-space-md text-center space-y-space-sm bg-surface-subtle" ref={qrRef}>
              <div className="inline-block p-space-sm bg-surface-canvas rounded-2xl shadow-sm">
                <div className="w-48 h-48 mx-auto flex items-center justify-center relative bg-surface-bright rounded-lg p-2">
                  {qrImage ? <img alt={`QR code for ${claimCode}`} className="w-full h-full" src={qrImage} /> : <span className="font-caption text-caption text-text-secondary text-center px-2">Show code {claimCode} to the cashier</span>}
                </div>
                <span className="inline-block mt-2 font-caption text-caption text-on-surface-variant font-medium">
                  Scan to Open This Pass
                </span>
              </div>

              <div className="grid grid-cols-1 gap-space-xs">
                <div className="bg-surface-canvas p-space-xs rounded-xl flex flex-col items-center justify-center">
                  <span className="font-caption text-caption text-on-surface-variant">Merchant Code</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-heading-sm text-heading-sm font-bold text-on-surface tracking-wider">
                      {claimCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      title="Copy code"
                      className="w-7 h-7 flex items-center justify-center text-primary rounded-full hover:bg-surface-tint-blue"
                    >
                      <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="font-caption text-caption text-on-surface-variant px-space-sm">
                Present this digital pass to your server or cashier before billing.
              </p>
            </div>
          </div>

          <div className="space-y-space-xs">
            {usable && (
            <button
              type="button"
              onClick={() => setConfirming('redeem')}
              className="w-full h-11 rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-transform"
            >
              <Icon name="check_circle" className="text-[20px]" />
              <span>Use Deal Now (Confirm In-Store)</span>
            </button>
            )}
            <div className="grid grid-cols-2 gap-space-xs">
              <button
                type="button"
                onClick={onContact}
                className="h-11 rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
              >
                <Icon name="chat" className="text-[18px]" />
                <span>Direct Chat</span>
              </button>
              {directionsUrl ? (
<a
 href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="h-11 rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
              >
                <Icon name="directions" className="text-[18px]" />
                <span>Get Directions</span>
              </a>
) : null}
            </div>
          </div>

          <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-sm text-heading-sm text-on-surface">Claim Verification</h3>
              <span className="bg-surface-container-high text-on-secondary-container px-2 py-0.5 rounded-full font-label-sm text-label-sm">
                #{claimCode}
              </span>
            </div>
            <div className="space-y-space-xs text-body-md font-body-md">
              <div className="flex items-center justify-between py-1">
                <span className="text-on-surface-variant font-caption text-caption">Claimed On</span>
                <span className="text-on-surface font-medium text-caption">
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
                <span className="text-on-surface-variant font-caption text-caption">Claim Holder</span>
                <div className="flex items-center gap-1">
                  <span className="text-on-surface font-medium text-caption">{holderName}</span>
                  <Icon name="verified_user" className="text-primary text-[14px]" filled />
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-on-surface-variant font-caption text-caption">Contact</span>
                <span className="text-on-surface font-medium text-caption text-right">{holderContact}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-on-surface-variant font-caption text-caption">Payment Mode</span>
                <span className="text-on-surface font-medium text-caption text-right">
                  In-person (Cash / POS / Transfer)
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-on-surface-variant font-caption text-caption">Usage Allocation</span>
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
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-primary">
                <Icon name="verified" className="text-[18px]" />
              </div>
              <div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface">How to Redeem</h3>
                <p className="font-caption text-caption text-on-surface-variant">4 quick steps at the business</p>
              </div>
            </div>
            <div className="space-y-space-sm relative">
              {redeemSteps.map((step, index) => (
                <div key={step.title} className="flex items-start gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-semibold shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-body-md text-body-md font-medium text-on-surface">{step.title}</p>
                    <p className="font-caption text-caption text-on-surface-variant">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {terms.length ? (
<div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-xs">
            <h3 className="font-heading-sm text-heading-sm text-on-surface">Terms &amp; Deal Rules</h3>
            <ul className="space-y-space-2xs text-on-surface-variant font-caption text-caption">
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
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold">
                  {businessInitials}
                </div>
                <div>
                  <h4 className="font-heading-sm text-heading-sm text-on-surface">{businessName}</h4>
                </div>
              </div>
            </div>

            {mapUrl ? <iframe title={`Map of ${businessName}`} className="w-full h-32 rounded-xl shadow-inner" src={mapUrl} loading="lazy" /> : null}

            <div className="grid grid-cols-2 gap-space-xs pt-1">
              {claim?.dealPhone ? (
<a
 href={`tel:${claim.dealPhone}`}
                className="h-10 rounded-xl bg-surface-container-low text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
              >
                <Icon name="call" className="text-[18px] text-primary" />
                <span>Call Branch</span>
              </a>
) : null}
              <button
                type="button"
                onClick={onContact}
                className="h-10 rounded-xl bg-surface-container-low text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
              >
                <Icon name="forum" className="text-[18px] text-primary" />
                <span>In-App Chat</span>
              </button>
            </div>
          </div>

          <div className="space-y-space-sm pt-space-xs text-center">
            <div className="flex items-center justify-center gap-space-md">
              <button
                type="button"
                onClick={sharePass}
                className="flex items-center gap-1 text-primary font-label-md text-label-md font-medium"
              >
                <Icon name="share" className="text-[18px]" />
                <span>Share Pass</span>
              </button>
              <span className="text-outline-variant">•</span>
              <button
                type="button"
                onClick={onReview}
                className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md font-medium"
              >
                <Icon name="rate_review" className="text-[18px]" />
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
        </div>

        <div className="sticky bottom-0 left-0 right-0 w-full bg-surface-canvas/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin py-space-sm pb-safe flex items-center gap-space-xs z-40">
          <button
            type="button"
            onClick={showBarcode}
            className="h-11 px-space-md rounded-2xl bg-surface-container-low text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
          >
            <Icon name="qr_code_scanner" className="text-[20px]" />
            <span>Barcode</span>
          </button>
          {usable && (
          <button
            type="button"
            onClick={() => setConfirming('redeem')}
            className="flex-1 h-11 rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_4px_16px_-2px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-transform"
          >
            <Icon name="bolt" className="text-[20px]" />
            <span>Use Deal</span>
          </button>
          )}
        </div>
      </main>

      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-canvas rounded-2xl p-space-lg w-full max-w-sm space-y-space-md shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center mx-auto">
              <Icon name="storefront" className="text-[28px]" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-heading-md text-heading-md text-on-surface font-semibold">
                {confirming === 'cancel' ? 'Cancel Claim?' : 'Confirm In-Store Redemption'}
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {confirming === 'cancel'
                  ? 'This voucher will be returned to the pool for other foodies. This cannot be undone.'
                  : `Make sure your server is ready to scan or note code ${claimCode} before closing this session.`}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center"
              >
                {confirming === 'cancel' ? 'Yes, Cancel Claim' : 'Yes, Present Now'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="w-full h-10 rounded-xl bg-transparent text-on-surface-variant font-button-secondary text-button-secondary flex items-center justify-center"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-md text-label-md shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
