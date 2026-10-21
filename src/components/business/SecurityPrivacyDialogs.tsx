import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api/client';
import { Icon } from '../ui/Icon';
import { authService } from '../../services/authService';
import { apiErrorMessage } from '../../services/errorMessages';

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-space-md">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-md rounded-2xl bg-surface-canvas shadow-xl p-space-lg flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const codeInput =
  'w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md tracking-[0.3em] text-center outline-none';
const primary =
  'h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary disabled:opacity-60';

/**
 * Turn two-factor sign-in on (scan the QR or type the key into an
 * authenticator app, then confirm a code) or off (confirm a current code).
 */
export function TwoFactorDialog({ enabled, onClose, onDone }: { enabled: boolean; onClose: () => void; onDone: (on: boolean) => void }) {
  const [setup, setSetup] = useState<{ secret: string; qrSvg: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (enabled) return;
    let cancelled = false;
    authService
      .setupTwoFactor()
      .then((result) => !cancelled && setSetup({ secret: result.secret, qrSvg: result.qrSvg }))
      .catch((err: unknown) => !cancelled && setError(apiErrorMessage(err, 'Could not start two-factor setup.')));
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const submit = async () => {
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from your authenticator app.');
    setBusy(true);
    setError(null);
    try {
      const result = enabled ? await authService.disableTwoFactor(code) : await authService.confirmTwoFactor(code);
      onDone(result.enabled);
    } catch (err) {
      setError(apiErrorMessage(err, 'That code did not work. Try the newest one.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title={enabled ? 'Turn off two-factor sign-in' : 'Set up two-factor sign-in'} onClose={onClose}>
      {enabled ? (
        <p className="font-body-md text-body-md text-text-secondary">
          Enter a current code from your authenticator app to turn two-factor sign-in off.
        </p>
      ) : setup ? (
        <>
          <p className="font-body-md text-body-md text-text-secondary">
            Scan this with an authenticator app (Google Authenticator, Authy, 1Password…), then enter the 6-digit code it shows.
          </p>
          <div className="self-center w-44 h-44 bg-white p-2 rounded-lg [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: setup.qrSvg }} />
          <p className="font-caption text-caption text-text-secondary text-center break-all">
            Can’t scan? Enter this key: <span className="font-semibold text-text-primary">{setup.secret}</span>
          </p>
        </>
      ) : !error ? (
        <p className="font-body-md text-body-md text-text-secondary">Preparing your setup code…</p>
      ) : null}
      {enabled || setup ? (
        <input
          className={codeInput}
          inputMode="numeric"
          maxLength={6}
          value={code}
          placeholder="000000"
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          aria-label="6-digit code"
        />
      ) : null}
      {error ? <p className="font-caption text-caption text-error">{error}</p> : null}
      {enabled || setup ? (
        <button type="button" className={primary} disabled={busy} onClick={() => void submit()}>
          {busy ? 'Checking…' : enabled ? 'Turn off' : 'Turn on'}
        </button>
      ) : null}
    </Dialog>
  );
}

/** NDPR rectification: describe what is wrong; the request is logged with a 72-hour deadline. */
export function RectificationDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (details: string) => Promise<{ reference: string }>;
}) {
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const submit = async () => {
    if (details.trim().length < 10) return setError('Tell us what is wrong in a sentence or two.');
    setBusy(true);
    setError(null);
    try {
      setReference((await onSubmit(details.trim())).reference);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send the request.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title="Correct my records" onClose={onClose}>
      {reference ? (
        <>
          <p className="font-body-md text-body-md text-text-secondary">
            Request <span className="font-semibold text-text-primary">{reference}</span> is logged. Our data protection officer
            responds within 72 hours.
          </p>
          <button type="button" className={primary} onClick={onClose}>
            Done
          </button>
        </>
      ) : (
        <>
          <p className="font-body-md text-body-md text-text-secondary">
            Which business or customer data is inaccurate, and what should it say?
          </p>
          <textarea
            value={details}
            maxLength={2000}
            rows={5}
            onChange={(event) => setDetails(event.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md outline-none"
            placeholder="e.g. The registered address on my invoices is out of date — it should be 12 Aminu Kano Crescent."
          />
          {error ? <p className="font-caption text-caption text-error">{error}</p> : null}
          <button type="button" className={primary} disabled={busy} onClick={() => void submit()}>
            {busy ? 'Sending…' : 'Send request'}
          </button>
        </>
      )}
    </Dialog>
  );
}

interface LinkedDevice {
  id: string;
  deviceName: string;
  platform: string;
  userAgent: string | null;
  lastActiveAt: string;
  revokedAt: string | null;
  isCurrent: boolean;
}

/** Signed-in devices (`/users/linked-devices`), with sign-out for any but this one. */
export function DevicesDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const devices = useQuery({
    queryKey: ['business-settings', 'linked-devices'],
    queryFn: () => api.get<LinkedDevice[]>('/users/linked-devices'),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => api.del<unknown>(`/users/linked-devices/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['business-settings'] });
    },
  });
  const active = (devices.data ?? []).filter((device) => !device.revokedAt);

  return (
    <Dialog title="Signed-in devices" onClose={onClose}>
      {devices.isLoading ? (
        <p className="font-body-md text-body-md text-text-secondary">Loading devices…</p>
      ) : devices.isError ? (
        <p className="font-caption text-caption text-error">{apiErrorMessage(devices.error, 'Could not load your devices.')}</p>
      ) : (
        <ul className="flex flex-col gap-space-xs max-h-80 overflow-y-auto">
          {active.map((device) => (
            <li key={device.id} className="flex items-center gap-space-sm rounded-xl bg-surface-subtle p-space-sm">
              <Icon name={device.platform === 'web' ? 'computer' : 'smartphone'} className="text-[20px] text-primary shrink-0" />
              <span className="flex flex-col flex-1 min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  {device.deviceName}
                  {device.isCurrent ? ' · this device' : ''}
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  {device.userAgent ?? device.platform} · active {new Date(device.lastActiveAt).toLocaleString('en-NG')}
                </span>
              </span>
              {!device.isCurrent ? (
                <button
                  type="button"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(device.id)}
                  className="h-9 px-space-sm rounded-lg text-error font-label-sm text-label-sm font-semibold disabled:opacity-60"
                >
                  Sign out
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {revoke.isError ? <p className="font-caption text-caption text-error">{apiErrorMessage(revoke.error)}</p> : null}
    </Dialog>
  );
}
