import { CustomerReferralsContent } from '../../components/referral/CustomerReferralsContent';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { Icon } from '../../components/ui/Icon';

interface DesktopCustomerReferralsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

/**
 * Desktop customer "Referrals & Rewards" page.
 *
 * Routed from the account menu immediately after "Saved and Wishlist" and
 * renders the same body as the mobile page.
 */
export function DesktopCustomerReferralsScreen({ onNav, onBack }: DesktopCustomerReferralsScreenProps) {
  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex flex-wrap items-center gap-2 mb-6 font-label-sm text-label-sm text-text-tertiary">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              Account
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-semibold">Referrals &amp; Rewards</span>
          </nav>

          <div className="flex items-center gap-space-sm mb-8 pb-space-md border-b border-border-subtle">
            <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-md shrink-0">
              <Icon name="redeem" className="text-[22px]" />
            </span>
            <div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Referrals &amp; Rewards
              </h1>
              <p className="font-caption text-caption text-text-secondary">
                Invite businesses and friends, and see the rewards you may earn.
              </p>
            </div>
          </div>

          <CustomerReferralsContent />
        </div>
      </div>
    </DesktopPage>
  );
}
