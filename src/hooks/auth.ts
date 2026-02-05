import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { LoginDto, LoginResponse, SignupDto, SignupResponse } from '../services/auth.service';
import { login, signup } from '../services/auth.service';

/**
 * Options type for useSignup hook
 */
type UseSignupOptions = Omit<UseMutationOptions<SignupResponse, Error, SignupDto>, 'mutationFn'>;

/**
 * Hook for user signup/registration
 *
 * @param options - Optional mutation options (onSuccess, onError, etc.)
 * @returns Mutation result with signup functionality
 *
 * @example
 * ```typescript
 * import { useSignup } from './hooks';
 * import { setToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
 *
 * const signupMutation = useSignup({
 *   onSuccess: (response) => {
 *     // Store access token
 *     setToken(response.accessToken);
 *     scheduleTokenRefresh(response.expiresIn);
 *
 *     // Navigate to onboarding
 *     navigate(`/onboarding/${response.currentStep.toLowerCase()}`);
 *   },
 * });
 *
 * const handleSubmit = (data) => {
 *   signupMutation.mutate({
 *     email: data.email,
 *     password: data.password,
 *     firstName: data.firstName,
 *     lastName: data.lastName,
 *   });
 * };
 * ```
 */
export const useSignup = (options?: UseSignupOptions) => {
  return useMutation<SignupResponse, Error, SignupDto>({
    mutationFn: (data: SignupDto) => signup(data),
    ...options,
  });
};

/**
 * Options type for useLogin hook
 */
type UseLoginOptions = Omit<UseMutationOptions<LoginResponse, Error, LoginDto>, 'mutationFn'>;

/**
 * Hook for user login/authentication
 *
 * @param options - Optional mutation options (onSuccess, onError, etc.)
 * @returns Mutation result with login functionality
 *
 * @example
 * ```typescript
 * import { useLogin } from './hooks';
 * import { setToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
 *
 * const loginMutation = useLogin({
 *   onSuccess: (response) => {
 *     // Check if MFA is required
 *     if (response.requiresMfa) {
 *       navigate('/mfa-verify', { state: { mfaChallenge: response.mfaChallenge } });
 *       return;
 *     }
 *
 *     // Check if onboarding is required
 *     if (response.requiresOnboarding) {
 *       navigate(`/onboarding/${response.onboardingStep?.toLowerCase()}`);
 *       return;
 *     }
 *
 *     // Store access token
 *     if (response.accessToken) {
 *       setToken(response.accessToken);
 *       scheduleTokenRefresh(response.expiresIn);
 *     }
 *
 *     // Navigate to dashboard
 *     navigate('/dashboard');
 *   },
 * });
 *
 * const handleSubmit = (data) => {
 *   loginMutation.mutate({
 *     email: data.email,
 *     password: data.password,
 *   });
 * };
 * ```
 */
export const useLogin = (options?: UseLoginOptions) => {
  return useMutation<LoginResponse, Error, LoginDto>({
    mutationFn: (data: LoginDto) => login(data),
    ...options,
  });
};
