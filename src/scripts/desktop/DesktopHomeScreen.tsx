import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DesktopLocationRadiusModal } from '../../components/DesktopLocationRadiusModal';

interface DesktopHomeScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenFilters: () => void;
  onOpenFeatured: () => void;
  onOpenDeals: () => void;
  onOpenDeal: () => void;
  onClaim?: (onClaimed?: () => void) => void;
}

const HERO_LIST_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCS157lqo7xVeIPrY-YwXz-qLPSxMYuZ6MVVZm7i6pXIYJp3jj2O6fz76xwBEEFEMPweLJRa8Tm49n6Rwul-eJYZWMBzYvy5DuYGwjSpFhemSRM2WvxQzm2fwvc8JZ6Mu-YfStqotM5Nsjvaun00tM1rZWIK52y9Mj0qAQjQ02_Odn3b5TSpdPYSmPjMOe0EK7rFyxDrAGSL0MFXKVXa7veRCdKVR52Oz-6BM8HD8W0';

const HERO_GRID_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCkIxQKPJ2CK4jYecgDvXxVKgoXnaiLRhf9nh8zig7wgyoml_WMe7fsiYtmztk9rKiUHi55eLCiwNh04f_72TTRCZNBW0KOtMZNQdQohVyPqT-NoZZFRIbzHeYhmEcHwiIlbhsqW1ynppf7c48y6EQc2bEUGsH4sezPHA7V4Fc7u0vkaUE1Y96MvuETpz-Zm7o5Pgu-vZfjTxdtSThrDeODsHDgluf_1fDho6B-juDh';

interface ListDeal {
  image: string;
  imageAlt: string;
  discount: string;
  timer?: string;
  meta: string;
  rating: string;
  title: string;
  copy: string;
  price: string;
  oldPrice: string;
}

const LIST_DEALS: ListDeal[] = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQfjmMBKVyq4oGYUBEW0nSamX7UkiblSMYJIQlzwzVwQV5bwUOKxbcd591K_SoaOl57bE6x-zaod0Pd-6Y7mi1YZLE98aOpCpBCo20g7p4fCJMAsyxJmlkwgGtVpG7AU_Ek6DRPwmzBEbBk3H7k-ccZDIdt8xrsMqxYWKfIXGz7DdaGMF3GerwuBx4GEtgBsz7ANn1_RJFBlEGrarQ2pRD6z6C8tT8NC3THEVgSn9p',
    imageAlt:
      'Juicy charcoal-grilled prime steak burger topped with melting aged cheddar, crispy shallots, accompanied by golden rosemary parmesan fries inside an atmospheric modern urban bistro',
    discount: '20% OFF',
    timer: 'Expires in 4h',
    meta: '0.8km away • Apo District',
    rating: '4.8',
    title: 'Urban Grill & Bistro',
    copy: 'Prime Lunch Combo with slow-roasted wings & iced peach infusion.',
    price: '₦9,600',
    oldPrice: '₦12,000',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEehaaJ6quatm3mZwLtce7bSobSNTp-1YZhExRfjeHAbT1kPVo17LB3ctyE-vmaIDOH55qKFB-44tWKRDTZB7AR7_qUXj6VmsgBozilox_fpSsY35RdGuT5ZEGk7ll7VXhTLeGYnyzWrsi_z2lb1VVt-LR8D0Ups-KrKgATFySFhrZ1pit4G9b3QDVxiZT6FyUSNMuYjfcY6m9SijgXcuB3DCHRKiPHzry5KcG7JPC',
    imageAlt:
      'Pair of limited edition collector sneakers presented on a minimalist concrete plinth inside a high-end streetwear boutique in Garki with clean architectural backlighting',
    discount: '30% OFF',
    meta: '1.2km away • Garki Area',
    rating: '4.7',
    title: 'Sole District Boutique',
    copy: 'Weekend Sneaker Drop & Selected Streetwear Apparel voucher.',
    price: '₦28,000',
    oldPrice: '₦40,000',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUEe61wFWuvFbTKFVZ2ePTfV6HOVImqjVTHrYnUcUQm5BeBf2gTpR5aHBRk_00Lihi-dg1y8DzPa0zor6SQAot4rd1NZdRELhmBS0cNc8rVscBorA5njN0_esdlr5GWVC357w6TB0Xigas0qhqGXcJ5n9rY4uLeE1hy64XSIWsHUu3SAFnFqTlNT8OWoaUlHqJl0iNUPM_2jtuKuY9e7LgpL9w3aDp3x7dPxxdBuLn',
    imageAlt:
      'Luxury spa treatment room with warm wooden slatted walls, aromatic eucalyptus steam, rolled linen towels and calming warm ambient candlelight',
    discount: '25% OFF',
    meta: '1.4km away • Maitama',
    rating: '5.0',
    title: 'Glow & Serenity Spa',
    copy: 'Weekend Glow Facial & Scandinavian Sauna Detox Session.',
    price: '₦18,500',
    oldPrice: '₦24,600',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANPgDMuHC9H_xkJNSNaJJ8lYNaVsHN4pENGtr1O9s-JUdC81clPMnagBRyIL55iuxnAR6D1cytIj5loYBp4S-azP93ULSk1lTO2fB3MmQx3l2DCejU_aoAiPta7SrlhVo8k4bBH75kGS7P-YPlWaH44ojDyA7heUtwJkC12v7kB8ORTLBetgBYr-d-av2Gfxgrqq6mSg7-8Jvc3ev3Sck-56PjZ3oN2gkxgPEnBKKU',
    imageAlt:
      'Two glass carafes of cold brew coffee served with ice and fresh flaky almond croissants on a marble cafe countertop in Abuja with warm natural daylight',
    discount: 'BOGO FREE',
    meta: '0.5km away • Apo Resettlement',
    rating: '4.9',
    title: 'Cafe Neo Artisanal',
    copy: 'Buy One Get One Free Cold Brew & Warm Almond Pastry Box.',
    price: '₦4,500',
    oldPrice: '₦9,000',
  },
];

interface SpotlightFeature {
  icon: string;
  text: string;
  error?: boolean;
}

interface SpotlightSlide {
  image: string;
  discount: string;
  merchant: string;
  title: string;
  copy: string;
  rating: string;
  reviews: string;
  price: string;
  oldPrice: string;
  save: string;
  ending: string;
  features: SpotlightFeature[];
}

