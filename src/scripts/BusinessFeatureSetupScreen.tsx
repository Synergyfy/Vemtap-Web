import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessFeaturePicker } from '../components/BusinessFeaturePicker';
import {
  BUSINESS_GOAL_OPTIONS,
  buildFeaturesFromGoals,
  validateFeatureSelection,
  type FeatureId,
  type FeatureState,
} from './businessFeatures';

interface BusinessFeatureSetupScreenProps {
  /** Current saved selection, used to seed the pickers on first entry. */
  initial: FeatureState;
  recommended: FeatureState;
  /** Validates, persists and completes the initial setup. */
  onSave: (selected: FeatureState) => { success: boolean; error?: string };
}

type GoalId = 'products' | 'services' | 'growth';

/**
 * First-run "What do you want to achieve with VEMTAP?" — shown once,
 * immediately before a business owner enters the dashboard for the first time.
 * Users choose from any or all 3 goal options to tailor their initial tools.
 */
export function BusinessFeatureSetupScreen({ initial, onSave }: BusinessFeatureSetupScreenProps) {
  // Determine initial selected goals based on initial feature state
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
      setError('Please choose at least 1 goal to configure your business workspace.');
      return;
    }

    setSelectedGoals(nextGoals);
    // Recompute feature flags based on the chosen goals
    const nextFeatures = buildFeaturesFromGoals(nextGoals);
    setSelectedFeatures(nextFeatures);
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
    // On success router advances to business-overview
  };

  return (
    <div className="biz-flow">
      <AppScreen>
        <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
          <div className="h-16 px-margin flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm shrink-0">
                <Icon name="dashboard" filled className="text-[20px]" />
              </div>
              <span className="font-label-md text-label-md text-text-primary font-bold tracking-tight">
                VEMTAP Setup
              </span>
            </div>
            <button
              type="button"
              onClick={selectAllThree}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Select All 3
            </button>
          </div>
        </header>

        <main className="flex flex-col w-full px-margin pt-space-md pb-8 gap-space-md">
          {/* Headline Questions */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Step 1 of 1 • Workspace Tailoring
            </span>
            <h1 className="font-heading-md text-2xl font-extrabold text-text-primary tracking-tight">
              What do you want to achieve with VEMTAP?
            </h1>
            <p className="font-body-md text-sm text-text-secondary leading-relaxed">
              Choose from any or all the 3 options below. We’ll automatically activate the right tools for your business.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-space-2xs px-space-sm py-2 rounded-lg bg-error-container text-error font-label-sm text-label-sm"
            >
              <Icon name="error" className="text-[16px] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 3 Goal Options */}
          <div className="flex flex-col gap-3">
            {BUSINESS_GOAL_OPTIONS.map((goal) => {
              const selected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative ${
                    selected
                      ? 'bg-surface-tint-blue/30 border-primary shadow-sm'
                      : 'bg-surface-canvas border-border-subtle hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      selected ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-text-secondary'
                    }`}
                  >
                    <Icon name={goal.icon} className="text-[22px]" />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-[14px] text-text-primary leading-tight">
                        {goal.title}
                      </span>
                    </div>
                    <p className="text-[12px] text-text-secondary leading-normal">
                      {goal.subtitle}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-container text-text-tertiary">
                        {goal.badge}
                      </span>
                    </div>
                  </div>

                  {/* Checkbox indicator */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                      selected
                        ? 'bg-primary border-primary text-white shadow-xs'
                        : 'border-slate-300 bg-surface-canvas text-transparent'
                    }`}
                  >
                    <Icon name="check" className="text-[16px]" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* System Default Note */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-text-secondary shrink-0">
              <Icon name="lock" className="text-[18px]" />
            </div>
            <div className="min-w-0 text-[11px] text-text-secondary leading-tight">
              <strong className="text-text-primary block mb-0.5">Always Included: Messages (Chat, SMS, Email)</strong>
              Customer communication channels stay active by default on every account.
            </div>
          </div>

          {/* Advanced Fine-Tuning Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              <span>{showAdvanced ? 'Hide feature breakdown' : 'Customize individual features'}</span>
              <Icon name={showAdvanced ? 'expand_less' : 'expand_more'} className="text-[18px]" />
            </button>

            {showAdvanced && (
              <div className="pt-2 animate-in fade-in duration-200">
                <BusinessFeaturePicker
                  selected={selectedFeatures}
                  onToggle={toggleIndividualFeature}
                  busy={busy}
                />
              </div>
            )}
          </div>
        </main>

        {/* Bottom CTA */}
        <div className="sticky bottom-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin py-3 pb-safe flex flex-col gap-2 shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.08)]">
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-md active:scale-[0.98] transition-transform disabled:opacity-70"
          >
            <span>{busy ? 'Configuring…' : 'Continue to Dashboard'}</span>
            {!busy && <Icon name="arrow_forward" className="text-[20px]" />}
          </button>
        </div>
      </AppScreen>
    </div>
  );
}
