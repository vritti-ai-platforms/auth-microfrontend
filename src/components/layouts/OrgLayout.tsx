import { AppSidebar } from '@vritti/quantum-ui/AppSidebar';
import type { SidebarNavGroup } from '@vritti/quantum-ui/AppSidebar';
import { SidebarInset, SidebarProvider } from '@vritti/quantum-ui/Sidebar';
import {
  Building2,
  CreditCard,
  Eye,
  Layers,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { TopBar } from './TopBar';

// Builds sidebar nav groups with org-scoped paths
function useOrgNavGroups(orgId: string): SidebarNavGroup[] {
  return useMemo(() => {
    const base = `/organization/${orgId}`;
    return [
      {
        label: 'Organization',
        items: [
          { title: 'Overview', icon: Eye, path: `${base}/overview` },
          { title: 'Users', icon: Users, path: `${base}/users` },
          {
            title: 'Roles & Permissions',
            icon: Shield,
            path: `${base}/roles`,
          },
          {
            title: 'Business Units',
            icon: Building2,
            path: `${base}/business-units`,
          },
          {
            title: 'Applications',
            icon: Layers,
            path: `${base}/applications`,
          },
        ],
      },
      {
        label: 'Account',
        items: [
          { title: 'Billing', icon: CreditCard, path: `${base}/billing` },
          { title: 'Settings', icon: Settings, path: `${base}/settings` },
        ],
      },
    ];
  }, [orgId]);
}

// Layout with sidebar for organization-scoped pages
export const OrgLayout = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navGroups = useOrgNavGroups(orgId!);

  return (
    <SidebarProvider>
      <TopBar />
      <AppSidebar groups={navGroups} topOffset={14} />
      <SidebarInset className="pt-14">
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
