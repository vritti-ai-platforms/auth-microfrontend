import { usePlans } from '@hooks/admin/plans';
import { useDeletePrice, usePricesByPlan } from '@hooks/admin/prices';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { BadgeDollarSign, Cloud, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import type { Price } from '@/schemas/admin/prices';
import { AddPriceForm } from './forms/AddPriceForm';
import { EditPriceForm } from './forms/EditPriceForm';

export const PlanViewPage = () => {
  const { id: planId } = useSlugParams();

  const { data: plansResponse } = usePlans();
  const { data: prices = [], isLoading } = usePricesByPlan(planId ?? '');

  const plan = plansResponse?.result.find((p) => p.id === planId);

  if (!planId) return null;

  const regionCount = new Set(prices.map((p) => p.regionId)).size;
  const providerCount = new Set(prices.map((p) => p.providerId)).size;

  return (
    <div className="flex flex-col gap-6">
      {/* Plan header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10">
          <BadgeDollarSign className="size-6 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-lg">{plan?.name ?? 'Plan'}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {plan?.code ?? ''}
            </Badge>
            <span className="text-muted-foreground font-mono text-xs">{plan?.code?.toLowerCase() ?? ''}</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 w-fit">
        <Card>
          <CardContent className="pt-2 pb-2">
            <p className="text-2xl font-bold">{prices.length}</p>
            <p className="text-sm text-muted-foreground">Pricing Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2 pb-2 ">
            <p className="text-2xl font-bold">{regionCount}</p>
            <p className="text-sm text-muted-foreground">Regions Covered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2 pb-2">
            <p className="text-2xl font-bold">{providerCount}</p>
            <p className="text-sm text-muted-foreground">Providers</p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing section */}
      <PricingTable planId={planId} prices={prices} isLoading={isLoading} />
    </div>
  );
};

interface PricingTableProps {
  planId: string;
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
        cell: ({ row }) => <PriceActions price={row.original} planId={planId} />,
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
            content={(close) => <AddPriceForm planId={planId} onSuccess={close} onCancel={close} />}
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
