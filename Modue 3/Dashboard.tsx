import { useEffect, useState } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  QrCode, 
  Users, 
  Calendar, 
  CheckCircle,
  Shield,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    myAttendance: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, isAdmin]);

  const loadStats = async () => {
    try {
      // Get total sessions
      const { count: totalSessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true });

      // Get active sessions
      const now = new Date().toISOString();
      const { count: activeSessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('start_time', now)
        .gte('end_time', now);

      // Get my attendance
      const { count: myAttendance } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      let totalUsers = 0;
      if (isAdmin) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        totalUsers = count || 0;
      }

      setStats({
        totalSessions: totalSessions || 0,
        activeSessions: activeSessions || 0,
        myAttendance: myAttendance || 0,
        totalUsers,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Attendance Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! {isAdmin && <span className="text-accent">(Admin)</span>}
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.activeSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Attendance</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myAttendance}</div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/scanner')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary rounded-lg">
                  <QrCode className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Scan QR Code</CardTitle>
                  <CardDescription>Check in to an attendance session</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {isAdmin && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent rounded-lg">
                    <Shield className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle>Admin Panel</CardTitle>
                    <CardDescription>Manage sessions, users, and attendance</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
