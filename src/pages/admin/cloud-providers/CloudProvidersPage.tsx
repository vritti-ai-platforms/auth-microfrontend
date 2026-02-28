import { zodResolver } from '@hookform/resolvers/zod';
import { useCloudProviders, useCreateCloudProvider, useDeleteCloudProvider } from '@hooks/admin/cloud-providers';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@vritti/quantum-ui/Dialog';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@vritti/quantum-ui/DropdownMenu';
import { Form } from '@vritti/quantum-ui/Form';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Cloud, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  type CloudProvider,
  type CreateCloudProviderData,
  createCloudProviderSchema,
} from '@/schemas/admin/cloud-providers';

export const CloudProvidersPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: providers = [], isLoading } = useCloudProviders();
  const deleteMutation = useDeleteCloudProvider();

  const form = useForm<CreateCloudProviderData>({
    resolver: zodResolver(createCloudProviderSchema),
    defaultValues: { name: '', code: '' },
  });

  const createMutation = useCreateCloudProvider({
    onSuccess: () => {
      setDialogOpen(false);
      form.reset();
    },
  });

  // Hide dialog and reset state on cancel
  const handleCancel = () => {
    setDialogOpen(false);
    form.reset();
  };

  const columns = useMemo<ColumnDef<CloudProvider, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Provider',
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-[10px] font-medium">
            {row.original.code}
          </Badge>
        ),
      },
      {
        accessorKey: 'regionCount',
        header: 'Regions',
      },
      {
        id: 'deployments',
        header: 'Deployments',
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteMutation.mutate(row.original.id)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [deleteMutation],
  );

  const table = useDataTable({
    data: providers,
    columns,
    slug: 'cloud-providers',
    label: 'provider',
    enableRowSelection: false,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Cloud Providers" description="Manage cloud infrastructure providers" />

      {/* Add Provider dialog */}
      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Cloud Provider</DialogTitle>
            <DialogDescription>Enter a name and a short code for the new cloud provider.</DialogDescription>
          </DialogHeader>
          <Form form={form} mutation={createMutation} showRootError>
            <TextField name="name" label="Provider Name" placeholder="e.g. Amazon Web Services" />
            <TextField
              name="code"
              label="Code"
              placeholder="e.g. AWS"
              description="Short identifier used across the platform"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" loadingText="Adding...">
                Add Provider
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </DialogRoot>

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        enableSearch={{ placeholder: 'Search providers...' }}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={() => setDialogOpen(true)}>
              Add Provider
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Cloud,
          title: 'No providers found',
          description: 'Add your first cloud provider to get started.',
          action: (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              Add Provider
            </Button>
          ),
        }}
      />
    </div>
  );
};
