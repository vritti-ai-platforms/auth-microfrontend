import { Button } from '@vritti/quantum-ui/Button';
import { useSSE } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type React from 'react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

type VerificationEventMap = {
  initiated: { verificationCode: string; instructions: string; expiresAt: string; whatsappNumber?: string };
  verified: { phone: string };
  error: { message: string };
  expired: { message: string };
};

const SSE_EVENTS: (keyof VerificationEventMap)[] = ['initiated', 'verified', 'error', 'expired'];

interface QRVerificationStepProps {
  method: 'whatsapp' | 'sms';
  onSuccess: (phoneNumber: string) => void;
  onBack: () => void;
}

// Builds a WhatsApp or SMS deep-link URL from the verification code
function buildQrUrl(method: 'whatsapp' | 'sms', verificationCode: string, whatsappNumber?: string): string {
  if (method === 'whatsapp') {
    const number = whatsappNumber || '15551560440';
    return `https://wa.me/${number}?text=${encodeURIComponent(verificationCode)}`;
  }
  return `sms:?body=${encodeURIComponent(verificationCode)}`;
}

// Shared back link + header used by all event states
const BackLink: React.FC<{ onBack: () => void }> = ({ onBack }) => (
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
);

// SSE-driven QR verification — switch on eventType for each state
export const QRVerificationStep: React.FC<QRVerificationStepProps> = ({ method, onSuccess, onBack }) => {
  const { eventType, data, eventTypes } = useSSE<VerificationEventMap>({
    path: `/cloud-api/onboarding/mobile-verification/events/${method}`,
    events: SSE_EVENTS,
  });

  // Side effect: navigate on verification success
  useEffect(() => {
    if (eventType === eventTypes.VERIFIED) {
      onSuccess((data as VerificationEventMap['verified']).phone);
    }
  }, [eventType, data, eventTypes, onSuccess]);

  const title = method === 'whatsapp' ? 'Scan with WhatsApp' : 'Scan with SMS';

  // Derive QR URL only when initiated
  const initiated = eventType === eventTypes.INITIATED ? (data as VerificationEventMap['initiated']) : null;
  const qrCodeUrl = useMemo(
    () => (initiated ? buildQrUrl(method, initiated.verificationCode, initiated.whatsappNumber) : ''),
    [initiated, method],
  );

  switch (eventType) {
    // Waiting for SSE connection + first event
    case null:
      return (
        <div className="space-y-6">
          <BackLink onBack={onBack} />
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Typography variant="body2" align="center" intent="muted">
              {method === 'whatsapp' ? 'Setting up WhatsApp verification...' : 'Setting up SMS verification...'}
            </Typography>
          </div>
        </div>
      );

    // QR code ready — show code + waiting indicator
    case eventTypes.INITIATED:
      return (
        <div className="space-y-6">
          <BackLink onBack={onBack} />
          <div className="text-center space-y-2">
            <Typography variant="h3" align="center" className="text-foreground">
              {title}
            </Typography>
            <Typography variant="body2" align="center" intent="muted">
              Scan this QR code to send the verification message
            </Typography>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG value={qrCodeUrl} size={180} />
              </div>
            </div>

            <div className="text-center">
              <Typography variant="body2" intent="muted">
                Or send this code manually:
              </Typography>
              <Typography variant="h4" className="text-foreground font-mono mt-1">
                {(data as VerificationEventMap['initiated']).verificationCode}
              </Typography>
            </div>

            <Typography variant="body2" className="text-foreground font-medium text-center">
              {(data as VerificationEventMap['initiated']).instructions}
            </Typography>

            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <Typography variant="body2" intent="muted">
                Waiting for verification...
              </Typography>
            </div>

            <Typography variant="body2" align="center" intent="muted">
              Having trouble?{' '}
              <Button variant="link" onClick={onBack} className="p-0 h-auto font-medium">
                Try another method
              </Button>
            </Typography>
          </div>
        </div>
      );

    // Verified — useEffect handles onSuccess, show brief loading
    case eventTypes.VERIFIED:
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );

    // Error from backend
    case eventTypes.ERROR:
      return (
        <div className="space-y-6">
          <BackLink onBack={onBack} />
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {(data as VerificationEventMap['error']).message}
          </div>
          <Button variant="outline" onClick={onBack} className="w-full">
            Try another method
          </Button>
        </div>
      );

    // Verification expired
    case eventTypes.EXPIRED:
      return (
        <div className="space-y-6">
          <BackLink onBack={onBack} />
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            Verification expired. Please go back and try again.
          </div>
          <Button variant="outline" onClick={onBack} className="w-full">
            Try again
          </Button>
        </div>
      );

    default:
      return null;
  }
};
