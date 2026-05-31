import { useState, useEffect } from 'react';
import { 
  Menu, Sparkles, LogOut, 
  MessageCircle, Video, Image, Brain, 
  Shield, Pencil, BarChart3, Search, Plus, Clock, Trash2
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
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

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
    loadChatHistory();
  }, []);

  const loadChatHistory = () => {
    const saved = localStorage.getItem('nexabot_chat_history');
    if (saved) {
      const chats = JSON.parse(saved);
      setChatHistory(chats.slice(0, 15));
      const currentPath = location.pathname;
      const active = chats.find(c => c.path === currentPath);
      setActiveChat(active || chats[0]);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/app';
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleLoadChat = (chat) => {
    if (chat.path) {
      navigate(chat.path);
      setActiveChat(chat);
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

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#111111]">
        <header className="fixed top-0 left-0 right-0 z-30 bg-[#111111]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button onClick={openSidebar} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
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

        <MobileSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main className="pt-16 pb-6">
          <div className="container mx-auto px-4">{children}</div>
        </main>
      </div>
    );
  }

  // Desktop view - WITH CHAT HISTORY IN SIDEBAR
  return (
    <div className="min-h-screen bg-[#111111] flex">
      {/* Desktop Sidebar with Chat History */}
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-[#1a1a1a] border-r border-white/10 flex flex-col overflow-y-auto">
        {/* Header */}
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
        <div className="px-4 py-4 border-b border-white/10">
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

        {/* Chat History Section - Desktop */}
        <div className="flex-1 px-4 py-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Chat History</p>
            <button onClick={handleNewChat} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <Plus size={14} className="text-gray-400" />
            </button>
          </div>

          {chatHistory.length === 0 ? (
            <div className="text-center py-8 px-2">
              <Clock size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No chat history yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleLoadChat(chat)}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeChat?.id === chat.id 
                      ? 'bg-white/10 border border-white/20' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageCircle size={14} className={`flex-shrink-0 ${activeChat?.id === chat.id ? 'text-cyan-400' : 'text-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate font-medium">{chat.title || 'New Chat'}</p>
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

        {/* Sign Out Button */}
        <div className="p-5 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Sign Out</span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-3">NEXAbot.AI v1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80">
        <div className="container mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}