import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type OnboardingStatusResponse, type RegisterDto, register } from '../../services/onboarding.service';

export function useRegister() {
  return useMutation<OnboardingStatusResponse, AxiosError, RegisterDto>({
    mutationFn: register,
  });
}
