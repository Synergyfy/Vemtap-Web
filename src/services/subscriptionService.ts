import { api } from './api/client';

export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';
type Money = number | string;

/** `GET /plans` row — prices arrive as decimal strings. */
export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: Money;
  quarterlyPrice: Money;
  yearlyPrice: Money;
  isFree?: boolean | null;
  isActive?: boolean | null;
  isPopular?: boolean | null;
  trialDurationDays?: number | null;
  /** Paid plans can only be bought once an admin has set their permissions. */
  permissionsConfiguredAt?: string | null;
  features?: unknown[] | null;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'trial' | 'canceled' | 'expired';
  billingPeriod?: BillingPeriod | null;
  startDate?: string | null;
  endDate?: string | null;
  trialEndsAt?: string | null;
  isTrial?: boolean | null;
  daysRemaining?: number | null;
  trialEligible?: boolean | null;
  plan?: { id: string; name: string; isFree?: boolean | null } | null;
}

export interface PricePreview {
  subtotal: Money;
  taxAmount: Money;
  total: Money;
  taxRule?: { name?: string | null; rate?: number | null; isEnabled?: boolean | null } | null;
}

export interface BillingRecord {
  id: string;
  reference?: string | null;
  amount: Money;
  status?: string | null;
  purpose?: string | null;
  billingPeriod?: string | null;
  createdAt?: string | null;
}

export interface PaymentMethod {
  hasCard?: boolean | null;
  card?: { brand?: string | null; last4?: string | null; expMonth?: string | null; expYear?: string | null } | null;
  autoRenews?: boolean | null;
}

export interface Addon {
  id: string;
  name: string;
  description?: string | null;
  price: Money;
  durationDays?: number | null;
  isOneTime?: boolean | null;
}

export interface BusinessAddon {
  id: string;
  addonId: string;
  status?: string | null;
  quantity?: number | null;
  purchasedAt?: string | null;
  expiresAt?: string | null;
  addon?: Addon | null;
}

export interface CreditPlan {
  id: string;
  name: string;
  description?: string | null;
  price: Money;
  smsAmount?: number;
  emailAmount?: number;
  whatsappAmount?: number;
  aiAmount?: number;
}

export interface CreditBalance {
  smsCredits: number;
  emailCredits: number;
  whatsappCredits: number;
  aiCredits: number;
}

export const planPrice = (plan: Plan, period: BillingPeriod) =>
  Number(period === 'yearly' ? plan.yearlyPrice : period === 'quarterly' ? plan.quarterlyPrice : plan.monthlyPrice) || 0;

/** Free plans always; paid plans only once their permissions are configured. */
export const isPurchasable = (plan: Plan) => plan.isActive !== false && (Boolean(plan.isFree) || Boolean(plan.permissionsConfiguredAt));

export const subscriptionService = {
  plans: () => api.get<Plan[]>('/plans', { params: { onlyActive: true } }),
  active: () => api.get<Subscription | null>('/subscriptions/active'),
  startTrial: (planId: string, billingPeriod: BillingPeriod) => api.post<Subscription>('/subscriptions/trial', { planId, billingPeriod }),
  pricePreview: (planId: string, billingPeriod: BillingPeriod) =>
    api.get<PricePreview>('/subscriptions/price-preview', { params: { planId, billingPeriod } }),
  /** Opens a Paystack checkout; the webhook activates the plan once paid. */
  initializePayment: (input: { planId: string; billingPeriod: BillingPeriod; callbackUrl?: string }) =>
    api.post<{ reference: string; authorization_url?: string | null }>('/subscriptions/initialize-payment', input),
  verifyPayment: (reference: string) => api.get<{ success?: boolean; status?: string }>(`/payments/verify/${encodeURIComponent(reference)}`),
  billingHistory: () => api.get<{ data?: BillingRecord[] }>('/subscriptions/billing-history').then((res) => res.data ?? []),
  paymentMethod: () => api.get<PaymentMethod>('/subscriptions/payment-method'),
  cancel: () => api.post<unknown>('/subscriptions/cancel'),
  addons: () => api.get<Addon[]>('/addons'),
  myAddons: () => api.get<BusinessAddon[]>('/addons/my'),
  creditPlans: () => api.get<CreditPlan[]>('/credit-plans'),
  creditBalance: () => api.get<CreditBalance>('/credits/balance'),
  startCreditCheckout: (planId: string, callbackUrl: string) =>
    api.post<{ reference: string; amount: Money; authorizationUrl?: string | null }>(`/credit-plans/${encodeURIComponent(planId)}/checkout`, { callbackUrl }),
  confirmCreditCheckout: (reference: string) =>
    api.post<{ reference: string; status: 'completed' | 'pending' }>(`/credit-plans/checkout/${encodeURIComponent(reference)}/confirm`),
};
