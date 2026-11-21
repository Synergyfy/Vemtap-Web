import { Icon } from '../../components/ui/Icon';
import { maskIdNumber } from '../../services/verificationService';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationCompleteScreenProps {
  onBack: () => void;
  onActivate: () => void;
  onPreviewStorefront: () => void;
  legalName: string;
  cacNumber: string;
  businessName: string;
  onBrand?: () => void;
  /** True when any check came back from the BytID sandbox. */
  sandbox?: boolean;
}

export function DesktopVerificationCompleteScreen({
  onBack,
  onActivate,
  onPreviewStorefront,
  legalName,
  cacNumber,
  businessName,
  onBrand,
  sandbox = false,
}: DesktopVerificationCompleteScreenProps) {
  const merchantName = businessName || 'Your business';
  const maskedRegistration = cacNumber ? maskIdNumber(cacNumber) : 'Not supplied';
  const breakdown = [
    {
      num: '1',
      icon: 'badge',
      title: 'Operator Identity',
      status: 'Submitted',
      statusIcon: 'check_circle',
      body: `${legalName || 'Account holder'} • Recorded against your account`,
    },
    {
      num: '2',
      icon: 'domain',
      title: 'Business Registry',
      status: 'Submitted',
      statusIcon: 'schedule',
      body: `${maskedRegistration} • Registration check submitted`,
    },
    {
      num: '3',
      icon: 'pin_drop',
      title: 'Business Locations',
      status: 'Optional',
      statusIcon: 'share_location',
      body: 'Manage branches from your dashboard',
    },
    {
      num: '4',
      icon: 'storefront',
      title: 'Business Profile',
      status: 'Ready',
      statusIcon: 'check_circle',
      body: 'Logo, cover, catalogue & deals',
    },
  ];

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-6xl mx-auto w-full py-8 px-6 flex flex-col gap-space-xl">
        <section className="relative overflow-hidden rounded-xl bg-surface-canvas shadow-xl p-space-xl md:p-space-3xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-badge-discount-text/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-xl">
            <div className="flex flex-col gap-space-md max-w-2xl">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  {sandbox ? 'Sandbox checks recorded' : 'Checks submitted'}
                </span>
                <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-medium">
                  <Icon name="fact_check" className="text-[14px]" />
                  Setup complete
                </span>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                  Verification setup complete
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary leading-relaxed">
                  Your identity and business checks for <span className="font-semibold text-text-primary">{merchantName}</span>{' '}
                  have been recorded. Open the status centre to see the final outcome.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-lg pt-space-xs">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="badge" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-tertiary uppercase font-medium">Identity check</span>
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Submitted</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                    <Icon name="domain" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-tertiary uppercase font-medium">Business check</span>
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Submitted</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative shrink-0 self-center lg:self-auto">
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-surface-tint-blue via-surface-container-high to-surface-canvas shadow-lg flex items-center justify-center">
                <div className="absolute inset-2 rounded-full border-2 border-primary/20" />
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-surface-canvas shadow-md flex flex-col items-center justify-center text-center p-space-xs">
                  <div className="relative flex items-center justify-center">
                    <Icon name="shield" filled className="text-primary text-[52px]" />
                    <Icon name={sandbox ? 'science' : 'task_alt'} filled className="text-badge-discount-text text-[26px] absolute" />
                  </div>
                  <span className="font-caption text-caption font-bold text-text-primary tracking-wide mt-space-2xs">
                    {sandbox ? 'SANDBOX' : 'SUBMITTED'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-7 h-7 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                    <Icon name="fact_check" className="text-[18px]" />
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Verification Summary</h2>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-primary font-caption text-caption font-bold">
                  Setup complete
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {breakdown.map((item) => (
                  <div
                    className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle"
                    key={item.num}
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <div className="w-9 h-9 rounded-full bg-surface-canvas flex items-center justify-center text-primary shrink-0">
                        <Icon name={item.icon} className="text-[20px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                          {item.num}. {item.title}
                        </span>
                        <span className="font-caption text-caption text-text-secondary truncate">{item.body}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary shrink-0">
                      <Icon name={item.statusIcon} className="text-[16px]" />
                      <span className="font-caption text-caption font-semibold">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption font-semibold uppercase tracking-wider text-text-tertiary">
                  Storefront Preview
                </span>
                <span className="font-caption text-caption text-text-secondary font-medium">Draft state</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-surface-subtle shadow-sm flex flex-col">
                <div className="relative h-36 w-full bg-surface-tint-blue flex items-center justify-center">
                  <Icon name="storefront" className="text-primary text-[52px]" />
                </div>
                <div className="pt-6 pb-space-md px-space-md flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-2xs">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">{merchantName}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-space-xs mt-space-xs pt-space-xs">
                    <div className="flex flex-col gap-space-2xs p-space-2xs rounded-lg bg-surface-canvas shadow-sm">
                      <span className="font-caption text-caption font-medium text-text-primary truncate">Catalogue</span>
                      <span className="font-caption text-caption text-primary font-bold">Setup</span>
                    </div>
                    <div className="flex flex-col gap-space-2xs p-space-2xs rounded-lg bg-surface-canvas shadow-sm">
                      <span className="font-caption text-caption font-medium text-text-primary truncate">Deals</span>
                      <span className="font-caption text-caption text-primary font-bold">Setup</span>
                    </div>
                    <div className="flex flex-col gap-space-2xs p-space-2xs rounded-lg bg-surface-canvas shadow-sm">
                      <span className="font-caption text-caption font-medium text-text-primary truncate">Storefront</span>
                      <span className="font-caption text-caption text-primary font-bold">Setup</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-start gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary-container shrink-0">
                  <Icon name="info" filled className="text-[28px]" />
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <h2 className="font-heading-md text-heading-md text-text-primary">
                    {sandbox ? 'Sandbox result' : 'What happens next'}
                  </h2>
                  <p className="font-body-md text-body-md text-text-secondary leading-normal">
                    {sandbox
                      ? 'These results came from sandbox checks. They are not live verification and must not be used as proof of a verified customer.'
                      : 'Your checks are recorded against your business account. Open the verification status centre to see the final outcome.'}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-surface-tint-blue to-surface-container-high p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-semibold text-primary uppercase tracking-wide">
                    Status Centre
                  </span>
                  <span className="font-caption text-caption font-bold px-space-xs py-space-2xs rounded bg-surface-canvas text-primary">
                    Anytime
                  </span>
                </div>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-heading-md text-heading-md text-text-primary font-semibold">
                    Track your outcome
                  </span>
                  <span className="font-body-md text-body-md text-text-secondary font-medium">
                    from your business dashboard
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <button
                className="group bg-surface-canvas hover:bg-surface-tint-blue rounded-xl p-space-md shadow-sm transition-all duration-200 flex flex-col justify-between gap-space-md text-left w-full"
                type="button"
                onClick={onPreviewStorefront}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-subtle group-hover:bg-surface-canvas text-primary flex items-center justify-center transition-colors">
                    <Icon name="smartphone" className="text-[22px]" />
                  </div>
                  <Icon
                    name="arrow_forward"
                    className="text-[18px] text-text-tertiary group-hover:text-primary transition-transform group-hover:translate-x-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading-sm text-heading-sm text-text-primary">Preview Storefront</span>
                  <span className="font-caption text-caption text-text-secondary mt-1">
                    See how your storefront and catalogue are coming together.
                  </span>
                </div>
              </button>
              <button
                className="group bg-surface-canvas hover:bg-surface-tint-blue rounded-xl p-space-md shadow-sm transition-all duration-200 flex flex-col justify-between gap-space-md text-left w-full"
                type="button"
                onClick={onActivate}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-subtle group-hover:bg-surface-canvas text-badge-discount-text flex items-center justify-center transition-colors">
                    <Icon name="dashboard" className="text-[22px]" />
                  </div>
                  <Icon
                    name="arrow_forward"
                    className="text-[18px] text-text-tertiary group-hover:text-primary transition-transform group-hover:translate-x-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading-sm text-heading-sm text-text-primary">Business Dashboard</span>
                  <span className="font-caption text-caption text-text-secondary mt-1">
                    Continue with catalogue, deals and storefront setup.
                  </span>
                </div>
              </button>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon name="lock" className="text-[22px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    Secure Record Storage
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Your verification records are stored securely against your account.
                  </span>
                </div>
              </div>
              <Icon name="verified_user" className="text-badge-discount-text text-[20px] shrink-0" />
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 z-40 bg-surface-canvas/95 backdrop-blur-md rounded-xl shadow-xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm text-text-secondary font-label-md text-label-md">
            <Icon name="task_alt" className="text-badge-discount-text text-[20px]" />
            <span>
              Setup status: <span className="text-text-primary font-semibold">Complete</span>
            </span>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-initial h-12 px-space-lg rounded-xl text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary font-medium transition-all duration-150 flex items-center justify-center gap-space-2xs text-center"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Review</span>
            </button>
            <button
              className="flex-1 sm:flex-initial h-12 px-space-lg rounded-xl bg-surface-subtle hover:bg-surface-container-high text-text-primary font-button-secondary text-button-secondary font-medium transition-all duration-150 flex items-center justify-center gap-space-2xs text-center"
              type="button"
              onClick={onPreviewStorefront}
            >
              <Icon name="visibility" className="text-[18px]" />
              <span>Preview Storefront</span>
            </button>
            <button
              className="flex-1 sm:flex-initial h-12 px-space-xl rounded-xl bg-primary-container hover:bg-surface-tint text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-95 flex items-center justify-center gap-space-xs text-center"
              type="button"
              onClick={onActivate}
            >
              <span>Continue to Activation / Business Dashboard</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
