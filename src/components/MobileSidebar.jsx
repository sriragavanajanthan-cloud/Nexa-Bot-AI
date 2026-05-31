import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageCircle, Video, Image, Brain, Shield, 
  Pencil, BarChart3, Search, Sparkles, LogOut, X,
  Clock, Trash2, Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Tools with colorful icons - Horizontal layout (icon + label)
const TOOLS = [
  { path: '/chat', label: 'Chat', icon: MessageCircle, iconColor: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { path: '/memory-bank', label: 'Memory Bank', icon: Brain, iconColor: 'text-green-400', bgColor: 'bg-green-500/20' },
  { path: '/ai-detector', label: 'AI Detector', icon: Shield, iconColor: 'text-red-400', bgColor: 'bg-red-500/20' },
  { path: '/image-gen', label: 'Image Gen', icon: Image, iconColor: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { path: '/image-editor', label: 'Image Editor', icon: Pencil, iconColor: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  { path: '/graphing', label: 'Graphs', icon: BarChart3, iconColor: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { path: '/image-amplifier', label: 'Amplify', icon: Search, iconColor: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  { path: '/video-studio', label: 'Video Studio', icon: Video, iconColor: 'text-purple-400', bgColor: 'bg-purple-500/20' },
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
    const savedChats = localStorage.getItem('nexabot_chat_history');
    if (savedChats) {
      const chats = JSON.parse(savedChats);
      setChatHistory(chats.slice(0, 10));
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
          className="fixed inset-0 bg-black/80 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Drawer - Full width on mobile */}
      <div className={`
        fixed top-0 left-0 h-full z-50 
        w-full md:w-96
        bg-[#0f0f0f]
        shadow-2xl
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
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
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="px-5 py-3 border-b border-gray-800 bg-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Signed in as</p>
          <p className="text-sm font-medium text-white mt-1 truncate">{userEmail}</p>
        </div>

        {/* Tools Section - HORIZONTAL ROW with labels next to icons */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            Tools
          </p>
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex gap-2 min-w-max">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = location.pathname === tool.path;
                
                return (
                  <button
                    key={tool.path}
                    onClick={() => handleNavigation(tool.path)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                      transition-all duration-200
                      ${isActive 
                        ? `${tool.bgColor} ${tool.iconColor} border border-white/20` 
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={18} className={isActive ? tool.iconColor : 'text-gray-400'} />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Chat History
              </p>
              <button
                onClick={handleNewChat}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Plus size={16} className="text-gray-400" />
              </button>
            </div>

            {chatHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No chat history yet</p>
                <p className="text-xs text-gray-600 mt-1">Start a new conversation!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleLoadChat(chat)}
                    className={`
                      group flex items-center justify-between p-3 rounded-xl cursor-pointer
                      transition-all duration-200
                      ${activeChat?.id === chat.id 
                        ? 'bg-white/10 border border-white/20' 
                        : 'hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <MessageCircle size={18} className={`flex-shrink-0 ${activeChat?.id === chat.id ? 'text-cyan-400' : 'text-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate font-medium">{chat.title || 'New Chat'}</p>
                        <p className="text-xs text-gray-500">{formatDate(chat.timestamp)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Sign Out */}
        <div className="p-5 border-t border-gray-800 bg-[#0f0f0f]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
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