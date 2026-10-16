import { Icon } from '../../components/ui/Icon';
import type { VerificationIdType } from '../verificationDraft';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationIdTypeScreenProps {
  onBack: () => void;
  idType: VerificationIdType;
  onIdTypeChange: (idType: VerificationIdType) => void;
  onContinue: () => void;
  onBrand?: () => void;
}

const ID_OPTIONS: {
  key: VerificationIdType;
  name: string;
  badge: string | null;
  badgeClass: string;
  description: string;
  metaIcon1: string;
  metaText1: string;
  metaIcon2: string;
  metaText2: string;
}[] = [
  {
    key: 'nin',
    name: 'NIN (National Identification Number)',
    badge: 'Recommended • Instant',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    description: 'Fast digital verification via official NIMC database. Immediate biometric & NIN slip lookup.',
    metaIcon1: 'account_circle',
    metaText1: '11-digit Slip',
    metaIcon2: 'timer',
    metaText2: '~15 seconds',
  },
  {
    key: 'drivers_license',
    name: "Driver's Licence",
    badge: 'Standard',
    badgeClass: 'bg-surface-container text-text-secondary',
    description: 'Federal Road Safety Corps (FRSC) issued licence with digital record check and photo verification.',
    metaIcon1: 'badge',
    metaText1: 'Valid FRSC Licence',
    metaIcon2: 'timer',
    metaText2: '~45 seconds',
  },
  {
    key: 'passport',
    name: 'International Passport',
    badge: 'Biometric',
    badgeClass: 'bg-surface-container text-text-secondary',
    description: 'Nigerian Immigration Service (NIS) passport with biometric validation and MRZ barcode capture.',
    metaIcon1: 'public',
    metaText1: 'Data Page Scan',
    metaIcon2: 'timer',
    metaText2: '~30 seconds',
  },
  {
    key: 'voters_card',
    name: "Voter's Card (VIN / INEC)",
    badge: 'Registry',
    badgeClass: 'bg-surface-container text-text-secondary',
    description: 'Official INEC voter registry lookup via 19-character Voter Identification Number.',
    metaIcon1: 'how_to_vote',
    metaText1: 'Permanent Voter Card (PVC)',
    metaIcon2: 'timer',
    metaText2: '~60 seconds',
  },
];

