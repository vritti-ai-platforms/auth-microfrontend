import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const SuccessStep: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('../login', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-success" />
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          Password reset successful
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          Your password has been updated. Redirecting to sign in...
        </Typography>
      </div>

      <Link to="../login" className="inline-flex items-center justify-center text-sm text-primary hover:underline">
        Sign in now
      </Link>
    </div>
  );
};
