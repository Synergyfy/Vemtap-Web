import { useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface HelpCentreScreenProps {
  onBack: () => void;
  onStartChat: () => void;
  onOpenMerchant: () => void;
  onOpenTerms: () => void;
}

interface Faq {
  id: string;
  question: string;
  answer: ReactNode;
  keywords: string;
}

const FAQS: Faq[] = [
  {
    id: 'f1',
    question: 'How do I claim and redeem a deal on VEMTAP?',
    keywords: 'deal claim voucher redeem pass qr',
    answer: (
      <div className="pt-space-2xs flex flex-col gap-space-2xs">
        <p>
          Tap <strong className="text-text-primary">Claim Deal</strong> on any merchant&apos;s offer card. Your
          personalized QR voucher will instantly save to your{' '}
          <em className="not-italic text-primary">Claims Hub</em>.
        </p>
        <p>
          Show this digital code to the staff when settling your bill at the store or upon delivery to receive the
          discounted rate immediately.
        </p>
      </div>
    ),
  },
  {
    id: 'f2',
    question: 'Does VEMTAP take payments directly?',
    keywords: 'payment pay checkout commission card direct settlement in-app',
    answer: (
      <div className="pt-space-2xs flex flex-col gap-space-2xs">
        <p>
          <strong className="text-text-primary">No.</strong> VEMTAP never collects payments, stores bank card pins, or
          adds hidden checkout surcharges.
        </p>
        <p>
          You settle directly with the merchant at their venue via cash, physical POS card terminal, or instant Nigerian
          bank transfer.
        </p>
      </div>
    ),
  },
  {
    id: 'f3',
    question: 'Can I cancel or reschedule an appointment?',
    keywords: 'appointment booking salon reschedule cancel slot',
    answer: (
      <div className="pt-space-2xs flex flex-col gap-space-2xs">
        <p>
          Yes. You can reschedule or cancel free of charge up to{' '}
          <strong className="text-text-primary">2 hours prior</strong> to your appointment slot directly in your Orders
          &amp; Bookings dashboard, or by contacting the business directly via their profile button.
        </p>
      </div>
    ),
  },
  {
    id: 'f4',
    question: 'How does "Claim for Someone Else" work?',
    keywords: 'gift claim someone else send recipient',
    answer: (
      <div className="pt-space-2xs flex flex-col gap-space-2xs">
        <p>
          During the claim flow, select <strong className="text-text-primary">Send as a Gift</strong>. Enter the
          recipient&apos;s phone number or email address, and we will send them a digital pass with full redemption
          instructions.
        </p>
      </div>
    ),
  },
  {
    id: 'f5',
    question: 'What if a business does not honor a VEMTAP discount?',
    keywords: 'discount honor merchant issue dispute resolution refund',
    answer: (
      <div className="pt-space-2xs flex flex-col gap-space-2xs">
        <p>
          All listed businesses sign a binding guarantee to honor active rates. If an attendant hesitates, tap the urgent{' '}
          <strong className="text-text-primary">Live Resolution</strong> button below or ring our Abuja merchant desk. We
          resolve merchant issues on the spot.
        </p>
      </div>
    ),
  },
];

const TOPICS: Array<{ key: string; icon: string; iconClass: string; label: string; hint: string; query: string }> = [
  {
    key: 'deals',
    icon: 'local_offer',
    iconClass: 'bg-surface-tint-blue text-primary-container group-hover:bg-primary group-hover:text-on-primary',
    label: 'Deals & Claims',
    hint: 'Passes, timers & codes',
    query: 'deal claim voucher redeem',
  },
  {
    key: 'bookings',
    icon: 'calendar_today',
    iconClass: 'bg-surface-tint-blue text-primary-container group-hover:bg-primary group-hover:text-on-primary',
    label: 'Bookings & Salons',
    hint: 'Slots & rescheduling',
    query: 'appointment booking salon reschedule',
  },
  {
    key: 'orders',
    icon: 'shopping_bag',
    iconClass: 'bg-surface-tint-blue text-primary-container group-hover:bg-primary group-hover:text-on-primary',
    label: 'Orders & Pickup',
    hint: 'Physical collection',
    query: 'pickup collection orders',
  },
  {
    key: 'payments',
    icon: 'verified',
    iconClass:
      'bg-badge-discount-bg text-badge-discount-text group-hover:bg-badge-discount-text group-hover:text-surface-container-lowest',
    label: 'Zero In-App Pay',
    hint: 'Safe direct settlement',
    query: 'payment settlement commission',
  },
];

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBIz7aEV8fSLe0tuwvk8Ze8MnxKxyyCNRrWo1fYfJBlP86XQ9TQWI91cj3xFqRr_pXNuw2CX7ItBWa_taCeRwx6UHzov6CAX4TF6Yf6lg9uDIihSao34AkbZqGSGTXlpZ19RkQPT3ygIv6narBAYm4AsLG2Fb3F3ViJ7jLKGJTgY7Vg_TjSmfJhw4bBQhXIzYDFWGTImoZzcNDX2mi8Pym9Hrn46faUYL-z7RUQ5eqG';
const HERO_ALT =
  'A cheerful Nigerian customer in modern casual wear happily presenting a digital phone pass to a smiling local Abuja barista in a warmly lit boutique artisan cafe, soft natural morning sunlight, clean commercial aesthetic, warm vibrant tones.';

export function HelpCentreScreen({ onBack, onStartChat, onOpenMerchant, onOpenTerms }: HelpCentreScreenProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const normalized = query.trim().toLowerCase();
  const filtered = FAQS.filter(
    (faq) => !normalized || faq.question.toLowerCase().includes(normalized) || faq.keywords.includes(normalized),
  );

  const allExpanded = filtered.length > 0 && filtered.every((faq) => expanded.includes(faq.id));

  const toggleFaq = (id: string) => {
    setExpanded((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  };

  const toggleAll = () => {
    if (allExpanded) setExpanded([]);
    else setExpanded(filtered.map((faq) => faq.id));
  };

  const filterByTopic = (topicQuery: string) => {
    setQuery(topicQuery);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="h-14 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center -ml-space-xs rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate">
              Help Centre &amp; Faqs
            </h1>
          </div>
          <div className="flex items-center gap-space-2xs">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin pb-space-2xl gap-space-lg pt-space-md">
        <section className="flex flex-col">
          <div className="flex items-center gap-space-2xs mb-space-2xs">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-badge-discount-bg text-badge-discount-text">
              <Icon name="verified_user" className="text-[16px]" filled />
            </span>
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              VEMTAP Support Concierge
            </span>
          </div>
          <h2 className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight">
            How can we help you today?
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
            Find quick answers, learn how vouchers work, or reach our Abuja-based support team.
          </p>
          <div className="relative mt-space-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-text-tertiary">
              <Icon name="search" className="text-[22px]" />
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              aria-label="Search help articles"
              placeholder="Search questions, guides, or topics..."
              className="w-full h-[52px] pl-[46px] pr-space-md rounded-xl bg-surface-container-lowest text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:ring-0 focus:bg-surface-tint-blue transition-colors"
            />
          </div>
        </section>

        <section className="relative overflow-hidden rounded-xl bg-surface-container-low shadow-sm">
          <div className="flex flex-row items-center p-space-md gap-space-md">
            <div className="flex-1">
              <span className="inline-flex items-center px-space-2xs py-0.5 rounded-full bg-surface-tint-blue font-caption text-caption text-primary mb-1">
                Zero Commission
              </span>
              <h3 className="font-heading-sm text-heading-sm text-on-surface">Pay Merchants Directly</h3>
              <p className="font-label-sm text-label-sm text-text-secondary mt-0.5">
                VEMTAP never takes in-app transaction cuts. Enjoy transparent, fair local dining &amp; beauty deals.
              </p>
            </div>
            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden shadow-sm">
              <img
                className="w-full h-full object-cover"
                src={HERO_IMG}
                data-alt={HERO_ALT}
                alt={HERO_ALT}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Browse Topics</h3>
            <span className="font-caption text-caption text-text-secondary">4 Key Areas</span>
          </div>
          <div className="grid grid-cols-2 gap-space-xs">
            {TOPICS.map((topic) => (
              <button
                key={topic.key}
                type="button"
                onClick={() => filterByTopic(topic.query)}
                className="category-card flex flex-col items-start p-space-md rounded-xl bg-surface-container-lowest shadow-sm active:scale-[0.98] transition-transform text-left group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-space-sm transition-colors ${topic.iconClass}`}>
                  <Icon name={topic.icon} className="text-[22px]" filled />
                </div>
                <span className="font-button-primary text-label-md text-text-primary">{topic.label}</span>
                <span className="font-caption text-caption text-text-secondary mt-0.5">{topic.hint}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Frequently Asked Questions</h3>
            <button
              type="button"
              onClick={toggleAll}
              className="font-caption text-caption text-primary font-medium active:opacity-75 transition-opacity"
            >
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-space-lg px-space-md gap-space-xs rounded-xl bg-surface-container-lowest shadow-sm">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                <Icon name="search_off" className="text-[24px]" />
              </div>
              <p className="font-label-md text-label-md font-bold text-text-primary">No matching questions</p>
              <p className="font-body-md text-body-md text-text-secondary max-w-xs">
                Try different keywords, or start a chat and we&apos;ll answer personally.
              </p>
              <button
                type="button"
                onClick={onStartChat}
                className="mt-1 px-space-md h-10 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary active:scale-95 transition-transform"
              >
                Start a chat
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-space-2xs" id="faq-list">
              {filtered.map((faq) => {
                const isExpanded = expanded.includes(faq.id);
                return (
                  <div key={faq.id} className="faq-item rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all duration-200">
                    <button
                      aria-expanded={isExpanded}
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-space-md text-left gap-space-sm"
                    >
                      <span className="font-button-secondary text-button-secondary text-text-primary">
                        {faq.question}
                      </span>
                      <Icon
                        name={isExpanded ? 'close' : 'add'}
                        className="text-primary shrink-0 text-[20px]"
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-space-md pb-space-md text-text-secondary font-body-md text-body-md">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="flex flex-col rounded-xl bg-surface-container-lowest p-space-md shadow-sm gap-space-md">
          <div className="flex items-center gap-space-xs">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <Icon name="headset_mic" className="text-[22px]" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Still need assistance?</h3>
              <span className="font-caption text-caption text-text-secondary">
                We&apos;re here to keep your shopping effortless
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
            <div className="flex flex-col min-w-0 pr-space-xs">
              <div className="flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-button-primary text-label-md text-text-primary">In-App Support Chat</span>
              </div>
              <span className="font-caption text-caption text-badge-discount-text font-medium mt-0.5">
                Fastest response (&lt; 10 mins)
              </span>
            </div>
            <button
              type="button"
              onClick={onStartChat}
              className="h-9 px-space-md rounded-lg bg-primary text-on-primary font-button-secondary text-label-sm shadow-sm active:scale-95 transition-transform shrink-0"
            >
              Start Chat
            </button>
          </div>

          <a
            className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle active:scale-[0.99] transition-transform"
            href="https://wa.me/2348000000000"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-9 h-9 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                <Icon name="chat" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-button-primary text-label-md text-text-primary truncate">
                  WhatsApp Help Desk
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  Direct messaging with VEMTAP Abuja team
                </span>
              </div>
            </div>
            <Icon name="arrow_forward_ios" className="text-text-tertiary text-[20px] shrink-0" />
          </a>

          <a
            className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle active:scale-[0.99] transition-transform"
            href="mailto:support@vemtap.com"
          >
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="mail" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-button-primary text-label-md text-text-primary truncate">Email Support</span>
                <span className="font-caption text-caption text-text-secondary truncate">support@vemtap.com</span>
              </div>
            </div>
            <Icon name="arrow_forward_ios" className="text-text-tertiary text-[20px] shrink-0" />
          </a>

          <div className="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-tint-blue text-primary">
            <Icon name="schedule" className="text-[20px] shrink-0" />
            <p className="font-label-sm text-label-sm text-text-primary">
              Live support available{' '}
              <span className="font-semibold text-primary">Mon – Sat, 8:00 AM – 8:00 PM WAT</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenTerms}
            className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle active:scale-[0.99] transition-transform text-left"
          >
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-9 h-9 rounded-full bg-surface-container text-secondary flex items-center justify-center shrink-0">
                <Icon name="description" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-button-primary text-label-md text-text-primary truncate">
                  Terms, Privacy &amp; Refunds
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  Read the VEMTAP fine print
                </span>
              </div>
            </div>
            <Icon name="arrow_forward_ios" className="text-text-tertiary text-[20px] shrink-0" />
          </button>
        </section>

        <div className="flex flex-col items-center justify-center pt-space-xs pb-space-sm text-center">
          <p className="font-label-md text-label-md text-text-secondary">
            Own a business?{' '}
            <button
              type="button"
              onClick={onOpenMerchant}
              className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5 ml-1 active:opacity-75 transition-opacity"
            >
              Set up your business on VEMTAP
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          </p>
        </div>
      </main>
    </AppScreen>
  );
}
