import { zodResolver } from '@hookform/resolvers/zod';
import { useIndustries } from '@hooks/industries';
import { useCreateOrganization } from '@hooks/organizations';
import type { CreateOrgFormData } from '@schemas/organizations';
import { createOrganizationSchema, OrgPlan, OrgSize } from '@schemas/organizations';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { Field, FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { Separator } from '@vritti/quantum-ui/Separator';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, Check } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Basic Info', 'Choose Plan', 'Review'] as const;

// Displays the 3-step progress indicator with completed/active/pending states
const StepIndicator: React.FC<{ current: 1 | 2 | 3 }> = ({ current }) => (
  <div className="flex items-center gap-2">
    {STEPS.map((label, i) => {
      const num = i + 1;
      const isCompleted = num < current;
      const isActive = num === current;
      return (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <div
              className={[
                'h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium border-2',
                isCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : isActive
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground text-muted-foreground',
              ].join(' ')}
            >
              {isCompleted ? <Check className="h-3.5 w-3.5" /> : num}
            </div>
            <Typography variant="body2" className={isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {label}
            </Typography>
          </div>
          {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
        </React.Fragment>
      );
    })}
  </div>
);

const PLANS = [
  {
    plan: OrgPlan.free,
    label: 'Free',
    badge: null,
    features: ['1 Business Unit', 'Basic email support', 'Shared infrastructure', '30 GB storage', '1 included app'],
  },
  {
    plan: OrgPlan.pro,
    label: 'Pro',
    badge: 'Most Popular',
    features: [
      '3 Business Units',
      'Priority chat & email support',
      'Shared optimized infrastructure',
      '200 GB storage',
      '3 included apps',
    ],
  },
  {
    plan: OrgPlan.enterprise,
    label: 'Enterprise',
    badge: 'Best Value',
    features: [
      'Unlimited Business Units',
      '24/7 Dedicated manager',
      'Dedicated isolated infrastructure',
      '1 TB storage',
      'All apps included',
    ],
  },
] as const;

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

  // Advance from step 1 only if required fields are valid
  const handleStep1Continue = async () => {
    const valid = await form.trigger(['name', 'subdomain', 'size']);
    if (valid) setStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <Button variant="ghost" className="mb-4 gap-2 pl-0" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-4 w-4" /> Back to Organizations
        </Button>
        <Typography variant="h3">Create a new organization</Typography>
        <Typography variant="body2" intent="muted">
          Set up your organization workspace in a few steps
        </Typography>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step 1 — Basic Information */}
      {/* No Form wrapper here — validation is triggered manually by the Continue button */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Organization Name"
                    placeholder="e.g., HealthFirst Clinics"
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="subdomain"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Organization URL"
                    placeholder="company-slug"
                    endAdornment={<span className="text-muted-foreground text-sm pr-3">.vrittiai.com</span>}
                    description="This will be your organization's subdomain URL"
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="industryId"
                render={({ field, fieldState }) => (
                  <Select
                    label="Industry"
                    placeholder="Select industry"
                    options={(industries ?? []).map((i) => ({ value: i.id, label: i.name }))}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="size"
                render={({ field, fieldState }) => (
                  <Select
                    label="Organization Size"
                    placeholder="Select size"
                    options={Object.values(OrgSize).map((v) => ({
                      value: v,
                      label: `${v} employees`,
                    }))}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Choose Plan */}
      {step === 2 && (
        <div className="space-y-4">
          <Typography variant="h4">Choose a plan</Typography>
          <div className="grid grid-cols-1 gap-4">
            {PLANS.map(({ plan, label, badge, features }) => (
              <Card
                key={plan}
                className={[
                  'cursor-pointer transition-all',
                  selectedPlan === plan ? 'ring-2 ring-primary' : 'hover:border-primary/50',
                ].join(' ')}
                onClick={() => form.setValue('plan', plan)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{label}</CardTitle>
                    {badge && <Badge variant="secondary">{badge}</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Review & Submit */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Organization details summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Organization Details</CardTitle>
                <Button variant="link" className="p-0 h-auto" onClick={() => setStep(1)}>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Name', value: form.getValues('name') },
                { label: 'URL', value: `${form.getValues('subdomain')}.vrittiai.com` },
                { label: 'Size', value: `${form.getValues('size')} employees` },
                {
                  label: 'Industry',
                  value: industries?.find((i) => i.id === form.getValues('industryId'))?.name ?? '—',
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Plan summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Selected Plan</CardTitle>
                <Button variant="link" className="p-0 h-auto" onClick={() => setStep(2)}>
                  Change
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Typography variant="body1" className="font-medium capitalize">
                {selectedPlan}
              </Typography>
            </CardContent>
          </Card>

          <Separator />

          {/* Terms acceptance and final submit */}
          <Form
            form={form}
            mutation={createMutation}
            transformSubmit={(data) => ({
              name: data.name,
              subdomain: data.subdomain,
              orgIdentifier: data.subdomain,
              size: data.size,
              plan: data.plan,
              industryId: data.industryId,
            })}
          >
            <FieldGroup>
              <Field>
                <Checkbox
                  label="I agree to the Terms of Service and Privacy Policy."
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!agreedToTerms}
                  loadingText="Creating organization..."
                >
                  Create Organization
                </Button>
              </Field>
            </FieldGroup>
          </Form>
        </div>
      )}

      {/* Navigation buttons for steps 1 and 2 */}
      {step !== 3 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => (step === 1 ? navigate('/home') : setStep((s) => (s - 1) as 1 | 2 | 3))}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={step === 1 ? handleStep1Continue : () => setStep(3)}>Continue</Button>
        </div>
      )}

      {/* Back button for step 3 (step 3 has its own submit via Form) */}
      {step === 3 && (
        <div className="flex justify-start">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
};
