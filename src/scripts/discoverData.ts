export const DISCOVER_CATEGORIES = [
  'All',
  'Food & Dining',
  'Beauty & Wellness',
  'Fashion & Apparel',
  'Electronics',
  'Fitness & Health',
  'Supermarkets',
  'Services',
];

export interface BusinessCard {
  name: string;
  kind: string;
  badge: string;
  badgeIcon: string;
  rating: string;
  reviews: string;
  distance: string;
  deals: string;
  image: string;
  alt: string;
  venue?: 'urban' | 'spa';
  slug?: string;
  id?: string;
}

const getOfferImage = (offer: Record<string, unknown>) => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const value = item?.mainImage ?? item?.image ?? offer.image ?? offer.coverImage ?? offer.heroImage ?? 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80';
  return typeof value === 'string' && value.trim() ? value : 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80';
};

const getOfferBusinessName = (offer: Record<string, unknown>) => {
  const business = offer.business && typeof offer.business === 'object' ? (offer.business as Record<string, unknown>) : {};
  const value = offer.businessName ?? offer.merchantName ?? offer.vendorName ?? business.name ?? 'Local business';
  return typeof value === 'string' && value.trim() ? value : 'Local business';
};

const getOfferTitle = (offer: Record<string, unknown>) => {
  const value = offer.title ?? offer.name ?? offer.offerTitle ?? 'Exclusive offer';
  return typeof value === 'string' && value.trim() ? value : 'Exclusive offer';
};

const getOfferPrice = (offer: Record<string, unknown>) => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const values = [offer.calculatedPrice, offer.dealPrice, offer.price, offer.fixedPrice, offer.originalPrice, item?.price, item?.dealPrice, item?.calculatedPrice];
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return 0;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(value || 0);

export const buildDiscoverCardsFromOffers = (offers: Record<string, unknown>[]): BusinessCard[] =>
  offers.slice(0, 4).map((offer, index) => {
    const businessName = getOfferBusinessName(offer);
    const title = getOfferTitle(offer);
    const price = getOfferPrice(offer);
    const business = offer.business && typeof offer.business === 'object' ? (offer.business as Record<string, unknown>) : {};
    const city = typeof business.city === 'string' && business.city.trim() ? business.city : 'Abuja';
    const categoryName = typeof offer.categoryName === 'string' && offer.categoryName.trim()
      ? offer.categoryName
      : typeof business.categoryName === 'string' && business.categoryName.trim()
        ? business.categoryName
        : 'Local business';
    const normalizedName = businessName.toLowerCase();
    const venue = normalizedName.includes('spa') || normalizedName.includes('serenity') || normalizedName.includes('glow')
      ? 'spa'
      : normalizedName.includes('grill') || normalizedName.includes('bistro') || normalizedName.includes('restaurant')
        ? 'urban'
        : undefined;
    const slugValue = typeof business.slug === 'string' && business.slug.trim()
      ? business.slug.trim()
      : typeof offer.slug === 'string' && offer.slug.trim()
        ? offer.slug.trim()
        : businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `business-${index + 1}`;
    const idValue = typeof business.id === 'string' && business.id.trim()
      ? business.id.trim()
      : typeof offer.id === 'string' && offer.id.trim()
        ? offer.id.trim()
        : String(index + 1);

    return {
      name: businessName,
      kind: categoryName,
      badge: index === 0 ? 'Verified Partner' : 'Featured Partner',
      badgeIcon: 'verified',
      rating: index === 0 ? '4.8' : index === 1 ? '4.9' : '4.7',
      reviews: index === 0 ? '(142 reviews)' : index === 1 ? '(96 reviews)' : '(118 reviews)',
      distance: `${(index + 1) * 0.8} km away • ${city}`,
      deals: price > 0 ? `Active Deal • ${formatCurrency(price)}` : 'Live local deal',
      image: getOfferImage(offer),
      alt: `${title} from ${businessName}`,
      venue,
      slug: slugValue,
      id: idValue,
    };
  });

