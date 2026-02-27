import { Breadcrumb } from '@vritti/quantum-ui/Breadcrumb';
import { Button } from '@vritti/quantum-ui/Button';
import { Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/vritti-cloud.png';
import { UserMenu } from './UserMenu';

export const TopBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-sm border-b border-border min-w-[280px]">
      <div className="h-14 px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logoImg} alt="Vritti Logo" className="h-8" />
        </Link>

        {/* Breadcrumb */}
        <div className="flex-1 px-6">
          <Breadcrumb maxItems={4} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          {/* Ask Vritti Button */}
          <Button variant="ghost" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Ask Vritti</span>
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </div>
  );
};
