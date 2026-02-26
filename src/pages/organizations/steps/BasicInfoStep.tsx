import { useCheckSubdomain } from '@hooks/organizations';
import type { CreateOrgFormData } from '@schemas/organizations';
import { OrgSize } from '@schemas/organizations';
import { Button } from '@vritti/quantum-ui/Button';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { IndustrySelect } from '@vritti/quantum-ui/IndustrySelect';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { ArrowRight } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';

interface BasicInfoStepProps {
  form: UseFormReturn<CreateOrgFormData>;
  onContinue: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ form, onContinue }) => {
  const checkSubdomainMutation = useCheckSubdomain({ onSuccess: onContinue });

  return (
    <Form
      form={form}
      mutation={checkSubdomainMutation}
      transformSubmit={(data) => data.subdomain}
    >
      <FieldGroup>
        <TextField name="name" label="Organization Name" placeholder="e.g., HealthFirst Clinics" />
        <TextField
          name="subdomain"
          label="Organization URL"
          placeholder="company-slug"
          endAdornment={<span className="text-muted-foreground text-sm pr-3">.vrittiai.com</span>}
          description="This will be your organization's subdomain URL"
        />
        <IndustrySelect name="industryId" onOptionSelect={(opt) => form.setValue('industryName', opt?.label)} />
        <Select
          name="size"
          label="Organization Size"
          placeholder="Select size"
          options={Object.values(OrgSize).map((v) => ({ value: v, label: `${v} employees` }))}
        />
      </FieldGroup>
      <div className="flex justify-end">
        <Button type="submit">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Form>
  );
};
