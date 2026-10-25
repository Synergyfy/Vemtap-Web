import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import {
  ID_TYPE_CONFIG,
  INITIAL_VERIFICATION_DRAFT,
} from './verificationDraft';
import { useVerificationSummary } from '../hooks/business/useVerification';

interface VerificationStatusCenterScreenProps {
  onBack: () => void;
  onUpdateInfo: () => void;
}

const BUSINESS_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDJrd5hM47CGoRMa-U22chjZbV7YcR3uH_BbNcba1dcLRWwWEE-5jMtNp8eFVqsdqYcgJkbVqno04Oe9PcrlkCVd_ScXqOX2U5w40qAQvA7_CbYYkeQ9dEenFs9BSqTXlFXrwdbxdELvCfOLB_ui8LvPbPhplOsW1lQG_gQ4QuFiEnV1_KK2IWzytyLuTavKjEZDTI52nxf35QwfmG542bfybV9P49UH9hMIhBDf9-jkQdjtsMYmqK1jw';
const BUSINESS_ALT =
  'Vibrant modern restaurant interior of Urban Grill and Bistro with warm ambient lighting, timber finishes, polished counters and dining setup in Abuja Nigeria.';

type CertificateModal = 'id' | 'cac' | null;

export function VerificationStatusCenterScreen({ onBack, onUpdateInfo }: VerificationStatusCenterScreenProps) {
  const [modal, setModal] = useState<CertificateModal>(null);
  const [letterSent, setLetterSent] = useState(false);

  const draft = INITIAL_VERIFICATION_DRAFT;
  const idConfig = ID_TYPE_CONFIG[draft.idType];
  const idRef = `•••• ${idConfig.normalize(draft.idNumber).slice(-4).padStart(4, '0')}`;
  // Live: the real status from `GET /verification/status`; demo keeps the sample copy.
  const summary = useVerificationSummary();
  const live = summary.live;
  const pill = (ok: boolean) =>
    ok || !live ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary';

  return (
    <div className="biz-flow">
      <AppScreen>
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-14 px-margin flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <button
                aria-label="Go back"
                className="w-11 h-11 -ml-space-2xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high/60 active:scale-95 transition-all"
                type="button"
                onClick={onBack}
              >
                <Icon name="arrow_back" className="text-[22px]" />
              </button>
              <h1 className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate max-w-[220px]">
                Business Verification Status Center
              </h1>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                aria-label="Help & Support"
                className="w-11 h-11 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-high/60 transition-colors"
                type="button"
              >
                <Icon name="help_outline" className="text-[20px]" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
                <Icon name="person" className="text-on-primary text-[18px]" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col w-full flex-1 pb-10">
          {/* Overview Trust Card */}
          <div className="px-margin pt-space-md">
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm p-space-md">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary-container/10 blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-surface-container">
                    <img alt={BUSINESS_ALT} className="w-full h-full object-cover" src={BUSINESS_IMG} />
                    <div className="absolute inset-0 bg-primary/5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading-sm text-heading-sm text-text-primary truncate">
                        {live ? summary.businessName : 'Urban Grill & Bistro'}
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-0.5 flex items-center gap-1">
                      <Icon name="history" className="text-[14px] text-text-tertiary" />
                      {live
                        ? summary.lastVerified
                          ? `Last verified on ${summary.lastVerified}`
                          : 'Not verified yet'
                        : 'Last verified on Oct 18, 2024'}
                    </p>
                  </div>
                </div>
              </div>
              {/* Trust Badge & Score Display */}
              <div className="rounded-lg bg-surface-tint-blue p-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="verified" filled className="text-primary text-[20px]" />
                  <div>
                    <div className="font-label-sm text-label-sm text-primary font-semibold tracking-tight">
                      {live ? summary.statusLabel : 'Verified Business'}
                    </div>
                    <div className="font-caption text-caption text-text-secondary">
                      {live ? `${summary.checksVerified} of 2 checks verified` : 'Tier 3 Merchant Tier'}
                    </div>
                  </div>
                </div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full ${pill(summary.verified)} font-label-sm text-label-sm font-semibold`}>
                  {live ? (summary.verified ? 'Compliant' : 'In progress') : '100% Compliant'}
                </div>
              </div>
              {/* Micro Trust Pillars */}
              <div className="grid grid-cols-3 gap-space-2xs mt-space-md pt-space-xs">
                <div className="flex flex-col items-center text-center p-space-2xs">
                  <Icon name="local_police" className="text-[18px] text-primary mb-1" />
                  <span className="font-caption text-caption font-semibold text-text-primary">Legal Entity</span>
                  <span className="font-caption text-caption text-text-tertiary scale-90">Validated</span>
                </div>
                <div className="flex flex-col items-center text-center p-space-2xs">
                  <Icon name="storefront" className="text-[18px] text-badge-discount-text mb-1" />
                  <span className="font-caption text-caption font-semibold text-text-primary">2 Hubs</span>
                  <span className="font-caption text-caption text-text-tertiary scale-90">Inspected</span>
                </div>
                <div className="flex flex-col items-center text-center p-space-2xs">
                  <Icon name="security" className="text-[18px] text-primary mb-1" />
                  <span className="font-caption text-caption font-semibold text-text-primary">Protection</span>
                  <span className="font-caption text-caption text-text-tertiary scale-90">NDPR Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials Checklist Header */}
          <div className="px-margin mb-space-xs flex items-center justify-between mt-space-md">
            <h2 className="font-heading-sm text-heading-sm text-text-primary">Credentials & Standing</h2>
            <span className="font-label-sm text-label-sm text-text-secondary">{live ? `${summary.checksVerified} of 2 checks verified` : '4 of 4 active'}</span>
          </div>

          {/* Itemized Credentials & Status List */}
          <div className="px-margin flex flex-col gap-space-xs">
            {/* Item 1: Identity Verification */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all active:scale-[0.99]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name="badge" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-label-md text-label-md text-text-primary font-semibold">
                      Identity Verification
                    </h3>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      {live
                        ? summary.identity.ref
                          ? `${summary.identity.name ?? 'Account holder'} • ${summary.identity.idType} (${summary.identity.ref})`
                          : 'Not submitted yet'
                        : `${draft.legalName} • NIN (Ending in ${idRef})`}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${pill(summary.identity.ok)} font-label-sm text-label-sm font-semibold flex-shrink-0`}>
                  <Icon name={summary.identity.ok || !live ? 'check' : 'schedule'} className="text-[14px]" />
                  {live ? summary.identity.label : 'Verified'}
                </span>
              </div>
              <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                <span className="font-caption text-caption text-text-tertiary">
                  {live ? (summary.identity.note ?? summary.identity.date ?? 'Gov-issued ID • Selfie check') : 'Gov-issued ID • Biometric check passed'}
                </span>
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold inline-flex items-center gap-0.5 hover:underline"
                  type="button"
                  onClick={() => setModal('id')}
                >
                  View Details
                  <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
            </div>

            {/* Item 2: Business Registration (CAC) */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all active:scale-[0.99]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name="account_balance" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-label-md text-label-md text-text-primary font-semibold">
                      Business Registration (CAC)
                    </h3>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Corporate Affairs Commission • {live ? (summary.registration.ref ?? 'Not submitted yet') : draft.cacNumber}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${pill(summary.registration.ok)} font-label-sm text-label-sm font-semibold flex-shrink-0`}>
                  <Icon name={summary.registration.ok || !live ? 'check' : 'schedule'} className="text-[14px]" />
                  {live ? summary.registration.label : 'Verified'}
                </span>
              </div>
              <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                <span className="font-caption text-caption text-text-tertiary">
                  {live ? (summary.registration.note ?? (summary.registration.date ? `Checked ${summary.registration.date}` : 'CAC register check')) : 'Registration Date: 14 May 2021'}
                </span>
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold inline-flex items-center gap-0.5 hover:underline"
                  type="button"
                  onClick={() => setModal('cac')}
                >
                  View Certificate
                  <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
            </div>

            {/* Item 3: Physical Business Locations */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all active:scale-[0.99]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name="pin_drop" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-label-md text-label-md text-text-primary font-semibold">
                      Physical Business Locations
                    </h3>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      2 Active Branches (Apo & Wuse II)
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold flex-shrink-0">
                  <Icon name="check" className="text-[14px]" />
                  Verified
                </span>
              </div>
              <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                <span className="font-caption text-caption text-text-tertiary">Geofenced GPS beacon live</span>
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold inline-flex items-center gap-0.5 hover:underline"
                  type="button"
                >
                  Manage Locations
                  <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
            </div>

            {/* Item 4: Storefront Standing */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-9 h-9 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0">
                    <Icon name="bolt" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-label-md text-label-md text-text-primary font-semibold">
                        Storefront Standing
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-badge-discount-bg font-label-sm text-label-sm font-semibold text-badge-discount-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                        In Good Standing
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-1 leading-snug">
                      Full access to hyper-local discovery, instant deals, and customer passes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delighting Live Audit Status Pulse */}
          <div className="px-margin mt-space-lg">
            <div className="rounded-xl bg-surface-container-low p-space-md flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                <Icon name="shield_with_heart" className="text-[22px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-label-sm text-label-sm font-semibold text-text-primary">
                  Instant Consumer Trust Boost
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  Verified merchants receive 3.4x more foot traffic from local search suggestions.
                </p>
              </div>
            </div>
          </div>

          {/* Warning / Compliance Notice */}
          <div className="px-margin mt-space-md">
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-tertiary-container flex-shrink-0 mt-0.5">
                <Icon name="info" className="text-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-label-sm text-label-sm font-semibold text-text-primary">
                  Need to update something?
                </h4>
                <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                  Changes to your business name, legal structure, or operating address may require verifying your
                  credentials again to maintain the{' '}
                  <span className="font-medium text-text-primary">Verified Business</span> badge.
                </p>
              </div>
            </div>
          </div>

          {/* Action Deck */}
          <div className="px-margin flex flex-col gap-space-sm mt-space-md">
            <button
              className="w-full rounded-xl bg-surface-container-high text-text-primary font-button-secondary text-button-secondary hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs font-semibold shadow-sm h-11"
              type="button"
              onClick={onUpdateInfo}
            >
              <Icon name="edit_document" className="text-[20px] text-text-secondary" />
              Update Verification Information
            </button>
            {/* Additional Support Link */}
            <div className="text-center pt-space-2xs">
              <button
                className={`inline-flex items-center gap-1 font-label-md text-label-sm font-semibold hover:underline ${
                  letterSent ? 'text-badge-discount-text' : 'text-primary'
                }`}
                type="button"
                disabled={letterSent}
                onClick={() => setLetterSent(true)}
              >
                <span>
                  {letterSent
                    ? 'Verification Letter Sent to admin@urbangrillbistro.ng'
                    : 'Request Official Verification Letter / Audit Proof'}
                </span>
                <Icon name={letterSent ? 'check_circle' : 'arrow_forward'} className="text-[16px]" filled={letterSent} />
              </button>
            </div>
            {/* Regulatory Data Privacy Footer */}
            <div className="flex items-center justify-center gap-1.5 pt-space-xs text-center">
              <Icon name="lock" className="text-text-tertiary text-[14px]" />
              <p className="font-caption text-caption text-text-tertiary">
                Regulated under Nigerian Data Protection Regulation (NDPR).
              </p>
            </div>
          </div>
        </div>

        {/* Modal / Bottom Sheet for Certificate Details */}
        {modal && (
          <div
            className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-end justify-center"
            role="dialog"
            aria-modal="true"
            onClick={() => setModal(null)}
          >
            <div
              className="w-full max-w-lg bg-surface-container-lowest rounded-t-2xl p-space-lg shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="w-12 h-1 rounded-full bg-surface-container-highest mx-auto mb-space-md" />
              <div className="flex items-start justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="verified_user" className="text-[24px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">
                      {modal === 'id' ? 'Director Identification Proof' : 'CAC Registration Credential'}
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">Validated on Federal Database</p>
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary"
                  type="button"
                  onClick={() => setModal(null)}
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>
              {/* Certificate Preview Container */}
              <div className="rounded-xl bg-surface-container-low p-space-md mb-space-md">
                <div className="flex justify-between items-center pb-2 mb-2">
                  <span className="font-caption text-caption text-text-tertiary">Registration Number</span>
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    {draft.cacNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 mb-2">
                  <span className="font-caption text-caption text-text-tertiary">Registered Entity</span>
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    {draft.businessName}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 mb-2">
                  <span className="font-caption text-caption text-text-tertiary">Status</span>
                  <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold flex items-center gap-1">
                    <Icon name="check_circle" className="text-[14px]" /> Active & Verified
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-caption text-caption text-text-tertiary">Digital Hash</span>
                  <span className="font-caption text-caption font-mono text-text-secondary">#vm-8492048-ng</span>
                </div>
              </div>
              <button
                className="w-full h-12 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary font-semibold active:scale-95 transition-transform"
                type="button"
                onClick={() => setModal(null)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </AppScreen>
    </div>
  );
}
