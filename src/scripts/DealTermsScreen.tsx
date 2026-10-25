import { useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface DealTermsScreenProps {
  onBack: () => void;
  onClaim: () => void;
}

const SNAPSHOT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDEBYnKZ7qmo4ZHAT78FFcT91JUyGf10RRM_Y--CfFDoa5ApOSbzv4c06L1hCbsbHsJXQVMbzxnjE2L5I1oiKsnNWPzi3ZR67H9dkhVIeYFB8QKSe2RpH1vQUDlUpFZn7oJr4QO9yaoc1Jt6yIww-kRKaKPxdZwmm75pv6XQFPCOCXWBKj14d3WltjpMyzYkYkTNWItc3ns-LZg2sSWhR9Efhi7hzacrjwc8n5wyPXXniZT3N-7TrwQ0w';

const SNAPSHOT_ALT =
  'Gourmet charcoal grilled lunch combo platter with glazed chicken, crispy golden wedges, and crisp garden salad inside a warm modern bistro setting with shallow depth of field and vibrant natural light.';

interface RuleRow {
  icon: string;
  body: ReactNode;
  caption?: string;
}

const VALIDITY_RULES: RuleRow[] = [
  {
    icon: 'event_available',
    body: (
      <>
        Valid until <span className="font-label-md text-label-md text-primary-container">20 Sep 2025</span> (or while
        daily merchant allocation lasts).
      </>
    ),
    caption: 'Claims replenish daily at 10:00 AM WAT.',
  },
  {
    icon: 'schedule',
    body: (
      <>
        Redeemable during standard lunch hours:{' '}
        <span className="font-label-md text-label-md text-text-primary">12:00 PM – 4:30 PM</span>, Monday through
        Saturday.
      </>
    ),
    caption: 'Kitchen orders close 20 minutes before cutoff window.',
  },
];

const REDEMPTION_RULES: RuleRow[] = [
  {
    icon: 'person',
    body: <>One claim per customer per visit. Splitting table tabs to claim duplicate offers is not permitted.</>,
  },
  {
    icon: 'pin_drop',
    body: (
      <>
        Valid exclusively at the featured local venue in your area.
      </>
    ),
    caption: 'Not valid at partner kiosks or alternate locations.',
  },
  {
    icon: 'qr_code_scanner',
    body: (
      <>
        Must show your active VEMTAP claim confirmation screen to staff{' '}
        <span className="font-label-md text-label-md text-text-primary">prior to ordering</span>. Screenshots and
        forwarded photos are not accepted.
      </>
    ),
  },
  {
    icon: 'room_service',
    body: (
      <>
        Available for{' '}
        <span className="font-label-md text-label-md text-text-primary">Dine-in and Takeaway only</span>. Not applicable
        on third-party delivery services (Glovo, Chowdeck, etc.).
      </>
    ),
  },
];

const EXCLUSION_RULES: RuleRow[] = [
  {
    icon: 'do_not_disturb_on',
    body: (
      <>
        Cannot be combined with other ongoing promotions, student discounts, happy hour menus, or loyalty vouchers.
      </>
    ),
  },
  {
    icon: 'inventory_2',
    body: (
      <>
        Subject to daily kitchen stock availability. In the rare event of side item depletion, a chef-curated equal
        substitute will be provided.
      </>
    ),
  },
];

function Section({ icon, title, rules }: { icon: string; title: string; rules: RuleRow[] }) {
  return (
    <section className="px-margin mt-space-lg">
      <div className="flex items-center gap-space-xs mb-space-xs">
        <div className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary-container flex items-center justify-center">
          <Icon name={icon} className="text-[18px]" />
        </div>
        <h3 className="font-heading-sm text-heading-sm text-text-primary">{title}</h3>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
        {rules.map((rule) => (
          <div key={rule.icon} className="flex items-start gap-space-sm">
            <div className="w-6 h-6 rounded-full bg-surface-container-low text-primary-container flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name={rule.icon} className="text-[15px]" />
            </div>
            <div className="flex-1">
              <p className="font-body-md text-body-md text-text-primary">{rule.body}</p>
              {rule.caption && <p className="font-caption text-caption text-text-tertiary mt-0.5">{rule.caption}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DealTermsScreen({ onBack, onClaim }: DealTermsScreenProps) {
  const [faqOpen, setFaqOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleClaim = () => {
    if (processing) return;
    setProcessing(true);
    window.setTimeout(() => onClaim(), 600);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Deal Terms" onBack={onBack} />

      <div className="flex flex-col w-full pb-32">
        <section className="px-margin pt-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center gap-space-sm transition-all">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
              <img className="w-full h-full object-cover" alt={SNAPSHOT_ALT} src={SNAPSHOT_IMAGE} />
              <div className="absolute top-1 left-1 bg-badge-discount-bg text-badge-discount-text px-1.5 py-0.5 rounded-full font-caption text-caption flex items-center gap-0.5 shadow-sm">
                <Icon name="bolt" filled className="text-[11px]" />
                -20%
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption truncate">
                <Icon name="storefront" className="text-[14px]" />
                <span className="truncate">Local dining partner • Nearby</span>
              </div>
              <h2 className="font-heading-sm text-heading-sm text-text-primary truncate mt-0.5">
                Featured local deal
              </h2>
              <div className="flex items-baseline gap-space-2xs mt-1">
                <span className="font-heading-sm text-heading-sm text-primary-container">₦9,600</span>
                <span className="font-caption text-caption text-text-tertiary line-through">₦12,000</span>
                <span className="ml-auto bg-surface-tint-blue text-primary-container px-2 py-0.5 rounded-full font-caption text-caption flex items-center gap-1">
                  <Icon name="verified" className="text-[12px]" />
                  Vetted Deal
                </span>
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
            <span className="bg-surface-container-highest text-secondary px-2.5 py-1 rounded-full font-caption text-caption">
              3 min read
            </span>
          </div>
        </section>

        <Section icon="calendar_clock" title="Deal Validity & Timing" rules={VALIDITY_RULES} />
        <Section icon="rule" title="Redemption Rules" rules={REDEMPTION_RULES} />
        <Section icon="block" title="Combinability & Exclusions" rules={EXCLUSION_RULES} />

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
                Yes! Unredeemed claims can be released penalty-free up to 30 minutes before the end of the daily lunch
                window so other members can enjoy them.
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
              Terms set by <strong className="text-text-primary font-label-sm">the selected local merchant</strong> in
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
            Total: <span className="font-label-md text-label-md text-text-primary">₦9,600</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClaim}
          disabled={processing}
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
              <span>Claim Deal</span>
            </>
          )}
        </button>
      </div>
    </AppScreen>
  );
}
