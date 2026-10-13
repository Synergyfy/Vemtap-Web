import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { SubscriptionHeader } from './SubscriptionHeader';

interface SubscriptionEndingScreenProps {
  onBack: () => void;
  onContinue: () => void;
  onReviewBusiness: () => void;
}

const KEEP_BENEFITS = [
  'Keep your business profile & storefront active',
  'Keep your deals visible to local shoppers',
  'Keep managing your branch locations (Apo & Wuse II)',
  'Continue engaging customers via direct in-app chat',
  'Continue using analytics, QR tap codes & loyalty tools',
];

const STORE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCf1bbGzmyknuRv6JJjZob16_tE3Rl83Fln41x6CqCXX8OVvYrxsHkmLDBBx89eBWIpmX18hXeGHaxIYD6ydAk_ZlxHQE82eaGn76pyXv_pBIyg66F46WT1wkBg-MKWxOoOgGYeT15wOcB3A7r-jL4Lx64FAulOZQLYvRmn782nf7chBB0qof3mzi8yHrjHtslTRpb2k8P1NF36d8VSt8rIvZsuX_0QzeVoctjvJugy4flJq-BEgPmOwg';
const STORE_ALT =
  'Warm welcoming modern coffee roastery and artisan bakery storefront interior in Abuja Nigeria with natural warm wood accents, lush indoor plants, clean brass tap counter, vibrant local patrons having brunch under gentle morning sunlight in crisp retail aesthetics.';

export function SubscriptionEndingScreen({
  onBack,
  onContinue,
  onReviewBusiness,
}: SubscriptionEndingScreenProps) {
  return (
    <AppScreen surface="bg-surface-canvas">
      <SubscriptionHeader title="Subscription Plans" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-6 space-y-3.5">
        {/* Friendly Expiration Notice Banner */}
        <div className="relative overflow-hidden rounded-xl bg-tertiary-fixed p-3.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 text-tertiary">
              <Icon name="hourglass_top" filled className="text-[20px]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label-md text-label-md font-semibold text-on-tertiary-fixed leading-snug block">
                Your VEMTAP trial is ending
              </span>
              <p className="font-body-md text-body-md text-on-tertiary-fixed-variant leading-relaxed mt-0.5">
                Your free trial ends in <span className="font-bold text-tertiary">3 days</span> (Oct 21, 2024). Keep
                your momentum going without losing store visibility.
              </p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 flex items-center justify-between border-t border-tertiary/10">
            <div className="flex items-center gap-1.5 text-on-tertiary-fixed-variant">
              <Icon name="event_available" className="text-[15px] text-tertiary" />
              <span className="font-caption text-caption">Day 27 of 30 completed</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold bg-tertiary text-on-tertiary">
              3 Days Left
            </span>
          </div>
        </div>

        {/* Store Continuity Spotlight Card */}
        <div className="rounded-xl bg-surface-subtle p-3.5 shadow-sm border border-border-subtle/50">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption text-badge-discount-text uppercase tracking-wider font-semibold">
                Live Storefronts
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">2 active branches</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center overflow-hidden flex-shrink-0">
              <img alt={STORE_ALT} className="w-full h-full object-cover" src={STORE_IMG} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading-sm text-heading-sm font-semibold text-text-primary truncate">
                Koffee & Co. Roasters
              </p>
              <p className="font-label-sm text-label-sm text-text-secondary truncate mt-0.5">
                Apo Resettlement • Wuse II Branch
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary flex-shrink-0">
              <Icon name="storefront" className="text-[18px]" />
            </div>
          </div>
        </div>

        {/* Growth Plan Highlight Card */}
        <div className="relative overflow-hidden rounded-xl bg-surface-canvas p-4 shadow-sm border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold bg-surface-tint-blue text-primary">
              Recommended Plan
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-heading-lg text-heading-lg font-bold text-text-primary tracking-tight leading-none">
                ₦5,000
              </span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">/month</span>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="font-heading-md text-heading-md font-semibold text-text-primary leading-snug">
              Continue with VEMTAP Growth
            </h2>
            <p className="font-body-md text-body-md text-text-secondary mt-1 leading-relaxed">
              Continue using VEMTAP Growth to keep your business active on the VEMTAP network without interruption.
            </p>
          </div>
          {/* Value Matrix Checklist */}
          <div className="mt-3.5 space-y-2.5 bg-surface-subtle/80 rounded-lg p-3.5">
            <div className="font-label-md text-label-md text-text-primary font-semibold mb-1">
              Key benefits to keep active:
            </div>
            {KEEP_BENEFITS.map((benefit) => (
              <div className="flex items-start gap-2" key={benefit}>
                <div className="w-4 h-4 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-[12px] font-bold" />
                </div>
                <span className="font-label-sm text-label-sm text-text-primary leading-tight">{benefit}</span>
              </div>
            ))}
          </div>
          {/* Pricing Clarity Note */}
          <div className="mt-3 flex items-center gap-1.5 px-1 text-text-secondary">
            <Icon name="verified" className="text-[16px] text-primary flex-shrink-0" />
            <span className="font-caption text-caption leading-normal">
              Simple pricing: One plan covering all your storefronts. No hidden setup fees.
            </span>
          </div>
        </div>

        {/* Action Deck */}
        <div className="mt-auto pt-1 space-y-2.5">
          <button
            className="w-full h-[46px] rounded-xl bg-primary-container text-on-primary-container font-button-secondary text-button-secondary font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all hover:opacity-95"
            type="button"
            onClick={onContinue}
          >
            <span>Continue with Growth — ₦5,000/month</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <button
            className="w-full h-[40px] rounded-xl bg-transparent text-text-primary font-button-secondary text-button-secondary font-medium flex items-center justify-center hover:bg-surface-subtle active:scale-[0.99] transition-all"
            type="button"
            onClick={onReviewBusiness}
          >
            Review My Business
          </button>
          <div className="flex items-center justify-center gap-1.5 text-text-tertiary pt-1">
            <Icon name="lock_outline" className="text-[14px]" />
            <p className="font-caption text-caption text-center">
              Your account data and listings are never automatically deleted.
            </p>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
