import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@vritti/quantum-ui/Button";
import { Field, FieldGroup, Form } from "@vritti/quantum-ui/Form";
import { OTPField } from "@vritti/quantum-ui/OTPField";
import { Typography } from "@vritti/quantum-ui/Typography";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import type React from "react";
import { useForm } from "react-hook-form";
import type { OTPFormData } from "../../../schemas/auth";
import { otpSchema } from "../../../schemas/auth";

interface TOTPVerificationProps {
  /** Callback when TOTP code is submitted */
  onVerify: (code: string) => Promise<void>;
  /** Whether verification is in progress */
  isVerifying: boolean;
  /** Error message to display */
  error: string | null;
}

/**
 * TOTP verification component for MFA login
 *
 * Displays authenticator app icon and 6-digit OTP input field.
 * Automatically submits when 6 digits are entered.
 */
export const TOTPVerification: React.FC<TOTPVerificationProps> = ({
  onVerify,
  isVerifying,
  error,
}) => {
  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const handleSubmit = async (data: OTPFormData) => {
    await onVerify(data.code);
  };

  return (
    <div className="space-y-6">
      {/* Icon Container */}
      <div className="flex justify-center">
        <div className="w-[52px] h-[52px] rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Description */}
      <Typography variant="body2" align="center" intent="muted">
        Enter the 6-digit code from your authenticator app
      </Typography>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <Typography variant="body2" className="text-destructive">
            {error}
          </Typography>
        </div>
      )}

      {/* OTP Form */}
      <Form form={form} onSubmit={handleSubmit}>
        <FieldGroup>
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

          <Field className="pt-2">
            <Button
              type="submit"
              className="w-full h-9 rounded-[10px] bg-primary text-primary-foreground"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};