const SPOTLIGHT_SLIDES: SpotlightSlide[] = [
  {
    image: HERO_LIST_IMAGE,
    discount: '50% OFF',
    merchant: 'The Sky Lounge & Grill • Maitama Heights',
    title: "Chef's 5-Course Signature Tasting Menu & Sunset Pairing",
    copy: 'Experience refined dining with Wagyu bites, smoked butter prawns, and botanical mocktails curated exclusively for VEMTAP patrons.',
    rating: '4.9',
    reviews: '(184 reviews)',
    price: '₦24,500',
    oldPrice: '₦49,000',
    save: 'Save ₦24,500 instantly',
    ending: 'Ends Tonight (11:59 PM)',
    features: [
      { icon: 'check_circle', text: 'Includes Welcome Drink' },
      { icon: 'check_circle', text: 'Valet Parking Apo Link' },
      { icon: 'schedule', text: 'Expires Tonight', error: true },
      { icon: 'pin_drop', text: 'Maitama • 4.1km' },
    ],
  },
  {
    image: LIST_DEALS[0].image,
    discount: '20% OFF',
    merchant: 'Urban Grill & Bistro • Apo District',
    title: 'Prime Lunch Combo with Slow-Roasted Wings & Peach Infusion',
    copy: 'Woodfire aged ribeye, truffle parmesan fries and house craft peach iced tea — the neighborhood favorite, ready in 15 minutes.',
    rating: '4.8',
    reviews: '(184 reviews)',
    price: '₦9,600',
    oldPrice: '₦12,000',
    save: 'Save ₦2,400 instantly',
    ending: 'Ends in 4h (3:00 PM)',
    features: [
      { icon: 'check_circle', text: 'Includes House Craft Iced Tea' },
      { icon: 'check_circle', text: 'Patio Seating for Two' },
      { icon: 'schedule', text: 'Expires in 4h', error: true },
      { icon: 'pin_drop', text: 'Apo • 0.8km' },
    ],
  },
  {
    image: LIST_DEALS[2].image,
    discount: '25% OFF',
    merchant: 'Glow & Serenity Spa • Maitama',
    title: 'Weekend Glow Facial & Scandinavian Sauna Detox',
    copy: 'A 75-minute radiance facial paired with eucalyptus steam, sauna detox and a complimentary herbal infusion for two.',
    rating: '5.0',
    reviews: '(96 reviews)',
    price: '₦18,500',
    oldPrice: '₦24,600',
    save: 'Save ₦6,100 instantly',
    ending: 'Ends Sunday (9:00 PM)',
    features: [
      { icon: 'check_circle', text: 'Includes Herbal Infusion' },
      { icon: 'check_circle', text: 'Complimentary Valet' },
      { icon: 'schedule', text: 'Weekend Slots Only' },
      { icon: 'pin_drop', text: 'Maitama • 1.4km' },
    ],
  },
];

interface TrendingDeal {
  image: string;
  imageAlt: string;
  claimed: string;
  title: string;
  store: string;
  price: string;
  discount: string;
}

const TRENDING_DEALS: TrendingDeal[] = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCR2OWkGMPg-P6oABzzOrjzQ5ebc_MnDOi1GDUgx16665jwq5J3-cMTcPJwIcB5HTGLduvLker2ffFkcG7T1eiwhULCzs7Uj9ISzbPXnSHGX4a20CV2aTieWnpG85ml28KI1TcE4bV-nWDto4N46DQAv7_NCP47_v-TWvvlEhQ9F-SkV-vkfd7i7jslcoy_obmyJG6QcUF1QSpclZ0quoyuNOAU2OdBd5wmmnbgipLS',
    imageAlt:
      'Artisanal flat white coffee with exquisite latte art inside a modern ceramics mug with roasted coffee beans nearby',
    claimed: '82 claimed today',
    title: 'Specialty Espresso Bundle',
    store: 'Brew Bar Coffee Co. • Apo',
    price: '₦3,200',
    discount: '35% OFF',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALRDAbLcFn9BwqvwgTCZHHjC8eW4LmVCL7qbIl4Z44EUFQiFb-OM1ytNMaiKT_cV-oFf7jiPbeFAdweLJl0kAcPBobAJXIh4FeYRF_fWnwhdP4CfU_RJoU86aAo8f4JyaKFuGr8tU50pAjsUItGg_eeo3XNGtrh6al9BlLQjKxYJfCZ-ZsJdZkx2e0u0viw1DwcFgmPujVtj5rcJvax2Bca-L4nAYRrhUyXidbLLVH',
    imageAlt:
      'Modern fitness gym studio with kettlebells, dumbbells and glowing neon lighting fixtures in Garki Abuja',
    claimed: '140 claimed',
    title: 'Unlimited Gym Pass (7 Days)',
    store: 'Apex Fitness Zone • Wuse II',
    price: '₦7,000',
    discount: '40% OFF',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDz-fY92SqjI90Dn8xoKiBeAfQImf6pTkdhNdvCbNSMVdMoM4AhvbNcFX0hUOs22TQphQNsmF1Xm8lnbU5kS3Q40okJQAtTfoZaDUNUo-YGZNxtEbmrqK-5QWRPElc577zQrCu6zhjglg2NcgdOhPds7FMTa-KnBNVZJA3TIfILYq-tjY_xEIcpzh2XcTujvgV4kvSC-PyQW_Z34U0N8HnQNsjQhsPVb_OrW4qgcJKX',
    imageAlt:
      'Luxury car detailing studio with water beading over freshly ceramic coated midnight blue sports car',
    claimed: '45 claimed',
    title: 'Full Interior Steam Detailing',
    store: 'Velocity Auto Spa • Central Area',
    price: '₦14,000',
    discount: '20% OFF',
  },
];

const LIST_BUSINESSES = [
  { initials: 'AB', name: 'Artisan Bakery & Cafe', rating: '4.9 (310)', area: 'Apo Legislative Quarters', deals: '3 Deals Active' },
  { initials: 'PF', name: 'Pulse Fitness & Wellness', rating: '4.8 (142)', area: 'Gudu District (1.1km)', deals: '2 Deals Active' },
  { initials: 'VS', name: 'Velvet Stitch Couture', rating: '4.7 (96)', area: 'Apo Resettlement', deals: '1 Deal Active' },
];

const LIST_PRODUCTS = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGNefYj3-NHZ-oT5_OZxr7oFG68vkHNXpTu_9MmwJqszjFrX7CBk_MAp6ldbvX21jXRCo6QlGmaTzRRYf8ftVkp5eaFMI7WON_oaTM3wct52P6vc4DGKYE0-SAXmyyIsV9yxNoRsl8cCyOf0p2EJCrfzkutWF8gbciy9kcopty0I1DR8K9kMX1IGJHkkxeK3sCdxgd06lFzVE9vl9FyGclO4Ng29ogeSJvQU1XN3uS',
    imageAlt: 'Sleek 1 liter amber glass bottle of cold brew coffee labeled artisanal roast on white studio backdrop',
    badge: '15% OFF Voucher',
    title: 'Artisanal Cold Brew 1L Jug',
    store: 'Cafe Neo • Apo District',
    price: '₦5,100',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ6r9hZG8A3m9K8_g44MPX3gIEb2PufqKgR8DRxdyriX_hW_6BxbB3yOTvV1rWZEDkEPHsZp4W9pPa6M1zt2XLmLbCfrb4fCm7meWbkS36d0XhcKI0DKGxOV-DdEFSle6nW6VlwTulSfA53WAMbTcerGVsYjuVPXMTX9BBpk47Dx4F_fbt1n1lpHXp9aL_bntolEYxTHW4HM6MNWkF9hLJGgq3QrQGQS5d9CKfp6iw',
    imageAlt: 'Handcrafted genuine tan leather everyday tote bag resting on minimal wooden bench',
    badge: '25% Voucher',
    title: 'Handcrafted Leather Tote Bag',
    store: 'Velvet Stitch • Apo Resettlement',
    price: '₦22,500',
  },
];

