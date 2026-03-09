import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateDeployment } from '@hooks/admin/deployments';
import { useRegions } from '@hooks/admin/regions';
// import { useRegionCloudProviders } from '@hooks/admin/regions';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Deployment } from '@/schemas/admin/deployments';
import { type UpdateDeploymentData, updateDeploymentSchema } from '@/schemas/admin/deployments';

interface EditDeploymentFormProps {
  deployment: Deployment;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditDeploymentForm: React.FC<EditDeploymentFormProps> = ({ deployment, onSuccess, onCancel }) => {
  const form = useForm<UpdateDeploymentData>({
    resolver: zodResolver(updateDeploymentSchema),
    defaultValues: {
      name: deployment.name,
      nexusUrl: deployment.nexusUrl,
      regionId: deployment.regionId,
      cloudProviderId: deployment.cloudProviderId,
      type: deployment.type,
      status: deployment.status,
    },
  });

  // const selectedRegionId = useWatch({ control: form.control, name: 'regionId' });

  const { data: regionsResponse } = useRegions();
  const regions = regionsResponse?.result ?? [];

  // const { data: providers = [] } = useRegionCloudProviders(selectedRegionId ?? deployment.regionId, { enabled: !!(selectedRegionId ?? deployment.regionId) });
  const providers: { id: string; name: string; code: string }[] = [];

  const updateMutation = useUpdateDeployment({
    onSuccess: () => onSuccess(),
  });

  return (
    <Form form={form} mutation={updateMutation} showRootError transformSubmit={(data) => ({ id: deployment.id, data })}>
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="nexusUrl" label="Nexus URL" placeholder="https://nexus-us-east.vritti.io" />
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
        placeholder="Select provider"
        options={providers.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` }))}
        disabled={providers.length === 0}
      />
      <Select
        name="type"
        label="Deployment Type"
        options={[
          { value: 'shared', label: 'Shared' },
          { value: 'dedicated', label: 'Dedicated' },
        ]}
      />
      <Select
        name="status"
        label="Status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'stopped', label: 'Stopped' },
          { value: 'Provisioning', label: 'Provisioning' },
        ]}
      />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
