import { Typography } from '@vritti/quantum-ui/Typography';
import { MailOpen } from 'lucide-react';
import type React from 'react';

// Stub page for pending org invitations
export const InvitationsPage: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-1">
      <Typography variant="h3">Pending Invitations</Typography>
      <Typography variant="body2" intent="muted">
        Invitation requests to join organizations
      </Typography>
    </div>
    <div className="py-16 text-center">
      <MailOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <Typography variant="body1" intent="muted">
        No pending invitations.
      </Typography>
    </div>
  </div>
);
