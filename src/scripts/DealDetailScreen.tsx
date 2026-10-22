import { useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { parsePrice } from '../utils/format';

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
  deal?: { title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string } | null;
}

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA7vaKNnnxi-MbHNZ8Mp1h0Sc1q-74l--t9MDQZkzjo4mPIyzD-E9JZzmzCMnqYXn-8WbTSwFW9LNjanBnDklEy8mvac235L8tAHJ9o7ungwtnlos5o108__YRKbUH-lCT7FK_Vv2DcybKtJaYpuRfirwqhGBghpb07x5Uztz8jrLUicVwLc1WxC-1zLcx7Xl0afCFf_nXId3r-QjnQTdmVGeKf859sB6kVFFyEp6T8_9bo9r5jm4fsYg';

const HERO_ALT =
  'Appetizing close-up of an artisanal double gourmet smash burger with melted cheddar cheese, caramelized onions, crisp lettuce on a brioche bun, accompanied by golden seasoned potato wedges and a cold artisanal beverage on a rustic slate table, professional warm restaurant lighting, rich natural color grading, high key depth of field';

const PILLS: { icon: string; label: string }[] = [
  { icon: 'schedule', label: 'Ends in 3 days' },
  { icon: 'storefront', label: 'Dine-in & Takeout' },
  { icon: 'person', label: '1 Claim / Person' },
];

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
  deal,
}: DealDetailScreenProps) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const dealTitle = deal?.title?.trim() || 'Featured local deal';
  const dealBusiness = deal?.business?.trim() || 'Local dining partner';
  const dealLocation = deal?.location?.trim() || 'Your area';
  const dealImage = deal?.image || HERO_IMAGE;

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
              onClick={() => setSaved((value) => !value)}
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
        <img className="w-full h-full object-cover" alt={HERO_ALT} src={dealImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-4 left-margin right-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-md text-label-md font-bold shadow-sm">
              20% OFF
            </span>
            <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-inverse-surface/80 backdrop-blur-md text-inverse-on-surface font-caption text-caption shadow-sm">
              <Icon name="schedule" className="text-[14px]" />
              Ends in 3 days
            </span>
          </div>
          <div className="bg-surface-canvas/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Icon name="local_fire_department" className="text-[16px] text-tertiary-container" filled />
            <span className="font-caption text-caption text-text-primary font-semibold">Hot Deal</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-margin pt-space-lg pb-32">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-heading-sm font-bold shadow-sm overflow-hidden">
              <Icon name="restaurant" className="text-[24px]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-label-md text-label-md font-bold text-text-primary">{dealBusiness}</span>
                <Icon name="verified" className="text-primary-container text-[18px]" filled />
              </div>
              <p className="font-caption text-caption text-text-secondary flex items-center gap-1">
                <span>Restaurant</span>
                <span>•</span>
                <span className="flex items-center">
                  <Icon name="near_me" className="text-[12px] text-primary" />
                  Nearby
                </span>
                <span>•</span>
                <span>{dealLocation}</span>
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
          <h2 className="font-heading-lg text-heading-lg text-text-primary">{dealTitle}</h2>
          <div className="flex items-baseline gap-space-sm mt-space-xs">
            <span className="font-display-hero-mobile text-display-hero-mobile text-text-primary font-bold">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(
                parsePrice(deal?.price),
              )}
            </span>
            <span className="font-body-md text-body-md text-text-tertiary line-through">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(
                parsePrice(deal?.oldPrice) || parsePrice(deal?.price),
              )}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
              {deal?.discountLabel || (parsePrice(deal?.oldPrice) > parsePrice(deal?.price) ? `Save ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Math.max(parsePrice(deal?.oldPrice) - parsePrice(deal?.price), 0))}` : 'Save on this deal')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-xs mt-space-md overflow-x-auto pb-1">
          {PILLS.map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-1 px-space-sm py-2 rounded-xl bg-surface-subtle shadow-sm flex-shrink-0"
            >
              <Icon name={pill.icon} className="text-[16px] text-primary" />
              <span className="font-label-sm text-label-sm text-text-secondary">{pill.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-space-lg bg-surface-canvas rounded-xl p-space-md shadow-sm">
          <h3 className="font-heading-sm text-heading-sm text-text-primary">About this deal</h3>
          <p
            className={`font-body-md text-body-md text-text-secondary mt-space-xs ${
              expanded ? '' : 'line-clamp-2'
            }`}
          >
            Enjoy our signature lunch combo at a special price. Includes a double gourmet smash burger, seasoned potato
            wedges, and your choice of chilled beverage. Prepared fresh daily at our Apo branch with top quality local
            ingredients.
          </p>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-space-2xs font-label-sm text-label-sm font-semibold text-primary inline-flex items-center gap-0.5 active:opacity-75"
          >
            <span>{expanded ? 'Show less' : 'Read more'}</span>
            <Icon name={expanded ? 'expand_less' : 'expand_more'} className="text-[14px]" />
          </button>
        </div>

        <div className="mt-space-md bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-text-primary">Location &amp; Hours</span>
            <span className="font-caption text-caption font-medium text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full">
              Open Now
            </span>
          </div>
          <div className="w-full h-28 rounded-lg bg-surface-container-high flex items-end p-2 relative overflow-hidden">
            <div className="bg-surface-canvas/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm">
              <Icon name="location_on" className="text-primary text-[16px]" />
              <span className="font-caption text-caption text-text-primary font-medium">
                Plot 422, Cadastral Zone, Apo
              </span>
            </div>
          </div>
        </div>

        <div className="mt-space-md flex flex-col gap-space-xs">
          <NavRow
            icon="verified_user"
            iconClass="bg-surface-tint-blue text-primary"
            title="How to Claim"
            subtitle="Show dynamic QR code at billing counter"
            onClick={onHowToClaim}
          />
          <NavRow
            icon="gavel"
            iconClass="bg-surface-container text-secondary"
            title="Terms & Conditions"
            subtitle="Valid 12 PM - 4 PM weekdays only"
            onClick={onTerms}
          />
          <NavRow
            icon="star"
            iconClass="bg-surface-container text-tertiary-container"
            title="Reviews & Ratings"
            subtitle={
              <span className="flex items-center gap-1">
                <Icon name="star" filled className="text-[13px] text-tertiary-container" />
                <span>4.8 • 120 reviews</span>
              </span>
            }
            onClick={onReviews}
          />
        </div>

        <div className="mt-space-md bg-surface-canvas rounded-xl p-space-sm flex items-center justify-around shadow-sm">
          <button
            type="button"
            onClick={() => setLiked((value) => !value)}
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
              {liked ? 249 : 248}
            </span>
          </button>
          <div className="w-px h-5 bg-surface-container" />
          <button
            type="button"
            onClick={onComments}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-surface-subtle active:scale-95 transition-all"
          >
            <Icon name="chat_bubble" className="text-[18px] text-text-secondary" />
            <span className="font-label-md text-label-md font-semibold text-text-secondary">32</span>
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
