import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageCircle, Video, Image, Brain, Shield,
  Pencil, BarChart3, Search, Sparkles, LogOut, X,
  Clock, Trash2, Plus, Settings
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getChatSessions, deleteChatSession } from '@/lib/chatHistory';
import Logo from './Logo';

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
  const [chatSessions, setChatSessions] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'User');
    };
    getUser();
    loadChatSessions();
  }, []);

  const loadChatSessions = () => {
    setChatSessions(getChatSessions());
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
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
    onClose();
  };

  const handleNewChat = () => {
    navigate('/chat');
    onClose();
  };

  const handleSelectChat = (sessionId) => {
    navigate(`/chat/${sessionId}`);
    onClose();
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-40" onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-full bg-[#0f0f0f] shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><Logo className="w-10 h-10" /><div><span className="font-bold text-white text-lg">NEXAbot.AI</span><p className="text-xs text-gray-500">Your AI Workspace</p></div></div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="px-5 py-3 border-b border-gray-800 bg-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Signed in as</p>
          <p className="text-sm font-medium text-white mt-1 truncate">{userEmail}</p>
        </div>

        {/* Tools */}
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                      isActive ? 'bg-white/10 border border-white/20' : 'bg-gray-800/50 hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} className={tool.iconColor} />
                    <span className={isActive ? 'text-white' : 'text-gray-300'}>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Chat History</p>
            <button onClick={handleNewChat} className="p-1.5 rounded-lg hover:bg-white/10">
              <Plus size={16} className="text-gray-400" />
            </button>
          </div>

          {chatSessions.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="text-gray-600 mx-auto mb-3" />
              <p className="text-base text-gray-500">No chat history yet</p>
              <p className="text-sm text-gray-600 mt-1">Start a new conversation!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatSessions.map((session) => {
                const isActive = location.pathname === `/chat/${session.id}` || 
                               (location.pathname === '/chat' && chatSessions[0]?.id === session.id);
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectChat(session.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-cyan-500/20 border border-cyan-500/30' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <MessageCircle size={18} className={`flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate font-medium">{session.title || 'New Chat'}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(session.updatedAt || session.createdAt)}
                        </p>
                        {session.preview && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{session.preview}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings Button */}
        <div className="px-5 pb-3">
          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300">Settings</span>
          </button>
        </div>

        {/* Sign Out Button */}
        <div className="px-5 pb-5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Sign Out</span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-3">NEXAbot.AI v1.0</p>
        </div>
      </div>
    </>
  );
}
