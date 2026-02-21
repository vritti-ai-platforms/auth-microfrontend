import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { KeyRound } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { PasswordResetFlow } from '@hooks';
import type { ResetPasswordFormData } from '@schemas/auth';
import { resetPasswordSchema } from '@schemas/auth';

interface ResetPasswordStepProps {
  resetToken: PasswordResetFlow['resetToken'];
  submitPassword: PasswordResetFlow['submitPassword'];
}

export const ResetPasswordStep: React.FC<ResetPasswordStepProps> = ({ submitPassword }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await submitPassword(data.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Reset Your Password
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Choose a strong password for your account
        </Typography>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FieldGroup>
          <PasswordField
            name="password"
            label="New Password"
            placeholder="Enter your new password"
            showStrengthIndicator
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your new password"
            showMatchIndicator
          />

          <Field>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              isLoading={isSubmitting}
              loadingText="Resetting..."
            >
              Reset Password
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <div className="text-center">
        <Link to="../login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to Login
        </Link>
      </div>
    </div>
  );
};
