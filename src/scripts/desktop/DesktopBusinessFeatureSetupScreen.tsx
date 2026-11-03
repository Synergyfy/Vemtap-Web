import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessFeaturePicker } from '../../components/BusinessFeaturePicker';
import {
  BUSINESS_GOAL_OPTIONS,
  buildFeaturesFromGoals,
  validateFeatureSelection,
  type FeatureId,
  type FeatureState,
} from '../businessFeatures';

interface DesktopBusinessFeatureSetupScreenProps {
  initial: FeatureState;
  recommended: FeatureState;
  onSave: (selected: FeatureState) => { success: boolean; error?: string };
}

type GoalId = 'products' | 'services' | 'growth';

/**
 * Desktop shell for the "What do you want to achieve with VEMTAP?" setup screen.
 * Businesses choose from any or all 3 goal options before entering the dashboard.
 */
export function DesktopBusinessFeatureSetupScreen({
  initial,
  onSave,
}: DesktopBusinessFeatureSetupScreenProps) {
  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>(() => {
    const goals: GoalId[] = [];
    if (initial.products || initial.pos || initial.storefront) goals.push('products');
    if (initial.services || initial.bookings) goals.push('services');
    if (initial.deals || initial.loyalty || initial.cluster) goals.push('growth');
    return goals.length > 0 ? goals : ['products', 'growth'];
  });

  const [selectedFeatures, setSelectedFeatures] = useState<FeatureState>(() =>
    buildFeaturesFromGoals(
      initial.products || initial.services
        ? (['products', 'services', 'growth'].filter((g) => {
            if (g === 'products') return initial.products || initial.pos;
            if (g === 'services') return initial.services || initial.bookings;
            if (g === 'growth') return initial.deals || initial.loyalty || initial.cluster;
            return false;
          }) as GoalId[])
        : ['products', 'growth'],
    ),
  );

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggleGoal = (goalId: GoalId) => {
    setError(null);
    const nextGoals: GoalId[] = selectedGoals.includes(goalId)
      ? selectedGoals.filter((id) => id !== goalId)
      : [...selectedGoals, goalId];

    if (nextGoals.length === 0) {
      setError('Please select at least 1 option to configure your workspace.');
      return;
    }

    setSelectedGoals(nextGoals);
    setSelectedFeatures(buildFeaturesFromGoals(nextGoals));
  };

  const toggleIndividualFeature = (id: FeatureId) => {
    const next: FeatureState = { ...selectedFeatures, [id]: !selectedFeatures[id] };
    const validationError = validateFeatureSelection(next);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSelectedFeatures(next);
  };

  const selectAllThree = () => {
    const allThree: GoalId[] = ['products', 'services', 'growth'];
    setSelectedGoals(allThree);
    setSelectedFeatures(buildFeaturesFromGoals(allThree));
    setError(null);
  };

  const submit = () => {
    const validationError = validateFeatureSelection(selectedFeatures);
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    const result = onSave(selectedFeatures);
    if (!result.success) {
      setError(result.error ?? 'We could not save your dashboard features. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="w-full min-h-screen font-body-md text-on-surface antialiased flex items-start justify-center p-6 lg:p-12 bg-surface-subtle">
      <main className="w-full max-w-4xl py-6 flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-md">
              <Icon name="dashboard" filled className="text-xl" />
            </div>
            <div>
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary block">
                VEMTAP Workspace Setup
              </span>
              <h1 className="font-heading-md text-2xl font-extrabold text-text-primary">
                What do you want to achieve with VEMTAP?
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={selectAllThree}
            className="px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
          >
            Select All 3 Options
          </button>
        </header>

        <div className="bg-surface-canvas rounded-3xl p-6 sm:p-8 shadow-md border border-border-subtle flex flex-col gap-6">
          <p className="text-text-secondary text-sm leading-relaxed">
            Choose from any or all the 3 options. Select the goals that apply to your business, and we’ll tailor
            your dashboard tools and workspace features automatically.
          </p>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 px-4 py-2.5 rounded-xl bg-error-container text-error text-xs font-medium"
            >
              <Icon name="error" className="text-[16px] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 3 Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BUSINESS_GOAL_OPTIONS.map((goal) => {
              const selected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 cursor-pointer relative ${
                    selected
                      ? 'bg-surface-tint-blue/25 border-primary shadow-sm'
                      : 'bg-surface-canvas border-border-subtle hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        selected ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-text-secondary'
                      }`}
                    >
                      <Icon name={goal.icon} className="text-[24px]" />
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        selected
                          ? 'bg-primary border-primary text-white shadow-xs'
                          : 'border-slate-300 bg-surface-canvas text-transparent'
                      }`}
                    >
                      <Icon name="check" className="text-[16px]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                      {goal.badge}
                    </span>
                    <h3 className="font-bold text-[15px] text-text-primary leading-snug">
                      {goal.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed mt-1">
                      {goal.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* System Default Note */}
          <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-text-secondary shrink-0">
              <Icon name="lock" className="text-[20px]" />
            </div>
            <div className="text-xs text-text-secondary leading-normal">
              <strong className="text-text-primary">Always Active on All Accounts: </strong>
              Messages (Chat, SMS, Email) are essential system communication channels and stay permanently enabled.
            </div>
          </div>

          {/* Advanced Fine-Tuning */}
          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <span>{showAdvanced ? 'Hide advanced tool breakdown' : 'Customize individual features'}</span>
              <Icon name={showAdvanced ? 'expand_less' : 'expand_more'} className="text-[18px]" />
            </button>

            {showAdvanced && (
              <div className="pt-4">
                <BusinessFeaturePicker
                  selected={selectedFeatures}
                  onToggle={toggleIndividualFeature}
                  busy={busy}
                />
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="h-12 px-8 rounded-xl bg-primary-container text-on-primary font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-70 cursor-pointer"
            >
              <span>{busy ? 'Setting up…' : 'Continue to Dashboard'}</span>
              {!busy && <Icon name="arrow_forward" className="text-[18px]" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
