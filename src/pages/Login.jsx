import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, formatApiError } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back!");
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#39FF14] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to home</span>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded bg-[#39FF14]/10 flex items-center justify-center neon-border">
              <Phone className="w-5 h-5 text-[#39FF14]" />
            </div>
            <span className="font-heading font-bold text-xl text-white">Crickeitz<span className="text-[#39FF14]"> OTP</span></span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-[#A1A1AA] mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-terminal h-12 rounded-sm"
                required
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#A1A1AA] font-mono text-xs uppercase tracking-[0.2em]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-terminal h-12 rounded-sm"
                required
                data-testid="login-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 rounded-sm text-lg"
              data-testid="login-submit-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-[#A1A1AA]">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#39FF14] hover:underline" data-testid="register-link">
              Sign up
            </Link>
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <a href="https://instagram.com/Crickeitz" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#39FF14] text-xs">Instagram @Crickeitz</a>
            <a href="https://t.me/Crickeitz" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#39FF14] text-xs">Telegram @Crickeitz</a>
          </div>
          <p className="mt-2 text-center text-[#555] text-xs">Made By: Crickeitz</p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div 
        className="hidden lg:flex flex-1 items-center justify-center p-12"
        style={{
          backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/ac67b6d9-1b74-4fd3-bd69-90a05b6922f1/images/b6bfc5526be93837ae7098f6cf0f270f0a9cba8bb859a5f5ff96daa2de4f06ae.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50" style={{ position: 'relative' }} />
        <img 
          src="https://static.prod-images.emergentagent.com/jobs/ac67b6d9-1b74-4fd3-bd69-90a05b6922f1/images/6e54cb9a90e98a74ca4b6b16a735769241d414b75c3aa6405d337b80a56126bd.png"
          alt="Crickeitz Robot"
          className="w-72 h-72 object-contain drop-shadow-2xl relative z-10"
        />
      </div>
    </div>
  );
};

export default Login;
