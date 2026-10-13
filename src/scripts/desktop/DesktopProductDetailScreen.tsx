import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopProductDetailScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

const MAIN_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8Cf24-uuGvxZ0M87B9IIoe-WQf8kZ8VCxyuh2-qkjeR8WqFERANri4x-LKj5J-jbXz-D8BHVrQABu233BCSswBaYMRrfJGzLjv9h8gVIXA-IEtZsDTNWJ3NZQ6DzIk09AYZhpiQyYah5WWhkQ0Ppw9oyG_ZIho1YLaD6WvMzf5ghzdrpsA6E_tvp0Ud5iX1z0fDkLQXA31ihAzLz3evnTw6B8VCvC9lFYqpggq2n0';

const MAIN_ALT =
  'Gourmet prime aged ribeye steak seared over fiery open hardwood coals with crisp charred edges, garlic herb butter slowly melting over the top, Maldon smoked sea salt flakes, and fresh rosemary sprigs on a warm rustic ceramic plate inside a stylish dimly-lit restaurant ambient lighting.';

const THUMBS = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpFJu1Mr8vm8G864RYUGfQ-eG4ySoyAAQb7eJmM5ilFIXDGO_L9n2NTKjby2ksho6Hu7XgvhrI54vPpduDymytkg5WVt4-TgcwQcBadaEsGeUYykEDTuCqtNSFjaaswfvEARxVwXKTN74H_SYMxC9WZrtyVJdNeaibIj6oDDQwYcI1PpHYf-5Vbh-S_EqVmHf5GIe1fRXR7YgpVCykXvKA-4xpzqfWNxAZi9WPGR4j',
    alt: 'Close-up cross section of medium-rare tender prime Angus ribeye steak displaying rich juicy pink center and glistening rosemary melted jus on dark slate.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYcKoNGWuX5vEIEQKrQiS_Y8iwvoEfTsl0iHlwkabltmsXRnuMgJcU557pDcIj8csK3yNwtIeUOMM3KZTtYW-wtLOQebNAQLQMbjEFTAhQ7O9UYPou_zC80SVMX6TbAD1yvaPNOEPNtZESWm15YwfQCuPS5LFxIPmxFaEI-OiaFeEeGtygjq7OwQOHmmNh1SIEJSyjr3umzxmhxrCpK_YFLU1-c_mDks4yxqggPL2j',
    alt: 'Freshly fried truffle parmesan hand cut potato wedges garnished with finely grated pecorino cheese and chopped flat leaf parsley in a sleek wire serving basket.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbmBLZ7xOqIqEoSBev2WLQKW80bRpADXrXL42K1sCajtSI7gAwhUQEnhHnIRJ2ED0smcN52PRf8jf1is9niV_ekCwxhdKegVFnIxC13AGxvQKpkroBYECmftpRN1cmybntT5UhALHUQd7jC7rmAUjGpkIIYyMPJdiBtczwGmjvzgGnNTp6uptgGDc6-WbgJL4LwR1Yy6Ho8h3thda0Rc2P--5B4Qst2S3BBbXDaazb',
    alt: 'Side dipping bowls of green peppercorn jus, vibrant herbaceous green chimichurri, and glossy truffle demi-glace arranged on restaurant counter.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU1_pMW3rCrtkL3IyBixBD8bgA8QFLiADZrIY4P4NW-pOUAuwzPdZHEYHxbO-1sa1b9WADwHGZD1EKCxPN7OWNGDC-6xqgSOqDCqkRuZ9qI2lYsApZrh0HpgLpW3CyNz16zYI5DkKk2Ui-GlJnW1K0kG-i4TRci_5FCk1XzZyI4e5nsHGWp-q2HB_HxjLdneARyy7A6IvJmm6eL8WZbZ8Sz5e4yIJ8mEYwPc9ti-KW',
    alt: 'Artisanal open woodfire hearth kitchen with chef searing steak cuts over roaring glowing embers in Abuja upscale restaurant.',
  },
];

const DONENESS = [
  { value: 'Medium Rare', description: 'Warm red center, maximum tenderness', rec: true },
  { value: 'Medium', description: 'Warm pink throughout, balanced juices', rec: false },
  { value: 'Medium Well', description: 'Slight hint of pink, firm texture', rec: false },
  { value: 'Well Done', description: 'Fully cooked throughout, dark char', rec: false },
];

