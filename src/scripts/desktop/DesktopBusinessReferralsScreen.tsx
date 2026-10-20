import { BusinessReferralsContent } from '../../components/referral/BusinessReferralsContent';
import { Icon } from '../../components/ui/Icon';
import { MerchantWorkspaceChrome } from './MerchantWorkspaceChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessReferralsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
}

/**
 * Desktop Business → Referrals page.
 *
 * Routed from the Business sidebar immediately after "Business Profile" and
 * renders the same body as the mobile page.
 */
export function DesktopBusinessReferralsScreen({ onNav }: DesktopBusinessReferralsScreenProps) {
  return (
    <MerchantWorkspaceChrome activeNav="business-referrals" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-xl">
        <div className="flex flex-col gap-space-2xs pb-space-xs border-b border-border-subtle">
          <nav className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
            <button
              type="button"
              onClick={() => onNav('overview')}
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Business Hub
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="font-label-sm text-label-sm font-semibold text-text-primary">Referrals</span>
          </nav>
          <div className="flex items-center gap-space-sm pt-space-xs">
            <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-md shrink-0">
              <Icon name="group_add" className="text-[22px]" />
            </span>
            <div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Referrals</h1>
              <p className="font-caption text-caption text-text-secondary">
                Invite other businesses and track the rewards you may earn.
              </p>
            </div>
          </div>
        </div>

        <BusinessReferralsContent />
      </div>
    </MerchantWorkspaceChrome>
  );
}
