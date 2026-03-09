import { useDeletePlan, usePlan } from '@hooks/admin/plans';
import { useDeletePrice, usePricesByPlan } from '@hooks/admin/prices';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { BadgeDollarSign, Cloud, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Price } from '@/schemas/admin/prices';
import { AddPriceForm } from './forms/AddPriceForm';
import { EditPlanForm } from './forms/EditPlanForm';
import { EditPriceForm } from './forms/EditPriceForm';

export const PlanViewPage = () => {
  const { id } = useSlugParams();
  const navigate = useNavigate();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: plan, isLoading: planLoading } = usePlan(id);
  const { data: prices = [], isLoading: pricesLoading } = usePricesByPlan(id ?? '');

  const deleteMutation = useDeletePlan({
    onSuccess: () => navigate('/plans'),
  });

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: `Delete ${plan?.name}?`,
      description: `${plan?.name} and all its associated data will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  if (planLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!plan) return null;

  const regionCount = new Set(prices.map((p) => p.regionId)).size;
  const providerCount = new Set(prices.map((p) => p.providerId)).size;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={plan.name}
        description={'Manage prices of this plan'}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <BadgeDollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pricing Entries</p>
              <p className="text-2xl font-semibold">{prices.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regions Covered</p>
              <p className="text-2xl font-semibold">{regionCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Providers</p>
              <p className="text-2xl font-semibold">{providerCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing section */}
      <PricingTable planId={id} prices={prices} isLoading={pricesLoading} />

      <DangerZone
        title="Delete this plan"
        description="This action cannot be undone. All associated data will be permanently removed."
        buttonText="Delete Plan"
        onClick={handleDelete}
        disabled={!plan.canDelete}
        warning={
          !plan.canDelete
            ? `This plan has ${plan.priceCount} price(s) or other associated data. Remove all associated data before deleting.`
            : undefined
        }
      />

      {/* Edit dialog */}
      <Dialog
        open={editDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) editDialog.close();
        }}
        title="Edit Plan"
        description="Update the details for this subscription plan."
        content={(close) => <EditPlanForm plan={plan} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface PricingTableProps {
  planId: string | undefined;
  prices: Price[];
  isLoading: boolean;
}

// Extracted so useMemo and useDataTable can run unconditionally
const PricingTable = ({ planId, prices, isLoading }: PricingTableProps) => {
  // Memoize columns so planId closure is stable across renders
  const columns = useMemo<ColumnDef<Price, unknown>[]>(
    () => [
      {
        accessorKey: 'regionName',
        header: 'Region',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <span>{row.original.regionName}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {row.original.regionCode}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'providerName',
        header: 'Provider',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Cloud className="size-4 text-muted-foreground" />
            <span>{row.original.providerName}</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {row.original.providerCode}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ row }) => <Badge variant="outline">{row.original.currency}</Badge>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => <PriceActions price={row.original} planId={planId ?? ''} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [planId],
  );

  const { table } = useDataTable({
    columns,
    slug: 'plan-prices',
    label: 'price',
    serverState: { result: prices, count: prices.length },
    enableRowSelection: false,
    enableSorting: false,
  });

  return (
    <DataTable
      table={table}
      minHeight="400px"
      isLoading={isLoading}
      toolbarActions={{
        actions: (
          <Dialog
            title="Add Price"
            description="Set a price for a specific industry, region, and cloud provider combination."
            anchor={(open) => (
              <Button size="sm" variant="default" startAdornment={<Plus className="size-4" />} onClick={open}>
                Add Price
              </Button>
            )}
            content={(close) => <AddPriceForm planId={planId ?? ''} onSuccess={close} onCancel={close} />}
          />
        ),
      }}
      emptyStateConfig={{
        title: 'No prices configured',
        description: 'Add a price for a specific industry, region, and cloud provider combination.',
      }}
    />
  );
};

interface PriceActionsProps {
  price: Price;
  planId: string;
}

const PriceActions = ({ price, planId }: PriceActionsProps) => {
  const deleteMutation = useDeletePrice();
  const isDeleting = deleteMutation.isPending && deleteMutation.variables?.id === price.id;

  return (
    <div className="flex gap-1 justify-end">
      {/* Edit dialog */}
      <Dialog
        title="Edit Price"
        description="Update the price and currency for this combination."
        anchor={(open) => (
          <Button variant="ghost" size="icon" onClick={open} aria-label="Edit price">
            <Pencil className="size-4" />
          </Button>
        )}
        content={(close) => <EditPriceForm price={price} onSuccess={close} onCancel={close} />}
      />

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        disabled={isDeleting}
        onClick={() => deleteMutation.mutate({ id: price.id, planId })}
        aria-label="Delete price"
      >
        {isDeleting ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
      </Button>
    </div>
  );
};