export const BUSINESS_CARDS: BusinessCard[] = [
  {
    name: 'Local Grill House',
    kind: 'Restaurant & Dining',
    badge: 'Verified Partner',
    badgeIcon: 'verified',
    rating: '4.8',
    reviews: '(142 reviews)',
    distance: '0.8 km away • Your area',
    deals: '3 Active Deals (Save up to ₦2,400)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzyZN6TCyT9Y7SXehS0lBf6jPgb7r1FOxCfjStuBDzCIjbc5FTJ4PWgv0Smq0juGeyxCQ_arOnHXmm1rP5VR6kPv1xh2S5p8goKg_hhQIXk2QTJH9JM8ETDEvCIaj_aw9pNgwCRS-ErYvWQRlnGmj2brPLLGchrUJWaNRU75OdnHIkr7C5JOmq5yYYqwn1tFBLn8fs8Eio7PZ2vX6OD26P5a9Waow-JeBh3MvBJQzMX4YOSQJXnYXPHQ',
    alt: 'Vibrant modern restaurant interior in a local dining destination with warm ambient lighting and quality grilled dishes.',
    venue: 'urban',
    slug: 'local-grill-house',
    id: '104',
  },
  {
    name: 'City Glow Studio',
    kind: 'Spa & Wellness',
    badge: 'Featured Partner',
    badgeIcon: 'verified',
    rating: '4.9',
    reviews: '(96 reviews)',
    distance: '1.4 km away • Nearby',
    deals: '2 Active Deals (Save up to ₦6,500)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD12KhKwa_t67ebHn03hDHeo3R_i4Yb9kW5hTx3TV6pPBPnZ6CSph1CTJSnAAkCkEywtN1QQYXCp4-bKYCG5eICRwkchdABl2RUE9D4Y7W6jOTduudJl2BZlHJO6q1btnZKbiKDLklZgIUpp3G99Jd9wFaBnPsHOeQcTCC7640bnnE8Rd8FYYeeNFs0YuKEQJFYYkT86WGsjnSIeh4qOD-tED-5E16KydNEcJv-5Hu--Y8IfZuoSbY_tg',
    alt: 'Luxury modern wellness studio with calming design and spa treatment ambience.',
    venue: 'spa',
    slug: 'city-glow-studio',
    id: '219',
  },
  {
    name: 'Style Collective',
    kind: 'Fashion & Footwear',
    badge: 'VEMTAP Exclusive',
    badgeIcon: 'check_circle',
    rating: '4.7',
    reviews: '(118 reviews)',
    distance: '1.2 km away • Nearby',
    deals: '1 Active Deal (Save up to ₦12,000)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADvM0qDZ-vAe-BHbjqtqO44dHzEtVILVk1JKpxEYkQC5ROQSEEyquW_U3cG6UhlfsBndz50c8E0WxVl6YOkdPBgsYjGHZchTQGYmKt_RJ80uS00R6YVAI22lXkrT6KkMs8terj9EmjPr6d58DC5ifsmVVclO5w14F0r_uPjZdy4o6oVDxD1tPbMd_VR6Wa29-Qjvf_KJMhaIoAtitEEEOcyiXqQUcLzYdTQQDWyFLQog84C5cd07aL5Q',
    alt: 'Fashion boutique showroom with curated styles and premium footwear on display.',
  },
  {
    name: 'Neighborhood Cafe',
    kind: 'Cafe & Bakery',
    badge: 'Verified Partner',
    badgeIcon: 'verified',
    rating: '4.8',
    reviews: '(83 reviews)',
    distance: '2.1 km away • Nearby',
    deals: '2 Active Deals (BOGO Free Coffee)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAKALWLmugB8h16Cj6547bTcbIywv9-7xo0SJoXd31xQkILkSfhfLw2-w2sUhPfZUbt3TQI4zhBXUbPM9jimmsMM0VEvWQXsUbpNGsIFKayrfEEJquYDQYMbBGdwTMsrrjKj05uVrJzHf_xMmAPSw5kzleQIlkhrZCJmlRKG3vwq8DQF3nHHTh4USSqa_i-de0RpihN_-HXiCZoKeeRshLhOXN7sYW7POMhPDcAz2ucfDrlkMu9foGgOg',
    alt: 'Specialty coffee bar with an artisan bakery setup and warm café ambience.',
  },
];
