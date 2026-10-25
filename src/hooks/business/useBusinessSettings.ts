import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { accountPrivacyService, type AccountPrivacy } from '../../services/accountPrivacyService';
import { notificationService } from '../../services/notificationService';
import { posSettingsService } from '../../services/posSettingsService';
import { accountService } from '../../services/accountService';
import { useSessionUser, sessionKeys } from '../useSessionUser';
import { useMyBusiness } from './useMyBusiness';

const keys = {
  privacy: ['business-settings', 'privacy'] as const,
  requests: ['business-settings', 'data-requests'] as const,
  prefs: ['business-settings', 'notification-prefs'] as const,
  pos: ['business-settings', 'pos'] as const,
  devices: ['business-settings', 'devices'] as const,
};

/** The POS actions that ask for a supervisor PIN when "Require PIN" is on. */
const PIN_FLAGS = [
  'voidRequiresPin',
  'refundRequiresPin',
  'reprintRequiresPin',
  'drawerOpenRequiresPin',
  'discountOverrideRequiresPin',
] as const;

/**
 * Live state and actions for Business Settings: privacy/NDPR choices, the
 * notification channels, the POS PIN rule, 2FA status, signed-in devices and
 * the business header. Every query is disabled without an API.
 */
export function useBusinessSettings() {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const session = useSessionUser();
  const business = useMyBusiness();
  const privacy = useQuery({ queryKey: keys.privacy, queryFn: accountPrivacyService.get, enabled: live });
  const requests = useQuery({ queryKey: keys.requests, queryFn: accountPrivacyService.requests, enabled: live });
  const prefs = useQuery({ queryKey: keys.prefs, queryFn: notificationService.getPreferences, enabled: live });
  const pos = useQuery({ queryKey: keys.pos, queryFn: posSettingsService.get, enabled: live });
  const devices = useQuery({ queryKey: keys.devices, queryFn: accountService.getSecurity, enabled: live });

  const updatePrivacy = useMutation({
    mutationFn: (patch: Partial<Omit<AccountPrivacy, 'canManageBusiness'>>) => accountPrivacyService.update(patch),
    onSuccess: (next) => queryClient.setQueryData(keys.privacy, next),
  });
  const updatePrefs = useMutation({
    mutationFn: (patch: Record<string, boolean>) => notificationService.updatePreferences(patch),
    onSuccess: (next) => queryClient.setQueryData(keys.prefs, next),
  });
  const updatePosPin = useMutation({
    mutationFn: (on: boolean) =>
      posSettingsService.update(Object.fromEntries(PIN_FLAGS.map((flag) => [flag, on]))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.pos }),
  });
  const exportArchive = useMutation({
    mutationFn: accountPrivacyService.export,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.requests }),
  });
  const rectify = useMutation({
    mutationFn: (details: string) => accountPrivacyService.requestRectification(details),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.requests }),
  });

  const deviceList = (() => {
    const data = devices.data as { devices?: unknown } | unknown[] | undefined;
    const list = Array.isArray(data) ? data : Array.isArray((data as { devices?: unknown })?.devices) ? (data as { devices: unknown[] }).devices : [];
    return (list as Array<{ revokedAt?: string | null }>).filter((device) => !device.revokedAt);
  })();
  const prefsData = (prefs.data ?? {}) as Record<string, boolean | undefined>;
  const posData = (pos.data ?? {}) as Record<string, unknown>;

  return {
    live,
    privacy: privacy.data,
    requests: requests.data?.data ?? [],
    channels: {
      push: prefsData.push !== false,
      email: prefsData.email !== false,
      sms: prefsData.sms !== false,
    },
    posPinOn: PIN_FLAGS.every((flag) => posData[flag] === true),
    twoFactorOn: session.data?.twoFactorEnabled === true,
    activeDevices: deviceList.length,
    business: business.data as
      | { name?: string | null; uniqueCode?: string | null; officialEmail?: string | null; phone?: string | null }
      | undefined,
    updatePrivacy,
    updatePrefs,
    updatePosPin,
    exportArchive,
    rectify,
    refreshSession: () => queryClient.invalidateQueries({ queryKey: sessionKeys.profile }),
  };
}
