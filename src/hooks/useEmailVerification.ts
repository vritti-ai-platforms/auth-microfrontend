import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationService } from '../services/verification.service';
import type {
  RequestChangeRequest,
  VerifyChangeRequest,
  VerifyIdentityRequest,
  ResendOtpRequest,
  RevertChangeRequest,
} from '../services/verification.service';

export function useEmailVerification() {
  const queryClient = useQueryClient();

  const requestIdentityVerification = useMutation({
    mutationFn: verificationService.requestEmailIdentityVerification,
  });

  const verifyIdentity = useMutation({
    mutationFn: (data: VerifyIdentityRequest) =>
      verificationService.verifyEmailIdentity(data),
  });

  const requestChange = useMutation({
    mutationFn: (data: RequestChangeRequest) =>
      verificationService.requestEmailChange(data),
  });

  const verifyChange = useMutation({
    mutationFn: (data: VerifyChangeRequest) =>
      verificationService.verifyEmailChange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const resendOtp = useMutation({
    mutationFn: (data: ResendOtpRequest) =>
      verificationService.resendEmailOtp(data),
  });

  const revert = useMutation({
    mutationFn: (data: RevertChangeRequest) =>
      verificationService.revertEmailChange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    requestIdentityVerification,
    verifyIdentity,
    requestChange,
    verifyChange,
    resendOtp,
    revert,
  };
}
