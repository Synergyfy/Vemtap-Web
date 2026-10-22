import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { AddressFormSheet } from '../../components/AddressFormSheet';
import { useSavedAddresses } from '../../hooks/useSavedAddresses';
import type { SavedAddress } from '../../services/addressesService';
import { apiErrorMessage } from '../../services/errorMessages';

interface DesktopAddressesScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

export function DesktopAddressesScreen({ onNav, onBack }: DesktopAddressesScreenProps) {
  const { addresses, isLoading, error, refetch, save, makeDefault: setDefault, remove } = useSavedAddresses();
  const [editing, setEditing] = useState<SavedAddress | null | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (text: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
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
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-2 font-label-sm text-label-sm text-text-tertiary mb-6">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              Account
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-semibold">Delivery Addresses</span>
          </nav>

          <div className="mb-8 max-w-3xl">
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
              Delivery Addresses
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">
              Keep your home, office, and other saved places up to date for faster checkout and accurate pickup and
              delivery estimates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            <aside className="w-full flex flex-col gap-6 lg:sticky lg:top-24">
              <section className="rounded-xl bg-surface-tint-blue p-space-md flex items-start gap-space-sm">
                <Icon name="home" className="text-[22px] text-primary shrink-0" filled />
                <div className="flex flex-col min-w-0">
                  <p className="font-label-md text-label-md text-text-primary font-semibold">
                    Saved places &amp; neighborhood radius
                  </p>
                  <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                    We use these to estimate pickup distance and local delivery availability.
                  </p>
                </div>
              </section>

              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Neighborhood radius applies to in-store pickup deals near your saved places. Actual delivery
                availability depends on each merchant.
              </p>
            </aside>

            <div className="w-full flex flex-col gap-6">
              {isLoading ? (
                <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex justify-center">
                  <Icon name="progress_activity" className="text-[24px] text-text-tertiary animate-spin" />
                </section>
              ) : error ? (
                <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col items-center text-center gap-space-xs">
                  <p className="font-label-md text-label-md text-text-primary font-semibold">Could not load your addresses</p>
                  <button type="button" onClick={refetch} className="font-label-md text-label-md text-primary font-semibold">
                    Try again
                  </button>
                </section>
              ) : addresses.length === 0 ? (
                <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col items-center text-center gap-space-xs">
                  <div className="w-12 h-12 rounded-full bg-surface-tint-blue flex items-center justify-center">
                    <Icon name="location_off" className="text-[24px] text-text-secondary" />
                  </div>
                  <p className="font-label-md text-label-md text-text-primary font-semibold">No saved addresses</p>
                  <p className="font-body-md text-body-md text-text-secondary max-w-[320px]">
                    Add a place so merchants can estimate delivery and you can check out faster.
                  </p>
                </section>
              ) : (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-surface-container-lowest p-4 shadow-sm border border-border-subtle flex flex-col"
                    >
                      <div className="flex items-start gap-space-sm min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
                          <Icon
                            name={item.label === 'Home' ? 'home' : item.label === 'Office' ? 'work' : 'location_on'}
                            className="text-[18px] text-primary"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-space-2xs">
                            <span className="font-label-md text-label-md text-text-primary font-semibold">
                              {item.label}
                            </span>
                            {item.isDefault && (
                              <span className="px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text text-[10px] font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="font-body-md text-body-md text-text-secondary mt-1 leading-snug">{item.line}</p>
                          <p className="font-caption text-caption text-text-secondary mt-1">
                            {[item.area, item.notes].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-xs mt-space-sm pt-space-xs border-t border-border-subtle">
                        {!item.isDefault && (
                          <button
                            type="button"
                            onClick={() => void makeDefault(item)}
                            className="h-9 px-space-sm rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-canvas active:scale-95 transition-all"
                          >
                            Set default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
                          className="h-9 px-space-sm rounded-lg bg-surface-container-high text-text-secondary font-label-sm text-label-sm font-medium active:scale-95 transition-transform"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeAddress(item)}
                          className="h-9 px-space-sm rounded-lg text-error font-label-sm text-label-sm font-medium active:scale-95 transition-transform ml-auto"
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
                className="w-full h-12 rounded-xl border-2 border-dashed border-border-subtle font-label-md text-label-md text-primary font-semibold flex items-center justify-center gap-2 hover:border-primary/40 hover:bg-surface-tint-blue transition-colors"
              >
                <Icon name="add" className="text-[18px]" />
                <span>Add a new address</span>
              </button>
            </div>
          </div>

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
            <div className="fixed bottom-6 right-6 z-50 bg-surface-tint-blue text-text-primary border border-border-subtle px-space-md py-space-sm rounded-xl shadow-lg font-label-md text-label-md flex items-center gap-space-xs">
              <Icon name="check_circle" filled className="text-[18px] text-badge-discount-text" />
              <span>{toast}</span>
            </div>
          )}
        </div>
      </div>
    </DesktopPage>
  );
}
