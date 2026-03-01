import { useCloudProviders, useDeleteCloudProvider } from '@hooks/admin/cloud-providers';
import { CLOUD_PROVIDERS_QUERY_KEY } from '@hooks/admin/cloud-providers/useCloudProviders';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import {
  type ColumnDef,
  DataTable,
  type DataTableViewsConfig,
  useDataTable,
  useDataTableStore,
  type SearchState,
} from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@vritti/quantum-ui/DropdownMenu';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { Cloud, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { FilterCondition } from '@vritti/quantum-ui/table-filter';
import type { CloudProvider } from '@/schemas/admin/cloud-providers';
import { AddCloudProviderForm } from './forms/AddCloudProviderForm';

const TABLE_SLUG = 'cloud-providers';
// Stable empty fallback — avoids a new [] on every getSnapshot call when the table isn't yet initialised
const NO_FILTERS: FilterCondition[] = [];

export const CloudProvidersPage = () => {
  // Local search state — passed directly to the search component via enableSearch
  const [search, setSearch] = useState<SearchState>(null);

  // Debounced search — only updates 300ms after typing stops, drives the backend query.
  // startTransition lets React defer the re-render so the setTimeout handler returns quickly.
  const [, startTransition] = useTransition();
  const [debouncedSearch, setDebouncedSearch] = useState<SearchState>(null);
  useEffect(() => {
    const timer = setTimeout(() => startTransition(() => setDebouncedSearch(search)), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Read pending filters from store for filter node values
  const pendingFilters = useDataTableStore((s) => s.tables[TABLE_SLUG]?.pendingFilters ?? NO_FILTERS);

  const queryClient = useQueryClient();
  const { data: response, isLoading } = useCloudProviders(debouncedSearch);
  const providers = response?.data ?? [];

  // One-time init: load server state into store on first successful response
  const hasInit = useRef(false);
  useEffect(() => {
    if (response?.state && !hasInit.current) {
      hasInit.current = true;
      useDataTableStore.getState().loadViewState(TABLE_SLUG, response.state, null);
    }
  }, [response?.state]);

  const deleteMutation = useDeleteCloudProvider();

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

  // Invalidate the cloud providers GET query after any state change
  const handleStateApplied = () => queryClient.invalidateQueries({ queryKey: CLOUD_PROVIDERS_QUERY_KEY });

  const viewsConfig: DataTableViewsConfig = {
    tableSlug: TABLE_SLUG,
    defaultLabel: 'All Providers',
    onStateApplied: handleStateApplied,
  };

  const table = useDataTable({
    data: providers,
    columns,
    slug: TABLE_SLUG,
    label: 'provider',
    enableRowSelection: false,
    viewsConfig,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Cloud Providers" description="Manage cloud infrastructure providers" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        viewsConfig={viewsConfig}
        enableSearch={{ value: search, onChange: setSearch }}
        filters={[
          {
            slug: 'name',
            label: 'Name',
            node: (
              <ValueFilter
                label="Name"
                fieldKey="name"
                fieldType="string"
                value={pendingFilters.find((f) => f.field === 'name')}
                onChange={(v) => useDataTableStore.getState().updatePendingFilter(TABLE_SLUG, 'name', v)}
              />
            ),
          },
          {
            slug: 'code',
            label: 'Code',
            node: (
              <ValueFilter
                label="Code"
                fieldKey="code"
                fieldType="string"
                value={pendingFilters.find((f) => f.field === 'code')}
                onChange={(v) => useDataTableStore.getState().updatePendingFilter(TABLE_SLUG, 'code', v)}
              />
            ),
          },
          {
            slug: 'regionCount',
            label: 'Regions',
            node: (
              <ValueFilter
                label="Regions"
                fieldKey="regionCount"
                fieldType="number"
                value={pendingFilters.find((f) => f.field === 'regionCount')}
                onChange={(v) => useDataTableStore.getState().updatePendingFilter(TABLE_SLUG, 'regionCount', v)}
              />
            ),
          },
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
