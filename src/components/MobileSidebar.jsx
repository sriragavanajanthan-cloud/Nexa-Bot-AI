import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageCircle, Video, Image, Brain, Shield, 
  Pencil, BarChart3, Search, Sparkles, LogOut, X,
  Clock, Trash2, Plus
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
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'User');
    };
    getUser();
    loadChatHistory();
  }, []);

  const loadChatHistory = () => {
    // Load from localStorage
    const savedChats = localStorage.getItem('nexabot_chat_history');
    if (savedChats) {
      const chats = JSON.parse(savedChats);
      setChatHistory(chats.slice(0, 10)); // Show last 10 chats
      if (chats.length > 0) {
        const currentPath = location.pathname;
        const active = chats.find(c => c.path === currentPath);
        setActiveChat(active || chats[0]);
      }
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleNewChat = () => {
    navigate('/chat');
    onClose();
  };

  const handleLoadChat = (chat) => {
    if (chat.path) {
      navigate(chat.path);
      setActiveChat(chat);
      onClose();
    }
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    const updated = chatHistory.filter(c => c.id !== chatId);
    setChatHistory(updated);
    localStorage.setItem('nexabot_chat_history', JSON.stringify(updated));
    if (activeChat?.id === chatId) {
      setActiveChat(updated[0] || null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/app';
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
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
      
      {/* Sidebar Drawer - Full height */}
      <div className={`
        fixed top-0 left-0 h-full z-50 
        w-80 bg-gradient-to-b from-gray-900 via-gray-900 to-black
        shadow-2xl border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">NEXAbot.AI</span>
                <p className="text-[10px] text-gray-400">Your AI Workspace</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* User Info - Compact */}
        <div className="px-4 py-2 border-b border-gray-800 bg-white/5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Signed in as</p>
          <p className="text-xs font-medium text-white mt-0.5 truncate">{userEmail}</p>
        </div>

        {/* Tools Section - Horizontal Scrollable Row (8 tools in 1 row) */}
        <div className="px-4 pt-4 pb-2 border-b border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
            Tools
          </p>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = location.pathname === tool.path;
                
                return (
                  <button
                    key={tool.path}
                    onClick={() => handleNavigation(tool.path)}
                    className={`
                      flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg
                      transition-all duration-200 flex-shrink-0
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
                      <Icon size={18} strokeWidth={1.5} />
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                      )}
                    </div>
                    <span className={`
                      text-[9px] font-medium whitespace-nowrap
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
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                Chat History
              </p>
              <button
                onClick={handleNewChat}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Plus size={14} className="text-gray-400" />
              </button>
            </div>

            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No chat history yet</p>
                <p className="text-[10px] text-gray-600 mt-1">Start a new conversation!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleLoadChat(chat)}
                    className={`
                      group flex items-center justify-between p-2 rounded-lg cursor-pointer
                      transition-all duration-200
                      ${activeChat?.id === chat.id 
                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20' 
                        : 'hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MessageCircle size={14} className={`flex-shrink-0 ${activeChat?.id === chat.id ? 'text-cyan-400' : 'text-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{chat.title || 'New Chat'}</p>
                        <p className="text-[10px] text-gray-500">{formatDate(chat.timestamp)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-gray-800 bg-gradient-to-t from-gray-900 to-transparent">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-400 font-medium">Sign Out</span>
          </button>
          <p className="text-[10px] text-gray-600 text-center mt-2">
            NEXAbot.AI v1.0
          </p>
        </div>
      </div>
    </>
  );
}