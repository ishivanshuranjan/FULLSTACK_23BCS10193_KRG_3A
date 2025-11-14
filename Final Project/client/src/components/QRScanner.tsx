import { useState } from "react";
import QrScanner from "react-qr-scanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Camera } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleScan = (data: any) => {
    if (data?.text) {
      setScanResult({ type: 'success', message: 'QR Code scanned successfully!' });
      onScan(data.text);
      
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setScanResult({ type: 'error', message: 'Failed to access camera. Please check permissions.' });
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <CardTitle className="text-xl font-semibold">Scan QR Code</CardTitle>
        </div>
        <CardDescription>Position the QR code within the frame</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black" data-testid="scanner-viewport">
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute inset-0 border-4 border-dashed border-primary/30 m-12 rounded-lg pointer-events-none" />
        </div>

        {scanResult && (
          <Alert variant={scanResult.type === 'success' ? 'default' : 'destructive'} data-testid="alert-scan-result">
            {scanResult.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{scanResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Make sure the QR code is well-lit and within the frame</p>
        </div>
      </CardContent>
    </Card>
  );
}
