import type { ReactNode } from 'react';

export function AppScreen({ children, surface = 'bg-surface' }: { children: ReactNode; surface?: string }) {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col min-h-full selection:bg-primary-container selection:text-on-primary-container">
      <div className="fixed top-0 inset-x-0 h-11 z-50 pointer-events-none pt-safe" />
      <main
        className={`flex-1 flex flex-col relative w-full max-w-[430px] mx-auto ${surface} pt-safe pb-safe min-h-screen`}
      >
        {children}
      </main>
    </div>
  );
}