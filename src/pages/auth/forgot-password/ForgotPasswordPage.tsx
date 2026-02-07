import type React from 'react';
import { EmailStep, OtpStep, ResetPasswordStep, SuccessStep } from './steps';
import { usePasswordResetFlow } from '../../../hooks';

export const ForgotPasswordPage: React.FC = () => {
  const flow = usePasswordResetFlow();

  return (
    <div className="space-y-6">
      {flow.step === 'email' && (
        <EmailStep forgotPasswordMutation={flow.forgotPasswordMutation} />
      )}

      {flow.step === 'otp' && (
        <OtpStep
          email={flow.email}
          resendOtp={flow.resendOtp}
          goBack={flow.goBack}
          forgotPasswordMutation={flow.forgotPasswordMutation}
          verifyOtpMutation={flow.verifyOtpMutation}
        />
      )}

      {flow.step === 'reset' && (
        <ResetPasswordStep
          resetToken={flow.resetToken}
          resetPasswordMutation={flow.resetPasswordMutation}
        />
      )}

      {flow.step === 'success' && <SuccessStep />}
    </div>
  );
};
