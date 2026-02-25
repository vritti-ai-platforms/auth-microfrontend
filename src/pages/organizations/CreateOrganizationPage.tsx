import { zodResolver } from '@hookform/resolvers/zod';
import { useIndustries } from '@hooks/industries';
import { useCreateOrganization } from '@hooks/organizations';
import type { CreateOrgFormData } from '@schemas/organizations';
import { createOrganizationSchema, OrgPlan } from '@schemas/organizations';
import { Button } from '@vritti/quantum-ui/Button';
import { type StepDef, StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Building2, ClipboardList, CreditCard } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ChoosePlanStep } from './steps/ChoosePlanStep';
import { ReviewStep } from './steps/ReviewStep';

const CREATE_ORG_STEPS: StepDef[] = [
  { label: 'Basic Info', icon: <Building2 className="h-4 w-4" /> },
  { label: 'Choose Plan', icon: <CreditCard className="h-4 w-4" /> },
  { label: 'Review', icon: <ClipboardList className="h-4 w-4" /> },
];

export const CreateOrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const form = useForm<CreateOrgFormData>({
    // Cast required: zodResolver infers input type (plan?: OrgPlan) but form uses output type (plan: OrgPlan)
    resolver: zodResolver(createOrganizationSchema) as Resolver<CreateOrgFormData>,
    defaultValues: { plan: OrgPlan.free },
  });

  const createMutation = useCreateOrganization({
    onSuccess: () => navigate('/home'),
  });

  const { data: industries } = useIndustries();

  const selectedPlan = form.watch('plan') ?? OrgPlan.free;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-0">
        <div>
          <Typography variant="h4">Create a new company</Typography>
          <Typography variant="body2" intent="muted">
            Set up your company workspace in a few steps
          </Typography>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
          Cancel
        </Button>
      </div>

      {/* Step indicator */}
      <div className="px-6 pt-6 pb-0">
        <StepProgressIndicator steps={CREATE_ORG_STEPS} currentStep={step} />
      </div>

      {/* Step content */}
      <div className="px-6 py-6 space-y-6">
        {step === 1 && (
          <BasicInfoStep
            form={form}
            industries={industries}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <ChoosePlanStep
            form={form}
            selectedPlan={selectedPlan}
            onSelect={(plan) => form.setValue('plan', plan)}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <ReviewStep
            form={form}
            industries={industries}
            selectedPlan={selectedPlan}
            agreedToTerms={agreedToTerms}
            onAgreedToTermsChange={(c) => setAgreedToTerms(c)}
            createMutation={createMutation}
            onBack={() => setStep(2)}
            onEditBasicInfo={() => setStep(1)}
            onChangePlan={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
};
