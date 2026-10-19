import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
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
  deal?: ClaimDealSummary | null;
  /**
   * BUG-006/008/009 — when provided, a finished claim/gift hands the record to
   * the app shell so it can open the real outcome screen (claim success /
   * gift sent) instead of a transient toast.
   */
  onClaimComplete?: (claim: ClaimRecord) => void;
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

const MAIN_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDyaz2pz1hC_CjN2ru3oKAacqciO9qmRsnoHdidaET4hHDwZ47yFyvR9W9Us9i8Fzv2ygFWPDTOZCEKCy8ahr6jixkJNWK3yhSXDw8Vb68C0cNL1RH83FoD1KNS-0ukmg3wO_W3Z9rCSVOd8o5pI8VUOB-tHlPxQVC2xZL0joHQJWBb-whC6Eiv-dz4m6-OeZpTFhqttXQ_IJCOIss8NyiQ2zB8UARieO2L63C_PmF4';

const MAIN_ALT =
  'Gourmet artisan prime dry-aged beef burger with melted cheddar, served beside crispy golden hand-cut parmesan truffle fries in a steel basket and a chilled condensation-beaded iced peach craft beverage on a black slate platter inside an upscale modern warm bistro with ambient lighting in Abuja Nigeria.';

interface GalleryImage {
  thumb: string;
  alt: string;
}

const GALLERY: GalleryImage[] = [
  {
    thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfblMb256EfnM3v1cLx_E8B82srt_QvTy9-sOJKLWsGsf-deEwd5VheIJvymvVDSZLly2o9fzZdBi72Vy8KW-Caorv7mqc7lCeWowUfqmGdp3kt71eYonperFwLwQfaDZ13goA0JSJFvBxcb-umnkkaA44IPhEKY0FGMGGXkh8NoABXyNM4Qn2Nc6SSDw-Wae7_u5ZhAN12ZAwZyAGhqbLaINWUQcu4cs3qaLq_tkq',
    alt: 'Close up shot of prime dry aged beef burger with melted cheese and fresh brioche bun plated on slate.',
  },
  {
    thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7c0UEcITW1i4OO6oVRJ94h0z3lIgj3xQDhhip_efwCUeHKi9VaaydQcEe2QRrFIbpkXVFCbhWZGhHGaGrcUxLA7jiDBo7aIQdDK5aGNANDnXTL8MgHuTU6RL7-UqUF69HRhJvhgdyOEfg5SSR66dlvfC6NrgpsPRVk1SaKtyYFMy2F3wPNQuD4OeAywc2MVquLM6dhIMGjB6wd7HI5T4S7Jey1wzH2jIX75K831px',
    alt: 'Side angle showing crispy golden parmesan truffle fries sprinkled with freshly chopped parsley and garlic aioli dip in a ceramic dipping bowl.',
  },
  {
    thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB12Z5xc6cbWYjY6SgCCzCv6bOAEE6aGfRWdBJ_zd0sldtnVPhFLBdqpg5ejUP3TRIj13PaVCTpMwA6_ldEy274wvPuGf-gmsDchjJr0GnZqRcrgrHHVE6wcPtLd11TqKozy4ul0mZ-p3_dqKypGrkMy3ZZR4VHVDB8Rp_5YZGHiu4nb8dtNju_56GXalncsi7WYILlhGU4SjoGiTUCekl1-vXp-u-0zmYXKz_r11lj',
    alt: 'Tall refreshing craft peach iced tea beverage served in a crystal ribbed glass with mint garnish and sliced fresh peach wedges, back-lit with golden hour light.',
  },
  {
    thumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-rncQl6y2hfaKtCXR596-xAmeFVy_uuI0WfRx1ADgcY_bwEo39KtXgJdy_y91YE3ox0ExdFX7Hj60Xv_Z1LhaTPWEYr9w_UMpKYksD34cnv_XH9Lt_7VkQK3Ydkj37TJF0eLwRTpiDFv39jjEdx68J-QqM_KW-I6h__ZVuwLd6TK5Ny5jATNV4cq5n2S0uv4Fw25I3c6NLcbo2weZjazxAPDIzXEpymViwTfb7i90',
    alt: 'Modern urban bistro interior in Apo Abuja with Scandinavian wood seating, hanging pendant warm filament lights, potted tropical monsteras, and happy patrons dining in soft focus.',
  },
];

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDI46mVJiKfpgFocmv68dGbJO_h6OhffdItR88embNKbKILeYQAKH6D9X_5mKRTvCKlt6wbgSuYg2a_ZqlN2DfM_SfxQ8khywoAgCx1krGbp4f7Qj8eWlTO_kP4rXCIUwCwnz0_LTErIhzA9OvWvxtzZQDi4HBpq--VgFTg0cOyuB5evCb13UZ2X6JWEyw_mwT8F-SSmKrflgYT12MnbYE9k0K43wL27S-Lwv_-wbHx';

