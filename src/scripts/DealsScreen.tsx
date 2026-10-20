import { useState, type KeyboardEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { LocationRadiusModal } from '../components/LocationRadiusModal';
import { useLocation } from '../context/LocationContext';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { useAuth } from '../context/AuthContext';

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg_httfgNB7CfMJOzfjKekJGnxgvueamRqqNg-Qyw7QV2HTVvlh6rZ845BYSp5dsQClaPlSKNd4B0_3aYGUcjlu-OUBeq56PilIeD6B9e1a0GFgvTtnkB0d8i16nw-kagt5rZUqAHNUNQUsH0WcGsyf8zaqNe1yx2Go9tQcdI6QPEzXRp2aZLqYGswotDnV391PXTZI3oVx9jzWC_ZogeqCUxsw3wWsr-xRkh4q33Ljntdo0P9MsadSA';

const IMAGES = {
  tasting:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDSilNVnoDb6EsvCA8tDf9s2JVAMcwijfDvwIOxGwZFEZNl621JtdrCLPlTxDeFkK-OKJdEJht7f8EgVROVov1Iw-a31YLKpyuYtTtP5cK21rnD3xPO4y27QL0ooRgJrKlAIur-ESX8ksRp66Bl841XwyKBOHb1_VoH-uvctf4YZcO59iO4cxCLK2a28AIVitYxub-nbIHNCu2TBV_s9rRPqbKIQLPz9DNZz_IocLCw-1wzbltbJfKPDA',
  sneakers:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAT5ZLc4NQJ-D07mpP7t9FMmq21vRbxTpCD4Di6UGFmFQaNz9tRu7oOh3TVcK7MAwjHWDOUavP6xW4e3sta-gWWW6UD1xmaXxZdjfTMavfQoruqrVBsuNwiP0axSzHF7z9GehUnlsVa-XBHkab2NwJKdpiTmbNr6V9yLoxioYF2teXDGTTIZ5Tit_nAL7XoYPSxVK389Fv0KpXKjWPElTwUUDUVWQ42i0YJHDwpj8ZXuasY0PUFxi2ABw',
  spa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATUYmH0_JpeZ5WqU44O8loq1vbBmgeVE5fXPLQBlTocMAtnZiWyingiBCqwd4pB2HrFjilQz2Hn9D5qXoa6v09jGYJoW4Eq96c47wCpUV4bmHR16UhGP0gxmaU5bi2HO7v9_eecjqBfOdRwQW8CC3JCTu2qRyIC4T9OenOCS6bnJ-XcHWj5ok8s0MFN8YNtTQ5us4dRtpYiNDbIq2TFyP6FLzgolFEKJUiF6NwYNdCnppPKaZYg2Utdg',
  coldBrew:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5aT4hxBnu4KdypiAsxFiLD6LnzxeRBhcXL5_UMJ_zqs5sUBZSj26pQBvXBwDRRQtkFEBaBN3blfsWvkLFZD6GgYk8fCqG4QsBTviyYH4BpEK8q09MYZleAghjI-XeMlqsGu4thjW6tX5oi_wvW0v0yWc4V2yycme1CNV96kD1Q76xJyCvNsg9O4un70AjK_moWc0nNFoLKSty4WgfxCtW1nVmqjSU8TuaOmneSH6dTclvBP2DZuf8yA',
};

export interface DealsScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenFilters: () => void;
  onOpenDeal: () => void;
  onOpenNotifications: () => void;
  onClaim?: (onClaimed?: () => void) => void;
  onAccount: () => void;
}

function dealCardProps(onOpen: () => void) {
  return {
    onClick: onOpen,
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen();
      }
    },
  };
}

