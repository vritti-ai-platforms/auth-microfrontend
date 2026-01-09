import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, FieldLabel, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Progress } from '@vritti/quantum-ui/Progress';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Smartphone } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { OTPFormData } from '../../schemas/auth';
import { otpSchema } from '../../schemas/auth';

export const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: OTPFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Verifying OTP:', data.code);
    navigate('/onboarding/set-password');
  };

  const handleResend = () => {
    console.log('Resending OTP');
    form.reset();
  };

  return (
    <div className="space-y-6">
      <Progress value={(2 / 6) * 100} />

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Verify your mobile
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Enter the code sent to 6301216587
        </Typography>
      </div>

      <Form form={form} onSubmit={onSubmit} csrfEndpoint="/csrf/token">
        <FieldGroup>
          <div className="flex justify-center">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>

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
              Enter the 6-digit code sent via SMS
            </Typography>
          </Field>

          <Field>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </Field>

          <div className="flex justify-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => navigate('/onboarding/mobile')}
              className="text-primary hover:text-primary/80"
            >
              Change number
            </button>
            <button type="button" onClick={handleResend} className="text-primary hover:text-primary/80">
              Resend code
            </button>
          </div>
        </FieldGroup>
      </Form>
    </div>
  );
};
