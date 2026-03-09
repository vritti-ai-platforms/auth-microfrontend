import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateDeployment } from '@hooks/admin/deployments';
import { useRegions } from '@hooks/admin/regions';
// import { useRegionCloudProviders } from '@hooks/admin/regions';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { PasswordField } from '@vritti/quantum-ui/PasswordField';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { type CreateDeploymentData, createDeploymentSchema } from '@/schemas/admin/deployments';

interface AddDeploymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddDeploymentForm: React.FC<AddDeploymentFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateDeploymentData>({
    resolver: zodResolver(createDeploymentSchema),
    defaultValues: { name: '', nexusUrl: '', webhookSecret: '', type: 'shared' },
  });

  const selectedRegionId = useWatch({ control: form.control, name: 'regionId' });

  const { data: regionsResponse } = useRegions();
  const regions = regionsResponse?.result ?? [];

  // const { data: providers = [] } = useRegionCloudProviders(selectedRegionId ?? '', { enabled: !!selectedRegionId });
  const providers: { id: string; name: string; code: string }[] = [];

  const createMutation = useCreateDeployment({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} mutation={createMutation} showRootError>
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="nexusUrl" label="Nexus URL" placeholder="https://nexus-us-east.vritti.io" />
      <PasswordField name="webhookSecret" label="Webhook Secret" placeholder="whsec_..." />
      <Select
        name="regionId"
        label="Region"
        placeholder="Select region"
        options={regions.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` }))}
        onChange={() => form.setValue('cloudProviderId', '')}
      />
      <Select
        name="cloudProviderId"
        label="Cloud Provider"
        placeholder={selectedRegionId ? 'Select provider' : 'Select a region first'}
        options={providers.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` }))}
        disabled={!selectedRegionId || providers.length === 0}
      />
      <Select
        name="type"
        label="Deployment Type"
        placeholder="Select type"
        options={[
          { value: 'shared', label: 'Shared' },
          { value: 'dedicated', label: 'Dedicated' },
        ]}
      />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Deployment
        </Button>
      </div>
    </Form>
  );
};
