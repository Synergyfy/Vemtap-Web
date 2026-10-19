import { useEffect, useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';
import { URBAN_PRODUCTS, naira } from './catalogueData';

export interface BusinessProfileScreenProps {
  venue: 'urban' | 'spa';
  business?: { name?: string; slug?: string } | null;
  onBack: () => void;
  onOpenDeals: () => void;
  onOpenProducts?: () => void;
  onOpenServices?: () => void;
  onOpenService?: (id: string) => void;
  onClaim: (onClaimed?: () => void) => void;
}

const URBAN_COVER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWYLDoeoS4d0v4LPKrtl49-ymNApIgvX2HiWkERU5OZ2-plb7nXD--oYfs9z8fwMMEDGDmPBRgIFu4IcZ7k3wYl1XXJYH_DFXoJu2ZPXmJbwlb3ze8ldBrROsfyUNKrRcgru-IQ-v8nZtcqOLgftzKV9WzPCzmyG8ccfNk3Zf-uor5_u3KQ6wiWp5ehbkb7LniRSPgAuYk9FS0On70jxUltXDWEpXwWzgrHKRmvZ1o1GBtwHftcY179A';
const URBAN_COVER_ALT =
  'Modern upscale bistro interior with warm ambient tungsten lighting, stylish dark wood tables, contemporary minimalist brass accents, gourmet plating, and lively happy diners in background in Abuja.';
const URBAN_LOGO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDJs_qL998-1MIJzfmDupZMbN4EggQKjAgAkMwMusMjHyhxpeBTC4igDkcicztNcCMmWWvMcZkQJMxsDk07ErUsAuE4pZE2lS7BkxUPyGLuBHzwTxZgHZ0xP7BbCfkZpNaIwplYcOSAyuBjyE06fbPxcg0cMoiTiYe3jBcJ7yCS_ycp_0_YofThtbs9iEx0L6Aq4C0PSheUu-3ihJGmnQhBxsT6PAgaCQQekbYDW5F3bm27DRLIeZ9V2A';
const URBAN_LOGO_ALT =
  'Geometric minimalist bistro monogram logo with flame and fork crest in brand royal blue and deep charcoal on pure white ground.';
const URBAN_MAP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBHLTwG2tKfnFHUArhpTK2qpv96aGl3VSVt2C7q9jeFcLnBM6fVDcZk6UJyzw_TFySvCQxAQQaym87dVi30BoWD2TRSYf6HY2rvKQPZ07KBWHSGrkPx4j6-rSL7d0FrRL_13nq_LO-o700fXn5hVHAU66mxbAcUfKASQEqBNFSMw60WNh37JyCvlbxMXyzEWVQ6uXohuIxp9YX24YgI-GO4l9Eegd3U0OiQacw2pWRhgNS8klDPLEMqnQ';
const SPA_COVER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDLDdKe5mKvQPhabygR_5AN4ktbqUHNAvf13lWEr_e8muGEGWWtCg59l8tMJ4_nl6z7mczhw-UuP4rWYr3Kx00ai-hHAP68sxQ7bYo4f6FhHh4o0pj0dt8_iII5HIk49aKWstPcAbFNWeFOr0FZkT_usOCOaS6DhSHdPf-2BYi-6YXZ4ijQlNZPfKh4iCvM4Z-Uhl9xf5nVYkFbr5E5d-5rZb3l9JuLCSQGOrvoQu-YZKxxDueaThT8Tw';
const SPA_COVER_ALT =
  'Luxurious, tranquil spa and high-end salon interior with warm ambient recessed lighting, minimalist beige travertine stone walls, manicured bamboo accents, plush cream leather styling chairs, sleek bronze brass hardware, and a soothing serene aesthetic.';
const SPA_LOGO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCVmHE_G4hXSQuw2DUq1zwh8QpXYnrNJI9fhvxJ6a_soe2LbzyUevbeP-5kN4Xvukfnhfbq5js6uf5xtANMkOCWDqy9lBo0_rq5uP13m3PBRK5ASS6rQotahBUownhG-dhj5iXNdgzp2pKWuIWhJtSXl4lwmHChQB0CtHhVwZoC_GlOCCm0riYOtkltPXkVLNt-6uJa5g27NUQii19e7IKtq7UDwz_ALUhXkheuUokmNJxm24pRsB5Q4Q';
const SPA_LOGO_ALT =
  'Minimalist elegant gold and white monogram emblem logo for Glow and Serenity luxury salon and wellness clinic on pristine backdrop.';
const SPA_MAP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6XQNzq87g57O4a_PsvJ4pGw9BJLpUzInFmOY-fS5ILhv_Xp1HyfXk7PjQdHT0gH4klO-vzG6y00uugG8dJAwyILi67QtuRxz5Ac3GNMKAnMGh_Ygc2x3Z1nMF9tcCgJ42190s3VK9YeO0Po8X91LZJmK6lGVvjSUdNhz4JCU10xwEDvejqUJmKzWNC4AazPBT6Y552uVJHpB9IP5P2sW2_ccjLKkeRfaqDZ75wyVy4hIJ65TPlMI_bA';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80';

const getOfferImage = (offer: Record<string, unknown>): string => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const image = offer.image ?? offer.coverImage ?? offer.heroImage ?? offer.mediaUrl ?? item?.image ?? item?.mainImage ?? item?.coverImage ?? FALLBACK_IMAGE;
  return typeof image === 'string' && image.trim() ? image : FALLBACK_IMAGE;
};

const getOfferBusinessName = (offer: Record<string, unknown>): string => {
  const business = offer.business && typeof offer.business === 'object' ? (offer.business as Record<string, unknown>) : {};
  const value = offer.businessName ?? offer.merchantName ?? offer.vendorName ?? offer.branchName ?? business.name ?? business.businessName ?? business.merchantName ?? 'Selected business';
  return typeof value === 'string' && value.trim() ? value : 'Selected business';
};

const getOfferTitle = (offer: Record<string, unknown>): string => {
  const value = offer.title ?? offer.name ?? offer.itemName ?? offer.offerTitle ?? 'Local offer';
  return typeof value === 'string' && value.trim() ? value : 'Local offer';
};

