import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessMessagesSmsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
}

/**
 * SMS channel of the Messages section — flow only for now.
 * The visual design will be supplied later; this screen wires the route and the
 * nested Messages side menu so navigation works end to end.
 */
export function DesktopBusinessMessagesSmsScreen({ onNav }: DesktopBusinessMessagesSmsScreenProps) {
  return (
    <BusinessPortalChrome activeNav="messages-sms" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-xl space-y-space-lg">
          <div className="flex flex-col gap-space-2xs">
            <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
              Messages · SMS
            </span>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">SMS</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed max-w-2xl">
              Send SMS campaigns and one-to-one texts to customers. Design coming soon — the flow below outlines the
              steps this channel will follow.
            </p>
          </div>

          <div className="rounded-2xl bg-surface-canvas shadow-sm p-space-xl">
            <h2 className="font-heading-sm text-heading-sm text-text-primary mb-space-md">Planned flow</h2>
            <ol className="flex flex-col gap-space-md">
              {[
                { title: 'Compose message', body: 'Write the SMS or pick a template, with character and segment count.' },
                { title: 'Select recipients', body: 'Choose customer segments, individual customers, or import a list.' },
                { title: 'Review & send', body: 'Confirm sender ID and credits, then send now or schedule.' },
                { title: 'Track replies', body: 'Replies land back in the shared conversation inbox.' },
              ].map((step, index) => (
                <li key={step.title} className="flex items-start gap-space-sm">
                  <span className="w-7 h-7 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 font-label-sm text-label-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">{step.title}</span>
                    <span className="font-caption text-caption text-text-secondary">{step.body}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-surface-subtle p-space-lg flex items-start gap-space-sm">
            <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              SMS credits are managed under <span className="text-text-primary font-semibold">More → Add-ons &amp; Credits</span>.
            </p>
          </div>
        </div>
      </div>
    </BusinessPortalChrome>
  );
}