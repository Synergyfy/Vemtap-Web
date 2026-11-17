import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { api } from '../services/api/client';
import { notificationService } from '../services/notificationService';
import { useSessionUser } from './useSessionUser';

/** One signed-in device from `GET /users/linked-devices`. */
export interface LinkedDevice {
  id: string;
  deviceName: string | null;
  platform: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastActiveAt: string | null;
  createdAt: string | null;
  revokedAt: string | null;
  isCurrent: boolean;
}

/** The notification channel keys `PATCH /notifications/preferences` accepts. */
export type NotificationPrefKey =
  | 'push'
  | 'email'
  | 'sms'
  | 'marketing'
  | 'orderUpdates'
  | 'loyalty'
  | 'support'
  | 'rewardAlerts'
  | 'activityDigest'
  | 'smsSecurity';

/** Server defaults, used until the live preferences arrive. */
const PREF_DEFAULTS: Record<NotificationPrefKey, boolean> = {
  push: true,
  email: true,
  sms: true,
  marketing: true,
  orderUpdates: true,
  loyalty: true,
  support: true,
  rewardAlerts: true,
  activityDigest: true,
  smsSecurity: false,
};

const keys = {
  devices: ['account', 'linked-devices'] as const,
  prefs: ['account', 'notification-prefs'] as const,
};

const str = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value : null);

const toDevices = (payload: unknown): LinkedDevice[] => {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(record.data)
      ? record.data
      : Array.isArray(record.devices)
        ? record.devices
        : [];
  return (list as Array<Record<string, unknown>>)
    .filter((row) => row && typeof row.id === 'string')
    .map((row) => ({
      id: row.id as string,
      deviceName: str(row.deviceName),
      platform: str(row.platform),
      userAgent: str(row.userAgent),
      ipAddress: str(row.ipAddress),
      lastActiveAt: str(row.lastActiveAt),
      createdAt: str(row.createdAt),
      revokedAt: str(row.revokedAt),
      isCurrent: row.isCurrent === true,
    }));
};

/** A readable name for a session: its saved name, else the browser and OS from the user agent. */
export function deviceLabel(device: LinkedDevice): string {
  if (device.deviceName) return device.deviceName;
  const ua = device.userAgent ?? '';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : null;
  const os = /iPhone/.test(ua)
    ? 'iPhone'
    : /iPad/.test(ua)
      ? 'iPad'
      : /Android/.test(ua)
        ? 'Android'
        : /Mac OS X/.test(ua)
          ? 'Mac'
          : /Windows/.test(ua)
            ? 'Windows'
            : /Linux/.test(ua)
              ? 'Linux'
              : null;
  if (browser && os) return `${browser} on ${os}`;
  if (browser || os) return (browser ?? os) as string;
  if (device.platform) return device.platform.charAt(0).toUpperCase() + device.platform.slice(1);
  return 'Unknown device';
}

/** Material icon for a session's device type. */
export function deviceIcon(device: LinkedDevice): string {
  const hint = `${device.platform ?? ''} ${device.userAgent ?? ''} ${device.deviceName ?? ''}`.toLowerCase();
  if (/ipad|tablet/.test(hint)) return 'tablet_mac';
  if (/iphone|android|ios|mobile/.test(hint)) return 'smartphone';
  return 'computer';
}

/** "Active now", "5 min ago", "3 days ago" or a date. */
export function relativeTime(iso: string | null): string {
  if (!iso) return 'Unknown';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Live security and notification state for the account settings screens:
 * the signed-in devices (`/users/linked-devices`), the notification channel
 * preferences (`/notifications/preferences`) and the session user's
 * verification flags. Every query is disabled without an API.
 */
export function useAccountSecurity() {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const session = useSessionUser();

  const devicesQuery = useQuery({
    queryKey: keys.devices,
    queryFn: async () => toDevices(await api.get<unknown>('/users/linked-devices')),
    enabled: live,
  });
  const prefsQuery = useQuery({
    queryKey: keys.prefs,
    queryFn: notificationService.getPreferences,
    enabled: live,
  });

  const revokeDevice = useMutation({
    mutationFn: (id: string) => api.del<unknown>(`/users/linked-devices/${encodeURIComponent(id)}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.devices }),
  });

  const allDevices = devicesQuery.data ?? [];
  const activeDevices = allDevices.filter((device) => !device.revokedAt);
  const otherDevices = activeDevices.filter((device) => !device.isCurrent);

  /** Revokes every active session except this one; resolves to how many were signed out. */
  const revokeOthers = async () => {
    const results = await Promise.allSettled(otherDevices.map((device) => api.del<unknown>(`/users/linked-devices/${encodeURIComponent(device.id)}`)));
    await queryClient.invalidateQueries({ queryKey: keys.devices });
    const failed = results.filter((result) => result.status === 'rejected').length;
    if (failed) throw new Error(`${failed} device${failed === 1 ? '' : 's'} could not be signed out`);
    return results.length;
  };

  const prefsData = (prefsQuery.data ?? {}) as Partial<Record<NotificationPrefKey, boolean>>;
  const prefs = Object.fromEntries(
    (Object.keys(PREF_DEFAULTS) as NotificationPrefKey[]).map((key) => [
      key,
      typeof prefsData[key] === 'boolean' ? (prefsData[key] as boolean) : PREF_DEFAULTS[key],
    ]),
  ) as Record<NotificationPrefKey, boolean>;

  const updatePref = useMutation({
    mutationFn: ({ key, value }: { key: NotificationPrefKey; value: boolean }) =>
      notificationService.updatePreferences({ [key]: value }),
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: keys.prefs });
      const previous = queryClient.getQueryData(keys.prefs);
      queryClient.setQueryData(keys.prefs, { ...prefsData, [key]: value });
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) queryClient.setQueryData(keys.prefs, context.previous);
    },
    onSuccess: (next) => {
      if (next && typeof next === 'object') queryClient.setQueryData(keys.prefs, next);
    },
  });

  const user = session.data;

  return {
    live,
    devicesLoading: live && devicesQuery.isLoading,
    devicesError: devicesQuery.error,
    allDevices,
    activeDevices,
    otherDevices,
    revokeDevice,
    revokeOthers,
    prefs,
    prefsLoaded: !live || prefsQuery.isSuccess,
    updatePref,
    emailVerified: user?.emailVerified === true,
    twoFactorEnabled: user?.twoFactorEnabled === true,
    /** Google sign-in accounts have no PIN to change. */
    hasPin: user ? user.authProvider !== 'GOOGLE' : true,
    avatar: user?.avatar ?? null,
    refreshSession: () => void session.refetch(),
  };
}