const getOfferDescription = (offer: Record<string, unknown>): string => {
  const value = offer.description ?? offer.summary ?? offer.copy ?? 'Fresh local offer from nearby vendors.';
  return typeof value === 'string' && value.trim() ? value : 'Fresh local offer from nearby vendors.';
};

const getOfferPrice = (offer: Record<string, unknown>): number => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const values = [offer.calculatedPrice, offer.dealPrice, offer.price, offer.fixedPrice, offer.amount, offer.salePrice, item?.price, item?.dealPrice, item?.calculatedPrice];
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return 0;
};

const getOfferComparePrice = (offer: Record<string, unknown>): number => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const values = [offer.compareAtPrice, offer.originalPrice, offer.listPrice, offer.wasPrice, offer.previousPrice, item?.compareAtPrice, item?.originalPrice, item?.listPrice];
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return getOfferPrice(offer);
};

const formatCurrency = (value: number | string | undefined): string => {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(parsed);
};

const toLiveDeal = (offer: Record<string, unknown>) => {
  const title = getOfferTitle(offer);
  const price = getOfferPrice(offer);
  const oldPrice = getOfferComparePrice(offer);
  return {
    badge: oldPrice > price ? `${Math.max(Math.round(((oldPrice - price) / oldPrice) * 100), 1)}% OFF` : 'Live Deal',
    meta: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby',
    metaIcon: 'schedule',
    title,
    price: formatCurrency(price),
    was: oldPrice > price ? formatCurrency(oldPrice) : '',
    image: getOfferImage(offer),
  };
};

const toLiveProduct = (offer: Record<string, unknown>) => {
  const title = getOfferTitle(offer);
  const price = getOfferPrice(offer);
  return {
    name: title,
    price: formatCurrency(price),
    image: getOfferImage(offer),
    alt: `${title} by ${getOfferBusinessName(offer)}`,
  };
};

const URBAN_DEALS = [
  {
    badge: '20% OFF',
    meta: 'Ends in 4h',
    metaIcon: 'timer',
    title: 'Prime 3-Course Lunch Combo & Drinks',
    price: '₦9,600',
    was: '₦12,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCMi2CpDWZkP_LGFjq5CLw0QuBeioTefU3_HzhtgZGTvXqMhnR5Y9rNt0HH1i4nXsMICTqdL5ulO-LD4HQvxTTZXF3NWD0Wq4fWrBxbAOH-LnCkfxy4jINbxSFtIXNNKtrlf4lLFBQSgUF0fFEmRqBsfvpnHlwWOBv8XBZ_eoBEbIVRjkJPkQACBeL1DXFhuZ7IoMHVVzOmfUQdhFYvNwgKZYq1-_MIkpD9_VcUkv-Qgdyq78QvlLD0FA',
  },
  {
    badge: '15% OFF',
    meta: 'Valid on Weekdays',
    metaIcon: 'calendar_today',
    title: "Chef's Signature Dinner Platter for 2",
    price: '₦18,500',
    was: '₦21,800',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCK_Zasd3tU1LibEdoOmRkShhGkUdxaj1LyOHPImE9RxYJx7j8kCqQSsuERLETrt_VTim3zGSiFojl5EHTR8pg3DV1B0tNkDTkgDppYAlyiWpzGWFKd1KWlZ4ZuhS2zbSTRHHyTpFQVsdVa58jJMdK2AZGNKT-c8Un5N7UoPCG6SWn5qBUZXyVEyhlb0b1QWg4okDK2G5Q7CQGcaFvdAmm-5iCxRERXavJu8giLpArhM3IuGdEim6Xb4w',
  },
];

const URBAN_PRODUCTS_PREVIEW = [
  {
    name: 'Smoked Wagyu Burger',
    price: '₦6,500',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDDu3QZND81YntFQxLKOj6XRXkVr6vEgClycjaCdhbfXVx9LG-QnxBGuvUUtfktwO6s3L3o0MQGBwpnLJPVoiwIqwmbRADX9OcT96Dsdz9f_LVZsO9WSN-HdI17m8bNktnahTAn2c_j72XoBmVjVUH8NKUzk9Bn5taEfgcQU4iQ-MlBn1SSi5V99cVInftrwyhpiFdhjAfsWuo0zPmbCuVd2tSoBrgr0od8uDqvLed0pMp-DMpjxZ0nhg',
    alt: 'Artisanal stacked wagyu burger with melted smoked cheddar cheese, brioche bun, and crisp caramelized onions.',
  },
  {
    name: 'Woodfire Grilled Ribeye',
    price: '₦14,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAc2XoQ1ABnLn6XbBREchs8BPPxCvWmbtW84topebTV3_OIIspUdWEac3gin7qYDM39PlZKlMAWbqqaBhNtNEPmz6NYkwNQlJK86DArivWqcBm8hjYtBwSNOwwwjTBkyR1tQ6rtw0juVzFxhCPl00JXtM8092WhpDCvwtYKyXg8oP560WPJXmvJiFakxzKQoSj_c_LrKLftb0pOJfAhidsDEmwedCQzVVtNSsi7nxNeqjx0JxoQbg3Bsw',
    alt: 'Prime cut woodfire grilled ribeye garnished with butter herb baste on rustic wooden culinary serving board.',
  },
  {
    name: 'Spicy Suya Jollof Rice',
    price: '₦4,800',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAR4P06faNDSRCQEV3hmRjQOThI7j4MPh1MNvUKhoIJ9vf2bH3CrkDF1xaGUQmEZ4ha_nLxdkiO7IY2HZSuVanGiwMFuYls_4RzSujLPWLOgM_mjtD66mz5BmcWl3MASjyseafC-yZcbqlM3QduVgIojUQUSucDHAMKKYhVrgD6WbbHGQ6Ep6LG-ZxV05XfX3S98F4ejvpdtqi3a1SUiOuUCFkW40ncyt4RidElMZbKQ1gxVv-7pOVcEg',
    alt: 'Vibrant Nigerian smoky party jollof rice topped with tender spicy beef suya chunks and fresh parsley garnish.',
  },
  {
    name: 'Crispy Buttermilk Chicken',
    price: '₦5,200',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDTaZ70v7IMkkNBmSXKKsv06kUp0B1MoF5XMjkYg_YOZoVinS0R0e0AoiYXRkVMxRHOR5hBQBljFh7csaCtEeiS2X_JWtJZwUMwhnhkT6Q3SEsRHyyJAo3VBeg6dBKNK-sXv9QxnrfBuAtRKQBXXTjweGpN9_MrWJuqi6xzTDdeKHy0862uld3oqgbhh0U5g_uFzlppMjFIB3idfAY_FioW-pxYr4KjzD0eKZ1PntR65EZuW1AeLfq-ZA',
    alt: 'Golden extra-crunchy buttermilk fried chicken breast sandwich inside a warm seeded bun, topped with creamy purple cabbage coleslaw and honey sriracha glaze.',
  },
  ...['hickory-bbq-brisket', 'suya-lamb-chops', 'truffle-parmesan-wedges', 'chapman-royale'].map((id) => {
    const product = URBAN_PRODUCTS.find((item) => item.id === id);
    return {
      name: product?.name ?? '',
      price: product ? naira(product.price) : '',
      image: product?.image ?? '',
      alt: product?.imageAlt ?? '',
    };
  }),
];

