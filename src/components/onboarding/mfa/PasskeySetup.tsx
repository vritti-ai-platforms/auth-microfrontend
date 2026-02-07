import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, ArrowLeft, Fingerprint } from 'lucide-react';
import type React from 'react';

interface PasskeySetupProps {
  onBack: () => void;
  onRegister: () => void;
  isPending: boolean;
  error: Error | null;
}

/**
 * Get user-friendly error message from WebAuthn errors
 */
const getErrorMessage = (error: Error | null): string | null => {
  if (!error) return null;

  // Handle WebAuthn-specific errors
  if (error.name === 'NotAllowedError') {
    return 'Passkey registration was cancelled. Please try again.';
  }
  if (error.name === 'NotSupportedError') {
    return 'Passkeys are not supported on this device or browser.';
  }
  if (error.name === 'SecurityError') {
    return 'Security error. Please ensure you are on a secure connection.';
  }
  if (error.name === 'InvalidStateError') {
    return 'A passkey already exists for this account on this device.';
  }
  if (error.name === 'AbortError') {
    return 'The operation was cancelled. Please try again.';
  }

  return error.message || 'An unexpected error occurred.';
};

export const PasskeySetup: React.FC<PasskeySetupProps> = ({
  onBack,
  onRegister,
  isPending,
  error,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Set up Passkey
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Use biometrics or your device PIN to sign in
        </Typography>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <Typography variant="body2" className="text-destructive">
            {getErrorMessage(error)}
          </Typography>
        </div>
      )}

      <div className="flex flex-col items-center py-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Fingerprint className="h-10 w-10 text-primary" />
        </div>
        <Typography variant="body2" intent="muted" align="center" className="max-w-[300px]">
          {isPending
            ? 'Follow the prompts on your device to create your passkey...'
            : 'When you click the button below, your device will prompt you to create a passkey using Face ID, Touch ID, or your device PIN.'}
        </Typography>
      </div>

      <Button
        onClick={onRegister}
        className="w-full bg-primary text-primary-foreground"
        isLoading={isPending}
        loadingText="Creating passkey..."
      >
        Create Passkey
      </Button>

      <Button
        variant="outline"
        onClick={onBack}
        className="w-full border-border text-foreground"
        disabled={isPending}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  );
};
