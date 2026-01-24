import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@vritti/quantum-ui/Button";
import { Field, FieldGroup, Form } from "@vritti/quantum-ui/Form";
import { OTPField } from "@vritti/quantum-ui/OTPField";
import { Typography } from "@vritti/quantum-ui/Typography";
import { AlertCircle, Loader2, Smartphone } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { OTPFormData } from "../../../schemas/auth";
import { otpSchema } from "../../../schemas/auth";

interface SMSVerificationProps {
  /** Masked phone number (e.g., "+1 *** *** 4567") */
  maskedPhone: string;
  /** Callback to send SMS code */
  onSendCode: () => Promise<void>;
  /** Callback when SMS code is submitted */
  onVerify: (code: string) => Promise<void>;
  /** Whether sending SMS is in progress */
  isSending: boolean;
  /** Whether verification is in progress */
  isVerifying: boolean;
  /** Error message to display */
  error: string | null;
}

/**
 * SMS verification component for MFA login
 *
 * Initially shows "Send SMS code" button. After sending,
 * displays OTP input field with verify button and resend link.
 */
export const SMSVerification: React.FC<SMSVerificationProps> = ({
  maskedPhone,
  onSendCode,
  onVerify,
  isSending,
  isVerifying,
  error,
}) => {
  const [codeSent, setCodeSent] = useState(false);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const handleSendCode = async () => {
    await onSendCode();
    setCodeSent(true);
    form.reset();
  };

  const handleSubmit = async (data: OTPFormData) => {
    await onVerify(data.code);
  };

  const handleResend = async () => {
    await onSendCode();
    form.reset();
  };

  return (
    <div className="space-y-6">
      {/* Icon Container */}
      <div className="flex justify-center">
        <div className="w-[52px] h-[52px] rounded-full bg-primary/10 flex items-center justify-center">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Description */}
      <Typography variant="body2" align="center" intent="muted">
        {codeSent
          ? `Enter the 6-digit code sent to ${maskedPhone}`
          : `Send verification code to ${maskedPhone}`}
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

      {!codeSent ? (
        /* Send Code Button */
        <Button
          onClick={handleSendCode}
          className="w-full h-9 rounded-[10px] bg-primary text-primary-foreground"
          disabled={isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send SMS code"
          )}
        </Button>
      ) : (
        /* OTP Form */
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

            {/* Resend Link */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={handleResend}
                disabled={isSending || isVerifying}
              >
                {isSending ? "Sending..." : "Resend code"}
              </Button>
            </div>
          </FieldGroup>
        </Form>
      )}
    </div>
  );
};