interface GridDeal {
  image: string;
  imageAlt: string;
  discount: string;
  discountClass: string;
  distance: string;
  store: string;
  rating: string;
  title: string;
  copy: string;
  price: string;
  oldPrice: string;
  claim: string;
}

const GRID_DEALS: GridDeal[] = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC8SAMXY0-DNcvOAMjtZWHlYhfdXyG2kSSv7PpN516hastSklskvWZssBjEiiAXLIX_mrI5Nw91MscJtHEaissP-B8ZOvSiW7EWfJ8pBMjBae2DG8NM4gjXU_QzRFe8DHMmgRrCCn7_vk71UyH86oZQD3W0wXqEjkfEpUX0tkVAZTw8GkkDP3wSXHJal0WmsDY3wCqX71xNeAwmV9QQgOJyMIPyErt9V7RWhKfmaUiM',
    imageAlt:
      'Juicy flame-grilled burger combo with crispy golden french fries, craft soda glass, and artisanal dipping sauces served on a dark slate board, commercial food styling, cinematic lighting, sharp focus.',
    discount: '20% OFF',
    discountClass: 'bg-badge-discount-bg text-badge-discount-text',
    distance: '0.3 km',
    store: 'Urban Grill • Bistro',
    rating: '4.9 (184)',
    title: 'Prime Lunch Combo',
    copy: 'Smoked brisket burger, hand-cut fries & drink.',
    price: '₦9,600',
    oldPrice: '₦12,000',
    claim: 'Claimed Prime Lunch Combo at Urban Grill!',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBnulDcDKFGmBjjLBdymhmMHP42Zyd48BOeN6inOk41II3queDYDrj2EUc6Gq6QNI79TE3WZPjBcvduX5Qrr3Sapyaok8J43EglnR4yt8vvb16lWeazu_0D8JMVdU0AwINpw4OIxGKJglwrTeFk_0bph5Nzf-KFIapzFB6C0gq-aPM8G7_YXqGt_iHuhQ0yN-sTlvxZgFd-_HJAoQMbTnzKeI4fVJAgdCxNTCaPF-eB',
    imageAlt:
      'Exclusive streetwear limited-edition sneakers displayed beside folded premium heavyweight cotton tees on a sleek concrete retail pedestal, minimalist boutique lighting, cool blue and steel accents.',
    discount: '30% OFF',
    discountClass: 'bg-badge-discount-bg text-badge-discount-text',
    distance: '0.9 km',
    store: 'Sole District • Retail',
    rating: '4.8 (92)',
    title: 'Sneaker Drop & Graphic Tees',
    copy: 'Weekend urban lifestyle curated bundle.',
    price: '₦28,000',
    oldPrice: '₦40,000',
    claim: 'Claimed Sole District Fashion Deal!',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3Tl0kyJV02kgTCaaMs3hLfTP15jQuXkQw18vkDef2r7iQFBpyhKRiaYGz5nqD1EdipwImCtv4kH3nGoR1TXky3RoccfPrFwVETV4Tx3vfr1WClFRDJqrmjlQ4-8a9Hb1d5C-3GlmBn9vsk0K_Dch75akSHig0JwldhMvbxyVrC6JISahX8ptBm-RI2iNmdLj-1felT-pAJzUwlWNthrbYXEeQGCfq4y5NafDHJsaP',
    imageAlt:
      'Two freshly steamed barista espresso cups with delicate latte art rosettas placed on a warm oak coffee shop counter, sunlit morning ambience with soft focus coffee roaster in background, natural warm tones.',
    discount: 'BUY 1 GET 1',
    discountClass: 'bg-secondary-fixed text-on-secondary-fixed',
    distance: '0.5 km',
    store: 'Cafe Neo • Bakery',
    rating: '4.7 (310)',
    title: 'Buy 1 Get 1 Artisan Latte',
    copy: 'Choice of vanilla bean, oat milk, or classic hazelnut.',
    price: '₦3,200',
    oldPrice: '₦6,400',
    claim: 'Cafe Neo BOGO Voucher Saved!',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAzVn-GUAdbi2bFgjQKR0mbnEJZj4sftIMdbraFcKTl2wj548rJ8m45hMtJ3ksemLPdWj-Cxo_ClFc1wY9L59B5ghGbxGG8G6b-Hhh-to680EALRrQOvTBH-QHIt2IH33lxXZ8o4UmBs6UQlkgIu99bcZZEM9KVuXPq7q2llZVY_1SzP3l0EdWEMTjABd4NHuFlTN9VUJkfE7X3hFO0iXYFfbUyAbBAyNhd08cUvX_g',
    imageAlt:
      'Relaxing luxury spa wellness room with eucalyptus leaves, heated basalt stones, and gentle mist diffuser glowing in soft golden light, tranquil modern aesthetic with pristine white towels.',
    discount: '25% OFF',
    discountClass: 'bg-badge-discount-bg text-badge-discount-text',
    distance: '1.4 km',
    store: 'Glow Spa • Wellness',
    rating: '4.9 (78)',
    title: 'Facial & Sauna Day Pass',
    copy: '60-minute botanical hydration and cedar sauna entry.',
    price: '₦18,500',
    oldPrice: '₦24,600',
    claim: 'Glow Spa Day Pass Claimed!',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwlYu8W4_YhD_Gdi3n33htwwua9r7Q6Gt25lx4E4RAZW2iWCCXDKBQCKXqo4nvF_q50rsA5TPYR4hsoPIGBOlso422fiU7wDenS-ZNs-IUY7ZbgkwMhv5qv_N3ah4U68EepnbfPhLE4TKYvKVB2d8CxUITpM8huscUbv6rl2x7aqGBpwdMfDQtQtMjqj-Wvt5eQOVGxOq7yxgt48UUxTykpEFGgS5wypb3FxJ7Yq2H',
    imageAlt:
      'Tailor cutting bespoke navy merino wool fabric on a clean measuring table with measuring tape, tailor chalk, and brass shears, professional craftsmanship atelier atmosphere, crisp clean lighting.',
    discount: '35% OFF',
    discountClass: 'bg-badge-discount-bg text-badge-discount-text',
    distance: '1.8 km',
    store: 'Velvet Stitch • Tailoring',
    rating: '5.0 (64)',
    title: 'Bespoke Suit Consultation',
    copy: 'Hand-tailored custom fitting & lining customization.',
    price: '₦32,000',
    oldPrice: '₦49,000',
    claim: 'Velvet Stitch Fitting Booked!',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCw55akIpB_abgE4bTrsEpY2lF4UerDRylqEGgWZjD7BRaOojrbs8H6WhDy4cqROC62CEq-NeIGj7Eo4wneXfbFWw6MCJJtMxjCWcJfMiz-IhkYz4QQnOi7W-_BLOc8GXtRxFaTB7m7k8u3YR25auT3Net7sInQzLk8AoTQexA5umETpdF4XH5KN3cJ9YDHm1vIV--FUKvFwc3KyH3c3q15yJTMUbG8TopmMYP-oPO3',
    imageAlt:
      'Modern fitness studio interior with sleek kettlebells, ergonomic rowing machines, clean rubberized athletic turf, and neon motivation accents, energetic and spotless workout environment.',
    discount: '40% OFF',
    discountClass: 'bg-badge-discount-bg text-badge-discount-text',
    distance: '2.1 km',
    store: 'Pulse Fitness • Gym',
    rating: '4.8 (240)',
    title: 'Monthly Pass + 2 PT Sessions',
    copy: 'Full access to weights, sauna & functional trainer.',
    price: '₦15,000',
    oldPrice: '₦25,000',
    claim: 'Pulse Fitness Membership voucher unlocked!',
  },
];

