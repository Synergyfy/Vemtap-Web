import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';
import { useVerificationIntro, type VerificationResumeStep } from '../../hooks/business/useVerification';

interface DesktopVerificationIntroScreenProps {
  onBack: () => void;
  /** Live: receives the step to resume at when verification is already under way. */
  onStart: (from?: VerificationResumeStep) => void;
  onLater: () => void;
  onBrand?: () => void;
}

const WHY_ITEMS = [
  {
    icon: 'shield_person',
    iconClass: 'bg-error-container/60 text-error',
    fill: false,
    title: 'Protect customers',
    tag: 'Anti-fraud',
    tagClass: 'bg-surface-container-high text-text-secondary',
    body: 'Helps prevent fake businesses and fraudulent deals across your local community. Each merchant is cryptographically anchored to a verified national identity profile.',
    footIcon: 'bolt',
    footText: 'Zero tolerance against counterfeit accounts',
  },
  {
    icon: 'verified',
    iconClass: 'bg-surface-tint-blue text-primary',
    fill: true,
    title: 'Build trust',
    tag: '3.8x Lift',
    tagClass: 'bg-badge-discount-bg text-badge-discount-text',
    body: 'Verified businesses earn the verified blue checkmark badge and achieve up to 3.8x greater shopper confidence. Customers choose merchants with transparent authentication.',
  },
  {
    icon: 'storefront',
    iconClass: 'bg-secondary-fixed/40 text-secondary',
    fill: false,
    title: 'Unlock business features',
    tag: 'Full Access',
    tagClass: 'bg-surface-tint-blue text-primary',
    body: 'Verification is required before participating in VEMTAP Hyperlocal Discovery, launching instant discount deals, and processing immediate automated merchant payouts.',
    checks: ['Deals Engine', 'Instant Tap Settlements', 'Map Radars'],
  },
];

const REQUIREMENTS = [
  { icon: 'badge', title: 'Valid Identity Document', desc: "National Identification Number (NIN), Driver's License, Voter's Card, or International Passport" },
  { icon: 'apartment', title: 'Business Registration (If Registered)', desc: 'CAC Registration Certificate or RC Number. Sole traders may verify as individuals.' },
  { icon: 'face', title: 'Fast Live Liveness Check', desc: 'A rapid 5-second camera selfie to confirm authorized identity operator' },
];

