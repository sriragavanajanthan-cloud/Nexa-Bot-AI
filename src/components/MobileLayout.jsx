import { useState, useEffect } from 'react';
import { 
  Menu, Sparkles, LogOut, Settings, Plus, MessageCircle, Trash2, Clock, User,
  MessageCircle as ChatIcon, Video, Image, Brain, Shield, Pencil, BarChart3, Search
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileSidebar from './MobileSidebar';
import { supabase } from '@/lib/supabase';
import { getChatSessions, deleteChatSession } from '@/lib/chatHistory';
import Logo from './Logo';

// Tools in RAINBOW ORDER
const TOOLS = [
  { path: '/chat', label: 'Chat', icon: ChatIcon, iconColor: 'text-red-400' },
  { path: '/memory-bank', label: 'Memory Bank', icon: Brain, iconColor: 'text-orange-400' },
  { path: '/ai-detector', label: 'AI Detector', icon: Shield, iconColor: 'text-yellow-400' },
  { path: '/image-gen', label: 'Image Gen', icon: Image, iconColor: 'text-green-400' },
  { path: '/image-editor', label: 'Image Editor', icon: Pencil, iconColor: 'text-blue-400' },
  { path: '/graphing', label: 'Graphs', icon: BarChart3, iconColor: 'text-indigo-400' },
  { path: '/image-amplifier', label: 'Amplify', icon: Search, iconColor: 'text-violet-400' },
  { path: '/video-studio', label: 'Video Studio', icon: Video, iconColor: 'text-cyan-400' },
];

export default function MobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setUserEmail(user?.email || 'User');
        setUserName(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User');
        
        const avatar = user?.user_metadata?.avatar_url || 
                      user?.user_metadata?.picture || 
                      user?.identities?.[0]?.identity_data?.avatar_url ||
                      user?.identities?.[0]?.identity_data?.picture ||
                      null;
        setAvatarUrl(avatar);
      }
    };
    getUser();
    loadChatSessions();
  }, []);

  const loadChatSessions = () => {
    setChatSessions(getChatSessions());
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleSelectChat = (sessionId) => {
    navigate(`/chat/${sessionId}`);
  };

  const handleDeleteChat = (e, sessionId) => {
    e.stopPropagation();
    deleteChatSession(sessionId);
    loadChatSessions();
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

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#111111]">
        <header className="fixed top-0 left-0 right-0 z-30 bg-[#111111]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <Logo className="w-8 h-8" />
          <div className="w-10" />
        </header>
        <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="pt-16 pb-6"><div className="container mx-auto px-4">{children}</div></main>
      </div>
    );
  }

  // Desktop view with title
  return (
    <div className="min-h-screen bg-[#111111] flex">
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-[#1a1a1a] border-r border-white/10 flex flex-col overflow-y-auto">
        {/* Header with Logo and Title */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <div>
              <span className="font-bold text-white text-lg">NEXAbot.AI</span>
              <p className="text-xs text-white/40">Your AI Workspace</p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
            
            {/* Settings Button */}
            <button
              onClick={handleSettings}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tools Section with Rainbow Order Icons */}
        <div className="px-4 py-4 border-b border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-3 px-2">Tools</p>
          <div className="grid grid-cols-2 gap-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = location.pathname === tool.path || 
                               (tool.path === '/chat' && (location.pathname === '/chat' || location.pathname.startsWith('/chat/')));
              return (
                <button
                  key={tool.path}
                  onClick={() => navigate(tool.path)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' 
                      : 'bg-gray-800/50 hover:bg-gray-800'
                  }`}
                >
                  <Icon 
                    size={24} 
                    className={isActive ? 'text-cyan-400' : tool.iconColor} 
                    strokeWidth={1.5}
                  />
                  <span className={`text-xs font-medium ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>
                    {tool.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 px-4 py-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Chat History</p>
            <button 
              onClick={handleNewChat} 
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="New Chat"
            >
              <Plus size={14} className="text-gray-400" />
            </button>
          </div>

          {chatSessions.length === 0 ? (
            <div className="text-center py-8 px-2">
              <Clock size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No chat history yet</p>
              <p className="text-xs text-gray-600 mt-1">Start a new conversation!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chatSessions.map((session) => {
                const isActive = location.pathname === `/chat/${session.id}` || 
                               (location.pathname === '/chat' && chatSessions[0]?.id === session.id);
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectChat(session.id)}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-cyan-500/20 border border-cyan-500/30' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MessageCircle size={14} className={`flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate font-medium">{session.title || 'New Chat'}</p>
                        <p className="text-[10px] text-gray-500">{formatDate(session.updatedAt || session.createdAt)}</p>
                        {session.preview && (
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">{session.preview}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="p-4 pt-0 pb-5">
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

      <main className="flex-1 ml-80">
        <div className="container mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
