import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useForgotPassword, useVerifyResetOtp } from '../../hooks';
import type { ForgotPasswordFormData, OTPFormData } from '../../schemas/auth';
import { forgotPasswordSchema, otpSchema } from '../../schemas/auth';

type Step = 'email' | 'otp';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPassword();
  const verifyResetOtpMutation = useVerifyResetOtp();

  // Email form
  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  // OTP form
  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const onEmailSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setSubmittedEmail(data.email);
      setStep('otp');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset code. Please try again.';
      setError(message);
    }
  };

  const onOtpSubmit = async (data: OTPFormData) => {
    setError(null);
    try {
      const result = await verifyResetOtpMutation.mutateAsync({
        email: submittedEmail,
        otp: data.code,
      });
      navigate(`../reset-password?token=${encodeURIComponent(result.resetToken)}&email=${encodeURIComponent(submittedEmail)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid or expired code. Please try again.';
      setError(message);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      await forgotPasswordMutation.mutateAsync(submittedEmail);
      otpForm.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend code. Please try again.';
      setError(message);
    }
  };

  // OTP verification step
  if (step === 'otp') {
    return (
      <div className="space-y-6">
        {/* Back to email step */}
        <button
          type="button"
          onClick={() => {
            setStep('email');
            setError(null);
            otpForm.reset();
          }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Verify your email
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            We sent a verification code to
          </Typography>
          <Typography variant="body2" align="center" className="text-foreground font-medium">
            {submittedEmail}
          </Typography>
        </div>

        {/* Enter verification code label */}
        <div className="text-center">
          <Typography variant="body2" className="text-foreground font-medium">
            Enter verification code
          </Typography>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <Typography variant="body2" className="text-destructive">
              {error}
            </Typography>
          </div>
        )}

        {/* OTP Form */}
        <Form form={otpForm} onSubmit={onOtpSubmit}>
          <FieldGroup>
            <div className="flex justify-center">
              <OTPField
                name="code"
                onChange={(value) => {
                  if (value.length === 6 && !verifyResetOtpMutation.isPending) {
                    otpForm.handleSubmit(onOtpSubmit)();
                  }
                }}
              />
            </div>

            <Field className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={verifyResetOtpMutation.isPending}
              >
                {verifyResetOtpMutation.isPending ? 'Verifying...' : 'Verify'}
              </Button>
            </Field>

            {/* Resend */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={handleResend}
                disabled={forgotPasswordMutation.isPending || verifyResetOtpMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? 'Sending...' : 'Resend code'}
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
  }

  // Email entry step
  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="../login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      {/* Header */}
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Reset your password
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Enter your email to receive a verification code
        </Typography>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <Typography variant="body2" className="text-destructive">
            {error}
          </Typography>
        </div>
      )}

      {/* Form */}
      <Form form={emailForm} onSubmit={onEmailSubmit}>
        <FieldGroup>
          <TextField
            name="email"
            label="Email Address"
            placeholder="you@company.com"
            startAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
          />

          <Field>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? 'Sending...' : 'Send reset code'}
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
