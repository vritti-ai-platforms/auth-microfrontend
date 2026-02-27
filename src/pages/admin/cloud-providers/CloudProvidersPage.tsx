import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cloud, MoreVertical, Plus, Search, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@vritti/quantum-ui/DropdownMenu';
import { Form } from '@vritti/quantum-ui/Form';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { TextField } from '@vritti/quantum-ui/TextField';
import { type CreateCloudProviderData, createCloudProviderSchema } from '@/schemas/admin/cloud-providers';
import { useCloudProviders, useCreateCloudProvider, useDeleteCloudProvider } from '@hooks/admin/cloud-providers';

export const CloudProvidersPage = () => {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: providers = [], isLoading } = useCloudProviders();
  const deleteMutation = useDeleteCloudProvider();

  const form = useForm<CreateCloudProviderData>({
    resolver: zodResolver(createCloudProviderSchema),
    defaultValues: { name: '', code: '' },
  });

  const createMutation = useCreateCloudProvider({
    onSuccess: () => {
      setShowAddForm(false);
      form.reset();
    },
  });

  // Filter providers by name or code against the search query
  const filtered = useMemo(
    () =>
      providers.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.code.toLowerCase().includes(search.toLowerCase()),
      ),
    [providers, search],
  );

  // Hide form and reset state on cancel
  const handleCancel = () => {
    setShowAddForm(false);
    form.reset();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-base font-medium">Cloud Providers</h2>
          <p className="text-muted-foreground text-sm">Manage cloud infrastructure providers</p>
        </div>
        {!showAddForm && (
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="size-4" />
            Add Provider
          </Button>
        )}
      </div>

      {/* Inline add form — shown when Add Provider is clicked */}
      {showAddForm && (
        <div className="bg-card border-primary/30 flex flex-col gap-4 rounded-2xl border p-6">
          <p className="text-foreground text-sm font-medium">New Cloud Provider</p>
          <Form form={form} mutation={createMutation} showRootError>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <TextField name="name" label="Provider Name" placeholder="e.g. Amazon Web Services" />
              </div>
              <div className="w-32">
                <TextField name="code" label="Code" placeholder="e.g. AWS" />
              </div>
              <div className="flex shrink-0 gap-2 pb-1">
                <Button type="submit" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                  Add
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </Form>
        </div>
      )}

      {/* Search */}
      <div className="relative w-96">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <input
          className="bg-muted/30 border-border placeholder:text-muted-foreground text-foreground w-full rounded-xl border py-2 pl-9 pr-3 text-sm focus:outline-none"
          placeholder="Search providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="border-border overflow-hidden rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-border border-b">
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-bold">Provider</th>
              <th className="text-muted-foreground px-4 py-3 text-center text-xs font-bold">Code</th>
              <th className="text-muted-foreground px-4 py-3 text-center text-xs font-bold">Regions</th>
              <th className="text-muted-foreground px-4 py-3 text-center text-xs font-bold">Deployments</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Spinner className="text-primary mx-auto size-6" />
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted-foreground px-4 py-12 text-center text-sm">
                  No providers found
                </td>
              </tr>
            )}
            {filtered.map((provider, index) => (
              <tr
                key={provider.id}
                className={`border-border border-b last:border-0 ${index % 2 === 1 ? 'bg-card/20' : ''}`}
              >
                {/* Provider name + ID */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex size-8 items-center justify-center rounded-xl">
                      <Cloud className="text-primary size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm">{provider.name}</span>
                      <span className="text-muted-foreground font-mono text-[10px]">{provider.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </td>
                {/* Provider code badge */}
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <Badge variant="outline" className="font-mono text-[10px] font-medium">
                      {provider.code}
                    </Badge>
                  </div>
                </td>
                {/* Regions */}
                <td className="text-foreground px-4 py-3 text-center text-sm">{provider.regionCount}</td>
                {/* Deployments — not yet available from API */}
                <td className="text-foreground px-4 py-3 text-center text-sm">—</td>
                {/* Row actions */}
                <td className="px-4 py-3">
                  <DropdownMenuRoot>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteMutation.mutate(provider.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuRoot>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      {!isLoading && (
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span>
            {providers.length} provider{providers.length !== 1 ? 's' : ''}
          </span>
          <span className="opacity-40">|</span>
          <span>Mapped to {providers.reduce((sum, p) => sum + p.regionCount, 0)} region slots</span>
        </div>
      )}
    </div>
  );
};
