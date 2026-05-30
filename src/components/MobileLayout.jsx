import { useState, useEffect } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileSidebar from './MobileSidebar';
import { supabase } from '@/lib/supabase';

export default function MobileLayout({ children }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile view: Hamburger menu opens sidebar, NO bottom tab bar
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#111111]">
        {/* Header with Hamburger Menu */}
        <header className="fixed top-0 left-0 right-0 z-30 bg-[#111111]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-sm font-semibold text-white">NEXAbot.AI</span>
          </div>
          <div className="w-9" /> {/* Spacer for alignment */}
        </header>

        {/* Sidebar Drawer */}
        <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content with padding for header */}
        <main className="pt-14 pb-6">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop view: Sidebar always visible
  return (
    <div className="min-h-screen bg-[#111111] flex">
      {/* Desktop Sidebar - Always visible */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#1a1a1a] border-r border-white/10 flex flex-col overflow-y-auto">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">NEXAbot.AI</span>
              <p className="text-xs text-white/40">Your AI Workspace</p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-4">
          {/* Tools Grid on Desktop too */}
          <div className="px-4">
            <div className="grid grid-cols-2 gap-2">
              {TOOLS.map((tool) => {
                const isActive = location.pathname === tool.path;
                return (
                  <button
                    key={tool.path}
                    onClick={() => navigate(tool.path)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? `bg-gradient-to-r ${tool.color} text-white shadow-lg` 
                        : 'bg-gray-800/50 hover:bg-gray-800 text-white/60 hover:text-white'
                    }`}
                  >
                    <tool.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <div className="container mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
