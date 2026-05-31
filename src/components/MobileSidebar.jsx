import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageCircle, Video, Image, Brain, Shield, 
  Pencil, BarChart3, Search, Sparkles, LogOut, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

export default function MobileSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'User');
    };
    getUser();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/app';
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Drawer - FULL EXTEND (h-screen instead of bottom-0) */}
      <div className={`
        fixed top-0 left-0 h-full z-50 
        w-80 bg-gradient-to-b from-gray-900 via-gray-900 to-black
        shadow-2xl border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">NEXAbot.AI</span>
                <p className="text-xs text-gray-400">Your AI Workspace</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-5 border-b border-gray-800 bg-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Signed in as</p>
          <p className="text-sm font-medium text-white mt-1 truncate">{userEmail}</p>
        </div>

        {/* Tools Section Header */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Tools
          </p>
        </div>

        {/* Tools Grid - Row of Icons (4x2 layout) */}
        <div className="px-5">
          <div className="grid grid-cols-4 gap-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = location.pathname === tool.path;
              
              return (
                <button
                  key={tool.path}
                  onClick={() => handleNavigation(tool.path)}
                  className={`
                    flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl
                    transition-all duration-200 group
                    ${isActive 
                      ? `bg-gradient-to-br ${tool.color}/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10` 
                      : 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600'
                    }
                  `}
                >
                  <div className={`
                    relative
                    ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}
                    transition-colors duration-200
                  `}>
                    <Icon size={22} strokeWidth={1.5} />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className={`
                    text-[11px] font-medium
                    ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-300'}
                    transition-colors duration-200
                  `}>
                    {tool.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="px-5 py-4">
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              🎬 Create videos • 🎨 Generate images • 💬 Chat with AI
            </p>
          </div>
        </div>

        {/* Spacer - pushes footer to bottom */}
        <div className="flex-1" />

        {/* Footer with Sign Out - sticks to bottom */}
        <div className="p-5 border-t border-gray-800 bg-gradient-to-t from-gray-900 to-transparent">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Sign Out</span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-4">
            NEXAbot.AI v1.0 • Ready to create
          </p>
        </div>
      </div>
    </>
  );
}