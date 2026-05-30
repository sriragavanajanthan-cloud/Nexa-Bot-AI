import { useState, useEffect } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; // Add useLocation
import MobileSidebar from './MobileSidebar';
import { supabase } from '@/lib/supabase';

// Define TOOLS array here (same as in MobileSidebar)
const TOOLS = [
  { path: '/chat', icon: MessageCircle, label: 'Chat', color: 'from-cyan-500 to-blue-500' },
  { path: '/video-studio', icon: Video, label: 'Video', color: 'from-purple-500 to-pink-500' },
  { path: '/image-gen', icon: Image, label: 'Image', color: 'from-pink-500 to-rose-500' },
  { path: '/memory-bank', icon: Brain, label: 'Memory', color: 'from-green-500 to-emerald-500' },
  { path: '/ai-detector', icon: Shield, label: 'Detector', color: 'from-red-500 to-orange-500' },
  { path: '/image-editor', icon: Pencil, label: 'Editor', color: 'from-yellow-500 to-amber-500' },
  { path: '/graphing', icon: BarChart3, label: 'Graphs', color: 'from-blue-500 to-indigo-500' },
  { path: '/image-amplifier', icon: Search, label: 'Amplify', color: 'from-orange-500 to-red-500' },
];

// Don't forget to import the icons!
import { 
  MessageCircle, Video, Image, Brain, Shield, 
  Pencil, BarChart3, Search 
} from 'lucide-react';

export default function MobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation(); // Add this for desktop active state
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
          <div className="w-9" />
        </header>

        {/* Sidebar Drawer */}
        <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userEmail={userEmail} onSignOut={handleSignOut} />

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

        {/* User Info */}
        <div className="p-5 border-b border-white/10 bg-white/5">
          <p className="text-xs text-white/50 uppercase tracking-wider">Signed in as</p>
          <p className="text-sm font-medium text-white mt-1 truncate">{userEmail}</p>
        </div>

        {/* Tools Section */}
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
                        ? `bg-gradient-to-r ${tool.color} text-white shadow-lg` 
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

        {/* Sign Out Button */}
        <div className="p-5 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Sign Out</span>
          </button>
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