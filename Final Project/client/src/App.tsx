import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import AdminDashboard from "@/pages/AdminDashboard";
import SessionsPage from "@/pages/SessionsPage";
import AttendancePage from "@/pages/AttendancePage";
import UsersPage from "@/pages/UsersPage";
import UserScanner from "@/pages/UserScanner";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import heroImage from "@assets/generated_images/Person_scanning_QR_code_office_4ce8d241.png";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (data: any) => {
    try {
      await register(data);
      toast({
        title: "Success",
        description: "Registration successful",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToRegister={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
      
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10" />
        <img
          src={heroImage}
          alt="Professional QR code scanning"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-lg">
            <h1 className="text-4xl font-bold mb-4">
              Modern Attendance Tracking
            </h1>
            <p className="text-lg opacity-90">
              Simplify attendance management with QR code technology. 
              Secure, fast, and reliable check-in/check-out system for your organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (user.role === "user") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
            <h1 className="text-xl font-bold">QR Attendance</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover-elevate active-elevate-2 px-3 py-2 rounded-lg"
                data-testid="button-logout"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="p-6">
          <UserScanner />
        </main>
      </div>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar onLogout={logout} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-8">
            <Switch>
              <Route path="/" component={() => <Redirect to="/admin" />} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/sessions" component={SessionsPage} />
              <Route path="/admin/attendance" component={AttendancePage} />
              <Route path="/admin/users" component={UsersPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
