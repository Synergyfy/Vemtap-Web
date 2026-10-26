import { useState, type ReactNode } from 'react';
import type { SegmentCriteria, SegmentInsights, SegmentSummary } from '../services/types';
import type { CustomerSegment, CustomersPage } from '../services/businessCustomersService';
import {
  useSegmentCriteriaOptions,
  useSegmentMutations,
  useSegmentPreview,
  type SegmentCriteriaOptions,
} from '../hooks/business/useSegments';
import type { SegmentRef } from './BusinessSegmentsHubScreen';
import { formatNaira, formatRelativeTime } from '../utils/format';

/**
 * Live segments, shared by the segment screens: the built-in directory
 * segments, saved segments, and the rule builder's mapping to `SegmentCriteria`.
 */

/** Hub cards for the built-in segments, keyed by the sample card they replace. */
export const SYSTEM_SEGMENTS: { cardKey: string; key: CustomerSegment; name: string; desc: string }[] = [
  {
    cardKey: 'all-customers',
    key: 'all',
    name: 'All Customers',
    desc: 'Everyone who bought, visited, booked, claimed a deal or chatted with your business.',
  },
  {
    cardKey: 'returning',
    key: 'returning',
    name: 'Returning Customers',
    desc: 'Customers with 2 or more visits or orders who are not frequent or inactive.',
  },
  {
    cardKey: 'frequent',
    key: 'frequent',
    name: 'Frequent Customers',
    desc: 'High-frequency patrons with 10+ visits or ₦100,000+ total spend.',
  },
  {
    cardKey: 'new-customers',
    key: 'new',
    name: 'New Customers',
    desc: 'Customers whose first visit, order or claim was in the last 30 days.',
  },
  {
    cardKey: 'dormant',
    key: 'inactive',
    name: 'Inactive Customers',
    desc: 'Customers with no visit, order, booking or claim in the last 60 days.',
  },
];

export const systemSegmentFor = (cardKey: string) => SYSTEM_SEGMENTS.find((entry) => entry.cardKey === cardKey);

export const systemCount = (page: CustomersPage | undefined, key: CustomerSegment) => {
  const count = page?.meta.segmentCounts[key];
  return count === undefined ? '—' : count.toLocaleString('en-US');
};

/** "visited in the last 30 days · 5+ visits · spent ₦100,000+" */
export function describeCriteria(criteria?: SegmentCriteria | null, names: Record<string, string> = {}) {
  if (!criteria) return 'Everyone';
  const parts: string[] = [];
  const label = (ids: string[] | undefined, noun: string) =>
    ids?.length ? ids.map((id) => names[id] ?? noun).join(', ') : '';
  if (criteria.deals?.offerIds?.length) parts.push(`claimed ${label(criteria.deals.offerIds, 'a deal')}`);
  if (criteria.deals?.savedNotRedeemed) parts.push('saved a deal but did not redeem');
  if (criteria.menu?.itemIds?.length) parts.push(`ordered ${label(criteria.menu.itemIds, 'an item')}`);
  if (criteria.location?.branchIds?.length) parts.push(`visited ${label(criteria.location.branchIds, 'a branch')}`);
  if (criteria.recency?.visitedWithinDays) parts.push(`visited in the last ${criteria.recency.visitedWithinDays} days`);
  if (criteria.recency?.notVisitedForDays) parts.push(`not seen for ${criteria.recency.notVisitedForDays}+ days`);
  if (criteria.recency?.interactedWithinDays) parts.push(`interacted in the last ${criteria.recency.interactedWithinDays} days`);
  if (criteria.recency?.minVisits) parts.push(`${criteria.recency.minVisits}+ visits`);
  if (criteria.spend?.minTotal) parts.push(`spent ${formatNaira(criteria.spend.minTotal)}+`);
  if (criteria.spend?.minAverageTicket) parts.push(`average ticket ${formatNaira(criteria.spend.minAverageTicket)}+`);
  if (criteria.loyalty?.minPoints) parts.push(`${criteria.loyalty.minPoints}+ points`);
  return parts.length ? parts.join(' · ') : 'Everyone';
}

export const segmentUpdatedLabel = (segment: SegmentSummary) =>
  segment.lastComputedAt ? `Updated ${formatRelativeTime(segment.lastComputedAt)}` : 'Updated live';

/** Share of a segment, 0–100, guarding an empty segment. */
export const percentOf = (part: number | undefined, total: number | undefined) =>
  total ? Math.round(((part ?? 0) / total) * 100) : 0;

/** "₦3.28M" / "₦840K" for compact money figures. */
export const compactNaira = (value: number) => {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (value >= 10_000) return `₦${Math.round(value / 1_000)}K`;
  return formatNaira(value);
};

