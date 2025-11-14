import { useState, useRef } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, CheckCircle2, XCircle, Upload } from 'lucide-react';
import jsQR from 'jsqr';

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
        scanQRCode();
      }
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      handleQRCode(code.data);
      stopCamera();
    } else {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleQRCode = async (qrData: string) => {
    if (!user) {
      setResult({ success: false, message: 'Please log in to check in' });
      return;
    }

    try {
      // Parse QR data (expecting format: sessionId:timestamp)
      const [sessionId] = qrData.split(':');

      // First, verify the session exists and is active
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('qr_code', qrData)
        .eq('is_active', true)
        .maybeSingle();

      if (sessionError || !session) {
        setResult({ success: false, message: 'Invalid or expired QR code' });
        return;
      }

      // Check if session time is valid
      const now = new Date();
      const startTime = new Date(session.start_time);
      const endTime = new Date(session.end_time);

      if (now < startTime || now > endTime) {
        setResult({ success: false, message: 'Session is not currently active' });
        return;
      }

      // Check if already checked in
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('session_id', session.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingAttendance) {
        setResult({ success: false, message: 'Already checked in to this session' });
        return;
      }

      // Create attendance record
      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert({
          session_id: session.id,
          user_id: user.id,
        });

      if (attendanceError) {
        setResult({ success: false, message: 'Failed to record attendance' });
        return;
      }

      setResult({ success: true, message: `Successfully checked in to ${session.title}!` });
      toast({
        title: 'Success!',
        description: `Checked in to ${session.title}`,
      });
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Failed to process QR code' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        context.drawImage(img, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleQRCode(code.data);
        } else {
          toast({
            title: 'No QR Code Found',
            description: 'Could not find a QR code in the image',
            variant: 'destructive',
          });
        }
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Scan QR Code
            </CardTitle>
            <CardDescription>
              Scan a session QR code to check in to attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!scanning ? (
              <div className="space-y-4">
                <Button onClick={startCamera} className="w-full" size="lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Camera
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <label>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <span className="cursor-pointer">
                      <Upload className="mr-2 h-5 w-5" />
                      Upload QR Image
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <Button onClick={stopCamera} variant="outline" className="w-full">
                  Cancel Scanning
                </Button>
              </div>
            )}

            {result && (
              <Card className={result.success ? 'border-accent' : 'border-destructive'}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive shrink-0" />
                    )}
                    <p className={result.success ? 'text-accent' : 'text-destructive'}>
                      {result.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
