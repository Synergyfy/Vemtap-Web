import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessMessagesEmailScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
}

/**
 * Email channel of the Messages section — flow only for now.
 * The visual design will be supplied later; this screen wires the route and the
 * nested Messages side menu so navigation works end to end.
 */
export function DesktopBusinessMessagesEmailScreen({ onNav }: DesktopBusinessMessagesEmailScreenProps) {
  return (
    <BusinessPortalChrome activeNav="messages-email" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-xl space-y-space-lg">
          <div className="flex flex-col gap-space-2xs">
            <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
              Messages · Email
            </span>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Email</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed max-w-2xl">
              Send email campaigns and branded one-to-one emails to customers. Design coming soon — the flow below
              outlines the steps this channel will follow.
            </p>
          </div>

          <div className="rounded-2xl bg-surface-canvas shadow-sm p-space-xl">
            <h2 className="font-heading-sm text-heading-sm text-text-primary mb-space-md">Planned flow</h2>
            <ol className="flex flex-col gap-space-md">
              {[
                { title: 'Compose email', body: 'Start from a blank email or a branded template with your logo and colours.' },
                { title: 'Select recipients', body: 'Choose customer segments, individual customers, or import a list.' },
                { title: 'Review & send', body: 'Preview on desktop and mobile, then send now or schedule.' },
                { title: 'Track engagement', body: 'Opens, clicks and replies surface back in the conversation inbox.' },
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
              Your sending domain and signature are configured once under{' '}
              <span className="text-text-primary font-semibold">More → Business Settings</span>.
            </p>
          </div>
        </div>
      </div>
    </BusinessPortalChrome>
  );
}