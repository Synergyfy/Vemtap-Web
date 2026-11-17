import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '../context/ProfileContext';
import { api, hasApiConfig } from '../services/api/client';
import { accountService, type AccountProfilePayload } from '../services/accountService';
import { uploadImage } from '../services/uploadService';
import { sessionKeys, useSessionUser } from './useSessionUser';

export interface District {
  id: string;
  name: string;
}

const keys = {
  me: ['account', 'profile'] as const,
  districts: ['clusters', 'districts'] as const,
};

const rec = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const text = (value: unknown) => (typeof value === 'string' ? value : '');

/** The full `/users/profile` row; some wrappers nest it under `data`. */
const unwrapUser = (payload: unknown) => {
  const record = rec(payload);
  return record.data && typeof record.data === 'object' ? rec(record.data) : record;
};

/**
 * Live data for the Edit Profile screens: the saved profile (`GET /users/profile`),
 * the districts a customer can pick as home area (`GET /clusters/districts`),
 * saving (`PATCH /users/profile`) and photo upload (`POST /uploads`).
 */
export function useEditProfile() {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const profile = useProfile();
  const session = useSessionUser();

  const me = useQuery({ queryKey: keys.me, queryFn: async () => unwrapUser(await accountService.getMe()), enabled: live });
  const districts = useQuery({
    queryKey: keys.districts,
    queryFn: async () => {
      const payload = await api.get<unknown>('/clusters/districts');
      const list = Array.isArray(payload) ? payload : Array.isArray(rec(payload).data) ? (rec(payload).data as unknown[]) : [];
      return list
        .map((row) => ({ id: text(rec(row).id), name: text(rec(row).name) }))
        .filter((row): row is District => Boolean(row.id && row.name));
    },
    enabled: live,
    staleTime: 30 * 60_000,
  });

  const user = me.data ?? {};
  const createdAt = text(user.createdAt) || profile.createdAt || '';
  const memberSince = (() => {
    const date = createdAt ? new Date(createdAt) : null;
    return date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat('en-NG', { month: 'short', year: 'numeric' }).format(date)
      : '';
  })();
  const homeDistrictId = text(user.homeDistrictId) || null;

  const save = useMutation({
    mutationFn: (payload: AccountProfilePayload) => accountService.updateProfile(payload),
    onSuccess: (next, payload) => {
      const row = unwrapUser(next);
      queryClient.setQueryData(keys.me, Object.keys(row).length ? row : { ...user, ...payload });
      profile.update({
        ...(payload.firstName !== undefined ? { firstName: payload.firstName } : {}),
        ...(payload.lastName !== undefined ? { lastName: payload.lastName } : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
      });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.profile });
    },
  });

  /** Uploads the picked image and saves it as the avatar; resolves to the hosted URL. */
  const uploadAvatar = async (file: File) => {
    const url = await uploadImage(file);
    if (live) await save.mutateAsync({ avatar: url });
    return url;
  };

  return {
    live,
    loading: live && me.isLoading,
    firstName: text(user.firstName) || profile.firstName,
    lastName: text(user.lastName) || profile.lastName,
    email: text(user.email) || profile.email,
    phone: text(user.phone) || profile.phone,
    gender: text(user.gender),
    avatar: text(user.avatar) || session.data?.avatar || '',
    homeDistrictId,
    homeDistrictName: districts.data?.find((district) => district.id === homeDistrictId)?.name ?? '',
    districts: districts.data ?? [],
    emailVerified: session.data?.emailVerified === true,
    memberSince,
    save,
    uploadAvatar,
  };
}
