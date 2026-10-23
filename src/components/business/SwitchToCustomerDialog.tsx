import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { DesktopModal } from '../desktop/DesktopModal';
import { PosToggle } from '../PosControls';
import { useClaims } from '../../context/ClaimsContext';

const ASK_KEY = 'vemtap_switch_ask';

const readAsk = () => {
  try {
    return window.localStorage.getItem(ASK_KEY) !== '0';
  } catch {
    return true;
  }
};

const writeAsk = (value: boolean) => {
  try {
    if (value) window.localStorage.removeItem(ASK_KEY);
    else window.localStorage.setItem(ASK_KEY, '0');
  } catch {
    // storage unavailable — the preference just doesn't persist
  }
};

/**
 * Switch from the business hub to the customer experience. Confirms first
 * (unless the owner turned "always ask" off), showing what is waiting on the
 * customer side.
 */
export function useSwitchToCustomer(onSwitch: () => void, businessName: string) {
  const [open, setOpen] = useState(false);
  const request = () => (readAsk() ? setOpen(true) : onSwitch());
  const dialog = <SwitchToCustomerDialog open={open} onClose={() => setOpen(false)} onSwitch={onSwitch} businessName={businessName} />;
  return { request, dialog };
}

function SwitchToCustomerDialog({
  open,
  onClose,
  onSwitch,
  businessName,
}: {
  open: boolean;
  onClose: () => void;
  onSwitch: () => void;
  businessName: string;
}) {
  const { claims } = useClaims();
  const [ask, setAsk] = useState(readAsk);
  const activeClaims = claims.filter((c) => c.status === 'claimed').length;

  return (
    <DesktopModal open={open} onClose={onClose} maxWidth="max-w-[440px]">
      <div className="p-space-lg flex flex-col gap-space-md">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading-md text-heading-md text-text-primary">Switch to your customer account?</h2>
          <p className="font-body-md text-body-md text-text-secondary">
            Browse local deals, claim discounts from other businesses and manage your personal vouchers.
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <div className="flex-1 rounded-xl bg-surface-container-low p-space-sm flex flex-col gap-1 min-w-0">
            <span className="font-caption text-caption text-text-tertiary">From</span>
            <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{businessName}</span>
            <span className="font-caption text-caption text-text-secondary">Merchant</span>
          </div>
          <Icon name="arrow_forward" className="text-[20px] text-primary shrink-0" />
          <div className="flex-1 rounded-xl bg-surface-tint-blue p-space-sm flex flex-col gap-1 min-w-0">
            <span className="font-caption text-caption text-text-tertiary">To</span>
            <span className="font-label-md text-label-md text-text-primary font-semibold">Customer</span>
            <span className="font-caption text-caption text-text-secondary">
              {activeClaims ? `${activeClaims} claim${activeClaims === 1 ? '' : 's'} ready to redeem` : 'Nothing waiting'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-space-sm">
          <span className="font-label-md text-label-md text-text-primary">Always ask before switching</span>
          <PosToggle
            checked={ask}
            ariaLabel="Always ask before switching"
            onChange={() => {
              setAsk(!ask);
              writeAsk(!ask);
            }}
          />
        </div>

        <div className="flex flex-col gap-space-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitch();
            }}
            className="h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center justify-center gap-space-xs"
          >
            <Icon name="local_mall" className="text-[18px]" /> Switch to customer experience
          </button>
          <button type="button" onClick={onClose} className="h-11 rounded-xl bg-surface-container text-text-primary font-label-md text-label-md">
            Stay in Business Hub
          </button>
        </div>
        <span className="font-caption text-caption text-text-tertiary text-center">
          You can switch back to {businessName} any time from your account.
        </span>
      </div>
    </DesktopModal>
  );
}
