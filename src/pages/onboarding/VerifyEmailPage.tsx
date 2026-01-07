import { Field, FieldGroup, FieldLabel, Form } from '@vritti/quantum-ui/Form';
import { Button } from '@vritti/quantum-ui/Button';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { useOnboarding } from '../../context';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { OTPFormData } from '../../schemas/auth';
import { otpSchema } from '../../schemas/auth';
import { MultiStepProgressIndicator } from '../../components/onboarding/MultiStepProgressIndicator';
import { verifyEmail, resendEmailOtp } from '../../services/onboarding.service';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { email, currentStep, isLoading: onboardingLoading, refetch } = useOnboarding();
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  // Navigate based on current onboarding step
  useEffect(() => {
    if (!onboardingLoading && currentStep) {
      // If email is already verified, navigate to next step
      if (currentStep === 'VERIFY_PHONE') {
        navigate('/onboarding/verify-mobile', { replace: true });
      } else if (currentStep === 'SET_PASSWORD') {
        navigate('/onboarding/set-password', { replace: true });
      } else if (currentStep === 'MFA_SETUP') {
        navigate('/onboarding/mfa-setup', { replace: true });
      } else if (currentStep === 'COMPLETE') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [currentStep, onboardingLoading, navigate]);

  const onSubmit = async (data: OTPFormData) => {
    await verifyEmail(data.code);
    // Refetch onboarding status to get updated currentStep
    // useEffect will then navigate to the next step
    await refetch();
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);
    form.clearErrors();

    await resendEmailOtp();

    // Show success message
    setResendSuccess(true);

    // Reset OTP field
    form.reset();

    // Clear success message after 3 seconds
    setTimeout(() => setResendSuccess(false), 3000);
    setIsResending(false);
  };

  return (
    <div className="space-y-6">
      <MultiStepProgressIndicator currentStep={1} />

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Verify your email
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          We've sent a verification code to
        </Typography>
        <div className="flex items-center justify-center gap-2">
          <Typography variant="body2" align="center" className="text-foreground font-medium">
            {email}
          </Typography>
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80"
            onClick={() => navigate('/signup')}
          >
            Change
          </button>
        </div>
      </div>

      <Form form={form} onSubmit={onSubmit} csrfEndpoint="/csrf/token">
        <FieldGroup>
          {/* Success message for resend OTP */}
          {resendSuccess && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <Typography variant="body2" className="text-green-800 text-center">
                Verification code resent successfully. Check your email.
              </Typography>
            </div>
          )}

          <Field>
            <FieldLabel className="sr-only">Verification Code</FieldLabel>
            <OTPField
              name="code"
              onChange={(value) => {
                if (value.length === 6) {
                  form.handleSubmit(onSubmit)();
                }
              }}
            />
            <Typography variant="body2" intent="muted" className="text-center mt-2">
              Enter the 6-digit verification code
            </Typography>
          </Field>

          <Field>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={form.formState.isSubmitting || onboardingLoading}
            >
              {form.formState.isSubmitting ? 'Verifying...' : 'Verify Email'}
            </Button>
          </Field>

          <Typography variant="body2" align="center" intent="muted" className="text-center">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResend}
              disabled={isResending || form.formState.isSubmitting}
            >
              {isResending ? 'Sending...' : 'Resend'}
            </button>
          </Typography>
        </FieldGroup>
      </Form>
    </div>
  );
};
