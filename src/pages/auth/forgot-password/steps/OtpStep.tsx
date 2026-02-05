import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { OTPFormData } from '../../../../schemas/auth';
import { otpSchema } from '../../../../schemas/auth';
import { useResendTimer, type PasswordResetFlow } from '../../../../hooks';

interface OtpStepProps {
  email: PasswordResetFlow['email'];
  submitOtp: PasswordResetFlow['submitOtp'];
  resendOtp: PasswordResetFlow['resendOtp'];
  goBack: PasswordResetFlow['goBack'];
  forgotPasswordMutation: PasswordResetFlow['forgotPasswordMutation'];
  verifyOtpMutation: PasswordResetFlow['verifyOtpMutation'];
}

export const OtpStep: React.FC<OtpStepProps> = ({
  email,
  submitOtp,
  resendOtp,
  goBack,
  forgotPasswordMutation,
  verifyOtpMutation,
}) => {
  const { secondsRemaining, isResendAvailable, reset: resetTimer } = useResendTimer({
    initialSeconds: 30,
  });

  // Track previous isSuccess state to detect successful resend
  const prevIsSuccess = useRef(forgotPasswordMutation.isSuccess);

  useEffect(() => {
    // Reset timer when resend succeeds (isSuccess changes from false to true)
    if (forgotPasswordMutation.isSuccess && !prevIsSuccess.current) {
      resetTimer();
    }
    prevIsSuccess.current = forgotPasswordMutation.isSuccess;
  }, [forgotPasswordMutation.isSuccess, resetTimer]);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = (data: OTPFormData) => {
    submitOtp(data.code);
  };

  const handleBack = () => {
    form.reset();
    goBack();
  };

  const handleResend = () => {
    form.reset();
    resendOtp();
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Verify your email
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          We sent a verification code to
        </Typography>
        <Typography variant="body2" align="center" className="text-foreground font-medium">
          {email}
        </Typography>
      </div>

      <div className="text-center">
        <Typography variant="body2" className="text-foreground font-medium">
          Enter verification code
        </Typography>
      </div>

      <Form form={form} onSubmit={onSubmit}>
        <FieldGroup>
          <div className="flex justify-center">
            <OTPField
              name="code"
              onChange={(value) => {
                if (value.length === 6 && !verifyOtpMutation.isPending) {
                  form.handleSubmit(onSubmit)();
                }
              }}
            />
          </div>

          <Field className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify'}
            </Button>
          </Field>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResend}
              disabled={!isResendAvailable || forgotPasswordMutation.isPending || verifyOtpMutation.isPending}
              aria-disabled={!isResendAvailable || forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending
                ? 'Sending...'
                : isResendAvailable
                  ? 'Resend code'
                  : `Resend code in ${secondsRemaining}s`}
            </Button>
          </div>
        </FieldGroup>
      </Form>

      <Link
        to="../login"
        className="flex justify-center items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
};
