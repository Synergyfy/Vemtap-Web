import { hasApiConfig } from '../../services/api/client';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

/**
 * Live Deal Studio: deals are published at the active branch, so the studio
 * shows that real branch instead of the sample outlets.
 */
export function useLiveDealBranch() {
  const live = hasApiConfig();
  const { branch, isLive } = useBusinessBranch();
  return {
    live,
    name: isLive ? branch.name : 'Your branch',
    area: isLive ? branch.area || 'Your branch' : 'Your branch',
  };
}