const GRID_TRENDING = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1VPIrceZq-fiKrFm44R5jvWor4MwpPCoTdhPnfiwk4XXvX74xQ4JaBlPPHnMoL8Jxs0NatjWxECuFcJZrLR7GJUYPzO0rsTuUJif3gj-gWp7_7e73NgmxrvZrmJmDZALMkyPt9PYvBdiDK5YR5yUFIozHy8sUGjNgvqQvEjSWVpXLD4HLpEM7FOroG9zjcd_LqciYdQ10N_TEX5M6T86sQktFxepe-X4e3nqxDSxm',
    imageAlt:
      'Fluffy wood-fired Neapolitan pizza bubbling with mozzarella cheese, fresh basil leaves and sun-ripened tomatoes, captured fresh from stone oven, steam rising, high end culinary photography.',
    discount: '45% OFF',
    store: 'Trattoria Romana • Apo Resettlement',
    rank: 'Trending #1',
    title: 'Family Stone-Baked Pizza Feast',
    copy: '2 Large pizzas + garlic knots + 1.5L drink pitcher.',
    price: '₦11,500',
    oldPrice: '₦21,000',
    claim: 'Claimed Trattoria Romana Feast!',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMGXSJzfa7-LgjL4JO-DzI7s4Y41ByfrtJK6AqyWbWsYR73mKClS_2yjUW5ourmonjDDn9Os78rAuq4FLbUDf4DMUJKIpQGxUAj_H3p1HwtybMqR20BOY1iqYssjla7X34FWBnmMnr7SBznBIi4M0ORWrA0P0V3pFMKdPHpEtr649TrmSrY5xLxp_yMSb4LMtoeDW_FXdF6oYkv60M-dmz3zxHZn-GfrU7DuBgRDH_',
    imageAlt:
      'Organic cold pressed fresh wellness juices bottled in minimalist glass containers with orange slices, ginger roots, and green leafy mint leaves surrounding, bright natural morning studio illumination.',
    discount: '30% OFF',
    store: 'Vital Cleanse Bar • Garki 2',
    rank: 'Trending #2',
    title: '3-Day Detox Immunity Pack',
    copy: '6 cold-pressed functional juices formulated for metabolic reboot.',
    price: '₦8,900',
    oldPrice: '₦12,800',
    claim: 'Claimed Vital Cleanse Pack!',
  },
];

const GRID_BUSINESSES = [
  {
    initials: 'AB',
    name: 'Apex Auto Boutique',
    copy: 'Detailing • Ceramic Coating • Oil Change',
    status: 'Open now',
    area: '0.8km away',
  },
  {
    initials: 'BL',
    name: 'Bloom & Leaf Florists',
    copy: 'Exotic Bouquets • Event Decor • Plants',
    status: 'Open now',
    area: '1.1km away',
  },
  {
    initials: 'OM',
    name: 'Optima Med Spa',
    copy: 'Dermatology • Laser Skin • IV Therapy',
    status: 'Open until 9 PM',
    area: '1.6km away',
  },
];

const GRID_MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDPi8Hp2LqrNbrRjrTe4iJGQ82H5nsV1-JvhlyPbRVhxONkWJt6Hc2S_lIZk9qo9btotKPC72KuIRzlcqxkOEekBorlzOmDPiLFdngxWpwgjtTT1izq8k3mCxSxrpZYEjh5MWVcQ3PbDF_AB-uT28yp-J3pqOSTDWKLCrFnYOfqHy1aTcjOivKcO-UI_9bCybcQXu2yrMzbnFa1OR2ZwxZ22PxWZOr0qA1L94Oic9em';

const LIST_CATEGORIES = [
  { label: 'All' },
  { label: 'Food & Dining', icon: 'restaurant' },
  { label: 'Fashion', icon: 'checkroom' },
  { label: 'Beauty & Spa', icon: 'spa' },
  { label: 'Fitness', icon: 'fitness_center' },
  { label: 'Tech & Gadgets', icon: 'devices' },
];

const GRID_CATEGORIES = ['All Deals', 'Food & Dining', 'Fashion & Drops', 'Beauty & Wellness', 'Fitness'];

