import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '../../hooks';
import type { ResetPasswordFormData } from '../../schemas/auth';
import { resetPasswordSchema } from '../../schemas/auth';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    setError(null);
    try {
      await resetPasswordMutation.mutateAsync({
        resetToken: token,
        newPassword: data.password,
      });
      setIsSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      setError(message);
    }
  };

  // Redirect to login after success
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      navigate('../login', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [isSuccess, navigate]);

  // Missing token — invalid access
  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Invalid reset link
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            This password reset link is invalid or has expired. Please request a new one.
          </Typography>
        </div>
        <Link
          to="../forgot-password"
          className="inline-flex items-center justify-center text-sm text-primary hover:underline"
        >
          Request new reset code
        </Link>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
        </div>
        <div className="space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Password reset successful
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            Your password has been updated. Redirecting to sign in...
          </Typography>
        </div>
        <Link
          to="../login"
          className="inline-flex items-center justify-center text-sm text-primary hover:underline"
        >
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key icon */}
      <div className="flex justify-center">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Reset Your Password
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Choose a strong password for your account
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

      {/* Back to Login */}
      <div className="text-center">
        <Link
          to="../login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};
