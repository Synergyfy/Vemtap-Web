import { api, hasApiConfig } from './api/client';
import { normaliseReferralCode } from '../scripts/referralData';

export type ReferralAudience = 'customer' | 'business';

/** `GET /referrals/me` — the signed-in user's own referral code and referrals. */
export interface MyReferralsResponse {
  code: string;
  audience: ReferralAudience;
  totalReferrals: number;
  referrals: Array<{
    id: string;
    /** First name plus last initial — the server masks the rest. */
    name: string;
    type: ReferralAudience;
    joinedAt: string;
  }>;
}

export interface ReferrerInfo {
  code: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string | null;
}

const KNOWN_REFERRERS: Record<string, { firstName: string; lastName: string }> = {
  'AMINA-7742': { firstName: 'Amina', lastName: 'Bello' },
  'AMINA': { firstName: 'Amina', lastName: 'Bello' },
  'TUNDE-8821': { firstName: 'Tunde', lastName: 'Bakare' },
  'TUNDE': { firstName: 'Tunde', lastName: 'Bakare' },
  'CHIDI-4029': { firstName: 'Chidi', lastName: 'Okafor' },
  'CHIDI': { firstName: 'Chidi', lastName: 'Okafor' },
  'ZAINAB-1024': { firstName: 'Zainab', lastName: 'Usman' },
  'ZAINAB': { firstName: 'Zainab', lastName: 'Usman' },
  'KEMI-9311': { firstName: 'Kemi', lastName: 'Adeyemi' },
  'KEMI': { firstName: 'Kemi', lastName: 'Adeyemi' },
  'EMMANUEL-501': { firstName: 'Emmanuel', lastName: 'Okon' },
  'EMMANUEL': { firstName: 'Emmanuel', lastName: 'Okon' },
  'VEM-8OGUU4': { firstName: 'David', lastName: 'Adeleke' },
  'DAVID': { firstName: 'David', lastName: 'Adeleke' },
};

const FIRST_NAMES = [
  'Amina', 'Tunde', 'Chidi', 'Zainab', 'Kemi', 'Emmanuel', 'Fatima', 'Ibrahim',
  'Ngozi', 'Babajide', 'Blessing', 'Farouk', 'Folake', 'Obinna', 'Hadiza', 'Kelechi',
];
const LAST_NAMES = [
  'Bello', 'Bakare', 'Okafor', 'Usman', 'Adeyemi', 'Okon', 'Danjuma', 'Eze',
  'Balogun', 'Alabi', 'Nwosu', 'Abubakar', 'Adeleke', 'Suleiman', 'Olamide', 'Bassey',
];

export function resolveDemoReferrer(code: string): ReferrerInfo {
  const norm = normaliseReferralCode(code);
  if (KNOWN_REFERRERS[norm]) {
    const k = KNOWN_REFERRERS[norm];
    return { code: norm, firstName: k.firstName, lastName: k.lastName, fullName: `${k.firstName} ${k.lastName}` };
  }

  const prefix = norm.split('-')[0];
  const matchedFirst = FIRST_NAMES.find((f) => f.toUpperCase() === prefix);

  let hash = 0;
  for (let i = 0; i < norm.length; i += 1) {
    hash = (hash * 31 + norm.charCodeAt(i)) >>> 0;
  }

  const firstName = matchedFirst ?? FIRST_NAMES[hash % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(hash >>> 4) % LAST_NAMES.length];

  return {
    code: norm,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
  };
}

/** The user's own referral code plus who has used it so far. */
export const referralsService = {
  me: () => api.get<MyReferralsResponse>('/referrals/me'),

  /** Applies one referral code for the freshly created signed-in account. */
  claim: (code: string) => api.post<{ message: string }>('/referrals/claim', { code }),

  /** Auto-fetches the owner of a referral code (first and last name) */
  lookup: async (rawCode: string): Promise<ReferrerInfo | null> => {
    const code = normaliseReferralCode(rawCode);
    if (!code || code.length < 4) return null;

    if (hasApiConfig()) {
      try {
        const res = await api.get<{ code?: string; firstName?: string; lastName?: string; name?: string }>(
          `/referrals/lookup/${encodeURIComponent(code)}`,
        );
        if (res) {
          const parts = (res.name ?? '').trim().split(/\s+/);
          const firstName = res.firstName || parts[0] || 'Vemtap';
          const lastName = res.lastName || parts.slice(1).join(' ') || 'Member';
          return {
            code: res.code || code,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
          };
        }
      } catch {
        // Fall back to resolved demo identity if live endpoint doesn't exist yet
      }
    }

    return resolveDemoReferrer(code);
  },
};