export function DesktopHomeScreen({
  onNav,
  onOpenFilters,
  onOpenFeatured,
  onOpenDeals,
  onOpenDeal,
  onClaim,
}: DesktopHomeScreenProps) {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [locationOpen, setLocationOpen] = useState(false);
  const [listCategory, setListCategory] = useState('All');
  const [gridCategory, setGridCategory] = useState('All Deals');
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const trendingRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const [spotlight, setSpotlight] = useState(0);
  const [spotlightPaused, setSpotlightPaused] = useState(false);

  useEffect(() => {
    if (spotlightPaused) return;
    const timer = window.setInterval(() => {
      setSpotlight((current) => (current + 1) % SPOTLIGHT_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [spotlightPaused]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

  const toggleLike = (index: number) => {
    setLiked((prev) => {
      const nextValue = !prev[index];
      showToast(nextValue ? 'Saved to your VEMTAP favorites' : 'Removed from saved deals');
      return { ...prev, [index]: nextValue };
    });
  };

  const scrollTrending = (delta: number) => {
    trendingRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const toastElement = toast ? (
    <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl flex items-center gap-space-xs transition-all duration-300">
      <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
      <span className="font-label-md text-label-md">{toast}</span>
    </div>
  ) : null;

  if (view === 'list') {
    return (
      <>
        <DesktopPage activeNav="home" onNav={onNav} withFooter withHeader onOpenLocation={() => setLocationOpen(true)}>
          <section className="w-full px-margin py-space-md bg-surface-canvas shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-2xs text-text-secondary font-label-sm text-label-sm">
                    <span>Good evening</span>
                    <span className="text-primary font-bold">•</span>
                    <span className="flex items-center gap-1 text-text-secondary">
                      <Icon name="location_on" className="text-primary text-[18px]" />
                      Apo, Abuja (Within 5km)
                    </span>
                  </div>
                  <p className="font-heading-lg text-heading-lg text-text-primary tracking-tight mt-0.5">
                    Explore active deals around you
                  </p>
                </div>

                <div className="flex items-center gap-space-xs lg:justify-end">
                  <button
                    className="h-[46px] px-space-md bg-surface-subtle hover:bg-surface-tint-blue text-text-primary hover:text-primary rounded-xl flex items-center gap-1.5 font-label-md text-label-md font-semibold transition-all shadow-sm shrink-0"
                    type="button"
                    onClick={onOpenFilters}
                  >
                    <Icon name="tune" className="text-[18px]" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {LIST_CATEGORIES.map((item) => {
                  const active = item.label === listCategory;
                  return (
                    <button
                      key={item.label}
                      className={`px-4 py-2 rounded-full font-label-sm text-label-sm shrink-0 transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm hover:scale-[1.02]'
                          : 'bg-surface-subtle text-text-secondary font-medium hover:bg-surface-container-low hover:text-text-primary shadow-sm'
                      }`}
                      type="button"
                      onClick={() => setListCategory(item.label)}
                    >
                      {item.icon ? <Icon name={item.icon} className="text-[16px]" /> : null}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto w-full px-margin py-space-xl flex flex-col gap-space-2xl">
            <section className="w-full">
              <div
                className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-md grid grid-cols-1 lg:grid-cols-12 group transition-all duration-300 cursor-pointer"
                onClick={onOpenFeatured}
                onMouseEnter={() => setSpotlightPaused(true)}
                onMouseLeave={() => setSpotlightPaused(false)}
              >
                <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${SPOTLIGHT_SLIDES[spotlight].image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
                    <span className="px-3 py-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold rounded-full shadow-sm flex items-center gap-1">
                      <Icon name="local_fire_department" className="text-[14px]" />
                      {SPOTLIGHT_SLIDES[spotlight].discount}
                    </span>
                    <span className="px-3 py-1 bg-surface-canvas/90 backdrop-blur text-primary font-caption text-caption font-semibold rounded-full shadow-sm">
                      PROMOTED SPOTLIGHT
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-surface-canvas lg:hidden">
                    <span className="text-caption font-semibold bg-black/60 px-2.5 py-1 rounded-md backdrop-blur">
                      {SPOTLIGHT_SLIDES[spotlight].ending}
                    </span>
                    <span className="font-heading-sm text-heading-sm font-bold text-surface-canvas">
                      {SPOTLIGHT_SLIDES[spotlight].price}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 hidden lg:flex items-center gap-2">
                    <button
                      aria-label="Previous spotlight deal"
                      className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 text-surface-canvas backdrop-blur flex items-center justify-center transition-colors"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSpotlight((current) => (current - 1 + SPOTLIGHT_SLIDES.length) % SPOTLIGHT_SLIDES.length);
                      }}
                    >
                      <Icon name="chevron_left" className="text-[20px]" />
                    </button>
                    <button
                      aria-label="Next spotlight deal"
                      className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 text-surface-canvas backdrop-blur flex items-center justify-center transition-colors"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSpotlight((current) => (current + 1) % SPOTLIGHT_SLIDES.length);
                      }}
                    >
                      <Icon name="chevron_right" className="text-[20px]" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                    {SPOTLIGHT_SLIDES.map((slide, index) => (
                      <button
                        aria-label={`Show spotlight deal ${index + 1}: ${slide.title}`}
                        key={slide.title}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSpotlight(index);
                        }}
                        className={`h-2 rounded-full transition-all ${
                          index === spotlight
                            ? 'w-6 bg-surface-canvas'
                            : 'w-2 bg-surface-canvas/50 hover:bg-surface-canvas/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 p-space-lg lg:p-space-xl flex flex-col justify-between bg-surface-canvas">
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-primary">
                        <Icon name="verified" className="text-[18px]" />
                        <span className="font-caption text-caption font-semibold uppercase tracking-wider">
                          Partner Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-tertiary-container font-label-sm text-label-sm font-bold">
                        <Icon name="star" filled className="text-[16px] text-tertiary-container" />
                        {SPOTLIGHT_SLIDES[spotlight].rating}{' '}
                        <span className="text-text-tertiary font-normal">{SPOTLIGHT_SLIDES[spotlight].reviews}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-text-secondary font-label-sm text-label-sm uppercase tracking-wide">
                        {SPOTLIGHT_SLIDES[spotlight].merchant}
                      </p>
                      <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mt-1">
                        {SPOTLIGHT_SLIDES[spotlight].title}
                      </h2>
                      <p className="font-body-md text-body-md text-text-secondary mt-2">
                        {SPOTLIGHT_SLIDES[spotlight].copy}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2">
                      {SPOTLIGHT_SLIDES[spotlight].features.map((feature) => (
                        <div
                          className="flex items-center gap-2 text-text-secondary font-label-sm text-label-sm"
                          key={feature.text}
                        >
                          <Icon name={feature.icon} className="text-primary text-[18px]" />
                          <span className={feature.error ? 'text-error font-medium' : undefined}>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-space-lg mt-space-md flex items-center justify-between gap-space-md">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading-lg text-heading-lg font-bold text-text-primary">
                          {SPOTLIGHT_SLIDES[spotlight].price}
                        </span>
                        <span className="font-body-md text-body-md text-text-tertiary line-through">
                          {SPOTLIGHT_SLIDES[spotlight].oldPrice}
                        </span>
                      </div>
                      <span className="text-caption text-caption text-badge-discount-text font-medium">
                        {SPOTLIGHT_SLIDES[spotlight].save}
                      </span>
                    </div>
                    <button
                      className="h-[52px] px-8 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-button-primary text-button-primary shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onClaim?.();
                      }}
                    >
                      <span>Claim Voucher</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm mb-space-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Deals Near You</h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-caption text-caption font-bold">
                      4.2km Radius
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                    Top-rated neighborhood vouchers ready for instant pickup or table reservation
                  </p>
                </div>
                <div className="flex items-center gap-space-md shrink-0">
                  <div className="hidden md:flex items-center bg-surface-subtle p-1 rounded-lg">
                    <button
                      className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary transition-colors"
                      title="Grid View"
                      type="button"
                      onClick={() => setView('grid')}
                    >
                      <Icon name="grid_view" className="text-[18px]" />
                    </button>
                    <button
                      className="p-1.5 rounded-md bg-surface-canvas text-primary shadow-sm transition-colors"
                      title="List View"
                      type="button"
                      onClick={() => setView('list')}
                    >
                      <Icon name="view_agenda" className="text-[18px]" />
                    </button>
                  </div>
                  <button
                    className="font-label-md text-label-md text-primary hover:text-primary-container font-semibold flex items-center gap-1 group"
                    type="button"
                    onClick={onOpenDeals}
                  >
                    See All Deals
                    <Icon name="chevron_right" className="text-[18px] transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {LIST_DEALS.map((deal) => (
                  <div
                    key={deal.title}
                    role="button"
                    tabIndex={0}
                    onClick={onOpenDeal}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenDeal();
                      }
                    }}
                    className="bg-surface-canvas rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${deal.image}')` }}
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold rounded-full">
                        {deal.discount}
                      </span>
                      {deal.timer ? (
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-surface-canvas font-caption text-caption flex items-center gap-1">
                          <Icon name="timer" className="text-[12px] text-tertiary-fixed" />
                          <span>{deal.timer}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="p-space-md flex-1 flex flex-col justify-between gap-space-sm">
                      <div>
                        <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                          <span className="flex items-center gap-0.5">
                            <Icon name="pin_drop" className="text-[14px]" />
                            {deal.meta}
                          </span>
                          <span className="flex items-center text-text-primary font-semibold">
                            <Icon name="star" filled className="text-tertiary-container text-[14px]" />
                            {deal.rating}
                          </span>
                        </div>
                        <h4 className="font-heading-sm text-heading-sm text-text-primary mt-1 line-clamp-1">
                          {deal.title}
                        </h4>
                        <p className="font-body-md text-body-md text-text-secondary mt-0.5 line-clamp-2">
                          {deal.copy}
                        </p>
                      </div>
                      <div className="pt-space-xs flex items-center justify-between mt-auto">
                        <div>
                          <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                            {deal.price}
                          </span>
                          <span className="font-caption text-caption text-text-tertiary line-through block">
                            {deal.oldPrice}
                          </span>
                        </div>
                        <button
                          className="h-9 px-3 bg-surface-tint-blue hover:bg-primary-container text-primary hover:text-on-primary font-label-sm text-label-sm font-semibold rounded-lg transition-all flex items-center gap-1"
                          type="button"
                        >
                          <span>View Deal</span>
                          <Icon name="add" className="text-[16px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="w-full bg-surface-subtle p-space-lg lg:p-space-xl rounded-2xl">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-sm">
                    <Icon name="local_fire_department" className="text-[20px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                      Trending Deals Right Now
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Claimed by more than 250 shoppers in Abuja today
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    aria-label="Previous trending deals"
                    className="w-8 h-8 rounded-full bg-surface-canvas hover:bg-surface-container-high flex items-center justify-center text-text-secondary transition-colors shadow-sm"
                    type="button"
                    onClick={() => scrollTrending(-320)}
                  >
                    <Icon name="chevron_left" className="text-[18px]" />
                  </button>
                  <button
                    aria-label="Next trending deals"
                    className="w-8 h-8 rounded-full bg-surface-canvas hover:bg-surface-container-high flex items-center justify-center text-text-secondary transition-colors shadow-sm"
                    type="button"
                    onClick={() => scrollTrending(320)}
                  >
                    <Icon name="chevron_right" className="text-[18px]" />
                  </button>
                </div>
              </div>
              <div
                ref={trendingRef}
                className="flex gap-space-md overflow-x-auto no-scrollbar scroll-smooth pb-2"
              >
                {TRENDING_DEALS.map((deal) => (
                  <div
                    key={deal.title}
                    role="button"
                    tabIndex={0}
                    onClick={onOpenDeal}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenDeal();
                      }
                    }}
                    className="min-w-[280px] sm:min-w-[340px] bg-surface-canvas rounded-xl p-space-md shadow-sm hover:shadow-md transition-all flex gap-3.5 items-center shrink-0 cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${deal.image}')` }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-error-container text-on-error-container inline-flex items-center gap-1">
                        <Icon name="local_fire_department" className="text-[13px]" />
                        {deal.claimed}
                      </span>
                      <h5 className="font-heading-sm text-heading-sm text-text-primary truncate mt-1">{deal.title}</h5>
                      <p className="font-caption text-caption text-text-secondary truncate">{deal.store}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-label-md text-label-md font-bold text-text-primary">{deal.price}</span>
                        <span className="text-caption text-badge-discount-text font-semibold">{deal.discount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
              <section className="lg:col-span-6 flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                      Businesses Around You
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Explore neighborhood spots with active member perks
                    </p>
                  </div>
                  <button className="font-label-sm text-label-sm text-primary font-semibold hover:underline" type="button">
                    Explore Map
                  </button>
                </div>
                <div className="flex flex-col gap-space-xs">
                  {LIST_BUSINESSES.map((business) => (
                    <div
                      key={business.name}
                      className="p-space-md bg-surface-canvas rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-space-md group cursor-pointer"
                    >
                      <div className="flex items-center gap-space-sm min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary font-bold font-heading-sm shrink-0">
                          {business.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-heading-sm text-heading-sm text-text-primary truncate">
                              {business.name}
                            </h5>
                            <Icon name="verified" className="text-primary text-[16px]" />
                          </div>
                          <div className="flex items-center gap-2 text-text-tertiary font-caption text-caption mt-0.5">
                            <span className="flex items-center text-text-primary font-medium">
                              <Icon name="star" filled className="text-tertiary-container text-[14px]" />
                              {business.rating}
                            </span>
                            <span>•</span>
                            <span>{business.area}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-xs shrink-0">
                        <span className="px-2.5 py-1 bg-surface-subtle text-primary font-label-sm text-label-sm font-semibold rounded-lg">
                          {business.deals}
                        </span>
                        <Icon name="chevron_right" className="text-text-tertiary group-hover:text-primary transition-colors text-[20px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="lg:col-span-6 flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                      Popular Near You
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Curated single-item vouchers to claim immediately
                    </p>
                  </div>
                  <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    Updated hourly
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {LIST_PRODUCTS.map((product) => (
                    <div
                      key={product.title}
                      className="bg-surface-canvas rounded-xl p-space-sm shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-36 w-full rounded-lg overflow-hidden">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${product.image}')` }}
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                          {product.badge}
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-col">
                        <h5 className="font-heading-sm text-heading-sm text-text-primary truncate">{product.title}</h5>
                        <p className="font-caption text-caption text-text-secondary">{product.store}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-label-md text-label-md font-bold text-text-primary">
                            {product.price}
                          </span>
                          <button className="px-2.5 py-1 bg-primary text-on-primary rounded-lg font-caption text-caption font-semibold shadow-sm hover:bg-primary-container transition-all">
                            Instant Voucher
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="w-full bg-surface-container-high rounded-2xl p-space-lg lg:p-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
                  <Icon name="storefront" className="text-[28px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                    Merchant Growth Network
                  </span>
                  <h4 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                    Own a local business in Abuja?
                  </h4>
                  <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                    Put your neighborhood deals on VEMTAP and welcome high-value repeat walk-ins.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-md w-full md:w-auto shrink-0 justify-end">
                <button
                  className="w-full md:w-auto h-[48px] px-6 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  type="button"
                  onClick={() => onNav('for-business')}
                >
                  <span>Set up in 3 minutes</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </button>
              </div>
            </section>
          </div>

          {toastElement}
        </DesktopPage>
        <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} />
      </>
    );
  }

  return (
    <>
      <DesktopPage activeNav="home" onNav={onNav} withFooter withHeader onOpenLocation={() => setLocationOpen(true)}>
        <div className="w-full px-margin py-space-xl max-w-7xl mx-auto flex flex-col gap-space-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="space-y-space-2xs">
              <div className="flex items-center gap-space-xs text-text-tertiary">
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-primary">
                  Neighborhood Pulse
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span className="font-caption text-caption text-text-secondary">42 Active Local Flash Deals</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight flex items-center gap-space-xs">
                Good evening
                <Icon name="waving_hand" className="text-[26px] text-tertiary-container" />
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Here is what is hot and redeemable in your immediate perimeter today.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md bg-surface-canvas p-space-sm rounded-2xl shadow-sm">
            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {GRID_CATEGORIES.map((label) => {
                const active = label === gridCategory;
                return (
                  <button
                    key={label}
                    className={`px-space-md py-space-xs rounded-full font-label-md text-label-md whitespace-nowrap transition-all ${
                      active
                        ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                        : 'bg-surface-subtle text-text-secondary font-medium hover:text-text-primary'
                    }`}
                    type="button"
                    onClick={() => {
                      setGridCategory(label);
                      showToast(`Filtered: ${label}`);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-md bg-inverse-surface text-on-primary cursor-pointer"
            onClick={onOpenFeatured}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px]">
              <div className="lg:col-span-7 relative min-h-[260px] lg:min-h-full overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${HERO_GRID_IMAGE}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-inverse-surface/40 to-inverse-surface" />
                <div className="absolute top-space-md left-space-md flex items-center gap-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-sm py-space-2xs rounded-full shadow-sm text-text-primary">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
                  <span className="font-caption text-caption font-semibold uppercase tracking-wider text-badge-discount-text">
                    Editor&apos;s Spotlight
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-space-xl flex flex-col justify-between z-10">
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-semibold text-secondary-fixed uppercase tracking-wider">
                      The Sky Lounge &amp; Grill • Apo Hills
                    </span>
                    <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                      50% OFF
                    </span>
                  </div>
                  <h2 className="font-heading-lg text-heading-lg font-bold text-on-primary tracking-tight leading-snug">
                    Chef&apos;s 5-Course Tasting Menu &amp; Wine Pairing
                  </h2>
                  <p className="font-body-md text-body-md text-text-tertiary">
                    Intimate dining experience featuring slow-roasted prime cuts, artisanal pastries, and rooftop
                    sunset views over Apo Valley.
                  </p>
                  <div className="flex items-baseline gap-space-sm pt-space-xs">
                    <span className="font-heading-lg text-heading-lg font-bold text-on-primary">₦24,500</span>
                    <span className="font-body-md text-body-md text-text-tertiary line-through">₦49,000</span>
                    <span className="font-caption text-caption text-secondary-fixed font-medium">Save ₦24,500</span>
                  </div>
                </div>

                <div className="pt-space-md flex flex-col sm:flex-row items-center gap-space-md">
                  <button
                    className="w-full sm:w-auto flex-1 h-[52px] bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs transition-all shadow-md active:scale-95"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClaim?.(() => showToast("Chef's Tasting Voucher reserved for 15 mins!"));
                    }}
                  >
                    <span>Claim Voucher</span>
                    <Icon name="bolt" className="text-[18px]" />
                  </button>
                  <div className="flex items-center gap-space-2xs text-text-tertiary">
                    <Icon name="timer" className="text-tertiary-fixed text-[18px]" />
                    <span className="font-caption text-caption font-medium">Only 4 vouchers remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Deals Near You</h2>
              <span className="hidden sm:inline-flex px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
                1.2km avg
              </span>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center bg-surface-subtle p-1 rounded-xl">
                <button
                  className="p-space-2xs rounded-lg bg-surface-canvas text-primary shadow-sm transition-all"
                  title="Grid Layout"
                  type="button"
                  onClick={() => setView('grid')}
                >
                  <Icon name="grid_view" className="text-[20px]" />
                </button>
                <button
                  className="p-space-2xs rounded-lg text-text-tertiary hover:text-text-primary transition-all"
                  title="List Layout"
                  type="button"
                  onClick={() => setView('list')}
                >
                  <Icon name="view_list" className="text-[20px]" />
                </button>
              </div>
              <button
                className="font-label-md text-label-md font-semibold text-primary hover:text-primary-container flex items-center gap-0.5 transition-colors"
                type="button"
                onClick={onOpenDeals}
              >
                <span>See All</span>
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
            {GRID_DEALS.map((deal, index) => (
              <div
                key={deal.title}
                role="button"
                tabIndex={0}
                onClick={onOpenDeal}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenDeal();
                  }
                }}
                className="group relative bg-surface-canvas rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-surface-container-low">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundImage: `url('${deal.image}')` }}
                    />
                    <span
                      className={`absolute top-space-sm left-space-sm px-space-xs py-0.5 rounded-full font-caption text-caption font-bold shadow-sm ${deal.discountClass}`}
                    >
                      {deal.discount}
                    </span>
                    <button
                      aria-label="Save Deal"
                      className={`absolute top-space-sm right-space-sm w-8 h-8 rounded-full bg-surface-canvas/90 backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
                        liked[index] ? 'text-error' : 'text-text-secondary hover:text-error'
                      }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleLike(index);
                      }}
                    >
                      <Icon name="favorite" filled={Boolean(liked[index])} className="text-[18px]" />
                    </button>
                    <div className="absolute bottom-space-2xs left-space-sm px-space-xs py-0.5 rounded-md bg-inverse-surface/80 backdrop-blur-sm text-on-primary font-caption text-caption flex items-center gap-1">
                      <Icon name="near_me" className="text-[14px]" />
                      <span>{deal.distance}</span>
                    </div>
                  </div>
                  <div className="p-space-md space-y-space-2xs">
                    <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                      <span>{deal.store}</span>
                      <span className="flex items-center gap-0.5 text-text-primary font-medium">
                        <Icon name="star" filled className="text-tertiary-container text-[14px]" />
                        {deal.rating}
                      </span>
                    </div>
                    <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary truncate">
                      {deal.title}
                    </h3>
                    <p className="font-caption text-caption text-text-secondary line-clamp-1">{deal.copy}</p>
                  </div>
                </div>
                <div className="p-space-md pt-0 flex items-center justify-between gap-space-sm">
                  <div>
                    <div className="font-heading-sm text-heading-sm font-bold text-text-primary">{deal.price}</div>
                    <div className="font-caption text-caption text-text-tertiary line-through">{deal.oldPrice}</div>
                  </div>
                  <button
                    className="h-10 px-space-md rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm active:scale-95 flex items-center justify-center"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClaim?.(() => showToast(deal.claim));
                    }}
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-space-md pt-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="local_fire_department" className="text-tertiary-container text-[24px]" />
                <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Trending Deals</h2>
                <span className="text-text-tertiary font-caption text-caption ml-2">High demand right now</span>
              </div>
              <span className="font-label-sm text-label-sm text-text-secondary hidden sm:inline">
                Updated 12 mins ago
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {GRID_TRENDING.map((deal) => (
                <div
                  key={deal.title}
                  role="button"
                  tabIndex={0}
                  onClick={onOpenDeal}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenDeal();
                    }
                  }}
                  className="bg-surface-canvas rounded-2xl p-space-md flex flex-col sm:flex-row items-center gap-space-md shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="relative w-full sm:w-44 h-36 shrink-0 rounded-xl overflow-hidden bg-surface-container-low">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${deal.image}')` }}
                    />
                    <span className="absolute top-2 left-2 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                      {deal.discount}
                    </span>
                  </div>
                  <div className="flex-1 w-full space-y-space-2xs">
                    <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                      <span>{deal.store}</span>
                      <span className="text-tertiary-container font-semibold">{deal.rank}</span>
                    </div>
                    <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary">{deal.title}</h3>
                    <p className="font-body-md text-body-md text-text-secondary line-clamp-1">{deal.copy}</p>
                    <div className="flex items-center justify-between pt-space-xs">
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{deal.price}</span>
                        <span className="font-caption text-caption text-text-tertiary line-through">
                          {deal.oldPrice}
                        </span>
                      </div>
                      <button
                        className="px-space-md py-space-xs rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-colors"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onClaim?.(() => showToast(deal.claim));
                        }}
                      >
                        Claim Deal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl pt-space-lg">
            <div className="lg:col-span-7 space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="space-y-space-2xs">
                  <h2 className="font-heading-md text-heading-md font-bold text-text-primary">
                    Businesses Around You
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Directly verified neighborhood storefronts with tap redemption
                  </p>
                </div>
                <button className="font-label-sm text-label-sm font-semibold text-primary" type="button">
                  Explore All
                </button>
              </div>
              <div className="space-y-space-sm">
                {GRID_BUSINESSES.map((business) => (
                  <div
                    key={business.name}
                    className="bg-surface-canvas rounded-2xl p-space-md flex items-center justify-between gap-space-md shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-space-md">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-heading-sm font-bold">
                        {business.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-space-2xs">
                          <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                            {business.name}
                          </h4>
                          <Icon name="verified" filled className="text-[16px] text-primary" />
                        </div>
                        <p className="font-caption text-caption text-text-secondary">{business.copy}</p>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-text-tertiary mt-0.5">
                          <span className="text-badge-discount-text font-medium">{business.status}</span>
                          <span>•</span>
                          <span>{business.area}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="px-space-sm py-space-xs rounded-xl bg-surface-subtle hover:bg-surface-tint-blue text-text-primary hover:text-primary font-label-md text-label-md font-semibold transition-colors shrink-0"
                      type="button"
                    >
                      View Store
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="space-y-space-2xs">
                  <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Popular Near You</h2>
                  <p className="font-caption text-caption text-text-secondary">Neighborhood activity cluster map</p>
                </div>
                <span className="font-caption text-caption bg-surface-tint-blue text-primary px-space-xs py-0.5 rounded-full font-semibold">
                  Live GPS
                </span>
              </div>
              <div className="bg-surface-canvas rounded-2xl overflow-hidden shadow-sm p-space-sm space-y-space-sm">
                <div
                  className="w-full h-56 rounded-xl bg-cover bg-center relative overflow-hidden"
                  style={{ backgroundImage: `url('${GRID_MAP_IMAGE}')` }}
                >
                  <div className="absolute inset-0 bg-primary/10" />
                  <div className="absolute top-1/3 left-1/4 bg-primary text-on-primary px-2 py-1 rounded-full text-caption font-semibold shadow-md flex items-center gap-1 scale-90">
                    <Icon name="restaurant" className="text-[14px]" />
                    <span>Urban Grill</span>
                  </div>
                  <div className="absolute bottom-1/3 right-1/4 bg-tertiary-container text-on-tertiary px-2 py-1 rounded-full text-caption font-semibold shadow-md flex items-center gap-1 scale-90">
                    <Icon name="shopping_bag" className="text-[14px]" />
                    <span>Sole District</span>
                  </div>
                </div>
                <div className="p-space-xs flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-text-primary">
                      Apo Legislative Quarters • Zone B
                    </p>
                    <p className="font-caption text-caption text-text-tertiary">
                      14 partner merchants actively redeeming today
                    </p>
                  </div>
                  <button
                    className="h-9 px-space-sm bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold rounded-xl hover:bg-secondary-fixed transition-colors"
                    type="button"
                  >
                    Expand Map
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full rounded-2xl bg-surface-tint-blue p-space-xl overflow-hidden shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="space-y-space-xs max-w-xl">
                <span className="font-caption text-caption font-bold uppercase tracking-wider text-primary">
                  VEMTAP for Business
                </span>
                <h3 className="font-heading-md text-heading-md font-bold text-text-primary">
                  Own a business in Apo or around Abuja?
                </h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  Publish flash offers, convert nearby walk-in foot traffic, and build lifetime repeat customers with
                  zero setup fee.
                </p>
              </div>
              <div className="flex items-center gap-space-md shrink-0">
                <button
                  className="h-[52px] px-space-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center gap-space-xs transition-all shadow-md active:scale-95"
                  type="button"
                  onClick={() => onNav('for-business')}
                >
                  <span>Set Up Your Store</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-primary-fixed opacity-40 pointer-events-none" />
          </div>
        </div>

        {toastElement}
      </DesktopPage>
      <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}
