import { SPA_BUSINESS } from './businessData';

export type SpaSectionKey = 'hair' | 'facials' | 'massage' | 'nails';

export interface SpaCatalogueService {
  id: number;
  slug: string;
  name: string;
  desc: string;
  price: number;
  time: number;
  dealBadge?: string;
  claimedTag?: string;
  was?: number;
  image: string;
  imageAlt: string;
  icon: string;
  section: SpaSectionKey;
  categoryLabel: string;
  steps?: { title: string; desc: string }[];
}

export interface SpaServiceSection {
  emoji: string;
  title: string;
  count: string;
  services: SpaCatalogueService[];
}

export interface SpaAddon {
  id: string;
  name: string;
  desc: string;
  minutes: number;
  price: number;
}

export interface SpaTherapist {
  id: string;
  name: string;
  role: string;
  image?: string;
  hint?: string;
}

export interface SpaDay {
  id: string;
  weekday: string;
  day: number;
  monthLabel: string;
  note: string;
  noteTone: 'default' | 'discount' | 'tertiary';
  dateLong: string;
  dateShort: string;
}

export interface SpaTimeSlot {
  time: string;
  status: 'available' | 'booked';
}

export interface SpaTimePeriod {
  id: string;
  label: string;
  slots: SpaTimeSlot[];
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const SPA_SERVICE_SECTIONS: SpaServiceSection[] = [
  {
    emoji: '💇',
    title: 'Hair Styling & Grooming',
    count: '4 services',
    services: [
      {
        id: 1,
        slug: slugify('Signature Executive Cut & Scalp Wash'),
        name: 'Signature Executive Cut & Scalp Wash',
        desc: 'Includes consultation, precision cut, scalp detox shampoo, and blow style.',
        price: 8500,
        time: 45,
        icon: 'content_cut',
        section: 'hair',
        categoryLabel: 'Hair Grooming & Style',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDTKU-AxMRHT7DKG59bqQ4q6fFO7lluXVMkQ3QzPbz4l1JvyopQFjs7C5srQOW_ZPg8M20ktQ1jwbyo03LJYSLmaZ593pQxfY6VIH7U3dUWSzaWne2e_S7hwcMQH4CTQARmMDqlqclBnlmFHoy-edfEG3gyZ3B8dSIqINUCA6r9ML_2UXV0507NG-vTimWzvIY_7Ab9pGWnQRfYNA0VLDu5NY9UUGbbUOUs2wyqwddts2VxwhZQQx-qhg',
        imageAlt:
          'A modern luxury barbershop interior showing a client receiving a precision haircut and scalp treatment. High-end barber chair, warm ambient lighting, elegant styling mirrors with subtle blue accent lights, ultra-crisp grooming scissors in soft focus.',
      },
      {
        id: 2,
        slug: slugify('Silk Press & Deep Conditioning Therapy'),
        name: 'Silk Press & Deep Conditioning Therapy',
        desc: 'Thermal protection, botanical moisture mask & silk press finish.',
        price: 18000,
        time: 75,
        dealBadge: '10% OFF',
        claimedTag: 'VEMTAP Deal',
        was: 20000,
        icon: 'straighten',
        section: 'hair',
        categoryLabel: 'Hair Grooming & Style',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDex99fYp79O-ZAps4trALKtx8rjwER_FVRHYVhHgdd2tTtuU5RvCS4EyqcDJy6NwQul2EY2l4wpj9nWZtukojQOSxd5Ni11Z8pKT8jcJt1HEIDxm79veujYy1Biy4wysQRod_-HsR6QFZNMYJfB43s5m9JldsxkwOC72Wa4Qm4VlyJYUeB0mJIVpvZ3uwqj6Y39QZ7MVGlwDgtaFfJMgo9CI56lvst_IsnSfc9MZVVfFuKTP-rU2Bh9g',
        imageAlt:
          'Close up photo of an elegant African woman with flawless glossy silk press hair reflecting warm golden salon lights. Botanical hair serums, steam mist in the background, luxurious spa ambiance.',
      },
      {
        id: 3,
        slug: slugify('Beard Sculpting & Hot Towel Treatment'),
        name: 'Beard Sculpting & Hot Towel Treatment',
        desc: 'Razor fade line-up, organic essential oil steam compress.',
        price: 5000,
        time: 30,
        icon: 'face_retouching_natural',
        section: 'hair',
        categoryLabel: "Men's Grooming",
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBcnCYlffdPEU2h6vbI-n88g4F9ekT-wI_7tjfXg181Q9-CIKGP_9FWmS575bxrsaNJKkjIPWOhQbndXR0uGpNtgU5uCGJ7X4Xz0_AZYg2tcRfbRYTm3Pdw8HyoySLT1STxZ9AZmClmqdGUAL9Ek5QdgyEBYqArz05F2pr5H9pNOU5lWFrg_a_r4Pzrn1vIU1SU3r5XvFfGwDlBV5Uv_Bs8u_cAoF4jOH6uhIrO8gZBqbi_ISk93qZikA',
        imageAlt:
          'Barber hands applying a fragrant steaming hot towel to a well-groomed male client in a boutique upscale grooming lounge. Soft lighting, amber glass essential oil bottles, warm tones.',
      },
      {
        id: 11,
        slug: slugify('Scalp Rejuvenation & Hair Spa'),
        name: 'Scalp Rejuvenation & Hair Spa',
        desc: 'Micro-mist ozone steam, clarifying root peel, and raw shea-infused follicle strengthening treatment.',
        price: 14000,
        time: 50,
        icon: 'shower',
        section: 'hair',
        categoryLabel: 'Hair Styling & Spa',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDG6p6G0Snml4t0VCF3HH7ncXozCaV28XBPukgi8J_2CqnItyafLbfq8Rd6rPmH6P06I0xmhVpQLBbitbTCCzZEoPRMb-gg4uFabUsKpidcJb2_EguIEmoyuCqreuWm1YvUA5nWxLvRGjuFGUtAXUVHja1sSF-sKUMBJDt39TXeKWMvbm7IwEHYddvL985TaO7WE61EQ31oetDX2K_U0pco1MyD1e-uOuIGv5t4QCT9',
        imageAlt:
          'Organic hair treatment spa ritual showing rich shea and argan butter mask application, warm mist hair steamer hood, and soothing scalp massage in boutique salon.',
      },
    ],
  },
  {
    emoji: '✨',
    title: 'Facials & Aesthetic Skin Care',
    count: '3 services',
    services: [
      {
        id: 4,
        slug: slugify('Deep Hydration Radiance Facial'),
        name: 'Deep Hydration Radiance Facial',
        desc: 'Hyaluronic acid infusion, ultrasonic pore extraction, lymphatic drainage.',
        price: 16000,
        time: 60,
        icon: 'auto_awesome',
        section: 'facials',
        categoryLabel: 'Aesthetic Skin Care',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC0blvjw809gZBGSW2dCZjFZ-vLT2HIa42Mzmq5ZL0Kbu6ZEwI9ixTmPdgaqUXg5C900aFgoKCQHJGorsgzJhlRhVeCrVr_4xg04D8IOzNrzZPeneHz2nYZ1ZrgnwY7TcfWrOwrH9_dGF_QSzhydSMhXZ6PdLrgyIWa7CZTmzfwFmAfGIMg0wT_D4ulNkGW57A0JtDm3pUi-4M_PXpucDbmGuMSF1wzW8FMSK8CyiBazMWUksGwVcXPPw',
        imageAlt:
          'A tranquil medical spa treatment room with an aesthetician applying an ultrasonic skin serum infusion to a woman lying down peacefully with white headwrap and botanical face mask.',
        steps: [
          {
            title: 'Deep pore ultrasonic cleansing',
            desc: 'Purifying wash paired with soothing warm botanical steam.',
          },
          {
            title: 'Gentle diamond-tip micro-exfoliation',
            desc: 'Buffs away dead cells to prep the dermal layer for nutrients.',
          },
          {
            title: 'Hyaluronic infusion & cryo therapy',
            desc: 'Cold-hammer lock-in seals moisture and tightens pores instantly.',
          },
          {
            title: 'Lymphatic pressure-point massage',
            desc: 'Focused neck and shoulder release to detox and de-stress.',
          },
          {
            title: 'Custom collagen sheet & SPF finish',
            desc: 'Shields against UV and locks in an unmistakable dewy glow.',
          },
        ],
      },
      {
        id: 5,
        slug: slugify('Weekend Glow Microdermabrasion'),
        name: 'Weekend Glow Microdermabrasion',
        desc: 'Diamond-tip exfoliation, LED light therapy.',
        price: 22000,
        time: 50,
        icon: 'auto_awesome',
        section: 'facials',
        categoryLabel: 'Aesthetic Skin Care',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAFNkzw2ui4pDyZwmx5Gj1Sqy_fImpZgmsNK7238ERl_NZsMZZhxSIkhaDm8y90O5SOWkmrJHcvTITELaqyq7lqH0cPE91hJ5H1sKdf1TdDBEO--PqhaQV1IVMQhezTP0WyUcQd-hqm1BKtXCJuObiKimfpANttkJHt6YzUqE7-vasc14GlWMKWWqDovVmP_N8872Pm4ZOPHtPoWWy2GbFZMd98DAS8Qsoav0sZRMsE3TS6CL4zDEo2-g',
        imageAlt:
          'Professional clinical skincare therapy showing gentle diamond-tip microdermabrasion device in soft blue aesthetic lighting with crystal glassware and clean minimalist spa atmosphere.',
      },
      {
        id: 12,
        slug: slugify('Weekend Glow Facial & Sauna Combo'),
        name: 'Weekend Glow Facial & Sauna Combo',
        desc: 'Full radiance facial combined with private cedar infrared sauna detox & antioxidant tea ritual.',
        price: 18500,
        time: 75,
        dealBadge: '20% OFF',
        claimedTag: 'VEMTAP Deal',
        was: 25000,
        icon: 'stars',
        section: 'facials',
        categoryLabel: 'Aesthetic Skin Care',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAd50OjE2br6Jf3uTsKJOdlZhSbVvSSbMRM-zSeGqSwmpLKQmB4Fu_2fPWjvcpcmrCjVt62QDjeoSptqmT5j3WCVQUNiGJ8z5Jwrna9mmCYLxtEE_Xx9qspVIabEgxvVyWURaljPNpNOytKsrNgE9EM64TigtYYPQ42tiefSv6WWwjlmeTaeeOFfXYUWelj_ma16Ekec-RWref9qG0ZA9d0w8fyJfEJT5N3WWa3C2a6',
        imageAlt:
          'Serene spa setting showcasing holistic glow ritual setup, herbal tea glasses, face serum ampoules, and cedar sauna towel suite in Abuja.',
      },
    ],
  },
  {
    emoji: '💆',
    title: 'Therapeutic Massage & Wellness',
    count: '3 services',
    services: [
      {
        id: 6,
        slug: slugify('Swedish Stress Relief Massage'),
        name: 'Swedish Stress Relief Massage',
        desc: 'Classic light-to-medium tension release with lavender oils.',
        price: 18500,
        time: 60,
        dealBadge: '25% OFF',
        claimedTag: 'Claimed Voucher',
        was: 25000,
        icon: 'self_improvement',
        section: 'massage',
        categoryLabel: 'Massage & Body Rituals',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAZi9BT0EdwdZ3JBs501JUXqV8g14Sko7R_LUVgUGk5YYadpJTtLJrLvCNCTGmfzc0YRkWq-RBeF981wFAXGguHKW0FJJXIR4g2luNo6tnk5CxKYCyZGAK5lPNJ2pB5gxR47xMHRKBZUFkG_0gxR9pVERz8rsGmkY5BQOKlCugIl0H9QLhusF33swMzTew7V7XcLcYHTo2wIzDvXdeh1bYyHvNH-rkyEXxx9lIwWK8HOYz6QbPn3eyJKw',
        imageAlt:
          'Calm massage sanctuary featuring stacked zen river stones, dried lavender sprigs, candlelight reflections, and soft bamboo linen in an ultra-luxurious wellness environment.',
      },
      {
        id: 7,
        slug: slugify('Deep Tissue Hot Stone Therapy'),
        name: 'Deep Tissue Hot Stone Therapy',
        desc: 'Heated basalt stones, intense muscle knot release.',
        price: 25000,
        time: 75,
        icon: 'spa',
        section: 'massage',
        categoryLabel: 'Massage & Body Rituals',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBPL6AvYPBm_0Hr_9TFNii9IXNZcgE0bIglDybCvcYsJ2Jzm7TBcY5tckwGn2juY6OjhFZYuLOth6VULtLmRv7obdwK-IgrTWQBVcbBUrDcznWv9vjkfzOaOa1rHNMc7PS6o6jmJQUPaF1Ea9S70zB0g_IXxcByIJ9CGIfadVPfdBlYA5ay5t17HT7auWImuzy9B40RaHD1krWiVJsZ_5XNSQIvUlM9sPvqINf5QvWBSwwmp1X0Ih-UIg',
        imageAlt:
          'Polished black volcanic basalt stones placed neatly along the spine of a client covered with crisp white spa towel, aromatic oil drops dispersing nearby in serene dim light.',
      },
      {
        id: 10,
        slug: slugify('Infrared Cedar Sauna & Detox'),
        name: 'Infrared Cedar Sauna & Detox',
        desc: 'Deep cellular heat therapy for metabolic purification, immunity stimulation, and deep pore release.',
        price: 12000,
        time: 45,
        icon: 'hot_tub',
        section: 'massage',
        categoryLabel: 'Wellness Sauna & Steam',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCmn5-fRvZ_TZBJ6Y7VYmyOb1Y44rF57qbcXg-i43zikX1Vq9n5G0dzHTQAtti5mC5wxjCFSnq-S7Ifl1uMbqyjnHHjmUqgL1P8Gmd5ISqhIVZrtCGefOl_zeXvbql9yC_m8GuozYFNM-FnmtRS-oYQ8KEs-j4s7qRU2D7C5cxk4dVq-ZWpcpOwi8TqtkOPPJZPGCmFz--MOypFvsNK9S-_vLLqVILtxBv3WdGQlYLR',
        imageAlt:
          'Infrared cedar sauna cabin interior with glowing pink Himalayan salt brick wall, steam mist diffusion, and smooth polished wood backrests.',
      },
    ],
  },
  {
    emoji: '💅',
    title: 'Nail Care & Spa Pedicure',
    count: '2 services',
    services: [
      {
        id: 8,
        slug: slugify('Deluxe Gel Manicure & Hand Therapy'),
        name: 'Deluxe Gel Manicure & Hand Therapy',
        desc: 'Cuticle care, exfoliating scrub, long-lasting gel coat.',
        price: 9000,
        time: 45,
        icon: 'brush',
        section: 'nails',
        categoryLabel: 'Nail Bar & Hand Therapy',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgfKsQmN4EEq7U8C0hJ3Qm4t_NVw0_FAiqQ_Vu3ggJGR7B6959AdKQMbFh_RXMjjEdYGHM_D1Sc2kTI58lu7_AIIdPEizBY7ntKMDeHf5ZZc8Xb1QJyy2qdKNtewdXZ60gbFLux-P6ikSwvWorwrSIuq6lycA1NySu3KZ5eCOSwrAXHAk-TMTBJAiYzFxGmQjsBLPaWxY1IZlEvOu5t4YN9Cta_hViw-qxfm1_KQvw0-5On3omlCG-A',
        imageAlt:
          'Modern nail salon counter with pastel polish bottles, precision manicure tools, a hand resting on a soft velvet cushion with freshly applied glossy neutral gel manicure.',
        steps: [
          {
            title: 'Citrus soak & cuticle nourishment',
            desc: 'Warm botanical soak softens skin while cuticles are gently pushed back.',
          },
          {
            title: 'Sugar scrub hand exfoliation',
            desc: 'Organic scrub buffs away dryness and boosts circulation.',
          },
          {
            title: 'Shape, buff & bio-gel application',
            desc: 'Precision shaping followed by long-wear gel colour of your choice.',
          },
          {
            title: 'Warm towel wrap & massage',
            desc: 'Paraffin-inspired wrap with pressure-point hand massage to finish.',
          },
        ],
      },
      {
        id: 9,
        slug: slugify('Botanical Spa Pedicure & Foot Scrub'),
        name: 'Botanical Spa Pedicure & Foot Scrub',
        desc: 'Herbal soak, calloused heel smoothing, reflexology massage.',
        price: 11000,
        time: 60,
        icon: 'spa',
        section: 'nails',
        categoryLabel: 'Nail Bar & Pedicure',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ1L5kTpdVOvN7k7AlmLH517hf8kFV0nIe0ZgP-empIhMuqoRVdCWmDjqVvH8d_pa-zsvIz4BVaVhvCRqe8BL4xPuctfMGCCx1lfBS-MgnXyEKQowteB4Q9CrUOhn-Q8rH-_QWhBqzR6ochqjjeux3xriVrQ6WvPwDcgA5HFrDZC2KdYL3MGHedQrjQP611vJHV7I_vdCw8IWi-kGWDaw6eE-xJRCXq6vOYJBMld3XV_oUsHWgfd4gHQ',
        imageAlt:
          'Luxury pedicure basin with warm bubbling water filled with fresh pink rose petals, citrus slices, and botanical leaves in an upscale day spa with marble finishes.',
      },
    ],
  },
];

export const SPA_SERVICE_LIST: SpaCatalogueService[] = SPA_SERVICE_SECTIONS.flatMap(
  (section) => section.services,
);

export const SPA_CATALOGUE_CHIPS = [
  'All Services (34)',
  '💇 Hair & Styling',
  '✨ Facials & Skin',
  '💆 Massage & Body',
  '💅 Nails & Pedicure',
  "💈 Men's Grooming",
];

const GENERIC_STEPS = (service: SpaCatalogueService): { title: string; desc: string }[] => [
  { title: 'Consultation & intake', desc: `Brief assessment so the team can tailor the session to you.` },
  { title: 'Signature treatment protocol', desc: service.desc },
  { title: 'Finishing ritual & aftercare', desc: 'Soothing close-out with product recommendations and care notes.' },
];

export const serviceSteps = (service: SpaCatalogueService) => service.steps ?? GENERIC_STEPS(service);

export const SPA_ADDONS: SpaAddon[] = [
  {
    id: 'led-therapy',
    name: 'LED Light Therapy',
    desc: 'Reduces redness & accelerates collagen synthesis',
    minutes: 15,
    price: 4000,
  },
  {
    id: 'eye-lip-contour',
    name: 'Hydrating Eye & Lip Contour',
    desc: 'Plumps delicate lines and brightens dark eye zones',
    minutes: 15,
    price: 3000,
  },
  {
    id: 'scalp-massage',
    name: 'Aromatherapy Scalp Massage',
    desc: '15 mins organic lavender and rosemary tension release',
    minutes: 15,
    price: 3500,
  },
];

export const SPA_THERAPISTS: SpaTherapist[] = [
  { id: 'any', name: 'Any Available', role: 'Fastest Booking', hint: 'Fastest Booking' },
  {
    id: 'amara',
    name: 'Amara K.',
    role: 'Lead Aesthetician',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB18reJGUH9T_8snKmyIFtaIiMR49aB7Gs6wfA5dEb9Fpnsu6A0ookTH4jJfJWXYEw5bz48TZKmd-0rRZK1-Y_VT0LWzZ_Y3L9dwosl1W9-dPX6Ub5ujPFrNi5bXS65JikqIou7ph0fHjWeJlBv_JTTebWo030h46-fGrpw4U_4IrTeuJC3RUBXODEgJGbYb-JQsDWA6vOJhbXQ1Edn8UlCSif1yPTxm3fgaHDjAQxmvpBywNMQ-VvuuQ',
  },
  {
    id: 'chioma',
    name: 'Chioma B.',
    role: 'Skin Specialist',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9v2TFrdvKRXGGF85l0t6M-KKJxARbic0PG92BPLB1xFkWPvHnDe89TVbObbjmfq0r-kkKPquWgUB3fPjIvFvXYZVIKfSKRWc0THMA1m6Mt_U-vwBYwaw5cNrIEO4GgBBkimpit5C4XGHvMCi5fbuVdPtb_LvASV5sCtc_4gz33L4l0fiZVwRqKmpPF0LIzhboFcny_6W-0hMwzR-swsIFvEFJhtKhnmhAs9D74hu9qDO0JOfkVCtRcA',
  },
];

export const SPA_SPECIALIST_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAJdx-C6sRgqYAKPjcDbuq1lpPCD554SHn7RBIwhGUNOOvPU69FMKIeqbQ3vFwNG2ednHU_v4bV19YqUY5XyQFygxXA8D77gRFgNgIuoJcmRAByGUhJ2xvDZ4-Q4hwgiZXutTtcXfxEEq3cct1MIcX68MfiEdDtLqpG62wglhBp3d4q0ED5ZeaDtSFfAdGo_Asq8VL3YNQ49L_7no0ZWCoGYSfTlUEA9nuOaoRnwOiuZLPZ3nacOdDfSw';

export const SPA_DAYS: SpaDay[] = [
  {
    id: 'wed-16',
    weekday: 'Wed',
    day: 16,
    monthLabel: 'October 2024',
    note: 'Few left',
    noteTone: 'tertiary',
    dateLong: 'Wednesday, October 16, 2024',
    dateShort: 'Wed, Oct 16',
  },
  {
    id: 'thu-17',
    weekday: 'Thu',
    day: 17,
    monthLabel: 'October 2024',
    note: 'Selected',
    noteTone: 'default',
    dateLong: 'Thursday, October 17, 2024',
    dateShort: 'Thu, Oct 17',
  },
  {
    id: 'fri-18',
    weekday: 'Fri',
    day: 18,
    monthLabel: 'October 2024',
    note: 'Available',
    noteTone: 'discount',
    dateLong: 'Friday, October 18, 2024',
    dateShort: 'Fri, Oct 18',
  },
  {
    id: 'sat-19',
    weekday: 'Sat',
    day: 19,
    monthLabel: 'October 2024',
    note: '4 slots',
    noteTone: 'tertiary',
    dateLong: 'Saturday, October 19, 2024',
    dateShort: 'Sat, Oct 19',
  },
  {
    id: 'sun-20',
    weekday: 'Sun',
    day: 20,
    monthLabel: 'October 2024',
    note: '10A-8P',
    noteTone: 'default',
    dateLong: 'Sunday, October 20, 2024',
    dateShort: 'Sun, Oct 20',
  },
  {
    id: 'mon-21',
    weekday: 'Mon',
    day: 21,
    monthLabel: 'October 2024',
    note: 'Open',
    noteTone: 'discount',
    dateLong: 'Monday, October 21, 2024',
    dateShort: 'Mon, Oct 21',
  },
];

export const SPA_TIME_PERIODS: SpaTimePeriod[] = [
  {
    id: 'morning',
    label: 'Morning (9A - 12P)',
    slots: [
      { time: '9:30 AM', status: 'available' },
      { time: '10:15 AM', status: 'available' },
      { time: '11:00 AM', status: 'booked' },
      { time: '11:45 AM', status: 'available' },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon (12P - 4P)',
    slots: [
      { time: '12:30 PM', status: 'booked' },
      { time: '1:15 PM', status: 'available' },
      { time: '2:00 PM', status: 'available' },
      { time: '3:15 PM', status: 'available' },
      { time: '3:45 PM', status: 'available' },
    ],
  },
  {
    id: 'evening',
    label: 'Evening (4P - 8P)',
    slots: [
      { time: '4:15 PM', status: 'available' },
      { time: '4:45 PM', status: 'available' },
      { time: '5:30 PM', status: 'booked' },
      { time: '6:15 PM', status: 'available' },
      { time: '7:00 PM', status: 'available' },
    ],
  },
];

export const SPA_CLIENT = {
  name: 'Zainab Ahmed',
  phone: '+234 803 555 0192',
  email: 'zainab.ahmed@example.com',
};

export const SPA_VOUCHER_CODE = 'VT-SPA8821';
export const SPA_DEAL_RATE = 0.2;

export const SPA_MERCHANT = {
  name: 'Glow & Serenity Spa & Salon',
  address: 'Plot 14 Amazon Street, Maitama Heights, Abuja',
  shortLocation: 'Maitama Heights, Abuja',
  distance: '1.4 km',
  rating: '4.9',
  reviews: '96 reviews',
  phoneDisplay: '+234 801 555 0192',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBCEXttSehsmIpMSTYJrf_-okLk5MFXIAkGcpM35ACkc6ObYaDnwtbrE9Lv3oHUV1Ijm2fk_F_ihKkCctOypuZxVl_PLWVERn2EoKgfqqE7TojdvR2DUHJFbbIzvvnF3OOYyv9AGu5qsJ-3qeEnXGs27oPodI-ab7dXcfJzQMtIAkCkhyugbMW9jNEr9_QCU-yjKGCJIhsK2SORuNoTOPLLWftCgwAGvQprrJPkDFd-Q1yt04na_riNyg',
  imageAlt:
    'An upscale, tranquil luxury spa and wellness sanctuary reception lounge in Abuja with polished white marble counters, subtle warm ambient lighting, lush green indoor plants, and pristine minimalist design.',
  interiorImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCtXm_yeAlXT2VYyAS87t8ZiU5QQ8BdUxIpQ7KyPoL9JXpcYG3Wty6S6OoqKPw5Vat_rhlt4jvsasG75GdEwrkiMsOYmnOoz-YCU6_g1iZIXOWQnTQgZu_cZv4V2cmlSved1zrTxxW808OQ6QB41j21JI5FCs-h9bqHt7Sua7BrQMzC7pnkxeIMzcVyh7Ich44OUhKOu88mDdQNtX0kgjR7ZujlpPu92cb8R2kcysm2AyqRxxuP_XG9wA',
  interiorAlt: 'A warm, luminous luxury day spa interior with minimalist wooden shelves holding organic oils and fresh towels.',
  facadeImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr5SV3CNApSCAIJ3kAhmaZVBjs-OQy1Yv-65iIlZamjAiE34wo6vYhi1YfjOheTF00uWz2QDWTk8jyb0StzFaf9-bxqB3cwzI06h8i821qeSFjkzYjIeWMCxlVn9yOb5gyb1yDL2ud9zl-NnUgD-QTmOQeoFcR4gHKOxYLNkLw-Tg8-SAwCYe6Imbcdd6-RNiINHtGXI6reAM2Kyg2SynPJNZ6ku_L4BIffzSeZ5i4JnJO9v2V8wDag',
  facadeAlt:
    'Serene minimalist architectural facade of Glow and Serenity luxury beauty clinic in Maitama Abuja with warm wood finishes, potted tropical palms, and ambient warm exterior lighting.',
};

export function findSpaService(key?: string | null): SpaCatalogueService | undefined {
  if (!key) return undefined;
  const needle = key.trim().toLowerCase();
  return (
    SPA_SERVICE_LIST.find((service) => service.slug === needle) ??
    SPA_SERVICE_LIST.find((service) => String(service.id) === needle) ??
    SPA_SERVICE_LIST.find((service) => service.name.toLowerCase() === needle)
  );
}

export function formatMinutes(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatSpaDuration(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export const spaServicePath = (service: SpaCatalogueService) =>
  `/business/${SPA_BUSINESS.slug}/services/${service.slug}`;
