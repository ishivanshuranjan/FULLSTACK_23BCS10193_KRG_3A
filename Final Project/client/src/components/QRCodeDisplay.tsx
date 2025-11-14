import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock } from "lucide-react";

interface QRCodeDisplayProps {
  sessionId: string;
  sessionName: string;
  type: "checkin" | "checkout";
  expiresAt: number;
  onRegenerate: () => void;
}

export default function QRCodeDisplay({ sessionId, sessionName, type, expiresAt, onRegenerate }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const generateQR = async () => {
      if (canvasRef.current) {
        const qrData = `SESSION_${sessionId};TYPE=${type};EXP=${expiresAt}`;
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }
    };
    generateQR();
  }, [sessionId, type, expiresAt]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft === 0;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl font-semibold">{sessionName}</CardTitle>
          <Badge variant={type === "checkin" ? "default" : "secondary"} data-testid={`badge-type-${type}`}>
            {type === "checkin" ? "Check-In" : "Check-Out"}
          </Badge>
        </div>
        <CardDescription>Scan this QR code to mark attendance</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className={`p-4 bg-white rounded-lg ${isExpired ? 'opacity-50' : ''}`}>
          <canvas ref={canvasRef} data-testid="canvas-qr" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full text-sm">
          <div>
            <p className="text-muted-foreground">Session ID</p>
            <p className="font-mono text-xs" data-testid="text-sessionId">{sessionId.slice(0, 8)}...</p>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium capitalize" data-testid="text-type">{type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span className="font-mono" data-testid="text-timer">
            {isExpired ? "Expired" : `Expires in ${formatTime(timeLeft)}`}
          </span>
        </div>

        <Button
          onClick={onRegenerate}
          variant="outline"
          className="w-full"
          disabled={!isExpired}
          data-testid="button-regenerate"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {isExpired ? "Generate New QR Code" : "QR Code Active"}
        </Button>
      </CardContent>
    </Card>
  );
}