const SAUCES = [
  { value: 'Green Peppercorn Jus', description: 'Brandy flamed, rich cream reduction.' },
  { value: 'Chimichurri', description: 'Fresh parsley, garlic, vinegar & cold press oil.' },
  { value: 'Truffle Mushroom Demi-Glace', label: 'Truffle Mushroom Demi', description: 'Earthy wild forest mushrooms & black truffle oil.' },
];

const SIDES = [
  { label: 'Truffle Parmesan Hand-Cut Fries', description: 'Tossed in aged parmesan & Italian white truffle essence', price: '+₦3,200' },
  { label: 'Charred Garlic Asparagus', description: 'Flame-blistered jumbo spears with shaved lemon zest', price: '+₦2,500' },
  { label: 'Velvety Garlic Herb Mash', description: 'Whipped Yukon golds with confit garlic & fresh thyme', price: '+₦1,800' },
];

const ORDER_ITEMS = [
  { name: 'Woodfire Aged Ribeye Steak', meta: 'Medium Rare • Green Peppercorn Jus', price: '₦16,000' },
  { name: 'Truffle Parmesan Hand-Cut Fries', meta: 'Crisp potato cut • Herb dust', price: '₦3,200' },
  { name: 'House Craft Peach Iced Tea', meta: 'Cold Brew • Mint leaf garnish', price: '₦2,200' },
];

const FULFILLMENT = [
  { key: 'dine-in', icon: 'table_bar', label: 'Dine-In Table' },
  { key: 'pickup', icon: 'storefront', label: 'Self Pickup' },
  { key: 'delivery', icon: 'moped', label: 'Direct Delivery' },
] as const;

