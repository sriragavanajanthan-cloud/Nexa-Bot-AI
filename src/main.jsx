import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MobileLayout from '@/components/MobileLayout'
import App from './App'
import Chat from './pages/Chat'
import VideoStudio from './pages/tools/VideoStudio'
import ImageGen from './pages/tools/ImageGen'
import MemoryBankPage from './pages/tools/MemoryBank'
import AIDetectorPage from './pages/tools/AIDetector'
import ImageEditorPage from './pages/tools/ImageEditor'
import GraphingToolPage from './pages/tools/GraphingTool'
import ImageAmplifierPage from './pages/tools/ImageAmplifier'
import './index.css'

console.log('🚀 Loading main app...');

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter basename="/app">
        <MobileLayout>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/video-studio" element={<VideoStudio />} />
            <Route path="/image-gen" element={<ImageGen />} />
            <Route path="/memory-bank" element={<MemoryBankPage />} />
            <Route path="/ai-detector" element={<AIDetectorPage />} />
            <Route path="/image-editor" element={<ImageEditorPage />} />
            <Route path="/graphing" element={<GraphingToolPage />} />
            <Route path="/image-amplifier" element={<ImageAmplifierPage />} />
          </Routes>
        </MobileLayout>
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log('✅ App rendered with all routes');
}
