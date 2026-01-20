import { Progress } from '@vritti/quantum-ui/Progress';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Check, KeyRound, Mail, Smartphone } from 'lucide-react';
import React from 'react';

interface MultiStepProgressIndicatorProps {
  currentStep: number; // 1-4
  stepProgress?: Record<number, number>; // Optional: sub-step progress (0-100) for each step
  signupMethod?: 'email' | 'oauth'; // Controls step 1 label/icon
}

interface Step {
  id: number;
  label: string;
  icon: React.ReactNode;
}

export const MultiStepProgressIndicator: React.FC<MultiStepProgressIndicatorProps> = ({
  currentStep,
  stepProgress = {},
  signupMethod = 'email',
}) => {
  // Step 1 label and icon depend on signup method
  const step1Config = signupMethod === 'oauth'
    ? { label: 'Set Password', icon: <KeyRound className="h-4 w-4" /> }
    : { label: 'Verify Email', icon: <Mail className="h-4 w-4" /> };

  const steps: Step[] = [
    {
      id: 1,
      label: step1Config.label,
      icon: step1Config.icon,
    },
    {
      id: 2,
      label: 'Verify Mobile',
      icon: <Smartphone className="h-4 w-4" />,
    },
    {
      id: 3,
      label: 'Enable 2FA',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      id: 4,
      label: 'Complete',
      icon: <Check className="h-4 w-4" />,
    },
  ];

  const getStepStatus = (stepId: number): 'completed' | 'active' | 'inactive' => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'inactive';
  };

  const getStepStyles = (status: 'completed' | 'active' | 'inactive') => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-primary border-primary text-primary-foreground',
          label: 'text-foreground font-medium',
        };
      case 'active':
        return {
          circle: 'bg-primary border-primary text-primary-foreground',
          label: 'text-foreground font-medium',
        };
      case 'inactive':
        return {
          circle: 'bg-secondary border-border text-muted-foreground',
          label: 'text-muted-foreground',
        };
    }
  };

  const getStepProgress = (stepId: number): number => {
    const status = getStepStatus(stepId);
    if (status === 'completed') return 100;
    if (status === 'active') return stepProgress[stepId] || 0;
    return 0;
  };

  return (
    <div className="w-full max-w-[398px] mx-auto">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const styles = getStepStyles(status);
          const isLast = index === steps.length - 1;
          const isConnectorCompleted = step.id < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${styles.circle}`}
                >
                  {status === 'completed' ? <Check className="h-4 w-4" /> : step.icon}
                </div>
                {/* Label */}
                <Typography variant="body2" className={`text-[10px] whitespace-nowrap transition-all ${styles.label}`}>
                  {step.label}
                </Typography>
                {/* Sub-step Progress Bar */}
                <Progress value={getStepProgress(step.id)} className="w-16 h-1" />
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 mt-4">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isConnectorCompleted ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
