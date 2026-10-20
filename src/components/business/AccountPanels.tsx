import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { RadioCard, SettingsSection, SwitchRow, TextField } from './FormPrimitives';
import {
  isPurchasable,
  planPrice,
  subscriptionService,
  type BillingPeriod,
  type Plan,
} from '../../services/subscriptionService';
import { supportService, type TicketPriority } from '../../services/supportService';
import { notificationService, type NotificationPreferencePayload } from '../../services/notificationService';
import { apiErrorMessage } from '../../services/errorMessages';
import { formatNaira, formatRelativeTime } from '../../utils/format';

const naira = (value?: number | string | null) => formatNaira(Number(value) || 0);
const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const accountKeys = {
  subscription: ['subscription'] as const,
  active: ['subscription', 'active'] as const,
  credits: ['credits'] as const,
  notifications: ['business-notifications'] as const,
  support: ['support'] as const,
};

/** A Paystack checkout opened in a new tab, with a "check payment" step. */
function PendingPayment({ label, checking, onCheck, notice }: { label: string; checking: boolean; onCheck: () => void; notice?: string | null }) {
  return (
    <div className="rounded-lg bg-surface-tint-blue p-space-sm flex flex-col gap-space-xs">
      <div className="flex flex-wrap items-center justify-between gap-space-xs">
        <span className="font-caption text-caption text-primary">{label}</span>
        <button type="button" disabled={checking} onClick={onCheck} className="h-9 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm">
          {checking ? 'Checking…' : "I've paid"}
        </button>
      </div>
      {notice ? <span className="font-caption text-caption text-text-secondary">{notice}</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subscription & billing
// ---------------------------------------------------------------------------

const PERIODS: { key: BillingPeriod; label: string }[] = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

function PlanCard({ plan, period, current, onChoose, busy }: { plan: Plan; period: BillingPeriod; current: boolean; onChoose: () => void; busy: boolean }) {
  const price = planPrice(plan, period);
  const features = (plan.features ?? []).filter((f): f is string => typeof f === 'string');
  const purchasable = isPurchasable(plan);
  return (
    <div className={`rounded-xl bg-surface-canvas border p-space-md flex flex-col gap-space-sm ${current ? 'border-primary' : 'border-border-subtle'}`}>
      <div className="flex items-center justify-between gap-space-xs">
        <span className="font-heading-sm text-heading-sm text-text-primary">{plan.name}</span>
        {current ? (
          <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-[11px]">Current</span>
        ) : plan.isPopular ? (
          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[11px]">Popular</span>
        ) : null}
      </div>
      <span className="font-heading-md text-heading-md text-text-primary font-semibold">
        {plan.isFree ? 'Free' : naira(price)}
        {!plan.isFree ? <span className="font-caption text-caption text-text-secondary font-normal"> / {period.replace('ly', '')}</span> : null}
      </span>
      <ul className="flex flex-col gap-1 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-1 font-caption text-caption text-text-secondary">
            <Icon name="check" className="text-[16px] text-badge-discount-text" />
            {feature}
          </li>
        ))}
      </ul>
      {current ? null : (
        <button
          type="button"
          disabled={busy || !purchasable}
          onClick={onChoose}
          className="h-10 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
        >
          {!purchasable ? 'Not available yet' : plan.isFree ? 'Switch to free' : `Choose ${plan.name}`}
        </button>
      )}
    </div>
  );
}

