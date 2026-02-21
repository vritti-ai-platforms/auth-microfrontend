import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import type { PhoneValue } from '@vritti/quantum-ui/PhoneField';
import { CheckCircle } from 'lucide-react';
import React from 'react';

interface SuccessStepProps {
  phoneNumber?: PhoneValue;
  onContinue: () => void;
}

// Success confirmation with phone display and continue button
export const SuccessStep: React.FC<SuccessStepProps> = ({ phoneNumber, onContinue }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
        </div>

        {/* Title and Message */}
        <div className="space-y-2">
          <Typography variant="h3" align="center" className="text-foreground">
            Mobile verified
          </Typography>
          <Typography variant="body2" align="center" intent="muted">
            Your mobile number has been successfully verified
          </Typography>
          {phoneNumber && (
            <Typography variant="body2" align="center" className="text-foreground font-medium">
              {phoneNumber}
            </Typography>
          )}
        </div>

        {/* Continue Button */}
        <Button onClick={onContinue} className="w-full bg-primary text-primary-foreground">
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
};
