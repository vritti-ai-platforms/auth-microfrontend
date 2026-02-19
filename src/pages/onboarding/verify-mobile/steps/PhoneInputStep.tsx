import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import { PhoneField } from '@vritti/quantum-ui/PhoneField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useInitiateMobileVerification } from '../../../../hooks';
import type { PhoneFormData } from '../../../../schemas/auth';
import { phoneSchema } from '../../../../schemas/auth';

interface PhoneInputStepProps {
  onSuccess: (phoneNumber: PhoneValue, phoneCountry: string) => void;
  onBack: () => void;
}

// Phone number input form - manages own form and mutation
export const PhoneInputStep: React.FC<PhoneInputStepProps> = ({ onSuccess, onBack }) => {
  // Internal state management
  const [phoneCountry, setPhoneCountry] = useState<string>('IN');
  const [error, setError] = useState<string | null>(null);

  // Form management
  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  // Initiate verification mutation
  const initiateMutation = useInitiateMobileVerification({
    onSuccess: () => {
      const phone = form.getValues('phone');
      onSuccess(phone as PhoneValue, phoneCountry);
    },
    onError: (err) => {
      const errorMessage = (err.response?.data as { detail?: string })?.detail || 'Failed to send code';
      setError(errorMessage);
    },
  });
  return (
    <div className="space-y-6">
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to methods
      </Link>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Enter your mobile number
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          We'll send you a verification code
        </Typography>
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}

      <Form
        form={form}
        mutation={initiateMutation}
        transformSubmit={(data) => ({
          phone: data.phone,
          phoneCountry,
          method: 'manual' as const,
        })}
        showRootError
      >
        <FieldGroup>
          <PhoneField
            name="phone"
            label="Phone Number"
            defaultCountry="IN"
            onChange={(value) => {
              if (typeof value === 'object' && value !== null && 'country' in value) {
                setPhoneCountry((value as { country?: string }).country || 'IN');
              }
            }}
          />

          <Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" loadingText="Sending Code...">
              Send Code
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