const RECOMMENDATIONS = [
  {
    title: 'Hibiscus Citrus Craft Soda',
    description: 'Steeped organic hibiscus flower with lime.',
    price: '₦2,500',
    badge: { label: 'Craft Beverage', className: 'bg-surface-canvas/90 backdrop-blur-md text-on-surface' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC7OCo1cS6X3bLrgtZv2Q_prgTkEuO6q0fESUvVCJVu2B2R2l9WOgSykZlDhEEwtI7rps5za1vp6TUJi95rM-t9lAvkfqXj7FL2K6JPUS7ibIHBEFRZeQY_GwQv75QX_xH5bGcpcFTBve2XTJxqYlYUMmXS24AwLhTd-qCsYvbnHLPHhZiaGMxpKIJ-y1GOUN-kPNdXIJte8BbUmEfPeWxOxyNpggZNveiQ3eoeEhd8',
    alt: 'Chilled tumbler glass of craft hibiscus zobo iced punch with citrus lemon slices and mint leaves on wooden counter.',
  },
  {
    title: 'Glazed Suya Beef Skewers',
    description: 'Spiced Yaji pepper crust, red onion ribbons.',
    price: '₦5,500',
    oldPrice: '₦6,500',
    badge: { label: '-15% Deal', className: 'bg-badge-discount-bg text-badge-discount-text' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDD0wWMYsn0NqIvmiXh04LwT64evuO4GDnIuIcibrC8gs6-btzJKKGrnmUDzwvOSJRQuB-v3QymjYBATnqSRSJwnsZ4Qcuq5PTeajk2yTjPL4rGBFvIM3vOweSRXoVUg6OEsxQkz6eNyaudG4lW9h2Ud3CiwMIbiy4gVXWb6t0uV6rpZAJjJiF_cJiEynhjgaeglPBTsUqyApBT9-HPJTccV3A2nGHgTpLXlIzZVEfx',
    alt: 'Crispy grilled pork belly skewer cubes drizzled with spicy honey soy glaze on charcoal grill grate.',
  },
  {
    title: 'Molten Cocoa Lava Cake',
    description: '70% Callebaut dark chocolate & vanilla gelato.',
    price: '₦4,200',
    badge: { label: 'Dessert', className: 'bg-surface-canvas/90 backdrop-blur-md text-on-surface' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAoCa4YX95zAS29CsfJODjZjjDaDBnKsUCZzuNhnchEEqhVhuf8lG3olknxRNttwMhmZRTJz4AQZ9ZwWPXZCGsZrPzEs2Y2Y88pyYN4tWWT2XnXWw-TqxLgoMTAPXVLl4DP6trV0Jn_Cv9M06nBj-TlN137Legu7YX5fRgZ4-kSO6o1DaplXcFAIbw4yVZ_BzUJZ5gLYM5KYUmQEmPSzc37EGSsWE1O9_X6EUyiMsNy',
    alt: 'Warm chocolate lava cake slice leaking melted dark fudge with vanilla bean gelato scoop on fine dining black plate.',
  },
  {
    title: 'Classic Charred Caesar',
    description: 'Crisp romaine, anchovy oil emulsion.',
    price: '₦3,800',
    badge: { label: 'Fresh Side', className: 'bg-surface-canvas/90 backdrop-blur-md text-on-surface' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBAAzHLqxCTp1NO7L6GVVeNExIu82deWqNB1spQ8LsblagNGc5xJkdw-SIruLj3gACHjJBsUt-9e5hyvXpAkOFgzHVvjUKFtVUSil02_mopdzDJtc7E-oZ4pGkNieOK4h59iT9wB5ER9fKTjFMXAOr_oIRUC-k6UmMng-bDRRmQcF45_9wQkl2wXlfMOm-8EGIJkfvd5pz9YnOQUsEg8le16BrByrAp-ZVpJXReTG51',
    alt: 'Crispy romaine salad with homemade creamy caesar dressing, shaved parmesan shards, and garlic butter brioche croutons.',
  },
];

export function DesktopProductDetailScreen({ onNav, onBack }: DesktopProductDetailScreenProps) {
  const [mainImage, setMainImage] = useState({ src: MAIN_IMAGE, alt: MAIN_ALT });
  const [selectedThumb, setSelectedThumb] = useState<number | null>(null);
  const [doneness, setDoneness] = useState('Medium Rare');
  const [sauce, setSauce] = useState('Green Peppercorn Jus');
  const [sides, setSides] = useState<string[]>(['Truffle Parmesan Hand-Cut Fries']);
  const [fulfillment, setFulfillment] = useState<(typeof FULFILLMENT)[number]['key']>('dine-in');
  const [items, setItems] = useState(ORDER_ITEMS);

  const toggleSide = (label: string) =>
    setSides((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );

  const selectThumb = (index: number) => {
    setSelectedThumb(index);
    setMainImage({ src: THUMBS[index].src, alt: THUMBS[index].alt });
  };

  const removeItem = (name: string) => setItems((current) => current.filter((item) => item.name !== name));

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="businesses">
      <div className="w-full bg-surface">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 mb-6">
            <button
              type="button"
              onClick={onBack}
              className="font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors"
            >
              Businesses
            </button>
            <Icon name="chevron_right" className="text-[15px] text-text-tertiary" />
            <button
              type="button"
              onClick={onBack}
              className="font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors"
            >
              Urban Grill &amp; Bistro
            </button>
            <Icon name="chevron_right" className="text-[15px] text-text-tertiary" />
            <button type="button" className="font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors">
              Grills &amp; Steaks
            </button>
            <Icon name="chevron_right" className="text-[15px] text-text-tertiary" />
            <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate max-w-xs sm:max-w-none">
              Woodfire Aged Ribeye Steak
            </span>
          </nav>

          <div className="mb-8 rounded-2xl bg-surface-canvas p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary shrink-0 shadow-inner">
                <Icon name="restaurant" filled className="text-[28px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading-sm text-heading-sm text-on-surface font-semibold tracking-tight">
                    Urban Grill &amp; Bistro
                  </span>
                  <Icon name="verified" filled className="text-primary text-[18px]" />
                  <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    Kitchen Live
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary flex items-center gap-2 mt-0.5">
                  <span className="flex items-center text-tertiary-container">
                    <Icon name="star" filled className="text-[14px]" /> 4.9 (420+ reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Icon name="location_on" className="text-[14px]" /> 14 Danube St, Maitama • 1.8km away
                  </span>
                  <span>•</span>
                  <span className="text-badge-discount-text font-medium">Est. 20-30 mins prep</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <button
                type="button"
                className="px-3.5 py-2 rounded-xl bg-surface-subtle hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
              >
                <Icon name="call" className="text-[18px]" />
                <span>Merchant Dial</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-2 rounded-xl bg-surface-tint-blue text-primary hover:bg-surface-container font-label-sm text-label-sm flex items-center gap-1.5 transition-colors font-semibold"
              >
                <Icon name="storefront" className="text-[18px]" />
                <span>View Full Bistro Menu</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-7 flex flex-col gap-8 min-w-0">
              <div className="flex flex-col gap-3">
                <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden bg-surface-container shadow-md group">
                  <img
                    alt={mainImage.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={mainImage.src}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold shadow-md flex items-center gap-1">
                      <Icon name="local_fire_department" className="text-[14px]" /> Best Seller
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shadow-md flex items-center gap-1">
                      <Icon name="eco" className="text-[14px]" /> Locally Sourced
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-on-primary font-caption text-caption">
                    <span className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                      Dry Aged 28 Days • Hardwood Charred
                    </span>
                    <span className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Icon name="photo_camera" className="text-[14px]" /> 4 Photos
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {THUMBS.map((thumb, index) => (
                    <button
                      key={thumb.src}
                      type="button"
                      onClick={() => selectThumb(index)}
                      aria-label={thumb.alt}
                      className={`relative h-20 sm:h-24 rounded-2xl overflow-hidden cursor-pointer shadow-sm transition-opacity ${
                        selectedThumb === index
                          ? 'ring-2 ring-primary opacity-100'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img alt={thumb.alt} className="w-full h-full object-cover" src={thumb.src} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-surface-canvas shadow-sm flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h1 className="font-heading-lg text-heading-lg text-on-surface tracking-tight font-bold">
                    Woodfire Aged Ribeye Steak (250g Prime Angus)
                  </h1>
                  <div className="flex flex-wrap items-baseline gap-3 mt-1">
                    <span className="font-display-hero text-display-hero text-primary font-bold tracking-tight">
                      ₦16,000
                    </span>
                    <span className="font-label-md text-label-md text-text-secondary">
                      Tax &amp; VAT included • Settled directly in-store or upon delivery
                    </span>
                  </div>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Succulent 28-day dry-aged prime Angus cut grilled with precision over locally harvested Nigerian
                  hardwood embers. Basted generously with house-churned compound rosemary herb butter and finished with
                  flaky smoked sea salt. Served hot off the coals.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    { icon: 'skillet', label: 'Method', value: 'Hardwood Coals' },
                    { icon: 'scale', label: 'Cut Weight', value: '250 Grams Cut' },
                    { icon: 'hourglass_top', label: 'Dry Aging', value: '28 Days Cured' },
                    { icon: 'verified', label: 'Quality Tier', value: 'Black Angus' },
                  ].map((marker) => (
                    <div
                      key={marker.label}
                      className="p-3 rounded-2xl bg-surface-subtle flex flex-col items-center text-center gap-1"
                    >
                      <Icon name={marker.icon} className="text-primary text-[22px]" />
                      <span className="font-caption text-caption text-text-secondary">{marker.label}</span>
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">{marker.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-surface-canvas shadow-sm flex flex-col gap-8">
                <div>
                  <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                    Kitchen Preferences
                  </span>
                  <h2 className="font-heading-md text-heading-md text-on-surface font-semibold mt-0.5">
                    Customize Your Cut
                  </h2>
                </div>

                <fieldset className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <legend className="font-label-md text-label-md font-semibold text-text-primary">Meat Doneness</legend>
                    <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary">
                      Required • Pick 1
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DONENESS.map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer p-4 rounded-2xl flex items-start justify-between transition-all shadow-sm ${
                          doneness === option.value
                            ? 'bg-surface-tint-blue text-primary hover:bg-surface-container'
                            : 'bg-surface-subtle text-text-primary hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            checked={doneness === option.value}
                            className="mt-1 accent-primary w-4 h-4"
                            name="doneness"
                            onChange={() => setDoneness(option.value)}
                            type="radio"
                            value={option.value}
                          />
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md font-semibold text-text-primary">
                              {option.value}
                            </span>
                            <span className="font-caption text-caption text-text-secondary">{option.description}</span>
                          </div>
                        </div>
                        {option.rec && (
                          <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                            Chef Rec
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <legend className="font-label-md text-label-md font-semibold text-text-primary">
                      Complimentary Artisanal Sauce
                    </legend>
                    <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text">
                      Included (Free)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SAUCES.map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer p-4 rounded-2xl flex flex-col justify-between gap-3 transition-all ${
                          sauce === option.value ? 'bg-surface-tint-blue shadow-sm' : 'bg-surface-subtle hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md font-semibold text-text-primary">
                            {option.label ?? option.value}
                          </span>
                          <input
                            checked={sauce === option.value}
                            className="accent-primary w-4 h-4"
                            name="sauce"
                            onChange={() => setSauce(option.value)}
                            type="radio"
                            value={option.value}
                          />
                        </div>
                        <p className="font-caption text-caption text-text-secondary">{option.description}</p>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      Add-on Bistro Sides
                    </span>
                    <span className="font-caption text-caption text-text-secondary">Optional sides</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {SIDES.map((side) => (
                      <label
                        key={side.label}
                        className="p-3.5 rounded-2xl bg-surface-subtle hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            checked={sides.includes(side.label)}
                            className="accent-primary w-4 h-4 rounded"
                            onChange={() => toggleSide(side.label)}
                            type="checkbox"
                          />
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md font-semibold text-text-primary">
                              {side.label}
                            </span>
                            <span className="font-caption text-caption text-text-secondary">{side.description}</span>
                          </div>
                        </div>
                        <span className="font-label-md text-label-md font-bold text-primary">{side.price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="font-label-md text-label-md font-semibold text-text-primary flex items-center gap-1.5"
                    htmlFor="kitchen-instructions"
                  >
                    <Icon name="notes" className="text-[18px] text-text-secondary" />
                    <span>Dietary Requests &amp; Kitchen Instructions</span>
                  </label>
                  <textarea
                    className="w-full p-4 rounded-2xl bg-surface-subtle text-on-surface font-body-md text-body-md focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-text-tertiary"
                    id="kitchen-instructions"
                    placeholder="e.g. Please put steak sauce in a separate container, extra salt flakes on the side..."
                    rows={3}
                  />
                  <span className="font-caption text-caption text-text-tertiary">
                    Urban Grill &amp; Bistro will confirm special requests when order is received.
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-surface-tint-blue flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary text-on-primary shrink-0 shadow-sm">
                  <Icon name="verified_user" className="text-[24px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-label-md text-label-md font-bold text-on-surface">
                    VEMTAP Direct-to-Merchant Guarantee
                  </h3>
                  <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                    Every dish ordered through VEMTAP links directly with the chef's kitchen POS. No intermediaries, no
                    hidden service markups, and guaranteed fresh plating according to standard kitchen order.
                  </p>
                </div>
              </div>
            </section>

            <aside className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
              <div className="p-6 sm:p-7 rounded-3xl bg-surface-canvas shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">
                      Quick Order Desk
                    </span>
                    <h2 className="font-heading-md text-heading-md text-on-surface font-bold">
                      Urban Grill &amp; Bistro
                    </h2>
                  </div>
                  <span className="w-10 h-10 rounded-2xl bg-surface-subtle flex items-center justify-center text-text-secondary">
                    <Icon name="shopping_bag" className="text-[20px]" />
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
                    Fulfillment Method
                  </span>
                  <div className="grid grid-cols-3 p-1 rounded-2xl bg-surface-subtle gap-1">
                    {FULFILLMENT.map((method) => (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setFulfillment(method.key)}
                        className={`py-2 px-1 text-center font-label-sm text-label-sm font-semibold rounded-xl transition-all flex flex-col items-center gap-0.5 ${
                          fulfillment === method.key
                            ? 'bg-surface-canvas text-primary shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Icon name={method.icon} className="text-[18px]" />
                        <span>{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon name="chair" className="text-primary text-[20px]" />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                        Table #07 (Patio Section)
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Urban Bistro Maitama • Arrive by 7:30 PM
                      </span>
                    </div>
                  </div>
                  <button type="button" className="font-caption text-caption text-primary font-semibold hover:underline">
                    Change
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
                    Order Items ({items.length})
                  </span>
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-surface-subtle"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm font-bold flex items-center justify-center shrink-0">
                            1x
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                              {item.name}
                            </span>
                            <span className="font-caption text-caption text-text-secondary">{item.meta}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-label-md text-label-md font-bold text-text-primary">{item.price}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => removeItem(item.name)}
                            className="text-text-tertiary hover:text-error transition-colors mt-0.5"
                          >
                            <Icon name="delete" className="text-[16px]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="loyalty" className="text-[20px]" />
                    <span className="font-label-sm text-label-sm font-semibold">VEMTAP Prime Member Perk</span>
                  </div>
                  <span className="font-label-md text-label-md font-bold">-₦2,400</span>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between font-body-md text-body-md text-text-secondary">
                    <span>Items Total (3 Items)</span>
                    <span>₦21,400</span>
                  </div>
                  <div className="flex items-center justify-between font-body-md text-body-md text-badge-discount-text font-medium">
                    <span>Exclusive Member Discount</span>
                    <span>-₦2,400</span>
                  </div>
                  <div className="flex items-center justify-between font-body-md text-body-md text-text-secondary">
                    <div className="flex items-center gap-1">
                      <span>VEMTAP Platform Fee</span>
                      <Icon name="info" className="text-[14px] text-text-tertiary cursor-pointer" />
                    </div>
                    <span className="text-badge-discount-text font-semibold">FREE (₦0.00)</span>
                  </div>
                  <div className="flex items-center justify-between font-body-md text-body-md text-text-secondary">
                    <span>VAT / State Consumption Tax</span>
                    <span className="font-caption text-caption text-text-tertiary">Included in price</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-1">
                    <div className="flex flex-col">
                      <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                        Payable to Merchant
                      </span>
                      <span className="font-heading-lg text-heading-lg font-bold text-on-surface">Subtotal Due</span>
                    </div>
                    <span className="font-display-hero text-display-hero font-bold text-primary">₦19,000</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-subtle flex items-start gap-3 text-text-secondary font-caption text-caption">
                  <Icon name="credit_card_heart" className="text-primary text-[20px] shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero prepayment required on app.</strong> Settle the final ₦19,000 directly with Urban Grill
                    &amp; Bistro upon delivery or table service via POS Card, Cash, or Instant Bank Transfer.
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    className="w-full h-14 rounded-2xl bg-primary-container text-on-primary-container hover:bg-primary font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[0.99] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Submit Order to Merchant (₦19,000)</span>
                    <Icon name="arrow_forward" className="text-[20px]" />
                  </button>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      className="py-3 px-3 rounded-xl bg-surface-subtle hover:bg-surface-container font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Icon name="chat" className="text-[18px] text-primary" />
                      <span>Chat with Kitchen</span>
                    </button>
                    <button
                      type="button"
                      onClick={onBack}
                      className="py-3 px-3 rounded-xl bg-surface-subtle hover:bg-surface-container font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Icon name="add" className="text-[18px]" />
                      <span>Add More Items</span>
                    </button>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="font-caption text-caption text-text-secondary">
                    Own a restaurant or grill spot?{' '}
                    <button type="button" className="text-primary font-semibold hover:underline">
                      Set up your business on VEMTAP →
                    </button>
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-canvas shadow-sm flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                    <Icon name="timer" className="text-[22px]" />
                  </div>
                  <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-badge-discount-text ring-2 ring-surface-canvas" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Woodfire Hearth Active • Low Wait Time
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Orders accepted immediately. Kitchen closes at 11:30 PM.
                  </span>
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-16 pt-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                  Frequently Ordered Together
                </span>
                <h2 className="font-heading-lg text-heading-lg text-on-surface font-bold mt-1">
                  Complete Your Feast at Urban Bistro
                </h2>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>Explore Entire Grill Menu</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RECOMMENDATIONS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl bg-surface-canvas p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 group"
                >
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-container">
                    <img
                      alt={item.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={item.image}
                    />
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full font-caption text-caption font-semibold ${item.badge.className}`}
                    >
                      {item.badge.label}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-label-md text-label-md font-semibold text-text-primary">{item.title}</h3>
                    <p className="font-caption text-caption text-text-secondary line-clamp-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-label-md text-label-md font-bold text-primary">{item.price}</span>
                        {item.oldPrice && (
                          <span className="font-caption text-caption line-through text-text-tertiary">
                            {item.oldPrice}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label={`Add ${item.title} to order`}
                        className="p-2 rounded-xl bg-surface-tint-blue text-primary hover:bg-primary hover:text-on-primary transition-colors"
                      >
                        <Icon name="add" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DesktopPage>
  );
}
