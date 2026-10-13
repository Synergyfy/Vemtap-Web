import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationUnregisteredScreenProps {
  onBack: () => void;
  onContinue: () => void;
  onLearnMore: () => void;
  legalName: string;
  onBrand?: () => void;
}

const FEATURES = [
  {
    icon: 'local_offer',
    title: 'Post deals & daily flash offers',
    body: 'Publish discount vouchers to nearby shoppers with automated redemption countdowns.',
  },
  {
    icon: 'qr_code_2',
    title: 'Set up your storefront & share instant QR code',
    body: 'Display branded tabletop stands and direct links to your online menu and catalog.',
  },
  {
    icon: 'chat',
    title: 'Receive direct customer chats & reservations',
    body: 'Take inquiries, confirm table slots, and retain customer histories in your merchant inbox.',
  },
  {
    icon: 'payments',
    title: 'Accept direct customer payments (Card, Cash, Transfer)',
    body: 'Instant settlement routed into your personal verified Nigerian commercial bank account.',
  },
  {
    icon: 'point_of_sale',
    title: 'Manage POS registers, staff tills & shifts',
    body: 'Assign multiple cashier pins, track shift summaries, and print digital receipts.',
  },
];

const COMPARISON_ROWS = [
  { icon: 'store', label: 'Deals & Storefront', informal: 'Informal: ✓', informalClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold', cac: 'CAC: ✓', cacClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold' },
  { icon: 'credit_card', label: 'POS & Direct Payments', informal: 'Informal: ✓', informalClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold', cac: 'CAC: ✓', cacClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold' },
  { icon: 'verified_user', label: 'Blue Verified Badge', informal: 'Optional', informalClass: 'bg-surface-container-high text-on-surface-variant', cac: 'CAC: ✓', cacClass: 'bg-surface-tint-blue text-primary font-semibold' },
  { icon: 'radar', label: 'Top Radar Feed Boost', informal: 'Standard', informalClass: 'bg-surface-container-high text-on-surface-variant', cac: 'CAC: Priority', cacClass: 'bg-surface-tint-blue text-primary font-semibold' },
];

