import { AppScreen } from '../components/ui/AppScreen';
import { DealCard, PeekDealCard } from '../components/DealCard';
import { Icon } from '../components/ui/Icon';
import { Logo } from '../components/ui/Logo';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { ProgressDots } from '../components/ui/ProgressDots';

const IMAGES = {
  burger:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAh9TPY-tYGQwlYNMHzJAkzrJf1kapCF68_cvYcrJZa0aFdUN13e7YPYpEJ6zuQr1hJlyscnZtX00yEuB0Kh-HFg3jF2YQtCUofuRTFTDwWbHP-5KDHW-lJ-ccxwkJpt45jkceslX5PlO12AhTWl2KkO632E_N-daK7Pr5AGP4V9hGX2iKzF-mMNPmlpedk_srGNHCWXLMIHHgZkKWhUB_3zmurawQEYpr9jpBMSOlWOJaU4XaZ7_HTtg',
  beauty:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCpyE-Y3Y60x07EZojoXrsSBGyMIDslaiA_zkJ2KOB-sEwwphTrARMfVV8mhgQmnA-pGpbWYpj1d8FlL8tQ5HChF8uL8nHiB9i2xGglD5iujTcg-HmrikBepfhT9fniBuqhjanb5ZcDpofBAMtwDpvPx73sB6OISyAyNFfPeUdJ30Qe0PnX50gW5QDNTS5-yJp57kArXHj3yOcmqRta4GLUSxhPhgyXc7bWKHOGnoIsoEQ5iQ0ZY_WViQ',
  sneakers:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAj5ocy7YWrjfANSyuwAINfiYkQ_r7d2y0eUJz8wIWfmdqB0xStFOpG3EzAJEcrkaIuTRMeDssa3WZpzX2t-FfB4oPiWIrn90QUNz5ZZ3Aiqf5B7jJ46-4sJX0-f4GYUQN8JgHyScN6RSIUR2iyuMJ798ZsklYzWrU8EIqLiAL9QiBusi9yCoTLV7B0thiFh1CGT7W9kEwxqqqY2nzpnZTdepP1XuWAjnjWZU2McJ_-tsWiCrv1gRgTdA',
  coffee:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCQvlmoRWlPeKlznx2Os0NvkEElK_CD9tcZRtWiF17RRuN03EWNSPISIMgalBVnRWKAunc9ezamsZroeqKYjtpqus5AkgXgHJHH9BLWk9NnSOzWSBlc73NQYpaTGZ4ndbh9C5pEuC6Af3DH4QkMct8JrWLcJeM-l341_vmR1s5IXMQg3kewyzFYwOeQEcQUGEOuZWCoQmXL8LSrwTVccS3-JbU7de3K6ozqhWeTwISAp04AHkim0r3VsA',
};

const deals = [
  {
    image: IMAGES.burger,
    imageAlt: 'Gourmet burger in a warm neighborhood bistro',
    badge: '20% OFF',
    badgeVariant: 'green' as const,
    category: 'Food & Dining',
    categoryVariant: 'highlight',
    tag: { variant: 'hot' as const, label: 'Hot Deal' },
    businessName: 'Bistro 24 / Urban Grill',
    dealTitle: '20% Off Lunch Menu',
    distance: '0.4 km away',
    rating: '4.9',
    reviews: '184',
  },
  {
    image: IMAGES.beauty,
    imageAlt: 'Luxury skincare products in a beauty salon',
    badge: '30% OFF',
    badgeVariant: 'green' as const,
    category: 'Beauty & Spa',
    categoryVariant: 'muted',
    tag: { variant: 'trending' as const, label: 'Trending' },
    businessName: 'Glow Studio',
    dealTitle: 'Weekend Beauty Deal',
    distance: '1.2 km away',
    rating: '4.8',
    reviews: '92',
  },
  {
    image: IMAGES.sneakers,
    imageAlt: 'Retro sneakers on boutique display',
    badge: 'SPECIAL',
    badgeVariant: 'blue' as const,
    category: 'Retail & Fashion',
    categoryVariant: 'muted',
    tag: { variant: 'exclusive' as const, label: 'Exclusive Offer' },
    businessName: 'Sole District',
    dealTitle: 'Fresh Sneakers & Streetwear',
    distance: '0.8 km away',
    rating: '5.0',
    reviews: '310',
  },
];

interface DiscoverDealsScreenProps {
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onOpenDeal: () => void;
}

export function DiscoverDealsScreen({
  onBack,
  onNext,
  onSkip,
  onOpenDeal,
}: DiscoverDealsScreenProps) {
  return (
    <AppScreen>
      <div className="flex flex-col w-full px-margin pb-space-lg select-none">
        <div className="flex items-center justify-between w-full h-12 pt-space-xs">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low text-on-surface active:scale-95 transition-transform duration-150"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div className="flex items-center px-3 py-1.5 bg-surface-container rounded-full">
            <Logo variant="mark" className="h-5 w-auto" />
          </div>
          <button type="button" onClick={onSkip} className="font-button-secondary text-button-secondary text-text-secondary active:opacity-70 transition-opacity">
            Skip
          </button>
        </div>

        <ProgressDots
          activeIndex={1}
          label="Onboarding step 2 of 3"
          className="justify-center mt-4 mb-3"
        />

        <div className="text-center px-2 mt-1 mb-5">
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            Discover Deals Near You
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-2 max-w-[320px] mx-auto">
            See offers from businesses around your location and find something worth buying nearby.
          </p>
        </div>

        <div className="relative w-full flex flex-col gap-3 py-1">
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-primary-fixed/30 via-surface-tint-blue/20 to-transparent rounded-full blur-2xl pointer-events-none -z-10"
          />

          {deals.map((deal) => (
            <DealCard key={deal.businessName} {...deal} onOpen={onOpenDeal} />
          ))}

          <PeekDealCard
            image={IMAGES.coffee}
            imageAlt="Coffee and croissant in a modern cafe"
            name="Artisan Cafe"
            badge="BOGO FREE"
            meta="Coffee & Pastries • 500m away"
          />

          <div className="flex items-center justify-center gap-2 mt-4 mb-2 text-text-secondary">
            <Icon name="bolt" className="text-primary text-[17px]" />
            <span className="font-caption text-caption text-text-secondary font-medium">
              Deals refresh in real-time as you move around town
            </span>
          </div>

          <div className="mt-auto pt-4 flex flex-col items-center w-full">
            <PrimaryButton onClick={onNext} className="rounded-2xl shadow-lg shadow-primary-container/25">
              <span>Next</span>
              <Icon name="arrow_forward" className="text-[19px]" />
            </PrimaryButton>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}