import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadChatHistory, saveChatHistory, clearChatHistory } from '../services/chatHistory';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('nexabot_user_email'));

  // Load chat history when component mounts OR when user changes
  useEffect(() => {
    const userEmail = localStorage.getItem('nexabot_user_email');
    if (userEmail !== currentUser) {
      setCurrentUser(userEmail);
    }
    
    const history = loadChatHistory();
    setMessages(history);
  }, [currentUser]); // Re-run when currentUser changes

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  const sendMessage = async (content) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate AI response with markdown formatting
      const demoResponse = `Here's a demo response to: **${content}**

You can:
- Use **markdown** formatting
- Add *italic text*
- Create lists
- Add \`code snippets\`

### Example:
\`\`\`javascript
// This is a code block
const greeting = "Hello from NEXAbot!";
console.log(greeting);
\`\`\`

> Pro tip: Connect to OpenAI or another LLM API for real AI responses!

---
*This is a demo response. Your chat history is saved automatically.*`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: demoResponse,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    clearChatHistory();
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      isLoading, 
      error, 
      sendMessage, 
      clearChat 
    }}>
      {children}
    </ChatContext.Provider>
  );
};