import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle2 } from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const SignupSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from route state
  const email = location.state?.email || 'user@example.com';

  const handleStartOnboarding = () => {
    navigate('/onboarding/verify-email');
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="bg-green-100 rounded-full p-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-1">
        <Typography variant="h4" align="center" className="text-foreground">
          Account created successfully!
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Your account has been created using OAuth authentication
        </Typography>
      </div>

      {/* Email Display Box */}
      <div className="bg-accent rounded-lg p-3 text-center border border-border">
        <Typography variant="caption" intent="muted" className="block mb-1">
          Account email
        </Typography>
        <Typography variant="body2" className="font-medium text-foreground">
          {email}
        </Typography>
      </div>

      {/* Next Steps Section */}
      <div className="border border-border rounded-lg p-4 space-y-2">
        <Typography variant="body2" className="font-medium text-foreground">
          Next steps:
        </Typography>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Verify your email address</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Set up mobile verification</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Configure two-factor authentication</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Complete your profile setup</span>
          </li>
        </ul>
      </div>

      {/* Start Onboarding Button */}
      <Button onClick={handleStartOnboarding} className="w-full bg-primary text-primary-foreground">
        Start Onboarding
      </Button>

      {/* Helper Text */}
      <Typography variant="caption" align="center" intent="muted" className="text-center">
        This will guide you through securing your account
      </Typography>
    </div>
  );
};
