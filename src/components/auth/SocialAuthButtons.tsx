import { Button } from '@vritti/quantum-ui/Button';
import type React from 'react';
import { AppleIcon } from '../icons/AppleIcon';
import { FacebookIcon } from '../icons/FacebookIcon';
import { GoogleIcon } from '../icons/GoogleIcon';
import { MicrosoftIcon } from '../icons/MicrosoftIcon';
import { XIcon } from '../icons/XIcon';

interface SocialButtonProps {
  provider: 'google' | 'x' | 'facebook' | 'apple' | 'microsoft';
  onClick?: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, onClick }) => {
  const providerConfig = {
    google: {
      icon: <GoogleIcon className="h-6 w-6" />,
      label: 'Google',
      bgColor: 'bg-card',
      hoverColor: 'hover:bg-secondary',
      textColor: 'text-card-foreground',
      borderColor: 'border-border',
    },
    facebook: {
      icon: <FacebookIcon className="h-6 w-6" />,
      label: 'Facebook',
      bgColor: 'bg-[var(--brand-facebook)]',
      hoverColor: 'hover:bg-[var(--brand-facebook-hover)]',
      textColor: 'text-white',
      borderColor: 'border-transparent',
    },
    x: {
      icon: <XIcon className="h-6 w-6 text-white dark:text-black" />,
      label: 'X',
      bgColor: 'bg-black dark:bg-white',
      hoverColor: 'hover:bg-gray-900 dark:hover:bg-gray-100',
      textColor: 'text-white dark:text-black',
      borderColor: 'border-transparent',
    },
    apple: {
      icon: <AppleIcon className="h-6 w-6 text-white dark:text-black" />,
      label: 'Apple',
      bgColor: 'bg-black dark:bg-white',
      hoverColor: 'hover:bg-gray-900 dark:hover:bg-gray-100',
      textColor: 'text-white dark:text-black',
      borderColor: 'border-transparent',
    },
    microsoft: {
      icon: <MicrosoftIcon className="h-6 w-6" />,
      label: 'Microsoft',
      bgColor: 'bg-secondary',
      hoverColor: 'hover:bg-secondary/80',
      textColor: 'text-secondary-foreground',
      borderColor: 'border-border',
    },
  };

  const config = providerConfig[provider];

  return (
    <Button
      variant="outline"
      className={`w-12 h-12 p-0 flex items-center justify-center ${config.bgColor} ${config.hoverColor} ${config.textColor} ${config.borderColor} transition-colors`}
      onClick={onClick}
      aria-label={`Sign in with ${config.label}`}
    >
      {config.icon}
    </Button>
  );
};

export const SocialAuthButtons: React.FC = () => {
  const handleOAuthLogin = (provider: string) => {
    // Get API URL from environment variable
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

    // Redirect to backend OAuth endpoint
    // Backend will redirect to the OAuth provider, then back to our success/error pages
    window.location.href = `${apiUrl}/cloud-api/auth/oauth/${provider}`;
  };

  return (
    <div className="flex gap-3 w-full justify-center">
      <SocialButton provider="google" onClick={() => handleOAuthLogin('google')} />
      <SocialButton provider="x" onClick={() => handleOAuthLogin('x')} />
      <SocialButton provider="facebook" onClick={() => handleOAuthLogin('facebook')} />
      {/* <SocialButton provider="apple" onClick={() => handleOAuthLogin('apple')} /> */}
      <SocialButton provider="microsoft" onClick={() => handleOAuthLogin('microsoft')} />
    </div>
  );
};
