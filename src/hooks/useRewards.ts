import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api, ApiError, hasApiConfig } from '../services/api/client';
import { NO_IMAGE } from '../utils/homeOffer';

export interface RewardCard {
  id: string;
  image: string;
  alt: string;
  tag: string;
  metaIcon: string;
  meta: string;
  title: string;
  desc: string;
  cost: number;
  /** Points are per business, so this is the balance at the reward's own business. */
  balance: number;
  balanceAfter: number;
  shortfall: number;
  redeemName: string;
  locked: boolean;
}

export interface RewardVoucher {
  code: string;
  name: string;
  business: string;
  redeemedOn: string;
  expiry: string;
  active: boolean;
}

export interface PointsEntry {
  id: string;
  icon: string;
  iconClass: string;
  title: string;
  time: string;
  amount: string;
  positive: boolean;
  meta: string;
}

const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const text = (value: unknown): string => (typeof value === 'string' ? value : '');
const num = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const rowsOf = (payload: unknown): unknown[] => {
  const rows = Array.isArray(payload) ? payload : rec(payload).data;
  return Array.isArray(rows) ? rows : [];
};
const day = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

const toEntry = (raw: unknown): PointsEntry => {
  const row = rec(raw);
  const amount = num(row.amount);
  const positive = amount >= 0;
  return {
    id: text(row.id),
    icon: positive ? 'add' : 'shopping_bag',
    iconClass: positive ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-error-container text-error',
    title: text(row.reason) || (positive ? 'Points earned' : 'Points redeemed'),
    time: day(text(row.createdAt)),
    amount: `${positive ? '+' : '-'}${Math.abs(amount).toLocaleString()} pts`,
    positive,
    meta: text(rec(row.branch).name),
  };
};

const useLoyaltyQuery = (key: string, path: string, params?: Record<string, string | number | boolean>) => {
  const { authed } = useAuth();
  return useQuery({
    queryKey: ['loyalty', key],
    queryFn: () => api.get<unknown>(path, { params }),
    enabled: hasApiConfig() && authed,
  });
};

/**
 * The customer's rewards page (desktop + mobile): balance, redeemable rewards,
 * redeemed vouchers and the points log. Redeeming spends real points through
 * `POST /loyalty/redemption/redeem-reward`.
 */
export function useRewards() {
  const queryClient = useQueryClient();
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const tier = useLoyaltyQuery('tier', '/loyalty/points/tier');
  const wallet = useLoyaltyQuery('wallet', '/loyalty/me/wallet');
  const catalogue = useLoyaltyQuery('rewards', '/loyalty/rewards', { global: true, limit: 50 });
  const redemptions = useLoyaltyQuery('redemptions-list', '/loyalty/me/redemptions');
  const logs = useLoyaltyQuery('logs', '/loyalty/points/logs', { page: 1, limit: 50 });

  const rewards = useMemo<RewardCard[]>(() => {
    const balances = new Map(rowsOf(wallet.data).map((row) => [text(rec(row).businessId), num(rec(row).points)]));
    return rowsOf(catalogue.data).map((raw) => {
      const row = rec(raw);
      const business = rec(row.business);
      const businessId = text(row.businessId) || text(business.id);
      const balance = balances.get(businessId) ?? 0;
      const cost = num(row.pointsRequired);
      const title = text(row.name);
      return {
        id: text(row.id),
        image: text(row.coverImage) || NO_IMAGE,
        alt: title,
        tag: text(row.category).replace(/_/g, ' ').slice(0, 12),
        metaIcon: 'storefront',
        meta: text(business.name),
        title,
        desc: text(row.description),
        cost,
        balance,
        balanceAfter: balance - cost,
        shortfall: Math.max(cost - balance, 0),
        redeemName: title,
        locked: balance < cost,
      };
    });
  }, [catalogue.data, wallet.data]);

  const vouchers = useMemo<RewardVoucher[]>(
    () =>
      rowsOf(redemptions.data).map((raw) => {
        const row = rec(raw);
        const expires = text(row.expiresAt);
        const active = !expires || new Date(expires).getTime() > Date.now();
        return {
          code: text(row.code),
          name: text(row.rewardName),
          business: text(row.businessName),
          redeemedOn: day(text(row.redeemedAt)),
          expiry: expires ? `${active ? 'Expires' : 'Expired'} ${day(expires)}` : 'No expiry date',
          active,
        };
      }),
    [redemptions.data],
  );

  const entries = useMemo(() => rowsOf(logs.data).map(toEntry), [logs.data]);

  /** Resolves when redeemed; rejects with the API's reason. */
  const redeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      await api.post('/loyalty/redemption/redeem-reward', { rewardId });
      await queryClient.invalidateQueries({ queryKey: ['loyalty'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'tier'] });
    } catch (error) {
      throw new Error(error instanceof ApiError ? error.message : 'This reward couldn’t be redeemed. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  const points = tier.isSuccess ? num(rec(tier.data).points) : null;
  return {
    pointsLabel: points === null ? '—' : points.toLocaleString(),
    tierName: tier.isSuccess ? text(rec(tier.data).tier) : '',
    rewards,
    readyCount: rewards.filter((reward) => !reward.locked).length,
    rewardsLoading: catalogue.isLoading,
    rewardsFailed: catalogue.isError,
    vouchers,
    activeVouchers: vouchers.filter((voucher) => voucher.active).length,
    entries,
    logsLoading: logs.isLoading,
    redeem,
    redeeming,
  };
}
