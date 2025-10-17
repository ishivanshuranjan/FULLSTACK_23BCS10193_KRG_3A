import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, QrCode as QrCodeIcon, Download, Trash2 } from 'lucide-react';
import QRCode from 'qrcode';

interface Session {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  qr_code: string;
  is_active: boolean;
  created_at: string;
}

export default function SessionsTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading sessions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique QR code data
      const qrData = `${crypto.randomUUID()}:${Date.now()}`;

      const { error } = await supabase.from('sessions').insert({
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time,
        end_time: formData.end_time,
        qr_code: qrData,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Session created',
        description: 'New session has been created successfully',
      });

      setDialogOpen(false);
      setFormData({ title: '', description: '', start_time: '', end_time: '' });
      loadSessions();
    } catch (error: any) {
      toast({
        title: 'Error creating session',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const downloadQRCode = async (session: Session) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(session.qr_code, {
        width: 512,
        margin: 2,
      });

      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `${session.title.replace(/\s+/g, '-')}-QR.png`;
      link.click();

      toast({
        title: 'QR Code downloaded',
        description: `Downloaded QR code for ${session.title}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error downloading QR code',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleSession = async (session: Session) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_active: !session.is_active })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: session.is_active ? 'Session deactivated' : 'Session activated',
      });

      loadSessions();
    } catch (error: any) {
      toast({
        title: 'Error updating session',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This will also delete all attendance records.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Session deleted',
        description: 'Session has been removed',
      });

      loadSessions();
    } catch (error: any) {
      toast({
        title: 'Error deleting session',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Sessions Management</CardTitle>
            <CardDescription>Create and manage attendance sessions</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>
                  Set up a new attendance session with date and time
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Morning Class"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Session details..."
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
                <Button onClick={createSession} className="w-full">
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No sessions yet. Create your first session to get started.
            </p>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className={session.is_active ? 'border-accent' : ''}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{session.title}</h3>
                      {session.description && (
                        <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                      )}
                      <div className="mt-2 text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">Start:</span>{' '}
                          {new Date(session.start_time).toLocaleString()}
                        </p>
                        <p>
                          <span className="text-muted-foreground">End:</span>{' '}
                          {new Date(session.end_time).toLocaleString()}
                        </p>
                        <p>
                          <span className={session.is_active ? 'text-accent font-medium' : 'text-muted-foreground'}>
                            {session.is_active ? '● Active' : '○ Inactive'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => downloadQRCode(session)}
                        title="Download QR Code"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={session.is_active ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => toggleSession(session)}
                      >
                        {session.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteSession(session.id)}
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
