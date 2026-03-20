import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Chat from "./pages/Chat";
import AuthGate from './components/AuthGate';
import { ChatProvider } from './context/ChatContext';
import ChatInterface from './components/chat/ChatInterface';

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AuthGate>
          <ChatProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/Chat" replace />} />
              <Route path="/Chat" element={<Chat />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </ChatProvider>
        </AuthGate>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;