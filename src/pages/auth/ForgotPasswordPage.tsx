import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, Mail } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { ForgotPasswordFormData } from '../../schemas/auth';
import { forgotPasswordSchema } from '../../schemas/auth';

export const ForgotPasswordPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // TODO: Implement API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Password reset email sent to:', data.email);
    setSubmittedEmail(data.email);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Check your email
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            We've sent a password reset link to
          </Typography>
          <Typography variant="body2" align="center" className="text-foreground font-medium">
            {submittedEmail}
          </Typography>
        </div>

        <div className="space-y-4">
          <Typography variant="body2" align="center" intent="muted">
            Didn't receive the email? Check your spam folder or
          </Typography>
          <Button
            variant="outline"
            className="w-full border-border text-foreground"
            onClick={() => {
              setIsSuccess(false);
              form.reset();
            }}
          >
            Try another email
          </Button>
        </div>

        <Link
          to="../login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

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
          Enter your email to receive a reset link
        </Typography>
      </div>

      {/* Form */}
      <Form form={form} onSubmit={onSubmit}>
        <FieldGroup>
          <TextField
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            startAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
          />

          <Field>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Sending reset link...' : 'Send reset link'}
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
