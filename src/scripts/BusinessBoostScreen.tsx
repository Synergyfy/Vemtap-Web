import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { SubscriptionHeader } from './SubscriptionHeader';
import { PUBLIC_IMAGES } from './publicPosData';

interface BusinessBoostScreenProps {
  onBack: () => void;
  onDone: () => void;
  growthActive: boolean;
  preselectedItem?: string | null;
}

type ContentKind = 'deals' | 'profile' | 'products' | 'services';

interface BoostItem {
  key: string;
  name: string;
  typeLabel: string;
  meta: string;
  statusLabel: string;
  statusClass: string;
  icon: string;
  iconBox: string;
  kind: ContentKind;
  image: string;
  thumbBadge: string;
  thumbBadgeClass: string;
  cardLabel: string;
  cardLabelClass: string;
  cardDesc: string;
  perfIcon: string;
  perfText: string;
  locText: string;
}

const CONTENT_POOL: BoostItem[] = [
  {
    key: 'lunch-combo',
    name: '20% Off Prime Lunch Combo',
    typeLabel: 'Deal',
    meta: '₦9,600 • Voucher #VT-48F261',
    statusLabel: 'Best Performer',
    statusClass: 'bg-badge-discount-bg text-badge-discount-text',
    icon: 'local_offer',
    iconBox: 'bg-surface-tint-blue text-primary',
    kind: 'deals',
    image: PUBLIC_IMAGES.combo,
    thumbBadge: 'DEAL',
    thumbBadgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    cardLabel: '20% OFF',
    cardLabelClass: 'text-badge-discount-text',
    cardDesc: 'Prime Lunch Combo for two',
    perfIcon: 'trending_up',
    perfText: '312 claims this month',
    locText: 'Wuse II & Maitama',
  },
  {
    key: 'weekend-bogo',
    name: 'Weekend BOGO — Free Dessert',
    typeLabel: 'Deal',
    meta: '₦12,000 • Claim limit 200',
    statusLabel: 'Just Added',
    statusClass: 'bg-surface-tint-blue text-primary',
    icon: 'celebration',
    iconBox: 'bg-tertiary-fixed text-tertiary',
    kind: 'deals',
    image: PUBLIC_IMAGES.wings,
    thumbBadge: 'BOGO',
    thumbBadgeClass: 'bg-tertiary-fixed text-tertiary',
    cardLabel: 'BUY 1 GET 1',
    cardLabelClass: 'text-tertiary',
    cardDesc: 'Free dessert with every main',
    perfIcon: 'auto_awesome',
    perfText: 'New — no claims yet',
    locText: 'All Abuja branches',
  },
  {
    key: 'storefront-profile',
    name: 'Urban Grill & Bistro Flagship',
    typeLabel: 'Profile',
    meta: 'Storefront & online menu',
    statusLabel: 'Profile',
    statusClass: 'bg-surface-container text-secondary',
    icon: 'storefront',
    iconBox: 'bg-surface-container-high text-on-surface-variant',
    kind: 'profile',
    image: PUBLIC_IMAGES.hero,
    thumbBadge: 'PROFILE',
    thumbBadgeClass: 'bg-surface-canvas/90 text-text-primary',
    cardLabel: 'VISIT US',
    cardLabelClass: 'text-primary',
    cardDesc: 'Open menu & table bookings',
    perfIcon: 'visibility',
    perfText: '3,240 profile visits',
    locText: 'Wuse II Flagship',
  },
  {
    key: 'ribeye',
    name: 'Woodfire Aged Ribeye Steak',
    typeLabel: 'Product',
    meta: '₦26,000 • 128 views this week',
    statusLabel: 'Popular',
    statusClass: 'bg-surface-container text-secondary',
    icon: 'restaurant',
    iconBox: 'bg-surface-container-high text-on-surface-variant',
    kind: 'products',
    image: PUBLIC_IMAGES.ribeye,
    thumbBadge: 'SIGNATURE',
    thumbBadgeClass: 'bg-surface-container/90 text-tertiary',
    cardLabel: 'CHEF PICK',
    cardLabelClass: 'text-tertiary',
    cardDesc: 'Woodfire aged ribeye, 250g',
    perfIcon: 'trending_up',
    perfText: '1,890 views this month',
    locText: 'All branches',
  },
  {
    key: 'massage',
    name: 'Swedish Massage Session',
    typeLabel: 'Service',
    meta: '₦18,500 • 41 bookings',
    statusLabel: 'Bookable',
    statusClass: 'bg-secondary-container text-on-secondary-container',
    icon: 'spa',
    iconBox: 'bg-secondary-container text-on-secondary-container',
    kind: 'services',
    image: PUBLIC_IMAGES.logo,
    thumbBadge: 'SERVICE',
    thumbBadgeClass: 'bg-secondary-container/90 text-on-secondary-container',
    cardLabel: 'BOOK NOW',
    cardLabelClass: 'text-secondary',
    cardDesc: '60-min Swedish massage',
    perfIcon: 'event_available',
    perfText: '41 bookings this month',
    locText: 'Wuse II Spa Wing',
  },
];

const OBJECTIVES = [
  { key: 'customers', icon: 'group_add', title: 'Get More Customers', desc: 'Introduce your business to new nearby shoppers' },
  { key: 'deal', icon: 'local_offer', title: 'Drive Orders & Deals', desc: 'Push a specific deal or voucher to nearby buyers' },
  { key: 'visits', icon: 'directions', title: 'Increase Store Visits', desc: 'Bring foot traffic into your branches' },
  { key: 'products', icon: 'restaurant', title: 'Promote Products', desc: 'Spotlight a signature dish or product' },
  { key: 'visibility', icon: 'campaign', title: 'Boost Visibility', desc: 'Grow brand awareness across your coverage' },
];

const COHORTS = [
  { key: 'vip', icon: 'diamond', title: 'VIP & Loyal Patrons', desc: 'Top spenders who visit most often', factor: 0.25, badge: 'High value' },
  { key: 'deal-regulars', icon: 'local_offer', title: 'Deal Regulars', desc: 'Shoppers who claim offers most often', factor: 0.55, badge: 'Recommended' },
  { key: 'new-patrons', icon: 'person_add', title: 'New & Curious Patrons', desc: 'Recently joined, exploring nearby', factor: 0.3 },
  { key: 'nearby-workers', icon: 'work', title: 'Nearby Office Workers', desc: 'Weekday lunch and after-work crowd', factor: 0.45 },
  { key: 'families', icon: 'family_restroom', title: 'Families & Households', desc: 'Weekend outings and group orders', factor: 0.35 },
  { key: 'students', icon: 'school', title: 'Students & Young Adults', desc: 'Budget-conscious younger shoppers', factor: 0.3 },
];

const BRANCHES = [
  { key: 'wuse-ii', name: 'Wuse II Flagship', area: 'Wuse II, Abuja', density: 6000 },
  { key: 'maitama', name: 'Maitama Heights', area: 'Maitama, Abuja', density: 5200 },
  { key: 'victoria-island', name: 'Victoria Island Branch', area: 'Victoria Island, Lagos', density: 7200 },
];

const DISTRICTS = ['Wuse II', 'Maitama', 'Asokoro', 'Garki', 'Central Area', 'Jabi', 'Lugbe'];

const RADIUS_PRESETS = [1, 3, 5, 10];

const RUSH_WINDOWS = [
  { key: 'breakfast', icon: 'free_breakfast', label: 'Breakfast Rush', time: '7:00 – 10:00 AM' },
  { key: 'lunch', icon: 'lunch_dining', label: 'Lunch Rush', time: '11:30 AM – 3:30 PM' },
  { key: 'dinner', icon: 'dinner_dining', label: 'Dinner Rush', time: '6:00 – 10:00 PM' },
  { key: 'late-night', icon: 'nightlife', label: 'Late Night', time: '9:00 PM – 1:00 AM' },
];

const DAY_NODES = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

const WIZARD_STEPS = ['Objective', 'Content', 'Audience', 'Schedule', 'Budget', 'Review'];

const BUDGET_TIERS = [
  { amount: 15000, label: 'Starter', desc: 'Light local reach' },
  { amount: 35000, label: 'Growth', desc: 'Steady neighborhood orders', popular: true },
  { amount: 70000, label: 'Surge', desc: 'Maximum local exposure' },
];

const DURATION_PRESETS = [3, 7, 14, 30];

const USSD_BANKS = [
  { bank: 'GTBank', code: '*737*000*1234#' },
  { bank: 'Zenith Bank', code: '*966*1234#' },
  { bank: 'UBA', code: '*919*1234#' },
  { bank: 'Access Bank', code: '*901*1234#' },
];

const MIN_BUDGET = 500;
const MIN_TOTAL = 5000;
const MAX_BUDGET = 100000;
const DAILY_MIN_SPEND = 500;
const WALLET_BALANCE = 25000;
const IMPRESSIONS_PER_NAIRA = 4;

const DECK_CLASS =
  'sticky bottom-0 mt-auto z-40 bg-surface/95 backdrop-blur-md px-margin pt-space-sm pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.08)] flex flex-col gap-space-xs';
const PRIMARY_BTN =
  'w-full h-11 bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs transition-all shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)]';
const CARD_SHADOW = 'shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)]';

