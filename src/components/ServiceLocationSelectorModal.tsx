import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon';
import { SERVICE_LOCATIONS, type ServiceLocation } from '../scripts/serviceStudioShared';

interface ServiceLocationSelectorModalProps {
  isOpen: boolean;
  selectedLocations: string[];
  /**
   * Live: the business's own branches to pick from. When omitted (or empty),
   * the demo-only sample list is used so the dev build without an API stays
   * usable; real deployments always pass their branches.
   */
  locations?: ServiceLocation[];
  onSave: (locations: string[]) => void;
  onClose: () => void;
}

export function ServiceLocationSelectorModal({
  isOpen,
  selectedLocations,
  locations,
  onSave,
  onClose,
}: ServiceLocationSelectorModalProps) {
  const [selected, setSelected] = useState<string[]>(selectedLocations);

  useEffect(() => {
    setSelected(selectedLocations);
  }, [selectedLocations, isOpen]);

  if (!isOpen) return null;

  const availableLocations =
    locations && locations.length > 0 ? locations : SERVICE_LOCATIONS;
  const eligibleLocations = availableLocations.filter((loc) => loc.eligible);
  const allEligibleSelected =
    eligibleLocations.length > 0 &&
    eligibleLocations.every((loc) => selected.includes(loc.id));

  const toggleLocation = (location: ServiceLocation) => {
    if (!location.eligible) return;
    setSelected((prev) =>
      prev.includes(location.id)
        ? prev.filter((id) => id !== location.id)
        : [...prev, location.id]
    );
  };

  const handleSelectAll = () => {
    if (allEligibleSelected) {
      // Keep at least the first eligible location so selection is never empty
      const firstId = eligibleLocations[0]?.id;
      setSelected(firstId ? [firstId] : []);
    } else {
      setSelected(eligibleLocations.map((loc) => loc.id));
    }
  };

  const handleSave = () => {
    if (selected.length === 0) return;
    onSave(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-surface-canvas rounded-2xl shadow-2xl border border-outline/10 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-selector-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline/10 flex items-center justify-between bg-surface-subtle/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <Icon name="storefront" className="text-[22px]" />
            </div>
            <div>
              <h2 id="location-selector-title" className="font-heading-sm text-heading-sm text-text-primary">
                Assign Locations &amp; Branches
              </h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Select which branches provide and host this service.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors"
            aria-label="Close modal"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1">
            <span className="font-label-sm text-label-sm font-semibold text-text-primary">
              Available Outlets ({selected.length} of {eligibleLocations.length} active)
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="font-caption text-caption font-semibold text-primary hover:underline transition-colors"
            >
              {allEligibleSelected ? 'Deselect All' : 'Select All Eligible'}
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {availableLocations.map((loc) => {
              const isSelected = selected.includes(loc.id);
              return (
                <div
                  key={loc.id}
                  onClick={() => toggleLocation(loc)}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    !loc.eligible
                      ? 'bg-surface-subtle/40 border-outline/10 opacity-70 cursor-not-allowed'
                      : isSelected
                      ? 'bg-surface-tint-blue/30 border-primary ring-1 ring-primary shadow-xs cursor-pointer'
                      : 'bg-surface-canvas border-outline/20 hover:bg-surface-subtle cursor-pointer'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!loc.eligible}
                      onChange={() => {}} // Controlled by row click
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        {loc.name}
                      </span>
                      {loc.badge && (
                        <span className="font-caption text-caption px-2 py-0.5 rounded-full font-medium bg-surface-container text-primary">
                          {loc.badge}
                        </span>
                      )}
                      {!loc.eligible && (
                        <span className="font-caption text-caption px-2 py-0.5 rounded-full font-semibold bg-error-container/20 text-error">
                          Ineligible
                        </span>
                      )}
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      {loc.address}
                    </p>
                    {loc.note && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-text-tertiary">
                        <Icon name="info" className="text-[14px] text-amber-500" />
                        <span className="font-caption text-caption text-amber-600 dark:text-amber-400">
                          {loc.note}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-surface-subtle rounded-xl flex items-start gap-2.5 border border-outline/10">
            <Icon name="verified_user" className="text-primary text-[18px] shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-snug">
              Only verified physical locations with active equipment and room inspection can fulfill treatments.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline/10 bg-surface-subtle/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-text-secondary font-button-secondary text-button-secondary hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selected.length === 0}
            className={`px-5 py-2.5 rounded-xl font-button-primary text-button-primary font-semibold flex items-center gap-2 transition-all ${
              selected.length > 0
                ? 'bg-primary text-on-primary shadow-sm hover:bg-primary-container active:scale-98'
                : 'bg-surface-container text-text-tertiary cursor-not-allowed'
            }`}
          >
            <Icon name="check" className="text-[18px]" />
            <span>Save Changes ({selected.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
