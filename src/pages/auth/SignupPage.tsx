import { zodResolver } from '@hookform/resolvers/zod';
import { setToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Loader2, Lock, Mail, User } from 'lucide-react';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthDivider } from '../../components/auth/AuthDivider';
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons';
import type { SignupFormData } from '../../schemas/auth';
import { signupSchema } from '../../schemas/auth';
import { signup } from '../../services/auth.service';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLoginButton, setShowLoginButton] = useState(false);
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = useWatch({ control: form.control, name: 'password' }) || '';

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await signup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Store access token (refresh token is in httpOnly cookie set by backend)
      if (response.accessToken) {
        setToken(response.accessToken);
        // Schedule proactive token refresh
        if (response.expiresIn) {
          scheduleTokenRefresh(response.expiresIn);
        }
      }

      // Navigate to success page with email and onboarding state
      navigate('/signup-success', {
        state: {
          email: data.email,
          isNewUser: response.isNewUser,
          signupMethod: response.signupMethod,
          currentStep: response.currentStep,
        },
      });
    } catch (error: any) {
      // Check if error is "User Already Exists"
      const errorMessage = error?.response?.data?.message || error?.message || '';
      if (
        errorMessage.toLowerCase().includes('user already exists') ||
        errorMessage.toLowerCase().includes('email already registered') ||
        errorMessage.toLowerCase().includes('account already exists')
      ) {
        setShowLoginButton(true);
      } else {
        setShowLoginButton(false);
      }

      // Let Form component handle error display
      throw error;
    }
  };

  const handleLoginInstead = () => {
    const email = form.getValues('email');
    navigate('/login', { state: { email } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Create your account
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Get started with Vritti Cloud Platform
        </Typography>
      </div>

      {/* Form */}
      <Form form={form} onSubmit={onSubmit}>
        <FieldGroup>
          {/* First Name and Last Name - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <TextField
              name="firstName"
              label="First Name"
              placeholder="John"
              startAdornment={<User className="h-3.5 w-3.5 text-muted-foreground" />}
            />

            <TextField
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              startAdornment={<User className="h-3.5 w-3.5 text-muted-foreground" />}
            />
          </div>

          {/* Work Email */}
          <TextField
            name="email"
            label="Work Email"
            type="email"
            placeholder="you@company.com"
            startAdornment={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
          />

          {/* Password */}
          <PasswordField
            name="password"
            label="Password"
            placeholder="password"
            startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            showStrengthIndicator
          />

          {/* Confirm Password */}
          <PasswordField
            name="confirmPassword"
            label="Confirm Password"
            placeholder="password"
            startAdornment={<Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            showMatchIndicator
            matchPassword={password}
          />

          {/* Submit Button */}
          <Field>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Field>

          {/* Login Instead Button - Show only if account exists */}
          {showLoginButton && (
            <Field>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleLoginInstead}
              >
                Login Instead
              </Button>
            </Field>
          )}

          {/* Terms and Conditions */}
          <Typography variant="body2" align="center" intent="muted" className="text-center">
            By creating an account, you agree to our{' '}
            <button type="button" className="text-primary hover:text-primary/80 underline">
              Terms
            </button>{' '}
            &{' '}
            <button type="button" className="text-primary hover:text-primary/80 underline">
              Privacy
            </button>
          </Typography>
        </FieldGroup>
      </Form>

      {/* Divider */}
      <AuthDivider />

      {/* Social Auth */}
      <SocialAuthButtons />

      {/* Footer */}
      <div className="text-center">
        <Typography variant="body2" align="center" intent="muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
            Sign in
          </Link>
        </Typography>
      </div>
    </div>
  );
};
