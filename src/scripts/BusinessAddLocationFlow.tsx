import { useState } from 'react';
import { BusinessAddBranchScreen } from './BusinessAddBranchScreen';
import { BusinessLocationsCheckoutScreen } from './BusinessLocationsCheckoutScreen';
import { locationFeeAt, getLocationPricing } from './locationPricing';

/**
 * Dashboard "Add Location" flow (mobile): the branch form followed by the
 * ₦2,000 one-time additional-location checkout, switched internally so the
 * merchant never leaves the flow between the two steps.
 *
 * This flow is only reachable from the business dashboard — registration is
 * primary-location only. The new location is handed to the caller on the
 * simulated payment-success path only; a failed or cancelled payment never
 * produces a location, and exiting the checkout drops it.
 */

export interface NewLocationInfo {
  name: string;
  address: string;
  district: string;
  offerings?: { hasProducts: boolean; hasServices: boolean };
}

interface BusinessAddLocationFlowProps {
  businessName: string;
  /** Current number of locations — decides whether the fee is still due. */
  locationCount: number;
  /** Checkout back / flow exit — returns to the locations list. */
  onExit: () => void;
  /** The simulated payment succeeded — persist this location. */
  onLocationPaid: (location: NewLocationInfo, feePaid: number) => void;
}

export function BusinessAddLocationFlow({
  businessName,
  locationCount,
  onExit,
  onLocationPaid,
}: BusinessAddLocationFlowProps) {
  const [view, setView] = useState<'form' | 'checkout'>('form');
  const [draft, setDraft] = useState<NewLocationInfo | null>(null);

  if (view === 'checkout' && draft) {
    // The pending location sits after the primary one and any existing
    // locations, so admin-config free allowances still apply to it.
    const fee = locationFeeAt(locationCount, getLocationPricing());
    return (
      <BusinessLocationsCheckoutScreen
        businessName={businessName}
        onBack={() => setView('form')}
        onPaid={() => onLocationPaid(draft, fee)}
        onRemovePendingAndExit={onExit}
        paidCount={locationCount}
        pendingBranches={[
          {
            id: `pending-${draft.name}`,
            name: draft.name,
            subtitle: `${businessName} • ${draft.district}`,
            address: draft.address,
            hours: '',
          },
        ]}
        primaryLocation={undefined}
      />
    );
  }

  return (
    <BusinessAddBranchScreen
      onBack={onExit}
      onSaved={(info) => {
        setDraft(info);
        setView('checkout');
      }}
    />
  );
}
