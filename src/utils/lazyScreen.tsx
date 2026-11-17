import { lazy, type ComponentType } from 'react';

const RELOAD_KEY = 'vemtap_chunk_reload';

const reloadedOnce = () => {
  try {
    return window.sessionStorage.getItem(RELOAD_KEY) === '1';
  } catch {
    return true;
  }
};

const rememberReload = (value: boolean) => {
  try {
    if (value) window.sessionStorage.setItem(RELOAD_KEY, '1');
    else window.sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    // storage unavailable; the customer can still reload by hand
  }
};

function ScreenLoadFailed() {
  return (
    <div className="mx-auto w-full max-w-md px-margin pt-10 text-center space-y-3">
      <p className="font-label-md text-label-md text-text-primary font-semibold">This page couldn’t load.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="h-11 w-full rounded-xl bg-primary text-on-primary font-button-primary text-button-primary"
      >
        Reload
      </button>
    </div>
  );
}

/**
 * A screen loaded the first time it is needed, so visitors don't download every
 * page up front. A deploy removes the old files a page already open still asks
 * for, so a failed load reloads once to pick up the new ones.
 */
export function lazyScreen<Props extends object>(load: () => Promise<ComponentType<Props>>) {
  const loadScreen = async (): Promise<{ default: ComponentType<Props> }> => {
    try {
      const screen = await load();
      rememberReload(false);
      return { default: screen };
    } catch {
      if (!reloadedOnce()) {
        rememberReload(true);
        window.location.reload();
        return new Promise(() => undefined);
      }
      return { default: ScreenLoadFailed as ComponentType<Props> };
    }
  };
  return Object.assign(lazy(loadScreen), { preload: () => void load().catch(() => undefined) });
}
