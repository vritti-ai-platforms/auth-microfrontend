import { Progress } from '@vritti/quantum-ui/Progress';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Check, KeyRound, Mail, Smartphone } from 'lucide-react';
import React, { useMemo } from 'react';
import { useOnboarding } from '@context/onboarding';

interface Step {
  id: number;
  label: string;
  icon: React.ReactNode;
  circleClass: string;
  labelClass: string;
  progress: number;
  isCompleted: boolean;
  isConnectorCompleted: boolean;
}

const ACTIVE_CIRCLE = 'bg-primary border-primary text-primary-foreground';
const INACTIVE_CIRCLE = 'bg-secondary border-border text-muted-foreground';
const ACTIVE_LABEL = 'text-foreground font-medium';
const INACTIVE_LABEL = 'text-muted-foreground';

// Maps backend onboarding step strings to progress indicator step numbers
function deriveCurrentStep(onboardingStep: string): number {
  switch (onboardingStep) {
    case 'EMAIL_VERIFICATION':
    case 'SET_PASSWORD':
      return 1;
    case 'PHONE_VERIFICATION':
    case 'MOBILE_VERIFICATION':
      return 2;
    case 'MFA_SETUP':
    case 'TWO_FACTOR_SETUP':
      return 3;
    case 'COMPLETED':
    case 'COMPLETE':
      return 4;
    default:
      return 1;
  }
}

// Reads onboarding state directly — no props needed
export const MultiStepProgressIndicator: React.FC = () => {
  const { currentStep, signupMethod = 'email', progress = 0 } = useOnboarding();
  // Derived from context — recomputes on every render when currentStep changes
  const activeStep = deriveCurrentStep(currentStep);

  const steps: Step[] = useMemo(() => {
    const step1Config =
      signupMethod === 'oauth'
        ? { label: 'Set Password', icon: <KeyRound className="h-4 w-4" /> }
        : { label: 'Verify Email', icon: <Mail className="h-4 w-4" /> };

    const base = [
      { id: 1, label: step1Config.label, icon: step1Config.icon },
      { id: 2, label: 'Verify Mobile', icon: <Smartphone className="h-4 w-4" /> },
      { id: 3, label: 'Enable MFA', icon: <KeyRound className="h-4 w-4" /> },
      { id: 4, label: 'Complete', icon: <Check className="h-4 w-4" /> },
    ];

    return base.map(({ id, label, icon }) => {
      const isCompleted = id < activeStep;
      const isActive = id === activeStep;

      return {
        id,
        label,
        icon,
        circleClass: isCompleted || isActive ? ACTIVE_CIRCLE : INACTIVE_CIRCLE,
        labelClass: isCompleted || isActive ? ACTIVE_LABEL : INACTIVE_LABEL,
        progress: isCompleted ? 100 : isActive ? progress : 0,
        isCompleted,
        isConnectorCompleted: isCompleted,
      };
    });
  }, [activeStep, signupMethod, progress]);

  return (
    <div className="w-full max-w-[398px] mx-auto">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${step.circleClass}`}
              >
                {step.isCompleted ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <Typography
                variant="body2"
                className={`text-[10px] whitespace-nowrap transition-all ${step.labelClass}`}
              >
                {step.label}
              </Typography>
              <Progress value={step.progress} className="w-16 h-1" />
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mt-4">
                <div
                  className={`h-full rounded-full transition-all ${step.isConnectorCompleted ? 'bg-primary' : 'bg-border'}`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
