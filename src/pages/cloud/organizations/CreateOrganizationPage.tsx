import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@vritti/quantum-ui/Button';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { type StepDef, StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { Building2, ClipboardList, CreditCard } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCreateOrganization } from '@/hooks/cloud/organizations';
import type { CreateOrgFormData } from '@/schemas/cloud/organizations';
import { createOrganizationSchema, OrgPlan } from '@/schemas/cloud/organizations';
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
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { plan: OrgPlan.free },
  });

  const createMutation = useCreateOrganization({
    onSuccess: () => navigate('/'),
  });

  const selectedPlan = form.watch('plan') ?? OrgPlan.free;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-0">
        <PageHeader
          title="Create a new organization"
          description="Set up your organization workspace in a few steps"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Cancel
            </Button>
          }
        />
      </div>

      {/* Step indicator */}
      <div className="px-6 pt-6 pb-0">
        <StepProgressIndicator steps={CREATE_ORG_STEPS} currentStep={step} />
      </div>

      {/* Step content */}
      <div className="px-6 py-6 space-y-6">
        {step === 1 && <BasicInfoStep form={form} onContinue={() => setStep(2)} />}

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
