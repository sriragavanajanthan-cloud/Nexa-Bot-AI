import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export default function AuthGate({ children }) {
  const [email, setEmail] = useState(localStorage.getItem("nexabot_user_email") || "");
  const [inputEmail, setInputEmail] = useState("");
  const [error, setError] = useState("");

  if (email) return <>{children}</>;

  const handleLogin = () => {
    const trimmed = inputEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    localStorage.setItem("nexabot_user_email", trimmed);
    setEmail(trimmed);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            Enter your email to access your personal chat history
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={inputEmail}
              onChange={(e) => { setInputEmail(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="you@example.com"
              className="bg-[#0d0d0d] border-white/10 text-white placeholder:text-white/30 focus-visible:border-cyan-500/50"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            onClick={handleLogin}
            disabled={!inputEmail}
            className="w-full bg-gradient-to-r from-cyan-500 to-green-400 hover:opacity-90 text-black font-semibold"
          >
            <Mail className="w-4 h-4 mr-2" />
            Continue
          </Button>
          <p className="text-white/30 text-xs text-center">
            Your email is used to save and restore your chat history on this device.
          </p>
        </div>
      </div>
    </div>
  );
}
