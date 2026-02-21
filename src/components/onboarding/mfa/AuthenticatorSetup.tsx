import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVerifyTotpSetup } from '@hooks';
import type { OTPFormData } from '@schemas/auth';
import { otpSchema } from '@schemas/auth';
import type { BackupCodesResponse, TotpSetupResponse } from '@services/onboarding.service';

interface AuthenticatorSetupProps {
  /** TOTP setup data including QR code and manual key */
  totpData: TotpSetupResponse;
  /** Callback to go back to MFA method selection */
  onBack: () => void;
  /** Callback when TOTP verification succeeds */
  onSuccess: (response: BackupCodesResponse) => void;
}

/**
 * Authenticator app setup component for MFA onboarding
 *
 * Displays QR code for scanning with authenticator app and manual setup key.
 * Accepts 6-digit OTP code for verification.
 *
 * Owns its own mutation and uses Form's mutation prop for automatic error handling.
 */
export const AuthenticatorSetup: React.FC<AuthenticatorSetupProps> = ({
  totpData,
  onBack,
  onSuccess,
}) => {
  const verifyMutation = useVerifyTotpSetup({ onSuccess });

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} disabled={verifyMutation.isPending} className="inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Back to MFA options
      </Button>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Setup Authenticator App
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Scan the QR code below
        </Typography>
      </div>

      <Form
        form={form}
        mutation={verifyMutation}
        transformSubmit={(data) => data.code}
        showRootError
      >
        <FieldGroup>
          <div className="flex justify-center">
            <div className="w-[200px] h-[200px] border border-border rounded-lg p-2 bg-white">
              <img
                src={totpData.qrCodeDataUrl}
                alt="Scan this QR code with your authenticator app"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-2">
            <Typography variant="body2" className="font-medium text-foreground">
              Can't scan? Enter this key manually:
            </Typography>
            <div className="px-3 py-2 bg-secondary border border-border rounded text-sm font-mono text-foreground select-all">
              {totpData.manualSetupKey}
            </div>
            <Typography variant="body2" intent="muted" className="text-xs">
              Account: {totpData.accountName}
            </Typography>
          </div>

          <div className="space-y-4 pt-2">
            <Typography variant="body2" align="center" className="text-foreground font-medium">
              Enter the 6-digit code from your app
            </Typography>
            <div className="flex justify-center">
              <OTPField
                name="code"
                onChange={(value) => {
                  if (value.length === 6 && !verifyMutation.isPending) {
                    verifyMutation.mutate(value);
                  }
                }}
              />
            </div>
          </div>

          <Field className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              loadingText="Verifying..."
            >
              Verify & Continue
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
