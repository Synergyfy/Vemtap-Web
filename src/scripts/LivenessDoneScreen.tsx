import { useEffect } from 'react';
import { Icon } from '../components/ui/Icon';

/**
 * Where bytID's selfie check sends the browser tab it opened. The verification
 * page in the original tab is polling the result, so this tab just closes.
 */
export function LivenessDoneScreen() {
  useEffect(() => {
    const id = window.setTimeout(() => window.close(), 1500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="w-full min-h-screen bg-surface flex items-center justify-center p-space-md">
      <div className="max-w-sm w-full rounded-xl bg-surface-canvas shadow-xl p-space-xl flex flex-col items-center text-center gap-space-sm">
        <span className="w-14 h-14 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
          <Icon name="check_circle" filled className="text-[30px]" />
        </span>
        <h1 className="font-heading-md text-heading-md text-text-primary">Selfie check complete</h1>
        <p className="font-body-md text-body-md text-text-secondary">
          You can close this tab. Your verification continues in the VemTap tab you started from.
        </p>
      </div>
    </div>
  );
}