export function DesktopVerificationIntroScreen({
  onBack,
  onStart,
  onLater,
  onBrand,
}: DesktopVerificationIntroScreenProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [deferOpen, setDeferOpen] = useState(false);
  const timer = useRef<number | null>(null);
  // Live: where this business is in verification, and its own name/logo on the badge preview.
  const intro = useVerificationIntro();
  const live = intro.live;
  const whyItems = live
    ? WHY_ITEMS.map((item) =>
        item.title === 'Protect customers'
          ? { ...item, body: 'Helps prevent fake businesses and fraudulent deals across your local community. Each business is linked to a verified identity.' }
          : item.title === 'Build trust'
            ? { ...item, tag: 'Verified Badge', body: 'Verified businesses earn the verified checkmark badge, so customers can see they are dealing with a genuine business.' }
            : item,
      )
    : WHY_ITEMS;

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const openModal = () => {
    // Already under way: go straight back to where the owner left off.
    if (intro.started) return onStart(intro.resumeStep);
    setModalOpen(true);
    setLaunching(false);
  };

  const launchScanner = () => {
    if (launching) return;
    setLaunching(true);
    timer.current = window.setTimeout(() => {
      setModalOpen(false);
      setLaunching(false);
      onStart();
    }, 800);
  };

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-7xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-2xl">
        <div className="w-full flex items-center justify-between pb-space-md">
          <div className="flex items-center gap-space-xs text-caption font-caption text-text-tertiary">
            <button className="flex items-center gap-space-2xs hover:text-on-surface transition-colors" type="button" onClick={onBack}>
              <Icon name="arrow_back" className="text-[14px]" />
              <span>Merchant Central</span>
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-label-sm">Compliance Onboarding</span>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs">
              <div className="w-6 h-6 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                <Icon name="check" className="text-[16px]" />
              </div>
              <span className="font-label-sm text-label-sm text-text-primary">1. Setup</span>
              <span className="px-space-xs py-space-2xs bg-badge-discount-bg text-badge-discount-text rounded-full font-caption text-caption uppercase tracking-wider font-semibold">
                Done
              </span>
            </div>
            <div className="w-8 h-[2px] bg-primary" />
            <div className="flex items-center gap-space-xs">
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_2px_8px_rgba(6,108,244,0.35)]">
                <Icon name="verified_user" filled className="text-[15px]" />
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold">2. Verification</span>
              <span className="px-space-xs py-space-2xs bg-surface-tint-blue text-primary rounded-full font-caption text-caption uppercase tracking-wider font-semibold">
                Active
              </span>
            </div>
            <div className="w-8 h-[2px] bg-surface-container-high" />
            <div className="flex items-center gap-space-xs opacity-60">
              <div className="w-6 h-6 rounded-full bg-surface-container-highest text-text-tertiary flex items-center justify-center">
                <Icon name="lock_clock" className="text-[15px]" />
              </div>
              <span className="font-label-sm text-label-sm text-text-secondary">3. Activation</span>
              <span className="px-space-xs py-space-2xs bg-surface-container text-text-tertiary rounded-full font-caption text-caption uppercase tracking-wider">
                Pending
              </span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-canvas p-space-xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.04)]">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-surface-tint-blue/80 blur-3xl pointer-events-none" />
          <div className="absolute right-12 bottom-0 w-64 h-64 rounded-full bg-badge-discount-bg/40 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-xl">
            <div className="flex items-start gap-space-lg max-w-3xl">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-on-primary shadow-[0_12px_28px_-6px_rgba(6,108,244,0.4)]">
                  <Icon name="security" filled className="text-[42px]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-sm">
                  <Icon name="verified" filled className="text-badge-discount-text text-[18px]" />
                </div>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="inline-flex items-center gap-space-xs flex-wrap">
                  <span className="px-space-xs py-space-2xs bg-surface-tint-blue text-primary font-label-sm text-caption rounded-full uppercase tracking-wider font-semibold">
                    Tier-1 Regulatory Trust
                  </span>
                  <span className="text-text-tertiary">•</span>
                  <span className="font-caption text-caption text-text-secondary">Instant Electronic KYC (eKYC)</span>
                </div>
                <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                  Verify your business
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary leading-relaxed">
                  Help us keep VEMTAP safe for customers and genuine businesses across Nigeria. Verification protects
                  your store identity and instantly accelerates customer engagement.
                </p>
              </div>
            </div>
            {/* Sample benchmark — no live source behind it, so demo only. */}
            {!live && (
              <div className="shrink-0 bg-surface-subtle p-space-md rounded-xl flex items-center gap-space-md shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                  <Icon name="trending_up" className="text-[26px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading-md text-heading-md text-badge-discount-text tracking-tight">+380%</span>
                  <span className="font-caption text-caption text-text-secondary">Average buyer trust index</span>
                </div>
              </div>
            )}
          </div>
          {intro.note && (
            <div
              className={`mt-space-lg flex items-center gap-space-sm p-space-md rounded-lg ${
                intro.verified ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container-low text-on-surface'
              }`}
            >
              <Icon name={intro.verified ? 'verified' : 'pending_actions'} filled={intro.verified} className="text-[20px] shrink-0" />
              <p className="font-label-md text-label-md font-semibold">{intro.note}</p>
            </div>
          )}
          <div className="mt-space-lg pt-space-md flex items-center gap-space-sm text-text-secondary bg-surface-tint-blue/60 p-space-md rounded-lg">
            <Icon name="info" className="text-primary text-[20px] shrink-0" />
            <p className="font-body-md text-body-md text-on-surface">
              You'll verify your personal identity as account operator and provide business registration information
              where applicable (CAC registered or registered sole trader).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-caption text-caption uppercase tracking-wider text-primary font-semibold">
                  Marketplace Standards
                </span>
                <h2 className="font-heading-lg text-heading-lg text-text-primary">Why Verification Matters</h2>
              </div>
              <span className="px-space-sm py-space-2xs bg-surface-container text-text-secondary font-label-sm text-caption rounded-full">
                3 Key Advantages
              </span>
            </div>
            {whyItems.map((item) => (
              <div
                key={item.title}
                className="group relative bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(13,37,76,0.08)]"
              >
                <div className="flex items-start gap-space-md">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${item.iconClass}`}
                  >
                    <Icon name={item.icon} filled={item.fill} className="text-[24px]" />
                  </div>
                  <div className="flex flex-col gap-space-2xs flex-1 min-w-0">
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">{item.title}</h3>
                      <span
                        className={`px-space-xs py-space-2xs rounded font-caption text-caption font-medium ${item.tagClass}`}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary leading-normal">{item.body}</p>
                    {'footText' in item && item.footText && (
                      <div className="mt-space-2xs flex items-center gap-space-xs text-caption font-caption text-primary">
                        <Icon name={item.footIcon as string} className="text-[14px]" />
                        <span>{item.footText}</span>
                      </div>
                    )}
                    {item.checks && (
                      <div className="mt-space-2xs flex flex-wrap items-center gap-space-md text-caption font-caption text-text-tertiary">
                        {item.checks.map((check) => (
                          <span key={check} className="flex items-center gap-space-2xs text-text-secondary">
                            <Icon name="check" className="text-[15px] text-badge-discount-text" />
                            <span>{check}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {item.title === 'Build trust' && (
                      <div className="mt-space-xs bg-surface-subtle p-space-sm rounded-lg flex items-center justify-between flex-wrap gap-space-xs">
                        <div className="flex items-center gap-space-xs">
                          {intro.logoUrl ? (
                            <img src={intro.logoUrl} alt="" className="w-7 h-7 rounded-full object-cover bg-surface-canvas" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-caption">
                              {live ? intro.businessName.charAt(0).toUpperCase() : 'V'}
                            </div>
                          )}
                          <span className="font-label-sm text-label-sm text-text-primary">{intro.businessName}</span>
                          <Icon name="check_circle" filled className={`text-[16px] ${!live || intro.verified ? 'text-primary' : 'text-text-tertiary'}`} />
                        </div>
                        <span
                          className={`font-label-sm text-caption font-semibold px-space-xs py-space-2xs rounded ${
                            !live || intro.verified ? 'text-badge-discount-text bg-badge-discount-bg' : 'text-text-secondary bg-surface-container'
                          }`}
                        >
                          {!live ? 'Live Badging Active' : intro.verified ? 'Badge Active' : 'Shown once verified'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Sample testimonial — never shown to a real business as if it were genuine. */}
            {!live && (
              <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-surface-canvas flex items-center justify-center shrink-0 shadow-sm text-primary">
                  <Icon name="format_quote" className="text-[20px]" />
                </div>
                <p className="font-caption text-caption text-text-secondary italic">
                  “Completing verified onboarding took under two minutes. Our footfall jumped within 48 hours of
                  appearing on local radar feeds.” —{' '}
                  <span className="font-medium text-text-primary not-italic">Chioma E., Lekki Lifestyle Hub</span>
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl p-space-xl shadow-[0_8px_30px_rgba(13,37,76,0.06)] flex flex-col gap-space-lg">
              <div className="bg-surface-tint-blue p-space-md rounded-xl flex items-start gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name="verified" filled className="text-[18px]" />
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    NDPR &amp; NIMC Compliance Guarantee
                  </span>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    Verification builds safety for both you and your buyers. We keep your credentials strictly
                    confidential and bank-grade encrypted. Data is never shared with third-party advertisers.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    Required for verification
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-space-xs py-space-2xs rounded-full font-medium">
                    &lt; 2 minutes
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  {REQUIREMENTS.map((req) => (
                    <div
                      key={req.icon}
                      className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low transition-colors"
                    >
                      <Icon name={req.icon} className="text-primary text-[20px] shrink-0 mt-0.5" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-text-primary">{req.title}</span>
                        <span className="font-caption text-caption text-text-secondary">{req.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-space-sm px-space-md py-space-xs bg-surface-container rounded-lg text-text-secondary">
                <Icon name="timer" className="text-primary text-[18px]" />
                <span className="font-caption text-caption">
                  Estimated completion time: <strong>&lt; 2 minutes</strong> with instant digital verification.
                </span>
              </div>
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <button
                  className="w-full h-11 bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] hover:bg-primary-container active:scale-[0.99] transition-all cursor-pointer"
                  type="button"
                  onClick={openModal}
                  disabled={intro.loading}
                >
                  <span>{intro.loading ? 'Checking your status…' : intro.cta}</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </button>
                {!intro.verified && (
                  <button
                    className="w-full py-space-xs text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors cursor-pointer text-center"
                    type="button"
                    onClick={() => setDeferOpen(true)}
                  >
                    I'll do this later
                  </button>
                )}
                {!intro.verified && (
                  <p className="font-caption text-caption text-text-tertiary text-center px-space-xs leading-normal">
                    You can continue setting up your business profile and catalog, but deals and public discovery will
                    remain inactive until verification is completed.
                  </p>
                )}
              </div>
            </div>
            <div className="bg-surface-subtle p-space-md rounded-xl flex items-center justify-between text-caption font-caption text-text-secondary shadow-sm flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-2xs">
                <Icon name="lock" className="text-badge-discount-text text-[16px]" />
                <span>256-bit SSL Encrypted Vault</span>
              </div>
              <div className="flex items-center gap-space-2xs">
                <Icon name="verified" className="text-primary text-[16px]" />
                <span>NIMC Direct Verification Rails</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-margin"
          role="dialog"
          aria-modal="true"
          aria-label="Direct Identity Verification"
        >
          <div className="bg-surface-canvas rounded-2xl max-w-lg w-full p-space-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="verified_user" className="text-primary text-[24px]" />
                <span className="font-heading-sm text-heading-sm text-text-primary">Direct Identity Verification</span>
              </div>
              <button
                type="button"
                className="p-space-2xs text-text-secondary hover:text-text-primary rounded-lg"
                onClick={() => setModalOpen(false)}
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            <div className="flex flex-col gap-space-sm text-body-md font-body-md text-text-secondary">
              <p>Connecting to secure identity gateway...</p>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full w-2/3 animate-pulse" />
              </div>
              <span className="text-caption font-caption text-text-tertiary">
                Launching secured camera &amp; NIMC verification interface.
              </span>
            </div>
            <div className="flex justify-end gap-space-sm pt-space-md">
              <button
                type="button"
                className="px-space-md py-space-xs font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-space-lg py-space-xs bg-primary text-on-primary rounded-xl font-button-primary text-button-primary shadow-sm hover:bg-primary-container disabled:opacity-70"
                onClick={launchScanner}
                disabled={launching}
              >
                {launching ? 'Connecting...' : 'Launch Scanner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deferOpen && (
        <div
          className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-margin"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-canvas rounded-2xl max-w-md w-full p-space-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col gap-space-md">
            <span className="font-heading-sm text-heading-sm text-text-primary">Skip verification for now?</span>
            <p className="font-body-md text-body-md text-text-secondary">
              Your business profile can be edited, but customer discovery and promotions will remain paused until
              verification is completed.
            </p>
            <div className="flex justify-end gap-space-sm pt-space-xs">
              <button
                type="button"
                className="px-space-md py-space-xs font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary"
                onClick={() => setDeferOpen(false)}
              >
                Stay
              </button>
              <button
                type="button"
                className="px-space-lg py-space-xs bg-primary text-on-primary rounded-xl font-button-primary text-button-primary shadow-sm hover:bg-primary-container"
                onClick={() => {
                  setDeferOpen(false);
                  onLater();
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessVerificationChrome>
  );
}
