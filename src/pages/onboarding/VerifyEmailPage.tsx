import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@vritti/quantum-ui/Button";
import { Field, FieldGroup, FieldLabel, Form } from "@vritti/quantum-ui/Form";
import { OTPField } from "@vritti/quantum-ui/OTPField";
import { Typography } from "@vritti/quantum-ui/Typography";
import type React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { MultiStepProgressIndicator } from "../../components/onboarding/MultiStepProgressIndicator";
import { useOnboarding } from "../../context";
import { useResendEmailOtp, useResendTimer, useVerifyEmail } from "../../hooks";
import type { OTPFormData } from "../../schemas/auth";
import { otpSchema } from "../../schemas/auth";

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { email, refetch, signupMethod } = useOnboarding();
  const { secondsRemaining, isResendAvailable, reset: resetTimer } = useResendTimer({
    initialSeconds: 30,
  });

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

  const resendOtpMutation = useResendEmailOtp({
    onSuccess: () => {
      form.reset();
      resetTimer();
    },
  });

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  return (
    <div className="space-y-6">
      <MultiStepProgressIndicator currentStep={1} signupMethod={signupMethod} />

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
            onClick={() => navigate("../signup")}
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
            <Button
              variant="link"
              className="p-0 h-auto font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                form.clearErrors();
                resendOtpMutation.mutate(undefined);
              }}
              disabled={
                !isResendAvailable || resendOtpMutation.isPending || verifyEmailMutation.isPending
              }
              aria-disabled={!isResendAvailable || resendOtpMutation.isPending}
            >
              {resendOtpMutation.isPending
                ? "Sending..."
                : isResendAvailable
                  ? "Resend"
                  : `Resend in ${secondsRemaining}s`}
            </Button>
          </Typography>
        </FieldGroup>
      </Form>
    </div>
  );
};
