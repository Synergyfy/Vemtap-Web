import { useEffect, useRef } from 'react';
import { CHANNEL_PLATFORMS, type ChannelPlatformId } from '../utils/socialChannels';
import { Icon } from './ui/Icon';

interface SocialChannelPickerProps {
  /** Platforms already on the profile — shown disabled so we never duplicate. */
  used: readonly ChannelPlatformId[];
  onSelect: (platform: ChannelPlatformId) => void;
  onClose: () => void;
  /** Which edge of the trigger the panel should hug. */
  align?: 'left' | 'right';
  className?: string;
}

/**
 * Dropdown of supported social platforms.
 *
 * Render it inside a `relative` container next to whatever opens it; the panel
 * closes on outside click and Escape.
 */
export function SocialChannelPicker({
  used,
  onSelect,
  onClose,
  align = 'right',
  className = '',
}: SocialChannelPickerProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Choose a platform to add"
      className={`absolute top-full z-40 mt-2 w-[19rem] max-w-[calc(100vw-2.5rem)] rounded-2xl bg-surface-canvas ring-1 ring-border-subtle shadow-[0_18px_45px_rgba(13,37,76,0.18)] p-space-sm ${
        align === 'right' ? 'right-0' : 'left-0'
      } ${className}`}
    >
      <div className="px-space-xs pt-space-2xs pb-space-xs">
        <span className="block font-label-md text-label-md font-semibold text-text-primary">Add a channel</span>
        <p className="font-caption text-caption text-text-tertiary">Pick a platform your customers already use.</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {CHANNEL_PLATFORMS.map((platform) => {
          const disabled = used.includes(platform.id);
          return (
            <button
              key={platform.id}
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={() => onSelect(platform.id)}
              className={`flex items-center gap-2 p-space-xs rounded-xl text-left transition-colors ${
                disabled
                  ? 'opacity-45 cursor-not-allowed bg-surface-subtle'
                  : 'hover:bg-surface-tint-blue focus:outline-none focus:bg-surface-tint-blue'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${platform.iconClass}`}>
                <Icon name={platform.icon} className="text-[18px]" />
              </span>
              <span className="min-w-0 flex flex-col">
                <span className="font-label-sm text-label-sm font-semibold text-text-primary truncate">
                  {platform.label}
                </span>
                <span className="font-caption text-caption text-text-tertiary truncate">
                  {disabled ? 'Already added' : platform.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
