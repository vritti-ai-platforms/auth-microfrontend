import { useDeleteRegion, useRegions } from '@hooks/admin/regions';
import { REGIONS_QUERY_KEY } from '@hooks/admin/regions/useRegions';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { MapPin, MoreVertical, Plus, Trash2 } from 'lucide-react';
import type { Region } from '@/schemas/admin/regions';
import { AddRegionForm } from './forms/AddRegionForm';

const TABLE_SLUG = 'regions';

export const RegionsPage = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useRegions();
  const regions = response?.data ?? [];

  const deleteMutation = useDeleteRegion();

  const { table } = useDataTable({
    data: regions,
    columns: getColumns(deleteMutation.mutate),
    slug: TABLE_SLUG,
    label: 'region',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStateApplied: () => queryClient.invalidateQueries({ queryKey: REGIONS_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Regions" description="Manage deployment regions" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        onStateApplied={() => queryClient.invalidateQueries({ queryKey: REGIONS_QUERY_KEY })}
        filters={[
          <ValueFilter key="name" name="name" label="Name" fieldType="string" />,
          <ValueFilter key="code" name="code" label="Code" fieldType="string" />,
          <ValueFilter key="state" name="state" label="State" fieldType="string" />,
          <ValueFilter key="city" name="city" label="City" fieldType="string" />,
        ]}
        toolbarActions={{
          actions: (
            <Dialog
              title="Add Region"
              description="Enter the details for the new region."
              anchor={(open) => (
                <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={open}>
                  Add Region
                </Button>
              )}
              content={(close) => <AddRegionForm onSuccess={close} onCancel={close} />}
            />
          ),
        }}
        emptyStateConfig={{
          icon: MapPin,
          title: 'No regions found',
          description: 'Add your first deployment region to get started.',
          action: (
            <Dialog
              title="Add Region"
              description="Enter the details for the new region."
              anchor={(open) => (
                <Button size="sm" onClick={open}>
                  <Plus className="size-4" />
                  Add Region
                </Button>
              )}
              content={(close) => <AddRegionForm onSuccess={close} onCancel={close} />}
            />
          ),
        }}
      />
    </div>
  );
};

function getColumns(onDelete: (id: string) => void): ColumnDef<Region, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Region',
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
      accessorKey: 'state',
      header: 'State',
    },
    {
      accessorKey: 'city',
      header: 'City',
    },
    {
      accessorKey: 'providerCount',
      header: 'Providers',
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