export function DesktopVerificationIdTypeScreen({
  onBack,
  idType,
  onIdTypeChange,
  onContinue,
  onBrand,
}: DesktopVerificationIdTypeScreenProps) {
  const selected = ID_OPTIONS.find((option) => option.key === idType) ?? ID_OPTIONS[0];

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="w-full max-w-6xl mx-auto px-margin py-space-xl flex flex-col gap-space-2xl">
        <div className="w-full flex flex-col gap-space-xs bg-surface-canvas rounded-xl p-space-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs text-on-surface">
            <div className="flex items-center gap-space-xs">
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-caption">
                1
              </span>
              <span className="font-heading-sm text-heading-sm">Step 1 of 2: Government-Issued Identity Selection</span>
            </div>
            <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
              <span>50% Completed</span>
              <span className="text-text-tertiary">•</span>
              <span className="text-primary font-semibold">Next: Document Details</span>
            </div>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
            <div className="bg-primary-container h-full rounded-full transition-all duration-500 ease-out w-1/2" />
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-space-xs">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-tint-blue rounded-full text-primary font-label-sm text-caption tracking-wide">
            <Icon name="verified" className="text-[16px]" />
            <span>Step 1 of 2 • Identity Verification</span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Who are you?</h1>
          <p className="font-body-lg text-body-lg text-text-secondary max-w-xl">
            Select a government-issued ID to verify your identity. This verifies the person operating this business
            account.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="text-text-tertiary font-label-sm text-caption uppercase tracking-wider font-semibold">
              Select Identity Document
            </div>
            <div className="flex flex-col gap-space-sm" role="radiogroup" aria-label="Identity document type">
              {ID_OPTIONS.map((option) => {
                const active = option.key === idType;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onIdTypeChange(option.key)}
                    className={`relative flex items-start gap-space-md p-space-lg rounded-xl cursor-pointer transition-all duration-200 text-left ${
                      active ? 'bg-surface-tint-blue/30 shadow-md' : 'bg-surface-canvas shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                        active ? 'bg-primary text-on-primary' : 'bg-surface-container text-transparent'
                      }`}
                    >
                      <Icon name="check" className="text-[16px]" />
                    </div>
                    <div className="flex flex-col gap-space-2xs flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-space-xs">
                        <span className="font-heading-sm text-heading-sm text-text-primary">{option.name}</span>
                        <div
                          className={`flex items-center gap-1.5 px-space-xs py-0.5 rounded-full font-label-sm text-caption font-semibold ${option.badgeClass}`}
                        >
                          {option.badge === 'Recommended • Instant' && (
                            <Icon name="bolt" className="text-[14px]" />
                          )}
                          <span>{option.badge}</span>
                        </div>
                      </div>
                      <p className="font-body-md text-body-md text-text-secondary">{option.description}</p>
                      <div className="flex flex-wrap items-center gap-space-sm pt-space-2xs text-text-tertiary font-label-sm text-caption">
                        <span className="flex items-center gap-1">
                          <Icon name={option.metaIcon1} className="text-[14px]" /> {option.metaText1}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Icon name={option.metaIcon2} className="text-[14px]" /> {option.metaText2}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="text-text-tertiary font-label-sm text-caption uppercase tracking-wider font-semibold">
              Verification Safeguards
            </div>
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
              <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-tint-blue">
                <div className="p-2 bg-primary rounded-lg text-on-primary shrink-0 flex items-center justify-center">
                  <Icon name="assured_workload" className="text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-primary font-semibold">
                    Accredited Registry Gateway
                  </span>
                  <span className="font-caption text-caption text-text-secondary mt-0.5">
                    Connected directly with accredited verification services (NIMC &amp; NIBSS licensed).
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-space-sm p-space-sm bg-badge-discount-bg text-badge-discount-text rounded-lg flex-wrap">
                <div className="flex items-center gap-space-xs font-label-md text-label-md font-semibold">
                  <Icon name="electric_bolt" className="text-[20px]" />
                  <span>Instant identity verification in under 30 seconds</span>
                </div>
                <Icon name="check_circle" className="text-[16px]" />
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-start gap-space-xs">
                  <Icon name="lock" className="text-primary text-[20px] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      256-Bit Bank-Grade Encryption
                    </span>
                    <p className="font-body-md text-caption text-text-secondary">
                      Your personal identity information is protected by 256-bit bank-grade encryption and only used
                      for account authentication and regulatory compliance under NDPR.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-space-xs pt-space-xs">
                  <Icon name="shield_with_heart" className="text-badge-discount-text text-[20px] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Zero Financial Intrusion
                    </span>
                    <p className="font-body-md text-caption text-text-secondary">
                      Your BVN or private banking credentials are never requested or stored during this onboarding
                      stage.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-space-xs flex flex-wrap items-center gap-space-xs">
                <div className="px-space-xs py-1 rounded bg-surface-container text-on-surface font-caption text-caption flex items-center gap-1">
                  <Icon name="check" className="text-[14px] text-badge-discount-text" />
                  <span>NDPR Certified</span>
                </div>
                <div className="px-space-xs py-1 rounded bg-surface-container text-on-surface font-caption text-caption flex items-center gap-1">
                  <Icon name="security" className="text-[14px] text-primary" />
                  <span>TLS 1.3 Strict</span>
                </div>
                <div className="px-space-xs py-1 rounded bg-surface-container text-on-surface font-caption text-caption flex items-center gap-1">
                  <Icon name="fingerprint" className="text-[14px] text-tertiary" />
                  <span>Biometric Matching</span>
                </div>
              </div>
            </div>
            <div className="p-space-md rounded-xl bg-surface-subtle flex items-center justify-between gap-space-sm text-text-secondary flex-wrap">
              <div className="flex items-center gap-space-xs min-w-0">
                <Icon name="contact_support" className="text-[18px] shrink-0" />
                <span className="font-caption text-caption">Don't have your physical card on hand?</span>
              </div>
              <button className="font-label-sm text-caption text-primary hover:underline font-semibold" type="button">
                Use Virtual Slip →
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <button
            className="order-2 sm:order-1 px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to Setup Overview</span>
          </button>
          <div className="order-1 sm:order-2 flex items-center gap-space-md w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-space-xl py-space-sm bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-space-xs"
              type="button"
              onClick={onContinue}
            >
              <span>Continue to {selected.name.split(' (')[0]} Details</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
