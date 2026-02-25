import { useMyOrgs } from '@hooks/organizations';
import type { OrgListItem } from '@schemas/organizations';
import { OrgMemberRole, OrgPlan } from '@schemas/organizations';
import { Avatar, AvatarFallback } from '@vritti/quantum-ui/Avatar';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card } from '@vritti/quantum-ui/Card';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowRight, Building2, Plus } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

// Renders a single organization membership card
const OrgCard: React.FC<{ org: OrgListItem }> = ({ org }) => {
  // Get 2-letter initials from org name
  const initials = org.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Map role to badge variant
  const roleBadgeVariant = org.role === OrgMemberRole.Owner ? 'default' : 'secondary';

  // Map plan to badge variant
  const planBadgeVariant =
    org.plan === OrgPlan.enterprise ? 'default' : org.plan === OrgPlan.pro ? 'secondary' : 'outline';

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Typography variant="body1" className="font-semibold truncate">
            {org.name}
          </Typography>
          <Typography variant="body2" intent="muted" className="font-mono text-xs truncate">
            {org.subdomain}.vrittiai.com
          </Typography>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={roleBadgeVariant}>{org.role}</Badge>
        <Badge variant={planBadgeVariant}>{org.plan}</Badge>
      </div>

      <div className="pt-2 border-t border-border">
        <Button variant="link" className="p-0 h-auto text-primary text-sm gap-1">
          Open Dashboard <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
};

// Skeleton placeholder displayed while org data is loading
const OrgCardSkeleton: React.FC = () => (
  <Card className="flex flex-col gap-4 p-5">
    <div className="flex items-start gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-12 rounded-full" />
    </div>
    <Skeleton className="h-4 w-28 mt-2" />
  </Card>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: orgs, isLoading } = useMyOrgs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Typography variant="h3">My Organizations</Typography>
          <Typography variant="body2" intent="muted">
            Manage your organizations and their configurations
          </Typography>
        </div>
        <Button onClick={() => navigate('/organizations/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Organization
        </Button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <OrgCardSkeleton />
            <OrgCardSkeleton />
            <OrgCardSkeleton />
          </>
        ) : orgs && orgs.length > 0 ? (
          orgs.map((org) => <OrgCard key={org.id} org={org} />)
        ) : (
          <div className="col-span-full py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="body1" intent="muted">
              You don't belong to any organizations yet.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
