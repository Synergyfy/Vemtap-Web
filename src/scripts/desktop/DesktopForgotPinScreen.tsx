import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';
import { ForgotPinForm, forgotPinSubtitle, useForgotPin } from '../../components/auth/ForgotPinForm';

interface DesktopForgotPinScreenProps {
  onBack: () => void;
}

export function DesktopForgotPinScreen({ onBack }: DesktopForgotPinScreenProps) {
  const state = useForgotPin();

  return (
    <div className="w-full min-h-screen bg-surface font-body-md text-on-surface antialiased flex items-center justify-center p-space-md sm:p-space-xl">
      <main className="w-full max-w-md rounded-xl bg-surface-canvas shadow-xl p-space-xl flex flex-col gap-space-lg">
        <div className="flex items-center justify-between">
          <Logo className="h-7 w-auto" />
          <button
            type="button"
            onClick={() => (state.phase === 'code' ? state.setPhase('email') : onBack())}
            className="inline-flex items-center gap-space-2xs font-label-md text-label-md text-text-secondary hover:text-text-primary"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Back
          </button>
        </div>
        {state.phase !== 'done' ? (
          <div className="flex flex-col gap-space-2xs">
            <h1 className="font-heading-lg text-heading-lg text-text-primary">Forgot your PIN?</h1>
            <p className="font-body-md text-body-md text-text-secondary">{forgotPinSubtitle(state)}</p>
          </div>
        ) : null}
        <ForgotPinForm state={state} onBackToSignIn={onBack} />
      </main>
    </div>
  );
}
