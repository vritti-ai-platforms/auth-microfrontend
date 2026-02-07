import { ThemeToggle } from '@vritti/quantum-ui/ThemeToggle';
import type React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../../assets/logo.png';

export const SettingsLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src={Logo} alt="Vritti" className="h-8 w-auto" />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
};