type BoostPhase = 'objective' | 'content' | 'audience' | 'schedule' | 'budget' | 'review' | 'payment' | 'success';

const FLOW_STEPS: Exclude<BoostPhase, 'success'>[] = ['objective', 'content', 'audience', 'schedule', 'budget', 'review', 'payment'];

const fmt = (value: number) => Math.round(value).toLocaleString('en-US');

const fmtK = (value: number) =>
  value >= 10000
    ? `${(value / 1000).toFixed(0)}k`
    : value >= 1000
      ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
      : fmt(value);

const fmtShort = (value: number) =>
  value >= 1000000
    ? `₦${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
    : value >= 1000
      ? `₦${Math.round(value / 1000)}k`
      : `₦${fmt(value)}`;

const DAY_NAMES: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export function BusinessBoostScreen({ onBack, onDone, growthActive, preselectedItem }: BusinessBoostScreenProps) {
  const [phase, setPhase] = useState<BoostPhase>(preselectedItem ? 'content' : 'objective');
  const [objective, setObjective] = useState('customers');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [extraItem, setExtraItem] = useState<BoostItem | null>(null);
  const [preselected] = useState(!!preselectedItem);
  const [audienceMode, setAudienceMode] = useState<'broadcast' | 'segments'>('segments');
  const [cohorts, setCohorts] = useState<string[]>(['vip', 'deal-regulars', 'new-patrons']);
  const [branchKeys, setBranchKeys] = useState<string[]>(['wuse-ii', 'maitama']);
  const [districts, setDistricts] = useState<string[]>(['Wuse II']);
  const [radius, setRadius] = useState(3);
  const [duration, setDuration] = useState(7);
  const [durationInput, setDurationInput] = useState('7');
  const [showCustomDays, setShowCustomDays] = useState(false);
  const [instantLaunch, setInstantLaunch] = useState(true);
  const [dayparting, setDayparting] = useState(true);
  const [rushWindows, setRushWindows] = useState<string[]>(['lunch', 'dinner']);
  const [activeDays, setActiveDays] = useState<string[]>(['fri', 'sat', 'sun']);
  const [autoRenew, setAutoRenew] = useState(false);
  const [budget, setBudget] = useState(35000);
  const [budgetInput, setBudgetInput] = useState('35000');
  const [budgetType, setBudgetType] = useState<'total' | 'daily'>('total');
  const [autoDebit, setAutoDebit] = useState(true);
  const [checkoutMethod, setCheckoutMethod] = useState<'wallet' | 'gateway' | 'transfer'>('wallet');
  const [payMethod, setPayMethod] = useState<'card' | 'bank' | 'ussd'>('card');
  const [payPhase, setPayPhase] = useState<'form' | 'otp' | 'processing'>('form');
  const [cardNumber, setCardNumber] = useState('4084 0840 8408 4081');
  const [otp, setOtp] = useState('');
  const [paidVia, setPaidVia] = useState('Business Wallet');
  const [terms, setTerms] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  useEffect(() => {
    if (!preselectedItem) return;
    const found = CONTENT_POOL.find((entry) => entry.name.toLowerCase() === preselectedItem.toLowerCase());
    if (found) {
      setSelectedKeys([found.key]);
      if (found.kind === 'deals') setObjective('deal');
      if (found.kind === 'products') setObjective('products');
    } else {
      const fallback: BoostItem = {
        key: 'preselected',
        name: preselectedItem,
        typeLabel: 'Selected item',
        meta: 'Ready to boost',
        statusLabel: 'Selected',
        statusClass: 'bg-surface-tint-blue text-primary',
        icon: 'rocket_launch',
        iconBox: 'bg-surface-tint-blue text-primary',
        kind: 'products',
        image: PUBLIC_IMAGES.hero,
        thumbBadge: 'NEW',
        thumbBadgeClass: 'bg-primary-fixed text-primary',
        cardLabel: 'FEATURED',
        cardLabelClass: 'text-primary',
        cardDesc: preselectedItem,
        perfIcon: 'auto_awesome',
        perfText: 'Ready to boost',
        locText: 'All branches',
      };
      setExtraItem(fallback);
      setSelectedKeys([fallback.key]);
    }
    setPhase('content');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contentPool = extraItem ? [...CONTENT_POOL, extraItem] : CONTENT_POOL;
  const item = contentPool.find((entry) => entry.key === selectedKeys[0]) ?? null;
  const branches = BRANCHES.filter((option) => branchKeys.includes(option.key));
  const primaryBranch = branches[0] ?? BRANCHES[0];

  const minBudgetForDays = Math.max(MIN_BUDGET, duration * DAILY_MIN_SPEND);
  const effectiveMin = Math.max(minBudgetForDays, MIN_TOTAL);

  const audienceFactor =
    audienceMode === 'broadcast'
      ? 1
      : Math.min(1, cohorts.reduce((sum, key) => sum + (COHORTS.find((entry) => entry.key === key)?.factor ?? 0), 0));
  const shopperPool = Math.round(radius * branches.reduce((sum, option) => sum + option.density, 0));
  const daypartFactor = dayparting && rushWindows.length > 0 && rushWindows.length < RUSH_WINDOWS.length ? 0.75 : 1;
  const addressable = Math.max(1, Math.round(shopperPool * audienceFactor * daypartFactor));
  const rawImpressions = budget * IMPRESSIONS_PER_NAIRA;
  const impressions = Math.min(rawImpressions, Math.round(addressable * 1.5));
  const low = Math.round(impressions * 0.8);
  const high = Math.round(impressions * 1.25);
  const perDay = Math.round(impressions / duration);
  const capped = rawImpressions > addressable * 1.5;
  const perDaySpend = Math.round(budget / duration);

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + (duration - 1) * 86400000);
  const fmtDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  const toggleInList = (list: string[], key: string) =>
    list.includes(key) ? list.filter((entry) => entry !== key) : [...list, key];

  const toggleContent = (key: string) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]));
  };

  const toggleBranch = (key: string) => {
    setBranchKeys((prev) => {
      const next = toggleInList(prev, key);
      if (next.length === 0) {
        showToast('Keep at least one branch selected');
        return prev;
      }
      return next;
    });
  };

  const toggleDistrict = (name: string) => setDistricts((prev) => toggleInList(prev, name));

  const toggleCohort = (key: string) => setCohorts((prev) => toggleInList(prev, key));

  const toggleRushWindow = (key: string) => setRushWindows((prev) => toggleInList(prev, key));

  const toggleActiveDay = (key: string) => setActiveDays((prev) => toggleInList(prev, key));

  const applyDuration = (days: number) => {
    const clamped = Math.min(Math.max(days, 1), 365);
    setDuration(clamped);
    setDurationInput(String(clamped));
    const min = Math.max(MIN_BUDGET, clamped * DAILY_MIN_SPEND, MIN_TOTAL);
    if (budget < min) {
      setBudget(min);
      setBudgetInput(budgetType === 'total' ? String(min) : String(Math.round(min / clamped)));
    }
  };

  const handleDurationInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    setDurationInput(digits);
    const parsed = Number(digits);
    if (!Number.isNaN(parsed) && parsed >= 1) applyDuration(parsed);
  };

  const handleBudgetInput = (value: string) => {
    setBudgetInput(value);
    const parsed = Number(value.replace(/\D/g, ''));
    if (Number.isNaN(parsed) || parsed <= 0) return;
    const total = budgetType === 'total' ? parsed : parsed * duration;
    if (total >= effectiveMin) setBudget(Math.min(total, MAX_BUDGET));
  };

  const applyBudgetAmount = (amount: number) => {
    const next = Math.min(Math.max(Math.round(amount), effectiveMin), MAX_BUDGET);
    setBudget(next);
    setBudgetInput(budgetType === 'total' ? String(next) : String(Math.round(next / duration)));
  };

  const stepBudget = (dir: 1 | -1) => {
    if (budgetType === 'total') {
      applyBudgetAmount(budget + dir * 5000);
    } else {
      const perDayAmount = Math.round(budget / duration);
      applyBudgetAmount((perDayAmount + dir * 5000) * duration);
    }
  };

  const switchBudgetType = (type: 'total' | 'daily') => {
    setBudgetType(type);
    setBudgetInput(type === 'total' ? String(budget) : String(Math.round(budget / duration)));
  };

  const formatCard = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const finishPayment = () => {
    setPayPhase('processing');
    const timer = window.setTimeout(() => {
      setPayPhase('form');
      setPhase('success');
    }, 1800);
    timers.current.push(timer);
  };

  const handleLaunch = () => {
    if (!terms) {
      showToast('Accept the campaign terms to continue');
      return;
    }
    if (checkoutMethod === 'wallet') {
      if (budget > WALLET_BALANCE) {
        showToast('Wallet balance too low — top up or choose another method');
        return;
      }
      setPaidVia('Business Wallet');
      finishPayment();
      return;
    }
    if (checkoutMethod === 'transfer') {
      setPaidVia('Bank Transfer');
      finishPayment();
      return;
    }
    if (payMethod === 'card') {
      setPayPhase('otp');
      setOtp('');
      return;
    }
    setPaidVia(payMethod === 'bank' ? 'Bank Transfer' : 'USSD');
    finishPayment();
  };

  const replicateForOtherBranch = () => {
    const next = BRANCHES.find((option) => !branchKeys.includes(option.key));
    if (!next) return;
    setBranchKeys([next.key]);
    setCheckoutMethod('wallet');
    setPayMethod('card');
    setPayPhase('form');
    setPhase('review');
    showToast(`Setup replicated for ${next.name} — estimates auto-adjusted`);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (phase === 'objective' || (preselected && phase === 'content')) {
      onBack();
      return;
    }
    const index = FLOW_STEPS.indexOf(phase as (typeof FLOW_STEPS)[number]);
    if (index <= 0) {
      onBack();
      return;
    }
    setPhase(FLOW_STEPS[index - 1]);
  };

  const renderBarStepper = (index: number) => (
    <div className="px-margin pt-space-xs pb-space-sm flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        {WIZARD_STEPS.map((label, i) => (
          <div
            className={`h-1.5 flex-1 rounded-full transition-all ${i <= index ? 'bg-primary-container' : 'bg-surface-container-high'}`}
            key={label}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((label, i) => (
          <span
            className={`font-caption text-caption ${i === index ? 'text-primary font-semibold' : i < index ? 'text-text-secondary' : 'text-text-tertiary'}`}
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );

  const renderCircleStepper = (index: number) => (
    <div className="px-margin pt-space-xs pb-space-sm flex items-center justify-between">
      {WIZARD_STEPS.map((label, i) => (
        <div className="flex flex-col items-center gap-1" key={label}>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold ${
              i < index
                ? 'bg-primary-container text-on-primary'
                : i === index
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-text-tertiary'
            }`}
          >
            {i < index ? <Icon name="check" className="text-[14px]" /> : i + 1}
          </div>
          <span
            className={`font-caption text-caption ${i === index ? 'text-primary font-semibold' : 'text-text-tertiary'}`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStepCard = (index: number) => (
    <div className="px-margin pt-space-xs pb-space-sm flex flex-col gap-2">
      <div className="bg-surface-tint-blue rounded-xl px-3 py-2 flex items-center justify-between">
        <span className="font-label-sm text-label-sm font-semibold text-primary">
          Step {index + 1} of {WIZARD_STEPS.length}
        </span>
        <span className="font-caption text-caption text-text-secondary">{WIZARD_STEPS[index]}</span>
      </div>
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((label, i) => (
          <div className="flex flex-col items-center gap-1" key={label}>
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                i <= index ? 'bg-primary-container' : 'bg-surface-container-high'
              }`}
            />
            <span
              className={`font-caption text-caption ${
                i === index ? 'text-primary font-semibold' : 'text-text-tertiary'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEstimatePanel = () => (
    <div className="bg-surface-tint-blue rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
          Live Estimate
        </span>
        <span className="font-caption text-caption text-primary font-semibold flex items-center gap-1">
          <Icon name="near_me" className="text-[13px]" />
          {primaryBranch.name}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
        <span className="font-heading-sm text-heading-sm font-bold text-primary">
          {fmt(low)}–{fmt(high)}
        </span>
        <span className="font-label-sm text-label-sm text-text-secondary">impressions</span>
      </div>
      <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
        <span className="font-caption text-caption text-text-secondary">
          ≈ {fmt(perDay)} / day over {duration} days
        </span>
        <span className="font-caption text-caption text-text-secondary">Reachable: ~{fmt(addressable)} shoppers</span>
      </div>
      <p className="font-caption text-caption text-text-tertiary mt-1.5 leading-snug">
        {capped
          ? 'You have maxed this coverage — widen the area or raise the budget.'
          : 'Widen coverage or raise the budget to grow your reach.'}
      </p>
    </div>
  );

  const renderGrowthCard = () =>
    growthActive ? (
      <div className="bg-surface-tint-blue rounded-xl p-3 flex items-start gap-2.5 border-l-4 border-primary-container">
        <div className="w-8 h-8 rounded-full bg-surface-canvas text-primary flex items-center justify-center shrink-0 shadow-sm">
          <Icon name="workspace_premium" className="text-[18px]" />
        </div>
        <div className="min-w-0">
          <p className="font-label-sm text-label-sm font-semibold text-primary">
            Growth already delivers ~120,000 impressions this month
          </p>
          <p className="font-caption text-caption text-text-secondary mt-0.5 leading-snug">
            This campaign stacks on top of your plan's monthly reach.
          </p>
        </div>
      </div>
    ) : null;

  const renderBankTransferPanel = () => (
    <div className="flex flex-col gap-space-xs py-1">
      <div className="bg-surface-tint-blue rounded-xl p-3 flex flex-col gap-1">
        <span className="font-caption text-caption text-text-secondary">Transfer exactly</span>
        <span className="font-heading-md text-heading-md font-bold text-primary">₦{fmt(budget)}</span>
        <span className="font-caption text-caption text-text-secondary mt-1">to this one-time account</span>
      </div>
      <div className="bg-surface-subtle rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-surface-canvas flex items-center justify-center text-secondary font-label-md font-bold shadow-sm">
            W
          </div>
          <div>
            <p className="font-label-sm text-label-sm font-semibold text-text-primary">Wema Bank</p>
            <p className="font-label-md text-label-md font-bold tracking-wider text-text-primary">1234 5678 90</p>
            <p className="font-caption text-caption text-text-secondary">Urban Grill Boost</p>
          </div>
        </div>
        <Icon name="content_copy" className="text-text-tertiary text-[18px]" />
      </div>
      <p className="font-caption text-caption text-text-tertiary">
        This account expires in 30 minutes. Payment confirms automatically once received.
      </p>
    </div>
  );

  const renderPhase = () => {
    switch (phase) {
      case 'objective':
        return (
          <div className="flex flex-col w-full flex-1">
            {renderBarStepper(0)}
            <div className="px-margin flex flex-col gap-space-sm">
              <div>
                <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                  What's your goal?
                </h2>
                <p className="font-label-sm text-label-sm text-text-secondary mt-1">
                  Pick one objective — we tune delivery and reporting around it.
                </p>
              </div>
              <div className="flex flex-col gap-space-xs">
                {OBJECTIVES.map((entry) => {
                  const active = objective === entry.key;
                  return (
                    <button
                      className={`p-3 rounded-xl flex items-center gap-3 text-left transition-all active:scale-[0.99] ${
                        active
                          ? 'bg-surface-tint-blue border border-primary/25 shadow-sm'
                          : `bg-surface-canvas ${CARD_SHADOW}`
                      }`}
                      key={entry.key}
                      type="button"
                      onClick={() => setObjective(entry.key)}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <Icon name={entry.icon} className="text-[20px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-label-md text-label-md font-semibold text-text-primary block truncate">
                          {entry.title}
                        </span>
                        <span className="font-caption text-caption text-text-secondary">{entry.desc}</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary-container' : 'bg-surface-container-high'
                        }`}
                      >
                        {active && <Icon name="check" className="text-on-primary text-[16px]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={DECK_CLASS}>
              <button className={PRIMARY_BTN} type="button" onClick={() => setPhase('content')}>
                <span>Continue to Content</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="flex flex-col w-full flex-1">
            {renderBarStepper(1)}
            <div className="px-margin flex flex-col gap-space-sm">
              <div>
                <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                  What do you want to boost?
                </h2>
                <p className="font-label-sm text-label-sm text-text-secondary mt-1">
                  Select one or more deals, products, services or your storefront profile.
                </p>
              </div>
              <div className="flex flex-col gap-space-sm">
                {contentPool.map((entry) => {
                  const active = selectedKeys.includes(entry.key);
                  return (
                    <button
                      className={`relative w-full rounded-xl overflow-hidden text-left transition-all active:scale-[0.99] ${
                        active ? 'ring-2 ring-primary shadow-sm' : CARD_SHADOW
                      }`}
                      key={entry.key}
                      type="button"
                      onClick={() => toggleContent(entry.key)}
                    >
                      <div className="relative h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url('${entry.image}')` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 via-on-background/10 to-transparent" />
                        <span
                          className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full font-caption text-caption font-bold ${entry.thumbBadgeClass}`}
                        >
                          {entry.thumbBadge}
                        </span>
                        {active && (
                          <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-sm">
                            <Icon name="check" className="text-on-primary text-[16px]" />
                          </span>
                        )}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            <span className={`font-heading-sm text-heading-sm font-bold drop-shadow-sm ${entry.cardLabelClass}`}>
                              {entry.cardLabel}
                            </span>
                            <p className="font-caption text-caption text-on-primary/90 truncate">{entry.cardDesc}</p>
                          </div>
                          <span className="bg-surface-canvas/90 backdrop-blur-sm px-2 py-0.5 rounded-full font-caption text-caption font-semibold text-text-primary shrink-0">
                            {entry.typeLabel}
                          </span>
                        </div>
                      </div>
                      <div className="bg-surface-canvas p-3 flex items-center justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                            {entry.name}
                          </span>
                          <span className="font-caption text-caption text-text-secondary truncate">{entry.meta}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${entry.statusClass}`}
                        >
                          {entry.statusLabel}
                        </span>
                      </div>
                      <div className="bg-surface-subtle px-3 py-1.5 flex items-center gap-3">
                        <span className="flex items-center gap-1 font-caption text-caption text-text-secondary">
                          <Icon name={entry.perfIcon} className="text-[13px] text-primary" />
                          {entry.perfText}
                        </span>
                        <span className="flex items-center gap-1 font-caption text-caption text-text-tertiary">
                          <Icon name="location_on" className="text-[13px]" />
                          {entry.locText}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="font-caption text-caption text-text-tertiary px-1">
                {selectedKeys.length === 0
                  ? 'Select at least one item to continue.'
                  : `${selectedKeys.length} item${selectedKeys.length > 1 ? 's' : ''} selected.`}
              </p>
            </div>
            <div className={DECK_CLASS}>
              <button
                className={PRIMARY_BTN}
                type="button"
                onClick={() => {
                  if (selectedKeys.length === 0) {
                    showToast('Select at least one item to boost');
                    return;
                  }
                  setPhase('audience');
                }}
              >
                <span>Continue to Audience</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        );
      case 'audience':
        return (
          <div className="flex flex-col w-full flex-1">
            {renderCircleStepper(2)}
            <div className="px-margin flex flex-col gap-space-sm">
              <div>
                <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                  Who should see this?
                </h2>
                <p className="font-label-sm text-label-sm text-text-secondary mt-1">
                  Broadcast to everyone nearby or narrow it down to specific cohorts.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center bg-surface-container-high p-1 rounded-xl gap-1">
                {([
                  { key: 'segments', label: 'Target Cohorts', icon: 'tune' },
                  { key: 'broadcast', label: 'Everyone Nearby', icon: 'cell_tower' },
                ] as const).map((mode) => {
                  const active = audienceMode === mode.key;
                  return (
                    <button
                      className={`flex-1 py-2 rounded-lg font-label-sm text-label-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                        active ? 'bg-surface-canvas text-primary shadow-sm font-semibold' : 'text-text-secondary'
                      }`}
                      key={mode.key}
                      type="button"
                      onClick={() => setAudienceMode(mode.key)}
                    >
                      <Icon name={mode.icon} className="text-[15px]" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {audienceMode === 'segments' ? (
                <div className="flex flex-col gap-space-xs">
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold px-1">
                    Choose cohorts ({cohorts.length} selected)
                  </span>
                  {COHORTS.map((cohort) => {
                    const active = cohorts.includes(cohort.key);
                    return (
                      <button
                        className={`p-3 rounded-xl flex items-center gap-3 text-left transition-all active:scale-[0.99] ${
                          active
                            ? 'bg-surface-tint-blue border border-primary/25 shadow-sm'
                            : `bg-surface-canvas ${CARD_SHADOW}`
                        }`}
                        key={cohort.key}
                        type="button"
                        onClick={() => toggleCohort(cohort.key)}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            active ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          <Icon name={cohort.icon} className="text-[20px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                              {cohort.title}
                            </span>
                            {cohort.badge && (
                              <span className="px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                                {cohort.badge}
                              </span>
                            )}
                          </div>
                          <span className="font-caption text-caption text-text-secondary">{cohort.desc}</span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            active ? 'bg-primary-container' : 'bg-surface-container-high'
                          }`}
                        >
                          {active && <Icon name="check" className="text-on-primary text-[16px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-surface-canvas rounded-xl p-3 flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="cell_tower" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md font-semibold text-text-primary">
                      Everyone within coverage
                    </p>
                    <p className="font-caption text-caption text-text-secondary mt-0.5 leading-snug">
                      Widest possible reach — your campaign is shown to every active shopper inside the coverage area.
                    </p>
                  </div>
                </div>
              )}

              {/* Branch multi-select */}
              <div className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-2">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Branches ({branchKeys.length} selected)
                </span>
                <div className="flex flex-col gap-space-xs">
                  {BRANCHES.map((option) => {
                    const active = branchKeys.includes(option.key);
                    return (
                      <button
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all ${
                          active ? 'bg-surface-tint-blue border border-primary/20' : 'bg-surface-subtle'
                        }`}
                        key={option.key}
                        type="button"
                        onClick={() => toggleBranch(option.key)}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                            active ? 'bg-primary-container' : 'bg-surface-canvas border border-outline-variant'
                          }`}
                        >
                          {active && <Icon name="check" className="text-on-primary text-[14px]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-label-sm text-label-sm font-semibold text-text-primary block truncate">
                            {option.name}
                          </span>
                          <span className="font-caption text-caption text-text-secondary">{option.area}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Radius presets */}
              <div className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-medium text-text-primary">Coverage radius</span>
                  <span className="font-label-sm text-label-sm font-bold text-primary">{radius} km</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  {RADIUS_PRESETS.map((preset) => {
                    const active = radius === preset;
                    return (
                      <button
                        className={`flex-1 py-2 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${
                          active
                            ? 'bg-primary-container text-on-primary shadow-sm'
                            : 'bg-surface-subtle text-text-secondary'
                        }`}
                        key={preset}
                        type="button"
                        onClick={() => setRadius(preset)}
                      >
                        {preset} km
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Districts */}
              <div className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-2">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Priority districts
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DISTRICTS.map((name) => {
                    const active = districts.includes(name);
                    return (
                      <button
                        className={`px-space-sm py-1.5 rounded-full font-caption text-caption font-medium transition-colors ${
                          active
                            ? 'bg-primary-container text-on-primary font-semibold'
                            : 'bg-surface-subtle text-text-secondary'
                        }`}
                        key={name}
                        type="button"
                        onClick={() => toggleDistrict(name)}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-space-xs">{renderEstimatePanel()}</div>
            </div>
            <div className={DECK_CLASS}>
              <button className={PRIMARY_BTN} type="button" onClick={() => setPhase('schedule')}>
                <span>Continue to Schedule</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="flex flex-col w-full flex-1">
            {renderBarStepper(3)}
            <div className="px-margin flex flex-col gap-space-sm">
              <div>
                <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                  When should it run?
                </h2>
                <p className="font-label-sm text-label-sm text-text-secondary mt-1">
                  Set duration and the best hours to reach hungry customers.
                </p>
              </div>

              {/* Duration presets */}
              <div className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-2">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Duration
                </span>
                <div className="flex items-center gap-space-xs">
                  {DURATION_PRESETS.map((preset) => {
                    const active = duration === preset;
                    return (
                      <button
                        className={`flex-1 py-2 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${
                          active
                            ? 'bg-primary-container text-on-primary shadow-sm'
                            : 'bg-surface-subtle text-text-secondary'
                        }`}
                        key={preset}
                        type="button"
                        onClick={() => {
                          setShowCustomDays(false);
                          applyDuration(preset);
                        }}
                      >
                        {preset} days
                      </button>
                    );
                  })}
                  <button
                    className={`flex-1 py-2 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${
                      showCustomDays
                        ? 'bg-primary-container text-on-primary shadow-sm'
                        : 'bg-surface-subtle text-text-secondary'
                    }`}
                    type="button"
                    onClick={() => setShowCustomDays(true)}
                  >
                    Custom
                  </button>
                </div>
                {showCustomDays && (
                  <div className="flex items-center gap-1.5">
                    <input
                      aria-label="Custom duration in days"
                      className="w-full h-11 px-3 rounded-lg bg-surface-subtle font-label-md text-label-md text-text-primary focus:outline-none focus:bg-surface-canvas shadow-inner"
                      inputMode="numeric"
                      type="text"
                      value={durationInput}
                      onChange={(event) => handleDurationInput(event.target.value)}
                      onBlur={() => setDurationInput(String(duration))}
                    />
                    <span className="font-label-sm text-label-sm text-text-secondary shrink-0">days</span>
                  </div>
                )}
              </div>

              {/* Date cards */}
              <div className="grid grid-cols-2 gap-space-xs">
                <div className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Icon name="event" className="text-[16px]" />
                    <span className="font-caption text-caption font-semibold uppercase tracking-wider">Starts</span>
                  </div>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    {fmtDate(startDate)}, 12:00 PM
                  </span>
                </div>
                <div className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Icon name="event_busy" className="text-[16px]" />
                    <span className="font-caption text-caption font-semibold uppercase tracking-wider">Ends</span>
                  </div>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    {fmtDate(endDate)}, 11:59 PM
                  </span>
                </div>
              </div>

              {/* Instant launch */}
              <button
                className={`bg-surface-canvas rounded-xl p-3 shadow-sm flex items-center gap-3 text-left transition-all ${
                  instantLaunch ? 'border border-primary/25' : ''
                }`}
                type="button"
                onClick={() => setInstantLaunch((prev) => !prev)}
              >
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="bolt" className="text-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Launch immediately after review
                  </span>
                  <p className="font-caption text-caption text-text-secondary">
                    Goes live as soon as your ad passes review (~30 mins)
                  </p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                    instantLaunch ? 'bg-primary-container' : 'bg-surface-container-high'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-surface-canvas shadow-sm transition-transform ${
                      instantLaunch ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Dayparting */}
              <div className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-2.5">
                <button className="flex items-center gap-3 text-left" type="button" onClick={() => setDayparting((prev) => !prev)}>
                  <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="schedule" className="text-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      Schedule by time of day
                    </span>
                    <p className="font-caption text-caption text-text-secondary">
                      Show your campaign only during peak rush windows
                    </p>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                      dayparting ? 'bg-primary-container' : 'bg-surface-container-high'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-surface-canvas shadow-sm transition-transform ${
                        dayparting ? 'translate-x-5' : ''
                      }`}
                    />
                  </div>
                </button>

                {dayparting && (
                  <>
                    <div className="flex flex-col gap-space-xs">
                      {RUSH_WINDOWS.map((window) => {
                        const active = rushWindows.includes(window.key);
                        return (
                          <button
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all ${
                              active ? 'bg-surface-tint-blue border border-primary/20' : 'bg-surface-subtle'
                            }`}
                            key={window.key}
                            type="button"
                            onClick={() => toggleRushWindow(window.key)}
                          >
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                active ? 'bg-primary-container' : 'bg-surface-canvas border border-outline-variant'
                              }`}
                            >
                              {active && <Icon name="check" className="text-on-primary text-[14px]" />}
                            </div>
                            <Icon name={window.icon} className={`text-[18px] shrink-0 ${active ? 'text-primary' : 'text-text-tertiary'}`} />
                            <div className="flex-1 min-w-0">
                              <span className="font-label-sm text-label-sm font-semibold text-text-primary block truncate">
                                {window.label}
                              </span>
                              <span className="font-caption text-caption text-text-secondary">{window.time}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                        Active days
                      </span>
                      <div className="flex items-center justify-between">
                        {DAY_NODES.map((day) => {
                          const active = activeDays.includes(day.key);
                          return (
                            <button
                              className={`w-9 h-9 rounded-full font-label-sm text-label-sm font-bold transition-all ${
                                active
                                  ? 'bg-primary-container text-on-primary shadow-sm'
                                  : 'bg-surface-subtle text-text-tertiary'
                              }`}
                              key={day.key}
                              type="button"
                              onClick={() => toggleActiveDay(day.key)}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Icon name="local_fire_department" className="text-badge-discount-text text-[16px]" />
                        <span className="font-caption text-caption text-text-secondary">
                          Weekend Focus — Fri, Sat & Sun drive the highest POS conversions.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Auto-renew */}
              <button
                className={`bg-surface-canvas rounded-xl p-3 shadow-sm flex items-center gap-3 text-left transition-all ${
                  autoRenew ? 'border border-primary/25' : ''
                }`}
                type="button"
                onClick={() => setAutoRenew((prev) => !prev)}
              >
                <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <Icon name="event_repeat" className="text-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Auto-renew when it ends
                  </span>
                  <p className="font-caption text-caption text-text-secondary">
                    Rolls the campaign over for another {duration} days automatically
                  </p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                    autoRenew ? 'bg-primary-container' : 'bg-surface-container-high'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-surface-canvas shadow-sm transition-transform ${
                      autoRenew ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Pro tip */}
              <div className="bg-surface-tint-blue rounded-xl p-3 flex items-start gap-2.5">
                <Icon name="lightbulb" className="text-primary text-[18px] mt-0.5 shrink-0" />
                <p className="font-caption text-caption text-text-secondary leading-snug">
                  Lunch-time campaigns in Wuse II redeem{' '}
                  <span className="font-semibold text-primary">2.3x more vouchers</span> than all-day runs — keep the
                  lunch window selected.
                </p>
              </div>
            </div>
            <div className={DECK_CLASS}>
              <button className={PRIMARY_BTN} type="button" onClick={() => setPhase('budget')}>
                <span>Continue to Budget</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        );
      case 'budget':
        return (
          <div className="flex flex-col w-full flex-1">
            {renderStepCard(4)}
            <div className="px-margin flex flex-col gap-space-sm">
              <div>
                <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                  Set your campaign budget
                </h2>
                <p className="font-label-sm text-label-sm text-text-secondary mt-1">
                  Pick a tier or enter a custom amount — we spread the spend across {duration} days.
                </p>
              </div>

              {/* Tiers */}
              <div className="flex flex-col gap-space-xs">
                {BUDGET_TIERS.map((tier) => {
                  const active = budget === tier.amount;
                  return (
                    <button
                      className={`relative p-3 rounded-xl flex items-center gap-3 text-left transition-all active:scale-[0.99] ${
                        active
                          ? 'bg-surface-tint-blue border border-primary/25 shadow-sm'
                          : `bg-surface-canvas ${CARD_SHADOW}`
                      }`}
                      key={tier.amount}
                      type="button"
                      onClick={() => applyBudgetAmount(tier.amount)}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold shadow-sm">
                          Most Popular
                        </span>
                      )}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <Icon name="payments" className="text-[20px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                            ₦{fmt(tier.amount)}
                          </span>
                          <span className="font-caption text-caption font-semibold text-primary">{tier.label}</span>
                        </div>
                        <span className="font-caption text-caption text-text-secondary">{tier.desc}</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary-container' : 'bg-surface-container-high'
                        }`}
                      >
                        {active && <Icon name="check" className="text-on-primary text-[16px]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Budget type + stepper */}
              <div className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-2.5">
                <div className="flex items-center bg-surface-container-high p-1 rounded-xl gap-1">
                  {([
                    { key: 'total', label: 'Total budget' },
                    { key: 'daily', label: 'Per day' },
                  ] as const).map((mode) => {
                    const active = budgetType === mode.key;
                    return (
                      <button
                        className={`flex-1 py-1.5 rounded-lg font-label-sm text-label-sm font-medium transition-all ${
                          active ? 'bg-surface-canvas text-primary shadow-sm font-semibold' : 'text-text-secondary'
                        }`}
                        key={mode.key}
                        type="button"
                        onClick={() => switchBudgetType(mode.key)}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    aria-label="Decrease budget"
                    className="w-11 h-11 rounded-xl bg-surface-subtle text-text-secondary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
                    type="button"
                    disabled={budget <= effectiveMin}
                    onClick={() => stepBudget(-1)}
                  >
                    <Icon name="remove" className="text-[20px]" />
                  </button>
                  <div className="flex flex-col items-center min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-heading-md text-heading-md font-bold text-text-primary">₦</span>
                      <input
                        aria-label="Campaign budget amount"
                        className="w-28 h-11 text-center bg-transparent font-heading-md text-heading-md font-bold text-text-primary focus:outline-none"
                        inputMode="numeric"
                        type="text"
                        value={budgetInput}
                        onChange={(event) => handleBudgetInput(event.target.value)}
                        onBlur={() =>
                          setBudgetInput(budgetType === 'total' ? String(budget) : String(Math.round(budget / duration)))
                        }
                      />
                    </div>
                    <span className="font-caption text-caption text-text-secondary">
                      {budgetType === 'total' ? `≈ ₦${fmt(perDaySpend)}/day` : `₦${fmt(perDaySpend)} × ${duration} days`}
                    </span>
                  </div>
                  <button
                    aria-label="Increase budget"
                    className="w-11 h-11 rounded-xl bg-surface-subtle text-text-secondary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
                    type="button"
                    disabled={budget >= MAX_BUDGET}
                    onClick={() => stepBudget(1)}
                  >
                    <Icon name="add" className="text-[20px]" />
                  </button>
                </div>
                <p className="font-caption text-caption text-text-tertiary">
                  Minimum ₦{fmt(effectiveMin)} for {duration} days • max ₦{fmt(MAX_BUDGET)}.
                </p>
              </div>

              {/* Auto-debit */}
              <button
                className={`bg-surface-canvas rounded-xl p-3 shadow-sm flex items-center gap-3 text-left transition-all ${
                  autoDebit ? 'border border-primary/25' : ''
                }`}
                type="button"
                onClick={() => setAutoDebit((prev) => !prev)}
              >
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="sync" className="text-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Top up wallet automatically
                  </span>
                  <p className="font-caption text-caption text-text-secondary">
                    Auto-debits your bank when wallet runs low mid-campaign
                  </p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                    autoDebit ? 'bg-primary-container' : 'bg-surface-container-high'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-surface-canvas shadow-sm transition-transform ${
                      autoDebit ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </button>

              <div className="mt-space-xs">{renderEstimatePanel()}</div>
              {renderGrowthCard()}
            </div>
            <div className={DECK_CLASS}>
              <button className={PRIMARY_BTN} type="button" onClick={() => setPhase('review')}>
                <span>Continue to Review</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        );

      case 'review': {
        const walletPart = Math.min(budget, WALLET_BALANCE);
        const cardPart = budget - walletPart;
        const claimsLow = Math.round(low * 0.007);
        const claimsHigh = Math.round(high * 0.007);
        const roasReturn = budget * 40;
        const activeRushLabels = RUSH_WINDOWS.filter((window) => rushWindows.includes(window.key))
          .map((window) => `${window.label} (${window.time})`)
          .join(' & ');
        const dayLabels = activeDays.map((key) => DAY_NAMES[key] ?? key).join(', ');
        const selectedCohortChips =
          audienceMode === 'broadcast'
            ? ['Everyone Nearby']
            : cohorts.map((key) => COHORTS.find((entry) => entry.key === key)?.title ?? key);

        const reviewCardHeader = (icon: string, label: string, value: string, onEdit: () => void) => (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <Icon name={icon} className="text-[18px]" />
              </div>
              <div className="min-w-0">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-medium">
                  {label}
                </span>
                <h4 className="font-label-md text-label-md text-on-surface font-semibold truncate">{value}</h4>
              </div>
            </div>
            <button
              className="px-space-xs py-1 rounded-lg text-primary hover:bg-surface-tint-blue font-label-md text-label-md font-semibold transition-colors flex items-center gap-0.5 shrink-0"
              type="button"
              onClick={onEdit}
            >
              Edit
              <Icon name="chevron_right" className="text-[16px]" />
            </button>
          </div>
        );

        return (
          <div className="flex flex-col w-full flex-1">
            {/* Step tracker */}
            <section className="px-margin pt-space-md pb-space-xs flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Step 6 of 6
                </span>
                <span className="inline-flex items-center gap-space-2xs px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <Icon name="verified" className="text-[14px]" />
                  Final Step
                </span>
              </div>
              <div className="flex items-center justify-between gap-space-2xs pt-1">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div className="flex items-center gap-space-2xs" key={index}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-badge-discount-bg text-badge-discount-text shrink-0 shadow-sm">
                      <Icon name="check" className="text-[16px] font-bold" />
                    </div>
                    <div className="h-1 flex-1 rounded-full bg-badge-discount-text" />
                  </div>
                ))}
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm shadow-md ring-2 ring-primary-fixed">
                  <span>6</span>
                </div>
              </div>
            </section>

            <section className="px-margin pt-space-xs pb-space-sm">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading-md text-heading-md text-on-surface tracking-tight">
                  Review Campaign Summary
                </h2>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  Double-check all campaign parameters before deploying to local discovery feeds.
                </p>
              </div>
            </section>

            {/* Impact forecast */}
            <section className="px-margin mb-space-md">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-tint-blue via-surface-container-low to-surface-container p-space-md shadow-sm">
                <div className="flex items-center justify-between mb-space-sm gap-2">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-sm shrink-0">
                      <Icon name="query_stats" className="text-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">
                        Estimated Reach & Impact
                      </h3>
                      <span className="font-caption text-caption text-text-secondary">
                        Projected {duration}-Day Performance Window
                      </span>
                    </div>
                  </div>
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-container-lowest text-primary font-caption text-caption font-semibold shadow-sm shrink-0">
                    94% High Confidence
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-space-xs">
                  <div className="bg-surface-container-lowest rounded-lg p-space-xs flex flex-col justify-between shadow-sm">
                    <span className="font-caption text-caption text-text-secondary">Local Reach</span>
                    <div className="mt-1">
                      <span className="font-heading-sm text-heading-sm text-text-primary block font-bold">
                        {fmtK(low)}–{fmtK(high)}
                      </span>
                      <span className="font-caption text-caption text-badge-discount-text flex items-center gap-0.5">
                        <Icon name="trending_up" className="text-[12px]" />
                        +34% pop.
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest rounded-lg p-space-xs flex flex-col justify-between shadow-sm">
                    <span className="font-caption text-caption text-text-secondary">Claims</span>
                    <div className="mt-1">
                      <span className="font-heading-sm text-heading-sm text-text-primary block font-bold">
                        {fmt(claimsLow)}–{fmt(claimsHigh)}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">vouchers</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest rounded-lg p-space-xs flex flex-col justify-between shadow-sm">
                    <span className="font-caption text-caption text-text-secondary">Est. Return</span>
                    <div className="mt-1">
                      <span className="font-heading-sm text-heading-sm text-primary font-bold block leading-none">
                        ~{fmtShort(roasReturn)}
                      </span>
                      <span className="font-caption text-caption text-badge-discount-text">40x ROAS</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Summary accordion cards */}
            <section className="px-margin flex flex-col gap-space-sm pb-space-xl">
              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
                {reviewCardHeader(
                  'ads_click',
                  'Objective',
                  OBJECTIVES.find((entry) => entry.key === objective)?.title ?? '',
                  () => setPhase('objective'),
                )}
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm">
                {reviewCardHeader(
                  'layers',
                  'Featured Content',
                  `${selectedKeys.length} Active Asset${selectedKeys.length > 1 ? 's' : ''} Attached`,
                  () => setPhase('content'),
                )}
                {item && (
                  <div className="rounded-xl bg-surface-subtle p-space-xs flex gap-space-sm items-center">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                      <span
                        className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-full font-caption text-caption font-bold tracking-tight ${item.thumbBadgeClass}`}
                      >
                        {item.cardLabel}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0 pr-space-2xs">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon name="storefront" className="text-[14px] text-primary" />
                        <span className="font-caption text-caption text-text-secondary truncate">
                          {primaryBranch.name} — Storefront
                        </span>
                      </div>
                      <p className="font-label-md text-label-md text-text-primary font-semibold truncate leading-snug">
                        {item.name}
                      </p>
                      <span className="font-caption text-caption text-text-tertiary truncate mt-0.5">{item.meta}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-xs">
                {reviewCardHeader(
                  'groups',
                  'Audience & Targeting',
                  audienceMode === 'broadcast'
                    ? 'Everyone Nearby'
                    : `${cohorts.length} Segments • ${fmt(addressable)} Known Diners`,
                  () => setPhase('audience'),
                )}
                <div className="pl-10 flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center gap-space-xs text-text-secondary font-body-md text-body-md">
                    <Icon name="radar" className="text-[18px] text-secondary" />
                    <span className="text-on-surface font-medium">Radius:</span>
                    <span>{radius.toFixed(1)} km around {primaryBranch.name}</span>
                  </div>
                  <div className="flex items-center gap-space-xs text-text-secondary font-body-md text-body-md">
                    <Icon name="explore" className="text-[18px] text-secondary" />
                    <span className="text-on-surface font-medium">Clusters:</span>
                    <span>{districts.length ? districts.join(' & ') : 'All nearby districts'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCohortChips.map((label) => (
                      <span
                        className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption"
                        key={label}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-xs">
                {reviewCardHeader(
                  'location_on',
                  'Campaign Venues',
                  `${branches.length} Selected Outlet${branches.length > 1 ? 's' : ''}`,
                  () => setPhase('audience'),
                )}
                <div className="pl-10 flex flex-col gap-2 pt-1">
                  {branches.map((option, index) => (
                    <div
                      className="flex items-center justify-between bg-surface-subtle p-space-xs rounded-lg"
                      key={option.key}
                    >
                      <div className="flex items-center gap-space-xs min-w-0">
                        <Icon name="store" className={`text-[18px] ${index === 0 ? 'text-primary' : 'text-secondary'}`} />
                        <span className="font-label-md text-label-md text-on-surface truncate font-medium">
                          {option.name}
                        </span>
                      </div>
                      <span
                        className={`font-caption text-caption font-semibold shrink-0 ${
                          index === 0 ? 'text-badge-discount-text' : 'text-text-secondary'
                        }`}
                      >
                        {index === 0 ? 'Primary' : 'Branch'}
                      </span>
                    </div>
                  ))}
                  <div className="w-full h-24 rounded-lg overflow-hidden shadow-inner mt-1 relative flex items-end p-space-xs bg-surface-container-low">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, rgba(20,27,43,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,27,43,0.06) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                      }}
                    />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
                        <Icon name="pin_drop" className="text-primary text-[18px]" />
                      </div>
                    </div>
                    <div className="relative bg-surface-canvas/90 backdrop-blur-sm px-space-xs py-1 rounded-md shadow-sm flex items-center gap-1">
                      <Icon name="pin_drop" className="text-[14px] text-primary" />
                      <span className="font-caption text-caption text-on-surface font-semibold">
                        Abuja Metro Coverage Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-xs">
                {reviewCardHeader(
                  'calendar_today',
                  'Schedule & Timing',
                  `${fmtDate(startDate)} – ${fmtDate(endDate)} (${duration} Days)`,
                  () => setPhase('schedule'),
                )}
                <div className="pl-10 flex flex-col gap-2 pt-1 font-body-md text-body-md text-text-secondary">
                  <div className="flex items-start gap-space-xs">
                    <Icon name="schedule" className="text-[18px] text-secondary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-on-surface font-medium">Dayparting:</span>
                      <p className="font-caption text-caption text-text-secondary">
                        {dayparting && activeRushLabels ? activeRushLabels : 'All day delivery'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <Icon name="speed" className="text-[18px] text-secondary shrink-0" />
                    <div>
                      <span className="text-on-surface font-medium">Weighting:</span>
                      <span className="font-caption text-caption text-text-secondary">
                        {dayLabels || 'All week'} peak dynamic boost
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm">
                {reviewCardHeader(
                  'payments',
                  'Budget & Funding',
                  `₦${fmt(budget)} Total Allocation`,
                  () => setPhase('budget'),
                )}
                <div className="pl-10 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="text-text-secondary">Pacing Rate</span>
                    <span className="font-semibold text-text-primary">₦{fmt(perDaySpend)} / active day</span>
                  </div>
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="text-text-secondary">VEMTAP Commission</span>
                    <span className="font-semibold text-badge-discount-text flex items-center gap-0.5">
                      <Icon name="check_circle" className="text-[16px]" />
                      ₦0 (0% Fee)
                    </span>
                  </div>
                  <div className="bg-surface-subtle p-space-xs rounded-lg flex flex-col gap-1 mt-1">
                    <span className="font-caption text-caption text-text-secondary font-medium">
                      Split Payment Authorization:
                    </span>
                    <div className="flex items-center justify-between font-label-sm text-label-sm">
                      <span className="flex items-center gap-1 text-on-surface">
                        <Icon name="account_balance_wallet" className="text-[16px] text-primary" />
                        VEMTAP Wallet
                      </span>
                      <span className="font-semibold text-text-primary">₦{fmt(walletPart)}</span>
                    </div>
                    {cardPart > 0 && (
                      <div className="flex items-center justify-between font-label-sm text-label-sm">
                        <span className="flex items-center gap-1 text-on-surface">
                          <Icon name="credit_card" className="text-[16px] text-secondary" />
                          Linked Card (Mastercard •• 4912)
                        </span>
                        <span className="font-semibold text-text-primary">₦{fmt(cardPart)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-space-sm bg-surface-tint-blue rounded-xl flex items-start gap-space-sm">
                <button
                  aria-label="Agree to VEMTAP advertising policy"
                  className={`w-5 h-5 rounded shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    terms ? 'bg-primary-container' : 'bg-surface-canvas border border-outline-variant'
                  }`}
                  type="button"
                  onClick={() => setTerms((prev) => !prev)}
                >
                  {terms && <Icon name="check" className="text-on-primary text-[14px]" />}
                </button>
                <p className="font-caption text-caption text-text-secondary leading-snug">
                  I agree to the <span className="text-primary font-semibold">VEMTAP Advertising Standards & Policy</span>
                  . Campaign spend is paced predictably and strictly capped at{' '}
                  <strong className="text-on-surface">₦{fmt(budget)}</strong> with zero hidden overage charges.
                </p>
              </div>

              {renderGrowthCard()}
            </section>

            <div className={DECK_CLASS}>
              <button className={PRIMARY_BTN} type="button" onClick={() => setPhase('payment')}>
                <Icon name="rocket_launch" className="text-[20px]" />
                <span>Launch Campaign (₦{fmt(budget)})</span>
              </button>
              <button
                className="w-full h-11 rounded-xl text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary transition-colors flex items-center justify-center"
                type="button"
                onClick={() => {
                  showToast('Campaign saved as draft');
                  onDone();
                }}
              >
                Save as Draft
              </button>
            </div>
          </div>
        );
      }
      case 'payment':
        return (
          <div className="flex flex-col w-full flex-1">
            <div className="px-margin pt-space-xs flex flex-col gap-space-sm">
              <div>
                <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                  Complete your payment
                </h2>
                <p className="font-label-sm text-label-sm text-text-secondary mt-1">
                  One-time campaign payment — secure checkout.
                </p>
              </div>

              {/* Total cost card */}
              <div className="bg-surface-tint-blue rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Total campaign cost</span>
                  <span className="font-heading-md text-heading-md font-bold text-primary">₦{fmt(budget)}</span>
                </div>
                <span className="font-caption text-caption text-text-secondary text-right">
                  {duration} days • ≈₦{fmt(perDaySpend)}/day
                </span>
              </div>

              {/* Method picker */}
              <div className="flex flex-col gap-space-xs">
                {([
                  { key: 'wallet', icon: 'account_balance_wallet', title: 'VEMTAP Business Wallet', desc: `Balance ₦${fmt(WALLET_BALANCE)} • instant, no fees` },
                  { key: 'gateway', icon: 'credit_card', title: 'Debit Card via Paystack', desc: 'Visa, Verve & Mastercard accepted' },
                  { key: 'transfer', icon: 'swap_horiz', title: 'Bank Transfer', desc: 'One-time virtual account' },
                ] as const).map((method) => {
                  const active = checkoutMethod === method.key;
                  return (
                    <button
                      className={`p-3 rounded-xl flex items-center gap-3 text-left transition-all active:scale-[0.99] ${
                        active
                          ? method.key === 'wallet'
                            ? 'bg-badge-discount-bg/40 border border-badge-discount-text/40 shadow-sm'
                            : method.key === 'gateway'
                              ? 'bg-surface-tint-blue border border-primary/25 shadow-sm'
                              : `bg-surface-canvas border border-primary/25 shadow-sm`
                          : `bg-surface-canvas ${CARD_SHADOW}`
                      }`}
                      key={method.key}
                      type="button"
                      onClick={() => {
                        setCheckoutMethod(method.key);
                        setPayPhase('form');
                      }}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          active
                            ? method.key === 'wallet'
                              ? 'bg-badge-discount-bg text-badge-discount-text'
                              : 'bg-primary-container text-on-primary'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <Icon name={method.icon} className="text-[20px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-label-md text-label-md font-semibold text-text-primary block truncate">
                          {method.title}
                        </span>
                        <span className="font-caption text-caption text-text-secondary">{method.desc}</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary-container' : 'bg-surface-container-high'
                        }`}
                      >
                        {active && <Icon name="check" className="text-on-primary text-[16px]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Wallet panel */}
              {checkoutMethod === 'wallet' && (
                <div className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-surface-subtle rounded-lg px-3 py-2.5">
                    <span className="font-caption text-caption text-text-secondary">Wallet balance</span>
                    <span className="font-label-md text-label-md font-bold text-text-primary">₦{fmt(WALLET_BALANCE)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-surface-subtle rounded-lg px-3 py-2.5">
                    <span className="font-caption text-caption text-text-secondary">After payment</span>
                    <span
                      className={`font-label-md text-label-md font-bold ${
                        budget > WALLET_BALANCE ? 'text-badge-discount-text' : 'text-primary'
                      }`}
                    >
                      ₦{fmt(Math.max(WALLET_BALANCE - budget, 0))}
                    </span>
                  </div>
                  {budget > WALLET_BALANCE && (
                    <div className="bg-badge-discount-bg/50 rounded-lg px-3 py-2 flex items-start gap-1.5">
                      <Icon name="error" className="text-badge-discount-text text-[15px] mt-0.5 shrink-0" />
                      <p className="font-caption text-caption text-text-secondary leading-snug">
                        Not enough wallet balance — top up ₦{fmt(budget - WALLET_BALANCE)} more or pick another method.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Gateway Paystack panel */}
              {checkoutMethod === 'gateway' && (
                <div className="bg-surface-canvas rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-surface-container-low px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-label-md font-bold">
                        P
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm font-semibold text-text-primary">
                          Paystack Secure Checkout
                        </p>
                        <p className="font-caption text-caption text-text-secondary">Test mode — sandbox enabled</p>
                      </div>
                    </div>
                    <Icon name="lock" className="text-badge-discount-text text-[18px]" />
                  </div>
                  <div className="p-4 flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between bg-surface-subtle rounded-lg px-3 py-2.5">
                      <div>
                        <p className="font-caption text-caption text-text-secondary">Urban Grill & Bistro</p>
                        <p className="font-label-sm text-label-sm font-medium text-text-primary">boost@urbangrill.ng</p>
                      </div>
                      <span className="font-heading-sm text-heading-sm font-bold text-text-primary">₦{fmt(budget)}</span>
                    </div>
                    <div className="flex items-center bg-surface-container-high p-[3px] rounded-full">
                      {[
                        { key: 'card', label: 'Card', icon: 'credit_card' },
                        { key: 'bank', label: 'Bank', icon: 'account_balance' },
                        { key: 'ussd', label: 'USSD', icon: 'phone_iphone' },
                      ].map((method) => {
                        const active = payMethod === method.key;
                        return (
                          <button
                            className={`flex-1 py-1.5 rounded-full font-label-sm text-label-sm font-medium flex items-center justify-center gap-1 transition-all ${
                              active ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary'
                            }`}
                            key={method.key}
                            type="button"
                            onClick={() => {
                              setPayMethod(method.key as 'card' | 'bank' | 'ussd');
                              setPayPhase('form');
                            }}
                          >
                            <Icon name={method.icon} className="text-[15px]" />
                            {method.label}
                          </button>
                        );
                      })}
                    </div>

                    {payMethod === 'card' && payPhase === 'form' && (
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-caption text-caption text-text-secondary font-medium">Card Number</span>
                          <div className="relative flex items-center bg-surface-subtle rounded-lg shadow-inner">
                            <Icon name="credit_card" className="absolute left-3 text-text-tertiary text-[18px]" />
                            <input
                              className="w-full h-11 pl-10 pr-3 bg-transparent font-label-md text-label-md text-text-primary tracking-wider focus:outline-none"
                              inputMode="numeric"
                              type="text"
                              value={cardNumber}
                              onChange={(event) => setCardNumber(formatCard(event.target.value))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-space-xs">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-caption text-caption text-text-secondary font-medium">Expiry</span>
                            <input
                              className="h-11 px-3 bg-surface-subtle rounded-lg font-label-md text-label-md text-text-primary focus:outline-none shadow-inner"
                              placeholder="09 / 30"
                              type="text"
                              defaultValue="09 / 30"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="font-caption text-caption text-text-secondary font-medium">CVV</span>
                            <input
                              className="h-11 px-3 bg-surface-subtle rounded-lg font-label-md text-label-md text-text-primary focus:outline-none shadow-inner"
                              placeholder="408"
                              type="text"
                              defaultValue="408"
                            />
                          </div>
                        </div>
                        <p className="font-caption text-caption text-text-tertiary flex items-center gap-1">
                          <Icon name="info" className="text-[13px]" />
                          Sandbox test card prefilled — live cards are never charged in test mode.
                        </p>
                      </div>
                    )}

                    {payMethod === 'card' && payPhase === 'otp' && (
                      <div className="flex flex-col gap-space-xs py-1">
                        <span className="font-label-sm text-label-sm font-medium text-text-primary">
                          Enter the OTP sent to +234 803 900 2210
                        </span>
                        <input
                          aria-label="Payment OTP"
                          className="w-full h-12 px-4 bg-surface-subtle rounded-xl font-heading-sm text-heading-sm tracking-[0.4em] text-text-primary text-center focus:outline-none focus:bg-surface-canvas shadow-inner"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="••••••"
                          type="text"
                          value={otp}
                          onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').substring(0, 6))}
                        />
                        <p className="font-caption text-caption text-text-tertiary flex items-center gap-1">
                          <Icon name="info" className="text-[13px]" />
                          Sandbox OTP: 123456 — any code works in test mode.
                        </p>
                      </div>
                    )}

                    {payMethod === 'bank' && renderBankTransferPanel()}

                    {payMethod === 'ussd' && (
                      <div className="flex flex-col gap-space-2xs py-1">
                        <span className="font-label-sm text-label-sm font-medium text-text-primary">
                          Dial this code on your registered bank phone:
                        </span>
                        <div className="grid grid-cols-2 gap-space-xs">
                          {USSD_BANKS.map((bank) => (
                            <div className="bg-surface-subtle rounded-lg p-2 flex flex-col" key={bank.bank}>
                              <span className="font-caption text-caption text-text-secondary">{bank.bank}</span>
                              <span className="font-label-md text-label-md font-semibold text-text-primary">
                                {bank.code}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="font-caption text-caption text-text-tertiary">
                          Enter your PIN on your phone to authorize the ₦{fmt(budget)} payment.
                        </p>
                      </div>
                    )}

                    {payPhase === 'processing' && (
                      <div className="py-4 flex flex-col items-center gap-2">
                        <Icon name="progress_activity" className="animate-spin text-primary text-[28px]" />
                        <p className="font-label-md text-label-md font-medium text-text-primary">
                          Verifying payment with Paystack...
                        </p>
                        <p className="font-caption text-caption text-text-tertiary">Do not close this page</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transfer panel */}
              {checkoutMethod === 'transfer' && renderBankTransferPanel()}

              {/* Terms */}
              <button className="flex items-start gap-2.5 text-left pb-1" type="button" onClick={() => setTerms((prev) => !prev)}>
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                    terms ? 'bg-primary-container' : 'bg-surface-canvas border border-outline-variant'
                  }`}
                >
                  {terms && <Icon name="check" className="text-on-primary text-[14px]" />}
                </div>
                <p className="font-caption text-caption text-text-secondary leading-snug">
                  I agree to the VEMTAP Ads policy and campaign terms. Spend is one-time and non-refundable once the
                  campaign goes live.
                </p>
              </button>

              <p className="font-caption text-caption text-text-tertiary text-center px-2">
                <Icon name="shield" className="text-[12px] align-middle" /> NDPR-compliant processing. Card data never
                touches our servers.
              </p>
            </div>

            <div className={DECK_CLASS}>
              {payPhase === 'processing' && checkoutMethod === 'gateway' ? (
                <div className="w-full h-11 rounded-xl bg-surface-container-high text-text-tertiary font-button-secondary text-button-secondary flex items-center justify-center">
                  Processing ₦{fmt(budget)}...
                </div>
              ) : (
                <button
                  className={PRIMARY_BTN}
                  type="button"
                  onClick={handleLaunch}
                >
                  <Icon name={checkoutMethod === 'wallet' ? 'account_balance_wallet' : 'lock'} className="text-[18px]" />
                  <span>
                    {checkoutMethod === 'wallet'
                      ? budget > WALLET_BALANCE
                        ? 'Wallet Balance Too Low'
                        : `Pay ₦${fmt(budget)} from Wallet`
                      : checkoutMethod === 'transfer'
                        ? "I've sent the money"
                        : payMethod === 'card' && payPhase === 'otp'
                          ? `Confirm OTP & Pay ₦${fmt(budget)}`
                          : payMethod === 'card'
                            ? `Pay ₦${fmt(budget)}`
                            : payMethod === 'bank'
                              ? "I've sent the money"
                              : "I've dialed the code"}
                  </span>
                </button>
              )}
              <button
                className="h-10 font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary transition-colors"
                type="button"
                onClick={() => {
                  showToast('Campaign saved as draft');
                  onDone();
                }}
              >
                Save as Draft & Exit
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col w-full flex-1 px-margin pb-space-lg">
            <div className="pt-space-lg flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute w-20 h-20 rounded-full bg-primary/10 animate-ping opacity-30" />
                <div className="relative w-16 h-16 rounded-full bg-surface-tint-blue flex items-center justify-center shadow-md">
                  <Icon name="pending_review" filled className="text-primary text-[30px]" />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-sm">
                    <Icon name="check" className="text-badge-discount-text text-[15px]" />
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 mb-2 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                Payment Successful
              </span>
              <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                Your campaign is in review
              </h2>
              <p className="font-label-sm text-label-sm text-text-secondary mt-1 max-w-[320px]">
                We're reviewing your campaign and it will be up and running shortly — we'll notify you the moment it
                goes live.
              </p>
            </div>

            {/* Review pipeline */}
            <div className="mt-space-md bg-surface-canvas rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                    <Icon name="check" className="text-[16px] font-bold" />
                  </div>
                  <span className="font-label-sm text-label-sm font-medium text-text-primary">
                    Payment confirmed — ₦{fmt(budget)} via {paidVia}
                  </span>
                </div>
                <span className="font-caption text-caption text-badge-discount-text font-semibold shrink-0">Done</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="progress_activity" className="animate-spin text-[15px]" />
                  </div>
                  <span className="font-label-sm text-label-sm font-medium text-text-primary">
                    Campaign review in progress
                  </span>
                </div>
                <span className="font-caption text-caption text-primary font-semibold shrink-0">~30 mins</span>
              </div>
              <div className="flex items-center justify-between gap-2 opacity-70">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-surface-container text-text-tertiary flex items-center justify-center shrink-0">
                    <Icon name="rocket_launch" className="text-[15px]" />
                  </div>
                  <span className="font-label-sm text-label-sm text-text-primary">
                    Goes live automatically in {primaryBranch.name} discovery
                  </span>
                </div>
                <span className="font-caption text-caption text-text-tertiary shrink-0">Pending</span>
              </div>
            </div>

            {/* Campaign summary */}
            <div className="mt-space-sm bg-surface-canvas rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              {[
                { label: 'Objective', value: OBJECTIVES.find((entry) => entry.key === objective)?.title ?? '' },
                { label: 'Content', value: item?.name ?? '' },
                { label: 'Branches', value: branches.map((option) => option.name).join(', ') },
                { label: 'Coverage', value: `${radius} km • ~${fmt(shopperPool)} shoppers` },
                {
                  label: 'Audience',
                  value: audienceMode === 'broadcast' ? 'Everyone nearby' : `${cohorts.length} cohorts`,
                },
                { label: 'Timeline', value: `${fmtDate(startDate)} – ${fmtDate(endDate)} • ${duration} days` },
                { label: 'Estimated Reach', value: `${fmt(low)} – ${fmt(high)} impressions` },
                { label: 'Budget', value: `₦${fmt(budget)} one-time` },
              ].map((row) => (
                <div className="flex items-center justify-between gap-3" key={row.label}>
                  <span className="font-caption text-caption text-text-secondary">{row.label}</span>
                  <span className="font-label-sm text-label-sm font-medium text-text-primary text-right min-w-0 truncate">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {growthActive && (
              <div className="mt-space-sm bg-surface-tint-blue rounded-xl p-3 flex items-start gap-2.5">
                <Icon name="workspace_premium" className="text-primary text-[18px] mt-0.5 shrink-0" />
                <p className="font-caption text-caption text-text-secondary leading-snug">
                  Stacked on top of your{' '}
                  <span className="font-semibold text-primary">~120,000 monthly Growth impressions</span> — maximum
                  exposure this month.
                </p>
              </div>
            )}

            {/* Replicate for another branch */}
            {BRANCHES.length > 1 && (
              <div className="mt-space-sm bg-surface-container-low rounded-xl p-3.5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-canvas text-primary flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name="content_copy" className="text-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Replicate this campaign for another branch
                  </p>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 leading-snug">
                    Your saved selections will be auto-adjusted to that branch's location and reach pool.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    {BRANCHES.filter((option) => !branchKeys.includes(option.key)).map((option) => (
                      <button
                        className="px-space-sm py-1.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold shadow-sm active:scale-95 transition-transform"
                        key={option.key}
                        type="button"
                        onClick={replicateForOtherBranch}
                      >
                        Apply to {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto pt-space-lg">
              <button
                className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
                type="button"
                onClick={onDone}
              >
                <span>Continue to Dashboard</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <p className="text-center font-caption text-caption text-text-tertiary mt-1.5">
                We'll send you a notification as soon as your campaign is live.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <AppScreen surface="bg-surface-canvas">
      <SubscriptionHeader
        title={phase === 'success' ? 'Campaign Status' : 'Create Campaign'}
        onBack={handleBack}
      />
      {renderPhase()}
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
