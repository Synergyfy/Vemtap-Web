import { useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopHelpCentreScreenProps {
  onNav: (key: DesktopNavKey) => void;
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

export function DesktopHelpCentreScreen({
  onNav,
  onBack,
  onStartChat,
  onOpenMerchant,
  onOpenTerms,
}: DesktopHelpCentreScreenProps) {
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
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-2 font-label-sm text-label-sm text-text-tertiary mb-6">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              Account
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-semibold">Help Centre &amp; FAQs</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
              How can we help you today?
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">
              Find quick answers, learn how vouchers work, or reach our Abuja-based support team.
            </p>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4">
            <span className="inline-flex items-center gap-space-2xs self-start shrink-0 px-space-xs py-1.5 rounded-full bg-surface-container-lowest border border-border-subtle shadow-xs">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-badge-discount-bg text-badge-discount-text">
                <Icon name="verified_user" className="text-[16px]" filled />
              </span>
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
                VEMTAP Support Concierge
              </span>
            </span>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-text-tertiary">
                <Icon name="search" className="text-[22px]" />
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                aria-label="Search help articles"
                placeholder="Search questions, guides, or topics..."
                className="w-full h-[52px] pl-[46px] pr-space-md rounded-xl bg-surface-container-lowest border border-border-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:border-primary focus:bg-surface-tint-blue transition-colors shadow-xs"
              />
            </div>
          </div>

          <section className="mt-6 rounded-xl bg-surface-container-low border border-border-subtle shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md p-space-lg">
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center px-space-2xs py-0.5 rounded-full bg-surface-tint-blue font-caption text-caption text-primary mb-1">
                  Zero Commission
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Pay Merchants Directly</h2>
                <p className="font-body-md text-body-md text-text-secondary mt-1 max-w-2xl">
                  VEMTAP never takes in-app transaction cuts. Enjoy transparent, fair local dining &amp; beauty deals.
                </p>
              </div>
              <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden shadow-sm bg-surface-container-lowest">
                <img className="w-full h-full object-cover" src={HERO_IMG} data-alt={HERO_ALT} alt={HERO_ALT} />
              </div>
            </div>
          </section>

          <section className="mt-8 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Browse Topics</h2>
              <span className="font-caption text-caption text-text-secondary">4 Key Areas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
              {TOPICS.map((topic) => (
                <button
                  key={topic.key}
                  type="button"
                  onClick={() => filterByTopic(topic.query)}
                  className="flex flex-col items-start p-space-md rounded-xl bg-surface-container-lowest border border-border-subtle shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-space-sm transition-colors ${topic.iconClass}`}
                  >
                    <Icon name={topic.icon} className="text-[22px]" filled />
                  </div>
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{topic.label}</span>
                  <span className="font-caption text-caption text-text-secondary mt-0.5">{topic.hint}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            <section className="flex flex-col gap-space-sm w-full">
              <div className="flex items-center justify-between">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Frequently Asked Questions</h2>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="font-label-sm text-label-sm text-primary font-semibold hover:underline transition-opacity"
                >
                  {allExpanded ? 'Collapse All' : 'Expand All'}
                </button>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-space-xl px-space-md gap-space-sm rounded-xl bg-surface-container-lowest border border-border-subtle shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary">
                    <Icon name="search_off" className="text-[24px]" />
                  </div>
                  <p className="font-label-md text-label-md font-bold text-text-primary">No matching questions</p>
                  <p className="font-body-md text-body-md text-text-secondary max-w-xs">
                    Try different keywords, or start a chat and we&apos;ll answer personally.
                  </p>
                  <button
                    type="button"
                    onClick={onStartChat}
                    className="mt-1 px-space-md h-10 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary hover:opacity-95 transition-opacity"
                  >
                    Start a chat
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-space-2xs" id="faq-list">
                  {filtered.map((faq) => {
                    const isExpanded = expanded.includes(faq.id);
                    return (
                      <div
                        key={faq.id}
                        className="rounded-xl bg-surface-container-lowest border border-border-subtle shadow-sm overflow-hidden transition-all duration-200"
                      >
                        <button
                          aria-expanded={isExpanded}
                          type="button"
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full flex items-center justify-between p-space-md text-left gap-space-sm hover:bg-surface-subtle transition-colors"
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
                          <div className="px-space-md pb-space-md text-text-secondary font-body-md text-body-md max-w-3xl">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="w-full flex flex-col gap-space-md lg:sticky lg:top-24">
              <section className="flex flex-col rounded-xl bg-surface-container-lowest border border-border-subtle p-space-md shadow-sm gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                    <Icon name="headset_mic" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Still need assistance?</h2>
                    <span className="font-caption text-caption text-text-secondary">
                      We&apos;re here to keep your shopping effortless
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-2xs">
                      <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        In-App Support Chat
                      </span>
                    </div>
                    <span className="font-caption text-caption text-badge-discount-text font-medium mt-0.5">
                      Fastest response (&lt; 10 mins)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onStartChat}
                    className="h-9 px-space-md rounded-lg bg-primary text-on-primary font-button-secondary text-button-secondary shadow-sm hover:opacity-95 transition-opacity shrink-0"
                  >
                    Start Chat
                  </button>
                </div>

                <a
                  className="flex items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low transition-colors"
                  href="https://wa.me/2348000000000"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="flex items-center gap-space-xs min-w-0">
                    <div className="w-9 h-9 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                      <Icon name="chat" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
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
                  className="flex items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low transition-colors"
                  href="mailto:support@vemtap.com"
                >
                  <div className="flex items-center gap-space-xs min-w-0">
                    <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                      <Icon name="mail" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        Email Support
                      </span>
                      <span className="font-caption text-caption text-text-secondary truncate">
                        support@vemtap.com
                      </span>
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
                  className="flex items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low transition-colors text-left"
                >
                  <div className="flex items-center gap-space-xs min-w-0">
                    <div className="w-9 h-9 rounded-full bg-surface-container-high text-text-secondary flex items-center justify-center shrink-0">
                      <Icon name="description" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
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
            </aside>
          </div>

          <div className="mt-8 pt-space-sm pb-space-md flex flex-col items-center justify-center text-center">
            <p className="font-label-md text-label-md text-text-secondary">
              Own a business?{' '}
              <button
                type="button"
                onClick={onOpenMerchant}
                className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5 ml-1 transition-opacity"
              >
                <span>Set up your business on VEMTAP</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </p>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
