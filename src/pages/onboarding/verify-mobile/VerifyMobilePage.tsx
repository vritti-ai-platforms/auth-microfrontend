import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import type React from 'react';
import { useCallback, useState } from 'react';
import { MultiStepProgressIndicator } from '../../../components/onboarding/MultiStepProgressIndicator';
import { useOnboarding } from '../../../context';
import { MethodSelectionStep } from './steps/MethodSelectionStep';
import { OTPVerificationStep } from './steps/OTPVerificationStep';
import { PhoneInputStep } from './steps/PhoneInputStep';
import { QRVerificationStep } from './steps/QRVerificationStep';
import { SuccessStep } from './steps/SuccessStep';

type FlowStep = 'method-selection' | 'qr-verification' | 'phone-input' | 'otp-verification' | 'success';
type UIVerificationMethod = 'whatsapp' | 'sms' | 'manual' | null;

// Main orchestrator for mobile verification flow - manages step navigation only
export const VerifyMobilePage: React.FC = () => {
  const { refetch, signupMethod } = useOnboarding();

  // Navigation state only
  const [currentStep, setCurrentStep] = useState<FlowStep>('method-selection');
  const [selectedMethod, setSelectedMethod] = useState<UIVerificationMethod>(null);
  const [phoneNumber, setPhoneNumber] = useState<PhoneValue | undefined>();
  const [phoneCountry, setPhoneCountry] = useState<string>('IN');

  // Method selected → navigate to appropriate step
  const handleMethodSelect = useCallback((method: UIVerificationMethod) => {
    setSelectedMethod(method);

    if (method === 'whatsapp' || method === 'sms') {
      setCurrentStep('qr-verification');
    } else if (method === 'manual') {
      setCurrentStep('phone-input');
    }
  }, []);

  // QR verification succeeded → save phone and go to success
  const handleQRSuccess = useCallback(
    (phone: string) => {
      setPhoneNumber(phone as PhoneValue);
      setCurrentStep('success');
      setTimeout(() => refetch(), 1500);
    },
    [refetch],
  );

  // Phone submitted → save phone/country and go to OTP
  const handlePhoneSubmit = useCallback((phone: PhoneValue, country: string) => {
    setPhoneNumber(phone);
    setPhoneCountry(country);
    setCurrentStep('otp-verification');
  }, []);

  // OTP verified → go to success
  const handleOTPSuccess = useCallback(() => {
    setCurrentStep('success');
    setTimeout(() => refetch(), 1500);
  }, [refetch]);

  // Back to method selection from any step
  const handleBackToMethods = useCallback(() => {
    setSelectedMethod(null);
    setPhoneNumber(undefined);
    setPhoneCountry('IN');
    setCurrentStep('method-selection');
  }, []);

  // Back from OTP to phone input
  const handleBackToPhoneInput = useCallback(() => {
    setCurrentStep('phone-input');
  }, []);

  // Change number from OTP → back to phone input, clear phone
  const handleChangeNumber = useCallback(() => {
    setPhoneNumber(undefined);
    setCurrentStep('phone-input');
  }, []);

  // Continue from success
  const handleContinue = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Calculate step progress for progress indicator
  const calculateStepProgress = useCallback((): number => {
    if (currentStep === 'method-selection') return 33;
    if (currentStep === 'phone-input' || currentStep === 'qr-verification') return 66;
    return 100; // otp-verification or success
  }, [currentStep]);

  // Render current step based on state
  const renderStep = useCallback(
    (step: FlowStep, method: UIVerificationMethod) => {
      switch (step) {
        case 'method-selection':
          return <MethodSelectionStep onMethodSelect={handleMethodSelect} />;

        case 'qr-verification':
          if (!method || (method !== 'whatsapp' && method !== 'sms')) return null;
          return <QRVerificationStep method={method} onSuccess={handleQRSuccess} onBack={handleBackToMethods} />;

        case 'phone-input':
          return <PhoneInputStep onSuccess={handlePhoneSubmit} onBack={handleBackToMethods} />;

        case 'otp-verification':
          if (!phoneNumber) return null;
          return (
            <OTPVerificationStep
              phoneNumber={phoneNumber}
              phoneCountry={phoneCountry}
              onSuccess={handleOTPSuccess}
              onBack={handleBackToPhoneInput}
              onChangeNumber={handleChangeNumber}
            />
          );

        case 'success':
          return <SuccessStep phoneNumber={phoneNumber} onContinue={handleContinue} />;

        default:
          return null;
      }
    },
    [
      handleMethodSelect,
      handleQRSuccess,
      handleBackToMethods,
      handlePhoneSubmit,
      phoneNumber,
      phoneCountry,
      handleOTPSuccess,
      handleBackToPhoneInput,
      handleChangeNumber,
      handleContinue,
    ],
  );

  return (
    <div className="space-y-6">
      <MultiStepProgressIndicator
        currentStep={2}
        stepProgress={{ 2: calculateStepProgress() }}
        signupMethod={signupMethod}
      />

      {renderStep(currentStep, selectedMethod)}
    </div>
  );
};
