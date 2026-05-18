import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from './lib/supabase';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { Routes, Route, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Chat from "./pages/Chat";
import AuthGate from './components/AuthGate';
import { ChatProvider } from './context/ChatContext';

function App() {
  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (url && url.includes('access_token')) {
        const fragment = url.split('#')[1];
        const params = new URLSearchParams(fragment);
        const { data, error } = await supabase.auth.setSession({
          access_token: params.get('access_token'),
          refresh_token: params.get('refresh_token')
        });
        if (error) {
          console.error('Session error:', error);
        } else {
          console.log('✅ Logged in:', data.user?.email);
        }
      }
    };
    handleDeepLink(window.location.href);
    CapacitorApp.addListener('appUrlOpen', (event) => {
      handleDeepLink(event.url);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthGate>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/Chat" replace />} />
            <Route path="/Chat" element={<Chat />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </ChatProvider>
      </AuthGate>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;