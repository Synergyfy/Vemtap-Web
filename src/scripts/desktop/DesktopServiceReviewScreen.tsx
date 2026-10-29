import { useEffect, useRef, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ServiceDraft } from './desktopServiceDraft';
import { validateAllServiceSteps, hasServiceValidationErrors } from '../serviceStudioShared';
import { draftImage } from './draftImage';

interface DesktopServiceReviewScreenProps {
  draft: ServiceDraft;
  onBack: () => void;
  onEditBasics: () => void;
  onEditPricing: () => void;
  onEditBranches: () => void;
  onEditDescription: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const REVIEW_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDwZIDrEuxeYnWmyDFJEcH7N3pa-keuU0o6N4RPkxwuXhSIKYh8sL6dcBRrDjyK_7KEdyr2qvvjPItO1pLuZNmQkga_pdRw2RSqiFOmFVUXc-TzaW_bxMJ2wMkr5ozE3qIz2UGSGZkItsFsb1goKC8wTLl9h_26yklhBeQS3q68pnyeZD0lfM05mkbD8QQRzqmqOvph59IE78EW4WW5Sxpckjio9jDKdJDMxAaBkeQ0UcQ31fW8-Nl6SA';

const REVIEW_ALT =
  'A luxurious, tranquil spa setting showing high-end aesthetic facial equipment, clean minimalist ceramic treatment bowls, organic botanical glass vials, and warm ambient sunlight highlighting gentle mist and fresh white towels in an Abuja upscale aesthetic clinic.';

const SIMULATOR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCqEDnE2nHn_36Hs3EqV3-XV69CRlqJ6_iaXc6z--4WpFxQeTb8GtXcfUQM7x5g1eRbDochCw1nOFAz8CG9JCu4kBXKeCg_Nl6vOIudSXSHI2JxJrKb4cK3BMCDl6AiZ-jf_5NoMwpGjA12ZwmzWs1Km4iEWmqb7Y3bWuDYDbaRNKN0ZfbbAV5AGfAYx_61vGE9FcUQYNixENudCNCEP0CF5rBpCsQxZRUwLsxuXRceDduiaOtgJOD71g';

const SIMULATOR_ALT =
  'A tranquil serene facial esthetics studio treatment in an upscale African day spa with soft natural lighting and fresh botanical details.';

const REVIEW_TIERS: Array<{
  badge: string;
  badgeClass: string;
  cardClass: string;
  name: string;
  body: string;
  footer: string;
  footerClass: string;
}> = [
  {
    badge: 'Tier 1 • Base',
    badgeClass: 'bg-surface-container-high text-on-surface-variant',
    cardClass: 'bg-surface-subtle hover:bg-surface-tint-blue/30',
    name: 'Essential Glow',
    body: 'Pure botanical cleansing, double exfoliation steam, and hyaluronic hydra-infusion.',
    footer: 'Standard',
    footerClass: 'text-text-secondary font-medium',
  },
  {
    badge: 'Tier 2 • Popular',
    badgeClass: 'bg-primary text-on-primary',
    cardClass: 'bg-surface-tint-blue/60 hover:bg-surface-tint-blue',
    name: 'Deluxe Radiance + LED',
    body: 'Essential facial extended with collagen booster ampoule and medical-grade red LED therapy.',
    footer: '+LED Booster',
    footerClass: 'text-badge-discount-text font-semibold',
  },
  {
    badge: 'Tier 3 • VIP',
    badgeClass: 'bg-surface-container-high text-on-surface-variant',
    cardClass: 'bg-surface-subtle hover:bg-surface-tint-blue/30',
    name: 'VIP Serenity + Scalp',
    body: 'Deluxe facial protocol paired with aromatic cranial scalp massage & cryo-sculpt globes.',
    footer: 'Full Holistic',
    footerClass: 'text-text-secondary font-medium',
  },
];

const POLICY_ROWS: Array<{ icon: string; iconClass: string; title: string; body: string }> = [
  {
    icon: 'point_of_sale',
    iconClass: 'text-primary',
    title: 'Pay at Reception Enabled',
    body: '₦0 upfront payment required on VEMTAP Instant Booking.',
  },
  {
    icon: 'event_available',
    iconClass: 'text-badge-discount-text',
    title: 'Flexible Cancellation',
    body: 'Clients cancel free up to 2 hours before scheduled slot.',
  },
  {
    icon: 'sanitizer',
    iconClass: 'text-secondary',
    title: '15-Minute Turnaround Buffer',
    body: 'Automatic sanitization slot reserved after each client.',
  },
];

const NARRATIVE_CHIPS: Array<{ icon: string; label: string; className: string }> = [
  { icon: 'spa', label: 'Sensitive Skin Safe', className: 'bg-surface-tint-blue text-primary font-semibold' },
  { icon: 'eco', label: '100% Organic Botanicals', className: 'bg-surface-tint-blue text-primary font-semibold' },
  { icon: 'wb_sunny', label: 'LED Phototherapy', className: 'bg-surface-tint-blue text-primary font-semibold' },
  { icon: 'group', label: 'Unisex (All Welcome)', className: 'bg-surface-tint-blue text-primary font-semibold' },
  { icon: 'brush', label: 'Pre-Makeup Friendly', className: 'bg-surface-subtle text-text-secondary font-medium' },
];

const toNumber = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function DesktopServiceReviewScreen({
  draft,
  onBack,
  onEditBasics,
  onEditPricing,
  onEditBranches,
  onEditDescription,
  onPublish,
  onSaveDraft,
  onNav,
}: DesktopServiceReviewScreenProps) {
  // Live: the real branches chosen in the previous step (`locations`).
  const live = hasApiConfig();
  const { branches: liveBranches } = useBusinessBranch();
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'success'>('idle');
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const base = toNumber(draft.basePrice);
  const compare = toNumber(draft.comparePrice);
  const saving = compare - base;
  const savingPercent = compare > 0 ? Math.round((saving / compare) * 100) : 0;

  const validationErrors = validateAllServiceSteps(draft);
  const hasErrors = hasServiceValidationErrors(validationErrors);
  const errorCount =
    validationErrors.identity.length +
    validationErrors.locations.length +
    validationErrors.description.length +
    validationErrors.pricing.length +
    validationErrors.policies.length;

  const handlePublish = () => {
    if (publishState !== 'idle' || hasErrors) return;
    setPublishState('publishing');
    timers.current.push(window.setTimeout(() => setPublishState('success'), 900));
    timers.current.push(window.setTimeout(() => onPublish(), 1900));
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="max-w-7xl mx-auto w-full px-margin py-space-xl flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-caption text-caption text-text-tertiary">
                <span className="hover:text-primary cursor-pointer transition-colors">Catalog Workflow</span>
                <span>/</span>
                <span className="text-primary font-medium">Final Review</span>
                <span>/</span>
                <span className="text-text-secondary">Service ID #VMT-9842</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">
                  Step 4 of 4: Final Service Audit &amp; Verification
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 shadow-sm">
                  <Icon name="verified" className="text-[14px]" /> Ready for Live Booking
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2.5 rounded-xl shadow-sm">
              <div className="flex flex-col items-end">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">100% Completed</span>
                <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" /> Fast-Track Live Enabled
                </span>
              </div>
              <div className="w-32 h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full w-full transition-all duration-500" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="h-1.5 rounded-full bg-primary-container" />
            <div className="h-1.5 rounded-full bg-primary-container" />
            <div className="h-1.5 rounded-full bg-primary-container" />
            <div className="h-1.5 rounded-full bg-primary-container relative">
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary-container rounded-full ring-4 ring-surface flex items-center justify-center text-on-primary">
                <Icon name="check" className="text-[10px]" />
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-canvas rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="relative w-full h-72 sm:h-80 bg-surface-container">
                <img alt={REVIEW_ALT} className="w-full h-full object-cover" src={draftImage(draft.image, REVIEW_IMAGE)} />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent" />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
                  <span className="px-3 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm">
                    <Icon name="photo_library" className="text-[16px] text-primary" /> 3 High-Res Media
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-tint-blue/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm">
                    <Icon name="home_repair_service" className="text-[16px]" /> In-Studio &amp; Mobile Concierge
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    onClick={onEditBasics}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md hover:bg-surface-canvas text-on-surface font-label-sm text-label-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Icon name="edit" className="text-[16px] text-text-secondary" /> Edit Basics
                  </button>
                </div>
                <div className="absolute bottom-5 left-6 right-6 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    <span className="font-caption text-caption uppercase tracking-wider text-inverse-on-surface font-semibold">
                      {draft.provider}
                    </span>
                    <span className="text-inverse-on-surface/60">•</span>
                    <span className="font-caption text-caption text-inverse-on-surface/80">Abuja Flagship</span>
                  </div>
                  <h2 className="font-heading-lg text-heading-lg font-bold text-on-primary text-shadow-sm leading-snug">
                    {draft.title}
                  </h2>
                  <p className="font-label-sm text-label-sm text-inverse-on-surface/80 flex items-center gap-1.5">
                    <Icon name="category" className="text-[16px]" />
                    {draft.primaryCategory} &gt; {draft.subCategory}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-surface-subtle flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="payments" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-secondary font-medium">
                      Starting Session Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading-md text-heading-md font-bold text-on-surface">₦{draft.basePrice}</span>
                      <span className="font-label-sm text-label-sm text-text-tertiary line-through">
                        ₦{draft.comparePrice}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        Save ₦{saving.toLocaleString('en-US')} ({savingPercent}% off)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-secondary font-medium">Standard Slot</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      {draft.durationMins} Minutes
                    </span>
                  </div>
                  <div className="h-8 w-px bg-surface-container-highest" />
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-secondary font-medium">
                      Therapist Selection
                    </span>
                    <span className="font-label-md text-label-md font-bold text-badge-discount-text flex items-center gap-1">
                      <Icon name="check_circle" className="text-[16px]" /> Enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <Icon name="layers" className="text-[20px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                      Pricing &amp; Session Tiers Audit
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">
                      {draft.tiers.length} active operational tiers configured for immediate customer checkout
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onEditPricing}
                  className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold transition-all flex items-center gap-1.5"
                >
                  <Icon name="tune" className="text-[16px] text-text-secondary" /> Edit Tiers
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {REVIEW_TIERS.map((tier, index) => {
                  const tierData = draft.tiers[index];
                  return (
                    <div
                      key={tier.badge}
                      className={`p-4 rounded-xl flex flex-col justify-between gap-3 relative transition-colors ${tier.cardClass}`}
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-md font-caption text-caption font-bold uppercase tracking-wider ${tier.badgeClass}`}
                          >
                            {tier.badge}
                          </span>
                          <span className="font-caption text-caption text-text-secondary font-medium">
                            {tierData ? tierData.duration : ''}
                          </span>
                        </div>
                        <h4 className="font-label-md text-label-md font-bold text-on-surface mt-1">{tier.name}</h4>
                        <p className="font-caption text-caption text-text-secondary line-clamp-2">{tier.body}</p>
                      </div>
                      <div className="pt-2 flex items-baseline justify-between">
                        <span className="font-heading-sm text-heading-sm font-bold text-primary">
                          ₦{tierData ? tierData.price : draft.basePrice}
                        </span>
                        <span className={`font-caption text-caption ${tier.footerClass}`}>{tier.footer}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Icon name="badge" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Allocated Staff Specialists
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Amara K. (Lead Esthetician) &amp; Zainab T. (Senior Skincare Specialist)
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-canvas text-primary font-caption text-caption font-semibold shadow-sm">
                  Client Choice Allowed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icon name="location_on" className="text-primary text-[20px]" />
                      <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">Branch Studios</h3>
                    </div>
                    <button
                      type="button"
                      onClick={onEditBranches}
                      className="text-primary font-caption text-caption font-semibold hover:underline"
                    >
                      Edit Studios
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {live &&
                      liveBranches
                        .filter((branch) => branch.id && draft.locations.includes(branch.id))
                        .map((branch) => (
                          <div key={branch.id} className="p-3.5 rounded-xl bg-surface-subtle flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <Icon name="domain" className="text-text-secondary text-[18px] mt-0.5" />
                              <div className="flex flex-col">
                                <span className="font-label-md text-label-md font-bold text-on-surface">{branch.name}</span>
                                <span className="font-caption text-caption text-text-secondary">{branch.area || '—'}</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold whitespace-nowrap">
                              —
                            </span>
                          </div>
                        ))}
                    {!live && draft.branches.maitama && (
                      <div className="p-3.5 rounded-xl bg-surface-subtle flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <Icon name="domain" className="text-text-secondary text-[18px] mt-0.5" />
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md font-bold text-on-surface">
                              Maitama Heights Studio
                            </span>
                            <span className="font-caption text-caption text-text-secondary">
                              Plot 418 Aguiyi Ironsi Way, Maitama, Abuja
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold whitespace-nowrap">
                          3 Suites
                        </span>
                      </div>
                    )}
                    {!live && draft.branches.wuseII && (
                      <div className="p-3.5 rounded-xl bg-surface-subtle flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <Icon name="domain" className="text-text-secondary text-[18px] mt-0.5" />
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md font-bold text-on-surface">
                              Wuse II Sanctuary
                            </span>
                            <span className="font-caption text-caption text-text-secondary">
                              Aminu Kano Crescent, Wuse II, Abuja
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold whitespace-nowrap">
                          2 Suites
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 text-text-secondary font-caption text-caption">
                  <Icon name="schedule" className="text-[16px] text-primary" />
                  <span>
                    Requires minimum <strong className="text-on-surface">2 hours advance booking notice</strong>
                  </span>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icon name="shield" className="text-badge-discount-text text-[20px]" />
                      <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                        Booking &amp; Safety Policies
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={onEditBranches}
                      className="text-primary font-caption text-caption font-semibold hover:underline"
                    >
                      Edit Policies
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {(draft.policies && draft.policies.length > 0
                      ? draft.policies
                      : POLICY_ROWS.map((r, idx) => ({ id: `row-${idx}`, title: r.title, body: r.body }))
                    ).map((policy) => (
                      <div key={policy.id || policy.title} className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-subtle">
                        <Icon name="verified_user" className="text-primary text-[18px] mt-0.5" />
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm font-semibold text-on-surface">{policy.title}</span>
                          <span className="font-caption text-caption text-text-secondary">{policy.body}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 text-badge-discount-text font-caption text-caption font-medium">
                  <Icon name="check_circle" className="text-[16px]" />
                  <span>All 3 compliance checks passed</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon name="description" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                    Treatment Clinical Overview &amp; Attributes
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onEditDescription}
                  className="text-primary font-caption text-caption font-semibold hover:underline"
                >
                  Edit Narrative
                </button>
              </div>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                Our multi-action Deep Hydration Radiance Facial utilizes micro-fine ultrasound cavitation to gently
                dislodge micro-comedones, followed immediately by multi-weight hyaluronic acid serum delivery. A
                lymphatic facial massage stimulates dermal micro-circulation, sealing active ingredients under
                clinical-grade phototherapy light to restore natural dermal radiance in dusty or dry weather conditions.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {NARRATIVE_CHIPS.map((chip) => (
                  <span
                    key={chip.label}
                    className={`px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 ${chip.className}`}
                  >
                    <Icon name={chip.icon} className="text-[16px]" />
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-20">
            <div className="bg-surface-canvas rounded-2xl p-6 shadow-md flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Icon name="preview" className="text-primary text-[20px]" />
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    Client Discovery Simulator
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Abuja Live View
                </span>
              </div>
              <div className="w-full bg-surface-subtle rounded-2xl p-4 shadow-inner flex flex-col gap-3">
                <div className="flex items-center justify-between px-1 text-text-tertiary">
                  <span className="font-caption text-caption font-semibold text-text-secondary">9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <Icon name="signal_cellular_alt" className="text-[14px]" />
                    <Icon name="wifi" className="text-[14px]" />
                    <Icon name="battery_full" className="text-[14px]" />
                  </div>
                </div>
                <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="relative h-32 w-full bg-surface-container">
                    <img alt={SIMULATOR_ALT} className="w-full h-full object-cover" src={draftImage(draft.image, SIMULATOR_IMAGE)} />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-xs">
                      -20% TODAY
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-inverse-surface/80 text-inverse-on-surface font-caption text-caption backdrop-blur-sm">
                      Maitama • 0.8 km
                    </div>
                  </div>
                  <div className="p-3.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption font-bold text-primary uppercase tracking-wide">
                        {draft.provider || 'Glow & Serenity Spa'}
                      </span>
                      <div className="flex items-center gap-0.5 text-tertiary">
                        <Icon name="star" className="text-[14px]" filled />
                        <span className="font-caption text-caption font-bold text-on-surface">4.9</span>
                        <span className="font-caption text-caption text-text-tertiary">(184)</span>
                      </div>
                    </div>
                    <div className="font-label-md text-label-md font-bold text-on-surface line-clamp-1">
                      {draft.title || 'Deep Hydration Radiance Facial'}
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
                      <Icon name="timer" className="text-[14px]" /> {draft.durationMins || 60} mins <span>•</span>
                      <span>Free cancellation</span>
                    </div>
                    <div className="mt-1 pt-2 bg-surface-subtle rounded-lg p-2 flex flex-col gap-1.5">
                      <span className="font-caption text-caption text-text-secondary font-medium">
                        Select Specialist:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          className="py-1 px-2 rounded-md bg-surface-tint-blue text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 shadow-xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Amara K.
                        </button>
                        <button
                          type="button"
                          className="py-1 px-2 rounded-md bg-surface-canvas text-text-secondary font-caption text-caption font-medium hover:text-on-surface"
                        >
                          Zainab T.
                        </button>
                      </div>
                    </div>
                    <div className="bg-surface-subtle rounded-lg p-2 flex flex-col gap-1">
                      <span className="font-caption text-caption text-text-secondary font-medium">
                        Selected Slot (Today):
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">Today, 1:15 PM</span>
                        <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                          Confirmed Available
                        </span>
                      </div>
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-text-tertiary line-through">
                          ₦{draft.comparePrice}
                        </span>
                        <span className="font-heading-sm text-heading-sm font-bold text-on-surface leading-none">
                          ₦{draft.basePrice}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-xs hover:bg-primary-container transition-colors"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-center font-caption text-caption text-text-tertiary">
                  Live render as experienced on mobile app &amp; web store
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {hasErrors ? (
                <div className="p-4 rounded-xl border border-error/30 bg-error/5 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-error font-label-sm text-label-sm font-bold">
                    <Icon name="error" className="text-[18px]" />
                    <span>{errorCount} Required {errorCount === 1 ? 'Item' : 'Items'} Missing Before Launch</span>
                  </div>
                  <ul className="text-caption font-caption text-text-secondary space-y-1 pl-5 list-disc">
                    {validationErrors.identity.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditBasics} className="text-primary underline font-medium">
                          Fix in Basics
                        </button>
                      </li>
                    ))}
                    {validationErrors.locations.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditBranches} className="text-primary underline font-medium">
                          Select Locations
                        </button>
                      </li>
                    ))}
                    {validationErrors.description.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditDescription} className="text-primary underline font-medium">
                          Fix in Description
                        </button>
                      </li>
                    ))}
                    {validationErrors.pricing.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditPricing} className="text-primary underline font-medium">
                          Fix in Pricing
                        </button>
                      </li>
                    ))}
                    {validationErrors.policies.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditBranches} className="text-primary underline font-medium">
                          Add Policy
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center gap-2 font-caption text-caption font-semibold">
                  <Icon name="check_circle" className="text-[16px]" />
                  <span>All validation checks passed • Ready for instant storefront deployment</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePublish}
                disabled={publishState !== 'idle' || hasErrors}
                className={`w-full py-4 px-6 rounded-2xl active:scale-[0.99] text-on-primary font-button-primary text-button-primary shadow-lg transition-all flex items-center justify-center gap-2 group ${
                  publishState === 'success'
                    ? 'bg-badge-discount-text cursor-default'
                    : publishState === 'publishing'
                      ? 'bg-primary opacity-75 cursor-not-allowed'
                      : hasErrors
                        ? 'bg-surface-container-highest text-text-tertiary cursor-not-allowed opacity-60'
                        : 'bg-primary hover:bg-primary-container cursor-pointer'
                }`}
              >
                {publishState === 'idle' && (
                  <>
                    <span>Publish Service to Storefront</span>
                    <Icon name="rocket_launch" className="text-[20px] transition-transform group-hover:translate-x-1" />
                  </>
                )}
                {publishState === 'publishing' && (
                  <>
                    <Icon name="refresh" className="text-[20px] animate-spin" />
                    <span>Broadcasting to Storefronts...</span>
                  </>
                )}
                {publishState === 'success' && (
                  <>
                    <Icon name="check_circle" className="text-[20px]" />
                    <span>Service is Now Live!</span>
                  </>
                )}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="bookmark" className="text-[18px]" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="py-3 px-4 rounded-xl bg-surface-subtle hover:bg-surface-container-high text-on-surface font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="arrow_back" className="text-[18px]" /> Edit Steps
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-surface-tint-blue via-surface-subtle to-surface-canvas flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Icon name="bolt" className="text-primary text-[20px]" />
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  Next Growth Step: Deal Engine
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Once published, you can instantly plug this service into the{' '}
                <strong className="text-on-surface">Hyper-Local Deal Engine</strong> to broadcast flash-discounts during
                slower weekday afternoon slots across Abuja.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-caption text-caption text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                  Explore Deal Setup Guidelines →
                </span>
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-canvas shadow-sm flex items-center justify-between text-text-secondary">
              <div className="flex items-center gap-2 font-caption text-caption">
                <Icon name="lock" className="text-badge-discount-text text-[18px]" />
                <span>PCI-DSS &amp; NDPR Encrypted Deployment</span>
              </div>
              <span className="font-caption text-caption font-semibold text-primary cursor-pointer hover:underline">
                Compliance Desk
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
          publishState === 'success' ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-inverse-surface text-inverse-on-surface px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-badge-discount-text flex items-center justify-center text-on-primary">
            <Icon name="done_all" className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-bold">Service Successfully Published!</span>
            <span className="font-caption text-caption text-inverse-on-surface/80">
              Active across Maitama &amp; Wuse II storefronts now.
            </span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Edit Steps</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-md text-label-md transition-colors"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishState !== 'idle' || hasErrors}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-80"
            >
              {publishState === 'idle' && (
                <>
                  <span>Publish Service to Storefront</span>
                  <Icon name="rocket_launch" className="text-[20px]" />
                </>
              )}
              {publishState === 'publishing' && (
                <>
                  <Icon name="refresh" className="text-[20px] animate-spin" />
                  <span>Broadcasting to Storefronts...</span>
                </>
              )}
              {publishState === 'success' && (
                <>
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Service is Now Live!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
