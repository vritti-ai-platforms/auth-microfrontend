import { useMutation } from '@tanstack/react-query';
import type { OnboardingStatusResponse, RegisterDto } from '../../services/onboarding.service';
import { register } from '../../services/onboarding.service';

/**
 * Hook for registering a new user directly without auth token handling.
 * For full auth flow with token management, use useSignup from auth.service instead.
 */
export const useRegister = () => {
  return useMutation<OnboardingStatusResponse, Error, RegisterDto>({
    mutationFn: (data: RegisterDto) => register(data),
  });
};
