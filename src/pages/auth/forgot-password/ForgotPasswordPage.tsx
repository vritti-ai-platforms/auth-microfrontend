import type React from 'react';
import { EmailStep, OtpStep, ResetPasswordStep, SuccessStep } from './steps';
import { usePasswordResetFlow } from '../../../hooks';

export const ForgotPasswordPage: React.FC = () => {
  const flow = usePasswordResetFlow();

  return (
    <div className="space-y-6">
      {flow.step === 'email' && (
        <EmailStep submitEmail={flow.submitEmail} />
      )}

      {flow.step === 'otp' && (
        <OtpStep
          email={flow.email}
          submitOtp={flow.submitOtp}
          goBack={flow.goBack}
        />
      )}

      {flow.step === 'reset' && (
        <ResetPasswordStep
          resetToken={flow.resetToken}
          submitPassword={flow.submitPassword}
        />
      )}

      {flow.step === 'success' && <SuccessStep />}
    </div>
  );
};
