import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import { dealTermsSections, dealUnavailableLabel, formatNaira, type DealDetail, type DealRule } from '../hooks/useDealDetail';
import { NO_IMAGE } from '../utils/homeOffer';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface DealTermsScreenProps {
  onBack: () => void;
  onClaim: () => void;
  detail: DealDetail | null;
  loading: boolean;
}

function Section({ icon, title, rules }: { icon: string; title: string; rules: DealRule[] }) {
  return (
    <section className="px-margin mt-space-lg">
      <div className="flex items-center gap-space-xs mb-space-xs">
        <div className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary-container flex items-center justify-center">
          <Icon name={icon} className="text-[18px]" />
        </div>
        <h3 className="font-heading-sm text-heading-sm text-text-primary">{title}</h3>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
        {rules.map((rule, index) => (
          <div key={`${index}-${rule.body}`} className="flex items-start gap-space-sm">
            <div className="w-6 h-6 rounded-full bg-surface-container-low text-primary-container flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name={rule.icon} className="text-[15px]" />
            </div>
            <div className="flex-1">
              <p className="font-body-md text-body-md text-text-primary">{rule.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DealTermsScreen({ onBack, onClaim, detail, loading }: DealTermsScreenProps) {
  const [faqOpen, setFaqOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleClaim = () => {
    if (processing) return;
    setProcessing(true);
    window.setTimeout(() => onClaim(), 600);
  };

  if (!detail) {
    return (
      <AppScreen>
        <ScreenHeader title="Deal Terms" onBack={onBack} />
        {loading ? (
          <SkeletonGroup label="Loading deal terms" className="px-margin pt-space-md space-y-space-md">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </SkeletonGroup>
        ) : (
          <p className="px-margin pt-10 text-center font-label-md text-label-md text-text-primary">This deal isn’t available.</p>
        )}
      </AppScreen>
    );
  }

  const sections = dealTermsSections(detail);
  const unavailable = dealUnavailableLabel(detail);

  return (
    <AppScreen>
      <ScreenHeader title="Deal Terms" onBack={onBack} />

      <div className="flex flex-col w-full pb-32">
        <section className="px-margin pt-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center gap-space-sm transition-all">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
              <img className="w-full h-full object-cover" alt={detail.title} src={detail.image ?? NO_IMAGE} />
              {detail.discountPercent > 0 && (
                <div className="absolute top-1 left-1 bg-badge-discount-bg text-badge-discount-text px-1.5 py-0.5 rounded-full font-caption text-caption flex items-center gap-0.5 shadow-sm">
                  <Icon name="bolt" filled className="text-[11px]" />
                  -{detail.discountPercent}%
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption truncate">
                <Icon name="storefront" className="text-[14px]" />
                <span className="truncate">{detail.businessName}{detail.branchName ? ` • ${detail.branchName}` : ''}</span>
              </div>
              <h2 className="font-heading-sm text-heading-sm text-text-primary truncate mt-0.5">{detail.title}</h2>
              <div className="flex items-baseline gap-space-2xs mt-1">
                <span className="font-heading-sm text-heading-sm text-primary-container">{formatNaira(detail.price)}</span>
                {detail.oldPrice > detail.price && <span className="font-caption text-caption text-text-tertiary line-through">{formatNaira(detail.oldPrice)}</span>}
                {detail.verified && (
                  <span className="ml-auto bg-surface-tint-blue text-primary-container px-2 py-0.5 rounded-full font-caption text-caption flex items-center gap-1">
                    <Icon name="verified" className="text-[12px]" />
                    Verified Merchant
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-margin mt-space-md">
          <div className="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                <Icon name="verified_user" className="text-[18px]" />
              </div>
              <div>
                <p className="font-label-md text-label-md text-text-primary">Transparent Policy</p>
                <p className="font-caption text-caption text-text-secondary">Review before claiming at checkout</p>
              </div>
            </div>
          </div>
        </section>

        <Section icon="calendar_clock" title="Deal Validity & Timing" rules={sections.validity} />
        {sections.redemption.length > 0 && <Section icon="rule" title="Redemption Rules" rules={sections.redemption} />}
        {sections.merchant.length > 0 && <Section icon="block" title="Merchant Terms" rules={sections.merchant} />}

        <section className="px-margin mt-space-lg">
          <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm">
            <button
              type="button"
              onClick={() => setFaqOpen((value) => !value)}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex items-center gap-space-xs">
                <Icon name="help_outline" className="text-secondary text-[20px]" />
                <span className="font-label-md text-label-md text-text-primary">
                  Can I cancel if my plans change?
                </span>
              </div>
              <Icon
                name="expand_more"
                className={`text-text-tertiary transition-transform duration-200 ${faqOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {faqOpen && (
              <div className="pt-space-xs text-text-secondary font-body-md text-body-md">
                You can release an unredeemed claim from My Deals at any time, without penalty.
                </div>
            )}
          </div>
        </section>

        <section className="px-margin mt-space-md mb-space-lg">
          <div className="p-space-sm rounded-lg bg-surface-container-lowest shadow-sm flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center flex-shrink-0 text-on-secondary-fixed">
              <Icon name="shield" className="text-[20px]" />
            </div>
            <p className="font-caption text-caption text-text-secondary flex-1">
              Terms set by <strong className="text-text-primary font-label-sm">{detail.businessName}</strong> in
              accordance with VEMTAP consumer fair-use policy.
            </p>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-8px_24px_rgba(17,24,39,0.06)] px-margin py-space-sm pb-safe">
        <div className="flex items-center justify-between mb-space-xs px-1">
          <div className="flex items-center gap-1 text-text-tertiary font-caption text-caption">
            <Icon name="check_circle" className="text-[15px] text-badge-discount-text" />
            <span>Instant code activation</span>
          </div>
          <div className="font-caption text-caption text-text-secondary">
            Total: <span className="font-label-md text-label-md text-text-primary">{formatNaira(detail.price)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClaim}
          disabled={processing || Boolean(unavailable)}
          className="w-full h-[54px] bg-primary-container active:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {processing ? (
            <>
              <Icon name="progress_activity" className="text-[20px] animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Icon name="shopping_bag" className="text-[20px]" />
              <span>{unavailable ?? 'Claim Deal'}</span>
            </>
          )}
        </button>
      </div>
    </AppScreen>
  );
}
