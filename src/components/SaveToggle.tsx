import { useEffect, useState } from 'react';
import { Icon } from './ui/Icon';
import { useSessionUser } from '../hooks/useSessionUser';
import { api, hasApiConfig } from '../services/api/client';

interface SaveToggleProps {
  kind: 'businesses' | 'services';
  id: string | null | undefined;
  name: string;
  className: string;
  iconClassName?: string;
}

/**
 * Bookmark for a business or service: `GET/POST /{kind}/:id/save`. Saving is a
 * customer action, so it stays hidden for anyone else (signed out, business shell).
 */
export function SaveToggle({ kind, id, name, className, iconClassName = 'text-[20px]' }: SaveToggleProps) {
  const isCustomer = useSessionUser().data?.role === 'Customer';
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasApiConfig() || !isCustomer || !id) return;
    let ignore = false;
    api
      .get<{ isSaved?: boolean; saved?: boolean }>(`/${kind}/${encodeURIComponent(id)}/save-status`)
      .then((status) => {
        if (!ignore) setSaved(Boolean(status?.isSaved ?? status?.saved));
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [kind, id, isCustomer]);

  if (!isCustomer || !id) return null;

  const toggle = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const result = await api.post<{ saved?: boolean }>(`/${kind}/${encodeURIComponent(id)}/save`);
      setSaved(result?.saved === true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={failed ? `Couldn’t update ${name}. Try again` : saved ? `Remove ${name} from saved` : `Save ${name}`}
      title={failed ? 'That didn’t save. Please try again.' : undefined}
      disabled={busy}
      onClick={() => void toggle()}
      className={className}
    >
      <Icon name={failed ? 'error' : saved ? 'bookmark' : 'bookmark_border'} filled={saved} className={iconClassName} />
    </button>
  );
}
