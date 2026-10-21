import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { AddressFormSheet } from '../components/AddressFormSheet';
import { useSavedAddresses } from '../hooks/useSavedAddresses';
import type { SavedAddress } from '../services/addressesService';
import { apiErrorMessage } from '../services/errorMessages';

interface AddressesScreenProps {
  onBack: () => void;
}

export function AddressesScreen({ onBack }: AddressesScreenProps) {
  const { addresses, isLoading, error, refetch, save, makeDefault: setDefault, remove } = useSavedAddresses();
  const [editing, setEditing] = useState<SavedAddress | null | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const showToast = (text: string) => {
    setToast(text);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  const makeDefault = async (item: SavedAddress) => {
    try {
      await setDefault(item.id);
      showToast(item.label + ' set as default');
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not change the default address.'));
    }
  };

  const removeAddress = async (item: SavedAddress) => {
    try {
      await remove(item.id);
      showToast(item.label + ' removed');
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not remove this address.'));
    }
  };

  return (
    <AppScreen surface="bg-surface">
      <header className="sticky top-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-border-subtle">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="text-heading-sm font-heading-sm text-text-primary tracking-tight truncate">
              Delivery Addresses
            </h1>
          </div>
        </div>
      </header>

      <main className="flex flex-col px-margin pt-space-md pb-24 gap-space-lg">
        <section className="rounded-xl bg-surface-tint-blue p-space-md flex items-start gap-space-sm">
          <Icon name="home" className="text-[22px] text-primary shrink-0" filled />
          <div className="flex flex-col min-w-0">
            <p className="text-label-md font-label-md text-text-primary font-semibold">
              Saved places &amp; neighborhood radius
            </p>
            <p className="text-caption font-caption text-text-secondary mt-0.5">
              We use these to estimate pickup distance and local delivery availability.
            </p>
          </div>
        </section>

        {isLoading ? (
          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex justify-center">
            <Icon name="progress_activity" className="text-[24px] text-text-tertiary animate-spin" />
          </section>
        ) : error ? (
          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col items-center text-center gap-space-xs">
            <p className="text-label-md font-label-md text-text-primary font-semibold">Could not load your addresses</p>
            <button type="button" onClick={refetch} className="text-label-md font-label-md text-primary font-semibold">
              Try again
            </button>
          </section>
        ) : addresses.length === 0 ? (
          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col items-center text-center gap-space-xs">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
              <Icon name="location_off" className="text-[24px] text-text-secondary" />
            </div>
            <p className="text-label-md font-label-md text-text-primary font-semibold">No saved addresses</p>
            <p className="text-body-md font-body-md text-text-secondary max-w-[260px]">
              Add a place so merchants can estimate delivery and you can check out faster.
            </p>
          </section>
        ) : (
          <section className="flex flex-col gap-space-xs">
            {addresses.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-border-subtle"
              >
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-start gap-space-sm min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
                      <Icon
                        name={item.label === 'Home' ? 'home' : item.label === 'Office' ? 'work' : 'location_on'}
                        className="text-[18px] text-primary"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-space-2xs">
                        <span className="text-label-md font-label-md text-text-primary font-semibold">
                          {item.label}
                        </span>
                        {item.isDefault && (
                          <span className="px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text text-[10px] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-body-md font-body-md text-text-secondary mt-0.5 leading-snug">
                        {item.line}
                      </p>
                      <p className="text-caption font-caption text-text-secondary mt-0.5">
                        {[item.area, item.notes].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs mt-space-sm pt-space-xs border-t border-border-subtle">
                  {!item.isDefault && (
                    <button
                      type="button"
                      onClick={() => void makeDefault(item)}
                      className="h-9 px-space-sm rounded-lg bg-surface-tint-blue text-primary text-label-sm font-label-sm font-semibold active:scale-95 transition-transform"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="h-9 px-space-sm rounded-lg bg-surface-container text-text-secondary text-label-sm font-label-sm font-medium active:scale-95 transition-transform"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeAddress(item)}
                    className="h-9 px-space-sm rounded-lg text-error text-label-sm font-label-sm font-medium active:scale-95 transition-transform ml-auto"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        <button
          type="button"
          onClick={() => setEditing(null)}
          className="w-full h-11 rounded-xl border-2 border-dashed border-border-subtle text-label-md font-label-md text-primary font-semibold flex items-center justify-center gap-2 hover:border-primary/40 hover:bg-surface-tint-blue transition-colors"
        >
          <Icon name="add" className="text-[18px]" />
          <span>Add a new address</span>
        </button>

        <p className="text-caption font-caption text-text-secondary px-space-2xs">
          Neighborhood radius applies to in-store pickup deals near your saved places. Actual delivery
          availability depends on each merchant.
        </p>
      </main>

      <AddressFormSheet
        open={editing !== undefined}
        address={editing}
        onClose={() => setEditing(undefined)}
        onSave={async (input) => {
          await save(input, editing?.id);
          showToast(editing ? 'Address updated' : 'Address saved');
        }}
      />

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
