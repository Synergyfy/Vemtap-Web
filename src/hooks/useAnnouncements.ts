import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api, hasApiConfig } from '../services/api/client';
import { activeAnnouncements, type Announcement } from '../scripts/announcementsData';

/** The icon names the admin console offers, as Material Symbols. */
const BANNER_ICONS: Record<string, string> = {
  Sparkles: 'auto_awesome',
  Megaphone: 'campaign',
  Zap: 'bolt',
  Gift: 'redeem',
};

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const toAnnouncement = (row: unknown): Announcement | null => {
  if (!row || typeof row !== 'object') return null;
  const banner = row as Record<string, unknown>;
  const id = text(banner.id);
  const title = text(banner.title);
  if (!id || !title) return null;
  const targetType = text(banner.targetType);
  const targetId = text(banner.targetId);
  const actionUrl = text(banner.actionUrl);
  const dealId = targetType === 'deal' && targetId ? targetId : undefined;
  const href = targetType === 'custom' && actionUrl ? actionUrl : undefined;
  return {
    id,
    audience: 'all',
    title,
    message: text(banner.description),
    icon: BANNER_ICONS[text(banner.iconName)] ?? 'campaign',
    tone: 'promo',
    cta: text(banner.actionLabel) || (dealId ? 'View Deal' : 'Explore Deals'),
    destination: 'deals',
    dealId,
    href,
    // The API only lists banners that are live now; it has no schedule fields.
    start: '',
    end: '',
    published: true,
  };
};

/**
 * Customer dashboard announcements (desktop + mobile): the banners the admin
 * published, from `GET /banners?placement=customer`. Sample announcements only
 * show without an API.
 */
export function useAnnouncements(): Announcement[] {
  const { authed } = useAuth();
  const live = hasApiConfig();
  const banners = useQuery({
    queryKey: ['banners', 'customer'],
    queryFn: () => api.get<unknown>('/banners', { params: { placement: 'customer' } }),
    enabled: live && authed,
    select: (payload): Announcement[] => {
      const rows = Array.isArray(payload) ? payload : (payload as { data?: unknown } | null)?.data;
      return Array.isArray(rows) ? rows.map(toAnnouncement).filter((item): item is Announcement => Boolean(item)) : [];
    },
  });
  return live ? banners.data ?? [] : activeAnnouncements();
}
