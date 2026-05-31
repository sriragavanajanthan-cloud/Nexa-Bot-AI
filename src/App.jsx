import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthGate from './components/AuthGate';
import MobileLayout from './components/MobileLayout';
import Chat from './pages/Chat';
import VideoStudio from './pages/tools/VideoStudio';
import ImageGen from './pages/tools/ImageGen';
import MemoryBank from './pages/tools/MemoryBank';
import AIDetector from './pages/tools/AIDetector';
import ImageEditor from './pages/tools/ImageEditor';
import GraphingTool from './pages/tools/GraphingTool';
import ImageAmplifier from './pages/tools/ImageAmplifier';
import Settings from './pages/Settings';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const session = localStorage.getItem('supabaseSession');
  const user = sessionStorage.getItem('user');
  
  if (!session && !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <MobileLayout>
      <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:sessionId" element={<Chat />} />
        <Route path="/chat/:sessionId" element={<Chat />} />
        <Route path="/video-studio" element={<VideoStudio />} />
        <Route path="/image-gen" element={<ImageGen />} />
        <Route path="/memory-bank" element={<MemoryBank />} />
        <Route path="/ai-detector" element={<AIDetector />} />
        <Route path="/image-editor" element={<ImageEditor />} />
        <Route path="/graphing" element={<GraphingTool />} />
        <Route path="/image-amplifier" element={<ImageAmplifier />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to="/chat" replace />} />
      </Routes>
    </MobileLayout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* /login shows AuthGate directly */}
        <Route path="/login" element={<AuthGate />} />
        
        {/* Protected routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppRoutes />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