/** "2.4x" per-month visit frequency. */
export const frequencyLabel = (insights?: SegmentInsights) =>
  insights ? `${(Math.round(insights.visitFrequency * 10) / 10).toLocaleString('en-US')}x` : '—';

export interface SegmentRuleFlags {
  claimedDeal: boolean;
  savedDeal: boolean;
  product: boolean;
  highSpend: boolean;
  branch: boolean;
  district: boolean;
  recency: boolean;
  chat: boolean;
  loyalty: boolean;
}

export const NO_RULES: SegmentRuleFlags = {
  claimedDeal: false,
  savedDeal: false,
  product: false,
  highSpend: false,
  branch: false,
  district: false,
  recency: false,
  chat: false,
  loyalty: false,
};

/** Thresholds the builder's fixed rules stand for. */
const HIGH_TICKET = 20_000;
const CHAT_DAYS = 14;
const LOYALTY_POINTS = 500;

/**
 * Rule-builder state behind the create screens when live: the picked deal,
 * items and branches, the criteria they make, a live reach estimate, and save.
 */
export function useLiveSegmentRules(editing: SegmentSummary | null | undefined, flags: SegmentRuleFlags, recencyDays: number) {
  const options = useSegmentCriteriaOptions();
  const mutations = useSegmentMutations();
  const initial = editing?.criteria;
  const [dealId, setDealId] = useState(initial?.deals?.offerIds?.[0] ?? '');
  const [itemIds, setItemIds] = useState<string[]>(initial?.menu?.itemIds ?? []);
  const [branchIds, setBranchIds] = useState<string[]>(initial?.location?.branchIds ?? []);

  const deals = options.data?.deals ?? [];
  const pickedDeal = dealId || deals[0]?.id || '';

  const criteria: SegmentCriteria = {};
  if ((flags.claimedDeal && pickedDeal) || flags.savedDeal) {
    criteria.deals = {
      ...(flags.claimedDeal && pickedDeal ? { offerIds: [pickedDeal] } : {}),
      ...(flags.savedDeal ? { savedNotRedeemed: true } : {}),
    };
  }
  if (flags.product && itemIds.length) criteria.menu = { itemIds };
  if (flags.branch && branchIds.length) criteria.location = { branchIds };
  if (flags.recency || flags.chat) {
    criteria.recency = {
      ...(flags.recency ? { notVisitedForDays: recencyDays } : {}),
      ...(flags.chat ? { interactedWithinDays: CHAT_DAYS } : {}),
    };
  }
  if (flags.highSpend) criteria.spend = { minAverageTicket: HIGH_TICKET };
  if (flags.loyalty) criteria.loyalty = { minPoints: LOYALTY_POINTS };

  const preview = useSegmentPreview(criteria);
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id]);

  const save = (name: string, memo: string) => {
    const input = { name: name.trim(), description: memo.trim() || undefined, criteria };
    return editing ? mutations.update.mutateAsync({ id: editing.id, ...input }) : mutations.create.mutateAsync(input);
  };

  return {
    options: options.data,
    optionsError: options.error,
    dealId: pickedDeal,
    setDealId,
    itemIds,
    toggleItem: (id: string) => setItemIds((current) => toggle(current, id)),
    branchIds,
    toggleBranch: (id: string) => setBranchIds((current) => toggle(current, id)),
    clearPicks: () => {
      setItemIds([]);
      setBranchIds([]);
    },
    criteria,
    reach: preview.data,
    reachError: preview.error,
    save,
    saving: mutations.create.isPending || mutations.update.isPending,
    remove: () => (editing ? mutations.remove.mutateAsync(editing) : Promise.resolve(undefined)),
    removing: mutations.remove.isPending,
  };
}

/** Which builder rules an existing segment's criteria switch on. */
export function rulesFromCriteria(criteria?: SegmentCriteria | null): { flags: SegmentRuleFlags; recencyDays: number } {
  if (!criteria) return { flags: NO_RULES, recencyDays: 60 };
  return {
    flags: {
      claimedDeal: Boolean(criteria.deals?.offerIds?.length),
      savedDeal: Boolean(criteria.deals?.savedNotRedeemed),
      product: Boolean(criteria.menu?.itemIds?.length),
      highSpend: Boolean(criteria.spend?.minAverageTicket),
      branch: Boolean(criteria.location?.branchIds?.length),
      district: false,
      recency: Boolean(criteria.recency?.notVisitedForDays),
      chat: Boolean(criteria.recency?.interactedWithinDays),
      loyalty: Boolean(criteria.loyalty?.minPoints),
    },
    recencyDays: criteria.recency?.notVisitedForDays ?? 60,
  };
}

/** Option id → name, so criteria read "claimed Lunch Combo" rather than an id. */
export const optionNames = (options?: SegmentCriteriaOptions) =>
  Object.fromEntries(
    [...(options?.deals ?? []), ...(options?.menuItems ?? []), ...(options?.branches ?? [])].map((option) => [
      option.id,
      option.name,
    ]),
  );

