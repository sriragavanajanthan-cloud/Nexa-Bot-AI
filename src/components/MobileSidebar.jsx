import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageCircle, Video, Image, Brain, Shield, 
  Pencil, BarChart3, Search, Sparkles, LogOut, X,
  Clock, Trash2, Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TOOLS = [
  { path: '/chat', label: 'Chat', icon: MessageCircle, iconColor: 'text-red-400' },
  { path: '/memory-bank', label: 'Memory Bank', icon: Brain, iconColor: 'text-orange-400' },
  { path: '/ai-detector', label: 'AI Detector', icon: Shield, iconColor: 'text-yellow-400' },
  { path: '/image-gen', label: 'Image Gen', icon: Image, iconColor: 'text-green-400' },
  { path: '/image-editor', label: 'Image Editor', icon: Pencil, iconColor: 'text-blue-400' },
  { path: '/graphing', label: 'Graphs', icon: BarChart3, iconColor: 'text-indigo-400' },
  { path: '/image-amplifier', label: 'Amplify', icon: Search, iconColor: 'text-violet-400' },
  { path: '/video-studio', label: 'Video Studio', icon: Video, iconColor: 'text-cyan-400' },
];

export default function MobileSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'User');
    };
    getUser();
    
    const saved = localStorage.getItem('nexabot_chat_history');
    if (saved) {
      setChatHistory(JSON.parse(saved));
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
    window.location.href = '/app';
  };

  const handleNewChat = () => {
    navigate('/chat');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar - FULL SCREEN (w-full h-full) */}
      <div className="fixed inset-0 w-full h-full bg-[#0f0f0f] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">NEXAbot.AI</span>
                <p className="text-xs text-gray-500">Your AI Workspace</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="px-5 py-3 border-b border-gray-800 bg-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Signed in as</p>
          <p className="text-sm font-medium text-white mt-1 truncate">{userEmail}</p>
        </div>

        {/* Tools Section - SINGLE ROW (horizontal scroll if needed) */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tools</p>
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex gap-2 min-w-max">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = location.pathname === tool.path;
                
                return (
                  <button
                    key={tool.path}
                    onClick={() => handleNavigation(tool.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive 
                        ? 'bg-white/10 border border-white/20' 
                        : 'bg-gray-800/50 hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} className={tool.iconColor} />
                    <span className={isActive ? 'text-white' : 'text-gray-300'}>
                      {tool.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat History Section - Takes remaining space */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Chat History</p>
            <button onClick={handleNewChat} className="p-1.5 rounded-lg hover:bg-white/10">
              <Plus size={16} className="text-gray-400" />
            </button>
          </div>

          {chatHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="text-gray-600 mx-auto mb-3" />
              <p className="text-base text-gray-500">No chat history yet</p>
              <p className="text-sm text-gray-600 mt-1">Start a new conversation!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatHistory.slice(0, 20).map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleNavigation(chat.path || '/chat')}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                >
                  <MessageCircle size={18} className="text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">{chat.title || 'New Chat'}</p>
                    <p className="text-xs text-gray-500">{new Date(chat.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Sign Out */}
        <div className="p-5 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Sign Out</span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-3">
            NEXAbot.AI v1.0
          </p>
        </div>
      </div>
    </>
  );
}