import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import Sidebar from "@/components/chat/Sidebar";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import { Sparkles, Zap, Code, BookOpen } from "lucide-react";

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

  const [agentConversation, setAgentConversation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentConvId) return;
    const unsub = base44.agents.subscribeToConversation(currentConvId, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [currentConvId]);

  const loadConversations = async () => {
    const convs = await base44.agents.listConversations({ agent_name: "nexabot" });
    setConversations(convs || []);
  };

  const createNewConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: "nexabot",
      metadata: { name: "New Chat" },
    });
    setAgentConversation(conv);
    setCurrentConvId(conv.id);
    setMessages([]);
    setConversations((prev) => [conv, ...prev]);
  };

  const selectConversation = async (id) => {
    const conv = await base44.agents.getConversation(id);
    setAgentConversation(conv);
    setCurrentConvId(id);
    setMessages(conv.messages || []);
  };

  const deleteConversation = async (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConvId === id) {
      setCurrentConvId(null);
      setMessages([]);
      setAgentConversation(null);
    }
  };

  const renameConversation = async (id, newName) => {
    await base44.agents.updateConversation(id, { metadata: { name: newName } });
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, metadata: { ...c.metadata, name: newName } } : c));
  };

  const pinConversation = (id) => {
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const archiveConversation = (id) => {
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, archived: !c.archived } : c));
  };

  const sendMessage = async (text, fileUrls) => {
    let conv = agentConversation;
    const titleText = text || "Shared a file";
    if (!conv) {
      let title = titleText.slice(0, 40);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Create a 2-4 word title for this message: "${titleText}". Return ONLY the title words, no punctuation, no quotes, no explanation.`,
        });
        if (result) title = result.trim().slice(0, 50);
      } catch {}
      conv = await base44.agents.createConversation({
        agent_name: "nexabot",
        metadata: { name: title },
      });
      setAgentConversation(conv);
      setCurrentConvId(conv.id);
      setConversations((prev) => [conv, ...prev]);
    }

    const userMsg = { role: "user", content: text, file_urls: fileUrls, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    await base44.agents.addMessage(conv, { role: "user", content: text, file_urls: fileUrls });
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#111111] text-white overflow-hidden">
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
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/60 text-sm">NEXAbot.AI</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
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
  );
}