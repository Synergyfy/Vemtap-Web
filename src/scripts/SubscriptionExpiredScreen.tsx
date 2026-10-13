import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { SubscriptionHeader } from './SubscriptionHeader';

interface SubscriptionExpiredScreenProps {
  onBack: () => void;
  onActivate: () => void;
  onViewBusiness: () => void;
}

const SAVED_SNAPSHOTS = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPA0XxFKh69aQwtXHsVBJ5iVpv5jcrtCnttwgAR43od2GHvYcpvFrt9jXnYm2vHrTMy7_IplosEtgj6WX8YaSsMcsSUH-ltorP-3hzho9rA91cvFuOfTabR11C4snJaBaFb_ssdpJdC6OoEnujYHXxNPzdbyY1whQsZxpGbmdi6bHbqMk-HCONWzn6vdZd9EF_fjyLmQKw4o5QRRuwvFk0UfZNlF3dUQGXSWFCkm8KaCAWTQrmCYRYuQ',
    alt: 'Warm modern artisan bakery interior display with fresh golden croissants, delicate pastries, and polished wooden shelves under soft daylight, clean retail presentation.',
    icon: 'inventory_2',
    label: '14 Items',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYFJT-yPSlL19UQset5SjCKMOeTO1BlmIO273u76iEPUGTQILq3w6S5Odjk49TaIGm6FAuk_OjVq2tZcZsGh0xrvOC-R8HJ5oaQ2EcXs6jCM2Ui8s9PkKHgkQGg2A_c3ZdlkPRkkMa4NR6rkjkWNStUs07FiREjLPjQcA069sA49DEeSKOiR4K42xS2o25es8xqlQS808Slt5lqvwu-i0BCX6_UWF4o7uy4kVw7c29rdPsiLIkwM-26w',
    alt: 'Stylish specialty coffee bar counter with ceramic cups, espresso machine steam, and minimalist indoor plants in a vibrant neighborhood cafe.',
    icon: 'storefront',
    label: '2 Outlets',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2p8JrUt1fnHozXgiGD2jSABn47HP_rXcJzSlyejxk8lxJmTiDqDUPA6cPOk7M8-24kuO9UUg0Ljjpbv8bZlwvJyZnWVH72KRMhvFOL57hh8lHWwHmrTjYvYpHgyB3Z7lxOBWDYCsSQGFaTU1KHPyCAPmeyS5HSc9masa70Kx4GMYgqG1BJ9s5hND_Jdd9j06Odhdlc9c-pGHznZ5FwvLIn34y9Hi5n92N6zJOMQBMuZAhJQdRvkquOg',
    alt: 'Happy young local customers seated at cozy bistro outdoor table enjoying iced beverages with warm natural ambient lighting.',
    icon: 'star',
    label: '4.9 (128)',
  },
];

const REACTIVATION_BENEFITS = [
  'Re-enable customer deal claims & discovery',
  'Re-activate QR code table passes',
  'Full multi-location access & staff permissions',
];

export function SubscriptionExpiredScreen({
  onBack,
  onActivate,
  onViewBusiness,
}: SubscriptionExpiredScreenProps) {
  return (
    <AppScreen surface="bg-surface-canvas">
      <SubscriptionHeader title="Subscription Plans" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-2xl">
        {/* Friendly Hero Header */}
        <div className="flex flex-col items-center text-center mt-space-md mb-space-lg relative">
          <div className="absolute -top-6 w-44 h-44 rounded-full bg-surface-container blur-2xl opacity-60 pointer-events-none" />
          <div className="relative w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-space-md shadow-sm">
            <div className="w-14 h-14 rounded-full bg-surface-canvas flex items-center justify-center text-primary shadow-sm">
              <Icon name="lock_clock" filled className="text-[32px]" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-badge-discount-bg text-badge-discount-text w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
              <Icon name="verified_user" className="text-[16px]" />
            </div>
          </div>
          <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight mb-space-2xs max-w-[320px]">
            Your VEMTAP trial has ended
          </h2>
          <p className="font-label-sm text-label-sm text-text-secondary max-w-[320px]">
            Your business information is completely safe. Subscribe to VEMTAP Growth to continue using the full
            business experience.
          </p>
        </div>

        {/* Security & Data Safe Guarantee Card */}
        <div className="bg-surface-subtle rounded-xl p-space-md mb-space-md shadow-sm">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
              <Icon name="cloud_done" className="text-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-space-2xs mb-space-2xs">
                <h3 className="font-label-md text-label-md text-text-primary font-bold">Your Store Data is Secure</h3>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-snug">
                Your products, menu items, branch locations, and customer reviews are saved and ready to reactivate
                immediately.
              </p>
            </div>
          </div>
          {/* Mini Visual Snapshot of Saved Merchant Assets */}
          <div className="grid grid-cols-3 gap-space-xs mt-space-sm pt-space-xs">
            {SAVED_SNAPSHOTS.map((snapshot) => (
              <div className="relative h-16 rounded-lg overflow-hidden shadow-sm" key={snapshot.label}>
                <img alt={snapshot.alt} className="w-full h-full object-cover" src={snapshot.src} />
                <div className="absolute inset-0 bg-inverse-surface/30 flex items-center justify-center">
                  <span className="font-label-sm text-label-sm text-on-primary font-medium flex items-center gap-1">
                    <Icon name={snapshot.icon} className="text-[14px]" /> {snapshot.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Renewal Tier Card */}
        <div className="bg-surface-canvas rounded-xl p-space-md mb-space-lg shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
          <div className="flex items-start justify-between mb-space-xs pt-space-2xs">
            <div>
              <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                Recommended Plan
              </span>
              <h4 className="font-heading-sm text-heading-sm text-text-primary mt-0.5">VEMTAP Growth</h4>
            </div>
            <div className="text-right">
              <span className="font-heading-md text-heading-md text-text-primary font-bold">₦5,000</span>
              <span className="font-caption text-caption text-text-secondary block -mt-1">/ month</span>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs mb-space-md">
            <Icon name="bolt" className="text-badge-discount-text text-[16px]" />
            <p className="font-label-sm text-label-sm text-badge-discount-text font-medium">
              Instant reactivation • No setup fee
            </p>
          </div>
          <div className="flex flex-col gap-space-xs pt-space-2xs">
            {REACTIVATION_BENEFITS.map((benefit) => (
              <div className="flex items-start gap-space-xs" key={benefit}>
                <div className="w-6 h-6 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-[14px]" />
                </div>
                <span className="font-label-sm text-label-sm text-text-primary">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Deck Area */}
        <div className="flex flex-col gap-space-sm mb-space-lg">
          <button
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs shadow-md shadow-primary-container/25 active:scale-[0.98] transition-transform"
            type="button"
            onClick={onActivate}
          >
            <span>Activate Growth — ₦5,000/mo</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <button
            className="w-full h-11 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs active:bg-surface-container transition-colors"
            type="button"
            onClick={onViewBusiness}
          >
            <Icon name="visibility" className="text-text-secondary text-[18px]" />
            <span>View My Business (Read-Only)</span>
          </button>
        </div>

        {/* Merchant Support Footer */}
        <div className="text-center pt-space-xs pb-space-sm">
          <p className="font-label-sm text-label-sm text-text-secondary">Questions about your plan?</p>
          <a
            className="font-label-sm text-label-sm text-primary font-medium inline-flex items-center gap-1 hover:underline mt-0.5"
            href="mailto:support@vemtap.com"
          >
            <Icon name="support_agent" className="text-[14px]" />
            <span>Contact Merchant Support anytime</span>
          </a>
        </div>
      </div>
    </AppScreen>
  );
}
