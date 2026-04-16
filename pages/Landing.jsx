import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Phone, Globe, Zap, Shield, CreditCard, Bitcoin, ArrowRight, Check, MessageSquare } from "lucide-react";

const Landing = () => {
  const { user } = useAuth();

  const voipRoutes = [
    { country: "United States", code: "US", rate: "$0.35/min", flag: "\u{1F1FA}\u{1F1F8}" },
    { country: "United Kingdom", code: "UK", rate: "$0.35/min", flag: "\u{1F1EC}\u{1F1E7}" },
    { country: "Canada", code: "CA", rate: "$0.35/min", flag: "\u{1F1E8}\u{1F1E6}" },
  ];

  const smsRoutes = [
    { country: "United States", code: "US", rate: "$0.05/msg", flag: "\u{1F1FA}\u{1F1F8}" },
    { country: "United Kingdom", code: "UK", rate: "$0.05/msg", flag: "\u{1F1EC}\u{1F1E7}" },
    { country: "Canada", code: "CA", rate: "$0.05/msg", flag: "\u{1F1E8}\u{1F1E6}" },
  ];

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: "Instant Setup", desc: "Get your VOIP & SMS panel running in minutes" },
    { icon: <Shield className="w-6 h-6" />, title: "Secure & Reliable", desc: "Enterprise-grade security for your services" },
    { icon: <Globe className="w-6 h-6" />, title: "Global Coverage", desc: "Routes available for US, UK, and Canada" },
    { icon: <CreditCard className="w-6 h-6" />, title: "Flexible Payments", desc: "Pay with card or cryptocurrency" },
    { icon: <MessageSquare className="w-6 h-6" />, title: "SMS Services", desc: "Bulk SMS with routes starting at $0.50/msg" },
    { icon: <Phone className="w-6 h-6" />, title: "VOIP/SIP Panels", desc: "Premium voice routes at $0.35/min" },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#39FF14]/10 flex items-center justify-center neon-border">
              <Phone className="w-5 h-5 text-[#39FF14]" />
            </div>
            <span className="font-heading font-bold text-xl text-white">Crickeitz<span className="text-[#39FF14]"> OTP</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#routes" className="text-[#A1A1AA] hover:text-[#39FF14] transition-colors text-sm font-medium">Routes</a>
            <a href="#pricing" className="text-[#A1A1AA] hover:text-[#39FF14] transition-colors text-sm font-medium">Pricing</a>
            <a href="#features" className="text-[#A1A1AA] hover:text-[#39FF14] transition-colors text-sm font-medium">Features</a>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                <Button data-testid="dashboard-btn" className="btn-primary px-6 py-2 rounded-sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button data-testid="login-btn" variant="ghost" className="text-[#A1A1AA] hover:text-[#39FF14]">Login</Button>
                </Link>
                <Link to="/register">
                  <Button data-testid="get-started-btn" className="btn-primary px-6 py-2 rounded-sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center pt-20"
        style={{
          backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/ac67b6d9-1b74-4fd3-bd69-90a05b6922f1/images/b6bfc5526be93837ae7098f6cf0f270f0a9cba8bb859a5f5ff96daa2de4f06ae.png)`,
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              <span className="text-[#39FF14] text-sm font-mono">VOIP/SIP & SMS PANELS AVAILABLE</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-6">
              Premium <span className="text-[#39FF14] neon-text">VOIP & SMS</span><br />
              Routes For Your Business
            </h1>
            <p className="text-[#A1A1AA] text-lg max-w-xl mb-8 leading-relaxed">
              Get instant access to high-quality SIP panels and SMS services with routes for US, UK, and Canada.
              VOIP at $0.35/min, SMS at $0.05/msg with a one-time $100 activation fee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button data-testid="hero-cta-btn" className="btn-primary px-8 py-6 rounded-sm text-lg flex items-center gap-2">
                  Start Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button data-testid="view-pricing-btn" className="btn-secondary px-8 py-6 rounded-sm text-lg">View Pricing</Button>
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="https://static.prod-images.emergentagent.com/jobs/ac67b6d9-1b74-4fd3-bd69-90a05b6922f1/images/6e54cb9a90e98a74ca4b6b16a735769241d414b75c3aa6405d337b80a56126bd.png"
              alt="Crickeitz OTP Robot"
              className="w-80 h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section id="routes" className="py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#39FF14] font-mono text-sm tracking-[0.2em] uppercase">Available Routes</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-4">Premium SIP & SMS Routes</h2>
          </div>

          {/* VOIP Routes */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Phone className="w-6 h-6 text-[#39FF14]" />
              <h3 className="font-heading text-xl font-semibold text-white">VOIP/SIP Routes</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {voipRoutes.map((route) => (
                <div key={route.code} className="card-terminal p-8 rounded-sm" data-testid={`voip-route-card-${route.code}`}>
                  <div className="text-5xl mb-4">{route.flag}</div>
                  <h3 className="font-heading text-xl font-semibold text-white mb-2">{route.country}</h3>
                  <p className="text-[#A1A1AA] text-sm mb-4 font-mono">Code: {route.code}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#39FF14] text-3xl font-bold">{route.rate.split('/')[0]}</span>
                    <span className="text-[#A1A1AA] text-sm">/minute</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Routes */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-[#39FF14]" />
              <h3 className="font-heading text-xl font-semibold text-white">SMS Routes</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {smsRoutes.map((route) => (
                <div key={route.code} className="card-terminal p-8 rounded-sm" data-testid={`sms-route-card-${route.code}`}>
                  <div className="text-5xl mb-4">{route.flag}</div>
                  <h3 className="font-heading text-xl font-semibold text-white mb-2">{route.country}</h3>
                  <p className="text-[#A1A1AA] text-sm mb-4 font-mono">Code: {route.code}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#39FF14] text-3xl font-bold">{route.rate.split('/')[0]}</span>
                    <span className="text-[#A1A1AA] text-sm">/message</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#39FF14] font-mono text-sm tracking-[0.2em] uppercase">Simple Pricing</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-4">Transparent & Affordable</h2>
          </div>
          <div className="max-w-lg mx-auto">
            <div className="card-terminal p-8 rounded-sm neon-glow" data-testid="pricing-card">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-heading text-xl font-semibold text-white">Account Activation</h3>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#39FF14]" />
                  <Bitcoin className="w-5 h-5 text-[#39FF14]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-[#39FF14] text-5xl font-heading font-black">$100</span>
                <span className="text-[#A1A1AA] text-lg">one-time fee</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-[#A1A1AA]"><Check className="w-5 h-5 text-[#39FF14]" /><span>Access to all VOIP & SMS routes</span></li>
                <li className="flex items-center gap-3 text-[#A1A1AA]"><Check className="w-5 h-5 text-[#39FF14]" /><span>VOIP rates at $0.35/min</span></li>
                <li className="flex items-center gap-3 text-[#A1A1AA]"><Check className="w-5 h-5 text-[#39FF14]" /><span>SMS rates at $0.05/message</span></li>
                <li className="flex items-center gap-3 text-[#A1A1AA]"><Check className="w-5 h-5 text-[#39FF14]" /><span>Credit top-up ($10, $25, $50, $100)</span></li>
                <li className="flex items-center gap-3 text-[#A1A1AA]"><Check className="w-5 h-5 text-[#39FF14]" /><span>Usage tracking dashboard</span></li>
                <li className="flex items-center gap-3 text-[#A1A1AA]"><Check className="w-5 h-5 text-[#39FF14]" /><span>Pay with Card or Crypto</span></li>
              </ul>
              <Link to="/register">
                <Button data-testid="pricing-cta-btn" className="btn-primary w-full py-6 rounded-sm text-lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#39FF14] font-mono text-sm tracking-[0.2em] uppercase">Why Choose Us</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-4">Built for Performance</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="card-terminal p-6 rounded-sm" data-testid={`feature-card-${idx}`}>
                <div className="w-12 h-12 rounded bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14] mb-4">{feature.icon}</div>
                <h3 className="font-heading text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-[#A1A1AA] text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#050505] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#39FF14]/10 flex items-center justify-center neon-border">
                <Phone className="w-4 h-4 text-[#39FF14]" />
              </div>
              <span className="font-heading font-bold text-lg text-white">Crickeitz<span className="text-[#39FF14]"> OTP</span></span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://instagram.com/Crickeitz" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#39FF14] transition-colors text-sm" data-testid="instagram-link">
                Instagram @Crickeitz
              </a>
              <a href="https://t.me/Crickeitz" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#39FF14] transition-colors text-sm" data-testid="telegram-link">
                Telegram @Crickeitz
              </a>
            </div>
            <p className="text-[#A1A1AA] text-sm">
              Made By: <span className="text-[#39FF14] font-semibold">Crickeitz</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
