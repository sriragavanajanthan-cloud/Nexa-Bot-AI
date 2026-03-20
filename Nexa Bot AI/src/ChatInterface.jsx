import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Trash2, Download, MessageSquare, LogOut } from 'lucide-react'; // Added LogOut
import { exportChatHistory, getChatStats } from '../../services/chatHistory';
import MessageBubble from './MessageBubble';

export default function ChatInterface() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update stats
  useEffect(() => {
    setStats(getChatStats());
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
    
    // Focus input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExport = () => {
    exportChatHistory();
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      clearChat();
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out? Your chat history will be saved.')) {
      localStorage.removeItem('nexabot_user_email');
      window.location.reload(); // Reload to show AuthGate
    }
  };

  const userEmail = localStorage.getItem('nexabot_user_email');

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-t-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 flex items-center justify-center">
              <span className="text-black text-xs font-bold">N</span>
            </div>
            <h1 className="text-white font-semibold">NEXAbot.AI</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white/50 text-sm truncate max-w-[200px]">
              {userEmail}
            </div>
            <button
              onClick={handleLogout}
              className="text-white/50 hover:text-red-400 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Stats */}
        {stats && stats.totalMessages > 0 && (
          <div className="flex gap-4 mt-3 text-xs text-white/40">
            <span>💬 {stats.totalMessages} messages</span>
            <span>👤 {stats.userMessages} you</span>
            <span>🤖 {stats.assistantMessages} NEXAbot</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#0d0d0d] border-x border-white/10 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-green-400/20 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-lg font-medium text-white/60">Start a conversation</p>
            <p className="text-sm mt-2">Your chat history is saved automatically to your account</p>
            <p className="text-xs mt-4 text-white/30">Try asking me anything! ✨</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-red-400 text-sm text-center p-3 bg-red-400/10 rounded-lg border border-red-400/20">
            ❌ Error: {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-b-2xl p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send)"
            disabled={isLoading}
            className="bg-[#0d0d0d] border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-cyan-500 to-green-400 hover:opacity-90 text-black font-semibold"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Action Buttons */}
        {messages.length > 0 && (
          <div className="flex justify-end gap-2 mt-3">
            <Button
              onClick={handleExport}
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white/70 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-red-400 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
            <button
               onClick={handleLogout}
               className="bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 px-3 py-1 rounded-lg text-sm transition-all flex items-center gap-2"
               title="Log out"
            >
             <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}