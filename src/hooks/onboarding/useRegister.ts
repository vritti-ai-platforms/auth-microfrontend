import { useMutation } from '@tanstack/react-query';
import { type OnboardingStatusResponse, type RegisterDto, register } from '../../services/onboarding.service';

export function useRegister() {
  return useMutation<OnboardingStatusResponse, Error, RegisterDto>({
    mutationFn: register,
  });
}
