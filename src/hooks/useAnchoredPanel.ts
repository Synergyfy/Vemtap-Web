import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

export interface AnchoredPosition {
  top: number;
  left: number;
  /** True when the panel had to flip above the trigger for lack of room below. */
  above: boolean;
}

interface UseAnchoredPanelOptions {
  /** Width the panel takes once laid out — used to clamp it inside the viewport. */
  width: number;
  /** Clearance kept between the trigger and the viewport edge. */
  gap?: number;
  align?: 'left' | 'right';
}

/**
 * Anchors a dropdown panel to its trigger in viewport coordinates.
 *
 * Every screen chrome here uses `backdrop-blur`, which makes that element the
 * containing block for `position: fixed` descendants — an absolutely positioned
 * panel would be clipped by a scrolling toolbar instead of floating over it.
 * The consumer is expected to render the panel through a portal to
 * `document.body`, then position it with the `style` returned here.
 *
 * While open the panel re-anchors on scroll/resize, flips above the trigger
 * when the space below runs out, and closes on Escape.
 */
export function useAnchoredPanel({ width, gap = 8, align = 'right' }: UseAnchoredPanelOptions) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<AnchoredPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const place = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      if (!trigger) return;
      const height = panelRef.current?.offsetHeight ?? 260;
      const roomBelow = window.innerHeight - trigger.bottom;
      const above = roomBelow < height + gap * 2 && trigger.top > height + gap * 2;

      const maxLeft = Math.max(gap, window.innerWidth - width - gap);
      const rawLeft = align === 'right' ? trigger.right - width : trigger.left;

      setPosition({
        top: above ? trigger.top - gap : trigger.bottom + gap,
        left: Math.min(Math.max(gap, rawLeft), maxLeft),
        above,
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    place();
    // Capture phase so the panel also re-anchors when its own portal scrolls.
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, align, gap, width]);

  const style: CSSProperties = {
    position: 'fixed',
    width,
    maxHeight: 'min(340px, calc(100vh - 32px))',
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    transform: position?.above ? 'translateY(-100%)' : undefined,
    visibility: position ? undefined : 'hidden',
  };

  return { open, setOpen, triggerRef, panelRef, style };
}
