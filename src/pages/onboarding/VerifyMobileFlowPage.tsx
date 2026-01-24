import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { Field, FieldGroup, FieldLabel, Form } from '@vritti/quantum-ui/Form';
import { OTPField } from '@vritti/quantum-ui/OTPField';
import { PhoneField, type PhoneValue } from '@vritti/quantum-ui/PhoneField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, CheckCircle, ChevronRight, Loader2, MessageSquare, Phone, QrCode, Smartphone } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { MultiStepProgressIndicator } from '../../components/onboarding/MultiStepProgressIndicator';
import { useOnboarding } from '../../context';
import {
  useInitiateMobileVerification,
  useMobileVerificationRealtime,
  useVerifyMobileOtp,
  useResendMobileVerification,
} from '../../hooks';
import type { VerificationMethod, MobileVerificationStatusResponse } from '../../services/onboarding.service';
import type { OTPFormData, PhoneFormData } from '../../schemas/auth';
import { otpSchema, phoneSchema } from '../../schemas/auth';

type UIVerificationMethod = 'whatsapp' | 'sms' | 'manual' | null;
type FlowStep = 1 | 2 | 3; // 1=Method Selection, 2=Verification, 3=Success

// Map UI method to API method
const mapToApiMethod = (method: UIVerificationMethod): VerificationMethod => {
  switch (method) {
    case 'whatsapp':
      return 'WHATSAPP_QR';
    case 'sms':
      return 'SMS_QR';
    case 'manual':
      return 'MANUAL_OTP';
    default:
      return 'WHATSAPP_QR';
  }
};

