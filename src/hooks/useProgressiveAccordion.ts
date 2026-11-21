import { useEffect, useRef, useState } from 'react';

/**
 * Drives a linear accordion: one section is open at a time, later sections stay
 * locked until the owner advances through the ones before them, and completing
 * the open section reveals the next one automatically.
 *
 * `completed` is only used for progress markers and for deciding which section
 * is safe to show. A separate unlocked index keeps pre-selected defaults (for
 * example a preset role) from skipping several sections at once.
 */
export function useProgressiveAccordion(completed: boolean[], initialIndex = 0) {
  const [requestedIndex, setRequestedIndex] = useState(initialIndex);
  const [unlockedIndex, setUnlockedIndex] = useState(initialIndex);
  const previousCompleted = useRef<boolean[]>(completed);
  const completedKey = completed.join('|');

  const firstIncomplete = completed.findIndex((isComplete) => !isComplete);
  // An invalid earlier section re-locks everything after it, even if those
  // sections were unlocked during an earlier pass.
  const completionLimit = firstIncomplete === -1 ? completed.length - 1 : firstIncomplete;
  const highestAvailable = Math.min(unlockedIndex, completionLimit);
  const activeIndex = Math.min(requestedIndex, highestAvailable);

  useEffect(() => {
    if (requestedIndex !== activeIndex) setRequestedIndex(activeIndex);
  }, [requestedIndex, activeIndex]);

  useEffect(() => {
    const previous = previousCompleted.current;
    let nextIndex: number | null = null;

    if (previous.length === completed.length) {
      const newlyCompleted = completed.findIndex((isComplete, index) => isComplete && !previous[index]);
      if (newlyCompleted >= 0 && newlyCompleted === activeIndex && activeIndex < completed.length - 1) {
        nextIndex = activeIndex + 1;
      }
    }

    previousCompleted.current = completed;

    if (nextIndex !== null) {
      setRequestedIndex(Math.min(nextIndex, completed.length - 1));
      setUnlockedIndex((current) => Math.max(current, Math.min(nextIndex!, completed.length - 1)));
    }
    // `completedKey` captures the values; `completed` is rebuilt every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedKey, activeIndex]);

  const reveal = (index: number) => {
    // Headers and Continue buttons may only open the next section, never skip
    // ahead. Reopening an already-unlocked section is always allowed.
    if (index >= 0 && index <= completionLimit && index <= unlockedIndex + 1) {
      setRequestedIndex(index);
      setUnlockedIndex((current) => Math.max(current, index));
    }
  };

  return { activeIndex, highestAvailable, reveal };
}
