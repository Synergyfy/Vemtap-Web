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
}

export const BUSINESS_CARDS: BusinessCard[] = [
  {
    name: 'Urban Grill & Bistro',
    kind: 'Restaurant & Gourmet Dining',
    badge: 'Verified Partner',
    badgeIcon: 'verified',
    rating: '4.8',
    reviews: '(142 reviews)',
    distance: '0.8 km away • Apo Boulevard, Abuja',
    deals: '3 Active Deals (Save up to ₦2,400)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzyZN6TCyT9Y7SXehS0lBf6jPgb7r1FOxCfjStuBDzCIjbc5FTJ4PWgv0Smq0juGeyxCQ_arOnHXmm1rP5VR6kPv1xh2S5p8goKg_hhQIXk2QTJH9JM8ETDEvCIaj_aw9pNgwCRS-ErYvWQRlnGmj2brPLLGchrUJWaNRU75OdnHIkr7C5JOmq5yYYqwn1tFBLn8fs8Eio7PZ2vX6OD26P5a9Waow-JeBh3MvBJQzMX4YOSQJXnYXPHQ',
    alt: 'Vibrant modern restaurant interior of Urban Grill & Bistro in Abuja with warm ambient lighting, open grill kitchen, sleek wood tables, contemporary pendant lights and gourmet grilled steak plates being arranged by chefs in high-end casual atmosphere.',
  },
  {
    name: 'Glow & Serenity Spa',
    kind: 'Spa & Wellness Clinic',
    badge: 'Featured Partner',
    badgeIcon: 'verified',
    rating: '4.9',
    reviews: '(96 reviews)',
    distance: '1.4 km away • Maitama Heights',
    deals: '2 Active Deals (Save up to ₦6,500)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD12KhKwa_t67ebHn03hDHeo3R_i4Yb9kW5hTx3TV6pPBPnZ6CSph1CTJSnAAkCkEywtN1QQYXCp4-bKYCG5eICRwkchdABl2RUE9D4Y7W6jOTduudJl2BZlHJO6q1btnZKbiKDLklZgIUpp3G99Jd9wFaBnPsHOeQcTCC7640bnnE8Rd8FYYeeNFs0YuKEQJFYYkT86WGsjnSIeh4qOD-tED-5E16KydNEcJv-5Hu--Y8IfZuoSbY_tg',
    alt: 'Luxury modern day spa aesthetic with minimal eucalyptus leaf arrangements, bamboo elements, soft white towels, tranquil warm candle lighting, smooth river stones, and clean minimalist interior design promoting wellness and deep relaxation.',
  },
  {
    name: 'Sole District Boutique',
    kind: 'Fashion & Footwear',
    badge: 'VEMTAP Exclusive',
    badgeIcon: 'check_circle',
    rating: '4.7',
    reviews: '(118 reviews)',
    distance: '1.2 km away • Area 11 Arcade',
    deals: '1 Active Deal (Save up to ₦12,000)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADvM0qDZ-vAe-BHbjqtqO44dHzEtVILVk1JKpxEYkQC5ROQSEEyquW_U3cG6UhlfsBndz50c8E0WxVl6YOkdPBgsYjGHZchTQGYmKt_RJ80uS00R6YVAI22lXkrT6KkMs8terj9EmjPr6d58DC5ifsmVVclO5w14F0r_uPjZdy4o6oVDxD1tPbMd_VR6Wa29-Qjvf_KJMhaIoAtitEEEOcyiXqQUcLzYdTQQDWyFLQog84C5cd07aL5Q',
    alt: 'Upscale high-end sneaker boutique and designer streetwear showroom with illuminated glass floating shelves, clean architectural spotlighting, curated designer shoes and minimalist industrial concrete fixtures.',
  },
  {
    name: 'Cafe Neo Artisanal',
    kind: 'Cafe & Bakery',
    badge: 'Verified Partner',
    badgeIcon: 'verified',
    rating: '4.8',
    reviews: '(83 reviews)',
    distance: '2.1 km away • Wuse II',
    deals: '2 Active Deals (BOGO Free Coffee)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAKALWLmugB8h16Cj6547bTcbIywv9-7xo0SJoXd31xQkILkSfhfLw2-w2sUhPfZUbt3TQI4zhBXUbPM9jimmsMM0VEvWQXsUbpNGsIFKayrfEEJquYDQYMbBGdwTMsrrjKj05uVrJzHf_xMmAPSw5kzleQIlkhrZCJmlRKG3vwq8DQF3nHHTh4USSqa_i-de0RpihN_-HXiCZoKeeRshLhOXN7sYW7POMhPDcAz2ucfDrlkMu9foGgOg',
    alt: 'Charming specialty coffee roastery bar with an Italian chrome espresso machine, barista pouring delicate latte art into a ceramic cup, warm morning sunlight, wooden counter and fresh artisanal croissants on display.',
  },
];
