import { useEffect, useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { CartSheet } from '../components/sheets/CartSheet';
import { useCart } from '../context/CartContext';
import { naira, type CatalogueProduct, type ProductOptionGroup } from './catalogueData';
import { MERCHANT_NAME } from './orderData';

interface ProductDetailScreenProps {
  product: CatalogueProduct;
  onBack: () => void;
  onOpenBusiness: () => void;
  onCheckout?: () => void;
}

type Selections = Record<string, string | string[]>;

const defaultSelections = (groups: ProductOptionGroup[]): Selections =>
  Object.fromEntries(
    groups.map((group) => [
      group.key,
      group.type === 'multi'
        ? []
        : group.defaultId ?? group.choices[0]?.id ?? '',
    ]),
  );

export function ProductDetailScreen({ product, onBack, onOpenBusiness, onCheckout }: ProductDetailScreenProps) {
  const cart = useCart();
  const groups = useMemo(() => product.optionGroups ?? [], [product]);

  const [selections, setSelections] = useState<Selections>(() => defaultSelections(groups));
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  useEffect(() => {
    setSelections(defaultSelections(product.optionGroups ?? []));
    setQty(1);
    setInstructions('');
  }, [product.id, product.optionGroups]);

  const addonTotal = groups
    .filter((group) => group.type === 'multi')
    .reduce((sum, group) => {
      const selected = selections[group.key];
      if (!Array.isArray(selected)) return sum;
      return (
        sum +
        group.choices
          .filter((choice) => selected.includes(choice.id))
          .reduce((inner, choice) => inner + (choice.price ?? 0), 0)
      );
    }, 0);

  const unitPrice = product.price + addonTotal;
  const total = unitPrice * qty;

  const optionSummary = groups
    .map((group) => {
      const selected = selections[group.key];
      if (Array.isArray(selected)) {
        return group.choices.filter((choice) => selected.includes(choice.id)).map((choice) => choice.label);
      }
      const choice = group.choices.find((entry) => entry.id === selected);
      return choice ? [choice.label] : [];
    })
    .flat()
    .filter(Boolean)
    .join(' • ');

  const variantId = [
    product.id,
    ...groups.map((group) => {
      const selected = selections[group.key];
      return Array.isArray(selected) ? [...selected].sort().join('.') : String(selected ?? '');
    }),
  ].join('__');

  const inCart = cart.lines.find((line) => line.id === variantId)?.qty ?? 0;

  const discountPct = product.was ? Math.round(((product.was - product.price) / product.was) * 100) : 0;
  const savings = product.was ? product.was - product.price : 0;

  const share = () => {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const toggleSingle = (group: ProductOptionGroup, choiceId: string) => {
    setSelections((prev) => ({ ...prev, [group.key]: choiceId }));
  };

  const toggleMulti = (group: ProductOptionGroup, choiceId: string) => {
    setSelections((prev) => {
      const current = Array.isArray(prev[group.key]) ? (prev[group.key] as string[]) : [];
      return {
        ...prev,
        [group.key]: current.includes(choiceId)
          ? current.filter((id) => id !== choiceId)
          : [...current, choiceId],
      };
    });
  };

  const addToOrder = () => {
    cart.add(
      {
        id: variantId,
        productId: product.id,
        name: product.name,
        price: unitPrice,
        image: product.image,
        options: optionSummary || undefined,
        instructions: instructions.trim() || undefined,
      },
      qty,
    );
    setAddedFlash(true);
    window.setTimeout(() => setAddedFlash(false), 1500);
  };

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Navigate back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 -ml-1 flex items-center justify-center text-on-surface hover:text-primary transition-colors active:scale-95"
            >
              <Icon name="arrow_back_ios_new" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate max-w-[200px]">
              Product Details
            </h1>
          </div>
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label={copied ? 'Link copied' : 'Share offer'}
              type="button"
              onClick={share}
              className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <Icon name={copied ? 'check' : 'share'} className="text-[22px]" />
            </button>
            <button
              aria-label={`Open cart (${cart.count} items)`}
              type="button"
              onClick={() => setCartOpen(true)}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center relative"
            >
              <Icon name="shopping_bag" className="text-on-primary text-[18px]" />
              {cart.count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-badge-discount-bg text-badge-discount-text font-caption text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>
        {copied && (
          <div className="px-margin pb-2">
            <div className="bg-inverse-surface/95 text-inverse-on-surface rounded-lg px-3 py-1.5 font-caption text-caption flex items-center gap-1.5 w-fit">
              <Icon name="check" className="text-[14px]" />
              <span>Link copied</span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-14 pb-safe bg-surface">
        <div className="flex flex-col w-full pb-32">
          <div className="relative w-full overflow-hidden bg-surface-container-low">
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <img className="w-full h-full object-cover" alt={product.imageAlt} src={product.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/20 pointer-events-none" />

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <button
                  aria-label="Go back"
                  type="button"
                  onClick={onBack}
                  className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-md flex items-center justify-center text-on-surface hover:text-primary active:scale-90 transition-transform"
                >
                  <Icon name="arrow_back" className="text-[20px]" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Share dish"
                    type="button"
                    onClick={share}
                    className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-md flex items-center justify-center text-on-surface hover:text-primary active:scale-90 transition-transform"
                  >
                    <Icon name={copied ? 'check' : 'share'} className="text-[20px]" />
                  </button>
                  <button
                    aria-label="Save to favorites"
                    type="button"
                    onClick={() => setFavorite((value) => !value)}
                    className={`w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-md flex items-center justify-center active:scale-90 transition-transform ${
                      favorite ? 'text-tertiary-container' : 'text-on-surface hover:text-tertiary-container'
                    }`}
                  >
                    <Icon name={favorite ? 'favorite' : 'favorite_border'} filled={favorite} className="text-[20px]" />
                  </button>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 z-10">
                {discountPct > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm shadow-sm font-semibold">
                    <Icon name="local_offer" className="text-[14px]" />
                    {discountPct}% OFF Voucher
                  </span>
                )}
                {product.topRightBadge && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-sm font-medium ${product.topRightClass ?? 'bg-tertiary-container text-on-tertiary-container'}`}
                  >
                    <Icon name="local_fire_department" filled className="text-[14px]" />
                    {product.topRightBadge}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-margin flex flex-col gap-space-md pt-4">
            <button
              type="button"
              onClick={onOpenBusiness}
              className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface hover:bg-secondary-fixed transition-colors"
            >
              <Icon name="storefront" className="text-primary text-[16px]" />
              <span className="font-label-md text-label-md font-medium text-text-primary">{MERCHANT_NAME}</span>
              <span className="text-text-tertiary">•</span>
              <span className="font-label-sm text-label-sm text-text-secondary">Apo, Abuja (0.8 km)</span>
              <Icon name="chevron_right" className="text-text-tertiary text-[16px]" />
            </button>

            <div className="flex flex-col gap-1">
              <h1 className="font-heading-lg text-heading-lg text-text-primary leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1 text-tertiary-container">
                  <Icon name="star" filled className="text-[18px]" />
                  <span className="font-label-md text-label-md font-semibold text-text-primary">{product.rating}</span>
                </div>
                <span className="text-text-tertiary">•</span>
                <span className="font-label-sm text-label-sm text-text-secondary">{product.reviews} reviews</span>
                <span className="text-text-tertiary">•</span>
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-badge-discount-text font-medium">
                  <Icon name="thumb_up" className="text-[15px]" />
                  96% recommend
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight">
                {naira(product.price)}
              </span>
              {product.was && (
                <span className="font-heading-sm text-heading-sm text-text-tertiary line-through">
                  {naira(product.was)}
                </span>
              )}
              {savings > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold">
                  Save {naira(savings)}
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low text-text-secondary self-start flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-label-sm text-label-sm font-medium text-text-primary">Available Now</span>
              <span className="text-text-tertiary">•</span>
              <span className="font-label-sm text-label-sm text-text-secondary flex items-center gap-1">
                <Icon name="schedule" className="text-[15px]" />
                Freshly Prepared (~20-25 mins)
              </span>
            </div>

            <div className="rounded-2xl bg-surface-tint-blue p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <Icon name="verified" className="text-[18px]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-md text-label-md font-semibold text-text-primary">VEMTAP Deal Applied</span>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Have a VEMTAP Deal Voucher? Your 15% discount will be verified and deducted instantly at checkout.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Description</h2>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{product.desc}</p>
            </div>

            {(product.dietary || product.warnings) && (
              <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Icon name="info" className="text-primary text-[20px]" />
                  <h3 className="font-label-md text-label-md font-semibold text-text-primary">Dietary &amp; Prep Notes</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 font-caption text-caption text-text-secondary">
                  {(product.dietary ?? []).map((item) => (
                    <div key={item} className="flex items-center gap-1.5">
                      <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                      <span>{item}</span>
                    </div>
                  ))}
                  {(product.warnings ?? []).map((item) => (
                    <div key={item} className="flex items-center gap-1.5 col-span-2">
                      <Icon name="warning" className="text-tertiary-container text-[16px]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groups.map((group) => {
              const selected = selections[group.key];
              return (
                <div key={group.key} className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">{group.title}</h2>
                    {group.required ? (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold uppercase">
                        Required
                      </span>
                    ) : (
                      <span className="font-caption text-caption text-text-secondary">{group.meta}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2" role="radiogroup" aria-label={group.title}>
                    {group.choices.map((choice) => {
                      const active = Array.isArray(selected)
                        ? selected.includes(choice.id)
                        : selected === choice.id;
                      return (
                        <label
                          key={choice.id}
                          onClick={() =>
                            group.type === 'multi' ? toggleMulti(group, choice.id) : toggleSingle(group, choice.id)
                          }
                          className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors shadow-sm ${
                            active ? 'bg-surface-tint-blue' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {group.type === 'multi' ? (
                              <span
                                className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                                  active ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-primary'
                                }`}
                              >
                                <Icon name="check" className={`text-[16px] ${active ? '' : 'hidden'}`} />
                              </span>
                            ) : (
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                  active ? 'bg-primary-container' : 'bg-surface-container-high'
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    active ? 'bg-surface-container-lowest' : 'bg-transparent'
                                  }`}
                                />
                              </span>
                            )}
                            <div className="min-w-0">
                              <span className="font-label-md text-label-md font-semibold text-text-primary block">
                                {choice.label}
                              </span>
                              {choice.hint && (
                                <span className="font-caption text-caption text-text-secondary">{choice.hint}</span>
                              )}
                            </div>
                          </div>
                          {choice.price ? (
                            <span className="font-label-md text-label-md font-semibold text-primary shrink-0">
                              +{naira(choice.price)}
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Special Instructions</h2>
                <span className="font-caption text-caption text-text-secondary">Optional</span>
              </div>
              <div className="w-full rounded-2xl bg-surface-container-lowest p-3 shadow-sm">
                <textarea
                  className="w-full bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none resize-none"
                  placeholder="Any allergies or dining preferences (e.g. sauce on the side)..."
                  rows={3}
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest shadow-sm mt-1">
              <span className="font-label-md text-label-md font-semibold text-text-primary">Quantity</span>
              <div className="flex items-center gap-4 bg-surface-container-low rounded-full px-2 py-1">
                <button
                  aria-label="Decrease quantity"
                  type="button"
                  onClick={() => setQty((value) => Math.max(1, value - 1))}
                  className="w-8 h-8 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-text-secondary active:scale-90 transition-transform"
                >
                  <Icon name="remove" className="text-[18px]" />
                </button>
                <span className="font-heading-sm text-heading-sm text-text-primary w-4 text-center">{qty}</span>
                <button
                  aria-label="Increase quantity"
                  type="button"
                  onClick={() => setQty((value) => value + 1)}
                  className="w-8 h-8 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary active:scale-90 transition-transform"
                >
                  <Icon name="add" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
          <div className="max-w-[430px] mx-auto px-margin py-3 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex flex-col text-left"
            >
              <span className="font-caption text-caption text-text-secondary">Total Price</span>
              <span className="font-heading-md text-heading-md text-text-primary font-bold">{naira(total)}</span>
            </button>
            <button
              type="button"
              onClick={addToOrder}
              className={`flex-1 h-14 rounded-2xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-on-primary shadow-lg shadow-primary-container/25 ${
                addedFlash ? 'bg-badge-discount-text' : 'bg-primary-container hover:bg-primary'
              }`}
            >
              <Icon name={addedFlash ? 'check' : 'shopping_bag'} className="text-[20px]" />
              <span className="font-button-primary text-button-primary">
                {addedFlash ? 'Added to Order ✓' : `Add to Order • ${naira(total)}`}
              </span>
            </button>
          </div>
        </div>
      </main>

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={onCheckout} title="Your Order" />
      {inCart > 0 && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
          <span className="pointer-events-auto bg-inverse-surface/95 text-inverse-on-surface font-label-sm text-label-sm px-3 py-1.5 rounded-full shadow-lg">
            {inCart} in cart
          </span>
        </div>
      )}
    </AppScreen>
  );
}
