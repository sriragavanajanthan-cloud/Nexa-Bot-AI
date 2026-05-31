import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Sparkles, User, Settings as SettingsIcon, 
  Database, Info, Save, LogOut, CheckCircle, Trash2, 
  Moon, Bell, Download, Upload, Github, Mail
} from 'lucide-react';
import Logo from '../components/Logo';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [videoQuality, setVideoQuality] = useState('standard');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User');
        setEmail(user?.email || '');
        setDarkMode(localStorage.getItem('darkMode') !== 'false');
        setNotifications(localStorage.getItem('notifications') !== 'false');
        setAutoSave(localStorage.getItem('autoSave') !== 'false');
        setVideoQuality(localStorage.getItem('videoQuality') || 'standard');
      }
    };
    getUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('darkMode', String(darkMode));
      localStorage.setItem('notifications', String(notifications));
      localStorage.setItem('autoSave', String(autoSave));
      localStorage.setItem('videoQuality', videoQuality);
      
      if (user && fullName !== user.user_metadata?.full_name) {
        await supabase.auth.updateUser({ data: { full_name: fullName } });
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      user: { email, name: fullName },
      settings: { darkMode, notifications, autoSave, videoQuality },
      chatHistory: JSON.parse(localStorage.getItem('nexabot_chat_sessions') || '[]'),
      memories: JSON.parse(localStorage.getItem('nexabot_memories') || '[]'),
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexabot_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.chatHistory) {
          localStorage.setItem('nexabot_chat_sessions', JSON.stringify(data.chatHistory));
        }
        if (data.memories) {
          localStorage.setItem('nexabot_memories', JSON.stringify(data.memories));
        }
        alert('Data imported successfully!');
        window.location.reload();
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure? This will delete all your chat history and memories.')) {
      localStorage.removeItem('nexabot_chat_sessions');
      localStorage.removeItem('nexabot_memories');
      alert('All data cleared');
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#111111]">
      <div className="sticky top-0 z-10 bg-[#111111]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <Logo className="w-8 h-8" />
          <h1 className="text-lg font-semibold text-white">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-20">
        {saved && (
          <div className="mb-4 bg-green-500/20 border border-green-500/30 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">Settings saved!</span>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 border border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {fullName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-white font-semibold text-xl bg-transparent border-b border-gray-700 focus:border-cyan-500 outline-none px-2 py-1 w-full"
                />
                <p className="text-sm text-gray-400 mt-2">{email}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/10">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Dark Mode</p>
                  <p className="text-xs text-gray-500">Dark theme for the app</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-cyan-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Notifications</p>
                  <p className="text-xs text-gray-500">Receive updates</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-cyan-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="p-4">
                <label className="text-white text-sm block mb-2">Video Quality</label>
                <select
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                >
                  <option value="draft">Draft (Fast)</option>
                  <option value="standard">Standard (Recommended)</option>
                  <option value="hd">HD (Good)</option>
                  <option value="cinematic">Cinematic (Best)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/10">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Export Data</p>
                    <p className="text-xs text-gray-500">Export your chats and memories</p>
                  </div>
                  <button onClick={exportData} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">
                    <Download className="w-4 h-4 inline mr-1" /> Export
                  </button>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Import Data</p>
                    <p className="text-xs text-gray-500">Import previously exported data</p>
                  </div>
                  <label className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm cursor-pointer">
                    <Upload className="w-4 h-4 inline mr-1" /> Import
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-red-500/5 rounded-xl border border-red-500/20 overflow-hidden">
              <div className="p-4 border-b border-red-500/20">
                <h3 className="text-red-400 font-medium">Danger Zone</h3>
              </div>
              <div className="p-4">
                <button onClick={clearAllData} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30">
                  <Trash2 className="w-4 h-4 text-red-400" /> Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <Logo className="w-20 h-20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">NEXAbot.AI</h2>
            <p className="text-gray-400 mt-1">Version 2.0.0</p>
            <p className="text-sm text-gray-500 mt-4">Your AI workspace for chat, video, and images.</p>
            <div className="mt-6 pt-4 border-t border-white/10">
              <a href="https://github.com/sriragavanajanthan-cloud/Nexa-Bot-AI" target="_blank" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white">
                <Github className="w-4 h-4" /> GitHub
              </a>
              <p className="text-xs text-gray-600 mt-4">© 2026 NEXAbot.AI</p>
            </div>
          </div>
        )}

        {(activeTab === 'profile' || activeTab === 'preferences') && (
          <button onClick={handleSave} disabled={loading} className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 font-medium text-black">
            {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Settings</>}
          </button>
        )}

        <button onClick={handleSignOut} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
