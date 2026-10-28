import type { ReactNode } from 'react';

interface AppScreenProps {
  children: ReactNode;
  surface?: string;
  /**
   * Opt-in: size the screen to the *visible* mobile viewport (100dvh, with
   * 100vh as the fallback) instead of 100vh, so screens that are meant to
   * fit the phone viewport don't overflow on browsers whose 100vh ignores
   * dynamic toolbars. Default stays 100vh for every other screen.
   */
  fit?: boolean;
}

export function AppScreen({ children, surface = 'bg-surface', fit = false }: AppScreenProps) {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col min-h-full selection:bg-primary-container selection:text-on-primary-container">
      <div className="fixed top-0 inset-x-0 h-11 z-50 pointer-events-none pt-safe" />
      <main
        className={`flex-1 flex flex-col relative w-full max-w-[430px] mx-auto ${surface} pt-safe pb-safe min-h-screen`}
        style={fit ? { minHeight: '100dvh' } : undefined}
      >
        {children}
      </main>
    </div>
  );
}