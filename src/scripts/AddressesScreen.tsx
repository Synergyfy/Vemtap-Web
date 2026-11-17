import { useEffect, useRef, useState } from 'react';
import { AddressEditor } from '../components/AddressEditor';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useSavedAddresses } from '../hooks/useSavedAddresses';
import type { AddressInput } from '../services/addressesService';
import { apiErrorMessage } from '../services/errorMessages';

interface AddressesScreenProps {
  onBack: () => void;
}

export function AddressesScreen({ onBack }: AddressesScreenProps) {
  const { addresses, isLoading, error, save, makeDefault: setDefault, remove } = useSavedAddresses();
  /** `'new'` while adding, an address id while editing it. */
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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

  const run = async (action: () => Promise<void>, success: string, failure: string) => {
    setBusy(true);
    try {
      await action();
      showToast(success);
      return true;
    } catch (err) {
      showToast(apiErrorMessage(err, failure));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const makeDefault = (id: string) => {
    const found = addresses.find((item) => item.id === id);
    void run(() => setDefault(id), (found?.label ?? 'Address') + ' set as default', "Couldn't change your default address");
  };

  const removeAddress = (id: string) => {
    const found = addresses.find((item) => item.id === id);
    void run(() => remove(id), (found?.label ?? 'Address') + ' removed', "Couldn't remove this address");
  };

  const saveAddress = async (input: AddressInput, id?: string) => {
    const ok = await run(() => save(input, id), id ? 'Address updated' : 'Address saved', "Couldn't save this address");
    if (ok) setEditing(null);
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
          <p className="text-body-md font-body-md text-text-secondary text-center">Loading your addresses…</p>
        ) : error != null && addresses.length === 0 ? (
          <p className="text-body-md font-body-md text-error text-center">Couldn&apos;t load your addresses.</p>
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
                {editing === item.id ? (
                  <AddressEditor
                    initial={item}
                    busy={busy}
                    onCancel={() => setEditing(null)}
                    onSave={(input) => void saveAddress(input, item.id)}
                  />
                ) : (
                <>
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
                      {(item.area || item.notes) && (
                        <p className="text-caption font-caption text-text-secondary mt-0.5">
                          {[item.area, item.notes].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs mt-space-sm pt-space-xs border-t border-border-subtle">
                  {!item.isDefault && (
                    <button
                      type="button"
                      onClick={() => makeDefault(item.id)}
                      disabled={busy}
                      className="h-9 px-space-sm rounded-lg bg-surface-tint-blue text-primary text-label-sm font-label-sm font-semibold active:scale-95 transition-transform disabled:opacity-60"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(item.id)}
                    className="h-9 px-space-sm rounded-lg bg-surface-container text-text-secondary text-label-sm font-label-sm font-medium active:scale-95 transition-transform"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAddress(item.id)}
                    disabled={busy}
                    className="h-9 px-space-sm rounded-lg text-error text-label-sm font-label-sm font-medium active:scale-95 transition-transform ml-auto disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
                </>
                )}
              </div>
            ))}
          </section>
        )}

        {editing === 'new' ? (
          <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-border-subtle">
            <AddressEditor busy={busy} onCancel={() => setEditing(null)} onSave={(input) => void saveAddress(input)} />
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="w-full h-11 rounded-xl border-2 border-dashed border-border-subtle text-label-md font-label-md text-primary font-semibold flex items-center justify-center gap-2 hover:border-primary/40 hover:bg-surface-tint-blue transition-colors"
          >
            <Icon name="add" className="text-[18px]" />
            <span>Add a new address</span>
          </button>
        )}

        <p className="text-caption font-caption text-text-secondary px-space-2xs">
          Neighborhood radius applies to in-store pickup deals near your saved places. Actual delivery
          availability depends on each merchant.
        </p>
      </main>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
