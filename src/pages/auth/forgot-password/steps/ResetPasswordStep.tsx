import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { KeyRound } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { ResetPasswordFormData } from '../../../../schemas/auth';
import { resetPasswordSchema } from '../../../../schemas/auth';
import type { PasswordResetFlow } from '../../../../hooks';

interface ResetPasswordStepProps {
  submitPassword: PasswordResetFlow['submitPassword'];
  resetPasswordMutation: PasswordResetFlow['resetPasswordMutation'];
}

export const ResetPasswordStep: React.FC<ResetPasswordStepProps> = ({
  submitPassword,
  resetPasswordMutation,
}) => {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    submitPassword(data.password);
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

      <Form form={form} onSubmit={onSubmit}>
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
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Field>
        </FieldGroup>
      </Form>

      <div className="text-center">
        <Link to="../login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to Login
        </Link>
      </div>
    </div>
  );
};
