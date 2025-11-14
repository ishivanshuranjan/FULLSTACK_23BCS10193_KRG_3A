import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";

interface RegisterFormProps {
  onSubmit: (data: { name: string; email: string; employeeId: string; role: string; password: string }) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSubmit, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    onSubmit({ name, email, employeeId, role, password });
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>Enter your details to register for QR attendance</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" data-testid="label-name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="input-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" data-testid="label-email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeeId" data-testid="label-employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              type="text"
              placeholder="EMP001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              data-testid="input-employeeId"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" data-testid="label-role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" data-testid="select-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" data-testid="label-password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" data-testid="label-confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              data-testid="input-confirmPassword"
            />
          </div>
          <Button type="submit" className="w-full" data-testid="button-register">
            <UserPlus className="w-4 h-4 mr-2" />
            Register
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover-elevate active-elevate-2 font-medium"
              data-testid="button-switch-login"
            >
              Sign In
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
