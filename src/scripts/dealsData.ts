/**
 * Shared deals model for the Deals page (mobile `DealsScreen`, desktop
 * `DesktopDealsScreen`).
 *
 * Previously each Deals screen rendered 6 hard-coded cards with no `id` and no
 * data module, which is why "Load More" had nothing to load and de-duplication
 * was impossible. Every record below has a stable unique id.
 *
 * All image URLs are lifted from the existing screens — none are invented.
 */

import { MERCHANT_IMAGE } from './orderData';

export interface FeaturedDeal {
  id: string;
  title: string;
  business: string;
  businessId: string;
  image: string;
  discount: string;
  badge?: string;
  copy: string;
  price: number;
  oldPrice: number;
  timer?: string;
  distance: string;
}

export interface LocationDeal {
  id: string;
  title: string;
  business: string;
  businessId: string;
  image: string;
  imageAlt: string;
  discount: string;
  extra?: string;
  distance: string;
  verified: boolean;
  badge?: string;
  rating: number;
  copy: string;
  price: number;
  oldPrice: number;
  category: 'food' | 'beauty' | 'fashion' | 'wellness' | 'grocery' | 'events';
  timer?: string;
}

const IMG = {
  grillBurger:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCzuzWH0U2QwYnphmSNvwNgYy2KT9cbZZxQNp4OF417hvHDjdXIJqcXgAC0Jq8C7aUqvI9P8d-w7L8889ftoMaC7SVb55GxQI8STHGI_jgEb4tRuyj8-9dAez7sJPsXlovchJ-pR0bEzWHx0RgkXq2BlmOzLSdyrwzyteeyXHL-RtjY_NoILSeP30TIsuIXZ9oQkLa1XyGCEuUU0ytwTAoVRMYGUsww_IPRVpVUea3B',
  soleSneakers:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAYU9CHvad8mmB1n7HZebj-9-RJNU48y8c41IO7GzzEk_4mD-lhgfd9MReQAi7YmYcbcDcZHGy4JlFEc8Y_xvGS6GKTRikmdwO8inJNNZQsqJthBLoFuxRSpANFde0IjudqyzaZd9ctxXpfJ_cpK_TFjTBltS6O6CxRYEBNCjzmWBdHm6GkyB7QsKUssO8D-I_atfFeR6xo6CqLFnTTx60Hn6je8raKJ2qdZ15i07to',
  glowSpa:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8LxbXWebu4BeWFCBPcQnwZ3yOVjHO9H4S9ZOfPGV9cMmACi2aZB_Hhu0JontfNGmJN7KDb9t8ObRhK6kcgRU9c1neHq-t6gNg7HFK2Z7F6XMKJNJcoMQCUei7KQvEMOdk3yYtVf3e5Ie3aMnIgjAIYTBFhfC430FSqSmLEtAuHlaO5BSCLUxZ4BFq5qVHBfhvErtWg7n15YG4LtYJ5TbHhVwyxpqngk-At1VnoQZ5',
  cafeBrew:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB6mVwJbVAhXMM6239ZPfDxwph2u7rXh0Me0cneDcRhckqCG_zdKDD2N_U8F7OK8e3jF5BJ2M0prZjgOX_1rQUbl5SJSX27asdG82U5vIYoaeC-SwhTYdK3Tr-da_MBPcs00hrZX4a8XBjl4JD9J6BTr3RflgchtVCldlT7yQzQOdSScCg7yC1Zagz_1EsP-7VUerTf5jQH7KjI-KelSjRNCL8gD9QySyXtULI9QIWC',
  velvetStitch:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Eg_JS8x1JFRVATxQeOiiQ3TMoMDrh4EhAiR9-wIDqscysVxQV1cCp4l-BDSgx3n_UAd_vD-1tD_Xv4YcSei9qtvi0YKwPPv08-rYPo0-tGJXM-rbpQI8WxkvYpP_0XqQymVLOAf7kewqDGZSq29JRiMRtfD-j5v-HuOyD3WFf7C10KeQzNGI2zaE14CE6XtUY04jA2LMw-juPENi_JB9-S82f_5yhQUbX8OwN1Ux',
  pulseGym:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDw6OkTPzKZR-Uae5KgRNwRpUUxHaV3xjDrt5alZPyfzQGcTbbQheK-zj4nl_miWFG2OWSmboQrFlaGFe3I1xrwjcKJCDeDPENEwo1M-q80Ga_OS2k4ycSjvl2jC0OeWXco2dM0vutx9HI45LEYTchDYLvsiWjJhEBl_0xoCB8xKnaoY7oz85z63k3LQ3HpD4jN1Y4bXp_TAOxaNuP01gTe1kwBTtvSNc1dGNDTXHGW',
  grillPlated:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAm_UT0z4RFY74FAD1RofAbJEzfrBXfwx7_sPp3IqkDFRJYeRgU2np6hTl96-YrVZIz2EzO0HApwv0tzkQKSfZH1iuYTG-t6cSKH2KOlXnJI-rffu8XnsGX7rQiQdWpwJY5O19q9saGtn2BNkhcPvAN9qPel_aJOZDLJki1bor5-nLgCyie7_qFIbNjkGsVBWKOdSdhXRkjWXPhnSV8dGQu9JFzYiYOwoTRKTZc7CnM',
  soleGallery:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAZEi5c854POZ4AICs5MN7gIdvpHFb2SI3Uxzhq2xvHqARL7pDGRWFav8eyjrQOV3clq3FH2MaV0kDIr0dwoLLrxpTKkYeZxUItz6ypB3PEoHLp4m6kKSwJxcBEvYtamci5RitB-vx-F6bKt9YhZfRm2CzU4Jx7gluWTfMXmOgc1j8zCYND41ntkMm0m4ZQh1eEXhSzHw6m6jF4pwqLwt01UQRZUa3DpJA7mkrOY6_G',
  glowStones:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCp0NgHxcJ3z5eanfpjf6SxbMpNWp59dpo9z7KjHlkggD3N3-LxISAb6UzWiFFOjzZ9h0r0JbKYwYivHJ6DcyLdXqBAaZCfhFbcIi5nYffDQ0Q9GdGoiK4AnPcCGwxKeT067PBCJxlQViWj6alGM5U5iTDGpD9LS0myrcKsuRHgibPxZ2lTS1i4wh-kJ7ADYxNmMrAMBEJx-FPEIDWZCIF-mbHZjNgELHrNxYVGzDRT',
  cafeCounter:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAhGznbs92qp68XDygsvb-5-9fjS5K8CLQ1pWyi6vx2TC7H70EAqyMGwI-JSDM0zkB31FVy_WedExHj0vik7TFI73nD8Zeb7KKo6vnPQ2ROO-pfYQ3pjI-lHZ6ppMOrTtRidyxOVmV3uUplZoR5wOVfN7wsQg0-G7T9EjYWFNJHlf104YmhUMlRs5ZgzP9N_0sQYpE8YriIwdpFfB58va0nmJ02bjscySDUNch6059r',
  velvetAtelier:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuALVh9jzJkC-WymKf5PQws4vtf7RlvCLgC75qaDVoohniWLYrNhZhlAbyVG2hj28GYAjVk25bQVqhaFlDBxKxam_IeBumKlfgC9HXoJYIHqyOM0FQ-a2_sZFAreKbhqjb2DJ-rf9GRt5IQsEAb2lDt2M7Z6xDwFQcjxIw-KvcMtg9q0kOv8PRa4_QBvUf9F9D3uLfEpNNXko0YFcf6bPW9td63bEnJ_oAl1xVK0CfFE',
  pulseStudio:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBvTeFkPu7sZ9lbavkG2NNZEGRio8gb8YQE_qUIv1QgAfuSB7GwV-19yicMTW42FzeYYhFfcvTxktABntL8xSw64eycXRuzSnpkQcCQ4Xgjs1btijpTY5GyF__Id5pPJpLcGys11zVCutV_FgO1Z_1Pt5JMs6iCCii0xLt7KZFCisxZY_Wn2CQ8G1V_faq2t3XscJ76jdv8MbbJb93EVZwa45gvJe55B0m4p59EvjHt',
  rooftopTasting:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB_l35VLFaK11RltRrE-nzB22BkuA_N75zreMrW6RsT9blVALkpXOAXKbAn-lFN7t03ty5K377JuUw39bCaUxSTVQcHS3Dmr4ahhy5GFgVK2hPI0sGkeYaxf1d4joa1uxsJeNRwJ9-e8PPl5ObqKpgnkji83P015ig14H-AAPPhXw0JC7obYa-ebKvoJIkE-nX7kF-TW34CZ_t1p-J7y8FMqvweALg7JOeOIZGSf0D8',
  featuredGrill:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDxtyJ8lPE2Mv8GCMaYUwkPs1iA9nOGDgt6JL2RjVgUg2sVRpfLxt7ol_e1hGEkKHZTf08tSXRznNtVEVFMK3JNn3oqH1kZRveAOUg7kmMqU-P0wMyPLQ9KvG2UZGGNHKwVmhaBIEXbM14h9-CRxbmRnyWFzogg-8u4iLo1oENMfHUYYIQLeb-ZVskSPf_qtcp6yTRAdCaMzKB7ai7YStSiCY_DoSH3eKLZCchk3ECz',
  featuredSole:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDtMNCcnGyMs_1bkUknKVikVVpRcby0k0s0ZBvtEQsc_4R-9ZUFAqeLx6ur0IFEwIJz4ts6h_tKstJxdxPR07Gzm1AOXGssJGfefuJboHcfqhHF2K0t1gPspl0Niqt-HyxSABXqQByUqz1wpO3DeCj7JU45dxFNn8al3yKVMjruVrAWeYkItP-5IEi74QYBhYioZlV3Yf4pL_GszLhDZQesJb1ZPkV7RNLiChrJp4jI',
  featuredGlow:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuABQdyVUWGnWP1TZLAK7j5LrpDjViCjK6RTmCevn-vXhmIBhcYQgrK16SLap69ZXLgT566Cb0u7rFjsEUThlgHZ3Y4x23T9dkkjVNnZU0CpHAUaxJZDIJv6PG1EvAg0Yh9565R5XoofBzRn_yuWQJ7AqYvMfbqyQwDUFcbGqVlObW0-YjJJ_x21IjpyYQ2TRsm1DNrBR_ey7KD-XsnEmKZuwGMaUnDQzMLL7N_9dhGM',
  featuredSky:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDYVvk_zUvlBpNPsSW39ZIu40l3KCpc7EkGCApbQlu2NxqrDow8fjuw5UaGRcuY6Ht6Q4ti_E9Rw3LJxvbwLWPwqOmunZpeTLfHDDuPE3xYquh9CZ2b-hSiZy1_PRl34uOhK2IIN8Ef2wh5yzZ3WgdzuI-4uBOAqdplX5i6pNmhvRZgllOFTydKVhYUmfYde4-4MAn0JFH_uBfZu4LaaHtNzn_KY-V_SzDp2VGlKxO-',
  featuredBakery:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuChhxTwztwhe6liej7iAYom5i582P6VAb9QUvMdZMAnlFxm8zl_pRWi_2hkQOCSDtAXsUNrwePtqnBhKQxS5PcM7u00e0AYSaJhtROdpygIJS0lOrV4ul7hposwFe67V5S4OH_WNIMot9APFtc67-FPmnZ4BUC46rmwWs56hyeZhRatjINPSqU-w-19_1bFRsRvlTZNKnUvoQRQAQZ6r4t7dxzE2Zud9c8dx3bt56NL',
} as const;

