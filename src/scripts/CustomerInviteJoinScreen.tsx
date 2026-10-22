import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { Logo } from '../components/ui/Logo';
import { hasApiConfig } from '../services/api/client';
import {
  lookupCustomerInvite,
  registerCustomerViaInvite,
  type InviteLookup,
  type InviteRegistrationResult,
} from './customerInviteService';

interface CustomerInviteJoinScreenProps {
  /** Business slug parsed from /join/{slug} by the router. */
  businessSlug: string;
  /** Invite token parsed from the ?invite= query parameter. */
  inviteToken: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  'w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-text-tertiary outline-none focus:bg-surface-canvas shadow-sm transition-all';

/**
 * Public invite registration page — reached from a customer invite link
 * (/join/{business-slug}?invite=TOKEN). Works signed-out; see
 * customerInviteService.ts for the endpoints (and the demo-build mock).
 */
export function CustomerInviteJoinScreen({ businessSlug, inviteToken }: CustomerInviteJoinScreenProps) {
  const [lookup, setLookup] = useState<InviteLookup | null | undefined>(undefined);
  const linkValid = Boolean(lookup?.valid);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InviteRegistrationResult | null>(null);
  const [focusEmail, setFocusEmail] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLookup(undefined);
    void lookupCustomerInvite(businessSlug, inviteToken).then((next) => {
      if (!cancelled) setLookup(next);
    });
    return () => {
      cancelled = true;
    };
  }, [businessSlug, inviteToken]);

  useEffect(() => {
    if (focusEmail) {
      emailRef.current?.focus();
      setFocusEmail(false);
    }
  }, [focusEmail]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    if (!name.trim()) {
      setError('Enter your full name.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 7) {
      setError('Enter a valid phone number.');
      return;
    }
    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address, or leave it empty.');
      return;
    }

    setSubmitting(true);
    try {
      const outcome = await registerCustomerViaInvite(businessSlug, inviteToken, {
        fullName: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
      setResult(outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setName('');
    setPhone('');
    setEmail('');
    setError(null);
  };

  const header = (
    <div className="flex flex-col items-center gap-space-xs text-center">
      <Logo variant="full" className="h-9 w-auto" alt="VEMTAP" />
      <span className="px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold tracking-wide">
        Customer Invite
      </span>
    </div>
  );

  /* ── Checking the link ─────────────────────────────────────────────────── */
  if (lookup === undefined) {
    return (
      <AppScreen>
        <div className="flex-1 flex items-center justify-center px-margin pb-24">
          <Icon name="progress_activity" className="text-[28px] text-text-tertiary animate-spin" />
        </div>
      </AppScreen>
    );
  }

  /* ── Invalid / incomplete link ─────────────────────────────────────────── */
  if (!linkValid) {
    return (
      <AppScreen>
        <div className="flex-1 flex flex-col items-center justify-center px-margin pb-24">
          <div className="w-full max-w-[440px] bg-surface-canvas rounded-2xl shadow-sm border border-border-subtle p-space-lg flex flex-col items-center gap-space-sm text-center">
            <span className="w-14 h-14 rounded-2xl bg-surface-subtle flex items-center justify-center">
              <Icon name="link_off" className="text-[28px] text-text-tertiary" />
            </span>
            <h1 className="font-heading-md text-heading-md text-on-surface">This invite link isn&apos;t valid</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Ask the business to send you a fresh invite link, then open it again to join.
            </p>
          </div>
        </div>
      </AppScreen>
    );
  }

  const businessName = lookup!.businessName;


  /* ── Success: email provided ───────────────────────────────────────────── */
  if (result?.outcome === 'email-invite-pending') {
    return (
      <AppScreen>
        <div className="flex-1 flex flex-col items-center justify-center px-margin pb-24">
          <div className="w-full max-w-[440px] bg-surface-canvas rounded-2xl shadow-sm border border-border-subtle p-space-lg flex flex-col items-center gap-space-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <span className="w-14 h-14 rounded-2xl bg-badge-discount-bg flex items-center justify-center">
              <Icon name="mark_email_read" className="text-[28px] text-badge-discount-text" />
            </span>
            <h1 className="font-heading-md text-heading-md text-on-surface">
              You&apos;re on the list, {name.trim().split(' ')[0]}!
            </h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              {businessName} has received your details. We&apos;ll send an email invitation to{' '}
              <span className="font-semibold text-on-surface">{email.trim()}</span> so you can finish setting up your
              account and access your VEMTAP customer dashboard.
            </p>
            {result.isMock && (
              <p className="font-caption text-caption text-text-tertiary leading-relaxed">
                Preview state — no email is sent until the backend invite service is connected.
              </p>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="mt-space-xs w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all"
            >
              <Icon name="check" className="text-[18px]" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </AppScreen>
    );
  }

  /* ── Success: no email provided ────────────────────────────────────────── */
  if (result?.outcome === 'details-submitted') {
    return (
      <AppScreen>
        <div className="flex-1 flex flex-col items-center justify-center px-margin pb-24">
          <div className="w-full max-w-[440px] bg-surface-canvas rounded-2xl shadow-sm border border-border-subtle p-space-lg flex flex-col items-center gap-space-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <span className="w-14 h-14 rounded-2xl bg-badge-discount-bg flex items-center justify-center">
              <Icon name="task_alt" className="text-[28px] text-badge-discount-text" />
            </span>
            <h1 className="font-heading-md text-heading-md text-on-surface">Details submitted</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              {businessName} has added you as a customer. You don&apos;t need a VEMTAP login right now — your details
              are saved with the business.
            </p>
            <div className="w-full rounded-xl bg-surface-subtle p-space-sm flex flex-col gap-space-xs text-left">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Want to access your customer dashboard later?
              </span>
              <span className="font-caption text-caption text-text-secondary leading-relaxed">
                Add your email and complete registration — we&apos;ll then invite you to set up your VEMTAP account.
              </span>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setFocusEmail(true);
                }}
                className="mt-space-2xs h-10 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs active:scale-[0.98] transition-all"
              >
                <Icon name="mail_add" className="text-[16px]" />
                <span>Add email &amp; register</span>
              </button>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="w-full h-11 rounded-xl bg-surface-container-high text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all"
            >
              <Icon name="check" className="text-[18px]" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </AppScreen>
    );
  }


  /* ── Registration form ─────────────────────────────────────────────────── */
  return (
    <AppScreen>
      <div className="flex-1 flex flex-col items-center px-margin pt-space-lg pb-24">
        <div className="w-full max-w-[440px] flex flex-col gap-space-md">
          {header}

          <div className="bg-surface-canvas rounded-2xl shadow-sm border border-border-subtle p-space-md flex flex-col items-center gap-space-xs text-center">
            <span className="w-14 h-14 rounded-2xl bg-surface-tint-blue flex items-center justify-center">
              <Icon name="storefront" className="text-[26px] text-primary" />
            </span>
            <h1 className="font-heading-md text-heading-md text-on-surface leading-tight">
              Join {businessName} on VEMTAP
            </h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Enter your details to connect with {businessName}. They&apos;ll be added as a customer of the business.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-surface-canvas rounded-2xl shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-sm"
            noValidate
          >
            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Full Name <span className="text-error">*</span>
              </span>
              <input
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Adebayo Ogunlesi"
                autoComplete="name"
                aria-label="Full name"
              />
            </label>

            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Phone Number <span className="text-error">*</span>
              </span>
              <input
                className={inputClass}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+234 803 000 0000"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-label="Phone number"
              />
            </label>

            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Email (optional)</span>
              <input
                ref={emailRef}
                className={inputClass}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-label="Email address, optional"
              />
              <span className="font-caption text-caption text-text-tertiary">
                Add an email to receive your VEMTAP customer dashboard invitation.
              </span>
            </label>

            {error && (
              <p role="alert" className="flex items-center gap-space-2xs font-label-sm text-label-sm text-error">
                <Icon name="error" className="text-[15px]" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-space-2xs w-full h-12 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? (
                <>
                  <Icon name="progress_activity" className="text-[18px] animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : (
                <>
                  <Icon name="person_add" className="text-[18px]" />
                  <span>Join {businessName}</span>
                </>
              )}
            </button>
            <p className="font-caption text-caption text-text-tertiary text-center leading-relaxed">
              By continuing you agree to share these details with {businessName}.
              {hasApiConfig() ? '' : ' This is a preview — nothing is submitted until the backend invite service is connected.'}
            </p>
          </form>
        </div>
      </div>
    </AppScreen>
  );
}
