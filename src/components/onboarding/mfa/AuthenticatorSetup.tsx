import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { OTPFormData } from '../../../schemas/auth';
import { otpSchema } from '../../../schemas/auth';
import type { TotpSetupResponse } from '../../../services/onboarding.service';

interface AuthenticatorSetupProps {
  totpData: TotpSetupResponse;
  onBack: () => void;
  onVerify: (code: string) => Promise<void>;
  isVerifying: boolean;
  error: string | null;
}

export const AuthenticatorSetup: React.FC<AuthenticatorSetupProps> = ({
  totpData,
  onBack,
  onVerify,
  isVerifying,
  error,
}) => {
  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const handleSubmit = async (data: OTPFormData) => {
    await onVerify(data.code);
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        disabled={isVerifying}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to MFA options
      </button>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Setup Authenticator App
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Scan the QR code below
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

      <Form form={form} onSubmit={handleSubmit} csrfEndpoint="/csrf/token">
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
                  if (value.length === 6 && !isVerifying) {
                    form.handleSubmit(handleSubmit)();
                  }
                }}
              />
            </div>
          </div>

          <Field className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