const INCLUDED: Array<{ strong: string; rest: string; primary?: boolean }> = [
  { strong: '1x Dry-aged Angus burger', rest: ' or char-grilled herb chicken plate' },
  { strong: '1x Truffle parmesan', rest: ' fresh hand-cut artisan fries' },
  { strong: '1x Cold-pressed', rest: ' house iced craft peach cooler' },
  { strong: 'Zero reservation fee', rest: ' • Pay ₦9,600 directly at venue', primary: true },
];

const PRACTICAL_BADGES: Array<{ icon: string; label: string }> = [
  { icon: 'schedule', label: 'Mon – Fri • 12:00 PM – 4:00 PM' },
  { icon: 'storefront', label: 'Dine-in Only' },
  { icon: 'local_activity', label: '1 Voucher per person per visit' },
  { icon: 'flash_on', label: 'Instant Voucher in VEMTAP App' },
];

const RULES: Array<{ lead: string; rest: string }> = [
  {
    lead: 'No Prepayment Required:',
    rest: ' Claim this pass for free on VEMTAP. Settle the discounted total of ₦9,600 on arrival at the restaurant.',
  },
  {
    lead: 'Validation Window:',
    rest: ' Applicable Monday through Friday between 12:00 PM and 4:00 PM.',
  },
  {
    lead: 'Redemption Method:',
    rest: ' Show the digital 6-digit PIN or QR code in your VEMTAP account directly to your server before placing orders.',
  },
  {
    lead: 'Substitutions:',
    rest: ' Grilled lemon chicken may be selected as an alternative to the Angus beef burger at no supplemental charge.',
  },
  {
    lead: 'Cancellation Policy:',
    rest: ' Unused voucher claims auto-release back into the community pool without any financial penalty or credit card debit.',
  },
];

const AMENITIES: Array<{ icon: string; label: string }> = [
  { icon: 'ac_unit', label: 'Full Climate A/C' },
  { icon: 'wifi', label: 'High-speed Wi-Fi' },
  { icon: 'local_parking', label: 'Guarded Valet' },
  { icon: 'deck', label: 'Outdoor Terrace' },
];

const RATING_BARS: Array<{ label: string; width: string; value: string; muted?: boolean }> = [
  { label: '5 Stars', width: '88%', value: '88%' },
  { label: '4 Stars', width: '10%', value: '10%' },
  { label: '3 Stars', width: '2%', value: '2%' },
  { label: '2 Stars', width: '0%', value: '0%', muted: true },
  { label: '1 Star', width: '0%', value: '0%', muted: true },
];

const FILTER_CHIPS: Array<{ label: string; count: string; icon?: string }> = [
  { label: 'All', count: '(184)' },
  { label: 'With Photos', count: '(42)', icon: 'photo_camera' },
  { label: 'Food Quality', count: '(112)' },
  { label: 'Portion Size', count: '(64)' },
  { label: 'Fast Service', count: '(58)' },
];

const TABS: Array<{ key: Tab; icon: string; label: string }> = [
  { key: 'overview', icon: 'info', label: 'Deal Overview' },
  { key: 'rules', icon: 'rule', label: 'How It Works & Rules' },
  { key: 'reviews', icon: 'reviews', label: 'Reviews (4.9 ★ • 184)' },
  { key: 'comments', icon: 'chat_bubble_outline', label: 'Community Q&A (32)' },
];

