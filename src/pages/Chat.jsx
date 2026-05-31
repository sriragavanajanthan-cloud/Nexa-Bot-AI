import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { sendChatMessage } from "@/lib/api";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import { getChatSessions, saveChatSession, getChatSession, createNewSession, updateSessionMessages } from "@/lib/chatHistory";
import Logo from "@/components/Logo";

export default function Chat() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "Write a Python script to sort a list",
    "What can you help me with?",
    "Explain how neural networks work",
    "Summarize the latest AI trends",
  ];

  // Load specific chat session
  useEffect(() => {
    if (sessionId) {
      const session = getChatSession(sessionId);
      if (session) {
        setMessages(session.messages || []);
        setCurrentSessionId(sessionId);
      } else {
        handleNewChat();
      }
    } else {
      handleNewChat();
    }
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages to session
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      updateSessionMessages(currentSessionId, messages);
    }
  }, [messages, currentSessionId]);

  const handleNewChat = () => {
    const newSession = createNewSession();
    saveChatSession(newSession);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    navigate(`/chat/${newSession.id}`);
  };

  const handleSendMessage = async (content, fileUrls) => {
    if ((!content?.trim() && !fileUrls?.length) || isLoading) return;

    const userMessage = { 
      role: "user", 
      content: content || "Attached files", 
      file_urls: fileUrls,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const response = await sendChatMessage(updatedMessages);
      const assistantMessage = { 
        role: "assistant", 
        content: response.response || response,
        timestamp: new Date().toISOString()
      };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Show welcome screen when no messages
  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-[#111111]">
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto">
          
          {showWelcome ? (
            /* Welcome Screen - Centered */
            <div className="flex flex-col items-center text-center">
              {/* Logo */}
              <div className="mb-6">
                <Logo className="w-16 h-16" />
              </div>
              
              {/* Title */}
              <h1 className="text-4xl font-bold text-white mb-2">NEXAbot.AI</h1>
              
              {/* Subtitle */}
              <p className="text-gray-400 text-lg mb-12">
                Your intelligent AI assistant. How can I help you today?
              </p>
              
              {/* Suggested Prompts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(prompt)}
                    className="text-left px-5 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-700 transition-all duration-200 group"
                  >
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages View */
            <div className="py-6">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Chat Input - Fixed at bottom */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
