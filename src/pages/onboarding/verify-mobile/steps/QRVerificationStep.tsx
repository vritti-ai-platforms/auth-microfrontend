import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInitiateMobileVerification, useMobileVerificationRealtime } from '../../../../hooks';
import type { MobileVerificationStatusResponse } from '../../../../services/onboarding.service';

interface QRVerificationStepProps {
  method: 'whatsapp' | 'sms';
  onSuccess: (phoneNumber: string) => void;
  onBack: () => void;
}

// Reusable QR verification component - manages own mutations and state
export const QRVerificationStep: React.FC<QRVerificationStepProps> = ({ method, onSuccess, onBack }) => {
  // Internal state management
  const [verificationData, setVerificationData] = useState<MobileVerificationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initiate verification mutation
  const initiateMutation = useInitiateMobileVerification({
    onSuccess: (data) => {
      setVerificationData(data);
      setError(null);
    },
    onError: (err) => {
      const errorMessage = (err.response?.data as { detail?: string })?.detail || 'Failed to initiate verification';
      setError(errorMessage);
    },
  });

  // Real-time verification via SSE
  useMobileVerificationRealtime({
    enabled: !!verificationData,
    onVerified: () => {
      // Extract phone number from verification data and pass to parent
      const phone = verificationData?.phone || '';
      onSuccess(phone);
    },
    onFailed: (message) => {
      setError(message || 'Verification failed');
    },
  });

  // Auto-initiate verification when component mounts
  useEffect(() => {
    initiateMutation.mutate({ method });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once when component mounts

  // Computed values
  const isInitiating = initiateMutation.isPending;
  const isWaitingForVerification = !!verificationData && !error;
  // Generate QR code URL from verification data
  const qrCodeUrl = useMemo(() => {
    if (!verificationData?.verificationToken) return '';
    const token = verificationData.verificationToken;
    const whatsappNumber = verificationData.whatsappNumber || '15551560440';
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(token)}`;
  }, [verificationData?.verificationToken, verificationData?.whatsappNumber]);

  // If no verification data yet (still initiating), show loading
  if (!verificationData || isInitiating) {
    return (
      <div className="space-y-6">
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to methods
        </Link>

        <div className="text-center space-y-4">
          <Typography variant="h3" align="center" className="text-foreground">
            Preparing verification
          </Typography>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <Typography variant="body2" align="center" intent="muted">
            {method === 'whatsapp' ? 'Setting up WhatsApp verification...' : 'Setting up SMS verification...'}
          </Typography>
        </div>
      </div>
    );
  }

  const title = method === 'whatsapp' ? 'Scan with WhatsApp' : 'Scan with SMS';
  const description = 'Scan this QR code to send the verification message';

  return (
    <div className="space-y-6">
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to methods
      </Link>

      <div className="text-center space-y-2">
        <Typography variant="h3" align="center" className="text-foreground">
          {title}
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          {description}
        </Typography>
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}

      <div className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg">
            {qrCodeUrl ? (
              <QRCodeSVG value={qrCodeUrl} size={180} />
            ) : (
              <div className="w-[180px] h-[180px] bg-secondary border-2 border-border rounded-lg flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Verification Token Display */}
        {verificationData?.verificationToken && (
          <div className="text-center">
            <Typography variant="body2" intent="muted">
              Or send this code manually:
            </Typography>
            <Typography variant="h4" className="text-foreground font-mono mt-1">
              {verificationData.verificationToken}
            </Typography>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2">
          <Typography variant="body2" className="text-foreground font-medium text-center">
            {verificationData?.instructions || 'Scan the QR code with your phone camera'}
          </Typography>
        </div>

        {/* Waiting Status */}
        {isWaitingForVerification && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <Typography variant="body2" intent="muted">
              Waiting for verification...
            </Typography>
          </div>
        )}

        {/* Alternative Method */}
        <Typography variant="body2" align="center" intent="muted" className="text-center">
          Having trouble?{' '}
          <Button variant="link" onClick={onBack} className="p-0 h-auto font-medium">
            Try another method
          </Button>
        </Typography>
      </div>
    </div>
  );
};
