import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowRight, Building2, MailOpen, Plus } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrgCard, OrgCardSkeleton } from '@/components/cloud/organizations/OrgCard';
import { useMyOrgs } from '@/hooks/cloud/organizations';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useMyOrgs({ limit: 3 });

  const visibleOrgs = data?.result ?? [];

  return (
    <div className="space-y-6">
      {/* Organizations section */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Typography variant="h3">My Organizations</Typography>
            <Typography variant="body2" intent="muted">
              Manage your organizations and their configurations
            </Typography>
          </div>
          <Button startAdornment={<Plus />} onClick={() => navigate('/organizations/new')}>
            New Organization
          </Button>
        </div>

        {/* Cards grid — max 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <OrgCardSkeleton />
              <OrgCardSkeleton />
              <OrgCardSkeleton />
            </>
          ) : visibleOrgs.length > 0 ? (
            visibleOrgs.map((org) => <OrgCard key={org.id} org={org} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Typography variant="body1" intent="muted">
                You don't belong to any organizations yet.
              </Typography>
            </div>
          )}
        </div>

        {/* Link to full list when there are more orgs than shown */}
        {data?.hasMore && (
          <Button
            variant="link"
            size="sm"
            className="px-0"
            endAdornment={<ArrowRight />}
            onClick={() => navigate('/organizations')}
          >
            View all {data.total} organizations
          </Button>
        )}
      </div>

      {/* Invitations section stub */}
      <div className="border-t border-border pt-6 space-y-4">
        {/* Section header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Typography variant="h3">Pending Invitations</Typography>
            <Typography variant="body2" intent="muted">
              Invitation requests to join organizations
            </Typography>
          </div>
          <Button variant="ghost" size="sm" endAdornment={<ArrowRight />} onClick={() => navigate('/invitations')}>
            View All
          </Button>
        </div>

        {/* Empty state */}
        <div className="py-10 text-center">
          <MailOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <Typography variant="body1" intent="muted">
            No pending invitations
          </Typography>
        </div>
      </div>
    </div>
  );
};