export function DesktopDealDetailScreen({ onNav, onBack, deal, onClaimComplete }: DesktopDealDetailScreenProps) {
  const { authed, claimed, signIn, markClaimed } = useAuth();
  const claims = useClaims();
  const profile = useProfile();
  const selectedDeal: ClaimDealSummary = {
    title: deal?.title ?? 'Prime 3-Course Lunch Combo & Craft Beverage',
    business: deal?.business ?? 'Urban Grill & Bistro',
    location: deal?.location ?? 'Apo, Abuja',
    price: typeof deal?.price === 'number' ? deal.price : 9600,
    oldPrice: typeof deal?.oldPrice === 'number' ? deal.oldPrice : 12000,
    discountLabel: deal?.discountLabel ?? 'Save ₦2,400 (20% OFF)',
    image: deal?.image ?? MAIN_IMAGE,
  };
  const [dialog, setDialog] = useState<Dialog>(null);
  const [pendingStep, setPendingStep] = useState<PendingStep>('identity');
  const [claimRecipient, setClaimRecipient] = useState<GiftRecipientSummary | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [chip, setChip] = useState('All');
  const [selectedImage, setSelectedImage] = useState(0);
  const [mainImage, setMainImage] = useState(MAIN_IMAGE);
  const [mainAlt, setMainAlt] = useState(MAIN_ALT);
  const [bookmarked, setBookmarked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

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

  const startClaim = (step: PendingStep) => {
    if (!authed) {
      setPendingStep(step);
      setDialog('auth');
      return;
    }
    setDialog(step);
  };

  const completeClaim = () => {
    const kind: ClaimKind =
      dialog === 'giftConfirm' ? 'gift' : dialog === 'summary' ? 'someone-else' : 'self';
    const record = claims.recordClaim({
      kind,
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
        : `Deal claimed! Present ${record.ref} at Urban Grill & Bistro.`,
    );
  };

  const copyDealLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('Deal link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      'Check out this 20% OFF Prime 3-Course Lunch Combo at Urban Grill & Bistro on VEMTAP: ' + window.location.href,
    );
    window.open('https://wa.me/?text=' + text, '_blank');
  };

  const toggleBookmark = () => {
    setBookmarked((value) => {
      showToast(value ? 'Removed from Saved Deals.' : 'Saved to your VEMTAP Wishlist!');
      return !value;
    });
  };

  const selectImage = (index: number) => {
    setSelectedImage(index);
    setMainImage(index === 0 ? MAIN_IMAGE : GALLERY[index].thumb);
    setMainAlt(GALLERY[index].alt);
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
            <button type="button" className="hover:text-primary transition-colors">
              Food &amp; Dining
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <button type="button" className="hover:text-primary transition-colors">
              Urban Grill &amp; Bistro
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="text-text-primary font-semibold truncate max-w-xs md:max-w-none">
              Prime 3-Course Lunch Combo
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-8 flex flex-col gap-space-xl min-w-0">
              <div className="bg-surface-canvas rounded-2xl p-space-md shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)]">
                <div className="relative w-full h-[400px] md:h-[480px] rounded-xl overflow-hidden bg-surface-container-low group">
                  <img
                    alt={mainAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={mainImage}
                  />

                  <div className="absolute top-space-md left-space-md flex flex-wrap items-center gap-space-xs z-10">
                    <span className="inline-flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-space-sm py-1 rounded-full shadow-sm font-semibold tracking-wide">
                      <Icon name="percent" className="text-[16px]" />
                      <span>20% OFF DEAL</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-primary text-on-primary font-label-sm text-label-sm px-space-sm py-1 rounded-full shadow-sm font-semibold">
                      <Icon name="verified" filled className="text-[15px]" />
                      <span>VERIFIED MERCHANT</span>
                    </span>
                  </div>

                  <div className="absolute top-space-md right-space-md bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm px-space-sm py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <Icon name="timer" className="text-[16px] text-tertiary-fixed-dim animate-pulse" />
                    <span>
                      Expires in <strong className="text-tertiary-fixed">4h 12m</strong>
                    </span>
                  </div>

                  <div className="absolute bottom-space-md right-space-md bg-surface-canvas/90 backdrop-blur-md text-text-primary px-space-sm py-1 rounded-lg text-caption font-caption font-semibold shadow-sm flex items-center gap-1">
                    <Icon name="photo_camera" className="text-[16px]" />
                    <span>{selectedImage + 1} of 4 Photos</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-space-sm mt-space-md">
                  {GALLERY.map((image, index) => (
                    <button
                      key={image.thumb}
                      type="button"
                      aria-label={image.alt}
                      onClick={() => selectImage(index)}
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
              </div>

              <div className="bg-surface-canvas rounded-2xl p-space-xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md">
                <div className="flex items-center justify-between flex-wrap gap-space-sm pb-space-sm border-b border-surface-container-low">
                  <div
                    className="flex items-center gap-space-sm cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => onNav('storefront')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onNav('storefront');
                      }
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold text-heading-sm">
                      UG
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading-sm text-heading-sm text-text-primary">Urban Grill &amp; Bistro</span>
                        <Icon name="verified" filled className="text-[18px] text-primary" />
                      </div>
                      <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
                        <span className="flex items-center text-tertiary font-semibold">
                          <Icon name="star" filled className="text-[16px] text-tertiary-container" />
                          <span>4.9</span>
                        </span>
                        <span className="text-text-tertiary">•</span>
                        <span className="hover:underline cursor-pointer">184 Verified Reviews</span>
                        <span className="text-text-tertiary">•</span>
                        <span className="flex items-center gap-0.5 text-text-secondary">
                          <Icon name="near_me" className="text-[15px] text-primary" />
                          <span>0.8 km away • Apo Boulevard</span>
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
                    Prime 3-Course Lunch Combo &amp; Craft Beverage
                  </h1>
                  <p className="font-body-lg text-body-lg text-text-secondary leading-relaxed">
                    Signature dry-aged prime beef burger or grilled chicken plate, accompanied by loaded parmesan truffle
                    fries and fresh house-pressed iced peach craft cooler. Valid weekdays 12pm–4pm.
                  </p>
                </div>

                <div className="bg-surface-tint-blue rounded-xl p-space-lg">
                  <h2 className="font-heading-sm text-heading-sm text-primary mb-space-sm flex items-center gap-1.5">
                    <Icon name="restaurant_menu" className="text-[22px]" />
                    <span>What’s Included In This Deal</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-space-sm gap-x-space-md font-body-md text-body-md text-text-primary">
                    {INCLUDED.map((item) => (
                      <div key={item.strong} className="flex items-start gap-space-xs">
                        <Icon
                          name={item.primary ? 'lock_open' : 'check_circle'}
                          className={`text-[18px] mt-0.5 ${item.primary ? 'text-primary' : 'text-badge-discount-text'}`}
                        />
                        <span className={item.primary ? 'text-primary font-medium' : ''}>
                          <strong>{item.strong}</strong>
                          {item.rest}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                  {PRACTICAL_BADGES.map((badge) => (
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
                    <div className="space-y-space-sm">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">About Urban Grill &amp; Bistro</h3>
                      <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                        Located in the vibrant culinary corridor of Apo District, Urban Grill &amp; Bistro delivers
                        woodfire-grilled cuts, slow-fermented brioche, and bespoke cold beverages. Sourcing Angus prime
                        beef directly from organic regional farms and pairing it with house sauces made fresh every
                        morning, chef Ibrahim Al-Hassan crafts modern casual comfort dining with zero compromises.
                      </p>
                    </div>

                    <div className="space-y-space-md">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading-sm text-heading-sm text-text-primary">
                          Location &amp; Operating Hours
                        </h3>
                        <button
                          type="button"
                          className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <span>Open in Google Maps</span>
                          <Icon name="open_in_new" className="text-[16px]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                        <div className="rounded-xl overflow-hidden relative shadow-inner bg-surface-container-high h-60">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            data-location="Plot 14 Apo Boulevard, Apo District, Abuja, Nigeria"
                            style={{ backgroundImage: `url('${MAP_IMAGE}')` }}
                          />
                          <div className="absolute bottom-3 left-3 right-3 bg-surface-canvas/95 backdrop-blur-md p-space-sm rounded-lg shadow-sm flex items-center justify-between">
                            <div className="truncate mr-2">
                              <p className="font-label-sm text-label-sm font-semibold text-text-primary truncate">
                                Plot 14 Apo Boulevard
                              </p>
                              <p className="font-caption text-caption text-text-secondary truncate">
                                Apo District, Abuja, FCT
                              </p>
                            </div>
                            <span className="bg-primary text-on-primary font-caption text-caption px-2 py-1 rounded font-semibold whitespace-nowrap">
                              0.8 km
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between space-y-space-md bg-surface-subtle p-space-lg rounded-xl">
                          <div className="space-y-space-xs font-body-md text-body-md text-text-secondary">
                            <div className="flex items-start gap-space-xs">
                              <Icon name="schedule" className="text-[18px] text-text-primary mt-0.5" />
                              <div>
                                <strong className="text-text-primary block font-medium">Daily Hours:</strong>
                                <span>11:00 AM – 10:30 PM (Deal valid 12pm–4pm)</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-space-xs pt-space-xs">
                              <Icon name="call" className="text-[18px] text-text-primary mt-0.5" />
                              <div>
                                <strong className="text-text-primary block font-medium">Telephone &amp; Desk:</strong>
                                <span>+234 (0) 803 920 4491</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="font-label-sm text-label-sm font-semibold text-text-primary block mb-space-xs uppercase tracking-wider">
                              Venue Amenities
                            </span>
                            <div className="grid grid-cols-2 gap-space-xs">
                              {AMENITIES.map((amenity) => (
                                <span
                                  key={amenity.label}
                                  className="flex items-center gap-1 font-caption text-caption text-text-secondary bg-surface-canvas p-1.5 rounded-lg shadow-sm"
                                >
                                  <Icon name={amenity.icon} className="text-[16px] text-primary" />
                                  <span>{amenity.label}</span>
                                </span>
                              ))}
                            </div>
                          </div>
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
                      {RULES.map((rule) => (
                        <li key={rule.lead}>
                          <strong>{rule.lead}</strong>
                          {rule.rest}
                        </li>
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
                      <button
                        type="button"
                        className="self-start md:self-auto px-space-md py-space-xs bg-surface-container text-primary font-label-md text-label-md rounded-xl hover:bg-surface-container-high transition-colors flex items-center gap-space-xs"
                      >
                        <Icon name="verified_user" className="text-[18px]" />
                        <span>How Redemptions Are Verified</span>
                      </button>
                    </div>

                    <div className="bg-surface-subtle rounded-2xl p-space-lg shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center">
                        <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left bg-surface-canvas rounded-xl p-space-md shadow-sm">
                          <div className="flex items-baseline gap-space-xs">
                            <span className="font-display-hero text-display-hero font-extrabold text-text-primary leading-none">
                              4.9
                            </span>
                            <span className="font-heading-sm text-heading-sm text-text-tertiary">/ 5.0</span>
                          </div>
                          <div className="flex items-center gap-1 text-tertiary my-space-xs">
                            <Icon name="star" filled className="text-[24px]" />
                            <Icon name="star" filled className="text-[24px]" />
                            <Icon name="star" filled className="text-[24px]" />
                            <Icon name="star" filled className="text-[24px]" />
                            <Icon name="star" filled className="text-[24px]" />
                          </div>
                          <p className="font-caption text-caption text-text-secondary leading-snug">
                            Based on{' '}
                            <strong className="text-text-primary font-semibold">
                              184 verified customer redemptions
                            </strong>{' '}
                            in Apo, Abuja
                          </p>
                          <div className="mt-space-sm w-full pt-space-xs flex items-center gap-space-xs bg-badge-discount-bg text-badge-discount-text px-space-sm py-space-2xs rounded-lg">
                            <Icon name="thumb_up" className="text-[18px]" />
                            <span className="font-label-sm text-label-sm font-semibold">
                              98% diners recommend this
                            </span>
                          </div>
                        </div>

                        <div className="md:col-span-8 flex flex-col gap-space-xs">
                          {RATING_BARS.map((bar) => (
                            <div key={bar.label} className="flex items-center gap-space-sm">
                              <span className="font-label-sm text-label-sm text-text-secondary w-14">{bar.label}</span>
                              <div className="flex-1 h-3 rounded-full bg-surface-container overflow-hidden">
                                <div
                                  className="h-full bg-primary-container rounded-full"
                                  style={{ width: bar.width }}
                                />
                              </div>
                              <span
                                className={`font-label-sm text-label-sm font-medium w-10 text-right ${
                                  bar.muted ? 'text-text-secondary' : 'text-text-primary'
                                }`}
                              >
                                {bar.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-space-sm">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
                        Filter Verified Customer Reviews
                      </span>
                      <div className="flex flex-wrap items-center gap-space-xs">
                        {FILTER_CHIPS.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setChip(item.label)}
                            className={`h-9 px-space-md rounded-full font-label-md text-label-md transition-all flex items-center gap-1 ${
                              chip === item.label
                                ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                                : 'bg-surface-subtle text-text-secondary hover:bg-surface-container-low'
                            }`}
                          >
                            {item.icon ? <Icon name={item.icon} className="text-[16px]" /> : null}
                            <span>{item.label}</span>
                            <span
                              className={`font-normal ${
                                chip === item.label ? 'text-secondary' : 'text-text-tertiary'
                              }`}
                            >
                              {item.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <article className="bg-surface-canvas rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
                        <div className="flex flex-col gap-space-sm">
                          <div className="flex items-start justify-between gap-space-xs">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold font-heading-sm text-heading-sm">
                                CO
                              </div>
                              <div>
                                <div className="flex items-center gap-space-2xs">
                                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold">
                                    Dr. Chidi Okafor
                                  </h3>
                                  <Icon name="verified" className="text-primary text-[18px]" />
                                </div>
                                <p className="font-caption text-caption text-text-secondary">
                                  Verified Patron • Apo Resident
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-tertiary">
                              <Icon name="star" filled className="text-[18px]" />
                              <span className="font-label-md text-label-md font-bold text-text-primary">5.0</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption">
                            <Icon name="calendar_today" className="text-[14px]" />
                            <span>Redeemed on Oct 14, 2024</span>
                            <span>•</span>
                            <span className="text-badge-discount-text font-medium">In-Store QR Tap</span>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                            Outstanding value. The Angus beef patty was cooked to a perfect medium well, brioche bun held
                            together nicely. The truffle dip is the best in Apo. Will definitely claim again.
                          </p>
                          <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
                            <div className="relative rounded-xl overflow-hidden shadow-sm h-36 bg-surface-container">
                              <img
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                alt="Close-up high key photo of a gourmet Angus burger with melted cheddar cheese on a toasted golden brioche bun with crisp truffle parmesan fries on a rustic slate platter at a modern upscale Abuja restaurant."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtckhGb2xAiHBuXZwzd-kpqvanRaP3kPYGYg0-MQV7U9fkLOcsZMX4fFLqlz3PQ2NdxX3JLgat4RSGceKKlVBIOEWr89uIKJQQ2VoxxnSrXY3-1XcucwBj6hddaHHXyV62ngI-Mq-ul9oYe3RwsUrpDBkKX1AWHeEoRCVdRUYtIY6fStjaKKvglwm35yfKZJeTcoLmLPjq3p1zUcssGT-PSb8l2rVuLdp6WHXfADua"
                              />
                              <span className="absolute bottom-2 left-2 px-space-xs py-space-2xs rounded-md bg-surface-canvas/90 backdrop-blur-md text-text-primary font-caption text-caption font-semibold">
                                Burger Platter
                              </span>
                            </div>
                            <div className="relative rounded-xl overflow-hidden shadow-sm h-36 bg-surface-container">
                              <img
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                alt="Refreshing tall glass of craft peach iced tea garnished with fresh mint sprigs and sliced Nigerian lemons on an outdoor dining wooden table in Apo Abuja with bright daylight."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGNy0L1Dk2SfyK2g0vA8YvnF-Y27nvvxvqXwdn4MQpQhVuowQUXmrhey0RtnAUH3fc9qHiN9WZWEd5LX1g4KP6xKA_XnIT4ePCoDBwxuqSM3V2O92HYLx4Y-kAFiBa_iHhL2xDdsEco-JYY2bx3SsusEbfPsfo9qDKs6bXZp6F23CthM6AlfPmlJJgMMEtOFncJSZuXWw2gvqMqAvXwLN-wy_UkTGnHRoaGfvzoOpe"
                              />
                              <span className="absolute bottom-2 left-2 px-space-xs py-space-2xs rounded-md bg-surface-canvas/90 backdrop-blur-md text-text-primary font-caption text-caption font-semibold">
                                Peach Tea
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-space-xs border-0 text-text-secondary font-label-sm text-label-sm">
                          <span className="text-text-tertiary">Was this review helpful?</span>
                          <div className="flex items-center gap-space-sm">
                            <button
                              type="button"
                              className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-subtle hover:bg-surface-container-low text-text-primary font-medium transition-colors"
                            >
                              <Icon name="thumb_up" className="text-[16px] text-primary" />
                              <span>24</span>
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-subtle hover:bg-surface-container-low text-text-primary font-medium transition-colors"
                            >
                              <Icon name="chat_bubble_outline" className="text-[16px]" />
                              <span>2</span>
                            </button>
                          </div>
                        </div>
                      </article>

                      <article className="bg-surface-canvas rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
                        <div className="flex flex-col gap-space-sm">
                          <div className="flex items-start justify-between gap-space-xs">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold font-heading-sm text-heading-sm">
                                FB
                              </div>
                              <div>
                                <div className="flex items-center gap-space-2xs">
                                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold">
                                    Fatima Bello
                                  </h3>
                                  <Icon name="verified" className="text-primary text-[18px]" />
                                </div>
                                <p className="font-caption text-caption text-text-secondary">
                                  Verified Patron • Wuse II
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-tertiary">
                              <Icon name="star" filled className="text-[18px]" />
                              <span className="font-label-md text-label-md font-bold text-text-primary">5.0</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption">
                            <Icon name="calendar_today" className="text-[14px]" />
                            <span>Redeemed on Oct 12, 2024</span>
                            <span>•</span>
                            <span className="text-badge-discount-text font-medium">Instant Counter Scan</span>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                            Zero issues redeeming the VEMTAP code at counter. Cashier scanned it instantly and gave the
                            discounted bill of ₦9,600 without any back and forth. Great atmosphere.
                          </p>
                          <div className="p-space-md rounded-xl bg-surface-subtle flex items-center gap-space-md mt-space-2xs">
                            <div className="w-10 h-10 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                              <Icon name="point_of_sale" className="text-[20px]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                                Staff Trained on VEMTAP
                              </span>
                              <span className="font-caption text-caption text-text-secondary">
                                Subtotal paid: ₦9,600 • Saved ₦5,200
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-space-xs border-0 text-text-secondary font-label-sm text-label-sm">
                          <span className="text-text-tertiary">Was this review helpful?</span>
                          <button
                            type="button"
                            className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-subtle hover:bg-surface-container-low text-text-primary font-medium transition-colors"
                          >
                            <Icon name="thumb_up" className="text-[16px] text-primary" />
                            <span>18</span>
                          </button>
                        </div>
                      </article>

                      <article className="bg-surface-canvas rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md md:col-span-2">
                        <div className="flex flex-col gap-space-sm">
                          <div className="flex items-start justify-between gap-space-xs">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-secondary font-bold font-heading-sm text-heading-sm">
                                KD
                              </div>
                              <div>
                                <div className="flex items-center gap-space-2xs">
                                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold">
                                    Kemi Daniel
                                  </h3>
                                  <Icon name="verified" className="text-primary text-[18px]" />
                                </div>
                                <p className="font-caption text-caption text-text-secondary">Verified Patron</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-tertiary">
                              <Icon name="star" filled className="text-[18px]" />
                              <span className="font-label-md text-label-md font-bold text-text-primary">4.8</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption">
                            <Icon name="calendar_today" className="text-[14px]" />
                            <span>Redeemed on Oct 09, 2024</span>
                            <span>•</span>
                            <span className="text-badge-discount-text font-medium">Verified Lunch Service</span>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-3xl">
                            Generous portion. You might not need dinner after this lunch combo. The craft peach tea was
                            very refreshing and not overly sweet. Parking in front of the venue was simple too.
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-space-xs border-0 text-text-secondary font-label-sm text-label-sm">
                          <span className="text-text-tertiary">Was this review helpful?</span>
                          <button
                            type="button"
                            className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-subtle hover:bg-surface-container-low text-text-primary font-medium transition-colors"
                          >
                            <Icon name="thumb_up" className="text-[16px] text-primary" />
                            <span>11</span>
                          </button>
                        </div>
                      </article>
                    </div>

                    <div className="flex items-center justify-center pt-space-md">
                      <button
                        type="button"
                        className="px-space-xl py-space-sm rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-space-xs"
                      >
                        <span>Load 10 More Verified Reviews</span>
                        <Icon name="expand_more" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                )}

                {tab === 'comments' && (
                  <div className="p-space-xl space-y-space-md">
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">
                      Community Questions &amp; Answers
                    </h3>
                    <div className="p-space-md bg-surface-subtle rounded-xl flex items-start gap-space-sm">
                      <Icon name="help" className="text-primary text-[20px]" />
                      <div>
                        <p className="font-label-md text-label-md font-semibold text-text-primary">
                          Can I use 2 vouchers if I bring a colleague?
                        </p>
                        <p className="font-body-md text-body-md text-text-secondary mt-1">
                          Yes! Each diner can claim their own voucher in the VEMTAP app, or you can select ‘Claim for
                          Someone Else’ and allocate a second voucher to their number.
                        </p>
                        <span className="font-caption text-caption text-primary font-medium mt-2 block">
                          — Answered by Urban Grill Support
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-space-md">
              <div className="bg-surface-canvas rounded-2xl p-space-xl shadow-[0_8px_30px_-4px_rgba(13,37,76,0.08)] flex flex-col gap-space-lg">
                <div className="space-y-space-2xs">
                  <div className="flex items-baseline gap-space-sm">
                    <span className="font-display-hero text-display-hero text-text-primary font-bold tracking-tight">
                      ₦9,600
                    </span>
                    <span className="font-heading-sm text-heading-sm text-text-tertiary line-through font-normal">
                      ₦12,000
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="inline-flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold px-space-sm py-1 rounded-full">
                      <Icon name="trending_down" className="text-[15px]" />
                      <span>Save ₦2,400 today (20% OFF)</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-space-2xs p-space-md bg-surface-subtle rounded-xl">
                  <div className="flex items-center justify-between font-label-sm text-label-sm">
                    <span className="flex items-center gap-1 font-semibold text-tertiary">
                      <Icon name="local_fire_department" className="text-[16px] text-tertiary animate-pulse" />
                      <span>Only 7 vouchers left</span>
                    </span>
                    <span className="text-text-secondary font-medium">Lunch session</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-tertiary-container h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: '75%' }}
                    />
                  </div>
                  <p className="font-caption text-caption text-text-tertiary text-right">
                    21 claimed in last 3 hours
                  </p>
                </div>

                <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm">
                  <Icon name="verified_user" className="text-primary text-[22px] flex-shrink-0 mt-0.5" />
                  <div className="font-caption text-caption text-text-secondary space-y-0.5">
                    <strong className="font-label-sm text-label-sm text-primary block">100% Free Claim Online</strong>
                    <span>
                      Zero upfront card payment required on VEMTAP. Settle the ₦9,600 directly with your server at Urban
                      Grill upon redemption.
                    </span>
                  </div>
                </div>

                <div className="space-y-space-sm">
                  {claimed ? (
                    <button
                      type="button"
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
                        <span>Claim Deal Now (₦9,600)</span>
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

                <div className="pt-space-sm border-t border-surface-container-low space-y-space-xs">
                  <span className="font-caption text-caption text-text-tertiary uppercase font-medium tracking-wider block text-center">
                    Questions for the kitchen?
                  </span>
                  <div className="flex items-center gap-space-xs">
                    <a
                      className="flex-1 h-10 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center justify-center gap-1.5 transition-colors"
                      href="tel:+2348039204491"
                    >
                      <Icon name="forum" className="text-[16px] text-primary" />
                      <span>In-App Chat</span>
                    </a>
                    <a
                      className="flex-1 h-10 rounded-lg bg-surface-subtle hover:bg-surface-container text-[#128C7E] font-label-sm text-label-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                      href="https://wa.me/2348039204491"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon name="chat" className="text-[16px]" />
                      <span>WhatsApp Bistro</span>
                    </a>
                  </div>
                </div>

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
                    Urban Grill &amp; Bistro Hospitality Ltd.
                  </p>
                  <p className="font-caption text-caption text-text-secondary">
                    CAC Registered • Apo Boulevard, Abuja
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
      />
      <HowToClaimModal
        open={dialog === 'howTo'}
        onClose={() => setDialog(null)}
        onProceed={() => startClaim('claimConfirm')}
      />
      <ClaimConfirmationModal
        open={dialog === 'claimConfirm'}
        onClose={() => setDialog(null)}
        onConfirm={completeClaim}
        deal={selectedDeal}
      />
      <ClaimAuthModal
        open={dialog === 'auth'}
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
        onClose={() => setDialog(null)}
        onVerify={() => setDialog('summary')}
        onBack={() => setDialog('someoneElse')}
      />
      <RecipientSummaryModal
        open={dialog === 'summary'}
        recipient={claimRecipient}
        onClose={() => setDialog(null)}
        onConfirm={completeClaim}
        onEdit={() => setDialog('someoneElse')}
      />
      <GiftRecipientDetailsModal
        open={dialog === 'gift'}
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
        onClose={() => setDialog(null)}
        onEdit={() => setDialog('gift')}
        onSend={completeClaim}
      />
    </DesktopPage>
  );
}
