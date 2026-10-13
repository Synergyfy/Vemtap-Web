export type DealDuration = '7-days' | '14-days' | '30-days' | '3-months' | '6-months' | 'forever';

export const DEAL_DURATIONS: Array<{ id: DealDuration; label: string; hint: string }> = [
  { id: '7-days', label: '7 Days', hint: 'Quick flash promo' },
  { id: '14-days', label: '14 Days', hint: 'Standard window' },
  { id: '30-days', label: '30 Days', hint: 'Monthly campaign' },
  { id: '3-months', label: '3 Months', hint: 'Quarterly push' },
  { id: '6-months', label: '6 Months', hint: 'Long-running offer' },
  { id: 'forever', label: 'Always On (Forever)', hint: 'Deal never expires automatically' },
];

export const dealDurationLabel = (duration: DealDuration) =>
  DEAL_DURATIONS.find((option) => option.id === duration)?.label ?? '14 Days';

export interface DealStudioDraft {
  discountPct: number;
  vouchers: number;
  claimOnce: boolean;
  maxClaims: number;
  gifting: boolean;
  otpVerify: boolean;
  socialBonus: boolean;
  dineIn: boolean;
  pickup: boolean;
  reservation: boolean;
  autoPause: boolean;
  branches: { wuseII: boolean; garkiII: boolean; maitama: boolean };
  days: { mon: boolean; tue: boolean; wed: boolean; thu: boolean; fri: boolean; sat: boolean; sun: boolean };
  redeemAllDay: boolean;
  redeemStart: string;
  redeemEnd: string;
  duration: DealDuration;
  claimSteps: string[];
  terms: string[];
}

export const INITIAL_DEAL_STUDIO_DRAFT: DealStudioDraft = {
  discountPct: 20,
  vouchers: 50,
  claimOnce: true,
  maxClaims: 2,
  gifting: true,
  otpVerify: true,
  socialBonus: true,
  dineIn: true,
  pickup: true,
  reservation: true,
  autoPause: true,
  branches: { wuseII: true, garkiII: true, maitama: false },
  days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
  redeemAllDay: false,
  redeemStart: '12:00 PM',
  redeemEnd: '5:00 PM',
  duration: '14-days',
  claimSteps: [
    'Show your digital VEMTAP voucher pass at reception/counter',
    'Enjoy your meal with 20% discount applied to eligible items',
    'Settle remaining balance directly with restaurant via Card, Cash or Transfer',
  ],
  terms: [
    'Show voucher code before placing order',
    'Dine-in and pickup only. Not combinable with other promotions',
    'Valid only during specified lunch hours (12:00 PM – 5:00 PM)',
  ],
};
