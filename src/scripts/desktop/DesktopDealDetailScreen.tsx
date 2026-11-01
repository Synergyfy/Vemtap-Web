import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { Skeleton, SkeletonGroup } from '../../components/ui/Skeleton';
import { parsePrice } from '../../utils/format';
import { getAccessToken } from '../../services/api/client';
import { NO_IMAGE } from '../../utils/homeOffer';
import { useLocation, formatDistanceKm } from '../../context/LocationContext';
import { useDealReviews, reviewTimeLabel } from '../../hooks/useDealReviews';
import { dealDistanceKm, dealTimeLeft, dealWhatsappLink, useDealSaved, type DealDetail } from '../../hooks/useDealDetail';
import { mapEmbedUrl, mapsLink, todayHours } from '../../hooks/usePublicBusiness';
import { useAuth } from '../../context/AuthContext';
import { useClaims, type ClaimKind, type ClaimRecord } from '../../context/ClaimsContext';
import { useProfile } from '../../context/ProfileContext';
import { CommentsDrawer } from '../../components/desktop/dialogs/CommentsDrawer';
import { HowToClaimModal } from '../../components/desktop/dialogs/HowToClaimModal';
import { ClaimConfirmationModal } from '../../components/desktop/dialogs/ClaimConfirmationModal';
import { ClaimAuthModal } from '../../components/desktop/dialogs/ClaimAuthModal';
import { ClaimIdentityModal, type ClaimDealSummary } from '../../components/desktop/dialogs/ClaimIdentityModal';
import { SomeoneElseModal } from '../../components/desktop/dialogs/SomeoneElseModal';
import { RecipientVerificationModal } from '../../components/desktop/dialogs/RecipientVerificationModal';
import { RecipientSummaryModal } from '../../components/desktop/dialogs/RecipientSummaryModal';
import { GiftRecipientDetailsModal } from '../../components/desktop/dialogs/GiftRecipientDetailsModal';
import { ConfirmGiftSendModal } from '../../components/desktop/dialogs/ConfirmGiftSendModal';
import type { GiftRecipientSummary } from '../GiftSentScreen';

interface DesktopDealDetailScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  /** Live deal; null while loading or when it could not be loaded. */
  detail: DealDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Opens the chat with the deal's business; rejects when it can't be opened. */
  onChat: () => Promise<void>;
  /** Whether the customer already holds a voucher for this deal. */
  claimed: boolean;
  onViewWallet?: () => void;
  /**
   * BUG-006/008/009 — when provided, a finished claim/gift hands the record to
   * the app shell so it can open the real outcome screen (claim success /
   * gift sent) instead of a transient toast.
   */
  onClaimComplete?: (claim: ClaimRecord) => void;
  /** Opens the business storefront for the deal's merchant. */
  onOpenBusiness?: () => void;
}

type Dialog =
  | null
  | 'comments'
  | 'howTo'
  | 'claimConfirm'
  | 'auth'
  | 'identity'
  | 'someoneElse'
  | 'verify'
  | 'summary'
  | 'gift'
  | 'giftConfirm';

type PendingStep = 'claimConfirm' | 'identity' | 'someoneElse' | 'gift';

type Tab = 'overview' | 'rules' | 'reviews' | 'comments';

const formatCurrency = (value: number | undefined): string => {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(parsed);
};

interface GalleryImage {
  thumb: string;
  alt: string;
}

/** Icons for the amenities merchants pick; anything else gets the plain tick. */
const AMENITY_ICONS: Record<string, string> = {
  'dine-in': 'restaurant',
  takeaway: 'takeout_dining',
  'free wi-fi': 'wifi',
  'pos card payment': 'credit_card',
  'cash accepted': 'payments',
  parking: 'local_parking',
  'outdoor seating': 'deck',
  'air conditioning': 'ac_unit',
};

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');

