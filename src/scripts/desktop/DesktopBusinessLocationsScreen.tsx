import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';

interface DesktopBusinessLocationsScreenProps {
  onBack: () => void;
  onAddBranch: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

interface OnboardingBranch {
  id: string;
  name: string;
  city: string;
  address: string;
  hours: string;
  phone: string;
  isPrimary: boolean;
}

const SEED_BRANCHES: OnboardingBranch[] = [
  {
    id: 'b1',
    name: 'Maitama Flagship',
    city: 'Abuja, FCT',
    address: '14 Aguiyi Ironsi Street, Maitama',
    hours: 'Mon–Sun • 10:00 AM – 11:30 PM',
    phone: '+234 803 900 2210',
    isPrimary: true,
  },
];

export function DesktopBusinessLocationsScreen({ onBack, onAddBranch, onNext, onSaveDraft }: DesktopBusinessLocationsScreenProps) {
  const [branches] = useState<OnboardingBranch[]>(SEED_BRANCHES);

  return (
    <div className="w-full max-w-3xl mx-auto px-8 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="w-10 h-10 rounded-xl bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary transition-colors cursor-pointer">
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <span className="font-label-sm text-caption text-primary font-semibold uppercase tracking-wider">Step 4 of 8</span>
        </div>
        <h1 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">Branch Locations</h1>
        <p className="font-body-md text-body-md text-text-secondary">Add your business branches. You can always add or edit more later in the Operations Hub.</p>
      </div>

      <div className="flex flex-col gap-4">
        {branches.map((b) => (
          <div key={b.id} className="bg-surface-canvas rounded-xl p-5 shadow-sm border border-surface-container flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                <Icon name="storefront" className="text-[22px]" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading-sm text-label-md font-semibold text-text-primary">{b.name}</span>
                  {b.isPrimary && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-caption font-semibold">Primary</span>
                  )}
                </div>
                <span className="font-label-sm text-caption text-text-secondary">{b.address}, {b.city}</span>
                <span className="font-caption text-caption text-text-tertiary">{b.hours}</span>
                <span className="font-caption text-caption text-text-tertiary">{b.phone}</span>
              </div>
            </div>
            <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-subtle cursor-pointer transition-colors">
              <Icon name="more_vert" className="text-[18px]" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddBranch}
          className="w-full py-5 rounded-xl border-2 border-dashed border-border-subtle hover:border-primary hover:bg-surface-tint-blue/40 transition-colors cursor-pointer flex items-center justify-center gap-2 text-primary font-label-md text-label-md font-semibold"
        >
          <Icon name="add" className="text-[20px]" />
          <span>Add Another Branch</span>
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-surface-container">
        <button type="button" onClick={onSaveDraft} className="h-11 px-5 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-secondary font-button-secondary text-button-secondary transition-colors cursor-pointer">
          Save Draft
        </button>
        <button
          type="button"
          onClick={onNext}
          className="h-11 px-6 rounded-xl bg-primary-container text-on-primary shadow-[0_4px_14px_rgba(6,108,244,0.28)] hover:bg-primary active:scale-95 font-button-primary text-button-primary transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Continue to Catalogue</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
