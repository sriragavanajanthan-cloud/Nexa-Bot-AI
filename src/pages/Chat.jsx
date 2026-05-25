import { useState, useEffect, useRef } from "react";
import { sendChatMessage, invokeLLM } from "@/lib/api";
import * as storage from "@/lib/storage";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import AuthGate from "@/components/AuthGate";
import { Sparkles, Zap, Code, BookOpen } from "lucide-react";

const SUGGESTED_PROMPTS = [
  { icon: Sparkles, text: "What can you help me with?" },
  { icon: Code, text: "Write code for a video generator" },
  { icon: BookOpen, text: "Explain AI video processing" },
  { icon: Zap, text: "Generate a cinematic video script" },
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const savedMessages = storage.getMessages();
    if (savedMessages.length > 0) setMessages(savedMessages);
    scrollToBottom();
  }, []);

  useEffect(() => {
    storage.saveMessages(messages);
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const response = await sendChatMessage(updatedMessages);
      const assistantMessage = { role: "assistant", content: response.response || response };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = { role: "assistant", content: "Sorry, I encountered an error. Please try again." };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    storage.clearMessages();
  };

  return (
    <AuthGate>
      <div className="flex flex-col h-full">
        {/* Welcome screen or messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to NEXAbot.AI</h2>
              <p className="text-white/50 mb-8 max-w-md">Your personal AI workspace – chat, create, detect, edit, and generate videos, images, and data visualizations.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt.text)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <prompt.icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => <MessageBubble key={idx} message={msg} />)
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl px-4 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </AuthGate>
  );
}
