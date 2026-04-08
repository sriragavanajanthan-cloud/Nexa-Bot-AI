import React, { createContext, useState, useContext, useEffect } from 'react';
import { sendChatMessage } from '../lib/api'; // This now points to your DIY engine

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load messages from localStorage
  useEffect(() => {
    const userEmail = localStorage.getItem('nexabot_user_email');
    if (userEmail) {
      const saved = localStorage.getItem(`nexabot_chat_${userEmail}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load messages:', e);
        }
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    const userEmail = localStorage.getItem('nexabot_user_email');
    if (userEmail && messages.length > 0) {
      localStorage.setItem(`nexabot_chat_${userEmail}`, JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = async (content) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for API (last 20 for context)
      const recentMessages = [...messages, userMessage].slice(-20);
      
      // Call your DIY engine
      const response = await sendChatMessage(recentMessages);
      
      // Add assistant message
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get response from DIY engine');
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Error: ${err.message || 'Cannot connect to DIY engine. Make sure it\'s running on port 5000!'}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all chat history?')) {
      setMessages([]);
      const userEmail = localStorage.getItem('nexabot_user_email');
      if (userEmail) {
        localStorage.removeItem(`nexabot_chat_${userEmail}`);
      }
    }
  };

  return (
    <ChatContext.Provider value={{ messages, isLoading, error, sendMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
