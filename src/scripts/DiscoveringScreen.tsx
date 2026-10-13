import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface DiscoveringScreenProps {
  onReady: () => void;
}

const STEPS = [
  { progress: 45, text: 'Scanning Apo, Abuja...' },
  { progress: 78, text: 'Gathering merchant discounts...' },
  { progress: 94, text: 'Curating nearby exclusives...' },
  { progress: 100, text: 'Welcome to VEMTAP!' },
];

export function DiscoveringScreen({ onReady }: DiscoveringScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const stepTimer = window.setInterval(() => {
      setStepIndex((current) => (current >= STEPS.length - 1 ? current : current + 1));
    }, 1400);

    const finishTimer = window.setTimeout(() => onReadyRef.current(), STEPS.length * 1400 + 700);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  const step = STEPS[stepIndex];

  return (
    <AppScreen>
      <div className="flex flex-col w-full flex-1 relative overflow-hidden select-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-surface-tint-blue rounded-full blur-2xl pointer-events-none opacity-80" />

        <div className="w-full max-w-[393px] mx-auto px-margin flex flex-col justify-between py-space-xl flex-1">
          <div className="flex items-center justify-center pt-space-md">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/60 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="font-caption text-caption text-text-secondary tracking-wide uppercase font-semibold">
                VEMTAP RADAR
              </span>
            </div>
          </div>

          <div className="relative w-full h-[380px] flex items-center justify-center my-space-lg">
            <div className="absolute w-72 h-72 rounded-full bg-surface-tint-blue/40 animate-ping opacity-40" />
            <div className="absolute w-64 h-64 rounded-full bg-surface-container-high/40" />
            <div className="absolute w-48 h-48 rounded-full bg-surface-container/60 shadow-inner" />
            <div className="absolute w-32 h-32 rounded-full bg-surface-canvas shadow-lg flex items-center justify-center" />

            <div
              className="absolute w-64 h-64 pointer-events-none animate-spin"
              style={{ animationDuration: '4.5s', animationTimingFunction: 'linear' }}
            >
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="radarSweep" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#066cf4" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#066cf4" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#066cf4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 100 100 L 200 100 A 100 100 0 0 0 100 0 Z" fill="url(#radarSweep)" />
              </svg>
            </div>

            <div className="relative z-20 w-16 h-16 rounded-full bg-primary-container text-on-primary shadow-xl shadow-primary-container/30 flex items-center justify-center active:scale-95 transition-transform duration-200">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
              <Icon name="explore" filled className="text-[28px]" />
            </div>

            <div className="absolute -top-1 left-2 z-10 bg-surface-canvas rounded-xl p-space-xs shadow-md shadow-slate-900/5 max-w-[190px] flex items-center gap-space-xs animate-bounce" style={{ animationDuration: '3.6s' }}>
              <div className="w-9 h-9 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center text-text-primary text-base">
                ☕
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-1">
                  <span className="font-label-sm text-label-sm text-text-primary font-bold truncate">Cafe Neo</span>
                  <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-[10px] px-1 rounded font-bold leading-tight">
                    -25%
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary truncate">Buy 1 Get 1 Free</span>
              </div>
            </div>

            <div className="absolute bottom-2 right-2 z-10 bg-surface-canvas rounded-xl p-space-xs shadow-md shadow-slate-900/5 max-w-[185px] flex items-center gap-space-xs animate-bounce" style={{ animationDuration: '4.2s' }}>
              <div className="w-9 h-9 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center text-text-primary text-base">
                👟
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="font-label-sm text-label-sm text-text-primary font-bold truncate">Sole District</span>
                <span className="font-caption text-caption text-primary-container font-medium truncate">
                  Weekend Special
                </span>
              </div>
            </div>

            <div className="absolute top-6 right-0 z-10 bg-surface-canvas rounded-full px-3 py-1.5 shadow-md shadow-slate-900/5 flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3.9s' }}>
              <span className="text-sm">🛍️</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">34 New Deals</span>
            </div>

            <div className="absolute bottom-4 left-0 z-10 bg-surface-canvas rounded-full px-3 py-1.5 shadow-md shadow-slate-900/5 flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '4.6s' }}>
              <Icon name="near_me" filled className="text-primary-container text-[16px]" />
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">Apo • Within 3km</span>
            </div>
          </div>

          <div className="w-full flex flex-col items-center text-center gap-space-sm px-space-xs mt-space-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-tint-blue text-primary-container">
              <Icon name="auto_awesome" filled className="text-[14px]" />
              <span className="font-label-sm text-label-sm font-semibold tracking-normal">
                Personalizing your local feed
              </span>
            </div>

            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Finding what's around you...
            </h1>
            <p className="font-body-md text-body-md text-text-secondary max-w-[280px]">
              Discovering deals, businesses and products near you.
            </p>

            <div className="w-full max-w-[260px] pt-space-xs">
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden relative shadow-inner">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-700 ease-out"
                  id="progress-bar-fill"
                  style={{ width: `${step.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-space-xs text-text-tertiary">
                <Icon name="sync" className="text-[14px] animate-spin text-primary-container" />
                <span className="font-caption text-caption text-text-secondary font-medium" id="geo-status-label">
                  {step.text}
                </span>
              </div>
            </div>

            <div className="pt-space-md">
              <p className="font-caption text-caption text-text-tertiary">
                Preparing exclusive perks • Ready in a moment
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
