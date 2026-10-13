import { Icon } from '../../components/ui/Icon';
import { SubscriptionChrome } from './SubscriptionChrome';

interface DesktopSubscriptionExpiredScreenProps {
  onBack: () => void;
  onActivate: () => void;
  onViewBusiness: () => void;
}

const NAV_DISABLED = ['Overview', 'Profile', 'Locations', 'Catalog', 'Deals', 'Analytics', 'Payouts', 'Billing'];

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

export function DesktopSubscriptionExpiredScreen({
  onBack,
  onActivate,
  onViewBusiness,
}: DesktopSubscriptionExpiredScreenProps) {
  return (
    <SubscriptionChrome activeNav="billing" breadcrumb="Trial Expired">
      <div className="max-w-6xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-xl">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-surface-container to-surface-canvas shadow-sm">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-surface-container blur-2xl opacity-60 pointer-events-none" />
          <div className="relative z-10 p-space-xl flex flex-col items-center text-center gap-space-sm">
            <div className="relative w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-surface-canvas flex items-center justify-center text-primary shadow-sm">
                <Icon name="lock_clock" filled className="text-[32px]" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-badge-discount-bg text-badge-discount-text w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                <Icon name="verified_user" className="text-[16px]" />
              </div>
            </div>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight max-w-2xl">
              Your VEMTAP trial has ended
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary max-w-lg">
              Your business information is completely safe. Subscribe to VEMTAP Growth to continue using the full
              business experience.
            </p>
            <div className="flex items-center gap-space-xs mt-space-xs">
              <span className="px-space-sm py-space-2xs rounded-full bg-error-container text-error font-caption text-caption font-semibold">
                Trial Expired
              </span>
              <span className="px-space-sm py-space-2xs rounded-full bg-surface-subtle text-text-secondary font-caption text-caption">
                Data preserved • Read-only
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl items-start">
          <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm">
            <div className="flex items-start gap-space-sm mb-space-md">
              <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="cloud_done" className="text-[22px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-label-md text-label-md text-text-primary font-bold">Your Store Data is Secure</h2>
                <p className="font-caption text-caption text-text-secondary leading-snug mt-space-2xs">
                  Your products, menu items, branch locations, and customer reviews are saved and ready to reactivate
                  immediately.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-sm mb-space-md">
              {SAVED_SNAPSHOTS.map((snap) => (
                <div key={snap.label} className="flex flex-col gap-space-2xs">
                  <div className="relative w-full h-20 rounded-lg overflow-hidden bg-surface-container">
                    <img alt={snap.alt} className="w-full h-full object-cover opacity-80" src={snap.src} />
                    <div className="absolute inset-0 bg-text-primary/20" />
                  </div>
                  <div className="flex items-center gap-space-2xs">
                    <Icon name={snap.icon} className="text-text-secondary text-[14px]" />
                    <span className="font-caption text-caption text-text-secondary font-medium">{snap.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-space-xs rounded-xl bg-surface-container-low px-space-sm py-space-xs mb-space-md">
              <Icon name="visibility" className="text-text-tertiary text-[16px]" />
              <span className="font-caption text-caption text-text-secondary">
                Read-Only mode — profile visible, editing paused
              </span>
            </div>

            <button
              type="button"
              onClick={onViewBusiness}
              className="w-full h-11 rounded-xl bg-surface-tint-blue text-primary-container font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all"
            >
              <Icon name="storefront" className="text-[18px]" />
              <span>View My Business</span>
            </button>
          </section>

          <section className="relative rounded-xl bg-surface-canvas p-space-lg shadow-md border-2 border-primary-container overflow-hidden">
            <div className="absolute top-0 right-0 px-space-sm py-space-2xs bg-primary-container text-on-primary-container font-caption text-caption font-bold rounded-bl-xl">
              Most Popular
            </div>
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
                Official Plan
              </span>
            </div>
            <h2 className="font-heading-md text-heading-md text-text-primary">VEMTAP Growth</h2>
            <div className="flex items-baseline gap-space-2xs mt-space-2xs mb-space-md">
              <span className="font-heading-lg text-heading-lg text-text-primary font-bold">₦5,000</span>
              <span className="font-caption text-caption text-text-secondary">/ month</span>
            </div>

            <div className="flex flex-col gap-space-xs mb-space-md">
              {REACTIVATION_BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-center gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                    <Icon name="lock_open" filled className="text-badge-discount-text text-[14px]" />
                  </div>
                  <span className="font-label-sm text-label-sm text-text-primary">{benefit}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onActivate}
              className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary shadow-md flex items-center justify-center gap-space-xs hover:bg-primary active:scale-[0.98] transition-all"
            >
              <Icon name="bolt" filled className="text-[18px]" />
              <span>Activate Growth</span>
            </button>
            <p className="text-center font-caption text-caption text-text-tertiary mt-space-xs">
              Instant reactivation — everything restores in seconds.
            </p>
          </section>
        </div>

        <section className="rounded-xl bg-surface-tint-blue p-space-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center">
              <Icon name="support_agent" className="text-primary text-[20px]" />
            </div>
            <span className="font-label-sm text-label-sm text-text-secondary">
              Questions about reactivation? Our merchant desk is one message away.
            </span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="h-11 px-space-md rounded-xl bg-surface-canvas text-text-primary font-button-secondary text-button-secondary flex items-center justify-center shadow-sm active:scale-[0.98] transition-all"
          >
            Back to Overview
          </button>
        </section>

        <p className="text-center font-caption text-caption text-text-tertiary">
          Security Standards • NDPR &amp; Privacy • Merchant Agreement • Support Desk — VEMTAP Business Enterprise
          Compliance
        </p>
        <span className="sr-only">{NAV_DISABLED.join(', ')} temporarily unavailable</span>
      </div>
    </SubscriptionChrome>
  );
}