export function DesktopVerificationUnregisteredScreen({
  onBack,
  onContinue,
  onLearnMore,
  legalName,
  onBrand,
}: DesktopVerificationUnregisteredScreenProps) {
  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-6xl mx-auto w-full py-8 px-6 flex flex-col gap-8">
        <div className="relative overflow-hidden rounded-2xl bg-surface-canvas shadow-sm p-8 md:p-10">
          <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-surface-tint-blue/70 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="flex items-start gap-5 max-w-3xl">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-surface-tint-blue text-primary flex items-center justify-center shadow-inner">
                  <Icon name="storefront" className="text-[34px]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shadow-sm">
                  <Icon name="sentiment_satisfied" className="text-[15px]" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold tracking-wide uppercase">
                    Zero Friction Launch
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption font-medium">
                    No CAC Required
                  </span>
                </div>
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight font-bold">
                  You can still use VEMTAP without CAC registration
                </h1>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  Launch your store, publish discount deals, and welcome walk-in customers immediately. Informal
                  business owners, artisans, and solo founders have full functional access — registration can always be
                  added later.
                </p>
              </div>
            </div>
            <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-2 md:pt-0">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                <Icon name="check_circle" className="text-[16px]" />
                <span>Account Active &amp; Ready</span>
              </div>
              <span className="font-caption text-caption text-text-tertiary">Tier 1: Solo Operator Access</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-xl bg-surface-canvas shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="badge" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Current Verification Standing
                  </h2>
                </div>
                <span className="font-caption text-caption text-text-secondary">Level 1 Compliant</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-surface-subtle p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary font-medium">Operator Identity (NIN)</span>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                      <Icon name="check" className="text-[14px]" />
                      Verified
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      {legalName || 'Zainab Ahmed'}
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">National Identity No: •••• 4821</span>
                  </div>
                </div>
                <div className="rounded-xl bg-surface-subtle p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary font-medium">Corporate Registration</span>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption font-medium">
                      Not Registered (Optional)
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Informal / Sole Trader</span>
                    <span className="font-caption text-caption text-text-tertiary">Corporate Affairs Commission (CAC)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-surface-canvas shadow-sm p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Icon name="verified" className="text-badge-discount-text text-[22px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    What you can do right now (Full Access)
                  </h3>
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  Your store is completely functional across sales, marketing, and customer management rails.
                </p>
              </div>
              <div className="flex flex-col gap-3.5">
                {FEATURES.map((feature) => (
                  <div
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-subtle hover:bg-surface-tint-blue/40 transition-colors"
                    key={feature.icon}
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-canvas text-primary flex items-center justify-center shrink-0 shadow-sm">
                      <Icon name={feature.icon} className="text-[18px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{feature.title}</span>
                      <span className="font-caption text-caption text-text-secondary">{feature.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-surface-tint-blue p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-surface-canvas text-primary flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="info" className="text-[20px]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-md text-label-md text-primary font-semibold">No pressure or rigid constraints</span>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Take all the time you need. Whenever you choose to incorporate with CAC in the future, simply
                  navigate to{' '}
                  <span className="font-semibold text-text-primary">Business Profile Settings → Verification</span> to
                  upload your RC/BN certificate and claim your official Verified checkmark.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-xl bg-surface-canvas shadow-sm p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-semibold">
                  Capability Matrix
                </span>
                <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                  Informal vs CAC Verified
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {COMPARISON_ROWS.map((row) => (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle" key={row.label}>
                    <div className="flex items-center gap-2.5">
                      <Icon name={row.icon} className="text-text-secondary text-[18px]" />
                      <span className="font-label-sm text-label-sm text-text-primary font-medium">{row.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-caption text-caption ${row.informalClass}`}>{row.informal}</span>
                      <span className={`px-2 py-0.5 rounded font-caption text-caption ${row.cacClass}`}>{row.cac}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3.5 rounded-lg bg-surface-subtle flex items-center gap-3">
                <Icon name="lightbulb" className="text-text-tertiary text-[18px]" />
                <p className="font-caption text-caption text-text-secondary">
                  92% of new artisans and food spots start as Sole Traders and upgrade later.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-surface-canvas shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="assignment" className="text-[20px]" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-label-md text-label-md text-text-primary font-semibold">
                    Need help registering with CAC?
                  </h4>
                  <span className="font-caption text-caption text-text-secondary">
                    Optional support from certified legal partners
                  </span>
                </div>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                When you're ready to register your Business Name (BN) or Limited Liability Company (LTD), our vetted
                partner agents handle filings in 5–7 business days.
              </p>
              <button
                className="inline-flex items-center justify-between p-3 rounded-lg bg-surface-subtle hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold transition-colors"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <Icon name="open_in_new" className="text-[16px]" />
                  Explore CAC Partner Assisted Desk
                </span>
                <Icon name="chevron_right" className="text-[16px]" />
              </button>
            </div>

            <div className="rounded-xl bg-surface-container-low p-4 flex items-center gap-3.5">
              <Icon name="gavel" className="text-badge-discount-text text-[24px]" />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-text-primary font-semibold">NDPR &amp; CBN Tier-1 Compliant</span>
                <span className="font-caption text-caption text-text-secondary">
                  Personal identities and transaction settlements operate under audited Nigerian data privacy standards.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full rounded-2xl bg-surface-canvas shadow-sm p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            className="inline-flex items-center gap-2 font-label-md text-label-md text-primary font-semibold hover:underline"
            type="button"
            onClick={onLearnMore}
          >
            <Icon name="verified" className="text-[18px]" />
            <span>Learn about business verification tiers →</span>
          </button>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              className="px-5 py-3 rounded-xl text-text-secondary font-button-secondary text-button-secondary font-medium hover:bg-surface-subtle transition-colors"
              type="button"
              onClick={onBack}
            >
              Back
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-on-primary font-button-primary text-button-primary font-semibold hover:bg-surface-tint active:scale-[0.98] transition-all shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)]"
              type="button"
              onClick={onContinue}
            >
              <span>Continue Store Setup</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