function GreetingHeader({
  onLocation,
  onNotifications,
  onAccount,
}: {
  onLocation: () => void;
  onNotifications: () => void;
  onAccount: () => void;
}) {
  const { district, city, radius } = useLocation();
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="px-margin py-3 flex items-center justify-between gap-space-2xs min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-space-2xs">
            <span className="font-caption text-caption text-text-secondary">Good evening</span>
            <Icon name="waving_hand" className="text-sm" />
          </div>
          <button
            type="button"
            onClick={onLocation}
            className="flex flex-nowrap items-center gap-1.5 text-left group transition-transform active:scale-95 min-w-0 whitespace-nowrap"
          >
            <Icon name="location_on" className="text-primary text-[20px] filled shrink-0" />
            <span className="font-button-primary text-button-primary text-text-primary truncate min-w-0">
              {district}, {city}
            </span>
            <Icon
              name="keyboard_arrow_down"
              className="text-text-secondary text-[18px] group-hover:translate-y-0.5 transition-transform shrink-0"
            />
            <span className="ml-1 shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-[11px] font-medium">
              Within {radius} km
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            aria-label="Notifications"
            type="button"
            onClick={onNotifications}
            className="relative w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-text-primary shadow-sm active:scale-95 transition-transform"
          >
            <Icon name="notifications" className="text-[22px]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
          </button>
          <button
            type="button"
            aria-label="Account"
            onClick={onAccount}
            className="relative w-10 h-10 rounded-full p-0.5 bg-primary-fixed flex items-center justify-center active:scale-95 transition-transform"
          >
            <span className="w-full h-full rounded-full overflow-hidden bg-secondary-fixed block">
              <img
                className="w-full h-full object-cover"
                alt=""
                src={AVATAR}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function DealGridCards({ onOpen, onClaim }: { onOpen: () => void; onClaim?: (onClaimed?: () => void) => void }) {
  const { claimed } = useAuth();
  return (
    <div className="grid grid-cols-2 gap-3 px-margin pb-space-lg">
      <article
        {...dealCardProps(onOpen)}
        className="bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
      >
        <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
          <img
            alt="Prime 3-Course Lunch Combo"
            className="w-full h-full object-cover"
            src={IMAGES.tasting}
          />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-xs">
            20% OFF
          </div>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface font-caption text-[11px] font-medium flex items-center gap-0.5">
            <Icon name="hourglass_top" className="text-[12px] text-tertiary-fixed" />4h
          </div>
        </div>
        <div className="p-2.5 flex flex-col flex-1 justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-caption text-[12px] text-text-secondary truncate">Urban Grill • Apo</span>
              <Icon name="verified" className="text-primary text-[14px] shrink-0" filled />
            </div>
            <h2 className="font-label-md text-label-md text-text-primary font-semibold leading-snug line-clamp-2 mb-1.5">
              Prime 3-Course Lunch Combo &amp; Drinks
            </h2>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-label-md text-[16px] text-text-primary font-bold">₦9,600</span>
              <span className="font-caption text-[12px] text-text-tertiary line-through">₦12,000</span>
            </div>
            <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold w-fit mb-2">
              Save ₦2,400
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-subtle mt-1">
            <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px]">
              <Icon name="location_on" className="text-[13px]" />
              <span>0.8 km</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClaim?.(() => {});
              }}
              className={`h-7 px-2 rounded-lg font-caption text-caption font-semibold hover:scale-105 active:scale-95 transition-all shadow-xs ${
                claimed
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-primary text-on-primary hover:bg-surface-tint'
              }`}
            >
              {claimed ? 'Claimed' : 'Claim'}
            </button>
          </div>
        </div>
      </article>

      <article
        {...dealCardProps(onOpen)}
        className="bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
      >
        <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
          <img
            alt="Weekend Streetwear Drop"
            className="w-full h-full object-cover"
            src={IMAGES.sneakers}
          />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-xs">
            30% OFF
          </div>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-surface-canvas/90 backdrop-blur-xs text-primary font-caption text-[11px] font-semibold">
            Hot
          </div>
        </div>
        <div className="p-2.5 flex flex-col flex-1 justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-caption text-[12px] text-text-secondary truncate">Sole District Boutique</span>
              <Icon
                name="local_fire_department"
                className="text-tertiary-container text-[14px] shrink-0"
                filled
              />
            </div>
            <h2 className="font-label-md text-label-md text-text-primary font-semibold leading-snug line-clamp-2 mb-1.5">
              Weekend Streetwear Drop &amp; Sneakers
            </h2>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-label-md text-[16px] text-text-primary font-bold">₦28,000</span>
              <span className="font-caption text-[12px] text-text-tertiary line-through">₦40,000</span>
            </div>
            <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold w-fit mb-2">
              Save ₦12,000
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-subtle mt-1">
            <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px]">
              <Icon name="location_on" className="text-[13px]" />
              <span>1.2 km</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClaim?.(() => {});
              }}
              className={`h-7 px-2 rounded-lg font-caption text-caption font-semibold hover:scale-105 active:scale-95 transition-all shadow-xs ${
                claimed
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-primary text-on-primary hover:bg-surface-tint'
              }`}
            >
              {claimed ? 'Claimed' : 'Claim'}
            </button>
          </div>
        </div>
      </article>

      <article
        {...dealCardProps(onOpen)}
        className="bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
      >
        <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
          <img
            alt="Full Weekend Glow Facial and Massage"
            className="w-full h-full object-cover"
            src={IMAGES.spa}
          />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-xs">
            25% OFF
          </div>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-surface-canvas/90 backdrop-blur-xs text-text-primary font-caption text-[11px] font-semibold">
            Popular
          </div>
        </div>
        <div className="p-2.5 flex flex-col flex-1 justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-caption text-[12px] text-text-secondary truncate">Glow &amp; Serenity Spa</span>
            </div>
            <h2 className="font-label-md text-label-md text-text-primary font-semibold leading-snug line-clamp-2 mb-1.5">
              Weekend Glow Facial &amp; Massage
            </h2>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-label-md text-[16px] text-text-primary font-bold">₦18,500</span>
              <span className="font-caption text-[12px] text-text-tertiary line-through">₦25,000</span>
            </div>
            <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold w-fit mb-2">
              Save ₦6,500
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-subtle mt-1">
            <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px]">
              <Icon name="location_on" className="text-[13px]" />
              <span>2.4 km</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClaim?.(() => {});
              }}
              className={`h-7 px-2 rounded-lg font-caption text-caption font-semibold hover:scale-105 active:scale-95 transition-all shadow-xs ${
                claimed
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-primary text-on-primary hover:bg-surface-tint'
              }`}
            >
              {claimed ? 'Claimed' : 'Claim'}
            </button>
          </div>
        </div>
      </article>

      <article
        {...dealCardProps(onOpen)}
        className="bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
      >
        <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
          <img
            alt="Signature Cold Brew &amp; Pastry Box"
            className="w-full h-full object-cover"
            src={IMAGES.coldBrew}
          />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-[11px] font-bold shadow-xs">
            BOGO Free
          </div>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
            15% OFF
          </div>
        </div>
        <div className="p-2.5 flex flex-col flex-1 justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-caption text-[12px] text-text-secondary truncate">Cafe Neo Artisanal</span>
            </div>
            <h2 className="font-label-md text-label-md text-text-primary font-semibold leading-snug line-clamp-2 mb-1.5">
              Cold Brew 1L &amp; Pastry Box
            </h2>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-label-md text-[16px] text-text-primary font-bold">₦4,500</span>
              <span className="font-caption text-[12px] text-text-tertiary line-through">₦6,000</span>
            </div>
            <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold w-fit mb-2">
              Save ₦1,500
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-subtle mt-1">
            <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px]">
              <Icon name="location_on" className="text-[13px]" />
              <span>3.1 km</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClaim?.(() => {});
              }}
              className={`h-7 px-2 rounded-lg font-caption text-caption font-semibold hover:scale-105 active:scale-95 transition-all shadow-xs ${
                claimed
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-primary text-on-primary hover:bg-surface-tint'
              }`}
            >
              {claimed ? 'Claimed' : 'Claim'}
            </button>
          </div>
        </div>
      </article>

      <article
        {...dealCardProps(onOpen)}
        className="bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
      >
        <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
          <img
            alt="Bespoke Tailoring &amp; Fitting"
            className="w-full h-full object-cover"
            src={IMAGES.sneakers}
          />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-xs">
            35% OFF
          </div>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-surface-canvas/90 backdrop-blur-xs text-primary font-caption text-[11px] font-semibold">
            Featured
          </div>
        </div>
        <div className="p-2.5 flex flex-col flex-1 justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-caption text-[12px] text-text-secondary truncate">Velvet Stitch Couture</span>
              <Icon name="verified" className="text-primary text-[14px] shrink-0" filled />
            </div>
            <h2 className="font-label-md text-label-md text-text-primary font-semibold leading-snug line-clamp-2 mb-1.5">
              Bespoke Tailoring &amp; Custom Fitting
            </h2>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-label-md text-heading-sm text-text-primary font-bold">₦32,000</span>
              <span className="font-caption text-[12px] text-text-tertiary line-through">₦49,000</span>
            </div>
            <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold w-fit mb-2">
              Save ₦17,000
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-subtle mt-1">
            <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px]">
              <Icon name="location_on" className="text-[13px]" />
              <span>1.8 km</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClaim?.(() => {});
              }}
              className={`h-7 px-2 rounded-lg font-caption text-caption font-semibold hover:scale-105 active:scale-95 transition-all shadow-xs ${
                claimed
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-primary text-on-primary hover:bg-surface-tint'
              }`}
            >
              {claimed ? 'Claimed' : 'Claim'}
            </button>
          </div>
        </div>
      </article>

      <article
        {...dealCardProps(onOpen)}
        className="bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
      >
        <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
          <img
            alt="Monthly Gym Pass + Personal Trainer"
            className="w-full h-full object-cover"
            src={IMAGES.tasting}
          />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-xs">
            40% OFF
          </div>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface font-caption text-[11px] font-medium flex items-center gap-0.5">
            <Icon name="bolt" className="text-[12px] text-tertiary-fixed" />Limited
          </div>
        </div>
        <div className="p-2.5 flex flex-col flex-1 justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-caption text-[12px] text-text-secondary truncate">Pulse Fitness &amp; Gym</span>
              <Icon name="verified" className="text-primary text-[14px] shrink-0" filled />
            </div>
            <h2 className="font-label-md text-label-md text-text-primary font-semibold leading-snug line-clamp-2 mb-1.5">
              Monthly Pass + Personal Trainer
            </h2>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-label-md text-heading-sm text-text-primary font-bold">₦15,000</span>
              <span className="font-caption text-[12px] text-text-tertiary line-through">₦25,000</span>
            </div>
            <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold w-fit mb-2">
              Save ₦10,000
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-subtle mt-1">
            <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px]">
              <Icon name="location_on" className="text-[13px]" />
              <span>1.5 km</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClaim?.(() => {});
              }}
              className={`h-7 px-2 rounded-lg font-caption text-caption font-semibold hover:scale-105 active:scale-95 transition-all shadow-xs ${
                claimed
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-primary text-on-primary hover:bg-surface-tint'
              }`}
            >
              {claimed ? 'Claimed' : 'Claim'}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export function DealsScreen({
  onTab,
  onOpenFilters,
  onOpenDeal,
  onOpenNotifications,
  onClaim,
  onAccount,
}: DealsScreenProps) {
  const { claimed } = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();

  return (
    <AppScreen>
      {view === 'grid' ? (
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
          <div className="px-margin py-2 flex items-center justify-between">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-caption text-caption text-text-secondary font-medium">Deals</span>
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                className="flex flex-nowrap items-center gap-1 mt-0.5 group text-left min-w-0 whitespace-nowrap"
              >
                <Icon name="location_on" className="text-primary text-[18px] shrink-0" filled />
                <span className="font-label-md text-label-md font-bold text-text-primary group-hover:text-primary transition-colors truncate min-w-0">
                  {district}, {city}
                </span>
                <Icon name="keyboard_arrow_down" className="text-text-secondary text-[18px] shrink-0" />
                <span className="ml-1 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-medium">
                  Within {radius} km
                </span>
              </button>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Notifications"
                type="button"
                onClick={onOpenNotifications}
                className="relative w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <Icon name="notifications" className="text-[24px]" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-canvas" />
              </button>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-label-sm shadow-xs cursor-pointer">
                <Icon name="person" className="text-[20px]" />
              </div>
            </div>
          </div>
        </header>
      ) : (
        <GreetingHeader
          onLocation={() => setLocationOpen(true)}
          onNotifications={onOpenNotifications}
          onAccount={onAccount}
        />
      )}

      {view === 'grid' ? (
        <div className="flex flex-col relative w-full pt-[84px] pb-24 bg-surface">
          <div className="flex flex-col w-full">
            <div className="px-margin mb-space-md">
              <div className="flex items-center h-12 px-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm focus-within:bg-surface-canvas focus-within:shadow-[0_0_0_2px_#066cf4] transition-all">
                <Icon name="search" className="text-text-secondary text-[22px] mr-space-xs shrink-0" />
                <input
                  className="w-full bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
                  placeholder="Search deals, businesses or products..."
                  type="text"
                />
                <button
                  aria-label="Filters"
                  type="button"
                  onClick={onOpenFilters}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-container transition-colors ml-1 shrink-0"
                >
                  <Icon name="tune" className="text-[20px]" />
                </button>
              </div>
            </div>

            <div className="px-margin mb-space-md">
              <div
                {...dealCardProps(onOpenDeal)}
                className="w-full text-left bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon name="local_fire_department" className="text-primary text-[18px]" filled />
                    <span className="font-label-sm text-[12px] font-bold uppercase tracking-wider text-text-secondary">
                      FEATURED DEAL OF THE DAY
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                    50% OFF
                  </span>
                </div>
                <div className="relative w-full aspect-[16/9] bg-surface-container overflow-hidden">
                  <img
                    alt="Chef's 5-Course Sunset Tasting Menu"
                    className="w-full h-full object-cover"
                    src={IMAGES.tasting}
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-[11px] font-bold shadow-xs flex items-center gap-1">
                      <Icon name="star" className="text-[13px]" filled />Top Pick
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface font-caption text-[11px] font-medium">
                      Special Promo
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface font-caption text-[11px] font-medium flex items-center gap-1">
                    <Icon name="hourglass_top" className="text-[13px] text-tertiary-fixed" />
                    Ends in 8h
                  </div>
                </div>
                <div className="p-space-md flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-caption text-[12px] text-text-secondary font-medium truncate">
                        The Sky Lounge &amp; Grill • Apo Legacy Tower
                      </span>
                      <Icon name="verified" className="text-primary text-[14px] shrink-0" filled />
                    </div>
                    <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px] shrink-0">
                      <Icon name="location_on" className="text-[13px]" />
                      <span>1.1 km</span>
                    </div>
                  </div>
                  <h2 className="font-heading-sm text-[17px] text-text-primary font-bold leading-snug mb-2">
                    Chef&apos;s 5-Course Sunset Tasting Menu &amp; Wine Pairing
                  </h2>
                  <div className="flex items-baseline justify-between mb-2.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading-md text-heading-md text-text-primary font-bold">₦22,500</span>
                      <span className="font-body-md text-body-md text-text-tertiary line-through">₦45,000</span>
                      <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
                        Save ₦22,500
                      </span>
                    </div>
                    <span className="font-caption text-[11px] text-error font-medium">
                      Limited to 30 vouchers
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle">
                    <div className="flex items-center gap-3 text-text-secondary font-caption text-[12px]">
                      <span className="flex items-center gap-1">
                        <Icon name="favorite" className="text-[15px] text-error" filled />148
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="chat_bubble" className="text-[15px]" />32
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onClaim?.(() => {});
                      }}
                      className={`h-9 px-4 rounded-xl font-label-md text-label-md font-semibold active:scale-95 transition-all shadow-xs flex items-center gap-1.5 ${
                        claimed
                          ? 'bg-badge-discount-bg text-badge-discount-text'
                          : 'bg-primary text-on-primary hover:bg-surface-tint'
                      }`}
                    >
                      {claimed ? 'Claimed' : 'Claim Deal'}
                      <Icon name="arrow_forward" className="text-[16px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-margin mb-space-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-label-md text-text-primary font-bold">
                  Deals in {district}, {city}
                </span>
                <span className="font-caption text-caption text-text-tertiary">(6)</span>
              </div>
              <div className="flex items-center p-0.5 rounded-lg bg-surface-container border border-border-subtle">
                <button
                  aria-label="List view"
                  type="button"
                  onClick={() => setView('list')}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <Icon name="view_agenda" className="text-[18px]" />
                </button>
                <button
                  aria-label="Grid view"
                  type="button"
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-canvas text-primary shadow-xs font-semibold"
                >
                  <Icon name="grid_view" className="text-[18px]" />
                </button>
              </div>
            </div>

            <DealGridCards onOpen={onOpenDeal} onClaim={onClaim} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col relative w-full pt-[88px] pb-24 bg-surface">
          <div className="flex flex-col w-full">
            <div className="px-margin mb-space-sm">
              <div className="flex items-center h-[50px] px-4 rounded-2xl bg-surface-container-low shadow-sm transition-all focus-within:bg-surface-canvas focus-within:shadow-md">
                <Icon name="search" className="text-text-tertiary text-[22px] mr-3" />
                <input
                  className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
                  placeholder="Search deals, businesses or products"
                  type="text"
                />
                <button
                  aria-label="Filter options"
                  type="button"
                  onClick={onOpenFilters}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center"
                >
                  <Icon name="tune" className="text-[22px]" />
                </button>
              </div>
            </div>

            <div className="px-margin mb-space-sm flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">Showing 6 deals</span>
              <div className="flex items-center p-0.5 rounded-lg bg-surface-container border border-border-subtle">
                <button
                  aria-label="List view"
                  type="button"
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-canvas text-primary shadow-xs font-semibold"
                >
                  <Icon name="view_agenda" className="text-[18px]" />
                </button>
                <button
                  aria-label="Grid view"
                  type="button"
                  onClick={() => setView('grid')}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <Icon name="grid_view" className="text-[18px]" />
                </button>
              </div>
            </div>

            <DealGridCards onOpen={onOpenDeal} onClaim={onClaim} />
          </div>
        </div>
      )}

      <MobileTabBar active="deals" onTab={onTab} />
      <LocationRadiusModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onApply={setLocation}
        district={district}
        radius={radius}
      />
    </AppScreen>
  );
}
