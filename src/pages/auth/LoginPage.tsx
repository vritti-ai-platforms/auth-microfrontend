import { zodResolver } from '@hookform/resolvers/zod';
import { scheduleTokenRefresh, setToken } from '@vritti/quantum-ui/axios';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, FieldLabel, Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Lock, Mail } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthDivider } from '../../components/auth/AuthDivider';
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons';
import { useLogin } from '../../hooks/useLogin';
import type { LoginFormData } from '../../schemas/auth';
import { loginSchema } from '../../schemas/auth';
import { OnboardingStep } from '../../services/auth.service';

/**
 * Mapping of onboarding steps to their respective routes
 */
const STEP_ROUTES: Record<string, string> = {
  [OnboardingStep.EMAIL_VERIFICATION]: '/onboarding/verify-email',
  [OnboardingStep.SET_PASSWORD]: '/onboarding/set-password',
  [OnboardingStep.PHONE_VERIFICATION]: '/onboarding/verify-mobile',
  [OnboardingStep.MFA_SETUP]: '/onboarding/mfa-setup',
  [OnboardingStep.COMPLETED]: '/dashboard',
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useLogin({
    onSuccess: (response) => {
      // Store access token
      if (response.accessToken) {
        setToken(response.accessToken);
        if (response.expiresIn) {
          scheduleTokenRefresh(response.expiresIn);
        }
      }

      // Navigate based on onboarding status
      if (response.requiresOnboarding && response.onboardingStep) {
        const stepRoute = STEP_ROUTES[response.onboardingStep];
        navigate(stepRoute || '/onboarding/verify-email', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    },
  });

  // Pre-fill email if coming from signup page
  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      form.setValue('email', emailFromState);
    }
  }, [location.state?.email, form]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Welcome back
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Sign in to your Vritti Cloud account
        </Typography>
      </div>

      {/* Form */}
      <Form form={form} mutation={loginMutation}>
        <FieldGroup>
          <TextField
            name="email"
            label="Email"
            placeholder="Enter your email"
            startAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
          />

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Password</FieldLabel>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                Forgot?
              </Link>
            </div>
            <PasswordField
              name="password"
              placeholder="Enter your password"
              startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            />
          </Field>

          <Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground">
              Sign In
            </Button>
          </Field>
        </FieldGroup>
      </Form>

      {/* Divider */}
      <AuthDivider />

      {/* Social Auth */}
      <SocialAuthButtons />

      {/* Footer */}
      <div className="text-center">
        <Typography variant="body2" align="center" intent="muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
            Create one
          </Link>
        </Typography>
      </div>
    </div>
  );
};
