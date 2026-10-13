import type { KeyboardEvent } from 'react';
import { Icon } from '../components/ui/Icon';

export type DealBadgeVariant = 'green' | 'blue';
export type DealCategoryVariant = 'highlight' | 'muted';
export type DealTagVariant = 'hot' | 'trending' | 'exclusive';

const badgeClasses: Record<DealBadgeVariant, string> = {
  green: 'bg-badge-discount-bg text-badge-discount-text',
  blue: 'bg-primary-container text-on-primary',
};

const categoryClasses: Record<DealCategoryVariant, string> = {
  highlight: 'font-caption text-[11px] text-primary font-semibold uppercase tracking-wider',
  muted: 'font-caption text-[11px] text-text-secondary font-medium',
};

const tagClasses: Record<DealTagVariant, { icon: string; filled: boolean; className: string }> = {
  hot: { icon: 'local_fire_department', filled: true, className: 'text-tertiary-container bg-surface-container-high' },
  trending: { icon: 'trending_up', filled: false, className: 'text-primary bg-surface-tint-blue' },
  exclusive: { icon: 'verified', filled: false, className: 'text-primary bg-surface-tint-blue' },
};

export interface DealTag {
  variant: DealTagVariant;
  label: string;
}

export interface DealCardProps {
  image: string;
  imageAlt: string;
  badge: string;
  badgeVariant: string;
  category: string;
  categoryVariant: string;
  tag?: DealTag;
  businessName: string;
  dealTitle: string;
  distance: string;
  rating: string;
  reviews: string;
  onOpen?: () => void;
}

export function DealCard({
  image,
  imageAlt,
  badge,
  badgeVariant,
  category,
  categoryVariant,
  tag,
  businessName,
  dealTitle,
  distance,
  rating,
  reviews,
  onOpen,
}: DealCardProps) {
  const safeBadgeVariant = badgeVariant as unknown as DealBadgeVariant;
  const safeCategoryVariant = categoryVariant as unknown as DealCategoryVariant;
  const resolvedBadgeClass = badgeClasses[safeBadgeVariant];
  const resolvedCategoryClass = categoryClasses[safeCategoryVariant];
  const tagStyle = tag ? tagClasses[tag.variant] : null;
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onOpen) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };
  return (
    <div
      className={`group relative w-full bg-surface-container-lowest rounded-xl p-3.5 shadow-md transition-all duration-200 active:scale-[0.99]${onOpen ? ' cursor-pointer' : ''}`}
      onClick={onOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="flex gap-3">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container">
          <img className="w-full h-full object-cover" alt={imageAlt} src={image} />
          <div className={`absolute top-1.5 left-1.5 font-label-sm text-caption px-1.5 py-0.5 rounded-full font-bold shadow-xs ${resolvedBadgeClass}`}>
            {badge}
          </div>
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span className={`${resolvedCategoryClass} min-w-0 truncate`}>
                {category}
              </span>
              {tag && tagStyle && (
                <span className={`inline-flex items-center gap-0.5 font-label-sm text-[11px] shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full font-medium ${tagStyle.className}`}>
                  <Icon name={tagStyle.icon} filled={tagStyle.filled} className="text-[13px]" />
                  {tag.label}
                </span>
              )}
            </div>
            <h2 className="font-heading-sm text-heading-sm text-text-primary truncate mt-0.5">
              {businessName}
            </h2>
            <p className="font-body-md text-body-md font-medium text-text-primary mt-0.5 line-clamp-1">
              {dealTitle}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 bg-surface-subtle -mx-3.5 -mb-3.5 px-3.5 py-2 rounded-b-xl">
            <div className="flex items-center gap-1 text-text-secondary font-label-sm text-caption">
              <Icon name="distance" className="text-[15px] text-primary" />
              <span>{distance}</span>
            </div>
            <div className="flex items-center gap-1 font-label-sm text-caption text-text-primary font-semibold">
              <Icon name="star" filled className="text-[14px] text-tertiary-container" />
              <span>{rating}</span>
              <span className="text-text-tertiary font-normal">({reviews})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface PeekDealCardProps {
  image: string;
  imageAlt: string;
  name: string;
  badge: string;
  meta: string;
}

export function PeekDealCard({ image, imageAlt, name, badge, meta }: PeekDealCardProps) {
  return (
    <div className="relative w-full bg-surface-container-lowest/90 rounded-xl p-3 shadow-sm opacity-90 scale-[0.98] -mt-1 pointer-events-none">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-container">
          <img className="w-full h-full object-cover" alt={imageAlt} src={image} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary truncate text-[16px]">
              {name}
            </h3>
            <span className="font-label-sm text-caption text-badge-discount-text bg-badge-discount-bg font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
              {badge}
            </span>
          </div>
          <p className="font-body-md text-caption text-text-secondary truncate mt-0.5">
            {meta}
          </p>
        </div>
      </div>
    </div>
  );
}