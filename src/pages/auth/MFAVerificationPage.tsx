import { scheduleTokenRefresh, setToken } from "@vritti/quantum-ui/axios";
import { Button } from "@vritti/quantum-ui/Button";
import { Typography } from "@vritti/quantum-ui/Typography";
import { ArrowLeft } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MethodSwitcher,
  PasskeyVerification,
  SMSVerification,
  TOTPVerification,
} from "../../components/auth/mfa-verification";
import {
  useSendSmsCode,
  useVerifyPasskey,
  useVerifySms,
  useVerifyTotp,
} from "../../hooks";
import { STEP_ROUTES } from "../../constants/routes";
import {
  type MFAChallenge,
  type MFAMethod,
  OnboardingStep,
} from "../../services/auth.service";

/**
 * MFA Verification Page
 *
 * Single page that handles all MFA verification methods (TOTP, SMS, Passkey).
 * Receives challenge data via location.state from LoginPage.
 */
export const MFAVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get MFA challenge from location state
  const mfaChallenge = location.state?.mfaChallenge as MFAChallenge | undefined;

  // Current active MFA method
  const [activeMethod, setActiveMethod] = useState<MFAMethod>(
    mfaChallenge?.defaultMethod || "totp",
  );

  // Error state for display
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if no MFA challenge
  useEffect(() => {
    if (!mfaChallenge) {
      navigate("../login", { replace: true });
    }
  }, [mfaChallenge, navigate]);

  // Handle successful MFA verification
  const handleMFASuccess = (response: {
    accessToken?: string;
    expiresIn?: number;
    requiresOnboarding?: boolean;
    onboardingStep?: OnboardingStep;
  }) => {
    // Store access token
    if (response.accessToken) {
      setToken(response.accessToken);
      if (response.expiresIn) {
        scheduleTokenRefresh(response.expiresIn);
      }
    }

    // Navigate based on onboarding status
    if (response.requiresOnboarding && response.onboardingStep) {
      const stepRoute = STEP_ROUTES[response.onboardingStep];
      navigate(stepRoute ? `../${stepRoute}` : "../onboarding/verify-email", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // TOTP verification mutation
  const totpMutation = useVerifyTotp({
    onSuccess: handleMFASuccess,
    onError: (err) => {
      setError(err.message || "Invalid code. Please try again.");
    },
  });

  // SMS mutations
  const sendSmsMutation = useSendSmsCode({
    onError: (err) => {
      setError(err.message || "Failed to send SMS. Please try again.");
    },
  });

  const smsVerifyMutation = useVerifySms({
    onSuccess: handleMFASuccess,
    onError: (err) => {
      setError(err.message || "Invalid code. Please try again.");
    },
  });

  // Passkey verification mutation
  const passkeyMutation = useVerifyPasskey({
    onSuccess: handleMFASuccess,
  });

  // Clear error when switching methods
  const handleMethodChange = (method: MFAMethod) => {
    setError(null);
    setActiveMethod(method);
  };

  // Handle TOTP verification
  const handleTotpVerify = async (code: string) => {
    if (!mfaChallenge) return;
    setError(null);
    await totpMutation.mutateAsync({
      sessionId: mfaChallenge.sessionId,
      code,
    });
  };

  // Handle SMS code send
  const handleSendSms = async () => {
    if (!mfaChallenge) return;
    setError(null);
    await sendSmsMutation.mutateAsync(mfaChallenge.sessionId);
  };

  // Handle SMS verification
  const handleSmsVerify = async (code: string) => {
    if (!mfaChallenge) return;
    setError(null);
    await smsVerifyMutation.mutateAsync({
      sessionId: mfaChallenge.sessionId,
      code,
    });
  };

  // Handle Passkey verification
  const handlePasskeyVerify = async () => {
    if (!mfaChallenge) return;
    setError(null);
    await passkeyMutation.mutateAsync(mfaChallenge.sessionId);
  };

  // Don't render if no challenge (will redirect)
  if (!mfaChallenge) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back to Login Link */}
      <Button
        variant="link"
        className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link to="../login" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </Button>

      {/* Header */}
      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Two-factor authentication
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Verify your identity to continue
        </Typography>
      </div>

      {/* Active Verification Method */}
      <div className="pt-2">
        {activeMethod === "totp" && (
          <TOTPVerification
            onVerify={handleTotpVerify}
            isVerifying={totpMutation.isPending}
            error={error}
          />
        )}

        {activeMethod === "sms" && (
          <SMSVerification
            maskedPhone={mfaChallenge.maskedPhone || "+** *** ****"}
            onSendCode={handleSendSms}
            onVerify={handleSmsVerify}
            isSending={sendSmsMutation.isPending}
            isVerifying={smsVerifyMutation.isPending}
            error={error}
          />
        )}

        {activeMethod === "passkey" && (
          <PasskeyVerification
            onVerify={handlePasskeyVerify}
            isVerifying={passkeyMutation.isPending}
            error={passkeyMutation.error}
          />
        )}
      </div>

      {/* Method Switcher */}
      <MethodSwitcher
        currentMethod={activeMethod}
        availableMethods={mfaChallenge.availableMethods}
        onMethodChange={handleMethodChange}
      />
    </div>
  );
};
