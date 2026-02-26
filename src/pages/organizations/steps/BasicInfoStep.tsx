import { useCheckSubdomain } from '@hooks/organizations';
import type { CreateOrgFormData } from '@schemas/organizations';
import { OrgSize } from '@schemas/organizations';
import { Button } from '@vritti/quantum-ui/Button';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { IndustrySelect } from '@vritti/quantum-ui/IndustrySelect';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import { UploadFile } from '@vritti/quantum-ui/UploadFile';
import { ArrowRight, Upload, X } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';

interface BasicInfoStepProps {
  form: UseFormReturn<CreateOrgFormData>;
  onContinue: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ form, onContinue }) => {
  const checkSubdomainMutation = useCheckSubdomain({ onSuccess: onContinue });
  const logo = form.watch('logo');

  return (
    <Form form={form} mutation={checkSubdomainMutation} transformSubmit={(data) => data.subdomain}>
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

      {/* Organization Logo upload */}
      {logo ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Organization Logo (optional)</p>
          <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
            <span className="text-sm text-muted-foreground truncate flex-1">{logo.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => form.setValue('logo', undefined)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <UploadFile
          name="logo"
          label="Organization Logo (optional)"
          accept="image/png,image/jpeg"
          anchor={
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click or drag to upload logo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </div>
          }
        />
      )}

      <div className="flex justify-end">
        <Button type="submit">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Form>
  );
};