export const FEATURED_DEALS: readonly FeaturedDeal[] = [
  {
    id: 'featured-prime-lunch-combo',
    title: '20% Off Local Lunch Combo & Craft Beverage',
    business: 'Local Grill House',
    businessId: 'urban',
    image: IMG.featuredGrill,
    discount: '20% OFF',
    badge: 'Deal of the Day',
    copy: 'Weekdays 12pm–4pm. Freshly prepared mains, sides and a chilled house cooler.',
    price: 9600,
    oldPrice: 12000,
    timer: 'Ends in 02:14:33',
    distance: '0.8 km',
  },
  {
    id: 'featured-streetwear-drop',
    title: '30% Off Weekend Sneaker Drop & Streetwear Pass',
    business: 'Sole District Boutique',
    businessId: 'sole',
    image: IMG.featuredSole,
    discount: '30% OFF',
    badge: 'Trending',
    copy: 'One voucher valid on selected retro low-tops, hoodies and cargo essentials.',
    price: 28000,
    oldPrice: 40000,
    timer: 'Ends in 18:05:12',
    distance: '1.2 km',
  },
  {
    id: 'featured-glow-facial',
    title: '25% Off Weekend Glow Facial & Sauna Therapy Pass',
    business: 'Glow & Serenity Spa',
    businessId: 'glow',
    image: IMG.featuredGlow,
    discount: '25% OFF',
    badge: 'Top Rated',
    copy: 'Sixty-minute organic deep tissue session with lavender aromatherapy and sauna access.',
    price: 18500,
    oldPrice: 24600,
    timer: 'Ends in 1d 04:20',
    distance: '2.4 km',
  },
  {
    id: 'featured-sunset-tasting',
    title: "50% Off Chef's 5-Course Sunset Tasting Menu for Two",
    business: 'The Sky Lounge & Grill',
    businessId: 'urban',
    image: IMG.featuredSky,
    discount: '50% OFF',
    badge: 'Limited',
    copy: 'Rooftop table for two, five courses and a shared bottle of sparkling grape.',
    price: 24500,
    oldPrice: 49000,
    timer: 'Ends in 12:00:00',
    distance: '3.6 km',
  },
  {
    id: 'featured-sourdough-breakfast',
    title: '30% Off Artisanal Sourdough & Specialty Breakfast Combo',
    business: 'Artisan Bakery & Cafe',
    businessId: 'cafe',
    image: IMG.featuredBakery,
    discount: '30% OFF',
    badge: 'New',
    copy: 'Slow-proofed sourdough, seasonal spread and a specialty coffee of your choice.',
    price: 4500,
    oldPrice: 6500,
    timer: 'Ends in 2d 09:45',
    distance: '1.9 km',
  },
];