/** Live subscription: current plan, plan picker with Paystack checkout, card and billing history. */
export function SubscriptionPanel() {
  const queryClient = useQueryClient();
  const active = useQuery({ queryKey: accountKeys.active, queryFn: subscriptionService.active });
  const plans = useQuery({ queryKey: [...accountKeys.subscription, 'plans'], queryFn: subscriptionService.plans, staleTime: 10 * 60_000 });
  const history = useQuery({ queryKey: [...accountKeys.subscription, 'history'], queryFn: subscriptionService.billingHistory });
  const card = useQuery({ queryKey: [...accountKeys.subscription, 'card'], queryFn: subscriptionService.paymentMethod });
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const [chosen, setChosen] = useState<Plan | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: accountKeys.subscription });

  const preview = useQuery({
    queryKey: [...accountKeys.subscription, 'preview', chosen?.id, period],
    queryFn: () => subscriptionService.pricePreview(chosen!.id, period),
    enabled: Boolean(chosen && !chosen.isFree),
  });
  const checkout = useMutation({
    mutationFn: () => subscriptionService.initializePayment({ planId: chosen!.id, billingPeriod: period, callbackUrl: window.location.href }),
    onSuccess: (res) => {
      setPending(res.reference);
      setNotice(null);
      if (res.authorization_url) window.open(res.authorization_url, '_blank', 'noopener');
    },
  });
  const verify = useMutation({
    mutationFn: (reference: string) => subscriptionService.verifyPayment(reference),
    onSuccess: (res) => {
      if (res.success) {
        setPending(null);
        setChosen(null);
        setNotice('Payment received — your plan updates in a moment.');
        void refresh();
      } else setNotice('We have not seen the payment yet. Finish it in the Paystack tab, then check again.');
    },
  });
  const trial = useMutation({
    mutationFn: () => subscriptionService.startTrial(chosen!.id, period),
    onSuccess: () => {
      setChosen(null);
      void refresh();
    },
  });
  const cancel = useMutation({
    mutationFn: subscriptionService.cancel,
    onSuccess: () => {
      setConfirmCancel(false);
      void refresh();
    },
  });

  const sub = active.data;
  const trialEligible = Boolean(sub?.trialEligible) && Boolean(chosen?.trialDurationDays);
  const actionError = checkout.error ?? verify.error ?? trial.error;

  return (
    <div className="flex flex-col gap-space-lg max-w-5xl">
      {active.isLoading ? (
        <LoadingRows rows={1} label="Loading your plan" />
      ) : active.isError ? (
        <ErrorState title="Could not load your plan" error={active.error} onRetry={() => active.refetch()} />
      ) : (
        <div className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-text-secondary">Current plan</span>
            <span className="font-heading-md text-heading-md text-text-primary font-semibold">{sub?.plan?.name ?? 'No plan'}</span>
            <span className="font-caption text-caption text-text-secondary">
              {sub
                ? `${sub.isTrial ? `Trial ends ${shortDate(sub.trialEndsAt)}` : `${sub.status === 'canceled' ? 'Ends' : 'Renews'} ${shortDate(sub.endDate)}`}${sub.billingPeriod ? ` · billed ${sub.billingPeriod}` : ''}`
                : 'Choose a plan below to unlock more of Vemtap.'}
            </span>
          </div>
          {sub && !sub.plan?.isFree && sub.status !== 'canceled' ? (
            confirmCancel ? (
              <span className="flex items-center gap-space-xs">
                <span className="font-caption text-caption text-text-secondary">You keep access until {shortDate(sub.endDate)}.</span>
                <button type="button" disabled={cancel.isPending} onClick={() => cancel.mutate()} className="h-9 px-space-sm rounded-lg bg-error text-on-error font-label-sm text-label-sm">
                  Cancel plan
                </button>
                <button type="button" onClick={() => setConfirmCancel(false)} className="h-9 px-space-sm font-label-sm text-label-sm">
                  Keep it
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmCancel(true)} className="h-9 px-space-sm rounded-lg text-red-600 font-label-md text-label-md self-start sm:self-auto">
                Cancel subscription
              </button>
            )
          ) : null}
        </div>
      )}
      {cancel.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(cancel.error)}</span> : null}

      <div className="flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <h2 className="font-heading-sm text-heading-sm text-text-primary">Plans</h2>
          <FilterChips<BillingPeriod> value={period} onChange={setPeriod} options={PERIODS} />
        </div>
        {plans.isLoading ? (
          <LoadingRows rows={2} label="Loading plans" />
        ) : plans.isError ? (
          <ErrorState title="Could not load plans" error={plans.error} onRetry={() => plans.refetch()} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
            {(plans.data ?? []).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                period={period}
                current={sub?.planId === plan.id}
                busy={checkout.isPending}
                onChoose={() => {
                  setChosen(plan);
                  setPending(null);
                  setNotice(null);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {chosen ? (
        <SettingsSection title={`Switch to ${chosen.name}`} icon="shopping_cart">
          {chosen.isFree ? (
            <p className="font-body-md text-body-md text-text-secondary">
              Moving to the free plan happens when your current paid period ends. Cancel your subscription above to stop it renewing.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-1 font-body-md text-body-md">
                {preview.isLoading ? (
                  <span className="text-text-secondary">Working out the price…</span>
                ) : preview.data ? (
                  <>
                    <span className="flex justify-between">
                      <span className="text-text-secondary">Subtotal</span>
                      {naira(preview.data.subtotal)}
                    </span>
                    {Number(preview.data.taxAmount) ? (
                      <span className="flex justify-between">
                        <span className="text-text-secondary">{preview.data.taxRule?.name ?? 'Tax'}</span>
                        {naira(preview.data.taxAmount)}
                      </span>
                    ) : null}
                    <span className="flex justify-between font-semibold text-text-primary">
                      <span>Total</span>
                      {naira(preview.data.total)}
                    </span>
                  </>
                ) : preview.isError ? (
                  <span className="text-red-600">{apiErrorMessage(preview.error)}</span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-space-xs justify-end">
                <button type="button" onClick={() => setChosen(null)} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
                  Not now
                </button>
                {trialEligible ? (
                  <button type="button" disabled={trial.isPending} onClick={() => trial.mutate()} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
                    Start {chosen.trialDurationDays}-day free trial
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={checkout.isPending}
                  onClick={() => checkout.mutate()}
                  className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
                >
                  {checkout.isPending ? 'Opening Paystack…' : 'Pay with Paystack'}
                </button>
              </div>
            </>
          )}
          {pending ? (
            <PendingPayment label="Paystack opened in a new tab. Come back here once you have paid." checking={verify.isPending} onCheck={() => verify.mutate(pending)} notice={notice} />
          ) : null}
          {actionError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(actionError, 'Could not start the payment.')}</span> : null}
        </SettingsSection>
      ) : notice ? (
        <span className="font-caption text-caption text-badge-discount-text">{notice}</span>
      ) : null}

      <SettingsSection title="Payment card" icon="credit_card">
        {card.isLoading ? (
          <LoadingRows rows={1} label="Loading card" />
        ) : card.data?.hasCard && card.data.card ? (
          <span className="font-body-md text-body-md text-text-primary">
            {card.data.card.brand ?? 'Card'} ending {card.data.card.last4} · expires {card.data.card.expMonth}/{card.data.card.expYear}
            {card.data.autoRenews ? ' · renews automatically' : ''}
          </span>
        ) : (
          <span className="font-caption text-caption text-text-secondary">No card on file. Your first paid checkout saves one.</span>
        )}
      </SettingsSection>

      <SettingsSection title="Billing history" icon="receipt_long">
        {history.isLoading ? (
          <LoadingRows rows={2} label="Loading billing history" />
        ) : history.isError ? (
          <ErrorState title="Could not load billing history" error={history.error} onRetry={() => history.refetch()} />
        ) : !history.data?.length ? (
          <EmptyState icon="receipt_long" title="No payments yet" body="Plan and credit payments appear here." />
        ) : (
          <ul className="flex flex-col divide-y divide-border-subtle">
            {history.data.map((row) => (
              <li key={row.id} className="py-space-xs flex items-center justify-between gap-space-sm">
                <span className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary capitalize truncate">{row.purpose?.replace(/_/g, ' ') ?? 'Payment'}</span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    {[shortDate(row.createdAt), row.reference, row.status].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="font-label-md text-label-md text-text-primary font-semibold shrink-0">{naira(row.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add-ons & messaging credits
// ---------------------------------------------------------------------------

const CREDIT_LABELS: { key: 'smsCredits' | 'emailCredits' | 'whatsappCredits' | 'aiCredits'; label: string; icon: string }[] = [
  { key: 'smsCredits', label: 'SMS', icon: 'sms' },
  { key: 'emailCredits', label: 'Email', icon: 'mail' },
  { key: 'whatsappCredits', label: 'WhatsApp', icon: 'chat' },
  { key: 'aiCredits', label: 'AI', icon: 'auto_awesome' },
];

/** Live add-ons and messaging credits: balances, credit bundles and active add-ons. */
export function AddOnsPanel() {
  const queryClient = useQueryClient();
  const balance = useQuery({ queryKey: accountKeys.credits, queryFn: subscriptionService.creditBalance });
  const bundles = useQuery({ queryKey: [...accountKeys.credits, 'plans'], queryFn: subscriptionService.creditPlans, staleTime: 10 * 60_000 });
  const addons = useQuery({ queryKey: [...accountKeys.subscription, 'addons'], queryFn: subscriptionService.addons, staleTime: 10 * 60_000 });
  const mine = useQuery({ queryKey: [...accountKeys.subscription, 'my-addons'], queryFn: subscriptionService.myAddons });
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const buy = useMutation({
    mutationFn: (planId: string) => subscriptionService.startCreditCheckout(planId, window.location.href),
    onSuccess: (res) => {
      setPending(res.reference);
      setNotice(null);
      if (res.authorizationUrl) window.open(res.authorizationUrl, '_blank', 'noopener');
    },
  });
  const confirm = useMutation({
    mutationFn: (reference: string) => subscriptionService.confirmCreditCheckout(reference),
    onSuccess: (res) => {
      if (res.status === 'completed') {
        setPending(null);
        setNotice('Payment received — credits added.');
        void queryClient.invalidateQueries({ queryKey: accountKeys.credits });
      } else setNotice('We have not seen the payment yet. Finish it in the Paystack tab, then check again.');
    },
  });

  const activeIds = new Set((mine.data ?? []).filter((m) => m.status !== 'cancelled').map((m) => m.addonId));

  return (
    <div className="flex flex-col gap-space-lg max-w-5xl">
      {balance.isError ? (
        <ErrorState title="Could not load your credits" error={balance.error} onRetry={() => balance.refetch()} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
          {CREDIT_LABELS.map((credit) => (
            <div key={credit.key} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary inline-flex items-center gap-1">
                <Icon name={credit.icon} className="text-[16px]" /> {credit.label} credits
              </span>
              <span className="font-heading-md text-heading-md text-text-primary font-semibold">
                {balance.data ? Number(balance.data[credit.key] ?? 0).toLocaleString('en-NG') : '—'}
              </span>
            </div>
          ))}
        </div>
      )}

      <SettingsSection title="Buy messaging credits" icon="add_card">
        {bundles.isLoading ? (
          <LoadingRows rows={1} label="Loading credit bundles" />
        ) : bundles.isError ? (
          <ErrorState title="Could not load credit bundles" error={bundles.error} onRetry={() => bundles.refetch()} />
        ) : !bundles.data?.length ? (
          <EmptyState icon="sms" title="No credit bundles on sale" body="Bundles appear here once Vemtap publishes them." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
            {bundles.data.map((bundle) => (
              <button
                key={bundle.id}
                type="button"
                disabled={buy.isPending}
                onClick={() => buy.mutate(bundle.id)}
                className="rounded-lg border border-border-subtle bg-surface-subtle hover:border-primary/40 p-space-sm flex flex-col text-left disabled:opacity-60"
              >
                <span className="font-label-md text-label-md text-text-primary font-semibold">{bundle.name}</span>
                <span className="font-label-md text-label-md text-primary">{naira(bundle.price)}</span>
                <span className="font-caption text-caption text-text-secondary">
                  {[
                    bundle.smsAmount ? `${bundle.smsAmount} SMS` : null,
                    bundle.emailAmount ? `${bundle.emailAmount} email` : null,
                    bundle.whatsappAmount ? `${bundle.whatsappAmount} WhatsApp` : null,
                    bundle.aiAmount ? `${bundle.aiAmount} AI` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </button>
            ))}
          </div>
        )}
        {pending ? <PendingPayment label="Paystack opened in a new tab. Come back here once you have paid." checking={confirm.isPending} onCheck={() => confirm.mutate(pending)} notice={notice} /> : null}
        {!pending && notice ? <span className="font-caption text-caption text-badge-discount-text">{notice}</span> : null}
        {buy.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(buy.error, 'Could not start the payment.')}</span> : null}
        {confirm.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(confirm.error)}</span> : null}
      </SettingsSection>

      <SettingsSection title="Add-ons" icon="extension">
        {addons.isLoading || mine.isLoading ? (
          <LoadingRows rows={2} label="Loading add-ons" />
        ) : addons.isError ? (
          <ErrorState title="Could not load add-ons" error={addons.error} onRetry={() => addons.refetch()} />
        ) : !addons.data?.length && !mine.data?.length ? (
          <EmptyState icon="extension" title="No add-ons available" body="Extras like more branches or staff seats appear here." />
        ) : (
          <ul className="flex flex-col divide-y divide-border-subtle">
            {(mine.data ?? []).map((owned) => (
              <li key={owned.id} className="py-space-xs flex items-center justify-between gap-space-sm">
                <span className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary truncate">{owned.addon?.name ?? 'Add-on'}</span>
                  <span className="font-caption text-caption text-text-secondary">
                    {owned.quantity && owned.quantity > 1 ? `${owned.quantity}× · ` : ''}
                    {owned.expiresAt ? `until ${shortDate(owned.expiresAt)}` : 'no expiry'}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] capitalize shrink-0">{owned.status ?? 'active'}</span>
              </li>
            ))}
            {(addons.data ?? [])
              .filter((addon) => !activeIds.has(addon.id))
              .map((addon) => (
                <li key={addon.id} className="py-space-xs flex items-center justify-between gap-space-sm">
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary truncate">{addon.name}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">{addon.description ?? (addon.isOneTime ? 'One-off' : `${addon.durationDays ?? 30} days`)}</span>
                  </span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold shrink-0">{naira(addon.price)}</span>
                </li>
              ))}
          </ul>
        )}
        <span className="font-caption text-caption text-text-secondary">Add-ons are added at your next plan checkout.</span>
      </SettingsSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

const PREFS: { key: keyof NotificationPreferencePayload; title: string; body: string }[] = [
  { key: 'orderUpdates', title: 'Orders and bookings', body: 'New orders, status changes and bookings' },
  { key: 'activityDigest', title: 'Activity digest', body: 'A daily summary of what happened' },
  { key: 'push', title: 'Push notifications', body: 'On this browser and your phone' },
  { key: 'email', title: 'Email', body: 'Sent to your account email' },
  { key: 'sms', title: 'SMS', body: 'Important alerts by text' },
  { key: 'marketing', title: 'Vemtap tips and offers', body: 'Product news and growth ideas' },
];

const TYPE_ICON: Record<string, string> = {
  new_order: 'receipt_long',
  order_status: 'local_shipping',
  booking: 'calendar_month',
  review: 'reviews',
  claim: 'local_offer',
};

/** Live business notification feed with read state and delivery preferences. */
export function BusinessNotificationsPanel({ onOpenLink }: { onOpenLink?: (actionUrl: string) => void }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'feed' | 'settings'>('feed');
  const feed = useQuery({ queryKey: accountKeys.notifications, queryFn: () => notificationService.businessFeed({ limit: 50 }) });
  const prefs = useQuery({ queryKey: [...accountKeys.notifications, 'prefs'], queryFn: notificationService.getPreferences, enabled: tab === 'settings' });
  const refresh = () => queryClient.invalidateQueries({ queryKey: accountKeys.notifications });
  const readOne = useMutation({ mutationFn: notificationService.markAsRead, onSuccess: refresh });
  const readAll = useMutation({ mutationFn: notificationService.markAllRead, onSuccess: refresh });
  const savePref = useMutation({
    mutationFn: (patch: NotificationPreferencePayload) => notificationService.updatePreferences(patch),
    onSuccess: (next) => queryClient.setQueryData([...accountKeys.notifications, 'prefs'], next),
  });
  const unread = feed.data?.unreadCount ?? (feed.data?.data ?? []).filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col gap-space-md max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <FilterChips<'feed' | 'settings'>
          value={tab}
          onChange={setTab}
          options={[
            { key: 'feed', label: 'Notifications', count: unread || undefined },
            { key: 'settings', label: 'Settings' },
          ]}
        />
        {tab === 'feed' && unread ? (
          <button type="button" disabled={readAll.isPending} onClick={() => readAll.mutate()} className="h-9 px-space-sm rounded-lg text-primary font-label-md text-label-md hover:bg-surface-tint-blue">
            Mark all as read
          </button>
        ) : null}
      </div>
      {tab === 'settings' ? (
        <SettingsSection title="What we send you" icon="tune">
          {prefs.isLoading ? (
            <LoadingRows rows={3} label="Loading preferences" />
          ) : prefs.isError ? (
            <ErrorState title="Could not load preferences" error={prefs.error} onRetry={() => prefs.refetch()} />
          ) : (
            PREFS.map((pref) => (
              <SwitchRow
                key={pref.key}
                title={pref.title}
                body={pref.body}
                checked={Boolean(prefs.data?.[pref.key])}
                disabled={savePref.isPending}
                onChange={(next) => savePref.mutate({ [pref.key]: next })}
              />
            ))
          )}
          {savePref.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(savePref.error)}</span> : null}
        </SettingsSection>
      ) : feed.isLoading ? (
        <LoadingRows rows={4} label="Loading notifications" />
      ) : feed.isError ? (
        <ErrorState title="Could not load notifications" error={feed.error} onRetry={() => feed.refetch()} />
      ) : !feed.data?.data.length ? (
        <EmptyState icon="notifications" title="You're all caught up" body="Orders, bookings, reviews and claims show up here." />
      ) : (
        <ul className="flex flex-col gap-space-xs">
          {feed.data.data.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (!item.isRead) readOne.mutate(item.id);
                  if (item.actionUrl && onOpenLink) onOpenLink(item.actionUrl);
                }}
                className={`w-full text-left rounded-xl border p-space-sm flex items-start gap-space-sm ${
                  item.isRead ? 'bg-surface-canvas border-border-subtle' : 'bg-surface-tint-blue border-primary/30'
                }`}
              >
                <span className="w-9 h-9 rounded-lg bg-surface-canvas text-primary flex items-center justify-center shrink-0">
                  <Icon name={TYPE_ICON[item.type ?? ''] ?? 'notifications'} className="text-[18px]" />
                </span>
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{item.title}</span>
                  <span className="font-caption text-caption text-text-secondary">{item.message}</span>
                </span>
                <span className="font-caption text-caption text-text-tertiary shrink-0">{formatRelativeTime(item.createdAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Help & support
// ---------------------------------------------------------------------------

const TICKET_CATEGORIES = ['Billing & subscription', 'Deals & offers', 'Orders & bookings', 'POS', 'Account & verification', 'Something else'];
const STATUS_TONE: Record<string, string> = {
  Pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  'In Progress': 'bg-surface-tint-blue text-primary',
  Resolved: 'bg-badge-discount-bg text-badge-discount-text',
  Cancelled: 'bg-surface-container text-text-secondary',
};

function NewTicketForm({ onDone }: { onDone: (id: string) => void }) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(TICKET_CATEGORIES[0]);
  const [priority, setPriority] = useState<TicketPriority>('Normal');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: supportService.createTicket,
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.support });
      onDone(ticket.id);
    },
    onError: (e) => setError(apiErrorMessage(e, 'Could not send your request.')),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return setError('Add a subject and describe the problem.');
    setError(null);
    create.mutate({ subject: subject.trim(), category, priority, message: message.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-xl bg-surface-canvas border border-primary/30 p-space-md flex flex-col gap-space-sm">
      {error ? (
        <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
          {error}
        </p>
      ) : null}
      <TextField id="ticket-subject" label="Subject" value={subject} onChange={setSubject} placeholder="e.g. POS sale not showing in reports" />
      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md text-text-primary">Topic</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-lg border border-border-subtle bg-surface-canvas px-space-sm font-body-md text-body-md">
          {TICKET_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <div role="radiogroup" aria-label="Priority" className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
        {(['Low', 'Normal', 'High', 'Urgent'] as TicketPriority[]).map((p) => (
          <RadioCard key={p} title={p} selected={priority === p} onSelect={() => setPriority(p)} />
        ))}
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md text-text-primary">What happened?</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={4000}
          className="rounded-lg border border-border-subtle bg-surface-canvas p-space-sm font-body-md text-body-md"
        />
      </label>
      <button type="submit" disabled={create.isPending} className="self-end h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50">
        {create.isPending ? 'Sending…' : 'Send to support'}
      </button>
    </form>
  );
}

function TicketThread({ id, onBack }: { id: string; onBack: () => void }) {
  const queryClient = useQueryClient();
  const ticket = useQuery({ queryKey: [...accountKeys.support, 'ticket', id], queryFn: () => supportService.ticket(id) });
  const [reply, setReply] = useState('');
  const send = useMutation({
    mutationFn: () => supportService.reply(id, reply.trim()),
    onSuccess: () => {
      setReply('');
      void queryClient.invalidateQueries({ queryKey: accountKeys.support });
    },
  });

  return (
    <div className="flex flex-col gap-space-sm">
      <button type="button" onClick={onBack} className="self-start inline-flex items-center gap-1 font-label-md text-label-md text-primary">
        <Icon name="arrow_back" className="text-[18px]" /> All requests
      </button>
      {ticket.isLoading ? (
        <LoadingRows rows={3} label="Loading request" />
      ) : ticket.isError || !ticket.data ? (
        <ErrorState title="Could not load this request" error={ticket.error} onRetry={() => ticket.refetch()} />
      ) : (
        <>
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col">
              <span className="font-heading-sm text-heading-sm text-text-primary">{ticket.data.subject}</span>
              <span className="font-caption text-caption text-text-secondary">
                {ticket.data.category} · {ticket.data.priority} priority · opened {formatRelativeTime(ticket.data.createdAt)}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold shrink-0 ${STATUS_TONE[ticket.data.status] ?? STATUS_TONE.Pending}`}>{ticket.data.status}</span>
          </div>
          <ul className="flex flex-col gap-space-xs">
            {(ticket.data.messages ?? []).map((m) => {
              const mine = m.senderRole === 'CUSTOMER';
              return (
                <li key={m.id} className={`max-w-[85%] rounded-xl p-space-sm flex flex-col gap-1 ${mine ? 'self-end bg-primary-container text-on-primary' : 'self-start bg-surface-container text-text-primary'}`}>
                  <span className="font-body-md text-body-md whitespace-pre-wrap">{m.message}</span>
                  <span className={`font-caption text-[11px] ${mine ? 'text-on-primary/80' : 'text-text-secondary'}`}>
                    {mine ? 'You' : m.senderRole === 'AGENT' ? 'Vemtap support' : 'Vemtap'} · {formatRelativeTime(m.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
          {ticket.data.status !== 'Resolved' && ticket.data.status !== 'Cancelled' ? (
            <div className="flex flex-col gap-space-xs">
              <textarea
                aria-label="Reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Add more detail or reply to support"
                className="rounded-lg border border-border-subtle bg-surface-canvas p-space-sm font-body-md text-body-md"
              />
              <button
                type="button"
                disabled={!reply.trim() || send.isPending}
                onClick={() => send.mutate()}
                className="self-end h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
              >
                {send.isPending ? 'Sending…' : 'Send reply'}
              </button>
              {send.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(send.error)}</span> : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/** Live help: searchable FAQs and support requests with their message threads. */
export function SupportPanel() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [view, setView] = useState<'list' | 'new' | string>('list');
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(search.trim()), 350);
    return () => window.clearTimeout(id);
  }, [search]);
  const faqs = useQuery({ queryKey: [...accountKeys.support, 'faqs', debounced], queryFn: () => supportService.faqs(debounced) });
  const tickets = useQuery({ queryKey: [...accountKeys.support, 'tickets'], queryFn: supportService.tickets });
  const pages = (faqs.data?.categories ?? []).flatMap((c) => (c.sections ?? []).flatMap((s) => (s.pages ?? []).map((p) => ({ ...p, section: s.title }))));

  if (view !== 'list' && view !== 'new') return <TicketThread id={view} onBack={() => setView('list')} />;

  return (
    <div className="flex flex-col gap-space-lg max-w-3xl">
      <SettingsSection title="Your support requests" icon="support_agent">
        {view === 'new' ? (
          <NewTicketForm onDone={(id) => setView(id)} />
        ) : (
          <button type="button" onClick={() => setView('new')} className="self-start h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1">
            <Icon name="add" className="text-[18px]" /> New request
          </button>
        )}
        {tickets.isLoading ? (
          <LoadingRows rows={2} label="Loading requests" />
        ) : tickets.isError ? (
          <ErrorState title="Could not load your requests" error={tickets.error} onRetry={() => tickets.refetch()} />
        ) : !tickets.data?.length ? (
          <span className="font-caption text-caption text-text-secondary">No requests yet. We usually reply within one working day.</span>
        ) : (
          <ul className="flex flex-col gap-space-xs">
            {tickets.data.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => setView(t.id)} className="w-full text-left rounded-xl border border-border-subtle bg-surface-canvas p-space-sm flex items-center gap-space-sm hover:border-primary/40">
                  <span className="flex flex-col flex-1 min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{t.subject}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {t.category} · updated {formatRelativeTime(t.updatedAt ?? t.createdAt)}
                    </span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold shrink-0 ${STATUS_TONE[t.status] ?? STATUS_TONE.Pending}`}>{t.status}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>
      <SettingsSection title="Answers" icon="help">
        <TextField id="faq-search" label="Search help articles" value={search} onChange={setSearch} placeholder="e.g. payouts, POS, verification" />
        {faqs.isLoading ? (
          <LoadingRows rows={2} label="Searching" />
        ) : faqs.isError ? (
          <ErrorState title="Could not load help articles" error={faqs.error} onRetry={() => faqs.refetch()} />
        ) : !pages.length ? (
          <EmptyState icon="menu_book" title={debounced ? 'No matching articles' : 'No help articles yet'} body="Send us a request and the team will help directly." />
        ) : (
          <ul className="flex flex-col divide-y divide-border-subtle">
            {pages.map((page) => (
              <li key={page.id} className="py-space-xs flex flex-col">
                <span className="font-label-md text-label-md text-text-primary">{page.title}</span>
                <span className="font-caption text-caption text-text-secondary">{page.summary ?? page.section}</span>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>
    </div>
  );
}
