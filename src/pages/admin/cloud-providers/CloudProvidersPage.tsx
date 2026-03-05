import { useCloudProviders, useDeleteCloudProvider } from '@hooks/admin/cloud-providers';
import { CLOUD_PROVIDERS_QUERY_KEY } from '@hooks/admin/cloud-providers/useCloudProviders';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { Cloud, MoreVertical, Plus, Trash2 } from 'lucide-react';
import type { CloudProvider } from '@/schemas/admin/cloud-providers';
import { AddCloudProviderForm } from './forms/AddCloudProviderForm';

const TABLE_SLUG = 'cloud-providers';

export const CloudProvidersPage = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useCloudProviders();
  const providers = response?.data ?? [];

  const deleteMutation = useDeleteCloudProvider();

  const { table } = useDataTable({
    data: providers,
    columns: getColumns(deleteMutation.mutate),
    slug: TABLE_SLUG,
    label: 'provider',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStateApplied: () => queryClient.invalidateQueries({ queryKey: CLOUD_PROVIDERS_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Cloud Providers" description="Manage cloud infrastructure providers" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        onStateApplied={() => queryClient.invalidateQueries({ queryKey: CLOUD_PROVIDERS_QUERY_KEY })}
        filters={[
          <ValueFilter key="name" name="name" label="Name" fieldType="string" />,
          <ValueFilter key="code" name="code" label="Code" fieldType="string" />,
          <ValueFilter key="regionCount" name="regionCount" label="Regions" fieldType="number" />,
        ]}
        toolbarActions={{
          actions: (
            <Dialog
              title="Add Cloud Provider"
              description="Enter a name and a short code for the new cloud provider."
              anchor={(open) => (
                <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={open}>
                  Add Provider
                </Button>
              )}
              content={(close) => <AddCloudProviderForm onSuccess={close} onCancel={close} />}
            />
          ),
        }}
        emptyStateConfig={{
          icon: Cloud,
          title: 'No providers found',
          description: 'Add your first cloud provider to get started.',
          action: (
            <Dialog
              title="Add Cloud Provider"
              description="Enter a name and a short code for the new cloud provider."
              anchor={(open) => (
                <Button size="sm" onClick={open}>
                  <Plus className="size-4" />
                  Add Provider
                </Button>
              )}
              content={(close) => <AddCloudProviderForm onSuccess={close} onCancel={close} />}
            />
          ),
        }}
      />
    </div>
  );
};

function getColumns(onDelete: (id: string) => void): ColumnDef<CloudProvider, unknown>[] {
  return [
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
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu
          trigger={{
            children: (
              <Button variant="ghost" size="icon" className="size-7">
                <MoreVertical className="size-4" />
              </Button>
            ),
          }}
          align="end"
          items={[
            {
              type: 'item',
              id: 'delete',
              label: 'Delete',
              icon: Trash2,
              variant: 'destructive',
              onClick: () => onDelete(row.original.id),
            },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