const URBAN_REVIEWS = [
  {
    name: 'Amina Bello',
    when: 'Yesterday',
    text: 'Amazing food and super fast redemption via VEMTAP. The steak was cooked to perfection!',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSDTzLfvsuHYo5PTijOlCEd_bs9i7ln9FQlQoktf-VNDHmCW-5o5WRmsnntU0RN3doC--APIojdm3nRsh5xfEryN8OP2bjGNczpoP9V4Dj2prZK6CsR48HwFyaSj85lSxQ1Db8F8dIoIuPpbKiRaX4brrqPGD8Jhc7E5PpT4X7F95xo56SvHj-TkW9d38wVyq-I5gij4jqI_5QDxk-we6AvefcnYZ3yR6mPpa3aqMOzl30-Na8bsjmUA',
    alt: 'Portrait photo of a young professional African woman smiling warmly with natural lighting and blurred soft background.',
  },
  {
    name: 'Chidi Okafor',
    when: '3 days ago',
    text: 'Great ambiance for lunch meetings. Friendly staff and good parking right in Apo.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAB1W8HdLPLStpfYkl5RghKBhfa5nvTQUUiUPaO_a860WEwEGHifOfNEob0P_RC3iW_kTo5bPfi3si4v64tlvMv8lrbR4A1QDyfVxHgBSzGLbiYm99qMiAszQEmNGQS5vxOx36XHeq-itW7UlxIB0VwcGzWEpP5ICYvdXg6xlY4fdbM9b0I5DK8L1j-VLLVqsCFpMou3TjttlHljWfjWi4mg5Wjh5GqmGBa0-iqA8Z_PuqrVZaegIVFtg',
    alt: 'Portrait headshot of an African businessman wearing casual polo shirt, soft outdoor restaurant light.',
  },
];

const SPA_DEALS = [
  {
    badge: '25% OFF',
    meta: 'Ends in 2 days',
    metaIcon: 'schedule',
    title: 'Weekend Glow Facial & Swedish Massage',
    desc: 'Complimentary organic herbal tea & skin consultation included.',
    price: '₦18,500',
    was: '₦25,000',
  },
  {
    badge: '20% OFF',
    meta: 'Valid Tue - Thu',
    metaIcon: 'calendar_today',
    title: 'Executive Hair Styling, Beard Trim & Scalp Detox',
    desc: 'Hot towel steam treatment and tea-tree conditioning wash.',
    price: '₦12,000',
    was: '₦15,000',
  },
];

