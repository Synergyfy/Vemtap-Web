import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopSpaStorefrontScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onClaim?: (onClaimed?: () => void) => void;
}

export const CATEGORIES = [
  { key: 'all', label: 'All Services (22)' },
  { key: 'facials', label: 'Facials & Skin Therapy' },
  { key: 'massage', label: 'Massage & Body Rituals' },
  { key: 'nails', label: 'Nail Bar & Hand Therapy' },
  { key: 'hair', label: 'Hair Styling & Spa' },
  { key: 'sauna', label: 'Wellness Sauna & Steam' },
] as const;

export interface Service {
  title: string;
  category: (typeof CATEGORIES)[number]['key'];
  description: string;
  price: string;
  oldPrice?: string;
  duration: string;
  meta: { icon: string; label: string };
  badge?: { label: string; className: string };
  image: string;
  alt: string;
  highlight?: boolean;
  action?: string;
  actionClassName?: string;
}

export const SERVICES: Service[] = [
  {
    title: 'Deep Hydration Radiance Facial',
    category: 'facials',
    description: 'Ultrasonic exfoliation, hyaluronic infusion mask, and neck-shoulder pressure relief ritual.',
    price: '₦16,000',
    duration: '60 mins',
    meta: { icon: 'face_3', label: 'Lead Aesthetician Amara K.' },
    badge: { label: 'Bestseller', className: 'bg-badge-discount-bg text-badge-discount-text' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCefDsNU5FKDL231Q290eePDxeNAlREjfjHrj3-hxWpBzDjfXZKMGNMO6cP8E7jzWMCVSa4YQsQl6SoHrHQvvex9Tp5IVUf-DnBAzIklklxZ0p0dcLWwXU9oQJwgln-C3Bw1Bcawx9_ROpafj-7gfVlXGrWBBLdkZceqbtitAgzcBWmgnG4N-HQWAVnBsY4_gsn7tBOrYCvI1O__ZeV_23Y7LGeKTeh7oNTCcx5i2jP',
    alt: 'Close up aesthetic shot of woman receiving deep hydration facial mask with chilled glass cryo globes and soothing lavender essence in serene wellness spa Abuja.',
  },
  {
    title: 'Deluxe Gel Manicure & Hand Therapy',
    category: 'nails',
    description: 'Cuticle nourishment, citrus exfoliating polish, warm towel wrap, and long-wear bio-gel finish.',
    price: '₦9,000',
    duration: '45 mins',
    meta: { icon: 'pan_tool_alt', label: 'Botanical Scrub & Massage' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbxTQL4ACcdKJ1yPdkp2MArNDDnx9J5_BChsovCofPXJI2u-qWPg3Pj7v8G3OQ4CksNlv5zNiFEhgQGw-91zDF2orErbR_QotE0l6hw92fILjWFiQVUNYGr203JNfB3RGuxZE3ltzi1RQLZtMmVV-HEXNyXOaGxSMht-jJsnU4CH8W6hJvAlEqrBQ-tYSNla88XqCvaQlj9xWLJczkOODgzZZqDW8x5RAaS5Io67yS',
    alt: 'Deluxe gel manicure and hand therapy station with organic sugar scrubs, rosewater soak bowl, and glossy nude gel nail polish application in luxury Abuja spa.',
  },
  {
    title: 'Swedish Aromatherapy Full Body',
    category: 'massage',
    description: 'Gentle rhythmic gliding strokes to dissolve muscle fatigue and balance central nervous system tension.',
    price: '₦22,000',
    duration: '75 mins',
    meta: { icon: 'self_improvement', label: 'Essential Oil Blends' },
    badge: { label: 'Top Rated', className: 'bg-secondary-container text-on-secondary-fixed' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6GsfDWMkUuA1ecRVlHNbAbplKYcMDbXTiirXcNBBh65pFf20_1SaR0dbP8CpwcH1bYmpUO5KYqXcXO97vA4NpQcUa2Ca8nfg6vbOe82TGRpnfsH_NxryExsn8IvcszqRt7Q0MpAY6y8csBaf4LkRzD2m-vYsgXjGVBoyQtIGumz4zG0Ql5J8XkZHQB23dhxs4B-he32a-KWM8h3IXd4io9LYBxVO7RAMlysWtz1Rv',
    alt: 'Swedish aromatherapy full body massage in progress, smooth heated basalt stones, warm chamomile scented oil mist, tranquil dim room ambiance.',
  },
  {
    title: 'Infrared Cedar Sauna & Detox',
    category: 'sauna',
    description: 'Deep cellular heat therapy for metabolic purification, immunity stimulation, and deep pore release.',
    price: '₦12,000',
    duration: '45 mins',
    meta: { icon: 'heat', label: 'Himalayan Salt Bricks' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmn5-fRvZ_TZBJ6Y7VYmyOb1Y44rF57qbcXg-i43zikX1Vq9n5G0dzHTQAtti5mC5wxjCFSnq-S7Ifl1uMbqyjnHHjmUqgL1P8Gmd5ISqhIVZrtCGefOl_zeXvbql9yC_m8GuozYFNM-FnmtRS-oYQ8KEs-j4s7qRU2D7C5cxk4dVq-ZWpcpOwi8TqtkOPPJZPGCmFz--MOypFvsNK9S-_vLLqVILtxBv3WdGQlYLR',
    alt: 'Infrared cedar sauna cabin interior with glowing pink Himalayan salt brick wall, steam mist diffusion, and smooth polished wood backrests.',
  },
  {
    title: 'Weekend Glow Facial & Sauna Combo',
    category: 'facials',
    description: 'Full radiance facial combined with private cedar infrared sauna detox & antioxidant tea ritual.',
    price: '₦18,500',
    oldPrice: '₦25,000',
    duration: '75 mins',
    meta: { icon: 'stars', label: 'Curated Signature Combo' },
    badge: { label: '20% OFF Deal', className: 'bg-badge-discount-bg text-badge-discount-text shadow-sm' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAd50OjE2br6Jf3uTsKJOdlZhSbVvSSbMRM-zSeGqSwmpLKQmB4Fu_2fPWjvcpcmrCjVt62QDjeoSptqmT5j3WCVQUNiGJ8z5Jwrna9mmCYLxtEE_Xx9qspVIabEgxvVyWURaljPNpNOytKsrNgE9EM64TigtYYPQ42tiefSv6WWwjlmeTaeeOFfXYUWelj_ma16Ekec-RWref9qG0ZA9d0w8fyJfEJT5N3WWa3C2a6',
    alt: 'Serene spa setting showcasing holistic glow ritual setup, herbal tea glasses, face serum ampoules, and cedar sauna towel suite in Abuja.',
    highlight: true,
    action: 'Claim & Book',
    actionClassName: 'bg-tertiary-container text-on-tertiary-container hover:opacity-90',
  },
  {
    title: 'Scalp Rejuvenation & Hair Spa',
    category: 'hair',
    description: 'Micro-mist ozone steam, clarifying root peel, and raw shea-infused follicle strengthening treatment.',
    price: '₦14,000',
    duration: '50 mins',
    meta: { icon: 'shower', label: 'Pure Botanical Butters' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDG6p6G0Snml4t0VCF3HH7ncXozCaV28XBPukgi8J_2CqnItyafLbfq8Rd6rPmH6P06I0xmhVpQLBbitbTCCzZEoPRMb-gg4uFabUsKpidcJb2_EguIEmoyuCqreuWm1YvUA5nWxLvRGjuFGUtAXUVHja1sSF-sKUMBJDt39TXeKWMvbm7IwEHYddvL985TaO7WE61EQ31oetDX2K_U0pco1MyD1e-uOuIGv5t4QCT9',
    alt: 'Organic hair treatment spa ritual showing rich shea and argan butter mask application, warm mist hair steamer hood, and soothing scalp massage in boutique salon.',
  },
];

const SPECIALISTS = [
  {
    name: 'Amara K.',
    role: 'Lead Aesthetician • 8 yrs exp.',
    specialty: 'Specialty: Advanced Hydration & Peels',
    rating: '5.0',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMttmB85Iap1UkcAL2kVDV8jWielJxiBJHY9qnJ0fud2DCoZ3OqUaBEUHA_JbHnZr8V9j0RN21Yh1dnCbd6iZ2Brnb03jp8MdFa5fJaBqtzt5iuS8j1m2K7yLTeOTeGc_WUAUuB91cfam4s1XmvvAVMiNW5mPU3zM-68LTwu6kVXvc6unknhsqUq9jGSMFLKNqHqckc1yq0LaXDJC87VCYC7MWbhQxeiIan5_Lhywu',
    alt: 'Portrait of Amara K., professional female aesthetician with gentle smile, wearing minimalist linen medical uniform in high-end Abuja skin clinic.',
  },
  {
    name: 'Fatima B.',
    role: 'Massage Therapist • Certified UK Guild',
    specialty: 'Specialty: Deep Tissue & Aromatherapy',
    rating: '4.9',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6L5yNGFtfSwsdrkDKDstl-9bIyo8plOUPQk__mjOwRMRKrpysV9dzNM0NpfaY1HD0yNzIyKzq_AEq0bX6pwohtKKja_Su8LhWqHPNQR0kMf4Fjvbs89hv5UCV8wNkahSPtrxG296CT0HKA6NWIBOgRbzAt-3zAy3JswEPDGh4z8yWefKKu__5_qoYV07IAP1XviZfT4q65tIpQzylDLXgFEbiNY6wf4SjjpbhmOx-',
    alt: 'Portrait of Fatima B., certified therapeutic massage specialist in warm earth-tone spa uniform with a serene welcoming expression.',
  },
  {
    name: 'David O.',
    role: 'Holistic Specialist & Sauna Master',
    specialty: 'Specialty: Detox & Stress Recovery',
    rating: '4.9',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCzE0lhM2aBLrfjTfwh3bOdRDsNK4q-UCp0ioIHX3_45I-QgtYLYmaHrxcAjV806JKGdWY87e2g_jNtHrJM_eIrRi1Ywo4igXDnsJofkX8xJJUZ81_zv-rPWDE9xe3omfbzCHCfdVLlkCUA0SqJBSnw2Cdn07aKNYs8v3hKfZfwy3wOE0TMC7h5x9shZBFBj36JLvAtHVDfFzXyX4ZCbUVJQzNUmHar9g91zVmcOTy',
    alt: 'Portrait of David O., male holistic wellness specialist with neatly trimmed beard and natural calm presence in Abuja luxury wellness clinic.',
  },
];

const AMENITIES = [
  { icon: 'room_service', label: 'Private Suites' },
  { icon: 'weekend', label: 'Relax Lounge' },
  { icon: 'local_cafe', label: 'Herbal Tea Bar' },
  { icon: 'local_parking', label: 'Valet Parking' },
  { icon: 'wifi', label: 'High-Speed Wi-Fi' },
  { icon: 'credit_card', label: 'Card & VEMTAP POS' },
];

interface SpaStorefrontDeal {
  badge: string;
  meta: string;
  metaIcon: string;
  title: string;
  desc: string;
  price: string;
  was: string;
  image: string;
  alt: string;
}

const STOREFRONT_DEALS: SpaStorefrontDeal[] = [
  {
    badge: '25% OFF',
    meta: 'Ends in 2 days',
    metaIcon: 'schedule',
    title: 'Weekend Glow Facial & Swedish Massage',
    desc: 'Complimentary organic herbal tea & skin consultation included.',
    price: '₦18,500',
    was: '₦25,000',
    image: SERVICES[4].image,
    alt: SERVICES[4].alt,
  },
  {
    badge: '20% OFF',
    meta: 'Valid Tue - Thu',
    metaIcon: 'calendar_today',
    title: 'Executive Hair Styling, Beard Trim & Scalp Detox',
    desc: 'Hot towel steam treatment and tea-tree conditioning wash.',
    price: '₦12,000',
    was: '₦15,000',
    image: SERVICES[5].image,
    alt: SERVICES[5].alt,
  },
];

export function DesktopSpaStorefrontScreen({ onNav, onClaim }: DesktopSpaStorefrontScreenProps) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['key']>('all');
  const [saved, setSaved] = useState(false);
  const [claimedDeals, setClaimedDeals] = useState<Record<number, boolean>>({});

  const visibleServices = SERVICES.filter((service) => category === 'all' || service.category === category);

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="businesses">
      <div className="w-full bg-surface">
        <section className="relative w-full -mt-20 pt-24 pb-8 overflow-hidden bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-10 w-72 h-72 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none" />

            <div className="relative grid grid-cols-12 gap-3.5 h-[340px] md:h-[400px] rounded-3xl overflow-hidden shadow-lg">
              <div className="col-span-12 md:col-span-7 relative h-full group overflow-hidden">
                <div
                  aria-hidden="true"
                  className="bg-cover bg-center w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB_iUeq0EN1q5TIx0YfAU11w_GAz8GUJ6jxMWdvVsuY6GlhU-94cuoTBk0dhcVsNNiHwzlPwkATt6yCqPKolF9mf5egqX0Blj7e7vYdCRYqohsaOUG2cFNnymoHMc0QaYmxufyOf9GS2qdkp_OQACPovmi1IDrElIawln7rCJ48auqNGER95u7vZVnqrF5DKS7aPYDbm7nBla89mkBbZS8zLSzrjwk5sTj0Ze9XPmru')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/70 via-on-surface/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-on-secondary">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-canvas/20 backdrop-blur-md">
                    <Icon name="verified" filled className="text-[18px] text-badge-discount-text" />
                    <span className="font-label-sm text-label-sm font-semibold">
                      Flagship Sanctuary • Maitama Heights
                    </span>
                  </div>
                  <span className="font-caption text-caption text-on-secondary/80 flex items-center gap-1">
                    <Icon name="photo_library" className="text-[16px]" /> 18 Interior Photos
                  </span>
                </div>
              </div>

              <div className="hidden md:block md:col-span-3 relative h-full group overflow-hidden">
                <div
                  aria-hidden="true"
                  className="bg-cover bg-center w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwUv8G0aEkk1hhdw-TQdp5OVS6Xkf5p1ntQru9PKI26Q-V6Ny8iM8V462NnFpohkR5k2UYaSMdZSlacES9KkxJKioheWRD-jBXbDzs-gNYlqV9A5ct_E7pXO5f6Yx5dF8-Y0-JYqkP1Mfk64wkbloiLwP5aTSazzVe3hGoCaHkGul5_zqaxg93pt83tsaG1OBYSiuJc2od8LWStZQMGQjdt4JfRBIx2vREvZDN8t9D')",
                  }}
                />
                <div className="absolute inset-0 bg-on-surface/10 hover:bg-transparent transition-colors" />
                <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-surface-canvas/80 backdrop-blur-sm text-on-surface font-caption text-caption font-semibold">
                  Botanical Bar
                </span>
              </div>

              <div className="hidden md:flex md:col-span-2 flex-col gap-3.5 h-full">
                <div className="relative flex-1 overflow-hidden group">
                  <div
                    aria-hidden="true"
                    className="bg-cover bg-center w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAlhVF18zcYiS7_MHZGPQw2Q95E8w96-CdcsLtt10g3S6kZ3Y2DNxfDPzWbWBrh6qyiqxepCBBDS47gq81AfMH-xw9zkJuGuCcOHaS_qPpQAo7ECT7q2aB4akDDPDBbu-4X-mrVTfGtr3QFsaazonYxjp0W1pHxdQQpguqIub9cnFLss2YVbqyP0zg0sg6GQh9sjSgskgz0coHieMRverHSwT3o-crpJstJ6kyJGeP3')",
                    }}
                  />
                </div>
                <div className="relative flex-1 overflow-hidden group">
                  <div
                    aria-hidden="true"
                    className="bg-cover bg-center w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMkQ9xC6bDGNRgBdr2WlAAimogU4hdJGYwMqOFPXLHFy9OQJ80AaQNjlR9pcexrY38LbATzucHEBU4DKmrUWTXus5kFcUGXAEzhZpECRoxokQ8yuWS3UsBjhDfOTu-K6KMbFLBc59yLgvMYKzrtJxI1VJWSIoEVOiB-t1wBDXngeC08A5ZBp5eZbznRYzAej7F4KELs8tOAvbWH2xI7pwvkZsFPZpylmqJlqibYvhl')",
                    }}
                  />
                  <div className="absolute inset-0 bg-primary-container/20 mix-blend-multiply pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="relative -mt-12 bg-surface-canvas rounded-3xl p-6 lg:p-8 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    <Icon name="spa" className="text-primary text-[42px]" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="font-heading-lg text-heading-lg text-on-surface tracking-tight">
                        Glow &amp; Serenity Spa &amp; Salon
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
                        <Icon name="verified" filled className="text-[15px]" /> CAC Verified
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                        <Icon name="school" className="text-[15px]" /> Certified Aesthetician
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-text-secondary font-body-md text-body-md">
                      <div className="flex items-center gap-1 text-on-surface font-semibold">
                        <Icon name="star" filled className="text-tertiary-container text-[18px]" />
                        <span>4.9</span>
                        <span className="font-normal text-text-tertiary">(96 Verified Reviews)</span>
                      </div>
                      <span className="text-text-tertiary">•</span>
                      <div className="flex items-center gap-1">
                        <Icon name="location_on" className="text-primary text-[18px]" />
                        <span>Plot 14 Amazon Street, Maitama Heights, Abuja</span>
                        <span className="font-semibold text-primary-container">(1.4 km away)</span>
                      </div>
                      <span className="text-text-tertiary">•</span>
                      <div className="flex items-center gap-1">
                        <Icon name="call" className="text-text-secondary text-[17px]" />
                        <span className="font-medium text-text-primary">+234 (0) 803 555 0192</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNav('spa-booking')}
                    className="h-12 px-6 rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Icon name="calendar_month" className="text-[20px]" />
                    <span>Book Appointment</span>
                  </button>
                  <button
                    type="button"
                    className="h-12 px-4 rounded-2xl bg-surface-subtle text-text-primary hover:bg-surface-container font-label-md text-label-md flex items-center gap-2 transition-colors"
                  >
                    <Icon name="chat_bubble" className="text-primary text-[20px]" />
                    <span>Direct Chat</span>
                  </button>
                  <a
                    className="h-12 px-4 rounded-2xl bg-badge-discount-bg text-badge-discount-text hover:bg-emerald-100 font-label-md text-label-md flex items-center gap-2 transition-colors"
                    href="https://wa.me/2348035550192"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon name="forum" className="text-[20px]" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    aria-label="Save Business"
                    onClick={() => setSaved((value) => !value)}
                    className={`h-12 w-12 rounded-2xl bg-surface-subtle flex items-center justify-center transition-colors ${
                      saved ? 'text-error bg-error-container/40' : 'text-text-secondary hover:text-error hover:bg-error-container/30'
                    }`}
                  >
                    <Icon name={saved ? 'favorite' : 'favorite_border'} filled={saved} className="text-[22px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full mt-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-container text-on-primary p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold uppercase tracking-wider">
                  Limited Weekend Deal
                </span>
                <span className="font-caption text-caption text-on-primary/80">
                  Valid for Apo &amp; Maitama residents
                </span>
              </div>
              <h2 className="font-heading-md text-heading-md font-bold tracking-tight">
                20% OFF Weekend Glow Facial &amp; Sauna Therapy
              </h2>
              <p className="font-body-md text-body-md text-on-primary/90">
                Complete holistic skin reset including deep pore botanical hydration, cryo-globe face sculpt, followed
                by a 30-min infrared detox cedar sauna ritual.
              </p>
              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-heading-lg text-heading-lg font-bold text-surface-canvas">₦18,500</span>
                <span className="font-body-lg text-body-lg line-through text-on-primary/60">₦25,000</span>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-lg bg-surface-canvas/20">
                  Save ₦6,500
                </span>
              </div>
            </div>
            <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onNav('spa-booking')}
                className="h-12 px-7 rounded-2xl bg-surface-canvas text-primary font-button-primary text-button-primary shadow-md hover:bg-surface-tint-blue transition-all active:scale-95 flex items-center gap-2"
              >
                <Icon name="local_activity" className="text-[20px]" />
                <span>Claim Voucher</span>
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-surface-canvas/10 blur-xl pointer-events-none" />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading-md text-heading-md text-text-primary">Active Deals</h2>
                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold">
                      {STOREFRONT_DEALS.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNav('deals')}
                    className="h-9 px-4 rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-primary hover:text-on-primary transition-colors shrink-0"
                  >
                    See All ({STOREFRONT_DEALS.length})
                    <Icon name="chevron_right" className="text-[18px]" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {STOREFRONT_DEALS.map((deal, idx) => (
                    <div
                      key={deal.title}
                      className="w-[340px] shrink-0 bg-surface-canvas rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3"
                    >
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container-high">
                        <img alt={deal.alt} className="w-full h-full object-cover" src={deal.image} />
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
                          <h3 className="font-label-md text-label-md text-text-primary font-semibold truncate">
                            {deal.title}
                          </h3>
                          <p className="font-caption text-caption text-text-secondary truncate">{deal.desc}</p>
                        </div>
                        <div className="flex items-end justify-between mt-2 gap-2">
                          <div>
                            <div className="font-heading-sm text-heading-sm text-text-primary">{deal.price}</div>
                            <div className="font-caption text-caption text-text-tertiary line-through -mt-0.5">
                              {deal.was}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onClaim?.(() => setClaimedDeals((state) => ({ ...state, [idx]: true })))}
                            className={`h-8 px-4 rounded-xl font-label-sm text-label-sm flex items-center justify-center active:scale-95 transition-transform shadow-sm shrink-0 ${
                              claimedDeals[idx]
                                ? 'bg-badge-discount-bg text-badge-discount-text'
                                : 'bg-primary-container text-on-primary hover:bg-primary hover:text-on-primary'
                            }`}
                          >
                            {claimedDeals[idx] ? 'Claimed' : 'Claim'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 px-1">
                <div>
                  <h2 className="font-heading-md text-heading-md text-text-primary">Services</h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Browse treatments, rituals and wellness sessions. Prices in Nigerian Naira (₦).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNav('all-services')}
                  className="h-9 px-4 rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-primary hover:text-on-primary transition-colors shrink-0"
                >
                  See All
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategory(item.key)}
                    className={`shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all ${
                      category === item.key
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'bg-surface-canvas text-text-secondary hover:text-on-surface shadow-sm'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
                {visibleServices.map((service) => (
                  <article
                    key={service.title}
                    className={`group w-[320px] shrink-0 bg-surface-canvas rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                      service.highlight ? 'shadow-md hover:shadow-lg ring-2 ring-primary/20' : 'shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden">
                        <div
                          aria-hidden="true"
                          className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                          style={{ backgroundImage: `url('${service.image}')` }}
                        />
                        {service.badge && (
                          <span
                            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full font-caption text-caption font-bold ${service.badge.className}`}
                          >
                            {service.badge.label}
                          </span>
                        )}
                        <span
                          className={`absolute bottom-3 right-3 px-2 py-0.5 rounded-lg font-caption text-caption ${
                            service.highlight
                              ? 'bg-primary-container text-on-primary font-semibold'
                              : 'bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface'
                          }`}
                        >
                          {service.duration}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <div
                          className={`flex items-center gap-1.5 font-caption text-caption ${
                            service.highlight ? 'text-primary font-semibold' : 'text-text-tertiary'
                          }`}
                        >
                          <Icon name={service.meta.icon} className="text-[16px] text-primary" />
                          <span>{service.meta.label}</span>
                        </div>
                        <h3 className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                          {service.title}
                        </h3>
                        <p className="font-body-md text-body-md text-text-secondary line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 mt-2 flex items-center justify-between">
                      <div>
                        {service.oldPrice ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-heading-sm text-heading-sm text-primary font-bold">{service.price}</span>
                            <span className="font-caption text-caption line-through text-text-tertiary">
                              {service.oldPrice}
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="font-caption text-caption text-text-tertiary">Standard Rate</span>
                            <div className="font-heading-sm text-heading-sm text-text-primary">{service.price}</div>
                          </>
                        )}
                        {service.oldPrice && (
                          <span className="font-caption text-caption text-badge-discount-text font-medium">
                            Instant VEMTAP Savings
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onNav('spa-booking')}
                        className={`px-4 py-2 rounded-xl font-label-md text-label-md shadow transition-all active:scale-95 ${
                          service.actionClassName ?? 'bg-primary-container text-on-primary hover:bg-primary'
                        }`}
                      >
                        {service.action ?? 'Book Service'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="p-6 rounded-3xl bg-surface-container/60 shadow-sm flex flex-col sm:flex-row items-center gap-5 mt-6">
                <div className="w-14 h-14 rounded-2xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon name="format_image_left" className="text-[32px]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">
                    VEMTAP Zero-Prepayment Peace of Mind
                  </h4>
                  <p className="font-body-md text-body-md text-text-secondary">
                    Zero upfront fees required when booking. Confirm your reservation immediately on VEMTAP and
                    complete payment seamlessly at the front desk upon service completion.
                  </p>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-surface-canvas rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Meet Your Specialists</h3>
                  <span className="font-caption text-caption text-primary font-semibold">Licensed Team</span>
                </div>
                <div className="space-y-4">
                  {SPECIALISTS.map((specialist) => (
                    <div
                      key={specialist.name}
                      className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-surface-subtle transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        <img alt={specialist.alt} className="w-full h-full object-cover" src={specialist.image} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-label-md text-label-md font-semibold text-text-primary truncate">
                            {specialist.name}
                          </h4>
                          <span className="font-caption text-caption text-tertiary-container font-semibold flex items-center">
                            <Icon name="star" className="text-[14px]" /> {specialist.rating}
                          </span>
                        </div>
                        <p className="font-caption text-caption text-text-secondary">{specialist.role}</p>
                        <p className="font-caption text-caption text-primary-container truncate">{specialist.specialty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-canvas rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Sanctuary Location</h3>
                  <span className="font-caption text-caption px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-semibold">
                    Open Now
                  </span>
                </div>
                <div
                  className="w-full h-44 rounded-2xl bg-cover bg-center overflow-hidden relative shadow-inner"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGHANkTDRfBzGXPTQMDGsiLVBdHGSICWOt7kPdJvlc9AGB6s5GrOhNUAqWeLpXIQmcY5F5xWxYdOf_qu740-D_Th8rPcCK0YDO69Y8Q71vqMZPKwhkf_IZ6lO8j5W6o8wBpdwXRlJvOGHAdYh29dVT0gJkyKv6L3U264kmGLWgsTUSe2G9IhQVEUXQIIOkUC1IFYTN8v4Sqn6XOWzeKVez3Bq4ZyLSSWzqzVw8NhWa')",
                  }}
                >
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md text-on-surface shadow text-xs font-semibold flex items-center gap-1.5">
                    <Icon name="pin_drop" className="text-[16px] text-error" />
                    <span>Maitama Heights, Abuja</span>
                  </div>
                </div>
                <div className="space-y-2 pt-1 font-body-md text-body-md">
                  <div className="flex items-center justify-between text-text-secondary py-1 border-b border-border-subtle">
                    <span>Monday – Saturday</span>
                    <span className="font-semibold text-text-primary">9:00 AM – 8:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary py-1">
                    <span>Sunday</span>
                    <span className="font-semibold text-text-primary">12:00 PM – 6:00 PM</span>
                  </div>
                </div>
                <a
                  className="w-full h-11 rounded-xl bg-surface-subtle text-primary font-label-md text-label-md hover:bg-surface-container flex items-center justify-center gap-1.5 transition-colors"
                  href="https://maps.google.com/?q=Maitama+Heights+Abuja"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon name="directions" className="text-[18px]" />
                  <span>Get Turn-by-Turn Directions</span>
                </a>
              </div>

              <div className="bg-surface-canvas rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Verified Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {AMENITIES.map((amenity) => (
                    <div
                      key={amenity.label}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-subtle text-text-secondary"
                    >
                      <Icon name={amenity.icon} className="text-primary text-[20px]" />
                      <span className="font-label-sm text-label-sm">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle text-center space-y-1">
                <span className="font-caption text-caption text-text-secondary">
                  Own a beauty clinic or spa in Nigeria?
                </span>
                <div>
                  <button
                    type="button"
                    className="font-label-sm text-label-sm text-primary-container font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Set up your business on VEMTAP <Icon name="arrow_forward" className="text-[14px]" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </DesktopPage>
  );
}
