export type ServiceCatalogChip = 'all' | 'published' | 'deals' | 'low' | 'walkin' | 'booking' | 'draft';

export interface ServiceCatalogRow {
  id: string;
  name: string;
  image: string;
  alt: string;
  verified?: boolean;
  draft?: boolean;
  hidden?: boolean;
  sku: string;
  sub: string;
  category: string;
  categoryIcon: string;
  price: string;
  was?: string;
  dealBadge?: string;
  priceNote?: string;
  priceChip?: string;
  priceSubNote?: string;
  branchDot: 'ok' | 'secondary' | 'tertiary';
  branchLabel: string;
  branchNote: string;
  stock: {
    tone: 'ok' | 'error' | 'off';
    label: string;
    units?: string;
    unitsTone?: 'default' | 'error';
    bar?: number;
    barTone?: 'ok' | 'error';
    note?: string;
  };
  sync: boolean;
  filters: ServiceCatalogChip[];
}

export const INITIAL_SERVICES_ROWS: ServiceCatalogRow[] = [
  {
    id: 's1',
    name: 'Moroccan Hammam & Body Glow Polish',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4wRhk7Z2awcljAxG1LjsDB3N2bAN7rQlDkEXDILlYF6i09D_DE0_JDmPFddvIXLKfZ-TtuSypTz0Kl3jUy7knUpU3HB4NuSb137foMDpgotXoiK7w3GVbU1FRlvDkCRSfNt7lLHtinSDkQaVQwt40lHDAj3DUxzf9tBWYtOf7qlTY-_mE9_3gDNIH9wVJF72-OJb0k0sqg-vLThSLsh7dq90yBqvw9fzIB1gXV-Fo2ZXSueR6oLefog',
    alt: 'Luxury aesthetic spa suite with aromatic bath, warm candlelight and natural stone therapy.',
    verified: true,
    sku: 'VG-SRV-01',
    sub: '75 min session',
    category: 'Spa & Wellness',
    categoryIcon: 'spa',
    price: '₦28,000',
    was: '₦35,000',
    dealBadge: '20% Off Perk',
    branchDot: 'ok',
    branchLabel: 'All 3 Branches',
    branchNote: 'Private Suites Available',
    stock: { tone: 'ok', label: 'Slots Open Today', units: '6 slots available', bar: 75, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'deals', 'booking'],
  },
  {
    id: 's2',
    name: 'Aromatherapy Deep Muscle Release',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2k-0GygPR7thrr6kQT5yTqoGDw0NcxF2dP0AlXRwce_9v75rvKjTFCOII2nYkQknciVnh52IMyXZtpFEzCOC6Sc0ZFQf8bwDaVJM2likf3N9H6Yf4CtRNeAYa6jwXLogctOB85hy8oxyDnz-IvnlOo7GjU_Ij8kfKJBzE9Lqhpjxks9aQ7vHEEYWcFEkDqE1E9UzAJhRl3UfANQ6pD0rmV-2EbDY3S2bIgoQ14Il52tS12xywmcy8cw',
    alt: 'Therapeutic warm botanical oil massage session with organic aromatherapy essence.',
    sku: 'VG-SRV-02',
    sub: '60 min session',
    category: 'Massage & Therapy',
    categoryIcon: 'self_improvement',
    price: '₦22,500',
    priceNote: 'Therapist Choice',
    branchDot: 'ok',
    branchLabel: 'Wuse & Maitama Only',
    branchNote: '2 branches active',
    stock: { tone: 'ok', label: 'Available', units: '9 slots open', bar: 60, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'booking'],
  },
  {
    id: 's3',
    name: 'Signature HydraFacial & Collagen Boost',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6BaZG7YzMbQArQWnt4edHnV9aCqK3a7xIIh-c8OV4tFJBToZ7tcF2Nlpag653DPDvv1YwAEFvyZWLEWjhh3JKXPU_39La5FCCObsJ2bXVvYHYwRfdfbXPyrgvSgRX4XxMhc27qVEA_iTG43lTtzd34YcQozjDBHcuV7C7GWsm1WeMhPRtYcC2-I3NREV_8QfVRodpcjS7DvAGEn1vrjQohXldZ8Ghr28n4UXThhCL24s-z5spmv5Wbg',
    alt: 'Dermatological medical-grade facial rejuvenation treatment with ultrasonic infusion.',
    sku: 'VG-SRV-03',
    sub: '45 min session',
    category: 'Skin & Aesthetics',
    categoryIcon: 'face',
    price: '₦35,000',
    priceNote: 'Includes LED Light Therapy',
    branchDot: 'ok',
    branchLabel: 'All 3 Branches',
    branchNote: 'Certified Aesthetician',
    stock: { tone: 'ok', label: 'Available', units: '4 slots left', bar: 40, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'low', 'booking'],
  },
  {
    id: 's4',
    name: 'Executive Precision Haircut & Beard Sculpt',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO6jJ9p4hR6rNGDGRINEHScNzfF8QX9958juImpMv7docBzJhIFFTSv0EqqohPlk21qedzh0yj6VoV4ENinMd8PtWdjbgLvTNyW6DzMNzVWBBdNwnHXR5xFauu5gHS1bVOzDmta7grAM4POxOXeEhzPSB90eU3jwqP8X35nF3AyPhKakI43tDrWub1fzx-gNhATtVwdkcjO3Hjz7arXt2eY8pvnSwKjc_HdpZEuUQH_y3nRojTdPeUQg',
    alt: 'Gentleman luxury grooming salon session with hot towel and beard oil balm.',
    sku: 'VG-SRV-04',
    sub: '40 min session',
    category: 'Grooming & Barber',
    categoryIcon: 'content_cut',
    price: '₦8,500',
    priceChip: 'Hot Towel Incl.',
    branchDot: 'ok',
    branchLabel: 'All Branches',
    branchNote: 'Walk-ins & Bookings',
    stock: { tone: 'ok', label: 'Walk-in & Bookings', units: 'Barbers on Duty', bar: 85, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'walkin', 'booking'],
  },
  {
    id: 's5',
    name: 'Russian Manicure & Gel Polish Duo',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC6trtXFp0MMJwWku9jLYDwdIp28fGzHTmDO0RUE47jOl9iydBvF7jC1uRok91vQ_a6YHaxw4BDUNnwjZjepIJqde7592zFopV-N30aLGLAkzyvljtnJ1fLl5Pxy_BHumGgYbahvqugs4Q1hW9TTACnFpjlk5pxuNHrRFbxC07olPXnXlN-PrXlK9_FwVnZsQcJzb-TwkpEm5q383Eftusf4vv5jvGGhsBKrpbEAYulvhhXJvoaQRairA',
    alt: 'Impeccable clean e-file manicure with glossy long-lasting nude gel coat.',
    sku: 'VG-SRV-05',
    sub: '60 min session',
    category: 'Nails & Beauty',
    categoryIcon: 'brush',
    price: '₦15,000',
    branchDot: 'ok',
    branchLabel: 'All Branches',
    branchNote: 'Choice of 120+ Gel Colors',
    stock: { tone: 'ok', label: 'Slots Open', units: 'Nail Artists Available', bar: 90, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'booking'],
  },
  {
    id: 's6',
    name: 'Swedish Relaxation Full Body Massage',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcpJ2c7dvjW1lzsXtOkizM9pbVdGGWEiMmh1UyBM6Qyd_a7HJHN9pYrI0s4OC7t1D52fmKiwCl0_EW9Qugz_jyIIIXo0L3JfccsRlSlOmwgv2C6MkI2vnSFj1ji-q5FQ6Yqs8YUeIiIe1jQ5hpZL4naxtfledRh2j3Nq1C5E6wUF9iHI6e5wVcRvSUF_gX7hELTdOD8VEpNtx8S93rNUj1Z-0YH06xP2fKgi9-dccpqRQVrf3449_Eig',
    alt: 'Gentle long stroke swedish therapeutic body session with heated calming stones.',
    draft: true,
    hidden: true,
    sku: 'VG-SRV-06',
    sub: '60 min session',
    category: 'Massage & Therapy',
    categoryIcon: 'spa',
    price: '₦18,000',
    branchDot: 'tertiary',
    branchLabel: 'Maitama Flagship Only',
    branchNote: 'Draft launch scheduled',
    stock: { tone: 'off', label: 'Unpublished Draft', note: 'Configuring room schedules' },
    sync: false,
    filters: ['all', 'draft'],
  },
  {
    id: 's7',
    name: "Private Dining Chef's Tasting Table",
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBK_slyqEKmoMHQv65X7-eOKK_ujhykbDdwUcHM6ib2Tsj-XFJ0WILR2haDhWpGBi8b7YvOPdW-fjSkASAjgbY8iuzGsvgnwudkPShjKe_5EhN16JvEvAf-S8nTKFUSpISywUH4vH51NbVqU4UdHoW6JrFCw1Uzfv2BZnIjPCOcOimLCN4yldFgatRMdo0II_RKILMvHeFE5WKsgnc5bucGvOX0elg-DWNEO1YxOwHosgYLvNr3bGU0Yw',
    alt: 'Exclusive fine dining chef tasting table setting in an upscale restaurant with artisan earthenware plates.',
    sku: 'VG-SRV-07',
    sub: '2.5 hour experience',
    category: 'Private Dining & Experiences',
    categoryIcon: 'table_restaurant',
    price: '₦45,000',
    priceNote: 'Per Guest • Min 4 Guests',
    dealBadge: 'Chef Selection',
    branchDot: 'ok',
    branchLabel: 'Wuse Flagship Only',
    branchNote: 'Sommelier Pairings Included',
    stock: { tone: 'ok', label: 'Booking Required', units: '2 tables / night', bar: 80, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'deals', 'booking'],
  },
];

const SERVICES_STORAGE_KEY = 'vemtap_business_services_rows';

export function getStoredServices(): ServiceCatalogRow[] {
  if (typeof window === 'undefined') return INITIAL_SERVICES_ROWS;
  try {
    const raw = window.localStorage.getItem(SERVICES_STORAGE_KEY);
    if (!raw) return INITIAL_SERVICES_ROWS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return INITIAL_SERVICES_ROWS;
  } catch {
    return INITIAL_SERVICES_ROWS;
  }
}

export function saveStoredServices(rows: ServiceCatalogRow[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // ignore quota error
  }
}