const SPA_SERVICES = [
  {
    name: 'Signature Executive Cut & Wash',
    id: 1,
    sub: 'Precision razor finish',
    duration: '45 mins',
    price: '₦8,500',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDMYnlB1B8tkl4m9wo3XwQRfacqwnp0IfIf4aYt85kHms4qzwGpUFXkOg0oV2_dJyrBPy1xA6rgrGAJoZEhwbV3cGKkCU6NLzveQdhdQMYcO6Fu_roRhk3cwbrJiq-f1MMKlRDqP63xHiLQV5-fHK-dXGzQKu6lK4eoHT1dmSjKJ4V72beperMoPWzsL5Yy_FGFgbx183-1nOu_8g13d3qLDTDGgdmB5ZciIA5Ib8EP55u8qMk1c9uHjg',
    alt: 'Barber precisely styling man hair with professional shears in contemporary warm salon setting with sharp focus.',
  },
  {
    name: 'Deep Hydration Radiance Facial',
    id: 4,
    sub: 'Hyaluronic glow therapy',
    duration: '60 mins',
    price: '₦16,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALHXtynCfv9kGeBxuvJKGpLlX9SnkxYRwver_NqBJAiffsDf5gBwfnkG0gMeUjNKuHl1L2LlT1RF-QUx5EhyF2IyGx3HsEsa6UqksO06wmUS1O0zOv2zXDkIGpe3POPaY85qKKumvMMuTd67ip5s43qYpNAuO-axuiu2sMkRBCQNUP7MBkZlcNmPVdyJqEkYyXlZ2v7bYX1JO4ye-HapTEcf8NHGkUJIXoSSvLvfFn3wOVsHpJTNOXoQ',
    alt: 'Cosmetic aesthetician applying soothing facial radiance serum on smiling client in luxury tranquil treatment spa room.',
  },
  {
    name: 'Aromatherapy Full Body Massage',
    id: 6,
    sub: 'Botanical stress relief',
    duration: '75 mins',
    price: '₦22,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlQANs_DfiCGvApbJ2i2qH2G3fn9FbAF9cDzchyLa5XTKbmkI0PlJGrCbaLYvg55wNGxCAKHPa8TJSnY1tWksp5y2i3RXoun3AiH13vvoGTb4EV_CZc9UgEV_q7jpRethrWuvlX0qrBMPlRLVkKf3wvSGPmbcblIqdlKx5yVuS6H2Vy-DzeRCRgSD3PZleuKQp7fDgFvjjDm9F5-VhD1t8Seo9QJFzlEVPtx6RO_NyfYk2sbxNiRuKrw',
    alt: 'Relaxing aromatherapy Swedish full body massage therapy with scented candles and lavender oils in dimly lit luxury wellness suite.',
  },
  {
    name: 'Deluxe Pedicure & Foot Scrub',
    id: 9,
    sub: 'Eucalyptus exfoliation',
    duration: '50 mins',
    price: '₦7,500',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsMxh_z4K-NT1Q6yN9T-vnfZcCcj1yA1-V-ivur3ZmJD9IQfp25Six-syTREYM4J1oTB7_kAaaNC3-X-kZ2iyVTm7WqgclCJsCbxjuXlfzKHiR2-aGUUATKrut0NBQHI6XqXq577_xzVqyrf6H-UDneIdjBmpuQbFrpqllmTotwk2ieZWby6HZdkpqzRd4TjXgF3oTl8U38_COahWkhh_v5cve3En53o7nmpNZxjzDXSAvOh04QTY4OQ',
    alt: 'Pedicure spa treatment bowl with botanical rose flower petals, sea salt foot scrub and warm aromatic bath.',
  },
  {
    name: 'Deluxe Gel Manicure & Hand Therapy',
    id: 8,
    sub: 'Bio-gel & citrus polish',
    duration: '45 mins',
    price: '₦9,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbxTQL4ACcdKJ1yPdkp2MArNDDnx9J5_BChsovCofPXJI2u-qWPg3Pj7v8G3OQ4CksNlv5zNiFEhgQGw-91zDF2orErbR_QotE0l6hw92fILjWFiQVUNYGr203JNfB3RGuxZE3ltzi1RQLZtMmVV-HEXNyXOaGxSMht-jJsnU4CH8W6hJvAlEqrBQ-tYSNla88XqCvaQlj9xWLJczkOODgzZZqDW8x5RAaS5Io67yS',
    alt: 'Deluxe gel manicure and hand therapy station with organic sugar scrubs, rosewater soak bowl, and glossy nude gel nail polish application in luxury Abuja spa.',
  },
  {
    name: 'Infrared Cedar Sauna & Detox',
    id: 10,
    sub: 'Himalayan salt therapy',
    duration: '45 mins',
    price: '₦12,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmn5-fRvZ_TZBJ6Y7VYmyOb1Y44rF57qbcXg-i43zikX1Vq9n5G0dzHTQAtti5mC5wxjCFSnq-S7Ifl1uMbqyjnHHjmUqgL1P8Gmd5ISqhIVZrtCGefOl_zeXvbql9yC_m8GuozYFNM-FnmtRS-oYQ8KEs-j4s7qRU2D7C5cxk4dVq-ZWpcpOwi8TqtkOPPJZPGCmFz--MOypFvsNK9S-_vLLqVILtxBv3WdGQlYLR',
    alt: 'Infrared cedar sauna cabin interior with glowing pink Himalayan salt brick wall, steam mist diffusion, and smooth polished wood backrests.',
  },
  {
    name: 'Scalp Rejuvenation & Hair Spa',
    id: 11,
    sub: 'Shea & argan follicle care',
    duration: '50 mins',
    price: '₦14,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDG6p6G0Snml4t0VCF3HH7ncXozCaV28XBPukgi8J_2CqnItyafLbfq8Rd6rPmH6P06I0xmhVpQLBbitbTCCzZEoPRMb-gg4uFabUsKpidcJb2_EguIEmoyuCqreuWm1YvUA5nWxLvRGjuFGUtAXUVHja1sSF-sKUMBJDt39TXeKWMvbm7IwEHYddvL985TaO7WE61EQ31oetDX2K_U0pco1MyD1e-uOuIGv5t4QCT9',
    alt: 'Organic hair treatment spa ritual showing rich shea and argan butter mask application, warm mist hair steamer hood, and soothing scalp massage in boutique salon.',
  },
  {
    name: 'Weekend Glow Facial & Sauna Combo',
    id: 12,
    sub: 'Signature 20% VEMTAP deal',
    duration: '75 mins',
    price: '₦18,500',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAd50OjE2br6Jf3uTsKJOdlZhSbVvSSbMRM-zSeGqSwmpLKQmB4Fu_2fPWjvcpcmrCjVt62QDjeoSptqmT5j3WCVQUNiGJ8z5Jwrna9mmCYLxtEE_Xx9qspVIabEgxvVyWURaljPNpNOytKsrNgE9EM64TigtYYPQ42tiefSv6WWwjlmeTaeeOFfXYUWelj_ma16Ekec-RWref9qG0ZA9d0w8fyJfEJT5N3WWa3C2a6',
    alt: 'Serene spa setting showcasing holistic glow ritual setup, herbal tea glasses, face serum ampoules, and cedar sauna towel suite in Abuja.',
  },
];

const SPA_REVIEWS = [
  {
    initials: 'HD',
    initialsClass: 'bg-primary-fixed text-on-primary-fixed',
    name: 'Halima Danjuma',
    when: 'Visited 3 days ago',
    text: 'The scalp detox and blowout were heavenly. Redeemed the 25% VEMTAP deal smoothly at reception!',
  },
  {
    initials: 'EN',
    initialsClass: 'bg-secondary-container text-on-secondary-container',
    name: 'Emeka Nwosu',
    when: 'Visited 1 week ago',
    text: 'Top-tier barbers and aesthetic therapists. Best salon in Maitama by far.',
  },
];

