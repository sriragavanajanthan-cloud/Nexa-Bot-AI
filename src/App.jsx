import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { Routes, Route, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Chat from "./pages/Chat";
import AuthGate from './components/AuthGate';
import { ChatProvider } from './context/ChatContext';

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthGate>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </ChatProvider>
      </AuthGate>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
