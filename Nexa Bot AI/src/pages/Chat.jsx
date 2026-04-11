import { useState, useEffect, useRef } from "react";
import { sendChatMessage, invokeLLM, signOut } from "@/lib/api";
import * as storage from "@/lib/storage";
import Sidebar from "@/components/chat/Sidebar";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import AuthGate from "@/components/AuthGate";
import { Sparkles, Zap, Code, BookOpen, LogOut } from "lucide-react";

const SUGGESTED_PROMPTS = [
  { icon: Sparkles, text: "What can you help me with?" },
  { icon: Zap, text: "Write a Python script to sort a list" },
  { icon: Code, text: "Explain how neural networks work" },
  { icon: BookOpen, text: "Summarize the latest AI trends" },
];

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    setConversations(storage.getConversations());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewConversation = () => {
    const conv = storage.createConversation("New Chat");
    setConversations(storage.getConversations());
    setCurrentConvId(conv.id);
    setMessages([]);
    setMobileMenuOpen(false);
  };

  const selectConversation = (id) => {
    const conv = storage.getConversation(id);
    if (!conv) return;
    setCurrentConvId(id);
    setMessages(conv.messages || []);
    setMobileMenuOpen(false);
  };

  const deleteConversation = (id) => {
    storage.deleteConversation(id);
    setConversations(storage.getConversations());
    if (currentConvId === id) {
      setCurrentConvId(null);
      setMessages([]);
    }
  };

  const renameConversation = (id, newName) => {
    storage.updateConversation(id, { metadata: { name: newName } });
    setConversations(storage.getConversations());
  };

  const pinConversation = (id) => {
    const conv = storage.getConversation(id);
    if (conv) {
      storage.updateConversation(id, { pinned: !conv.pinned });
      setConversations(storage.getConversations());
    }
  };

  const archiveConversation = (id) => {
    const conv = storage.getConversation(id);
    if (conv) {
      storage.updateConversation(id, { archived: !conv.archived });
      setConversations(storage.getConversations());
    }
  };

  const sendMessage = async (text, fileUrls) => {
    let convId = currentConvId;

    if (!convId) {
      let title = (text || "New Chat").slice(0, 40);
      try {
        const result = await invokeLLM({
          prompt: `Create a 2-4 word title for this message: "${text}". Return ONLY the title words, no punctuation, no quotes.`,
        });
        if (result) title = result.trim().slice(0, 50);
      } catch {}
      const conv = storage.createConversation(title);
      convId = conv.id;
      setCurrentConvId(convId);
      setConversations(storage.getConversations());
    }

    const userMsg = { role: "user", content: text, file_urls: fileUrls, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    storage.addMessageToConversation(convId, userMsg);
    setIsLoading(true);

    try {
      const responseText = await sendChatMessage(updatedMessages);
      const assistantMsg = { role: "assistant", content: responseText, timestamp: new Date().toISOString() };
      setMessages([...updatedMessages, assistantMsg]);
      storage.addMessageToConversation(convId, assistantMsg);
    } catch (err) {
      const errMsg = { role: "assistant", content: `**Error:** ${err.message}`, timestamp: new Date().toISOString() };
      setMessages([...updatedMessages, errMsg]);
    }

    setIsLoading(false);
  };

  return (
    <AuthGate>
      <div className="flex h-screen bg-[#111111] text-white overflow-hidden">
      
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-1 bg-[#1a1a1a] border border-white/10 rounded-lg text-white/70"
        >
          ☰
        </button>

       {/* Sidebar - collapses completely when sidebarCollapsed is true */}
<div className={`
  fixed lg:relative inset-y-0 left-0 z-50
  transition-all duration-300 ease-in-out
  ${sidebarCollapsed 
    ? 'w-0 opacity-0 overflow-hidden' 
    : 'w-72 opacity-100'
  }
  ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
  <div className="h-full w-72">
    <Sidebar
      conversations={conversations}
      currentId={currentConvId}
      onSelect={selectConversation}
      onCreate={createNewConversation}
      onDelete={deleteConversation}
      onRename={renameConversation}
      onPin={pinConversation}
      onArchive={archiveConversation}
      collapsed={sidebarCollapsed}
      onToggle={() => setSidebarCollapsed(v => !v)}
    />
  </div>
</div>
        {/* Overlay to close sidebar */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          
          {/* Top bar - Desktop */}
          <div className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-white/10">
            <button 
              onClick={() => setSidebarCollapsed(v => !v)}
              className="text-white/50 hover:text-white/70 p-1 rounded"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-sm">NEXAbot.AI</span>
            </div>
            <button onClick={signOut} className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-xs transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>

          {/* Top bar - Mobile */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#111111] pl-14">
            <div className="flex items-center gap-2 mx-auto">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-sm">NEXAbot.AI</span>
            </div>
            <button onClick={signOut} className="text-white/30 hover:text-white/70">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Messages - Scrollable Chat List */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 px-4 py-6"
            style={{ 
              overflowY: 'auto',
              minHeight: 0,
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="max-w-5xl mx-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/926442f73_NEXAbotAI.png"
                    alt="NEXAbot.AI"
                    className="w-20 h-20 rounded-full mb-4"
                  />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-2">
                    NEXAbot.AI
                  </h1>
                  <p className="text-white/50 mb-8">Your intelligent AI assistant. How can I help you today?</p>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                    {SUGGESTED_PROMPTS.map(({ icon: Icon, text }) => (
                      <button
                        key={text}
                        onClick={() => sendMessage(text)}
                        className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left text-sm text-white/70 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center shrink-0">
                        <span className="text-black text-xs font-bold">N</span>
                      </div>
                      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </AuthGate>
  );
}
