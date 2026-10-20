import { AppScreen } from '../components/ui/AppScreen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { ForgotPinForm, forgotPinSubtitle, useForgotPin } from '../components/auth/ForgotPinForm';

interface ForgotPinScreenProps {
  onBack: () => void;
}

export function ForgotPinScreen({ onBack }: ForgotPinScreenProps) {
  const state = useForgotPin();

  return (
    <AppScreen>
      <ScreenHeader
        title="Reset PIN"
        onBack={() => (state.phase === 'code' ? state.setPhase('email') : onBack())}
      />
      <div className="flex flex-col w-full px-margin pb-space-2xl pt-space-xs flex-1 gap-space-lg">
        {state.phase !== 'done' ? (
          <div className="flex flex-col gap-space-2xs">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Forgot your PIN?</h1>
            <p className="font-body-md text-body-md text-text-secondary">{forgotPinSubtitle(state)}</p>
          </div>
        ) : null}
        <ForgotPinForm state={state} onBackToSignIn={onBack} />
      </div>
    </AppScreen>
  );
}
