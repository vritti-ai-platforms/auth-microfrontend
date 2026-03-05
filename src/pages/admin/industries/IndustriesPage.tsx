import { useDeleteIndustry, useIndustries } from '@hooks/admin/industries';
import { INDUSTRIES_QUERY_KEY } from '@hooks/admin/industries/useIndustries';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { Building2, MoreVertical, Plus, Trash2 } from 'lucide-react';
import type { Industry } from '@/schemas/admin/industries';
import { AddIndustryForm } from './forms/AddIndustryForm';

const TABLE_SLUG = 'industries';

export const IndustriesPage = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useIndustries();
  const industries = response?.data ?? [];

  const deleteMutation = useDeleteIndustry();

  const { table } = useDataTable({
    data: industries,
    columns: getColumns(deleteMutation.mutate),
    slug: TABLE_SLUG,
    label: 'industry',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStateApplied: () => queryClient.invalidateQueries({ queryKey: INDUSTRIES_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Industries" description="Manage industry classifications" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        onStateApplied={() => queryClient.invalidateQueries({ queryKey: INDUSTRIES_QUERY_KEY })}
        filters={[
          <ValueFilter key="name" name="name" label="Name" fieldType="string" />,
          <ValueFilter key="code" name="code" label="Code" fieldType="string" />,
          <ValueFilter key="slug" name="slug" label="Slug" fieldType="string" />,
        ]}
        toolbarActions={{
          actions: (
            <Dialog
              title="Add Industry"
              description="Enter the details for the new industry classification."
              anchor={(open) => (
                <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={open}>
                  Add Industry
                </Button>
              )}
              content={(close) => <AddIndustryForm onSuccess={close} onCancel={close} />}
            />
          ),
        }}
        emptyStateConfig={{
          icon: Building2,
          title: 'No industries found',
          description: 'Add your first industry classification to get started.',
          action: (
            <Dialog
              title="Add Industry"
              description="Enter the details for the new industry classification."
              anchor={(open) => (
                <Button size="sm" onClick={open}>
                  <Plus className="size-4" />
                  Add Industry
                </Button>
              )}
              content={(close) => <AddIndustryForm onSuccess={close} onCancel={close} />}
            />
          ),
        }}
      />
    </div>
  );
};

function getColumns(onDelete: (id: string) => void): ColumnDef<Industry, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Industry',
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
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px] font-medium">
          {row.original.slug}
        </Badge>
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
