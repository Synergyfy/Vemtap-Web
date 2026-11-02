import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccessToken, hasApiConfig } from '../services/api/client';
import { dealEngagementService } from '../services/dealEngagementService';

export interface DealLikeState {
  liked: boolean;
  count: number;
}

type ReactionPayload = { type?: string | null; likesCount?: number | string } | null | undefined;

const toState = (payload: ReactionPayload): DealLikeState | null => {
  if (!payload || typeof payload !== 'object' || !('likesCount' in payload)) return null;
  const count = Number(payload.likesCount ?? 0);
  return { liked: payload.type === 'like', count: Number.isFinite(count) ? Math.max(0, count) : 0 };
};

/**
 * Live likes for a set of deals, shared by the desktop and mobile home views.
 * Loads each deal's like state and count from `GET /deals/:id/reaction-status`,
 * and saves through `POST /deals/:id/reactions` with `{ type: 'like' }` — the
 * backend toggles: liking again removes the like. Updates optimistically and
 * rolls back if the request fails. Ids must be real offer ids.
 */
export function useDealLikes(offerIds: string[]) {
  const [likes, setLikes] = useState<Record<string, DealLikeState>>({});
  const pending = useRef(new Set<string>());
  const likesRef = useRef(likes);
  likesRef.current = likes;
  const idsKey = offerIds.join(',');

  useEffect(() => {
    if (!hasApiConfig() || !getAccessToken() || !idsKey) return;
    let ignore = false;
    const missing = idsKey.split(',').filter((id) => !(id in likesRef.current));
    if (missing.length === 0) return;
    Promise.all(
      missing.map(async (id) => {
        try {
          return [id, toState((await dealEngagementService.getReactionStatus(id)) as ReactionPayload)] as const;
        } catch {
          return [id, null] as const;
        }
      }),
    ).then((rows) => {
      if (ignore) return;
      setLikes((prev) => {
        const next = { ...prev };
        for (const [id, state] of rows) if (state && !pending.current.has(id)) next[id] = state;
        return next;
      });
    });
    return () => {
      ignore = true;
    };
  }, [idsKey]);

  /** Flips the like (`knownCount`: the count shown, until this deal's status has loaded); resolves to the saved state, or rejects (after rolling back) when it fails. */
  const toggleLike = useCallback(async (offerId: string, knownCount = 0): Promise<DealLikeState> => {
    if (pending.current.has(offerId)) throw new Error('Like already in progress');
    const previous: DealLikeState = likesRef.current[offerId] ?? { liked: false, count: knownCount };
    const liked = !previous.liked;
    setLikes((prev) => ({ ...prev, [offerId]: { liked, count: Math.max(0, previous.count + (liked ? 1 : -1)) } }));
    pending.current.add(offerId);
    try {
      const saved = toState((await dealEngagementService.setReaction(offerId, 'like')) as ReactionPayload);
      if (!saved) throw new Error('Likes are not available right now');
      setLikes((prev) => ({ ...prev, [offerId]: saved }));
      return saved;
    } catch (error) {
      setLikes((prev) => ({ ...prev, [offerId]: previous }));
      throw error;
    } finally {
      pending.current.delete(offerId);
    }
  }, []);

  return { likes, toggleLike };
}
