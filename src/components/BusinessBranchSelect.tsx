import { useState } from 'react';
import { Icon } from './ui/Icon';
import { useBusinessBranch } from '../context/BusinessBranchContext';

interface BusinessBranchSelectProps {
  leading?: 'storefront' | 'location' | 'dot';
  triggerClassName?: string;
  nameClassName?: string;
  align?: 'left' | 'right';
  /** Icon-only trigger for compact headers — the branch name shows inside the dropdown. */
  iconOnly?: boolean;
}

export function BusinessBranchSelect({
  leading = 'storefront',
  triggerClassName,
  nameClassName,
  align = 'left',
  iconOnly = false,
}: BusinessBranchSelectProps) {
  const { branch, branches, switchTo } = useBusinessBranch();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Location: ${branch.name}. Switch location`}
        title={`Location: ${branch.name}`}
        className={
          triggerClassName ??
          (iconOnly
            ? 'w-9 h-9 rounded-lg flex items-center justify-center bg-surface-subtle hover:bg-surface-container border border-border-subtle transition-colors active:scale-95'
            : 'inline-flex items-center gap-1 h-8 max-w-[170px] pl-2 pr-1.5 rounded-full bg-surface-container-low hover:bg-surface-container border border-border-subtle transition-colors active:scale-95 text-left')
        }
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        {leading === 'storefront' && <Icon name="storefront" className={`text-primary shrink-0 ${iconOnly ? 'text-[18px]' : 'text-[16px]'}`} />}
        {leading === 'location' && <Icon name="location_on" className="text-[16px] text-primary shrink-0" />}
        {leading === 'dot' && <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text shrink-0" />}
        {!iconOnly && (
          <span
            className={`min-w-0 truncate ${nameClassName ?? 'font-label-sm text-label-sm font-semibold text-on-surface'}`}
          >
            {branch.name}
          </span>
        )}
        {!iconOnly && (
          <Icon
            name={leading === 'location' ? 'arrow_drop_down' : leading === 'dot' ? 'expand_more' : 'keyboard_arrow_down'}
            className={`text-[16px] text-text-secondary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1.5 z-40 bg-surface-canvas rounded-xl shadow-lg border border-border-subtle p-1 min-w-[176px] max-w-[calc(100vw-2rem)] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="listbox"
        >
          {branches.map((option) => (
            <button
              aria-selected={option.key === branch.key}
              className={`w-full h-9 px-2.5 flex items-center justify-between gap-2 rounded-lg transition-colors ${
                option.key === branch.key
                  ? 'bg-surface-tint-blue text-primary font-semibold'
                  : 'hover:bg-surface-subtle text-on-surface'
              }`}
              key={option.key}
              role="option"
              type="button"
              onClick={() => {
                switchTo(option.key);
                setOpen(false);
              }}
            >
              <span className="font-label-sm text-label-sm flex items-center gap-2 min-w-0">
                <Icon
                  name="storefront"
                  className={`text-[15px] shrink-0 ${option.key === branch.key ? 'text-primary' : 'text-text-tertiary'}`}
                />
                <span className="truncate">{option.name}</span>
              </span>
              {option.key === branch.key && <Icon name="check" className="text-primary text-[16px] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
