import { Icon } from '../ui/Icon';

export interface HowItWorksProps {
  steps: string[];
  disclaimer?: string;
  title?: string;
}

/** Numbered "How it works" list shared by both referral dashboards. */
export function HowItWorks({ steps, disclaimer, title = 'How It Works' }: HowItWorksProps) {
  return (
    <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-sm">
      <div className="flex items-center gap-space-xs">
        <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
          <Icon name="menu_book" className="text-[18px]" />
        </span>
        <h3 className="font-label-md text-label-md text-text-primary font-semibold">{title}</h3>
      </div>

      <ol className="flex flex-col gap-space-xs">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-space-xs">
            <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0 mt-0.5">
              {index + 1}
            </span>
            <span className="font-body-md text-body-md text-text-secondary leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      {disclaimer && (
        <div className="rounded-xl bg-surface-tint-blue border border-border-active p-space-xs flex items-start gap-space-2xs">
          <Icon name="info" className="text-[16px] text-primary shrink-0 mt-0.5" />
          <p className="font-caption text-caption text-text-secondary leading-relaxed">{disclaimer}</p>
        </div>
      )}
    </section>
  );
}