export const LOCATION_DEALS: readonly LocationDeal[] = [
  {
    id: 'deal-urban-prime-lunch',
    title: 'Prime 3-Course Lunch Combo & Craft Drink',
    business: 'Local Grill House',
    businessId: 'urban',
    image: IMG.grillPlated,
    imageAlt: 'Fresh lunch platter with mains, sides and a chilled glass drink at a local dining venue.',
    discount: '20% OFF',
    distance: '0.8 km away',
    verified: true,
    rating: 4.9,
    copy: 'Valid weekdays 12pm–4pm. Includes a chef-selected main, sides and drink.',
    price: 9600,
    oldPrice: 12000,
    category: 'food',
    timer: '4h left',
  },
  {
    id: 'deal-sole-streetwear-drop',
    title: 'Weekend Streetwear Drop & Sneakers',
    business: 'Sole District Boutique',
    businessId: 'sole',
    image: IMG.soleGallery,
    imageAlt: 'Curated display of designer sneakers and streetwear hoodies on acrylic pedestals in a minimalist boutique.',
    discount: '30% OFF',
    extra: 'Hot',
    distance: '1.2 km away',
    verified: false,
    badge: 'HOT',
    rating: 4.8,
    copy: 'Applicable to selected vintage low tops and graphic oversized tees.',
    price: 28000,
    oldPrice: 40000,
    category: 'fashion',
    timer: '18h left',
  },
  {
    id: 'deal-glow-weekend-facial',
    title: 'Weekend Glow Facial & Massage',
    business: 'Glow & Serenity Spa',
    businessId: 'glow',
    image: IMG.glowStones,
    imageAlt: 'Tranquil spa sanctuary with black river massage stones, essential oils and rolled white towels.',
    discount: '25% OFF',
    extra: 'Popular',
    distance: '2.4 km away',
    verified: false,
    badge: 'TOP RATED',
    rating: 5.0,
    copy: '60-minute organic deep tissue session with lavender aromatherapy.',
    price: 18500,
    oldPrice: 25000,
    category: 'wellness',
    timer: '1d left',
  },
  {
    id: 'deal-cafe-cold-brew-box',
    title: 'Cold Brew 1L & Pastry Box',
    business: 'Cafe Neo Artisanal',
    businessId: 'cafe',
    image: IMG.cafeCounter,
    imageAlt: 'Amber bottle of cold brew coffee beside golden croissants on a terrazzo coffee counter in morning light.',
    discount: 'BOGO FREE',
    extra: '15% OFF',
    distance: '3.1 km away',
    verified: false,
    rating: 4.7,
    copy: 'Steeped 24 hours. Paired with 2 almond croissants of your choice.',
    price: 4500,
    oldPrice: 6000,
    category: 'food',
    timer: '2d left',
  },
  {
    id: 'deal-velvet-bespoke-tailoring',
    title: 'Bespoke Tailoring & Custom Fitting',
    business: 'Velvet Stitch Couture',
    businessId: 'sole',
    image: IMG.velvetAtelier,
    imageAlt: 'Artisanal bespoke tailoring atelier with premium linen, tape measures and a mannequin in warm wood styling.',
    discount: '35% OFF',
    extra: 'Featured',
    distance: '1.8 km away',
    verified: true,
    rating: 4.9,
    copy: 'Personal measurement session and rush delivery on traditional Kaftans.',
    price: 32000,
    oldPrice: 49000,
    category: 'fashion',
    timer: '12h left',
  },
  {
    id: 'deal-pulse-monthly-pass',
    title: 'Monthly Pass + Personal Trainer',
    business: 'Pulse Fitness & Gym',
    businessId: 'glow',
    image: IMG.pulseStudio,
    imageAlt: 'Modern fitness studio with dumbbells, running machines and recessed blue overhead lighting.',
    discount: '40% OFF',
    extra: 'Limited',
    distance: '1.5 km away',
    verified: true,
    rating: 4.9,
    copy: 'Full locker access, steam room privileges and 4 dedicated coaching drills.',
    price: 15000,
    oldPrice: 25000,
    category: 'wellness',
    timer: '5h left',
  },
  {
    id: 'deal-urban-smash-burger',
    title: 'Smash Burger & Truffle Fries Basket',
    business: 'Local Grill House',
    businessId: 'urban',
    image: IMG.grillBurger,
    imageAlt: 'Close up of a gourmet beef burger with truffle fries and a chilled house soda on a dark slate board.',
    discount: '15% OFF',
    distance: '0.8 km away',
    verified: true,
    rating: 4.8,
    copy: 'Two smashed patties, cheddar and hand-cut truffle fries. Dine-in or collection.',
    price: 7800,
    oldPrice: 9200,
    category: 'food',
    timer: '6h left',
  },
  {
    id: 'deal-sole-sneaker-wall',
    title: 'Limited Edition High-Top Drop',
    business: 'Sole District',
    businessId: 'sole',
    image: IMG.soleSneakers,
    imageAlt: 'Streetwear boutique sneaker wall with limited edition high-tops under neon and warm spotlighting.',
    discount: '20% OFF',
    distance: '1.2 km away',
    verified: false,
    rating: 4.6,
    copy: 'Early access to this season’s retro high-top restock before general release.',
    price: 34000,
    oldPrice: 42500,
    category: 'fashion',
  },
  {
    id: 'deal-glow-hot-stone',
    title: 'Hot Stone Therapy & Aromatic Facial',
    business: 'Glow & Serenity Spa',
    businessId: 'glow',
    image: IMG.glowSpa,
    imageAlt: 'Serene luxury spa treatment room with bamboo styling, essential oils, white towels and a lit candle.',
    discount: '30% OFF',
    extra: 'Popular',
    distance: '2.4 km away',
    verified: true,
    rating: 4.9,
    copy: 'Forty-five minute hot stone tension release with a hydrating botanical facial.',
    price: 16800,
    oldPrice: 24000,
    category: 'beauty',
    timer: '1d left',
  },
  {
    id: 'deal-cafe-artisan-pastry',
    title: 'Artisan Pastry Box of Four',
    business: 'Cafe Neo Artisanal',
    businessId: 'cafe',
    image: IMG.cafeBrew,
    imageAlt: 'Bottle of single-origin cold brew with fresh golden croissants in a chic cafe with natural sunlight.',
    discount: 'BOGO FREE',
    distance: '3.1 km away',
    verified: false,
    rating: 4.5,
    copy: 'Choose four from almond butter, pain au chocolat, croissant and cinnamon roll.',
    price: 5200,
    oldPrice: 7400,
    category: 'food',
  },
  {
    id: 'deal-velvet-kaftan-fitting',
    title: 'Premium Kaftan Measurement & Fitting',
    business: 'Velvet Stitch Couture',
    businessId: 'sole',
    image: IMG.velvetStitch,
    imageAlt: 'Bespoke fashion atelier with tailored suits, measuring tape, brocade fabrics and vintage sewing tools.',
    discount: '25% OFF',
    distance: '1.8 km away',
    verified: true,
    rating: 4.8,
    copy: 'Master craftsmanship session for one two-piece custom traditional outfit.',
    price: 36000,
    oldPrice: 48000,
    category: 'fashion',
    timer: '20h left',
  },
  {
    id: 'deal-pulse-conditioning',
    title: '4-Session Conditioning Block',
    business: 'Pulse Fitness & Gym',
    businessId: 'glow',
    image: IMG.pulseGym,
    imageAlt: 'High tech athletic fitness centre with cardio rows, dumbbell racks and bright studio lighting.',
    discount: '35% OFF',
    distance: '1.5 km away',
    verified: false,
    rating: 4.7,
    copy: 'Four one-on-one conditioning sessions with a personalised nutrition plan.',
    price: 19500,
    oldPrice: 30000,
    category: 'wellness',
    timer: '9h left',
  },
  {
    id: 'deal-sky-rooftop-tasting',
    title: 'Chef’s 5-Course Sunset Tasting for Two',
    business: 'The Sky Lounge & Grill',
    businessId: 'urban',
    image: IMG.rooftopTasting,
    imageAlt: 'Rooftop fine dining experience at sunset with a five course gourmet meal and panoramic Abuja skyline views.',
    discount: '50% OFF',
    extra: 'Featured',
    distance: '3.6 km away',
    verified: true,
    rating: 5.0,
    copy: 'Sunset table for two with five courses and a shared bottle of sparkling grape.',
    price: 24500,
    oldPrice: 49000,
    category: 'events',
    timer: '3h left',
  },
  {
    id: 'deal-urban-grill-platter',
    title: 'Sharing Platter for Four',
    business: 'Local Grill House',
    businessId: 'urban',
    image: MERCHANT_IMAGE,
    imageAlt: 'Signature sharing platter at a local grill house.',
    discount: '20% OFF',
    distance: '0.8 km away',
    verified: true,
    rating: 4.9,
    copy: 'Chef-selected mains, sides and a shareable platter for four. Weekend only.',
    price: 32000,
    oldPrice: 40000,
    category: 'food',
    timer: '1d left',
  },
  {
    id: 'deal-cafe-breakfast-combo',
    title: 'Sourdough & Specialty Breakfast Combo',
    business: 'Artisan Bakery & Cafe',
    businessId: 'cafe',
    image: IMG.featuredBakery,
    imageAlt: 'Artisanal sourdough bread and specialty breakfast spread.',
    discount: '30% OFF',
    distance: '1.9 km away',
    verified: false,
    rating: 4.6,
    copy: 'Slow-proofed sourdough, seasonal spread and a specialty coffee of your choice.',
    price: 4500,
    oldPrice: 6500,
    category: 'food',
  },
  {
    id: 'deal-glow-sauna-pass',
    title: 'Sauna & Steam Recovery Pass',
    business: 'Glow & Serenity Spa',
    businessId: 'glow',
    image: IMG.featuredGlow,
    imageAlt: 'Spa recovery suite with warm lighting and soft towels.',
    discount: '20% OFF',
    distance: '2.4 km away',
    verified: true,
    rating: 4.8,
    copy: 'Ninety minutes of sauna, steam room and chilled plunge access. Weekdays only.',
    price: 8000,
    oldPrice: 10000,
    category: 'wellness',
  },
  {
    id: 'deal-sole-cargo-essentials',
    title: 'Cargo & Essentials Bundle',
    business: 'Sole District Boutique',
    businessId: 'sole',
    image: IMG.featuredSole,
    imageAlt: 'Streetwear cargo trousers and essentials on display.',
    discount: '25% OFF',
    distance: '1.2 km away',
    verified: false,
    rating: 4.5,
    copy: 'Pick any cargo trousers plus two graphic tees at a bundled price.',
    price: 22000,
    oldPrice: 29500,
    category: 'fashion',
  },
  {
    id: 'deal-urban-craft-drinks',
    title: 'Craft Cooler Flight for Two',
    business: 'Local Grill House',
    businessId: 'urban',
    image: IMG.featuredGrill,
    imageAlt: 'Flight of refreshing house coolers on a local dining table.',
    discount: '15% OFF',
    distance: '0.8 km away',
    verified: true,
    rating: 4.7,
    copy: 'Freshly pressed house coolers and chilled treats to share.',
    price: 6400,
    oldPrice: 7500,
    category: 'food',
  },
];

/** Cards rendered per page on the Deals screen. */
export const DEALS_PAGE_SIZE = 6;

/** Pure, duplicate-free slice for a zero-based page index; clamped and empty past the end. */
export function locationDealsPage(page: number): LocationDeal[] {
  if (!Number.isFinite(page) || page < 0) return [];
  const start = Math.floor(page) * DEALS_PAGE_SIZE;
  return LOCATION_DEALS.slice(start, start + DEALS_PAGE_SIZE);
}

export function locationDealPageCount(): number {
  return Math.ceil(LOCATION_DEALS.length / DEALS_PAGE_SIZE);
}