/** Loading state in the shape of the page, so no stand-in data shows first. */
function DealDetailSkeleton() {
  return (
    <SkeletonGroup label="Loading deal" className="w-full bg-surface-subtle pb-space-3xl">
      <div className="max-w-7xl mx-auto px-margin pt-space-lg">
        <Skeleton className="h-4 w-72 mb-space-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-xl min-w-0">
            <div className="bg-surface-canvas rounded-2xl p-space-md">
              <Skeleton className="w-full h-[400px] md:h-[480px] rounded-xl" />
            </div>
            <div className="bg-surface-canvas rounded-2xl p-space-xl flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="bg-surface-canvas rounded-2xl p-space-xl">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-canvas rounded-2xl p-space-xl flex flex-col gap-space-lg">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}

export function DesktopDealDetailScreen({ onNav, onBack, detail, loading, error, onRetry, onChat, claimed, onViewWallet, onClaimComplete, onOpenBusiness }: DesktopDealDetailScreenProps) {
  const { authed, signIn, markClaimed } = useAuth();
  const claims = useClaims();
  const profile = useProfile();
  const { lat, lng } = useLocation();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [pendingStep, setPendingStep] = useState<PendingStep>('identity');
  const [claimRecipient, setClaimRecipient] = useState<GiftRecipientSummary | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [tabsDealId, setTabsDealId] = useState(detail?.id);
  const { saved: bookmarked, toggle: toggleSaved } = useDealSaved(detail?.id);
  const { reviews, total, loading: reviewsLoading } = useDealReviews(detail?.id, tab === 'reviews' || tab === 'comments');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (detail?.id === tabsDealId) return;
    setTabsDealId(detail?.id);
    setSelectedImage(0);
    setTab('overview');
  }, [detail?.id, tabsDealId]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  if (!detail) {
    return (
      <DesktopPage withHeader withFooter onNav={onNav} activeNav="deals">
        {loading ? (
          <DealDetailSkeleton />
        ) : (
          <div className="w-full bg-surface-subtle pb-space-3xl">
            <div className="max-w-md mx-auto px-margin pt-space-3xl">
              <div className="rounded-3xl bg-surface-canvas p-6 text-center shadow-sm space-y-3">
                <Icon name="local_activity" className="text-[32px] text-primary" />
                <p className="font-label-md text-label-md text-text-primary font-semibold">{error ?? 'This deal couldn’t be loaded.'}</p>
                <button type="button" onClick={onRetry} className="h-11 w-full rounded-xl bg-primary text-on-primary font-button-primary text-button-primary">Try again</button>
              </div>
            </div>
          </div>
        )}
      </DesktopPage>
    );
  }

  const dealTitle = detail.title;
  const dealBusiness = detail.businessName;
  const dealLocation = detail.address ?? detail.branchName ?? '';
  const dealPrice = detail.price;
  const dealOldPrice = detail.oldPrice;
  const dealSavings = Math.max(dealOldPrice - dealPrice, 0);
  const selectedDeal: ClaimDealSummary = {
    id: detail.id,
    title: dealTitle,
    business: dealBusiness,
    location: dealLocation,
    price: dealPrice,
    oldPrice: dealOldPrice,
    discountLabel: dealSavings > 0 ? `Save ${formatCurrency(dealSavings)}` : undefined,
    image: detail.image,
    images: detail.images,
    commentCount: detail.reviewsCount,
  };
  const gallery: GalleryImage[] = detail.images.length
    ? detail.images.map((thumb, index) => ({ thumb, alt: `${dealTitle} photo ${index + 1}` }))
    : [{ thumb: detail.image ?? NO_IMAGE, alt: dealTitle }];
  const mainPhoto = gallery[Math.min(selectedImage, gallery.length - 1)];
  const TABS: Array<{ key: Tab; icon: string; label: string }> = [
    { key: 'overview', icon: 'info', label: 'Deal Overview' },
    { key: 'rules', icon: 'rule', label: 'How It Works & Rules' },
    { key: 'reviews', icon: 'reviews', label: 'Reviews' },
    { key: 'comments', icon: 'chat_bubble_outline', label: `Community Q&A (${detail.reviewsCount})` },
  ];
  const timeLeft = dealTimeLeft(detail.endDate);
  const included = detail.items.map((item) => ({ strong: `1x ${item.name}`, rest: item.price > 0 ? ` • ${formatCurrency(item.price)}` : '' }));
  const practicalBadges = [
    { icon: 'schedule', label: detail.windowLabel },
    { icon: 'storefront', label: detail.channelsLabel },
    { icon: 'local_activity', label: detail.claimLimitLabel },
    { icon: 'flash_on', label: 'Instant Voucher in VEMTAP App' },
  ].filter((badge): badge is { icon: string; label: string } => Boolean(badge.label));
  const rules = [...detail.claimSteps, ...detail.terms];
  const merchant = detail.profile;
  const hoursToday = merchant ? todayHours(merchant.hours) : null;
  const distance = formatDistanceKm(dealDistanceKm(detail, lat, lng));
  const mapUrl = mapsLink({ latitude: detail.latitude, longitude: detail.longitude, name: dealBusiness, address: detail.address, city: null });
  const mapEmbed = mapEmbedUrl(detail.latitude, detail.longitude);
  const whatsapp = dealWhatsappLink(detail);
  const vouchersLeft = detail.quantity != null ? Math.max(detail.quantity - detail.claimedCount, 0) : null;
  const claimedPercent = detail.quantity ? Math.min(100, Math.round((detail.claimedCount / detail.quantity) * 100)) : 0;
  const ratedReviews = reviews.filter((review) => review.rating != null);

  const startClaim = (step: PendingStep) => {
    if (!authed) {
      setPendingStep(step);
      setDialog('auth');
      return;
    }
    setDialog(step);
  };

  const completeClaim = async () => {
    const kind: ClaimKind =
      dialog === 'giftConfirm' ? 'gift' : dialog === 'summary' ? 'someone-else' : 'self';

    try {
      const record = await claims.recordClaim({
        offerId: selectedDeal?.id ? String(selectedDeal.id) : undefined,
        kind,
        dealTitle: selectedDeal?.title ?? dealTitle,
        dealBusiness: selectedDeal?.business ?? dealBusiness,
        dealImage: selectedDeal?.image,
        dealLocation: selectedDeal?.location ?? dealLocation,
        dealPrice: parsePrice(selectedDeal?.price),
        dealOldPrice: parsePrice(selectedDeal?.oldPrice) || parsePrice(selectedDeal?.price),
        discountLabel: selectedDeal?.discountLabel,
        terms: detail.terms,
        sender: { name: profile.fullName, email: profile.email, phone: profile.phone },
        recipient: kind === 'self' ? undefined : claimRecipient ?? undefined,
      });
      markClaimed();
      setDialog(null);
      setClaimRecipient(null);
      if (onClaimComplete) {
        onClaimComplete(record);
        return;
      }
      showToast(
        kind === 'gift'
          ? `Gift pass ${record.ref} dispatched to ${record.recipient?.name ?? 'your recipient'}!`
          : `Deal claimed! Present ${record.ref} at the local merchant.`,
      );
    } catch {
      // Do not show a success state until the backend confirms the claim.
    }
  };

  const openChat = () => {
    if (!getAccessToken()) {
      showToast('Please sign in to message this business.');
      return;
    }
    onChat().catch(() => showToast('Chat couldn’t be opened. Please try again.'));
  };

  const copyDealLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('Deal link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out ${dealTitle} at ${dealBusiness} on VEMTAP: ${window.location.href}`,
    );
    window.open('https://wa.me/?text=' + text, '_blank');
  };

  const toggleBookmark = () => {
    if (!getAccessToken()) {
      showToast('Please sign in to save deals.');
      return;
    }
    toggleSaved()
      .then((saved) => showToast(saved ? 'Saved to your VEMTAP Wishlist!' : 'Removed from Saved Deals.'))
      .catch(() => showToast('That didn’t save. Please try again.'));
  };

  const tabButtonClass = (key: Tab) =>
    `px-space-md py-space-md font-label-md text-label-md whitespace-nowrap flex items-center gap-1.5 transition-colors ${
      tab === key
        ? 'text-primary border-b-2 border-primary font-semibold'
        : 'text-text-secondary hover:text-text-primary font-medium'
    }`;

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="deals">
      <div className="w-full bg-surface-subtle pb-space-3xl">
        <div className="max-w-7xl mx-auto px-margin pt-space-lg">
          <nav className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm mb-space-lg overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Icon name="home" className="text-[16px]" />
              <span>Deals</span>
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            {detail.category && (
              <>
                <span>{detail.category}</span>
                <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
              </>
            )}
            <button type="button" className="hover:text-primary transition-colors">
              {dealBusiness}
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="text-text-primary font-semibold truncate max-w-xs md:max-w-none">
              {dealTitle}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-8 flex flex-col gap-space-xl min-w-0">
              <div className="bg-surface-canvas rounded-2xl p-space-md shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)]">
                <div className="relative w-full h-[400px] md:h-[480px] rounded-xl overflow-hidden bg-surface-container-low group">
                  <img
                    alt={mainPhoto.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={mainPhoto.thumb}
                  />

                  <div className="absolute top-space-md left-space-md flex flex-wrap items-center gap-space-xs z-10">
                    {dealSavings > 0 && (
                      <span className="inline-flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-space-sm py-1 rounded-full shadow-sm font-semibold tracking-wide">
                        <Icon name="percent" className="text-[16px]" />
                        <span>{Math.round((dealSavings / dealOldPrice) * 100)}% OFF DEAL</span>
                      </span>
                    )}
                    {detail.verified && (
                      <span className="inline-flex items-center gap-1 bg-primary text-on-primary font-label-sm text-label-sm px-space-sm py-1 rounded-full shadow-sm font-semibold">
                        <Icon name="verified" filled className="text-[15px]" />
                        <span>VERIFIED MERCHANT</span>
                      </span>
                    )}
                  </div>

                  {timeLeft && (
                    <div className="absolute top-space-md right-space-md bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm px-space-sm py-1 rounded-full shadow-sm flex items-center gap-1.5">
                      <Icon name="timer" className="text-[16px] text-tertiary-fixed-dim animate-pulse" />
                      <span>
                        Expires in <strong className="text-tertiary-fixed">{timeLeft}</strong>
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-space-md right-space-md bg-surface-canvas/90 backdrop-blur-md text-text-primary px-space-sm py-1 rounded-lg text-caption font-caption font-semibold shadow-sm flex items-center gap-1">
                    <Icon name="photo_camera" className="text-[16px]" />
                    <span>
                      {selectedImage + 1} of {gallery.length} Photo{gallery.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-space-sm mt-space-md">
                  {gallery.map((image, index) => (
                    <button
                      key={`${index}-${image.thumb}`}
                      type="button"
                      aria-label={image.alt}
                      onClick={() => setSelectedImage(index)}
                      className={`h-20 md:h-24 rounded-lg overflow-hidden bg-surface-container transition-all cursor-pointer ${
                        selectedImage === index
                          ? 'ring-2 ring-primary opacity-100'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img alt={image.alt} className="w-full h-full object-cover" src={image.thumb} />
                    </button>
                  ))}
                </div>
                )}
              </div>

              <div className="bg-surface-canvas rounded-2xl p-space-xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md">
                <div className="flex items-center justify-between flex-wrap gap-space-sm pb-space-sm border-b border-surface-container-low">
                  <div
                    className="flex items-center gap-space-sm cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenBusiness ? onOpenBusiness() : onNav('storefront')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        if (onOpenBusiness) onOpenBusiness();
                        else onNav('storefront');
                      }
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold text-heading-sm overflow-hidden">
                      {detail.businessLogo ? (
                        <img alt="" className="w-full h-full object-cover" src={detail.businessLogo} />
                      ) : (
                        initials(dealBusiness)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading-sm text-heading-sm text-text-primary">{dealBusiness}</span>
                        {detail.verified && <Icon name="verified" filled className="text-[18px] text-primary" />}
                      </div>
                      <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
                        <span className="flex items-center gap-0.5 text-text-secondary">
                          <Icon name="near_me" className="text-[15px] text-primary" />
                          <span>{dealLocation}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      onClick={shareWhatsApp}
                      className="h-10 px-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Icon name="chat" className="text-[18px] text-[#25D366]" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={copyDealLink}
                      className="h-10 px-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Icon name="share" className="text-[18px]" />
                      <span>Share</span>
                    </button>
                    <button
                      type="button"
                      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark deal'}
                      onClick={toggleBookmark}
                      className={`w-10 h-10 rounded-lg bg-surface-subtle hover:bg-surface-container flex items-center justify-center transition-colors ${
                        bookmarked ? 'text-primary' : 'text-text-secondary hover:text-primary'
                      }`}
                    >
                      <Icon name={bookmarked ? 'bookmark' : 'bookmark_border'} filled={bookmarked} className="text-[20px]" />
                    </button>
                  </div>
                </div>

                {claimed && (
                  <div className="flex items-center justify-between gap-space-sm p-space-md rounded-xl bg-badge-discount-bg text-badge-discount-text shadow-sm">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <Icon name="check_circle" className="text-[22px] shrink-0" filled />
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md font-semibold">Deal claimed</span>
                        <span className="font-caption text-caption">Voucher added to My Deals</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('reviews')}
                      className="shrink-0 h-9 px-3 rounded-lg bg-surface-canvas text-badge-discount-text font-label-sm text-label-sm font-semibold shadow-xs transition-transform hover:scale-105"
                    >
                      Rate your experience
                    </button>
                  </div>
                )}

                <div>
                  <h1 className="font-heading-lg text-heading-lg md:text-[28px] md:leading-[36px] font-bold text-text-primary mb-space-xs tracking-tight">
                    {dealTitle}
                  </h1>
                  {detail.description && (
                    <p className="font-body-lg text-body-lg text-text-secondary leading-relaxed">{detail.description}</p>
                  )}
                </div>

                {included.length > 0 && (
                  <div className="bg-surface-tint-blue rounded-xl p-space-lg">
                    <h2 className="font-heading-sm text-heading-sm text-primary mb-space-sm flex items-center gap-1.5">
                      <Icon name="restaurant_menu" className="text-[22px]" />
                      <span>What’s Included In This Deal</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-space-sm gap-x-space-md font-body-md text-body-md text-text-primary">
                      {included.map((item) => (
                        <div key={item.strong} className="flex items-start gap-space-xs">
                          <Icon name="check_circle" className="text-[18px] mt-0.5 text-badge-discount-text" />
                          <span>
                            <strong>{item.strong}</strong>
                            {item.rest}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                  {practicalBadges.map((badge) => (
                    <span
                      key={badge.label}
                      className="inline-flex items-center gap-1 bg-surface-container-low px-space-sm py-1.5 rounded-full text-caption font-caption text-text-secondary"
                    >
                      <Icon name={badge.icon} className="text-[16px]" />
                      <span>{badge.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.04)] overflow-hidden">
                <div className="flex items-center border-b border-surface-container-low px-space-md pt-space-xs overflow-x-auto">
                  {TABS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setTab(item.key);
                        if (item.key === 'rules') setDialog('howTo');
                        if (item.key === 'comments') setDialog('comments');
                      }}
                      className={tabButtonClass(item.key)}
                    >
                      <Icon name={item.icon} className="text-[18px]" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {tab === 'overview' && (
                  <div className="p-space-xl flex flex-col gap-space-xl">
                    {merchant?.description && (
                      <div className="space-y-space-sm">
                        <h3 className="font-heading-sm text-heading-sm text-text-primary">About {dealBusiness}</h3>
                        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{merchant.description}</p>
                      </div>
                    )}

                    <div className="space-y-space-md">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading-sm text-heading-sm text-text-primary">
                          Location &amp; Operating Hours
                        </h3>
                        {mapUrl && (
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <span>Open in Google Maps</span>
                            <Icon name="open_in_new" className="text-[16px]" />
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                        <div className="rounded-xl overflow-hidden relative shadow-inner bg-surface-container-high h-60">
                          {mapEmbed && (
                            <iframe
                              title={`Map of ${dealBusiness}`}
                              src={mapEmbed}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full border-0"
                            />
                          )}
                          <div className="absolute bottom-3 left-3 right-3 bg-surface-canvas/95 backdrop-blur-md p-space-sm rounded-lg shadow-sm flex items-center justify-between">
                            <div className="truncate mr-2">
                              <p className="font-label-sm text-label-sm font-semibold text-text-primary truncate">
                                {detail.branchName ?? dealBusiness}
                              </p>
                              <p className="font-caption text-caption text-text-secondary truncate">
                                {dealLocation}
                              </p>
                            </div>
                            {distance && (
                              <span className="bg-primary text-on-primary font-caption text-caption px-2 py-1 rounded font-semibold whitespace-nowrap">
                                {distance}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between space-y-space-md bg-surface-subtle p-space-lg rounded-xl">
                          <div className="space-y-space-xs font-body-md text-body-md text-text-secondary">
                            {(hoursToday || detail.windowLabel) && (
                              <div className="flex items-start gap-space-xs">
                                <Icon name="schedule" className="text-[18px] text-text-primary mt-0.5" />
                                <div>
                                  <strong className="text-text-primary block font-medium">{hoursToday ? 'Today’s Hours:' : 'Deal Hours:'}</strong>
                                  <span>
                                    {hoursToday?.today.label}
                                    {hoursToday && detail.windowLabel ? ` (Deal valid ${detail.windowLabel})` : detail.windowLabel}
                                  </span>
                                </div>
                              </div>
                            )}
                            {detail.phone && (
                              <div className="flex items-start gap-space-xs pt-space-xs">
                                <Icon name="call" className="text-[18px] text-text-primary mt-0.5" />
                                <div>
                                  <strong className="text-text-primary block font-medium">Telephone &amp; Desk:</strong>
                                  <span>{detail.phone}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {merchant && merchant.amenities.length > 0 && (
                            <div>
                              <span className="font-label-sm text-label-sm font-semibold text-text-primary block mb-space-xs uppercase tracking-wider">
                                Venue Amenities
                              </span>
                              <div className="grid grid-cols-2 gap-space-xs">
                                {merchant.amenities.map((amenity) => (
                                  <span
                                    key={amenity}
                                    className="flex items-center gap-1 font-caption text-caption text-text-secondary bg-surface-canvas p-1.5 rounded-lg shadow-sm"
                                  >
                                    <Icon name={AMENITY_ICONS[amenity.toLowerCase()] ?? 'check_circle'} className="text-[16px] text-primary" />
                                    <span>{amenity}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'rules' && (
                  <div className="p-space-xl space-y-space-md">
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">
                      Deal Rules &amp; Redemption Guidelines
                    </h3>
                    <ul className="space-y-space-sm font-body-md text-body-md text-text-secondary list-disc pl-space-lg">
                      {rules.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {tab === 'reviews' && (
                  <div className="p-space-xl flex flex-col gap-space-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div>
                        <div className="flex items-center gap-space-xs">
                          <Icon name="rate_review" className="text-primary text-[26px]" />
                          <h2 className="font-heading-md text-heading-md text-text-primary font-bold">
                            Customer Ratings &amp; Verified Feedback
                          </h2>
                        </div>
                        <p className="font-body-md text-body-md text-text-secondary mt-1">
                          Real dining reviews exclusively from confirmed VEMTAP in-store redemptions.
                        </p>
                      </div>
                    </div>

                    {reviewsLoading ? (
                      <SkeletonGroup label="Loading reviews" className="space-y-space-sm">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                      </SkeletonGroup>
                    ) : ratedReviews.length > 0 ? (
                      <div className="space-y-space-sm">
                        {ratedReviews.map((review) => (
                          <div key={review.id} className="p-space-md bg-surface-subtle rounded-xl">
                            <div className="flex items-center justify-between gap-space-sm">
                              <span className="font-label-md text-label-md font-semibold text-text-primary">{review.reviewerName}</span>
                              <span className="font-caption text-caption text-text-tertiary">{reviewTimeLabel(review.createdAt)}</span>
                            </div>
                            <span className="flex items-center gap-0.5 mt-1" aria-label={`${review.rating} out of 5`}>
                              {Array.from({ length: review.rating ?? 0 }, (_, index) => (
                                <Icon key={index} name="star" filled className="text-[14px] text-tertiary-container" />
                              ))}
                            </span>
                            <p className="font-body-md text-body-md text-text-secondary mt-1">{review.comment}</p>
                            {review.merchantReply && (
                              <span className="font-caption text-caption text-primary font-medium mt-2 block">
                                — {dealBusiness}: {review.merchantReply}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-surface-subtle rounded-2xl p-space-xl shadow-sm flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-surface-canvas flex items-center justify-center text-primary mb-4">
                          <Icon name="reviews" className="text-[32px]" />
                        </div>
                        <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold mb-2">
                          No Reviews Yet
                        </h3>
                        <p className="font-body-md text-body-md text-text-secondary max-w-md leading-relaxed">
                          Reviews will appear here as customers redeem this deal and share their experience at {dealBusiness}.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'comments' && (
                  <div className="p-space-xl space-y-space-md">
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">
                      Community Questions &amp; Answers
                    </h3>
                    {reviewsLoading ? (
                      <SkeletonGroup label="Loading comments" className="space-y-space-sm">
                        <Skeleton className="h-20 w-full rounded-xl" />
                      </SkeletonGroup>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="p-space-md bg-surface-subtle rounded-xl flex items-start gap-space-sm">
                          <Icon name="help" className="text-primary text-[20px]" />
                          <div>
                            <p className="font-label-md text-label-md font-semibold text-text-primary">{review.comment}</p>
                            <p className="font-body-md text-body-md text-text-secondary mt-1">{review.reviewerName}</p>
                            {review.merchantReply && (
                              <span className="font-caption text-caption text-primary font-medium mt-2 block">
                                — Answered by {dealBusiness}: {review.merchantReply}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="font-body-md text-body-md text-text-secondary">
                        {total > 0 ? 'Comments couldn’t be loaded.' : 'No questions yet.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-space-md">
              <div className="bg-surface-canvas rounded-2xl p-space-xl shadow-[0_8px_30px_-4px_rgba(13,37,76,0.08)] flex flex-col gap-space-lg">
                <div className="space-y-space-2xs">
                  <div className="flex items-baseline gap-space-sm">
                    <span className="font-display-hero text-display-hero text-text-primary font-bold tracking-tight">
                      {formatCurrency(dealPrice)}
                    </span>
                    {dealOldPrice > dealPrice ? (
                      <span className="font-heading-sm text-heading-sm text-text-tertiary line-through font-normal">
                        {formatCurrency(dealOldPrice)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="inline-flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold px-space-sm py-1 rounded-full">
                      <Icon name="trending_down" className="text-[15px]" />
                      <span>{dealSavings > 0 ? `Save ${formatCurrency(dealSavings)} today` : 'Free to claim'}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-space-2xs p-space-md bg-surface-subtle rounded-xl">
                  {vouchersLeft != null && (
                    <>
                      <div className="flex items-center justify-between font-label-sm text-label-sm">
                        <span className="flex items-center gap-1 font-semibold text-tertiary">
                          <Icon name="local_fire_department" className="text-[16px] text-tertiary animate-pulse" />
                          <span>{vouchersLeft > 0 ? `Only ${vouchersLeft} voucher${vouchersLeft === 1 ? '' : 's'} left` : 'Sold out'}</span>
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-tertiary-container h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${claimedPercent}%` }}
                        />
                      </div>
                    </>
                  )}
                  <p className="font-caption text-caption text-text-tertiary text-right">
                    {detail.claimedCount} claimed
                  </p>
                </div>

                <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm">
                  <Icon name="verified_user" className="text-primary text-[22px] flex-shrink-0 mt-0.5" />
                  <div className="font-caption text-caption text-text-secondary space-y-0.5">
                    <strong className="font-label-sm text-label-sm text-primary block">100% Free Claim Online</strong>
                    <span>
                      Zero upfront card payment required on VEMTAP. Settle the {formatCurrency(dealPrice)} directly with
                      your server at {dealBusiness} upon redemption.
                    </span>
                  </div>
                </div>

                <div className="space-y-space-sm">
                  {claimed ? (
                    <button
                      type="button"
                      onClick={onViewWallet}
                      className="w-full h-14 bg-badge-discount-text text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Icon name="check_circle" filled className="text-[20px]" />
                      <span>Claimed — View in Wallet</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startClaim('identity')}
                        className="w-full h-14 bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] transition-all transform active:scale-[0.98] cursor-pointer"
                      >
                        <span>Claim Deal Now ({formatCurrency(dealPrice)})</span>
                        <Icon name="arrow_forward" className="text-[20px]" />
                      </button>

                      <div className="grid grid-cols-2 gap-space-xs">
                        <button
                          type="button"
                          onClick={() => startClaim('gift')}
                          className="h-11 px-space-xs rounded-xl bg-surface-subtle hover:bg-surface-container text-text-primary font-label-sm text-label-sm font-medium flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Send as a Gift</span>
                          <span>🎁</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => startClaim('someoneElse')}
                          className="h-11 px-space-xs rounded-xl bg-surface-subtle hover:bg-surface-container text-text-primary font-label-sm text-label-sm font-medium flex items-center justify-center gap-1 transition-colors"
                        >
                          <Icon name="group_add" className="text-[16px] text-text-secondary" />
                          <span>For Someone Else</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {detail.branchId && (
                  <div className="pt-space-sm border-t border-surface-container-low space-y-space-xs">
                    <span className="font-caption text-caption text-text-tertiary uppercase font-medium tracking-wider block text-center">
                      Questions for the business?
                    </span>
                    <div className="flex items-center gap-space-xs">
                      <button
                        type="button"
                        onClick={openChat}
                        className="flex-1 h-10 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Icon name="forum" className="text-[16px] text-primary" />
                        <span>In-App Chat</span>
                      </button>
                      {whatsapp && (
                        <a
                          className="flex-1 min-w-0 px-space-xs h-10 rounded-lg bg-surface-subtle hover:bg-surface-container text-[#128C7E] font-label-sm text-label-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                          href={whatsapp}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Icon name="chat" className="text-[16px] shrink-0" />
                          <span className="truncate">WhatsApp {dealBusiness}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 text-text-tertiary font-caption text-caption pt-space-2xs">
                  <Icon name="shield" className="text-[15px] text-badge-discount-text" />
                  <span>NDPR Compliant Local Discovery Guarantee</span>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-2xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.03)] flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <Icon name="store" className="text-[20px]" />
                </div>
                <div className="flex-1">
                  <p className="font-label-sm text-label-sm font-semibold text-text-primary">
                    {dealBusiness}
                  </p>
                  <p className="font-caption text-caption text-text-secondary">
                    {[detail.category, dealLocation].filter(Boolean).join(' • ')}
                  </p>
                </div>
                <Icon name="chevron_right" className="text-[18px] text-text-tertiary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-2xl flex items-center gap-space-sm">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span className="font-label-md text-label-md">{toast}</span>
        </div>
      )}

      <CommentsDrawer
        open={dialog === 'comments'}
        onClose={() => setDialog(null)}
        onClaim={() => startClaim('identity')}
        deal={selectedDeal}
      />
      <HowToClaimModal
        open={dialog === 'howTo'}
        onClose={() => setDialog(null)}
        onProceed={() => startClaim('claimConfirm')}
        deal={selectedDeal}
        detail={detail}
        distance={distance}
      />
      <ClaimConfirmationModal
        open={dialog === 'claimConfirm'}
        onClose={() => setDialog(null)}
        onConfirm={completeClaim}
        deal={selectedDeal}
      />
      <ClaimAuthModal
        open={dialog === 'auth'}
        deal={selectedDeal}
        onClose={() => setDialog(null)}
        onAuthenticated={() => {
          signIn();
          setDialog(pendingStep);
        }}
      />
      <ClaimIdentityModal
        open={dialog === 'identity'}
        identity={{ name: profile.fullName }}
        deal={selectedDeal}
        onClose={() => setDialog(null)}
        onClaimSelf={completeClaim}
        onGift={() => setDialog('gift')}
        onSomeoneElse={() => {
          setClaimRecipient(null);
          setDialog('someoneElse');
        }}
      />
      <SomeoneElseModal
        open={dialog === 'someoneElse'}
        onClose={() => setDialog(null)}
        onContinue={(values) => {
          setClaimRecipient({
            name: `${values.firstName} ${values.lastName}`.trim(),
            email: values.email,
            phone: values.phone || undefined,
          });
          setDialog('verify');
        }}
      />
      <RecipientVerificationModal
        open={dialog === 'verify'}
        recipient={claimRecipient}
        deal={selectedDeal}
        onClose={() => setDialog(null)}
        onVerify={() => setDialog('summary')}
        onBack={() => setDialog('someoneElse')}
      />
      <RecipientSummaryModal
        open={dialog === 'summary'}
        recipient={claimRecipient}
        deal={selectedDeal}
        onClose={() => setDialog(null)}
        onConfirm={completeClaim}
        onEdit={() => setDialog('someoneElse')}
      />
      <GiftRecipientDetailsModal
        open={dialog === 'gift'}
        deal={selectedDeal}
        onClose={() => setDialog(null)}
        onContinue={(values) => {
          setClaimRecipient({
            name: `${values.firstName} ${values.lastName}`.trim(),
            email: values.email,
            phone: values.phone || undefined,
          });
          setDialog('giftConfirm');
        }}
      />
      <ConfirmGiftSendModal
        open={dialog === 'giftConfirm'}
        recipient={claimRecipient}
        deal={selectedDeal}
        onClose={() => setDialog(null)}
        onEdit={() => setDialog('gift')}
        onSend={completeClaim}
      />
    </DesktopPage>
  );
}