/** The fields the hub screens' segment cards share. */
interface HubCard {
  key: string;
  category: 'default' | 'custom';
  title: string;
  meta: string;
  count: string;
  desc: string;
  highlight: { icon: string; text: ReactNode; className: string };
  viewCohort?: boolean;
  ref: SegmentRef;
}

/**
 * The hub's cards with live data: the built-in segments keep their sample
 * card's look with real counts, and each saved segment takes the first sample
 * custom card's look.
 */
export function liveSegmentCards<T extends HubCard>(
  samples: T[],
  directory: CustomersPage | undefined,
  saved: SegmentSummary[],
  names: Record<string, string>,
  returning?: SegmentInsights,
): T[] {
  const insight = directory?.meta.insight;
  const total = insight?.customers;
  const defaults = samples.flatMap((sample) => {
    const system = systemSegmentFor(sample.key);
    if (sample.category !== 'default' || !system) return [];
    const count = systemCount(directory, system.key);
    const share = `${percentOf(directory?.meta.segmentCounts[system.key], total)}% of customers`;
    const highlight: Record<string, ReactNode> = {
      all: insight ? `${insight.dormant} not seen in 90+ days` : '—',
      returning: `${share} • Avg. basket ${returning ? formatNaira(returning.avgOrderValue) : '—'}`,
      frequent: insight ? `Generates ${Math.round(insight.frequentSpendShare * 100)}% of customer spend` : '—',
    };
    return [
      {
        ...sample,
        title: system.name,
        meta: 'Updated live',
        count,
        desc: system.desc,
        highlight: { ...sample.highlight, text: highlight[system.key] ?? sample.highlight.text },
        ref: { name: system.name, count, meta: share, desc: system.desc, systemKey: system.key },
      },
    ];
  });
  const template = samples.find((sample) => sample.category === 'custom');
  const custom = template
    ? saved.map((segment) => {
        const rules = describeCriteria(segment.criteria, names);
        const count = (segment.size ?? 0).toLocaleString('en-US');
        const desc = segment.description || rules;
        return {
          ...template,
          key: segment.id,
          title: segment.name,
          meta: segmentUpdatedLabel(segment),
          count,
          desc,
          highlight: { ...template.highlight, icon: 'tune', text: rules },
          viewCohort: true,
          ref: { name: segment.name, count, meta: 'Custom segment', desc, id: segment.id, segment },
        };
      })
    : [];
  return [...defaults, ...custom];
}

const BAR_CLASSES = ['bg-primary', 'bg-secondary', 'bg-tertiary'];

/** The detail screens' sections, from a segment's insights. */
export function segmentDetail(insights: SegmentInsights | undefined, ref: SegmentRef) {
  const size = insights?.size ?? 0;
  return {
    count: insights ? size.toLocaleString('en-US') : ref.count,
    tags: [
      ref.meta,
      `Avg. Basket ${insights ? formatNaira(insights.avgOrderValue) : '—'}`,
      `${frequencyLabel(insights)} visits per diner`,
    ],
    stats: {
      totalSpend: insights ? formatNaira(insights.totalSpend) : '—',
      avgBasket: insights ? formatNaira(insights.avgOrderValue) : '—',
      frequency: frequencyLabel(insights),
    },
    branchSplit: (insights?.branchSplit ?? []).map((branch, index) => ({
      name: branch.name,
      pct: Math.round(branch.percent),
      barClass: BAR_CLASSES[index % BAR_CLASSES.length],
    })),
    reachability: [
      { label: 'Push & Feed Notifications', value: insights?.reachableByPush, barClass: 'bg-primary' },
      { label: 'Email', value: insights?.reachableByEmail, barClass: 'bg-secondary' },
      { label: 'Direct SMS / DM', value: insights?.reachableBySms, barClass: 'bg-tertiary' },
    ].map((row) => ({
      label: row.label,
      count: (row.value ?? 0).toLocaleString('en-US'),
      pct: percentOf(row.value, size),
      barClass: row.barClass,
    })),
    favourites: (insights?.favourites ?? []).map((item) => ({
      name: item.name,
      orders: `${item.orders.toLocaleString('en-US')} order${item.orders === 1 ? '' : 's'}`,
      img: '',
    })),
    patrons: (insights?.samplePatrons ?? []).map((patron) => ({
      name: patron.name || 'Customer',
      visits: patron.lastVisit ? `Last visit ${formatRelativeTime(patron.lastVisit)}` : 'No visit yet',
      spend: formatNaira(patron.spend),
      initial: (patron.name || 'C').charAt(0).toUpperCase(),
      avatarUrl: patron.avatarUrl,
    })),
    sampleLabel: `Top ${insights?.samplePatrons.length ?? 0} of ${size.toLocaleString('en-US')}`,
  };
}
