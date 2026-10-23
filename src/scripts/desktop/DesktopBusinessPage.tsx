import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { EnterpriseShell } from './EnterpriseShell';

export interface Crumb {
  label: string;
  onClick?: () => void;
}

interface DesktopBusinessPageProps {
  activeNav: string;
  onNav: (key: string) => void;
  /** Trail after "Business Hub"; the last crumb is the current page. */
  crumbs: Crumb[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Standard desktop business page: enterprise shell, breadcrumb, title row. */
export function DesktopBusinessPage({ activeNav, onNav, crumbs, title, subtitle, actions, children }: DesktopBusinessPageProps) {
  return (
    <EnterpriseShell activeNav={activeNav} onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-xl">
        <div className="flex flex-col gap-space-md">
          <nav className="flex items-center gap-space-2xs text-text-tertiary font-label-sm text-label-sm flex-wrap">
            <button
              type="button"
              className="hover:text-primary transition-colors flex items-center gap-1"
              onClick={() => onNav('overview')}
            >
              <Icon name="storefront" className="text-[16px]" />
              <span>Business Hub</span>
            </button>
            {crumbs.map((crumb, index) => (
              <span key={crumb.label} className="flex items-center gap-space-2xs">
                <Icon name="chevron_right" className="text-[14px]" />
                {index === crumbs.length - 1 || !crumb.onClick ? (
                  <span className={index === crumbs.length - 1 ? 'text-text-primary font-semibold' : ''}>{crumb.label}</span>
                ) : (
                  <button type="button" className="hover:text-primary transition-colors" onClick={crumb.onClick}>
                    {crumb.label}
                  </button>
                )}
              </span>
            ))}
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-1 max-w-3xl">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{title}</h1>
              {subtitle ? <p className="font-body-md text-body-md text-text-secondary">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex items-center gap-space-xs shrink-0">{actions}</div> : null}
          </div>
        </div>
        {children}
      </div>
    </EnterpriseShell>
  );
}
