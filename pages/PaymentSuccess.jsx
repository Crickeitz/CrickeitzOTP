import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Phone } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("checking");
  const [attempts, setAttempts] = useState(0);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const checkPaymentStatus = useCallback(async () => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    try {
      const { data } = await axios.get(`${API}/payments/status/${sessionId}`, { withCredentials: true });
      
      if (data.payment_status === "paid") {
        setStatus("success");
        await refreshUser();
      } else if (data.status === "expired") {
        setStatus("expired");
      } else if (attempts < 5) {
        setAttempts(a => a + 1);
        setTimeout(() => checkPaymentStatus(), 2000);
      } else {
        setStatus("pending");
      }
    } catch (err) {
      setStatus("error");
    }
  }, [sessionId, attempts, refreshUser]);

  useEffect(() => {
    checkPaymentStatus();
  }, []);  // Only run once on mount

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6">
      <div className="card-terminal p-8 rounded-sm max-w-md w-full text-center" data-testid="payment-success-card">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded bg-[#39FF14]/10 flex items-center justify-center neon-border">
            <Phone className="w-5 h-5 text-[#39FF14]" />
          </div>
          <span className="font-heading font-bold text-xl text-white">Crickeitz<span className="text-[#39FF14]"> OTP</span></span>
        </div>

        {status === "checking" && (
          <>
            <Loader2 className="w-16 h-16 text-[#39FF14] mx-auto mb-6 animate-spin" />
            <h1 className="font-heading text-2xl font-bold text-white mb-2">Processing Payment</h1>
            <p className="text-[#A1A1AA]">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-[#39FF14] mx-auto mb-6" />
            <h1 className="font-heading text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-[#A1A1AA] mb-8">Your account has been activated. You now have access to all VOIP routes.</p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="btn-primary px-8 py-4 rounded-sm"
              data-testid="go-to-dashboard-btn"
            >
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "pending" && (
          <>
            <Loader2 className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="font-heading text-2xl font-bold text-white mb-2">Payment Processing</h1>
            <p className="text-[#A1A1AA] mb-8">Your payment is still being processed. Please check back in a moment.</p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="btn-secondary px-8 py-4 rounded-sm"
              data-testid="go-to-dashboard-pending-btn"
            >
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "expired" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-[#FF6B6B] text-3xl">!</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white mb-2">Session Expired</h1>
            <p className="text-[#A1A1AA] mb-8">Your payment session has expired. Please try again.</p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="btn-secondary px-8 py-4 rounded-sm"
              data-testid="try-again-btn"
            >
              Back to Dashboard
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-[#FF6B6B] text-3xl">!</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
            <p className="text-[#A1A1AA] mb-8">We couldn't verify your payment. Please contact support if you were charged.</p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="btn-secondary px-8 py-4 rounded-sm"
              data-testid="back-to-dashboard-error-btn"
            >
              Back to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
