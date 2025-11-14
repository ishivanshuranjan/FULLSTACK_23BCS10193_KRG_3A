import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import heroImage from "@assets/generated_images/Person_scanning_QR_code_office_4ce8d241.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (email: string, password: string) => {
    console.log("Login attempt:", { email, password });
  };

  const handleRegister = (data: any) => {
    console.log("Register attempt:", data);
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
