import { useCloudProviders } from '@hooks/admin/cloud-providers';
import {
  useAddCloudProvider,
  useDeleteRegion,
  useRegion,
  useRegionCloudProviders,
  useRemoveCloudProvider,
} from '@hooks/admin/regions';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Switch } from '@vritti/quantum-ui/Switch';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EditRegionForm } from './forms/EditRegionForm';

export const RegionViewPage = () => {
  const { id } = useSlugParams();
  const navigate = useNavigate();

  const editDialog = useDialog();
  const deleteDialog = useDialog();

  const { data: region, isLoading: regionLoading } = useRegion(id ?? '');
  const { data: assignedProviders = [], isLoading: assignedLoading } = useRegionCloudProviders(id ?? '');
  const { data: allProvidersResponse, isLoading: allProvidersLoading } = useCloudProviders();
  const allProviders = allProvidersResponse?.data ?? [];

  const deleteMutation = useDeleteRegion({
    onSuccess: () => navigate('/regions'),
  });

  const addProviderMutation = useAddCloudProvider();
  const removeProviderMutation = useRemoveCloudProvider();

  // Build a set of assigned provider IDs for quick lookup
  const assignedIds = new Set(assignedProviders.map((p) => p.id));

  // Toggle a cloud provider on or off for this region
  const handleProviderToggle = (providerId: string, enabled: boolean) => {
    if (!id) return;
    if (enabled) {
      addProviderMutation.mutate({ regionId: id, providerId });
    } else {
      removeProviderMutation.mutate({ regionId: id, providerId });
    }
  };

  // Confirm deletion
  const handleDeleteConfirm = () => {
    if (!id) return;
    deleteMutation.mutate(id);
  };

  if (regionLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!region) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={region.name}
        description={`${region.city}, ${region.state} — ${region.code}`}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Cloud Providers card */}
      <Card>
        <CardHeader>
          <CardTitle>Cloud Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedLoading || allProvidersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : allProviders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cloud providers available.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {allProviders.map((provider) => {
                const isAssigned = assignedIds.has(provider.id);
                const isPending =
                  (addProviderMutation.isPending && addProviderMutation.variables?.providerId === provider.id) ||
                  (removeProviderMutation.isPending && removeProviderMutation.variables?.providerId === provider.id);

                return (
                  <div key={provider.id} className="flex items-center justify-between py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{provider.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{provider.code}</span>
                    </div>
                    <Switch
                      checked={isAssigned}
                      disabled={isPending}
                      onCheckedChange={(checked) => handleProviderToggle(provider.id, checked)}
                      aria-label={`${isAssigned ? 'Remove' : 'Add'} ${provider.name}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone card */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="size-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete this region</p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={deleteDialog.open}>
              Delete Region
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog
        open={editDialog.isOpen}
        onOpenChange={(v) => { if (!v) editDialog.close(); }}
        title="Edit Region"
        description="Update the details for this region."
        content={(close) => <EditRegionForm region={region} onSuccess={close} onCancel={close} />}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialog.isOpen}
        onOpenChange={(v) => { if (!v) deleteDialog.close(); }}
        title="Delete Region"
        description={`Are you sure you want to delete "${region.name}"? This action cannot be undone.`}
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={deleteDialog.close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Region'}
            </Button>
          </div>
        }
      />
    </div>
  );
};
