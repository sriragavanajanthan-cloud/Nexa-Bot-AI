import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Github, Mail, Loader2 } from "lucide-react";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");
    setMessage("");

    const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(`✨ Magic link sent to ${email}! Check your email.`);
    }
    setAuthLoading(false);
  };

  const signInWithGoogle = async () => {
    const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl }
    });
  };

  const signInWithGithub = async () => {
    const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: redirectUrl }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    localStorage.setItem("nexabot_user_email", user.email);
    return <>{children}</>;
  }

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
            Sign in to save your chat history
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-4">
          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm block mb-1">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-[#0d0d0d] border-white/10 text-white"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {message && (
              <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold"
            >
              {authLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Magic Link
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#1a1a1a] px-2 text-white/40">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <Button
            onClick={signInWithGoogle}
            className="w-full bg-white hover:bg-gray-100 text-black font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            onClick={signInWithGithub}
            className="w-full bg-[#24292e] hover:bg-[#1b1f23] text-white font-semibold"
          >
            <Github className="w-4 h-4 mr-2" />
            Continue with GitHub
          </Button>

          <p className="text-white/30 text-xs text-center">
            No password needed — check your email for a magic link
          </p>
        </div>
      </div>
    </div>
  );
}
