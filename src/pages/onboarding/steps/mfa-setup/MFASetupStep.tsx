import { useOnboarding } from '@context/onboarding';
import { usePasskeyRegistration, useSkipMFASetup } from '@hooks';
import type { BackupCodesResponse } from '@services/onboarding.service';
import type React from 'react';
import { useState } from 'react';
import { AuthenticatorSetupStep } from './steps/AuthenticatorSetupStep';
import { BackupCodesStep } from './steps/BackupCodesStep';
import { MethodSelectionStep } from './steps/MethodSelectionStep';
import { PasskeySetupStep } from './steps/PasskeySetupStep';
import { SuccessStep } from './steps/SuccessStep';

type MFAMethod = 'authenticator' | 'passkey';
type MFASubStep = 'method-selection' | 'authenticator-setup' | 'passkey-setup' | 'backup-codes' | 'success';

// Derives the active sub-step from progress + selected method
function getSubStep(progress: number, method: MFAMethod | null): MFASubStep {
  if (progress === 0) return 'method-selection';
  if (progress === 25 && method === 'authenticator') return 'authenticator-setup';
  if (progress === 25) return 'passkey-setup';
  if (progress === 50) return 'backup-codes';
  return 'success';
}

// MFA setup flow driven by OnboardingContext progress
export const MFASetupStep: React.FC = () => {
  const { progress, setProgress, refetch } = useOnboarding();
  const [method, setMethod] = useState<MFAMethod | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupWarning, setBackupWarning] = useState('');

  const skipMutation = useSkipMFASetup();
  const passkeyMutation = usePasskeyRegistration();

  // Skips MFA and goes to success
  const handleSkip = async () => {
    try {
      await skipMutation.mutateAsync();
      setProgress(75);
    } catch {
      // Error available via skipMutation.error
    }
  };

  // Returns to method selection
  const handleBack = () => {
    setProgress(0);
    passkeyMutation.reset();
  };

  // Handles successful TOTP or passkey verification
  const handleVerifySuccess = (response: BackupCodesResponse) => {
    setBackupCodes(response.backupCodes);
    setBackupWarning(response.warning);
    setProgress(50);
  };

  // Runs the full passkey registration flow
  const handlePasskeyRegister = async () => {
    try {
      const response = await passkeyMutation.mutateAsync();
      setBackupCodes(response.backupCodes);
      setBackupWarning(response.warning);
      setProgress(50);
    } catch {
      // Error available via passkeyMutation.error
    }
  };

  const selectionError = skipMutation.error?.message || null;

  switch (getSubStep(progress, method)) {
    case 'method-selection':
      return (
        <MethodSelectionStep
          onMethodSelect={(m) => {
            setMethod(m);
            setProgress(25);
          }}
          onSkip={handleSkip}
          isSkipping={skipMutation.isPending}
          error={selectionError}
        />
      );

    case 'authenticator-setup':
      return (
        <AuthenticatorSetupStep onBack={handleBack} onSuccess={handleVerifySuccess} />
      );

    case 'passkey-setup':
      return (
        <PasskeySetupStep
          onBack={handleBack}
          onRegister={handlePasskeyRegister}
          isPending={passkeyMutation.isPending}
          error={passkeyMutation.error}
        />
      );

    case 'backup-codes':
      return backupCodes ? (
        <BackupCodesStep
          backupCodes={backupCodes}
          warning={backupWarning}
          onContinue={() => setProgress(75)}
        />
      ) : null;

    case 'success':
      return (
        <SuccessStep
          hasMfa={!!backupCodes}
          onContinue={() => {
            setProgress(100);
            refetch();
          }}
        />
      );
  }
};
