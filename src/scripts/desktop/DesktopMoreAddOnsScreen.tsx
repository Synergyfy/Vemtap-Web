import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { hasApiConfig } from '../../services/api/client';
import { useActiveSubscription, useCreditBalance, useCreditCheckout, useCreditPlans } from '../../hooks/business/useSubscription';
import { cheapestCreditPlan, creditBundleLine } from '../subscriptionLive';

interface DesktopMoreAddOnsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
}

/**
 * Dashboard Add-ons & Credits — reached from More → Add-ons & Credits.
 * Account-holder view of one-time add-ons (Boosts, SMS credits, AI credits)
 * inside the business portal chrome. The onboarding add-ons step remains part
 * of the setup journey only.
 */
export function DesktopMoreAddOnsScreen({ onNav }: DesktopMoreAddOnsScreenProps) {
  const [waitlisted, setWaitlisted] = useState(false);
  const live = hasApiConfig();
  const activePlan = useActiveSubscription();
  const balance = useCreditBalance();
  const creditPlans = useCreditPlans();
  const checkout = useCreditCheckout();

  // Live bundles drive the SMS / AI cards; demo keeps the scripted prices.
  const smsPlan = cheapestCreditPlan(creditPlans.data ?? [], 'sms');
  const aiPlan = cheapestCreditPlan(creditPlans.data ?? [], 'ai');
  const smsLine = creditBundleLine(smsPlan, 'sms');
  const aiLine = creditBundleLine(aiPlan, 'ai');
  const buyCredit = (planId?: string) => {
    if (planId) checkout.mutate(planId);
  };

  return (
    <BusinessPortalChrome activeNav="more-addons" onNav={onNav}>
      <div className="w-full py-space-xl space-y-space-lg">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
              More · Account
            </span>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Add-ons &amp; Credits</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Optional one-time power-ups for your business. Add-ons never alter your base Growth subscription.
            </p>
          </div>
          <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-canvas shadow-sm shrink-0">
            <div className="flex flex-col gap-space-2xs">
              <span className="font-caption text-caption text-text-secondary">Credit balances</span>
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-2xs">
                  <Icon name="sms" className="text-primary text-[18px]" />
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    {live ? balance.data?.smsCredits ?? 0 : 0} SMS
                  </span>
                </div>
                <div className="flex items-center gap-space-2xs">
                  <Icon name="auto_awesome" className="text-primary text-[18px]" />
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    {live ? balance.data?.aiCredits ?? 0 : 0} AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {/* Boost campaigns */}
          <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-xl flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="rocket_launch" className="text-[22px]" />
              </div>
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Boost Campaigns</h2>
                <p className="font-caption text-caption text-text-secondary">Promote deals to nearby customers</p>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Push your live deals to the top of customer feeds with paid daily spend.
            </p>
            <div className="flex items-end justify-between pt-space-xs mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Bundles from</span>
                <div className="flex items-baseline gap-space-2xs">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦2,000</span>
                  <span className="font-caption text-caption text-text-secondary">/ bundle</span>
                </div>
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
                type="button"
                onClick={() => onNav('more-marketing')}
              >
                <span>Open Boost Wallet</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </section>

          {/* SMS credits */}
          <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-xl flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center shrink-0">
                <Icon name="sms" className="text-[22px]" />
              </div>
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">SMS Credits</h2>
                <p className="font-caption text-caption text-text-secondary">Customer alerts &amp; campaigns</p>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Send order updates, booking reminders and promotional texts to your customers.
            </p>
            <div className="flex items-end justify-between pt-space-xs mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Bundles from</span>
                <div className="flex items-baseline gap-space-2xs">
                  {live ? (
                    smsLine ? (
                      <>
                        <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                          {smsLine.split(' / ')[0]}
                        </span>
                        <span className="font-caption text-caption text-text-secondary">/ {smsLine.split(' / ')[1]}</span>
                      </>
                    ) : (
                      <span className="font-caption text-caption text-text-secondary">No bundles on sale yet</span>
                    )
                  ) : (
                    <>
                      <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦1,500</span>
                      <span className="font-caption text-caption text-text-secondary">/ 100 Credits</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
                disabled={live && !smsPlan}
                onClick={() => buyCredit(smsPlan?.id)}
              >
                <span>Buy SMS Credits</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </section>

          {/* AI credits */}
          <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-xl flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center shrink-0">
                <Icon name="auto_awesome" className="text-[22px]" />
              </div>
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">AI Credits</h2>
                <p className="font-caption text-caption text-text-secondary">Copy, segments &amp; smart replies</p>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Power deal copy generation, customer segment suggestions and smart message replies.
            </p>
            <div className="flex items-end justify-between pt-space-xs mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Bundles from</span>
                <div className="flex items-baseline gap-space-2xs">
                  {live ? (
                    aiLine ? (
                      <>
                        <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                          {aiLine.split(' / ')[0]}
                        </span>
                        <span className="font-caption text-caption text-text-secondary">/ {aiLine.split(' / ')[1]}</span>
                      </>
                    ) : (
                      <span className="font-caption text-caption text-text-secondary">No bundles on sale yet</span>
                    )
                  ) : (
                    <>
                      <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦1,000</span>
                      <span className="font-caption text-caption text-text-secondary">/ 100 Credits</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
                disabled={live && !aiPlan}
                onClick={() => buyCredit(aiPlan?.id)}
              >
                <span>Buy AI Credits</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </section>

          {/* POS hardware */}
          <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-xl flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center shrink-0">
                <Icon name="point_of_sale" className="text-[22px]" />
              </div>
              <div>
                <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold mb-space-2xs">
                  Coming Soon
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                  POS Terminal &amp; Hardware
                </h2>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              All-in-one smart terminal for contactless NFC card payments and instant QR redemptions.
            </p>
            <div className="flex items-end justify-between pt-space-xs mt-auto">
              <span className="font-caption text-caption text-text-tertiary">Hardware pack · waitlist</span>
              <button
                className="h-11 px-space-md rounded-xl bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs active:scale-[0.98] transition-all"
                type="button"
                disabled={waitlisted}
                onClick={() => setWaitlisted(true)}
              >
                <span>{waitlisted ? 'Added to waitlist' : 'Join waitlist'}</span>
                <Icon name={waitlisted ? 'check_circle' : 'arrow_forward'} className="text-[18px]" />
              </button>
            </div>
          </section>
        </div>

        <div className="rounded-2xl bg-surface-tint-blue p-space-lg flex items-start gap-space-sm">
          <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Add-ons are one-time or pay-as-you-go. They never alter your base{' '}
            <span className="text-text-primary font-semibold">{live ? (activePlan.data?.plan?.name ? `${activePlan.data.plan.name} plan` : 'subscription plan') : '₦5,000/mo Growth subscription'}</span>. Manage your plan
            under{' '}
            <button
              className="text-primary font-semibold hover:underline"
              type="button"
              onClick={() => onNav('more-subscription')}
            >
              Subscription &amp; Billing
            </button>
            .
          </p>
        </div>
      </div>
    </BusinessPortalChrome>
  );
}