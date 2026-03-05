import { Sidebar, SidebarInset, type SidebarNavGroup, SidebarProvider } from '@vritti/quantum-ui/Sidebar';
import { Cloud } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

const navGroups: SidebarNavGroup[] = [
  {
    label: 'Admin',
    items: [{ title: 'Cloud Providers', icon: Cloud, path: '/cloud-providers' }],
  },
];

// Layout with sidebar for admin pages
export const AdminLayout = () => {
  return (
    <SidebarProvider>
      <TopBar />
      <Sidebar groups={navGroups} topOffset={14} />
      <SidebarInset className="pt-14">
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
