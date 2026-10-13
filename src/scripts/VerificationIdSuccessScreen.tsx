import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface VerificationIdSuccessScreenProps {
  onBack: () => void;
  onContinue: () => void;
  legalName: string;
  documentLabel: string;
  reference: string;
}

export function VerificationIdSuccessScreen({
  onBack,
  onContinue,
  legalName,
  documentLabel,
  reference,
}: VerificationIdSuccessScreenProps) {
  const now = new Date();
  const verifiedOn = `${now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} at ${now.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

  return (
    <AppScreen>
      <ScreenHeader title="Id Verification Success" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-lg">
        {/* Success Hero */}
        <div className="flex flex-col items-center text-center pt-space-xs pb-space-md">
          <div className="relative flex items-center justify-center w-24 h-24 mb-space-md">
            <div className="absolute inset-0 rounded-full bg-badge-discount-bg animate-ping opacity-30" />
            <div className="absolute inset-1 rounded-full bg-badge-discount-bg shadow-[0_8px_24px_rgba(5,150,105,0.15)]" />
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-badge-discount-text shadow-[0_4px_16px_rgba(5,150,105,0.3)]">
              <Icon name="check" filled className="text-on-primary text-[36px]" />
            </div>
          </div>
          <h2 className="font-heading-md text-heading-md text-on-surface mb-1">Identity verified</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant max-w-[320px] leading-relaxed">
            Your identity has been successfully verified. You're ready to proceed with business details.
          </p>
        </div>

        {/* Verification Record Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.06),0_2px_6px_-1px_rgba(13,37,76,0.03)] p-space-md mb-space-sm">
          <div className="flex items-center justify-between py-1 mb-1">
            <span className="font-caption text-caption text-on-surface-variant">Identity Status</span>
            <div className="flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text">
              <Icon name="verified" filled className="text-[15px]" />
              <span className="font-label-sm text-label-sm font-semibold">Verified</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 mb-1">
            <span className="font-caption text-caption text-on-surface-variant">Verified Person</span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">{legalName}</span>
          </div>
          <div className="flex items-center justify-between py-1 mb-1">
            <span className="font-caption text-caption text-on-surface-variant">Document Type</span>
            <span className="font-label-sm text-label-sm text-on-surface text-right">{documentLabel}</span>
          </div>
          <div className="flex items-center justify-between py-1 mb-1">
            <span className="font-caption text-caption text-on-surface-variant">Document Reference</span>
            <span className="font-label-sm text-label-sm text-on-surface font-mono tracking-tight">{reference}</span>
          </div>
          <div className="mt-space-xs pt-1 flex items-center justify-center gap-1.5 text-on-surface-variant bg-surface-container-low rounded-lg py-1.5 px-space-xs">
            <Icon name="schedule" className="text-[15px] text-on-surface-variant" />
            <span className="font-caption text-caption text-on-surface-variant">Verified on {verifiedOn}</span>
          </div>
        </div>

        {/* Next Stage Card */}
        <div className="bg-surface-tint-blue rounded-xl p-space-md mb-space-md">
          <div className="flex items-start gap-space-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-lowest text-primary-container shrink-0 shadow-sm">
              <Icon name="storefront" filled className="text-[20px]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-label-sm text-label-sm font-semibold text-primary">NEXT STAGE</span>
                <span className="w-1 h-1 rounded-full bg-primary/40" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Step 2 of 3</span>
              </div>
              <p className="font-label-md text-label-md font-semibold text-on-surface mb-0.5">Business Registration</p>
              <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                Tell us if your store or business has an official CAC corporate registration number.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col items-center w-full">
          <div aria-label="Onboarding Progress" className="flex items-center justify-center gap-2 mb-space-md">
            <div className="w-6 h-1.5 rounded-full bg-primary-container" />
            <div className="w-1.5 h-1.5 rounded-full bg-surface-container-high" />
            <div className="w-1.5 h-1.5 rounded-full bg-surface-container-high" />
          </div>
          <button
            className="w-full h-11 bg-primary-container text-on-primary font-button-secondary text-button-secondary font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:scale-[0.98] active:bg-primary transition-all"
            type="button"
            onClick={onContinue}
          >
            <span>Continue to Business Registration</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-space-md">
            <Icon name="lock" filled className="text-[15px] text-badge-discount-text" />
            <span className="font-caption text-caption text-on-surface-variant">
              Encrypted & securely stored via NDPR compliance
            </span>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
