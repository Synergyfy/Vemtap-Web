import { useEffect, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import { useLocation, formatDistanceKm } from '../context/LocationContext';
import { useDealLikes } from '../hooks/useDealLikes';
import { dealDistanceKm, dealEndsLabel, dealWhatsappLink, useDealSaved, type DealDetail } from '../hooks/useDealDetail';
import { mapEmbedUrl, todayHours } from '../hooks/usePublicBusiness';
import { getAccessToken } from '../services/api/client';
import { NO_IMAGE } from '../utils/homeOffer';

interface DealDetailScreenProps {
  onBack: () => void;
  onHowToClaim: () => void;
  onTerms: () => void;
  onComments: () => void;
  onReviews: () => void;
  onShare: () => void;
  onClaim: () => void;
  onMerchant: () => void;
  claimed: boolean;
  onViewWallet: () => void;
  /** Live deal; null while loading or when it could not be loaded. */
  detail: DealDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Opens the chat with the deal's business; rejects when it can't be opened. */
  onChat: () => Promise<void>;
}

const naira = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

/** Loading state in the shape of the page, so no stand-in data shows first. */
function DealDetailSkeleton() {
  return (
    <SkeletonGroup label="Loading deal">
      <Skeleton className="w-full h-80 rounded-none" />
      <div className="flex flex-col px-margin pt-space-lg pb-32">
        <div className="flex items-center gap-space-sm">
          <Skeleton className="w-11 h-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <Skeleton className="mt-space-md h-7 w-3/4" />
        <Skeleton className="mt-space-xs h-9 w-1/2" />
        <div className="flex gap-space-xs mt-space-md">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <Skeleton className="mt-space-lg h-28 w-full rounded-xl" />
        <Skeleton className="mt-space-md h-40 w-full rounded-xl" />
        <div className="mt-space-md flex flex-col gap-space-xs">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </SkeletonGroup>
  );
}

function NavRow({
  icon,
  iconClass,
  title,
  subtitle,
  onClick,
}: {
  icon: string;
  iconClass: string;
  title: string;
  subtitle: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-surface-canvas rounded-xl p-space-md flex items-center justify-between shadow-sm active:bg-surface-subtle transition-colors text-left"
    >
      <div className="flex items-center gap-space-sm">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon name={icon} className="text-[20px]" />
        </div>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md font-semibold text-text-primary">{title}</span>
          <span className="font-caption text-caption text-text-secondary">{subtitle}</span>
        </div>
      </div>
      <Icon name="chevron_right" className="text-outline text-[20px]" />
    </button>
  );
}

export function DealDetailScreen({
  onBack,
  onHowToClaim,
  onTerms,
  onComments,
  onReviews,
  onShare,
  onClaim,
  onMerchant,
  claimed,
  onViewWallet,
  detail,
  loading,
  error,
  onRetry,
  onChat,
}: DealDetailScreenProps) {
  const [expanded, setExpanded] = useState(false);
  const dealId = detail?.id;
  const { likes, toggleLike } = useDealLikes(dealId ? [dealId] : []);
  const { saved, toggle: toggleSaved } = useDealSaved(dealId);
  const { lat, lng } = useLocation();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setPhotoIndex(0);
    setExpanded(false);
  }, [dealId]);

  if (!detail) {
    return (
      <AppScreen>
        <ScreenHeader title="Deal Detail" onBack={onBack} />
        {loading ? (
          <DealDetailSkeleton />
        ) : (
          <div className="px-margin pt-10">
            <div className="rounded-3xl bg-surface-canvas p-6 text-center shadow-sm space-y-3">
              <Icon name="local_activity" className="text-[32px] text-primary" />
              <p className="font-label-md text-label-md text-text-primary font-semibold">{error ?? 'This deal couldn’t be loaded.'}</p>
              <button type="button" onClick={onRetry} className="h-11 w-full rounded-xl bg-primary text-on-primary font-button-primary text-button-primary">Try again</button>
            </div>
          </div>
        )}
      </AppScreen>
    );
  }

  const photos = detail.images.length ? detail.images : [detail.image ?? NO_IMAGE];
  const dealImage = photos[Math.min(photoIndex, photos.length - 1)];
  const discountPercent = detail.discountPercent;
  const saving = detail.oldPrice - detail.price;
  const liked = likes[detail.id]?.liked ?? false;
  const likesCount = likes[detail.id]?.count ?? detail.likesCount;
  const hours = detail.profile ? todayHours(detail.profile.hours) : null;
  const distance = formatDistanceKm(dealDistanceKm(detail, lat, lng));
  const mapEmbed = mapEmbedUrl(detail.latitude, detail.longitude);
  const whatsapp = dealWhatsappLink(detail);
  const subtitleParts = [detail.category, distance, detail.branchName].filter(Boolean);
  const pills = [
    { icon: 'schedule', label: dealEndsLabel(detail.endDate) ?? (detail.isExpired ? 'Deal ended' : null) },
    { icon: 'storefront', label: detail.channelsLabel },
    { icon: 'person', label: detail.claimLimitLabel },
  ].filter((pill): pill is { icon: string; label: string } => Boolean(pill.label));

  const requireSignIn = () => {
    if (getAccessToken()) return false;
    setActionError('Please sign in to do that.');
    return true;
  };
  const onLike = () => {
    if (requireSignIn()) return;
    setActionError(null);
    toggleLike(detail.id).catch(() => setActionError('That didn’t save. Please try again.'));
  };
  const openChat = () => {
    if (requireSignIn()) return;
    setActionError(null);
    onChat().catch(() => setActionError('Chat couldn’t be opened. Please try again.'));
  };
  const onSave = () => {
    if (requireSignIn()) return;
    setActionError(null);
    toggleSaved().catch(() => setActionError('That didn’t save. Please try again.'));
  };

  return (
    <AppScreen>
      <ScreenHeader
        title="Deal Detail"
        onBack={onBack}
        trailing={
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Share deal"
              type="button"
              onClick={onShare}
              className="w-11 h-11 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary active:scale-95 transition-transform"
            >
              <Icon name="share" className="text-[22px]" />
            </button>
            <button
              aria-label="Save to favorites"
              type="button"
              onClick={onSave}
              className="w-11 h-11 flex items-center justify-center rounded-full active:scale-95 transition-transform"
            >
              <Icon
                name={saved ? 'favorite' : 'favorite_border'}
                filled={saved}
                className={`text-[22px] ${saved ? 'text-error' : 'text-text-secondary hover:text-text-primary'}`}
              />
            </button>
          </div>
        }
      />

      <div className="relative w-full h-80 bg-surface-container-low overflow-hidden shrink-0">
        <img className="w-full h-full object-cover" alt={detail.title} src={dealImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-4 left-margin right-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            {discountPercent > 0 && (
              <span className="inline-flex items-center px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-md text-label-md font-bold shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          {detail.isTrending && (
            <div className="bg-surface-canvas/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Icon name="local_fire_department" className="text-[16px] text-tertiary-container" filled />
              <span className="font-caption text-caption text-text-primary font-semibold">Hot Deal</span>
            </div>
          )}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="flex gap-space-xs px-margin pt-space-sm overflow-x-auto no-scrollbar" role="tablist" aria-label="Deal photos">
          {photos.map((photo, index) => (
            <button
              key={`${index}-${photo}`}
              type="button"
              role="tab"
              aria-selected={index === photoIndex}
              aria-label={`Photo ${index + 1} of ${photos.length}`}
              onClick={() => setPhotoIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container transition-opacity ${
                index === photoIndex ? 'ring-2 ring-primary' : 'opacity-70'
              }`}
            >
              <img alt="" className="w-full h-full object-cover" src={photo} />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col px-margin pt-space-lg pb-32">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-heading-sm font-bold shadow-sm overflow-hidden">
              {detail.businessLogo ? (
                <img alt="" className="w-full h-full object-cover" src={detail.businessLogo} />
              ) : (
                <Icon name="storefront" className="text-[24px]" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-label-md text-label-md font-bold text-text-primary">{detail.businessName}</span>
                {detail.verified && <Icon name="verified" className="text-primary-container text-[18px]" filled />}
              </div>
              <p className="font-caption text-caption text-text-secondary flex items-center gap-1">
                {subtitleParts.map((part, index) => (
                  <span key={part} className="flex items-center gap-1">
                    {index > 0 && <span>•</span>}
                    {part === distance && <Icon name="near_me" className="text-[12px] text-primary" />}
                    <span>{part}</span>
                  </span>
                ))}
              </p>
            </div>
          </div>
          <button
            aria-label="View merchant profile"
            type="button"
            onClick={onMerchant}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary active:scale-95 transition-transform"
          >
            <Icon name="chevron_right" className="text-[18px]" />
          </button>
        </div>

        {claimed && (
          <div className="mt-space-md flex items-center justify-between gap-space-sm p-space-md rounded-xl bg-badge-discount-bg text-badge-discount-text shadow-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <Icon name="check_circle" className="text-[22px] shrink-0" filled />
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md font-semibold">Deal claimed</span>
                <span className="font-caption text-caption">Voucher added to My Deals</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onReviews}
              className="shrink-0 h-9 px-3 rounded-lg bg-surface-canvas text-badge-discount-text font-label-sm text-label-sm font-semibold shadow-xs active:scale-95 transition-transform"
            >
              Rate your experience
            </button>
          </div>
        )}

        <div className="mt-space-md">
          <h2 className="font-heading-lg text-heading-lg text-text-primary">{detail.title}</h2>
          <div className="flex items-baseline gap-space-sm mt-space-xs">
            <span className="font-display-hero-mobile text-display-hero-mobile text-text-primary font-bold">
              {naira(detail.price)}
            </span>
            {saving > 0 && (
              <>
                <span className="font-body-md text-body-md text-text-tertiary line-through">{naira(detail.oldPrice)}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
                  Save {naira(saving)}
                </span>
              </>
            )}
          </div>
        </div>

        {pills.length > 0 && (
          <div className="flex items-center gap-space-xs mt-space-md overflow-x-auto pb-1">
            {pills.map((pill) => (
              <div
                key={pill.label}
                className="flex items-center gap-1 px-space-sm py-2 rounded-xl bg-surface-subtle shadow-sm flex-shrink-0"
              >
                <Icon name={pill.icon} className="text-[16px] text-primary" />
                <span className="font-label-sm text-label-sm text-text-secondary">{pill.label}</span>
              </div>
            ))}
          </div>
        )}

        {detail.description && (
          <div className="mt-space-lg bg-surface-canvas rounded-xl p-space-md shadow-sm">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">About this deal</h3>
            <p
              className={`font-body-md text-body-md text-text-secondary mt-space-xs ${
                expanded ? '' : 'line-clamp-2'
              }`}
            >
              {detail.description}
            </p>
            {detail.description.length > 90 && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-space-2xs font-label-sm text-label-sm font-semibold text-primary inline-flex items-center gap-0.5 active:opacity-75"
              >
                <span>{expanded ? 'Show less' : 'Read more'}</span>
                <Icon name={expanded ? 'expand_less' : 'expand_more'} className="text-[14px]" />
              </button>
            )}
          </div>
        )}

        {detail.address && (
          <div className="mt-space-md bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-semibold text-text-primary">Location &amp; Hours</span>
              {hours && (
                <span className="font-caption text-caption font-medium text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full">
                  {hours.openNow ? 'Open Now' : 'Closed'}
                </span>
              )}
            </div>
            <div className="w-full h-28 rounded-lg bg-surface-container-high flex items-end p-2 relative overflow-hidden">
              {mapEmbed && (
                <iframe
                  title={`Map of ${detail.businessName}`}
                  src={mapEmbed}
                  loading="lazy"
                  tabIndex={-1}
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                />
              )}
              <div className="relative bg-surface-canvas/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm">
                <Icon name="location_on" className="text-primary text-[16px]" />
                <span className="font-caption text-caption text-text-primary font-medium">{detail.address}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-space-md flex flex-col gap-space-xs">
          <NavRow
            icon="verified_user"
            iconClass="bg-surface-tint-blue text-primary"
            title="How to Claim"
            subtitle={detail.claimSteps[0] ?? 'Show dynamic QR code at billing counter'}
            onClick={onHowToClaim}
          />
          <NavRow
            icon="gavel"
            iconClass="bg-surface-container text-secondary"
            title="Terms & Conditions"
            subtitle={detail.windowLabel ? `Valid ${detail.windowLabel}` : detail.terms[0] ?? 'View the deal terms'}
            onClick={onTerms}
          />
          <NavRow
            icon="forum"
            iconClass="bg-surface-tint-blue text-primary"
            title="In-App Chat"
            subtitle={`Message ${detail.businessName}`}
            onClick={openChat}
          />
          {whatsapp && (
            <NavRow
              icon="chat"
              iconClass="bg-surface-tint-blue text-[#128C7E]"
              title="WhatsApp"
              subtitle={`Message ${detail.businessName}`}
              onClick={() => window.open(whatsapp, '_blank', 'noreferrer')}
            />
          )}
          <NavRow
            icon="star"
            iconClass="bg-surface-container text-tertiary-container"
            title="Reviews & Ratings"
            subtitle={
              <span className="flex items-center gap-1">
                <Icon name="star" filled className="text-[13px] text-tertiary-container" />
                <span>
                  {detail.reviewsCount > 0
                    ? `${detail.averageRating != null ? `${detail.averageRating.toFixed(1)} • ` : ''}${detail.reviewsCount} review${detail.reviewsCount === 1 ? '' : 's'}`
                    : 'No reviews yet'}
                </span>
              </span>
            }
            onClick={onReviews}
          />
        </div>

        <div className="mt-space-md bg-surface-canvas rounded-xl p-space-sm flex items-center justify-around shadow-sm">
          <button
            type="button"
            onClick={onLike}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-surface-subtle active:scale-95 transition-all"
          >
            <Icon
              name="favorite"
              filled={liked}
              className={`text-[18px] ${liked ? 'text-error' : 'text-text-secondary'}`}
            />
            <span
              className={`font-label-md text-label-md font-semibold ${liked ? 'text-error' : 'text-text-secondary'}`}
            >
              {likesCount}
            </span>
          </button>
          <div className="w-px h-5 bg-surface-container" />
          <button
            type="button"
            onClick={onComments}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-surface-subtle active:scale-95 transition-all"
          >
            <Icon name="chat_bubble" className="text-[18px] text-text-secondary" />
            <span className="font-label-md text-label-md font-semibold text-text-secondary">{detail.reviewsCount}</span>
          </button>
          <div className="w-px h-5 bg-surface-container" />
          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-surface-subtle active:scale-95 transition-all"
          >
            <Icon name="ios_share" className="text-[18px] text-text-secondary" />
            <span className="font-label-md text-label-md font-semibold text-text-secondary">Share</span>
          </button>
        </div>

        {actionError && (
          <p role="alert" className="mt-space-sm text-center font-caption text-caption text-error">{actionError}</p>
        )}

        <div className="mt-space-lg mb-space-xs flex items-center justify-center gap-1.5 text-text-tertiary">
          <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
          <span className="font-caption text-caption font-medium">VEMTAP verified discount guarantee</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-xl shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.08)] pb-safe">
        <div className="px-margin pt-3 pb-4 flex flex-col items-center">
          {claimed ? (
            <button
              type="button"
              onClick={onViewWallet}
              className="w-full h-[54px] rounded-xl bg-badge-discount-text text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
            >
              <Icon name="check_circle" className="text-[20px]" filled />
              <span>Claimed — View in Wallet</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClaim}
              className="w-full h-[54px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:scale-[0.98] transition-transform"
            >
              <Icon name="local_activity" className="text-[20px]" />
              <span>Claim Deal</span>
            </button>
          )}
          <div className="flex items-center gap-1 mt-2 text-text-secondary">
            <Icon name="info" className="text-[13px] text-primary" />
            <span className="font-caption text-caption">No payment required now • Claim to reserve</span>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
