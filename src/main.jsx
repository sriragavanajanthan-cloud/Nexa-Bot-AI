import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from '@/App.jsx'
import MobileLayout from '@/components/MobileLayout'
import Chat from '@/pages/Chat'
import VideoStudio from '@/pages/tools/VideoStudio'
import ImageGen from '@/pages/tools/ImageGen'
import MemoryBankPage from '@/pages/tools/MemoryBank'
import AIDetectorPage from '@/pages/tools/AIDetector'
import ImageEditorPage from '@/pages/tools/ImageEditor'
import GraphingToolPage from '@/pages/tools/GraphingTool'
import ImageAmplifierPage from '@/pages/tools/ImageAmplifier'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
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
)
