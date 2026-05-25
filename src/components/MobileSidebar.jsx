import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageCircle, Video, Image, Brain, Shield, 
  Pencil, BarChart3, Search, Sparkles, LogOut, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MENU_ITEMS = [
  { path: '/chat', icon: MessageCircle, label: 'Chat', color: 'text-cyan-400' },
  { path: '/video-studio', icon: Video, label: 'AI Video Studio', color: 'text-purple-400' },
  { path: '/image-gen', icon: Image, label: 'Image Generation', color: 'text-pink-400' },
  { path: '/memory-bank', icon: Brain, label: 'Memory Bank', color: 'text-green-400' },
  { path: '/ai-detector', icon: Shield, label: 'AI Detector', color: 'text-red-400' },
  { path: '/image-editor', icon: Pencil, label: 'Image Editor', color: 'text-yellow-400' },
  { path: '/graphing', icon: BarChart3, label: 'Graphing Tool', color: 'text-blue-400' },
  { path: '/image-amplifier', icon: Search, label: 'Image Amplifier', color: 'text-orange-400' },
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      <div className="fixed top-0 left-0 bottom-0 w-72 bg-[#1a1a1a] z-50 shadow-xl flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white">NEXAbot.AI</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 lg:hidden">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <p className="text-sm text-white/70">Signed in as</p>
          <p className="text-sm font-medium text-white truncate">{userEmail}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                location.pathname === item.path
                  ? 'bg-white/10 border-r-2 border-cyan-400'
                  : 'hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm text-white/90">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5 text-white/50" />
            <span className="text-sm text-white/70">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