export const VerifyMobileFlowPage: React.FC = React.memo(() => {
  const { refetch, signupMethod } = useOnboarding();
  const [currentStep, setCurrentStep] = useState<FlowStep>(1);
  const [selectedMethod, setSelectedMethod] = useState<UIVerificationMethod>(null);
  const [phoneNumber, setPhoneNumber] = useState<PhoneValue>();
  const [phoneCountry, setPhoneCountry] = useState<string>('IN');
  const [isWaitingForVerification, setIsWaitingForVerification] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [verificationData, setVerificationData] = useState<MobileVerificationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to advance to success state and refetch after delay
  const advanceAfterSuccess = useCallback(() => {
    setCurrentStep(3);
    setIsWaitingForVerification(false);
    setTimeout(() => {
      refetch().catch((err) => {
        console.error('Failed to refetch onboarding status:', err);
      });
    }, 1500);
  }, [refetch]);

  // Phone form for manual entry
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
    },
  });

  // OTP form for manual OTP entry
  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  // API hooks
  const initiateMutation = useInitiateMobileVerification({
    onSuccess: (data) => {
      setVerificationData(data);
      setError(null);

      if (selectedMethod === 'manual') {
        // For manual OTP, show OTP input step
        setShowOtpStep(true);
      } else {
        // For WhatsApp/SMS inbound, start waiting for SSE/polling verification
        setIsWaitingForVerification(true);
      }
      setCurrentStep(2);
    },
    onError: (err) => {
      setError(err.message || 'Failed to initiate verification. Please try again.');
    },
  });

  const resendMutation = useResendMobileVerification({
    onSuccess: (data) => {
      setVerificationData(data);
      setError(null);
      otpForm.reset();
    },
    onError: (err) => {
      setError(err.message || 'Failed to resend verification. Please try again.');
    },
  });

  const verifyOtpMutation = useVerifyMobileOtp({
    onSuccess: () => {
      advanceAfterSuccess();
    },
    onError: (err) => {
      setError(err.message || 'Invalid OTP. Please try again.');
    },
  });

  // Real-time verification status via SSE
  const { connectionMode, sseError } = useMobileVerificationRealtime({
    enabled: isWaitingForVerification && (selectedMethod === 'whatsapp' || selectedMethod === 'sms'),
    onVerified: () => {
      advanceAfterSuccess();
    },
    onFailed: (message) => {
      setError(message || 'Verification failed. Please try again.');
    },
    onExpired: () => {
      setError('Verification expired. Please try again.');
      handleBackToMethods();
    },
  });

  // Handler to go back to method selection - defined before useEffects that use it
  const handleBackToMethods = useCallback(() => {
    setSelectedMethod(null);
    setIsWaitingForVerification(false);
    setShowOtpStep(false);
    setVerificationData(null);
    setError(null);
    phoneForm.reset();
    otpForm.reset();
    setCurrentStep(1);
  }, [phoneForm, otpForm]);

  // Handle SSE connection errors (show warning but continue with polling fallback)
  useEffect(() => {
    if (sseError && isWaitingForVerification) {
      console.warn('SSE connection error, using polling fallback:', sseError);
    }
  }, [sseError, isWaitingForVerification]);

  const handleMethodSelect = useCallback((method: UIVerificationMethod) => {
    if (!method) return;

    setSelectedMethod(method);
    setError(null);

    if (method === 'manual') {
      // For manual entry, go to phone number input first
      setShowOtpStep(false);
      setCurrentStep(2);
    } else {
      // For WhatsApp/SMS QR methods, initiate verification immediately (no phone needed)
      // Phone number will come from the webhook when user sends the verification message
      setCurrentStep(2);
      initiateMutation.mutate({
        method: mapToApiMethod(method),
        // No phone needed for QR methods - it comes from webhook
      });
    }
  }, [initiateMutation]);

  const handleSendOtp = useCallback(async (data: PhoneFormData) => {
    const phone = data.phone;
    setPhoneNumber(phone as PhoneValue);

    initiateMutation.mutate({
      phone,
      phoneCountry,
      method: mapToApiMethod(selectedMethod),
    });
  }, [initiateMutation, phoneCountry, selectedMethod]);

  const handleVerifyOtp = useCallback(async (data: OTPFormData) => {
    verifyOtpMutation.mutate(data.code);
  }, [verifyOtpMutation]);

  const handleResendOtp = useCallback(async () => {
    if (!phoneNumber) return;

    resendMutation.mutate({
      phone: phoneNumber as string,
      phoneCountry,
      method: mapToApiMethod(selectedMethod),
    });
  }, [phoneNumber, resendMutation, phoneCountry, selectedMethod]);

  const handleContinue = useCallback(async () => {
    // Refetch onboarding status - OnboardingRouter will render the next step (Dashboard)
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refetch onboarding status:', err);
      setError('Failed to continue. Please try again.');
    }
  }, [refetch]);

  // Memoized QR code URL for inbound methods (universal WhatsApp link)
  const qrCodeUrl = useMemo(() => {
    if (!verificationData?.verificationToken) return '';
    const token = verificationData.verificationToken;
    // Use WhatsApp business number from server response
    // This is configured on the backend via WHATSAPP_BUSINESS_NUMBER env variable
    const whatsappNumber = verificationData.whatsappNumber || '15551560440';
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(token)}`;
  }, [verificationData?.verificationToken, verificationData?.whatsappNumber]);

  // Step 1: Method Selection
  const renderMethodSelection = () => {
    const methods = [
      {
        id: 'whatsapp',
        title: 'WhatsApp QR Code',
        description: 'Scan QR code with WhatsApp',
        icon: <MessageSquare className="h-5 w-5" />,
        badge: 'Recommended',
      },
      {
        id: 'sms',
        title: 'SMS QR Code',
        description: 'Scan QR code with SMS app',
        icon: <QrCode className="h-5 w-5" />,
      },
      {
        id: 'manual',
        title: 'Enter mobile number',
        description: 'Receive OTP via SMS',
        icon: <Phone className="h-5 w-5" />,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Verify your mobile
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            Choose verification method
          </Typography>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {methods.map((method) => (
            <button
              type="button"
              key={method.id}
              onClick={() => handleMethodSelect(method.id as UIVerificationMethod)}
              className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-all flex items-center gap-4 text-left group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground">
                {method.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Typography variant="body1" className="font-medium text-foreground">
                    {method.title}
                  </Typography>
                  {method.badge && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">
                      {method.badge}
                    </span>
                  )}
                </div>
                <Typography variant="body2" intent="muted">
                  {method.description}
                </Typography>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Step 2a: WhatsApp Verification with QR Code
  const renderWhatsAppVerification = () => {
    // If no verification data yet (still initiating), show loading
    if (!verificationData || initiateMutation.isPending) {
      return (
        <div className="space-y-6">
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleBackToMethods();
            }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to methods
          </Link>

          <div className="text-center space-y-4">
            <Typography variant="h3" align="center" className="text-foreground">
              Preparing verification
            </Typography>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Typography variant="body2" align="center" intent="muted">
              Setting up WhatsApp verification...
            </Typography>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            handleBackToMethods();
          }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to methods
        </Link>

        <div className="text-center space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Scan with WhatsApp
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            Scan this QR code to send the verification message
          </Typography>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg">
              {qrCodeUrl ? (
                <QRCodeSVG value={qrCodeUrl} size={180} />
              ) : (
                <div className="w-[180px] h-[180px] bg-secondary border-2 border-border rounded-lg flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Verification Token Display */}
          {verificationData?.verificationToken && (
            <div className="text-center">
              <Typography variant="body2" intent="muted">
                Or send this code manually:
              </Typography>
              <Typography variant="h4" className="text-foreground font-mono mt-1">
                {verificationData.verificationToken}
              </Typography>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-2">
            <Typography variant="body2" className="text-foreground font-medium text-center">
              {verificationData?.instructions || 'Scan the QR code with your phone camera'}
            </Typography>
          </div>

          {/* Waiting Status */}
          {isWaitingForVerification && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <Typography variant="body2" intent="muted">
                {connectionMode === 'sse' ? 'Connected - waiting for verification...' : 'Checking for verification...'}
              </Typography>
            </div>
          )}

          {/* Alternative Method */}
          <Typography variant="body2" align="center" intent="muted" className="text-center">
            Having trouble?{' '}
            <button type="button" onClick={handleBackToMethods} className="text-primary hover:text-primary/80 font-medium">
              Try another method
            </button>
          </Typography>
        </div>
      </div>
    );
  };

  // Step 2b: SMS Verification with QR Code
  const renderSmsVerification = () => {
    // If no verification data yet (still initiating), show loading
    if (!verificationData || initiateMutation.isPending) {
      return (
        <div className="space-y-6">
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleBackToMethods();
            }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to methods
          </Link>

          <div className="text-center space-y-4">
            <Typography variant="h3" align="center" className="text-foreground">
              Preparing verification
            </Typography>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Typography variant="body2" align="center" intent="muted">
              Setting up SMS verification...
            </Typography>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            handleBackToMethods();
          }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to methods
        </Link>

        <div className="text-center space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Scan with SMS
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            Scan this QR code to send the verification SMS
          </Typography>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg">
              {qrCodeUrl ? (
                <QRCodeSVG value={qrCodeUrl} size={180} />
              ) : (
                <div className="w-[180px] h-[180px] bg-secondary border-2 border-border rounded-lg flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Verification Token Display */}
          {verificationData?.verificationToken && (
            <div className="text-center">
              <Typography variant="body2" intent="muted">
                Or send this code manually:
              </Typography>
              <Typography variant="h4" className="text-foreground font-mono mt-1">
                {verificationData.verificationToken}
              </Typography>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-2">
            <Typography variant="body2" className="text-foreground font-medium text-center">
              {verificationData?.instructions || 'Scan the QR code with your phone camera'}
            </Typography>
          </div>

          {/* Waiting Status */}
          {isWaitingForVerification && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <Typography variant="body2" intent="muted">
                {connectionMode === 'sse' ? 'Connected - waiting for verification...' : 'Checking for verification...'}
              </Typography>
            </div>
          )}

          {/* Alternative Method */}
          <Typography variant="body2" align="center" intent="muted" className="text-center">
            Having trouble?{' '}
            <button type="button" onClick={handleBackToMethods} className="text-primary hover:text-primary/80 font-medium">
              Try another method
            </button>
          </Typography>
        </div>
      </div>
    );
  };

  // Step 2c: Manual Entry (Phone Number + OTP)
  const renderManualVerification = () => {
    if (!showOtpStep) {
      // Phone number input
      return (
        <div className="space-y-6">
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleBackToMethods();
            }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to methods
          </Link>

          <div className="text-center space-y-2">
            <Typography variant="h3" align="center" className="text-foreground">
              Enter your mobile number
            </Typography>
            <Typography variant="body2" align="center" intent="muted">
              We'll send you a verification code
            </Typography>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <Form form={phoneForm} onSubmit={handleSendOtp}>
            <FieldGroup>
              <PhoneField
                name="phone"
                label="Phone Number"
                defaultCountry="IN"
                onChange={(value) => {
                  if (typeof value === 'object' && value !== null && 'country' in value) {
                    setPhoneCountry((value as { country?: string }).country || 'IN');
                  }
                }}
              />

              <Field>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={initiateMutation.isPending}
                >
                  {initiateMutation.isPending ? 'Sending Code...' : 'Send Code'}
                </Button>
              </Field>
            </FieldGroup>
          </Form>
        </div>
      );
    }

    // OTP verification
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => {
            setShowOtpStep(false);
            setVerificationData(null);
            setError(null);
            otpForm.reset();
          }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="text-center space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Verify your mobile
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            Enter the code sent to
          </Typography>
          <Typography variant="body2" align="center" className="text-foreground font-medium">
            {phoneNumber}
          </Typography>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <Form form={otpForm} onSubmit={handleVerifyOtp}>
          <FieldGroup>
            <div className="flex justify-center">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>

            <Field>
              <FieldLabel className="sr-only">Verification Code</FieldLabel>
              <OTPField
                name="code"
                onChange={(value) => {
                  setError(null);
                  if (value.length === 6) {
                    otpForm.handleSubmit(handleVerifyOtp)();
                  }
                }}
              />
              <Typography variant="body2" intent="muted" className="text-center mt-2">
                Enter the 6-digit code sent via SMS
              </Typography>
            </Field>

            <Field>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </Field>

            <div className="flex justify-center gap-4 text-sm">
              <Button
                variant="link"
                className="p-0 h-auto font-normal underline"
                onClick={() => {
                  setShowOtpStep(false);
                  setVerificationData(null);
                  setError(null);
                  otpForm.reset();
                }}
              >
                Change number
              </Button>
              <Button
                variant="link"
                className="p-0 h-auto font-normal underline"
                onClick={handleResendOtp}
                disabled={resendMutation.isPending}
              >
                {resendMutation.isPending ? 'Sending...' : 'Resend code'}
              </Button>
            </div>
          </FieldGroup>
        </Form>
      </div>
    );
  };

  // Step 3: Success
  const renderSuccess = () => (
    <div className="space-y-6">
      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Title and Message */}
        <div className="space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Mobile verified
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            Your mobile number has been successfully verified
          </Typography>
          {phoneNumber && (
            <Typography variant="body2" align="center" className="text-foreground font-medium">
              {phoneNumber}
            </Typography>
          )}
        </div>

        {/* Continue Button */}
        <Button onClick={handleContinue} className="w-full bg-primary text-primary-foreground">
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );

  // Memoized sub-step progress for step 2 (Verify Mobile)
  const stepProgress = useMemo((): number => {
    if (currentStep === 1) return 33; // Method Selection
    if (currentStep === 2) return 66; // Verification in progress
    return 100; // Success
  }, [currentStep]);

  return (
    <div className="space-y-6">
      <MultiStepProgressIndicator currentStep={2} stepProgress={{ 2: stepProgress }} signupMethod={signupMethod} />

      {currentStep === 1 && renderMethodSelection()}
      {currentStep === 2 && selectedMethod === 'whatsapp' && renderWhatsAppVerification()}
      {currentStep === 2 && selectedMethod === 'sms' && renderSmsVerification()}
      {currentStep === 2 && selectedMethod === 'manual' && renderManualVerification()}
      {currentStep === 3 && renderSuccess()}
    </div>
  );
});
