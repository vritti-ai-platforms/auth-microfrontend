import { Spinner } from '@vritti/quantum-ui';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { MultiStepProgressIndicator } from '../../components/onboarding/MultiStepProgressIndicator';
import {
  AuthenticatorSetup,
  BackupCodesDisplay,
  MFAMethodSelection,
  PasskeySetup,
} from '../../components/onboarding/mfa';
import { useOnboarding } from '../../context';
import { useInitiateTotpSetup, usePasskeyRegistration, useSkip2FASetup } from '../../hooks';
import type { TotpSetupResponse } from '../../services/onboarding.service';

type MFAMethod = 'authenticator' | 'passkey';
type FlowStep = 1 | 2 | 3 | 4;

/**
 * MFA Setup Flow Page
 *
 * Handles the multi-step MFA setup process during onboarding.
 * AuthenticatorSetup now owns its own verify mutation.
 */
export const MFASetupFlowPage: React.FC = () => {
  const { refetch, signupMethod } = useOnboarding();

  // Minimal state - only what's needed for UI flow
  const [currentStep, setCurrentStep] = useState<FlowStep>(1);
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(null);
  const [totpData, setTotpData] = useState<TotpSetupResponse | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupWarning, setBackupWarning] = useState<string>('');

  // Mutations - loading/error states come from these
  const initMutation = useInitiateTotpSetup();
  const skipMutation = useSkip2FASetup();
  const passkeyMutation = usePasskeyRegistration();

  // Full page reload on completion — triggers AuthProvider to re-fetch with upgraded CLOUD session
  useEffect(() => {
    if (currentStep === 4) {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleMethodSelect = (method: MFAMethod) => {
    setSelectedMethod(method);
  };

  const handleContinue = async () => {
    if (selectedMethod === 'authenticator') {
      try {
        const data = await initMutation.mutateAsync();
        setTotpData(data);
        setCurrentStep(2);
      } catch {
        // Error is available via initMutation.error
      }
    } else if (selectedMethod === 'passkey') {
      // Move to passkey setup step
      setCurrentStep(2);
    }
  };

  const handleSkip = async () => {
    try {
      await skipMutation.mutateAsync();
      setCurrentStep(4);
    } catch {
      // Error is available via skipMutation.error
    }
  };

  const handleBack = () => {
    setTotpData(null);
    setCurrentStep(1);
    initMutation.reset();
    passkeyMutation.reset();
  };

  // Runs the full passkey registration flow (initiate → WebAuthn → verify)
  const handlePasskeyRegister = async () => {
    try {
      const response = await passkeyMutation.mutateAsync();
      setBackupCodes(response.backupCodes);
      setBackupWarning(response.warning);
      setCurrentStep(3);
    } catch {
      // Error is available via passkeyMutation.error
    }
  };

  // Handle successful TOTP verification from AuthenticatorSetup
  const handleTotpVerifySuccess = (response: { backupCodes: string[]; warning: string }) => {
    setBackupCodes(response.backupCodes);
    setBackupWarning(response.warning);
    setCurrentStep(3);
  };

  const handleBackupCodesContinue = () => {
    setCurrentStep(4);
  };

  // Derive error messages from mutations
  const selectionError = initMutation.error?.message || skipMutation.error?.message || null;
  const passkeyError = passkeyMutation.error || null;

  // Calculate progress for indicator
  const calculateStepProgress = (): number => {
    if (currentStep === 1) return 25;
    if (currentStep === 2) return 50;
    if (currentStep === 3) return 75;
    return 100;
  };

  // Step 4: Complete
  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          All set!
        </Typography>
        <Typography variant="body2" align="center" intent="muted" className="max-w-[332px] mx-auto">
          {backupCodes
            ? 'Your account has been created and secured with multi-factor authentication.'
            : 'Your account has been created successfully. You can enable 2FA later in your settings.'}
        </Typography>
      </div>

      <div className="flex justify-center">
        <Spinner />
      </div>

      <Typography variant="body2" align="center" intent="muted">
        Redirecting you to your dashboard...
      </Typography>
    </div>
  );

  return (
    <div className="space-y-6">
      <MultiStepProgressIndicator
        currentStep={currentStep === 4 ? 4 : 3}
        stepProgress={currentStep < 4 ? { 3: calculateStepProgress() } : {}}
        signupMethod={signupMethod}
      />

      {currentStep === 1 && (
        <MFAMethodSelection
          selectedMethod={selectedMethod}
          onSelect={handleMethodSelect}
          onContinue={handleContinue}
          onSkip={handleSkip}
          isLoading={initMutation.isPending}
          isSkipping={skipMutation.isPending}
          error={selectionError}
        />
      )}

      {currentStep === 2 && selectedMethod === 'authenticator' && totpData && (
        <AuthenticatorSetup
          totpData={totpData}
          onBack={handleBack}
          onSuccess={handleTotpVerifySuccess}
        />
      )}

      {currentStep === 2 && selectedMethod === 'passkey' && (
        <PasskeySetup
          onBack={handleBack}
          onRegister={handlePasskeyRegister}
          isPending={passkeyMutation.isPending}
          error={passkeyError}
        />
      )}

      {currentStep === 3 && backupCodes && (
        <BackupCodesDisplay backupCodes={backupCodes} warning={backupWarning} onContinue={handleBackupCodesContinue} />
      )}

      {currentStep === 4 && renderCompleteStep()}
    </div>
  );
};
