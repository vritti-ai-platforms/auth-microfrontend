import { zodResolver } from '@hookform/resolvers/zod';
import { useIndustries } from '@hooks/admin/industries';
import { useCreatePrice } from '@hooks/admin/prices';
import { useRegions } from '@hooks/admin/regions';
// import { useRegionCloudProviders } from '@hooks/admin/regions';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { type CreatePriceData, createPriceSchema } from '@/schemas/admin/prices';

interface AddPriceFormProps {
  planId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPriceForm: React.FC<AddPriceFormProps> = ({ planId, onSuccess, onCancel }) => {
  const form = useForm<CreatePriceData>({
    resolver: zodResolver(createPriceSchema),
    defaultValues: { planId, currency: 'INR' },
  });

  const selectedRegionId = useWatch({ control: form.control, name: 'regionId' });

  const { data: regionsResponse } = useRegions();
  const regions = regionsResponse?.result ?? [];

  // const { data: providers = [] } = useRegionCloudProviders(selectedRegionId ?? '', { enabled: !!selectedRegionId });
  const providers: { id: string; name: string; code: string }[] = [];

  const { data: industriesResponse } = useIndustries();
  const industries = industriesResponse?.result ?? [];

  const createMutation = useCreatePrice({
    onSuccess: () => {
      form.reset({ planId, currency: 'INR' });
      onSuccess();
    },
  });

  const handleCancel = () => {
    form.reset({ planId, currency: 'INR' });
    onCancel();
  };

  return (
    <Form form={form} mutation={createMutation} showRootError>
      <Select
        name="industryId"
        label="Industry"
        placeholder="Select industry"
        options={industries.map((i) => ({ value: i.id, label: i.name }))}
      />
      <Select
        name="regionId"
        label="Region"
        placeholder="Select region"
        options={regions.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` }))}
        onChange={() => form.setValue('providerId', '')}
      />
      <Select
        name="providerId"
        label="Cloud Provider"
        placeholder={selectedRegionId ? 'Select provider' : 'Select a region first'}
        options={providers.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` }))}
        disabled={!selectedRegionId || providers.length === 0}
      />
      <TextField name="price" label="Price" placeholder="e.g. 2999.00" />
      <TextField name="currency" label="Currency" placeholder="INR" description="3-letter ISO 4217 code" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Price
        </Button>
      </div>
    </Form>
  );
};
