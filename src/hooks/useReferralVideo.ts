import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, hasApiConfig } from '../services/api/client';
import {
  clearReferralVideoUrl,
  DEFAULT_REFERRAL_VIDEO_URL,
  getReferralVideoSetting,
  isPlayableVideo,
  setReferralVideoUrl,
  type ReferralVideoSetting,
  type ReferralVideoUpdateResult,
} from '../scripts/referralVideo';

const referralVideoKey = ['settings', 'referral-video'] as const;

/**
 * The referral explainer video. Live API: `GET /settings/referral-video` (one link for every
 * account, set by a platform admin). Mock mode: the browser-storage override in `referralVideo.ts`.
 */
export function useReferralVideo(): ReferralVideoSetting {
  const live = hasApiConfig();
  const query = useQuery({
    queryKey: referralVideoKey,
    queryFn: () => api.get<{ url: string | null; updatedAt: string | null }>('/settings/referral-video'),
    enabled: live,
    staleTime: 5 * 60_000,
  });
  if (!live) return getReferralVideoSetting();
  const url = query.data?.url;
  return url && isPlayableVideo(url) ? { url, overridden: true } : { url: DEFAULT_REFERRAL_VIDEO_URL, overridden: false };
}

/** Saves (or, with an empty link, resets) the video. Live: `PATCH /admin/settings`. */
export function useSaveReferralVideo() {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (url: string | null) => api.patch<unknown>('/admin/settings', { referralVideoUrl: url }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: referralVideoKey }),
  });

  const save = async (input: string): Promise<ReferralVideoUpdateResult> => {
    const trimmed = input.trim();
    if (!live) return setReferralVideoUrl(trimmed);
    if (trimmed && !isPlayableVideo(trimmed)) {
      return { ok: false, message: 'That is not a YouTube link. Paste a youtube.com/watch, youtu.be or /shorts URL.' };
    }
    try {
      await mutation.mutateAsync(trimmed || null);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error && error.message ? error.message : 'The link could not be saved.' };
    }
  };

  const reset = async (): Promise<ReferralVideoUpdateResult> => {
    if (!live) {
      clearReferralVideoUrl();
      return { ok: true };
    }
    return save('');
  };

  return { save, reset, saving: mutation.isPending };
}
