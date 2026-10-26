import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { InfoDialog } from '../components/InfoDialog';

/**
 * Step 3 of the business-location onboarding: the informational "add more
 * locations" step shown right after the (free) primary location.
 *
 * Registration is primary-location only: the ₦2,000 additional-location
 * purchase lives strictly in the business dashboard, so this screen never
 * shows pricing or a checkout. "Add Another Location" simply opens an
 * informational popup telling the merchant where to go instead, and the
 * primary CTA continues onboarding with the primary location only.
 *
 * `extraBranches` / `paidBranches` are only relevant for restoring older
 * saved drafts that captured locations before this split; anything unpaid is
 * dropped when continuing.
 */

export interface BusinessBranch {
  id: string;
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  imageAlt: string;
  primary?: boolean;
}

/** Exact popup copy shown when a merchant tries to add a location during sign-up. */
export const ADD_LOCATION_AFTER_SIGNUP_MESSAGE =
  'You can add more locations from your dashboard settings once you complete your registration.';

interface BusinessLocationsOfferScreenProps {
  businessName: string;
  /** Primary location captured in the previous step — always free. */
  primaryLocation?: { street: string; landmark?: string };
  /** Additional locations restored from an older saved draft (if any). */
  extraBranches?: BusinessBranch[];
  /** Ids of those additional locations that were already paid for. */
  paidBranchIds?: string[];
  onBack: () => void;
  /** "Continue with Primary Location" — drop unpaid extras, continue onboarding. */
  onContinuePrimary: () => void;
  onSaveDraft: () => void;
}

export function BusinessLocationsOfferScreen({
  businessName,
  primaryLocation,
  extraBranches = [],
  paidBranchIds = [],
  onBack,
  onContinuePrimary,
  onSaveDraft,
}: BusinessLocationsOfferScreenProps) {
  const [showDashboardHint, setShowDashboardHint] = useState(false);

  const isPaid = (branchId: string) => paidBranchIds.includes(branchId);
  const label = businessName.trim() || 'Your Store';

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[22px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-center gap-space-2xs mb-1">
              <span className="w-6 h-1.5 rounded-full bg-primary-container transition-all" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container transition-all" />
              <span className="w-1.5 h-1.5 rounded-full bg-border-subtle transition-all" />
            </div>
            <h1 className="font-label-sm text-label-sm text-text-secondary line-clamp-1">Business Locations</h1>
          </div>
          <div className="w-11 h-11 flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_6px_rgba(0,85,196,0.2)]">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-10">
        <div className="flex flex-col px-margin pt-space-xs gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs bg-surface-container-high px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-label-sm text-label-sm text-secondary font-medium">Step 3 of 4</span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold">75% Complete</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden flex">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-500"
                style={{ width: '75%' }}
              />
            </div>
            <div className="mt-space-2xs">
              <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Add More Business Locations
              </h2>
              <p className="font-label-md text-label-md text-text-primary font-semibold mt-1.5">
                Do you have other branches or business locations?
              </p>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                You can continue with your primary location now and manage every location from your dashboard.
              </p>
            </div>
          </div>

          {/* Dashboard-only notice — replaces the old in-signup pricing card. */}
          <div className="flex items-start gap-space-sm bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0 shadow-xs">
              <Icon name="info" className="text-[22px]" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
                Locations are managed from your dashboard
              </span>
              <p className="font-caption text-caption text-text-secondary leading-relaxed mt-1">
                {ADD_LOCATION_AFTER_SIGNUP_MESSAGE}
              </p>
            </div>
          </div>

          {/* Primary location — always free */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm gap-space-xs border border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Your locations</span>
              <span className="font-caption text-caption text-text-secondary">Primary location included free</span>
            </div>
            <div className="flex items-center justify-between gap-space-sm py-space-xs">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="storefront" className="text-[21px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                      {label} (Main)
                    </span>
                    <span className="bg-primary-container text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0">
                      Primary
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    {primaryLocation?.street || 'Your primary business location'}
                  </span>
                </div>
              </div>
              <span className="font-label-md text-label-md font-semibold text-badge-discount-text flex-shrink-0">
                Free
              </span>
            </div>

            {extraBranches.map((branch) => (
              <div
                className="flex items-center justify-between gap-space-sm py-space-xs border-t border-border-subtle/80"
                key={branch.id}
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container shadow-inner">
                    <img alt={branch.imageAlt} className="w-full h-full object-cover" src={branch.image} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        {branch.name}
                      </span>
                      <span
                        className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                          isPaid(branch.id)
                            ? 'bg-badge-discount-bg text-badge-discount-text'
                            : 'bg-surface-container-high text-text-secondary'
                        }`}
                      >
                        {isPaid(branch.id) ? 'Paid' : 'Draft'}
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-secondary truncate">{branch.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-space-xs">
            <button
              className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary rounded-xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] flex items-center justify-center gap-2 transition-all"
              type="button"
              onClick={onContinuePrimary}
            >
              <span>Continue with Primary Location</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>

            <button
              className="w-full h-11 rounded-xl bg-surface-tint-blue/70 hover:bg-surface-tint-blue active:scale-[0.98] transition-all text-primary font-button-secondary text-button-secondary shadow-sm flex items-center justify-center gap-2"
              type="button"
              onClick={() => setShowDashboardHint(true)}
            >
              <Icon name="add" className="text-[18px]" />
              <span>Add Another Location</span>
            </button>

            <button
              className="w-full h-11 bg-surface-container-highest hover:bg-surface-container-high active:scale-[0.98] text-text-primary rounded-xl font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-1.5"
              type="button"
              onClick={onSaveDraft}
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save as Draft</span>
            </button>
          </div>
        </div>
      </div>

      <InfoDialog
        open={showDashboardHint}
        onClose={() => setShowDashboardHint(false)}
        title="Add locations from your dashboard"
        message={ADD_LOCATION_AFTER_SIGNUP_MESSAGE}
        acknowledgeLabel="Got it"
      />
    </AppScreen>
  );
}
