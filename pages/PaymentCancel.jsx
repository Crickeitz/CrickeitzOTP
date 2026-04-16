import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle, Phone } from "lucide-react";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6">
      <div className="card-terminal p-8 rounded-sm max-w-md w-full text-center" data-testid="payment-cancel-card">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded bg-[#39FF14]/10 flex items-center justify-center neon-border">
            <Phone className="w-5 h-5 text-[#39FF14]" />
          </div>
          <span className="font-heading font-bold text-xl text-white">Crickeitz<span className="text-[#39FF14]"> OTP</span></span>
        </div>

        <XCircle className="w-16 h-16 text-[#FF6B6B] mx-auto mb-6" />
        <h1 className="font-heading text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-[#A1A1AA] mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>
        
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            className="btn-primary px-8 py-4 rounded-sm"
            data-testid="try-again-btn"
          >
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-[#A1A1AA] hover:text-[#39FF14]"
            data-testid="back-home-btn"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
