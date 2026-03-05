import { useRegions } from '@hooks/admin/regions';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { Eye, Globe, MoreVertical, Pencil, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Region } from '@/schemas/admin/regions';
import { AddRegionForm } from './forms/AddRegionForm';
import { EditRegionForm } from './forms/EditRegionForm';

const TABLE_SLUG = 'regions';

export const RegionsPage = () => {
  const navigate = useNavigate();
  const { data: regions = [], isLoading } = useRegions();
  const addDialog = useDialog();

  const { table } = useDataTable({
    data: regions,
    columns: getColumns({
      onView: (region) => navigate(`/regions/${buildSlug(region.name, region.id)}`),
    }),
    slug: TABLE_SLUG,
    label: 'region',
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Regions" description="Manage geographic deployment regions" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Region
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Globe,
          title: 'No regions found',
          description: 'Add your first region to get started.',
          action: (
            <Button size="sm" onClick={addDialog.open}>
              <Plus className="size-4" />
              Add Region
            </Button>
          ),
        }}
      />

      <Dialog
        open={addDialog.isOpen}
        onOpenChange={(v) => { if (!v) addDialog.close(); }}
        title="Add Region"
        description="Enter the details for the new deployment region."
        content={(close) => <AddRegionForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (region: Region) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<Region, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
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
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.providerCount}</Badge>
      ),
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
              id: 'view',
              label: 'View',
              icon: Eye,
              onClick: () => onView(row.original),
            },
            {
              type: 'dialog' as const,
              id: 'edit',
              label: 'Edit',
              icon: Pencil,
              dialog: {
                title: 'Edit Region',
                description: 'Update the details for this region.',
                content: (close) => (
                  <EditRegionForm region={row.original} onSuccess={close} onCancel={close} />
                ),
              },
            },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
