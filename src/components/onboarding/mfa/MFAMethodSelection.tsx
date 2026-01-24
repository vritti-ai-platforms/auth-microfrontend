import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, KeyRound, Loader2, Smartphone } from 'lucide-react';
import type React from 'react';

type MFAMethod = 'authenticator' | 'passkey';

interface MFAMethodSelectionProps {
  selectedMethod: MFAMethod | null;
  onSelect: (method: MFAMethod) => void;
  onContinue: () => void;
  onSkip: () => void;
  isLoading: boolean;
  isSkipping: boolean;
  error: string | null;
}

export const MFAMethodSelection: React.FC<MFAMethodSelectionProps> = ({
  selectedMethod,
  onSelect,
  onContinue,
  onSkip,
  isLoading,
  isSkipping,
  error,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Secure your account
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Add multi-factor authentication
        </Typography>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <Typography variant="body2" className="text-destructive">
            {error}
          </Typography>
        </div>
      )}

      <div className="space-y-3">
        <label
          className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedMethod === 'authenticator' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            type="radio"
            name="mfa"
            value="authenticator"
            checked={selectedMethod === 'authenticator'}
            onChange={() => onSelect('authenticator')}
            className="mt-1 h-4 w-4 text-primary focus:ring-primary"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-foreground" />
              <Typography variant="body1" className="font-medium text-foreground">
                Authenticator App
              </Typography>
              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                Recommended
              </span>
            </div>
            <Typography variant="body2" intent="muted">
              Use Google Authenticator, Authy, or similar apps
            </Typography>
          </div>
        </label>

        <label
          className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedMethod === 'passkey' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            type="radio"
            name="mfa"
            value="passkey"
            checked={selectedMethod === 'passkey'}
            onChange={() => onSelect('passkey')}
            className="mt-1 h-4 w-4 text-primary focus:ring-primary"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-foreground" />
              <Typography variant="body1" className="font-medium text-foreground">
                Passkey
              </Typography>
              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                New
              </span>
            </div>
            <Typography variant="body2" intent="muted">
              Use Face ID, Touch ID, or device PIN
            </Typography>
          </div>
        </label>
      </div>

      <Typography variant="body2" align="center" intent="muted">
        Email and SMS are already verified and available as backup options
      </Typography>

      <Button
        onClick={onContinue}
        className="w-full bg-primary text-primary-foreground"
        disabled={!selectedMethod || isLoading || isSkipping}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Setting up...
          </>
        ) : (
          'Continue'
        )}
      </Button>

      <Button
        variant="outline"
        onClick={onSkip}
        className="w-full border-border text-foreground"
        disabled={isLoading || isSkipping}
      >
        {isSkipping ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Skipping...
          </>
        ) : (
          'Skip for now'
        )}
      </Button>
    </div>
  );
};
