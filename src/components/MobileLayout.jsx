import { useState, useEffect } from 'react';
import { 
  Menu, Sparkles, LogOut, 
  MessageCircle, Video, Image, Brain, 
  Shield, Pencil, BarChart3, Search 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileSidebar from './MobileSidebar';
import { supabase } from '@/lib/supabase';

// TOOLS array with Lucide icons (no emojis)
const TOOLS = [
  { id: "chat", path: "/chat", label: "Chat", icon: MessageCircle },
  { id: "videogen", path: "/video-studio", label: "Video Studio", icon: Video },
  { id: "imagegen", path: "/image-gen", label: "Image Gen", icon: Image },
  { id: "memory", path: "/memory-bank", label: "Memory Bank", icon: Brain },
  { id: "aidetect", path: "/ai-detector", label: "AI Detector", icon: Shield },
  { id: "imageedit", path: "/image-editor", label: "Image Editor", icon: Pencil },
  { id: "graph", path: "/graphing", label: "Graphing", icon: BarChart3 },
  { id: "amplify", path: "/image-amplifier", label: "Amplify", icon: Search },
];

export default function MobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
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

  // Mobile view: only hamburger menu, NO bottom bar
  // In MobileLayout.jsx - Mobile view section
if (isMobile) {
  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header - keep as is */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#111111]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        {/* ... header content ... */}
      </header>

      {/* Sidebar Drawer - Full screen */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
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
      {/* Desktop Sidebar */}
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
            <div className="grid grid-cols-2 gap-2">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = location.pathname === tool.path;
                return (
                  <button
                    key={tool.path}
                    onClick={() => navigate(tool.path)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400' 
                        : 'bg-gray-800/50 hover:bg-gray-800 text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{tool.label}</span>
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
          <p className="text-xs text-gray-600 text-center mt-4">
            NEXAbot.AI v1.0
          </p>
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