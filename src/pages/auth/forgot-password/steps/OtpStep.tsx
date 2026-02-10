import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { OTPFormData } from '../../../../schemas/auth';
import { otpSchema } from '../../../../schemas/auth';
import type { PasswordResetFlow } from '../../../../hooks';
import { useState } from 'react';

interface OtpStepProps {
  email: PasswordResetFlow['email'];
  submitOtp: PasswordResetFlow['submitOtp'];
  resendOtp: PasswordResetFlow['resendOtp'];
  goBack: PasswordResetFlow['goBack'];
}

export const OtpStep: React.FC<OtpStepProps> = ({
  email,
  submitOtp,
  resendOtp,
  goBack,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const handleBack = () => {
    form.reset();
    goBack();
  };

  const handleSubmit = async (data: OTPFormData) => {
    setIsSubmitting(true);
    try {
      await submitOtp(data.code);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    form.reset();
    try {
      await resendOtp();
    } finally {
      setIsResending(false);
    }
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

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FieldGroup>
          <div className="flex justify-center">
            <OTPField
              name="code"
              onChange={(value) => {
                if (value.length === 6 && !isSubmitting) {
                  // Auto-submit when 6 digits entered
                  submitOtp(value).catch(() => {
                    // Error handling is done in the flow hook
                  });
                }
              }}
            />
          </div>

          <Field className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              isLoading={isSubmitting}
              loadingText="Verifying..."
            >
              Verify
            </Button>
          </Field>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={handleResend}
              isLoading={isResending}
              loadingText="Sending..."
              disabled={isSubmitting}
            >
              Resend code
            </Button>
          </div>
        </FieldGroup>
      </form>

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
