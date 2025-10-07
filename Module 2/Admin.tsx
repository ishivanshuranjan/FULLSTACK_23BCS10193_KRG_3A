import { useEffect, useState } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SessionsTab from '@/components/admin/SessionsTab';
import AttendanceTab from '@/components/admin/AttendanceTab';
import UsersTab from '@/components/admin/UsersTab';

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage sessions, users, and attendance</p>
          </div>
        </div>

        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <SessionsTab />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
