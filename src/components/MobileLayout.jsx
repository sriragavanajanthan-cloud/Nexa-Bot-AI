import { useState, useEffect } from 'react';
import { 
  Menu, Sparkles, LogOut, 
  MessageCircle, Video, Image, Brain, 
  Shield, Pencil, BarChart3, Search 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileSidebar from './MobileSidebar';
import { supabase } from '@/lib/supabase';

// TOOLS array for desktop view
const TOOLS = [
  { id: "chat", path: "/chat", label: "Chat", icon: MessageCircle, iconColor: "text-red-400" },
  { id: "memory", path: "/memory-bank", label: "Memory Bank", icon: Brain, iconColor: "text-orange-400" },
  { id: "aidetect", path: "/ai-detector", label: "AI Detector", icon: Shield, iconColor: "text-yellow-400" },
  { id: "imagegen", path: "/image-gen", label: "Image Gen", icon: Image, iconColor: "text-green-400" },
  { id: "imageedit", path: "/image-editor", label: "Image Editor", icon: Pencil, iconColor: "text-blue-400" },
  { id: "graph", path: "/graphing", label: "Graphs", icon: BarChart3, iconColor: "text-indigo-400" },
  { id: "amplify", path: "/image-amplifier", label: "Amplify", icon: Search, iconColor: "text-violet-400" },
  { id: "videogen", path: "/video-studio", label: "Video Studio", icon: Video, iconColor: "text-cyan-400" },
];

export default function MobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'User');
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/app';
  };

  const openSidebar = () => {
    console.log('Opening sidebar');
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    console.log('Closing sidebar');
    setSidebarOpen(false);
  };

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#111111]">
        {/* Header with Hamburger Menu */}
        <header className="fixed top-0 left-0 right-0 z-30 bg-[#111111]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={openSidebar}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors active:bg-white/20"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm font-semibold text-white">NEXAbot.AI</span>
          </div>
          <div className="w-10" />
        </header>

        {/* Sidebar Component */}
        <MobileSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <main className="pt-16 pb-6">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-[#111111] flex">
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

        <div className="p-5 border-b border-white/10 bg-white/5">
          <p className="text-xs text-white/50 uppercase tracking-wider">Signed in as</p>
          <p className="text-sm font-medium text-white mt-1 truncate">{userEmail}</p>
        </div>

        <div className="flex-1 py-4">
          <div className="px-4">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-3 px-2">Tools</p>
            <div className="space-y-1">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = location.pathname === tool.path;
                return (
                  <button
                    key={tool.path}
                    onClick={() => navigate(tool.path)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-white/10 to-transparent border-l-2 border-white/30' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${tool.iconColor}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {tool.label}
                    </span>
                    {isActive && <span className="ml-auto text-xs text-cyan-400">●</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Sign Out</span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-4">NEXAbot.AI v1.0</p>
        </div>
      </aside>

      <main className="flex-1 ml-72">
        <div className="container mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}