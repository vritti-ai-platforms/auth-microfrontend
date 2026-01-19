import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@vritti/quantum-ui/Button";
import { Field, FieldGroup, FieldLabel, Form } from "@vritti/quantum-ui/Form";
import { OTPField } from "@vritti/quantum-ui/OTPField";
import { Typography } from "@vritti/quantum-ui/Typography";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { MultiStepProgressIndicator } from "../../components/onboarding/MultiStepProgressIndicator";
import { useOnboarding } from "../../context";
import { useResendEmailOtp } from "../../hooks/useResendEmailOtp";
import { useVerifyEmail } from "../../hooks/useVerifyEmail";
import type { OTPFormData } from "../../schemas/auth";
import { otpSchema } from "../../schemas/auth";

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { email, refetch } = useOnboarding();
  const [resendSuccess, setResendSuccess] = useState(false);

  const verifyEmailMutation = useVerifyEmail({
    onSuccess: async () => {
      // Refetch onboarding status to get updated currentStep
      // OnboardingRouter will render the next step component
      await refetch();
    },
    onError: (error) => {
      console.error("Email verification failed:", error);
    },
  });
  const resendOtpMutation = useResendEmailOtp();

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleResend = async () => {
    setResendSuccess(false);
    form.clearErrors();

    try {
      await resendOtpMutation.mutateAsync(undefined);
      // Show success message
      setResendSuccess(true);
      // Reset OTP field
      form.reset();
      // Clear success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000);
    } catch {
      // Error is already handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <MultiStepProgressIndicator currentStep={1} />

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Verify your email
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          We've sent a verification code to
        </Typography>
        <div className="flex items-center justify-center gap-2">
          <Typography
            variant="body2"
            align="center"
            className="text-foreground font-medium"
          >
            {email}
          </Typography>
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80"
            onClick={() => navigate("/signup")}
          >
            Change
          </button>
        </div>
      </div>

      <Form
        form={form}
        mutation={verifyEmailMutation}
        transformSubmit={(data: OTPFormData) => data.code}
      >
        <FieldGroup>
          {/* Success message for resend OTP */}
          {resendSuccess && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <Typography
                variant="body2"
                className="text-green-800 text-center"
              >
                Verification code resent successfully. Check your email.
              </Typography>
            </div>
          )}

          <Field>
            <FieldLabel className="sr-only">Verification Code</FieldLabel>
            <OTPField
              name="code"
              onChange={(value) => {
                if (value.length === 6) {
                  form.handleSubmit((data) =>
                    verifyEmailMutation.mutateAsync(data.code),
                  )();
                }
              }}
            />
            <Typography
              variant="body2"
              intent="muted"
              className="text-center mt-2"
            >
              Enter the 6-digit verification code
            </Typography>
          </Field>

          <Field>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
            >
              Verify Email
            </Button>
          </Field>

          <Typography
            variant="body2"
            align="center"
            intent="muted"
            className="text-center"
          >
            Didn't receive the code?{" "}
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResend}
              disabled={
                resendOtpMutation.isPending || verifyEmailMutation.isPending
              }
            >
              {resendOtpMutation.isPending ? "Sending..." : "Resend"}
            </button>
          </Typography>
        </FieldGroup>
      </Form>
    </div>
  );
};