function UrbanProfile({
  offers,
  businessName,
  onOpenDeals,
  onOpenProducts,
  onClaim,
}: Pick<BusinessProfileScreenProps, 'onOpenDeals' | 'onOpenProducts' | 'onClaim'> & { offers: Record<string, unknown>[]; businessName: string }) {
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [claimed, setClaimed] = useState<Record<number, boolean>>({});

  const liveDeals = useMemo(() => {
    if (offers.length > 0) return offers.slice(0, 3).map(toLiveDeal);
    return URBAN_DEALS;
  }, [offers]);

  const liveProducts = useMemo(() => {
    if (offers.length > 0) return offers.slice(0, 4).map(toLiveProduct);
    return URBAN_PRODUCTS_PREVIEW;
  }, [offers]);

  const profileName = offers.length > 0 ? getOfferBusinessName(offers[0]) : businessName;
  const profileSummary = offers.length > 0 ? getOfferDescription(offers[0]) : `${businessName} is a premier culinary destination in Apo, offering artisanal flame-grilled steaks, hand-crafted burgers, and fine wines. Fresh local ingredients with modern recipes.`;

  return (
    <main className="relative w-full pt-14 pb-safe bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-28">
        <div className="relative w-full h-[210px] bg-surface-container-high overflow-hidden">
          <img alt={URBAN_COVER_ALT} className="w-full h-full object-cover" src={URBAN_COVER_IMG} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-3 right-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 text-on-primary font-caption text-caption">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span>Verified Partner</span>
          </div>
        </div>
        <div className="px-margin -mt-7 relative z-10">
          <div className="bg-surface-canvas rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="relative -mt-10">
                <div className="w-16 h-16 rounded-2xl bg-surface-canvas p-1 shadow-md overflow-hidden">
                  <img alt={URBAN_LOGO_ALT} className="w-full h-full rounded-xl object-cover" src={URBAN_LOGO_IMG} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow">
                  <Icon name="check" filled className="text-[15px]" />
                </div>
              </div>
              <button
                className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 active:scale-95 transition-all ${
                  following ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-tint-blue text-primary'
                }`}
                type="button"
                onClick={() => setFollowing((current) => !current)}
              >
                <Icon name={following ? 'check' : 'add'} className="text-[16px]" />
                <span>{following ? 'Following' : 'Follow'}</span>
              </button>
            </div>
            <div>
              <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{profileName}</h2>
              <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                Restaurant • Gourmet Dining • ₦₦₦
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="flex items-center gap-1 bg-surface-subtle px-2.5 py-1 rounded-lg">
                <Icon name="star" filled className="text-[16px] text-tertiary-container" />
                <span className="font-label-md text-label-md text-text-primary font-semibold">4.8</span>
                <span className="font-caption text-caption text-text-secondary">(142)</span>
              </span>
              <span className="flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text px-2.5 py-1 rounded-lg font-label-sm text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span>Open now • Closes 10:00 PM</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary font-label-sm text-label-sm pt-0.5">
              <Icon name="distance" className="text-[18px] text-primary" />
              <span>Apo Boulevard, Abuja • 0.8 km away</span>
            </div>
          </div>
        </div>
        <div className="px-margin mt-4 grid grid-cols-12 gap-3">
          <button
            className="col-span-7 h-[52px] rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
            type="button"
            onClick={onOpenDeals}
          >
            <Icon name="local_offer" className="text-[20px]" />
            <span>View Deals ({liveDeals.length})</span>
          </button>
          <button
            className="col-span-5 h-[52px] rounded-2xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
            type="button"
          >
            <Icon name="near_me" className="text-[20px]" />
            <span>Directions</span>
          </button>
        </div>
        <div className="px-margin mt-6">
          <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">About</h3>
            <p
              className={`font-body-md text-body-md text-text-secondary mt-1.5 leading-relaxed ${
                expanded ? '' : 'line-clamp-2'
              }`}
            >
              {profileSummary}
            </p>
            <button
              className="font-label-md text-label-md text-primary font-medium mt-1 inline-flex items-center gap-0.5"
              type="button"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? 'Show less' : 'Read more'}
              <Icon name={expanded ? 'expand_less' : 'expand_more'} className="text-[16px]" />
            </button>
          </div>
        </div>
        <div className="mt-7">
          <div className="px-margin flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Active Deals</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption">{liveDeals.length}</span>
            </div>
            <button
              className="font-label-md text-label-md text-primary font-semibold"
              type="button"
              onClick={onOpenDeals}
            >
              See All ({liveDeals.length})
            </button>
          </div>
          <div className="px-margin flex flex-col gap-3">
            {liveDeals.map((deal, index) => (
              <div
                className="bg-surface-canvas rounded-2xl p-3.5 shadow-sm flex items-center gap-3.5 relative overflow-hidden"
                key={`${deal.title}-${index}`}
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container-high">
                  <img alt={deal.title} className="w-full h-full object-cover" src={deal.image} />
                  <span className="absolute top-1.5 left-1.5 bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption px-1.5 py-0.5 rounded font-semibold">
                    {deal.badge}
                  </span>
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-1 text-tertiary font-caption text-caption mb-0.5">
                      <Icon name={deal.metaIcon} className="text-[14px]" />
                      <span>{deal.meta}</span>
                    </div>
                    <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate">
                      {deal.title}
                    </h4>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      <div className="font-heading-sm text-heading-sm text-text-primary">{deal.price}</div>
                      {deal.was ? <div className="font-caption text-caption text-text-tertiary line-through -mt-0.5">{deal.was}</div> : null}
                    </div>
                    <button
                      className={`h-8 px-4 rounded-xl font-label-sm text-label-sm flex items-center justify-center active:scale-95 transition-transform shadow-sm ${
                        claimed[index]
                          ? 'bg-badge-discount-bg text-badge-discount-text'
                          : 'bg-primary-container text-on-primary'
                      }`}
                      type="button"
                      onClick={() => onClaim?.(() => setClaimed((current) => ({ ...current, [index]: true })))}
                    >
                      {claimed[index] ? 'Claimed' : 'Claim'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-7">
          <div className="px-margin flex items-center justify-between mb-3">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Products</h3>
            <button className="font-label-md text-label-md text-primary font-semibold" type="button" onClick={onOpenProducts}>
              See All
            </button>
          </div>
          <div className="grid grid-rows-2 grid-flow-col auto-cols-[10rem] gap-3 overflow-x-auto px-margin no-scrollbar pb-1">
            {liveProducts.map((product) => (
              <div className="w-40 shrink-0 bg-surface-canvas rounded-2xl p-2.5 shadow-sm flex flex-col" key={product.name}>
                <div className="w-full h-28 rounded-xl overflow-hidden bg-surface-container-high mb-2">
                  <img alt={product.alt} className="w-full h-full object-cover" src={product.image} />
                </div>
                <h4 className="font-label-md text-label-md text-text-primary font-medium truncate">{product.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-label-md text-label-md text-text-primary font-bold">{product.price}</span>
                  <button
                    aria-label={`Add ${product.name}`}
                    className="w-6 h-6 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center"
                    type="button"
                  >
                    <Icon name="add" className="text-[16px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-margin mt-7">
          <div className="grid grid-cols-4 gap-2">
            <span className="bg-surface-canvas rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                <Icon name="call" className="text-[20px]" />
              </div>
              <span className="font-caption text-caption text-text-secondary font-medium">Call</span>
            </span>
            <span className="relative bg-surface-canvas rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm">
              <span className="absolute -top-1 px-1.5 bg-primary text-on-primary font-caption text-[10px] rounded-full scale-90">
                Fast
              </span>
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                <Icon name="chat_bubble" className="text-[20px]" />
              </div>
              <span className="font-caption text-caption text-text-secondary font-medium">In-App</span>
            </span>
            <span className="bg-surface-canvas rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                <Icon name="sms" className="text-[20px]" />
              </div>
              <span className="font-caption text-caption text-text-secondary font-medium">WhatsApp</span>
            </span>
            <span className="bg-surface-canvas rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                <Icon name="language" className="text-[20px]" />
              </div>
              <span className="font-caption text-caption text-text-secondary font-medium">Website</span>
            </span>
          </div>
        </div>
        <div className="px-margin mt-6">
          <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="schedule" className="text-primary text-[20px]" />
                <h3 className="font-label-md text-label-md text-text-primary font-semibold">Opening Hours</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                Open Now
              </span>
            </div>
            <div className="flex flex-col gap-1.5 pt-1 font-label-sm text-label-sm text-text-secondary">
              <div className="flex justify-between items-center py-1">
                <span className="font-medium text-text-primary">Monday – Friday</span>
                <span>11:00 AM – 10:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-medium text-text-primary">Saturday – Sunday</span>
                <span>12:00 PM – 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-margin mt-6">
          <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <Icon name="place" className="text-primary text-[20px] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-label-md text-label-md text-text-primary font-semibold">Location</h3>
                <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                  Plot 104 Apo Boulevard, Legacy Tower Ground Floor, Abuja
                </p>
              </div>
            </div>
            <div className="w-full h-36 rounded-xl bg-surface-container-high relative overflow-hidden flex items-center justify-center">
              <img
                alt="Map preview of Plot 104 Apo Boulevard, Abuja"
                className="absolute inset-0 w-full h-full object-cover"
                src={URBAN_MAP_IMG}
              />
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg animate-bounce relative">
                <Icon name="pin_drop" className="text-[24px]" />
              </div>
            </div>
            <button
              className="w-full h-11 rounded-xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5"
              type="button"
            >
              <Icon name="turn_right" className="text-[18px]" />
              <span>Open in Navigation</span>
            </button>
          </div>
        </div>
        <div className="px-margin mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Reviews</h3>
              <span className="font-caption text-caption text-text-tertiary">★ 4.8 (142)</span>
            </div>
            <button className="font-label-md text-label-md text-primary font-semibold" type="button">
              See All (142)
            </button>
          </div>
          <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-text-primary tracking-tight">4.8</div>
              <div className="flex flex-col">
                <div className="flex text-tertiary-container">
                  <Icon name="star" filled className="text-[18px]" />
                  <Icon name="star" filled className="text-[18px]" />
                  <Icon name="star" filled className="text-[18px]" />
                  <Icon name="star" filled className="text-[18px]" />
                  <Icon name="star_half" filled className="text-[18px]" />
                </div>
                <span className="font-caption text-caption text-text-secondary">Based on 142 verified orders</span>
              </div>
            </div>
            <Icon name="verified" className="text-outline-variant text-[28px]" />
          </div>
          <div className="flex flex-col gap-3">
            {URBAN_REVIEWS.map((review) => (
              <div className="bg-surface-canvas rounded-2xl p-3.5 shadow-sm flex flex-col gap-2" key={review.name}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden">
                      <img alt={review.alt} className="w-full h-full object-cover" src={review.image} />
                    </div>
                    <div>
                      <h5 className="font-label-md text-label-md text-text-primary font-semibold">{review.name}</h5>
                      <p className="font-caption text-caption text-text-tertiary">{review.when} • Verified VEMTAP Customer</p>
                    </div>
                  </div>
                  <div className="flex text-tertiary-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon key={star} name="star" filled className="text-[14px]" />
                    ))}
                  </div>
                </div>
                <p className="font-body-md text-body-md text-text-secondary leading-normal">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 pb-safe bg-surface-canvas/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40 flex items-center justify-between gap-3">
        <div>
          <span className="font-caption text-caption text-text-secondary block">Special Offer</span>
          <span className="font-heading-sm text-heading-sm text-text-primary">Up to 20% OFF</span>
        </div>
        <button
          className="h-12 px-6 rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center gap-2 shadow-md active:scale-95 transition-transform"
          type="button"
          onClick={() => onClaim?.(() => {})}
        >
          <Icon name="local_activity" className="text-[20px]" />
          <span>Claim Deal</span>
        </button>
      </div>
    </main>
  );
}

function SpaProfile({
  offers,
  businessName,
  onOpenServices,
  onOpenService,
  onClaim,
}: Pick<BusinessProfileScreenProps, 'onOpenServices' | 'onOpenService' | 'onClaim'> & { offers: Record<string, unknown>[]; businessName: string }) {
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [claimed, setClaimed] = useState<Record<number, boolean>>({});

  const liveDeals = useMemo(() => {
    if (offers.length > 0) return offers.slice(0, 2).map(toLiveDeal);
    return SPA_DEALS;
  }, [offers]);

  const profileName = offers.length > 0 ? getOfferBusinessName(offers[0]) : businessName;
  const profileSummary = offers.length > 0 ? getOfferDescription(offers[0]) : `${businessName} is an upscale grooming, beauty salon and wellness clinic in Maitama Heights offering luxury hair styling, facial therapies, therapeutic massages, and aesthetic skin care.`;

  const scrollToDeals = () => {
    document.getElementById('spa-deals-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative w-full pt-14 pb-safe bg-surface-canvas min-h-screen">
      <div className="flex flex-col w-full pb-24">
        <div className="relative w-full h-64 bg-surface-container-high overflow-hidden">
          <img alt={SPA_COVER_ALT} className="w-full h-full object-cover" src={SPA_COVER_IMG} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute top-4 right-4 flex items-center gap-space-2xs">
            <span className="px-space-xs py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md font-caption text-caption text-text-primary flex items-center gap-1 shadow-sm">
              <Icon name="verified" filled className="text-[15px] text-badge-discount-text" />
              Verified Partner
            </span>
          </div>
        </div>
        <div className="px-margin pt-space-xs pb-space-md bg-surface-canvas relative">
          <div className="flex justify-between items-end -mt-12 mb-space-sm relative z-10">
            <div className="relative w-20 h-20 rounded-full p-1 bg-surface-canvas shadow-md">
              <img alt={SPA_LOGO_ALT} className="w-full h-full rounded-full object-cover" src={SPA_LOGO_IMG} />
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center shadow-sm">
                <Icon name="check" filled className="text-on-primary text-[14px]" />
              </div>
            </div>
            <button
              className={`h-10 px-space-md rounded-full active:scale-95 transition-all flex items-center gap-1.5 font-label-md text-label-md ${
                following
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-primary hover:bg-surface-container'
              }`}
              type="button"
              onClick={() => setFollowing((current) => !current)}
            >
              <Icon name={following ? 'check' : 'add'} className="text-[18px]" />
              <span>{following ? 'Following' : 'Follow'}</span>
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              {profileName}
            </h2>
            <p className="font-label-md text-label-md text-text-secondary">Luxury Salon • Spa & Aesthetics • ₦₦₦</p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs mt-space-xs">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
              <Icon name="star" filled className="text-amber-500 text-[16px]" />
              <span className="font-label-md text-label-md font-semibold text-amber-900">4.9</span>
              <span className="font-caption text-caption text-text-secondary">(96 reviews)</span>
            </div>
            <span className="text-outline-variant">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="font-label-sm text-label-sm font-medium text-text-primary">Open now</span>
              <span className="font-caption text-caption text-text-secondary">Closes 9:00 PM</span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 mt-space-xs text-text-secondary">
            <Icon name="location_on" className="text-[18px] text-primary shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary">
              14 Amazon Street, Maitama Heights, Abuja <span className="text-text-tertiary">•</span>{' '}
              <span className="text-primary font-medium">1.4 km away</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-space-xs mt-space-md">
            <button
              className="h-[50px] rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              type="button"
              onClick={scrollToDeals}
            >
              <Icon name="local_activity" filled className="text-[20px]" />
              <span>View Deals ({liveDeals.length})</span>
            </button>
            <button
              className="h-[50px] rounded-xl bg-surface-container-low hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 active:scale-95 transition-all"
              type="button"
            >
              <Icon name="near_me" className="text-[20px] text-primary" />
              <span>Directions</span>
            </button>
          </div>
        </div>
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="px-margin py-space-md">
          <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-xs">About</h3>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            {expanded
              ? `${profileSummary} Designed as a calm sanctuary away from the city buzz, our specialists provide personalized care using premium formulations.`
              : `${profileSummary.slice(0, 140)}...`}{' '}
            <button
              className="text-primary font-label-md text-label-md inline"
              type="button"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          </p>
        </div>
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="px-margin py-space-md" id="spa-deals-section">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <Icon name="loyalty" className="text-primary text-[22px]" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Active Deals</h3>
            </div>
            <span className="text-primary font-label-md text-label-md">See All (2)</span>
          </div>
          <div className="flex flex-col gap-space-sm">
            {liveDeals.map((deal, index) => (
              <div
                className="p-space-sm rounded-xl bg-surface-subtle shadow-sm flex flex-col gap-space-xs relative overflow-hidden"
                key={`${deal.title}-${index}`}
              >
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    {deal.badge}
                  </span>
                  <span className="font-caption text-caption text-tertiary flex items-center gap-1 font-medium">
                    <Icon name={deal.metaIcon} className="text-[14px]" />
                    {deal.meta}
                  </span>
                </div>
                <div>
                  <h4 className="font-heading-sm text-heading-sm text-text-primary">{deal.title}</h4>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">{deal.was ? `Save ${deal.was}` : 'Limited-time offer'}</p>
                </div>
                <div className="flex items-center justify-between mt-space-2xs pt-space-2xs">
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{deal.price}</span>
                    {deal.was ? <span className="font-caption text-caption text-text-tertiary line-through">{deal.was}</span> : null}
                  </div>
                  <button
                    className={`px-space-md py-2 rounded-lg font-label-md text-label-md shadow-sm transition-all ${
                      claimed[index]
                        ? 'bg-badge-discount-bg text-badge-discount-text cursor-default'
                        : 'bg-primary text-on-primary active:scale-95'
                    }`}
                    disabled={!!claimed[index]}
                    type="button"
                    onClick={() => onClaim?.(() => setClaimed((current) => ({ ...current, [index]: true })))}
                  >
                    {claimed[index] ? 'Claimed!' : 'Claim'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="py-space-md">
          <div className="px-margin flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <Icon name="spa" className="text-primary text-[22px]" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Services</h3>
            </div>
            <button
              className="text-primary font-label-md text-label-md hover:underline flex items-center gap-0.5"
              type="button"
              onClick={onOpenServices}
            >
              See All
              <Icon name="chevron_right" className="text-[16px]" />
            </button>
          </div>
          <div className="grid grid-rows-2 grid-flow-col auto-cols-[11rem] gap-space-sm overflow-x-auto px-margin pb-space-xs no-scrollbar">
            {SPA_SERVICES.map((service) => (
              <div
                className="w-44 shrink-0 rounded-xl bg-surface-subtle p-2 flex flex-col justify-between shadow-sm cursor-pointer"
                key={service.name}
                onClick={() => onOpenService?.(String(service.id))}
              >
                <div className="w-full h-28 rounded-lg bg-surface-container-high overflow-hidden relative">
                  <img alt={service.alt} className="w-full h-full object-cover" src={service.image} />
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded font-caption text-[11px] text-white">
                    {service.duration}
                  </span>
                </div>
                <div className="pt-2 flex flex-col gap-1">
                  <h4 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-1">
                    {service.name}
                  </h4>
                  <p className="font-caption text-caption text-text-secondary">{service.sub}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-label-md text-label-md font-bold text-text-primary">{service.price}</span>
                    <button
                      aria-label={`Book ${service.name}`}
                      className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenService?.(String(service.id));
                      }}
                    >
                      <Icon name="add" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="px-margin py-space-md">
          <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">Connect with Salon</h3>
          <div className="grid grid-cols-4 gap-space-xs">
            <span className="flex flex-col items-center justify-center p-space-xs rounded-xl bg-surface-subtle">
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary mb-1">
                <Icon name="call" className="text-[20px]" />
              </div>
              <span className="font-caption text-caption font-medium text-text-primary">Call</span>
            </span>
            <span className="relative flex flex-col items-center justify-center p-space-xs rounded-xl bg-surface-tint-blue">
              <span className="absolute top-1 right-1 px-1.5 bg-primary text-on-primary text-[9px] font-bold rounded-full">
                FAST
              </span>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary mb-1">
                <Icon name="chat" className="text-[20px]" />
              </div>
              <span className="font-caption text-caption font-medium text-primary">In-App</span>
            </span>
            <span className="flex flex-col items-center justify-center p-space-xs rounded-xl bg-surface-subtle">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                <Icon name="forum" className="text-[20px]" />
              </div>
              <span className="font-caption text-caption font-medium text-text-primary">WhatsApp</span>
            </span>
            <span className="flex flex-col items-center justify-center p-space-xs rounded-xl bg-surface-subtle">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary mb-1">
                <Icon name="public" className="text-[20px]" />
              </div>
              <span className="font-caption text-caption font-medium text-text-primary">Website</span>
            </span>
          </div>
        </div>
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="px-margin py-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Operating Hours</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
              Open Now
            </span>
          </div>
          <div className="p-space-sm rounded-xl bg-surface-subtle flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-text-secondary">Monday – Friday</span>
              <span className="font-label-md text-label-md font-semibold text-text-primary">9:00 AM – 9:00 PM</span>
            </div>
            <div className="h-[1px] w-full bg-border-subtle" />
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-text-secondary">Saturday – Sunday</span>
              <span className="font-label-md text-label-md font-semibold text-text-primary">10:00 AM – 8:00 PM</span>
            </div>
          </div>
        </div>
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="px-margin py-space-md">
          <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-xs">Location</h3>
          <p className="font-body-md text-body-md text-text-secondary mb-space-sm">
            Plot 14 Amazon Street, Maitama Heights, Abuja
          </p>
          <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-sm">
            <img
              alt="Map preview of Plot 14 Amazon Street, Maitama Heights, Abuja"
              className="absolute inset-0 w-full h-full object-cover"
              src={SPA_MAP_IMG}
            />
            <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="px-2 py-1 rounded bg-surface-canvas shadow-lg text-[11px] font-bold text-text-primary mb-1 whitespace-nowrap">
                Glow & Serenity Spa
              </div>
              <Icon name="location_on" filled className="text-primary text-[32px] drop-shadow" />
            </div>
          </div>
          <button
            className="w-full mt-space-sm h-12 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 active:scale-95 transition-all"
            type="button"
          >
            <Icon name="map" className="text-[20px]" />
            <span>Open in Navigation</span>
          </button>
        </div>
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="px-margin py-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Customer Reviews</h3>
              <p className="font-caption text-caption text-text-secondary">4.9 average from 96 verified guests</p>
            </div>
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon key={star} name="star" filled className="text-[18px]" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-space-sm">
            {SPA_REVIEWS.map((review) => (
              <div className="p-space-sm rounded-xl bg-surface-subtle shadow-sm flex flex-col gap-1.5" key={review.name}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${review.initialsClass}`}>
                      {review.initials}
                    </div>
                    <div>
                      <p className="font-label-md text-label-md font-semibold text-text-primary">{review.name}</p>
                      <p className="font-caption text-caption text-text-tertiary">{review.when}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon key={star} name="star" filled className="text-[15px]" />
                    ))}
                  </div>
                </div>
                <p className="font-body-md text-body-md text-text-secondary mt-1">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-lg border-t border-border-subtle px-margin py-3 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption font-semibold text-badge-discount-text tracking-wide">
                SPECIAL OFFER
              </span>
            </div>
            <p className="font-label-md text-label-md font-bold text-text-primary truncate">Up to 25% OFF Deals</p>
          </div>
          <button
            className="h-11 px-space-lg rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md active:scale-95 transition-transform flex items-center justify-center whitespace-nowrap"
            type="button"
            onClick={() => onClaim?.(() => {})}
          >
            Claim Deal
          </button>
        </div>
      </div>
    </main>
  );
}

