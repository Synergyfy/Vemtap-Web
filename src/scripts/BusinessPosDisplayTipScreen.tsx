import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface BusinessPosDisplayTipScreenProps {
  onBack: () => void;
  onProceed: () => void;
}

const BASE_SUBTOTAL = 27628;

const TIP_OPTIONS: { percent: number; label: string; amount: number; icon: string; pop?: boolean }[] = [
  { percent: 0, label: 'No Tip', amount: 0, icon: 'do_not_disturb_on' },
  { percent: 10, label: '10% · Good', amount: 2760, icon: 'sentiment_satisfied' },
  { percent: 15, label: '15% · Great', amount: 4140, icon: 'star', pop: true },
  { percent: 20, label: '20% · Exceptional', amount: 5525, icon: 'sentiment_very_satisfied' },
];

const TAGS = [
  { label: 'Delicious Food', emoji: '🥩', defaultOn: true },
  { label: 'Super Fast Service', emoji: '⚡', defaultOn: true },
  { label: 'Great Ambiance', emoji: '✨', defaultOn: false },
  { label: 'Friendly Staff', emoji: '😊', defaultOn: false },
  { label: 'Clean Space', emoji: '🌿', defaultOn: false },
];

const formatNaira = (value: number) => `₦${value.toLocaleString('en-NG')}`;

