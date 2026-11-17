import { useEffect, useRef, useState } from 'react';
import { Skeleton, SkeletonGroup } from '../../components/ui/Skeleton';
import { dealTermsSections, dealUnavailableLabel, formatNaira, type DealDetail, type DealRule } from '../../hooks/useDealDetail';
import { NO_IMAGE } from '../../utils/homeOffer';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopDealTermsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onClaim: () => void;
  detail: DealDetail | null;
  loading: boolean;
}

interface DealTermsSectionProps {
  icon: string;
  title: string;
  rules: DealRule[];
}

function DealTermsSection({ icon, title, rules }: DealTermsSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mt-space-lg">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-space-xs mb-space-xs text-left focus:outline-none"
      >
        <span className="flex items-center gap-space-xs min-w-0">
          <span className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
            <Icon name={icon} className="text-[18px]" />
          </span>
          <span className="font-heading-sm text-heading-sm text-text-primary truncate">{title}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption shrink-0">
            {rules.length}
          </span>
        </span>
        <Icon
          name="expand_more"
          className={`text-text-tertiary transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md border border-border-subtle">
          {rules.map((rule, index) => (
            <div key={`${index}-${rule.body}`} className="flex items-start gap-space-sm">
              <div className="w-6 h-6 rounded-full bg-surface-container-low text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name={rule.icon} className="text-[15px]" />
              </div>
              <div className="flex-1">
                <p className="font-body-md text-body-md text-text-primary">{rule.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function DesktopDealTermsScreen({ onNav, onBack, onClaim, detail, loading }: DesktopDealTermsScreenProps) {
  const [faqOpen, setFaqOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const claimTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (claimTimer.current !== null) window.clearTimeout(claimTimer.current);
    };
  }, []);

  const handleClaim = () => {
    if (processing) return;
    setProcessing(true);
    claimTimer.current = window.setTimeout(() => onClaim(), 600);
  };

  if (!detail) {
    return (
      <DesktopPage withHeader withFooter onNav={onNav} activeNav="deal-detail">
        <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
            {loading ? (
              <SkeletonGroup label="Loading deal terms" className="space-y-space-md">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </SkeletonGroup>
            ) : (
              <p className="pt-10 text-center font-label-md text-label-md text-text-primary">This deal isn’t available.</p>
            )}
          </div>
        </div>
      </DesktopPage>
    );
  }

  const sections = dealTermsSections(detail);
  const unavailable = dealUnavailableLabel(detail);

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="deal-detail">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col gap-1 mb-6">
            <nav className="flex items-center gap-2 text-text-tertiary font-caption text-caption">
              <button className="hover:text-primary transition-colors flex items-center gap-1" onClick={onBack} type="button">
                <Icon name="arrow_back" className="text-[15px]" />
                <span>Deals</span>
              </button>
              <span className="text-outline-variant">/</span>
              <button className="hover:text-primary transition-colors" onClick={() => onNav('deals')} type="button">
                {detail.title}
              </button>
              <span className="text-outline-variant">/</span>
              <span className="text-text-primary font-medium">Deal Terms</span>
            </nav>
            <div className="pt-1">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Deal Terms</h1>
              <p className="font-body-md text-body-md text-text-secondary mt-1 max-w-2xl">
                Review the validity window, redemption rules and exclusions for this deal before you claim it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            <div className="flex flex-col min-w-0">
              <section>
                <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center gap-space-sm transition-all border border-border-subtle">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
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
                      <span className="font-heading-sm text-heading-sm text-primary">{formatNaira(detail.price)}</span>
                      {detail.oldPrice > detail.price && <span className="font-caption text-caption text-text-tertiary line-through">{formatNaira(detail.oldPrice)}</span>}
                      {detail.verified && (
                  <span className="ml-auto bg-surface-tint-blue text-primary px-2 py-0.5 rounded-full font-caption text-caption flex items-center gap-1">
                    <Icon name="verified" className="text-[12px]" />
                    Verified Merchant
                  </span>
                )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-space-md">
                <div className="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                      <Icon name="verified_user" className="text-[18px]" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-text-primary">Transparent Policy</p>
                      <p className="font-caption text-caption text-text-secondary">
                        Review before claiming at checkout
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <DealTermsSection
                icon="calendar_clock"
                title={'Deal Validity & Timing'}
                rules={sections.validity}
              />
              {sections.redemption.length > 0 && <DealTermsSection icon="rule" title="Redemption Rules" rules={sections.redemption} />}
              {sections.merchant.length > 0 && <DealTermsSection icon="block" title="Merchant Terms" rules={sections.merchant} />}

              <section className="mt-space-lg">
                <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm">
                  <button
                    type="button"
                    onClick={() => setFaqOpen((value) => !value)}
                    aria-expanded={faqOpen}
                    className="w-full flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="flex items-center gap-space-xs">
                      <Icon name="help_outline" className="text-primary text-[20px]" />
                      <span className="font-label-md text-label-md text-text-primary">
                        Can I cancel if my plans change?
                      </span>
                    </span>
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

              <section className="mt-space-md mb-space-lg">
                <div className="p-space-sm rounded-lg bg-surface-container-lowest shadow-sm flex items-center gap-space-sm border border-border-subtle">
                  <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center flex-shrink-0 text-primary">
                    <Icon name="shield" className="text-[20px]" />
                  </div>
                  <p className="font-caption text-caption text-text-secondary flex-1">
                    Terms set by <strong className="text-text-primary font-label-sm">{detail.businessName}</strong>{' '}
                    in accordance with VEMTAP consumer fair-use policy.
                  </p>
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
              <div className="bg-surface-container-lowest rounded-2xl shadow-md p-space-sm flex flex-col gap-space-sm border border-border-subtle">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-text-tertiary font-caption text-caption">
                    <Icon name="check_circle" className="text-[15px] text-badge-discount-text" />
                    <span>Instant code activation</span>
                  </div>
                  <div className="font-caption text-caption text-text-secondary">
                    Total: <span className="font-label-md text-label-md text-text-primary">{formatNaira(detail.price)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-surface-subtle rounded-lg px-space-sm py-2">
                  <span className="font-caption text-caption text-text-secondary">Deal price</span>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">{formatNaira(detail.price)}</span>
                </div>
                {detail.oldPrice > detail.price && (
                  <div className="flex items-center justify-between bg-badge-discount-bg rounded-lg px-space-sm py-2">
                  <span className="font-caption text-caption text-text-secondary">You save today</span>
                  <span className="font-label-md text-label-md font-semibold text-badge-discount-text">{formatNaira(detail.oldPrice - detail.price)}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={processing || Boolean(unavailable)}
                  className="w-full h-[54px] bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] active:scale-[0.98] transition-all disabled:opacity-70"
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

                <p className="font-caption text-caption text-text-tertiary px-1 leading-snug">
                  Claiming stores an offline QR pass in My Deals. Pay the merchant directly at the counter.
                </p>
              </div>

              <div className="p-space-sm rounded-xl bg-surface-tint-blue flex items-start gap-2">
                <Icon name="info" className="text-primary text-[18px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Questions about this voucher? Message {detail.businessName} from your Messages hub.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNav('messages')}
                className="h-11 rounded-xl bg-surface-canvas border border-border-subtle text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 hover:bg-surface-subtle transition-colors shadow-sm"
              >
                <Icon name="forum" className="text-[18px] text-primary" />
                <span>Message Merchant</span>
              </button>
            </aside>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
