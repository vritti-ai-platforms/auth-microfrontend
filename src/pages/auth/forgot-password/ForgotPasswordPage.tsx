import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle } from 'lucide-react';
import type React from 'react';
import { EmailStep, OtpStep, ResetPasswordStep, SuccessStep } from './steps';
import { usePasswordResetFlow } from '../../../hooks';

export const ForgotPasswordPage: React.FC = () => {
  const flow = usePasswordResetFlow();

  return (
    <div className="space-y-6">
      {flow.error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <Typography variant="body2" className="text-destructive">
            {flow.error}
          </Typography>
        </div>
      )}

      {flow.step === 'email' && (
        <EmailStep
          submitEmail={flow.submitEmail}
          forgotPasswordMutation={flow.forgotPasswordMutation}
        />
      )}

      {flow.step === 'otp' && (
        <OtpStep
          email={flow.email}
          submitOtp={flow.submitOtp}
          resendOtp={flow.resendOtp}
          goBack={flow.goBack}
          forgotPasswordMutation={flow.forgotPasswordMutation}
          verifyOtpMutation={flow.verifyOtpMutation}
        />
      )}

      {flow.step === 'reset' && (
        <ResetPasswordStep
          submitPassword={flow.submitPassword}
          resetPasswordMutation={flow.resetPasswordMutation}
        />
      )}

      {flow.step === 'success' && <SuccessStep />}
    </div>
  );
};
