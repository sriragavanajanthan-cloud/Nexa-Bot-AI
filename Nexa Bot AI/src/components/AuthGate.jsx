import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import emailjs from "@emailjs/browser";

console.log('--- EmailJS Debug ---');
console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
console.log('Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
console.log('Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
console.log('---------------------');


const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function AuthGate({ children }) {
  const [email, setEmail] = useState(localStorage.getItem("nexabot_user_email") || "");
  const [step, setStep] = useState("email"); // "email" | "verify"
  const [inputEmail, setInputEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);

  if (email) return <>{children}</>;

  const startCooldown = () => {
    setResendCooldown(30);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const sendCode = async () => {
    const trimmed = inputEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    setError("");
    const generated = generateCode();
    setSentCode(generated);
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to_email: trimmed, otp_code: generated },
        PUBLIC_KEY
      );
      setStep("verify");
      startCooldown();
    } catch (e) {
      console.error("EmailJS error:", e);
      const msg = e?.text || e?.message || JSON.stringify(e);
      setError(`EmailJS error: ${msg}`);
    }
    setSending(false);
  };

  const verifyCode = () => {
    if (code.trim() !== sentCode) {
      setError("Incorrect code. Please try again.");
      return;
    }
    const trimmed = inputEmail.trim().toLowerCase();
    localStorage.setItem("nexabot_user_email", trimmed);
    setEmail(trimmed);
  };

  const resend = async () => {
    if (resendCooldown > 0 || sending) return;
    setCode("");
    setError("");
    const generated = generateCode();
    setSentCode(generated);
    setSending(true);
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to_email: inputEmail.trim().toLowerCase(), otp_code: generated },
        PUBLIC_KEY
      );
      startCooldown();
    } catch (e) {
      console.error("EmailJS resend error:", e);
      const msg = e?.text || e?.message || JSON.stringify(e);
      setError(`EmailJS error: ${msg}`);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/926442f73_NEXAbotAI.png"
            alt="NEXAbot.AI"
            className="w-20 h-20 rounded-full mb-4"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            NEXAbot.AI
          </h1>
          <p className="text-white/50 mt-2 text-sm text-center">
            {step === "email"
              ? "Enter your email to save your personalized chat history"
              : `Enter the 6-digit code sent to ${inputEmail}`}
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-4">
          {step === "email" ? (
            <>
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => { setInputEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  placeholder="you@example.com"
                  className="bg-[#0d0d0d] border-white/10 text-white placeholder:text-white/30 focus-visible:border-cyan-500/50"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button
                onClick={sendCode}
                disabled={!inputEmail || sending}
                className="w-full bg-gradient-to-r from-cyan-500 to-green-400 hover:opacity-90 text-black font-semibold"
              >
                <Mail className="w-4 h-4 mr-2" />
                {sending ? "Sending code..." : "Send Verification Code"}
              </Button>
              <p className="text-white/30 text-xs text-center">
                We'll email you a 6-digit code — no password needed.
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("email"); setCode(""); setError(""); }}
                className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Verification Code</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                  placeholder="000000"
                  className="bg-[#0d0d0d] border-white/10 text-white placeholder:text-white/30 text-center text-xl tracking-[0.4em] focus-visible:border-cyan-500/50"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button
                onClick={verifyCode}
                disabled={code.length < 6}
                className="w-full bg-gradient-to-r from-cyan-500 to-green-400 hover:opacity-90 text-black font-semibold"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verify & Sign In
              </Button>
              <button
                onClick={resend}
                disabled={resendCooldown > 0 || sending}
                className="w-full flex items-center justify-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

