import { useEffect, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface TermsScreenProps {
  onBack: () => void;
}

interface TocItem {
  id: string;
  label: string;
}

const SECTIONS: TocItem[] = [
  { id: 'acceptance', label: '1. Acceptance of Terms' },
  { id: 'accounts', label: '2. Accounts & Eligibility' },
  { id: 'deals', label: '3. Deals, Claims & Vouchers' },
  { id: 'bookings', label: '4. Bookings & Appointments' },
  { id: 'payments', label: '5. Payments & Zero Commission' },
  { id: 'merchants', label: '6. Merchant Responsibilities' },
  { id: 'conduct', label: '7. Acceptable Use' },
  { id: 'liability', label: '8. Limitation of Liability' },
  { id: 'termination', label: '9. Termination' },
  { id: 'changes', label: '10. Changes to Terms' },
  { id: 'privacy', label: '11. Privacy Policy' },
  { id: 'contact', label: '12. Contact Us' },
];

const BODY: Record<string, string[]> = {
  acceptance: [
    'By creating a VEMTAP account or using the VEMTAP app, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.',
    'These Terms govern your access to deals, vouchers, table ordering, bookings, and all related features published by VEMTAP.',
  ],
  accounts: [
    'You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account. You are responsible for keeping your login credentials secure.',
    'One account per person. Accounts created with false information may be suspended without notice.',
  ],
  deals: [
    'Deals are published by independent merchants. VEMTAP does not set prices; merchants honor the discount shown on an active claim voucher at the venue.',
    'Vouchers are single-use unless stated otherwise, carry an expiry shown on the pass, and hold no cash value. Show the QR code or code at checkout.',
  ],
  bookings: [
    'Appointments are scheduled directly with the merchant. Free cancellation or rescheduling is available up to 2 hours before the slot unless the merchant policy states otherwise.',
    'No-shows may be charged by the merchant according to their posted policy.',
  ],
  payments: [
    'VEMTAP does not process in-app payments. You settle directly with the merchant via cash, POS terminal, or bank transfer. We never store your card PIN or add checkout surcharges.',
  ],
  merchants: [
    'Merchants are responsible for the accuracy of their listings, availability, and honoring active vouchers. Report issues through Live Resolution in the app.',
  ],
  conduct: [
    'You agree not to misuse the platform: no fraud, scraping, harassment of merchants or other users, reverse engineering, or automated claiming of vouchers.',
  ],
  liability: [
    'VEMTAP is a discovery and voucher platform. We are not liable for merchant goods, services, injuries, or indirect damages arising from venue visits, to the maximum extent permitted by law.',
  ],
  termination: [
    'We may suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings.',
  ],
  changes: [
    'We may update these terms from time to time. Material changes will be announced in-app before they take effect.',
  ],
  privacy: [
    'Your use of VEMTAP is also governed by our Privacy Policy, which explains how we collect and handle your data under Nigerian NDPR guidance. See Privacy & NDPR Data in Settings for controls.',
  ],
  contact: [
    'Questions about these terms: support@vemtap.com or the in-app Contact Support screen.',
  ],
};

export function TermsScreen({ onBack }: TermsScreenProps) {
  const [active, setActive] = useState('acceptance');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AppScreen surface="bg-surface">
      <header className="sticky top-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-border-subtle">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="text-heading-sm font-heading-sm text-text-primary tracking-tight truncate">
              Terms &amp; Privacy Policy
            </h1>
          </div>
        </div>
      </header>

      <main className="flex flex-col px-margin pt-space-md pb-24 gap-space-lg">
        <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
          <div className="flex items-center gap-space-xs mb-1">
            <Icon name="gavel" className="text-[18px] text-primary" />
            <span className="text-label-md font-label-md text-text-primary font-bold">
              VEMTAP Terms of Service
            </span>
          </div>
          <p className="text-caption font-caption text-text-secondary">
            Last updated 1 October 2026 &middot; Applies to all VEMTAP consumer features
          </p>
        </section>

        <nav className="rounded-xl bg-surface-container-lowest p-space-sm shadow-sm">
          <p className="text-label-sm font-label-sm text-text-secondary uppercase tracking-wider px-space-2xs pb-space-2xs">
            On this page
          </p>
          <div className="flex flex-wrap gap-space-2xs">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActive(item.id);
                  const el = document.getElementById('term-' + item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`px-space-sm py-1 rounded-full text-caption font-caption font-medium transition-colors ${
                  active === item.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-text-secondary hover:text-on-surface'
                }`}
              >
                {item.label.replace(/^\d+\.\s/, '')}
              </button>
            ))}
          </div>
        </nav>

        <article className="flex flex-col gap-space-md">
          {SECTIONS.map((item) => (
            <section
              key={item.id}
              id={'term-' + item.id}
              className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm scroll-mt-24"
            >
              <h2 className="text-heading-sm font-heading-sm text-text-primary font-semibold mb-space-2xs">
                {item.label}
              </h2>
              <div className="flex flex-col gap-space-xs">
                {(BODY[item.id] ?? []).map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="text-body-md font-body-md text-text-secondary leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <p className="text-caption font-caption text-text-secondary text-center pb-4">
          &copy; 2026 VEMTAP Technologies. All rights reserved.
        </p>
      </main>
    </AppScreen>
  );
}
