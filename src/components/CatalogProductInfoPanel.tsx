import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './ui/Icon';
import { OrderQrArt } from './ui/OrderQrArt';
import { ProductImage } from './ui/ProductImage';
import { usePrimaryStoreQrLinks } from '../hooks/business/usePrimaryStoreQrLinks';
import { copyTextToClipboard } from '../scripts/referralData';
import {
  activeDealFor,
  availabilityLabel,
  dealBadgeLabel,
  firstUsableItemImage,
  isItemActive,
  itemComparePriceLabel,
  itemPriceLabel,
  offerPriceLabel,
  offerScheduleLabel,
  pricingTypeLabel,
  stockLabel,
} from '../scripts/catalogueLive';
import { toPrice, type CatalogueItem } from '../services/catalogueItemsService';
import type { BusinessOffer } from '../services/offersService';
import { formatNaira } from '../utils/format';

interface CatalogProductInfoPanelProps {
  item: CatalogueItem | null;
  offers?: BusinessOffer[];
  branchCount?: number;
  initialShowQr?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onMakeDeal?: () => void;
  onNotify: (message: string) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const joinOrDash = (values?: Array<string | null | undefined> | null) => {
  const cleaned = (values ?? []).filter((value): value is string => Boolean(value && value.trim()));
  return cleaned.length ? cleaned.join(', ') : '—';
};

const humanize = (value?: string | null) => {
  if (!value?.trim()) return '—';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const yesNo = (value?: boolean | null) => (value == null ? '—' : value ? 'Yes' : 'No');

const moneyOrDash = (value?: number | string | null) => {
  const price = toPrice(value ?? undefined);
  return price == null ? '—' : formatNaira(price);
};

type Fact = { label: string; value: string };

/**
 * Product information panel for the catalogue hub.
 *
 * It is deliberately built from the same live `CatalogueItem` the list uses —
 * no separate mock product record. A deal-linked product is still a normal
 * public product, so the panel says that explicitly and keeps both actions.
 */
export function CatalogProductInfoPanel({
  item,
  offers = [],
  branchCount,
  initialShowQr = false,
  onClose,
  onEdit,
  onMakeDeal,
  onNotify,
}: CatalogProductInfoPanelProps) {
  const links = usePrimaryStoreQrLinks();
  const [showQr, setShowQr] = useState(initialShowQr);

  useEffect(() => {
    setShowQr(initialShowQr);
  }, [item?.id, initialShowQr]);

  useEffect(() => {
    if (!item) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const publicUrl = links.productUrl(item.id);
  const deal = activeDealFor(item, offers);
  const active = isItemActive(item);
  const statusLabel = item.isSuspended ? 'Suspended' : active ? 'Active & published' : humanize(item.status);
  const statusClass = item.isSuspended
    ? 'bg-badge-warning-bg text-badge-warning-text'
    : active
      ? 'bg-badge-discount-bg text-badge-discount-text'
      : 'bg-surface-container-high text-text-secondary';
  const branchNames = joinOrDash((item.branches ?? []).map((branch) => branch.name || branch.id));

  const pricingFacts: Fact[] = [
    { label: 'Selling price', value: itemPriceLabel(item) },
    { label: 'Compare-at price', value: itemComparePriceLabel(item) ?? '—' },
    { label: 'Cost price', value: moneyOrDash(item.costPrice) },
    { label: 'Price type', value: humanize(item.priceType) },
    { label: 'Pricing mode', value: humanize(item.pricingMode ?? 'uniform') },
    { label: 'Loyalty points', value: item.loyaltyPointsValue != null ? String(item.loyaltyPointsValue) : '—' },
    { label: 'SKU', value: item.sku || '—' },
    { label: 'Barcode', value: item.barcode || '—' },
    { label: 'Stock', value: stockLabel(item) },
    { label: 'Low-stock alert', value: item.minStock != null ? String(item.minStock) : 'Not set' },
    { label: 'Backorders', value: yesNo(item.allowBackOrder) },
  ];

  const catalogueFacts: Fact[] = [
    { label: 'Category', value: item.category?.name || 'Uncategorised' },
    { label: 'Brand', value: item.brand || '—' },
    { label: 'Item type', value: humanize(item.itemType) },
    { label: 'Status', value: statusLabel },
    { label: 'Branches', value: branchNames },
    { label: 'Availability', value: availabilityLabel(item, branchCount ?? 0) },
    { label: 'Fulfilment', value: joinOrDash(item.fulfillmentModes?.map(humanize)) },
    { label: 'Tags', value: joinOrDash(item.tags) },
    { label: 'Created', value: formatDate(item.createdAt) },
    { label: 'Last edited', value: formatDate(item.updatedAt) },
  ];

  const serviceFacts: Fact[] = [
    { label: 'Duration', value: item.duration || '—' },
    { label: 'Service mode', value: humanize(item.serviceMode) },
    { label: 'Bookable', value: yesNo(item.isBookable) },
    { label: 'Buffer', value: item.bookingRules?.bufferMinutes != null ? `${item.bookingRules.bufferMinutes} min` : '—' },
    { label: 'Lead time', value: item.bookingRules?.leadMinutes != null ? `${item.bookingRules.leadMinutes} min` : '—' },
    { label: 'Horizon', value: item.bookingRules?.horizonDays != null ? `${item.bookingRules.horizonDays} days` : '—' },
    { label: 'Capacity', value: item.bookingRules?.capacity != null ? String(item.bookingRules.capacity) : '—' },
  ];

  const gallery = [item.mainImage, ...(item.galleryImages ?? [])].filter(
    (image): image is string => Boolean(image && image.trim()),
  );
  const uniqueGallery = [...new Set(gallery)];
  const heroImage = firstUsableItemImage(item) ?? uniqueGallery[0] ?? null;

  const copyPublicUrl = async () => {
    if (!publicUrl) return onNotify('The public product link is still loading.');
    const copied = await copyTextToClipboard(publicUrl);
    onNotify(copied ? 'Public product URL copied.' : 'Could not copy the link. Open it and copy from the address bar.');
  };

  const renderFacts = (facts: Fact[]) => (
    <div className="grid grid-cols-2 gap-x-space-sm gap-y-space-xs">
      {facts.map((fact) => (
        <div className="rounded-lg bg-surface-container-low px-space-xs py-space-2xs" key={fact.label}>
          <p className="font-caption text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">{fact.label}</p>
          <p className="mt-0.5 break-words font-label-sm text-label-sm font-semibold text-text-primary">{fact.value}</p>
        </div>
      ))}
    </div>
  );

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[70] bg-inverse-surface/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        aria-label={`${item.name} product information`}
        className="fixed z-[71] inset-x-0 bottom-0 mx-auto flex max-h-[90vh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-2xl bg-surface-canvas text-text-primary shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:mx-0 md:max-h-none md:w-[480px] md:max-w-none md:rounded-l-2xl md:border-l md:border-border-subtle"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-space-sm border-b border-border-subtle px-space-md py-space-sm">
          <div className="min-w-0">
            <p className="font-caption text-caption font-semibold uppercase tracking-widest text-text-tertiary">
              Product information
            </p>
            <h2 className="font-heading-sm text-heading-sm font-bold truncate text-text-primary">{item.name}</h2>
            <p className="mt-space-2xs font-caption text-[11px] text-text-tertiary">ID {item.id}</p>
          </div>
          <button
            aria-label="Close product information"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-space-md pt-space-md">
            <div className="relative overflow-hidden rounded-2xl">
              <ProductImage
                alt={item.name}
                className="h-48 w-full md:h-52"
                imageClassName="h-full w-full object-cover"
                src={heroImage}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-space-xs bg-gradient-to-t from-inverse-surface/70 to-transparent p-space-sm">
                <span className={`rounded-full px-2.5 py-1 font-caption text-caption font-bold shadow-sm ${statusClass}`}>
                  {statusLabel}
                </span>
                <span className="rounded-full bg-surface-canvas/95 px-2.5 py-1 font-heading-sm text-heading-sm font-bold text-text-primary shadow-sm">
                  {itemPriceLabel(item)}
                </span>
              </div>
            </div>

            <div className="mt-space-sm grid grid-cols-4 gap-space-2xs">
              <button
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-surface-tint-blue px-1 py-space-2xs font-caption text-[11px] font-semibold text-primary hover:bg-surface-container transition-colors"
                onClick={copyPublicUrl}
                type="button"
              >
                <Icon name="content_copy" className="text-[17px]" />
                Copy URL
              </button>
              <button
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-surface-container-low px-1 py-space-2xs font-caption text-[11px] font-semibold text-text-primary hover:bg-surface-container transition-colors"
                onClick={() => setShowQr((current) => !current)}
                type="button"
              >
                <Icon name="qr_code_2" className="text-[17px]" />
                {showQr ? 'Hide QR' : 'QR code'}
              </button>
              <button
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-surface-container-low px-1 py-space-2xs font-caption text-[11px] font-semibold text-text-primary hover:bg-surface-container transition-colors"
                onClick={onEdit}
                type="button"
              >
                <Icon name="edit" className="text-[17px]" />
                Edit
              </button>
              {onMakeDeal ? (
                <button
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-badge-discount-bg px-1 py-space-2xs font-caption text-[11px] font-semibold text-badge-discount-text hover:bg-surface-container transition-colors"
                  onClick={onMakeDeal}
                  type="button"
                >
                  <Icon name="local_offer" className="text-[17px]" />
                  Make deal
                </button>
              ) : (
                <a
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-surface-container-low px-1 py-space-2xs font-caption text-[11px] font-semibold text-text-primary hover:bg-surface-container transition-colors"
                  href={publicUrl || undefined}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon name="open_in_new" className="text-[17px]" />
                  View live
                </a>
              )}
            </div>
          </div>

          <div className="px-space-md py-space-md flex flex-col gap-space-md">
            {deal && (
              <section className="rounded-xl bg-badge-discount-bg p-space-sm text-badge-discount-text">
                <p className="flex items-center gap-space-2xs font-label-md text-label-md font-bold">
                  <Icon name="local_offer" className="text-[18px]" />
                  Deal active • {dealBadgeLabel(deal)}
                </p>
                <p className="mt-space-2xs font-caption text-caption">
                  {pricingTypeLabel(deal)} · {offerScheduleLabel(deal)} · {offerPriceLabel(deal)}
                </p>
                <p className="mt-space-2xs font-caption text-caption">
                  This product stays in Public Products and also appears in Deals. Pausing the deal never removes it from
                  your catalogue.
                </p>
              </section>
            )}

            <section>
              <div className="mb-space-xs flex items-center gap-space-2xs">
                <Icon name="payments" className="text-[17px] text-primary" />
                <h3 className="font-label-md text-label-md font-bold text-text-primary">Pricing &amp; inventory</h3>
              </div>
              {renderFacts(pricingFacts)}
            </section>

            <section>
              <div className="mb-space-xs flex items-center gap-space-2xs">
                <Icon name="inventory_2" className="text-[17px] text-primary" />
                <h3 className="font-label-md text-label-md font-bold text-text-primary">Catalogue details</h3>
              </div>
              {renderFacts(catalogueFacts)}
            </section>

            {item.itemType === 'service' && (
              <section>
                <div className="mb-space-xs flex items-center gap-space-2xs">
                  <Icon name="event_available" className="text-[17px] text-primary" />
                  <h3 className="font-label-md text-label-md font-bold text-text-primary">Booking details</h3>
                </div>
                {renderFacts(serviceFacts)}
              </section>
            )}

            {(item.description || item.shortDescription) && (
              <section>
                <div className="mb-space-xs flex items-center gap-space-2xs">
                  <Icon name="description" className="text-[17px] text-primary" />
                  <h3 className="font-label-md text-label-md font-bold text-text-primary">Description</h3>
                </div>
                <p className="whitespace-pre-wrap rounded-xl bg-surface-container-low p-space-sm font-body-md text-body-md text-text-secondary">
                  {item.description || item.shortDescription}
                </p>
              </section>
            )}

            {Array.isArray(item.variants) && item.variants.length > 0 && (
              <section>
                <div className="mb-space-xs flex items-center gap-space-2xs">
                  <Icon name="tune" className="text-[17px] text-primary" />
                  <h3 className="font-label-md text-label-md font-bold text-text-primary">
                    Variants ({item.variants.length})
                  </h3>
                </div>
                <div className="overflow-hidden rounded-xl border border-border-subtle">
                  <table className="w-full text-left font-label-sm text-label-sm">
                    <thead className="bg-surface-container-low text-text-secondary">
                      <tr>
                        <th className="px-space-xs py-space-2xs">Name</th>
                        <th className="px-space-xs py-space-2xs">Price</th>
                        <th className="px-space-xs py-space-2xs">SKU</th>
                        <th className="px-space-xs py-space-2xs">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {item.variants.map((variant, index) => (
                        <tr key={`${variant.id ?? variant.name}-${index}`}>
                          <td className="px-space-xs py-space-2xs font-semibold text-text-primary">{variant.name}</td>
                          <td className="px-space-xs py-space-2xs text-text-primary">{moneyOrDash(variant.price)}</td>
                          <td className="px-space-xs py-space-2xs text-text-secondary">{variant.sku || '—'}</td>
                          <td className="px-space-xs py-space-2xs text-text-secondary">
                            {variant.stockQuantity ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {uniqueGallery.length > 0 && (
              <section>
                <div className="mb-space-xs flex items-center gap-space-2xs">
                  <Icon name="photo_library" className="text-[17px] text-primary" />
                  <h3 className="font-label-md text-label-md font-bold text-text-primary">Media</h3>
                </div>
                <div className="flex gap-space-2xs overflow-x-auto no-scrollbar">
                  {uniqueGallery.map((image, index) => (
                    <ProductImage
                      alt={`${item.name} image ${index + 1}`}
                      className="h-16 w-16 shrink-0 rounded-lg"
                      iconClassName="text-[18px]"
                      key={`${image}-${index}`}
                      showLabel={false}
                      src={image}
                    />
                  ))}
                </div>
              </section>
            )}

            {Array.isArray(item.videos) && item.videos.length > 0 && (
              <section>
                <div className="mb-space-xs flex items-center gap-space-2xs">
                  <Icon name="videocam" className="text-[17px] text-primary" />
                  <h3 className="font-label-md text-label-md font-bold text-text-primary">Videos</h3>
                </div>
                <div className="flex flex-col gap-space-2xs">
                  {item.videos.map((video, index) => (
                    <a
                      className="flex items-center gap-space-2xs rounded-lg bg-surface-container-low px-space-xs py-space-2xs font-label-sm text-label-sm font-semibold text-primary hover:bg-surface-container"
                      href={video}
                      key={`${video}-${index}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon name="play_circle" className="text-[16px]" />
                      Open video {index + 1}
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-xl border border-border-subtle p-space-sm">
              <div className="mb-space-2xs flex items-center gap-space-2xs">
                <Icon name="link" className="text-[17px] text-primary" />
                <h3 className="font-label-md text-label-md font-bold text-text-primary">Public product link</h3>
              </div>
              <p className="break-all font-label-sm text-label-sm text-text-secondary">
                {publicUrl || 'Waiting for your business public link…'}
              </p>
              {publicUrl && (
                <div className="mt-space-xs flex flex-wrap gap-space-2xs">
                  <button
                    className="inline-flex items-center gap-space-2xs rounded-lg bg-surface-tint-blue px-space-xs py-space-2xs font-label-sm text-label-sm font-semibold text-primary hover:bg-surface-container transition-colors"
                    onClick={copyPublicUrl}
                    type="button"
                  >
                    <Icon name="content_copy" className="text-[16px]" />
                    Copy URL
                  </button>
                  <a
                    className="inline-flex items-center gap-space-2xs rounded-lg bg-surface-container-low px-space-xs py-space-2xs font-label-sm text-label-sm font-semibold text-text-primary hover:bg-surface-container transition-colors"
                    href={publicUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Icon name="open_in_new" className="text-[16px]" />
                    Open
                  </a>
                  <button
                    className="inline-flex items-center gap-space-2xs rounded-lg bg-surface-container-low px-space-xs py-space-2xs font-label-sm text-label-sm font-semibold text-text-primary hover:bg-surface-container transition-colors"
                    onClick={() => setShowQr((current) => !current)}
                    type="button"
                  >
                    <Icon name="qr_code_2" className="text-[16px]" />
                    {showQr ? 'Hide QR' : 'View QR'}
                  </button>
                </div>
              )}
              {showQr && publicUrl && (
                <div className="mt-space-sm flex flex-col items-center rounded-xl bg-surface-container-low p-space-md">
                  <OrderQrArt value={publicUrl} size={164} alt={`QR code for ${item.name}`} />
                  <p className="mt-space-xs text-center font-caption text-caption text-text-secondary">
                    Scan to open this product on your public storefront.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-2xs border-t border-border-subtle bg-surface-canvas px-space-md py-space-sm">
          <button
            className="inline-flex flex-1 items-center justify-center gap-space-2xs rounded-lg bg-primary px-space-sm py-space-2xs font-label-sm text-label-sm font-bold text-on-primary hover:bg-primary-hover transition-colors"
            onClick={onEdit}
            type="button"
          >
            <Icon name="edit" className="text-[16px]" />
            Edit product
          </button>
          {onMakeDeal && (
            <button
              className="inline-flex flex-1 items-center justify-center gap-space-2xs rounded-lg bg-badge-discount-bg px-space-sm py-space-2xs font-label-sm text-label-sm font-bold text-badge-discount-text hover:bg-surface-container transition-colors"
              onClick={onMakeDeal}
              type="button"
            >
              <Icon name="local_offer" className="text-[16px]" />
              Make a deal
            </button>
          )}
          <button
            className="inline-flex items-center gap-space-2xs rounded-lg px-space-xs py-space-2xs font-label-sm text-label-sm font-semibold text-text-secondary hover:bg-surface-container transition-colors"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </aside>
    </>,
    document.body,
  );
}
