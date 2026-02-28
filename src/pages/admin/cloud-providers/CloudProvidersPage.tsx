import { zodResolver } from '@hookform/resolvers/zod';
import { useCloudProviders, useCreateCloudProvider, useDeleteCloudProvider } from '@hooks/admin/cloud-providers';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
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
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Cloud, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type CreateCloudProviderData, createCloudProviderSchema } from '@/schemas/admin/cloud-providers';

export const CloudProvidersPage = () => {
  const [search, setSearch] = useState('');
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

  // Filter providers by name or code against the search query
  const filtered = useMemo(
    () =>
      providers.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()),
      ),
    [providers, search],
  );

  // Hide dialog and reset state on cancel
  const handleCancel = () => {
    setDialogOpen(false);
    form.reset();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Cloud Providers"
        description="Manage cloud infrastructure providers"
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Add Provider
          </Button>
        }
      />

      {/* Add Provider dialog */}
      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Cloud Provider</DialogTitle>
            <DialogDescription>Enter a name and a short code for the new cloud provider.</DialogDescription>
          </DialogHeader>
          <Form form={form} mutation={createMutation} showRootError>
            <div className="flex flex-col gap-4">
              <TextField name="name" label="Provider Name" placeholder="e.g. Amazon Web Services" />
              <TextField
                name="code"
                label="Code"
                placeholder="e.g. AWS"
                description="Short identifier used across the platform"
              />
            </div>
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