export function BusinessPosDisplayTipScreen({ onBack, onProceed }: BusinessPosDisplayTipScreenProps) {
  const [tip, setTip] = useState<{ percent: number | null; amount: number }>({ percent: 15, amount: 4140 });
  const [rating, setRating] = useState(5);
  const [activeTags, setActiveTags] = useState<string[]>(
    TAGS.filter((tag) => tag.defaultOn).map((tag) => tag.label),
  );

  const total = BASE_SUBTOTAL + tip.amount;

  const toggleTag = (label: string) => {
    setActiveTags((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  };

  return (
    <AppScreen>
      <ScreenHeader title="Tip & Rating" onBack={onBack} />

      <div className="flex flex-col w-full px-margin pb-space-2xl gap-space-sm pt-space-xs">
        {/* Service recognition */}
        <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm space-y-space-2xs">
          <div className="flex items-center gap-space-xs">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center shadow-sm">
                <Icon name="face_3" className="text-primary text-[22px]" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <Icon name="favorite" className="text-[11px]" filled />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-space-2xs flex-wrap">
                <span className="font-label-sm text-label-sm text-text-primary truncate font-semibold">Sunday M.</span>
                <span className="font-caption text-caption text-text-secondary">&amp; Kitchen Crew</span>
              </div>
              <p className="font-caption text-caption text-text-secondary">Order #TK-108 · Table 04 (Dine-in)</p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-caption text-caption text-text-tertiary block">Subtotal</span>
              <span className="font-label-sm text-label-sm text-text-primary">₦27,628</span>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl px-space-xs py-space-2xs flex items-center gap-space-2xs">
            <Icon name="volunteer_activism" className="text-[16px] text-badge-discount-text shrink-0" />
            <p className="font-caption text-caption text-text-secondary leading-tight">
              100% of staff tips go directly to Sunday and the Abuja culinary crew.
            </p>
          </div>
        </div>

        {/* Tip selection */}
        <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm space-y-space-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-label-md text-label-md text-text-primary font-semibold">Add a Tip</h2>
              <p className="font-caption text-caption text-text-secondary">Optional gesture for great service</p>
            </div>
            <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-caption text-caption">
              ₦ Naira
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-xs">
            {TIP_OPTIONS.map((option) => {
              const active = tip.percent === option.percent;
              return (
                <button
                  className={`text-left p-space-xs rounded-xl transition-all duration-150 flex flex-col justify-between min-h-[70px] ${
                    active ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-low'
                  }`}
                  key={option.label}
                  type="button"
                  onClick={() => setTip({ percent: option.percent, amount: option.amount })}
                >
                  <div className="flex items-center justify-between w-full gap-space-2xs">
                    <span
                      className={`font-label-sm text-label-sm truncate ${active ? 'text-on-primary' : 'text-text-secondary'}`}
                    >
                      {option.label}
                    </span>
                    {option.pop && active ? (
                      <span className="px-space-2xs py-0.5 rounded-full bg-on-primary/20 text-on-primary font-caption text-caption flex items-center gap-0.5 shrink-0">
                        <Icon name="star" filled className="text-[11px]" />
                        Pop
                      </span>
                    ) : (
                      <Icon
                        name={option.icon}
                        className={`text-[16px] shrink-0 ${
                          active ? 'text-on-primary' : option.percent === 20 ? 'text-badge-discount-text' : 'text-text-tertiary'
                        }`}
                      />
                    )}
                  </div>
                  <span className={`font-label-md text-label-md ${active ? 'text-on-primary' : 'text-text-primary'}`}>
                    {formatNaira(option.amount)}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            className="w-full py-space-xs px-space-sm rounded-xl bg-surface-container-low text-text-primary flex items-center justify-between transition-colors"
            type="button"
            onClick={() => setTip({ percent: null, amount: 3000 })}
          >
            <div className="flex items-center gap-space-2xs">
              <Icon name="dialpad" className="text-[16px] text-primary" />
              <span className="font-label-sm text-label-sm">Enter Custom Amount</span>
            </div>
            <Icon name="chevron_right" className="text-[16px] text-text-tertiary" />
          </button>

          {/* Bill breakdown */}
          <div className="bg-surface-tint-blue rounded-xl p-space-xs space-y-0.5">
            <div className="flex justify-between items-center text-text-secondary font-label-sm text-label-sm">
              <span>Meal Subtotal</span>
              <span>₦27,628.00</span>
            </div>
            <div className="flex justify-between items-center font-label-sm text-label-sm text-primary">
              <span>{tip.amount === 0 ? 'Tip Amount (Skipped)' : `Tip Amount (${tip.percent === null ? 'Custom' : `${tip.percent}%`})`}</span>
              <span>{tip.amount === 0 ? '₦0.00' : `+${formatNaira(tip.amount)}.00`}</span>
            </div>
            <div className="pt-space-2xs flex justify-between items-baseline text-text-primary">
              <span className="font-label-md text-label-md font-semibold">Total Payable</span>
              <span className="font-heading-sm text-heading-sm text-primary font-bold">{formatNaira(total)}.00</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm space-y-space-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-label-md text-label-md text-text-primary font-semibold">Rate Your Visit</h2>
              <p className="font-caption text-caption text-text-secondary">Urban Grill &amp; Bistro · Wuse II</p>
            </div>
            <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-1">
              <Icon name="star" filled className="text-[16px]" />
              <span>{rating.toFixed(1)}</span>
            </span>
          </div>
          <div className="flex items-center justify-center gap-space-sm py-space-2xs">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                aria-label={`${score} star${score > 1 ? 's' : ''}`}
                className={`p-0.5 transition-transform hover:scale-110 ${
                  score <= rating ? 'text-tertiary-container' : 'text-outline-variant'
                }`}
                key={score}
                type="button"
                onClick={() => setRating(score)}
              >
                <Icon name="star" filled={score <= rating} className="text-[30px]" />
              </button>
            ))}
          </div>
          <div>
            <p className="font-caption text-caption text-text-secondary mb-space-2xs">What stood out most?</p>
            <div className="flex flex-wrap gap-space-2xs">
              {TAGS.map((tag) => {
                const active = activeTags.includes(tag.label);
                return (
                  <button
                    className={`px-space-xs py-1.5 rounded-full font-caption text-caption transition-colors flex items-center gap-1 ${
                      active ? 'bg-surface-tint-blue text-primary shadow-sm' : 'bg-surface-container-low text-text-secondary'
                    }`}
                    key={tag.label}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                  >
                    <span>{tag.label}</span>
                    <span>{tag.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loyalty bonus */}
        <div className="bg-badge-discount-bg rounded-2xl p-space-xs flex items-center gap-space-xs">
          <div className="w-9 h-9 rounded-xl bg-badge-discount-text text-on-primary flex items-center justify-center shrink-0">
            <Icon name="stars" className="text-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-sm text-label-sm text-text-primary">+50 Bonus VEMTAP Points</p>
            <p className="font-caption text-caption text-badge-discount-text leading-tight">
              Reward unlocked for sharing your Abuja dining experience!
            </p>
          </div>
          <Icon name="verified" className="text-[16px] text-badge-discount-text shrink-0" />
        </div>

        {/* Dish showcase */}
        <div className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm overflow-hidden flex items-center gap-space-xs">
          <div className="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
            <Icon name="restaurant" className="text-primary text-[24px]" />
          </div>
          <div className="flex-1 min-w-0 pr-space-xs">
            <span className="px-space-2xs py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption inline-block mb-0.5">
              Kitchen Special
            </span>
            <h3 className="font-label-sm text-label-sm text-text-primary truncate">Smoked Asun Ribeye &amp; Jollof</h3>
            <p className="font-caption text-caption text-text-secondary">Signature wood-fired perfection</p>
          </div>
          <Icon name="thumb_up" className="text-[18px] text-badge-discount-text pr-space-xs shrink-0" />
        </div>

        {/* Actions */}
        <div className="space-y-space-2xs pt-space-xs">
          <button
            className="w-full h-12 rounded-2xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-transform"
            type="button"
            onClick={onProceed}
          >
            <span>Confirm &amp; Proceed to Pay ({formatNaira(total)})</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <button
            className="w-full h-11 rounded-xl text-text-secondary font-label-sm text-label-sm hover:text-text-primary flex items-center justify-center gap-space-2xs transition-colors"
            type="button"
            onClick={onProceed}
          >
            <span>Skip &amp; Pay Subtotal (₦27,628)</span>
          </button>
          <div className="flex items-center justify-center gap-space-2xs text-text-tertiary pt-space-2xs">
            <Icon name="lock" className="text-[13px]" />
            <span className="font-caption text-caption">VEMTAP Verified CFD Terminal #01 · End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
