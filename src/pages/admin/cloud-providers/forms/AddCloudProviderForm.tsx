import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCloudProvider } from '@hooks/admin/cloud-providers';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateCloudProviderData, createCloudProviderSchema } from '@/schemas/admin/cloud-providers';

interface AddCloudProviderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddCloudProviderForm: React.FC<AddCloudProviderFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateCloudProviderData>({
    resolver: zodResolver(createCloudProviderSchema),
    defaultValues: { name: '', code: '' },
  });

  const createMutation = useCreateCloudProvider({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  // Cancel resets the form then notifies the parent
  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} mutation={createMutation} showRootError>
      <TextField name="name" label="Provider Name" placeholder="e.g. Amazon Web Services" />
      <TextField
        name="code"
        label="Code"
        placeholder="e.g. AWS"
        description="Short identifier used across the platform"
      />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Provider
        </Button>
      </div>
    </Form>
  );
};
