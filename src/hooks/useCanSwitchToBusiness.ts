import { useSessionUser } from './useSessionUser';

/** The signed-in account already has a business, so "set up a business" becomes a switch. */
export function useCanSwitchToBusiness() {
  const sessionUser = useSessionUser().data;
  return Boolean(sessionUser?.businessRole && sessionUser.hasBusiness);
}