export function BusinessProfileScreen({
  venue,
  business,
  onBack,
  onOpenDeals,
  onOpenProducts,
  onOpenServices,
  onOpenService,
  onClaim,
}: BusinessProfileScreenProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    let ignore = false;
    const loadOffers = async () => {
      if (!hasApiConfig()) {
        if (!ignore) setPublicOffers([]);
        return;
      }

      try {
        const response = await catalogueService.getPublicOffers({ page: 1, limit: 6 });
        const rows = Array.isArray(response?.data) ? response.data : [];
        if (!ignore) setPublicOffers(rows as Record<string, unknown>[]);
      } catch {
        if (!ignore) setPublicOffers([]);
      }
    };

    loadOffers();
    return () => { ignore = true; };
  }, []);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1800);
  };

  const businessName = business?.name?.trim() || (venue === 'spa' ? 'Selected spa business' : 'Selected business');

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-variant/40 transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate max-w-[160px]">
              Business Profile
            </h1>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Bookmark"
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-variant/40 transition-colors"
              type="button"
              onClick={() => setBookmarked((current) => !current)}
            >
              <Icon
                name={bookmarked ? 'bookmark' : 'bookmark_border'}
                filled={bookmarked}
                className="text-on-surface-variant text-[22px]"
              />
            </button>
            <button
              aria-label={linkCopied ? 'Link copied' : 'Share'}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-variant/40 transition-colors"
              type="button"
              onClick={handleShare}
            >
              <Icon name={linkCopied ? 'check' : 'share'} className="text-on-surface-variant text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
        {linkCopied && (
          <div className="px-margin pb-2">
            <div className="bg-inverse-surface/95 text-inverse-on-surface rounded-lg px-3 py-1.5 font-caption text-caption flex items-center gap-1.5 w-fit">
              <Icon name="check" className="text-[14px]" />
              <span>Link copied</span>
            </div>
          </div>
        )}
      </header>
      {venue === 'urban' ? (
        <UrbanProfile businessName={businessName} offers={publicOffers} onOpenDeals={onOpenDeals} onOpenProducts={onOpenProducts} onClaim={onClaim} />
      ) : (
        <SpaProfile businessName={businessName} offers={publicOffers} onOpenServices={onOpenServices} onOpenService={onOpenService} onClaim={onClaim} />
      )}
    </AppScreen>
  );
}
