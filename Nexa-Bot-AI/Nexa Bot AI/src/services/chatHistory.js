// Chat history service for storing and retrieving messages per user email
const STORAGE_KEY = 'nexabot_chat_history';

// Get current user email from localStorage
const getCurrentUser = () => {
  return localStorage.getItem('nexabot_user_email');
};

// Load chat history for current user
export const loadChatHistory = () => {
  const userEmail = getCurrentUser();
  if (!userEmail) return [];
  
  const allHistory = localStorage.getItem(STORAGE_KEY);
  if (!allHistory) return [];
  
  const parsed = JSON.parse(allHistory);
  const userHistory = parsed[userEmail] || [];
  
  console.log(`Loading chat history for ${userEmail}:`, userHistory.length, 'messages');
  return userHistory;
};

// Save chat history for current user
export const saveChatHistory = (messages) => {
  const userEmail = getCurrentUser();
  if (!userEmail) return false;
  
  const allHistory = localStorage.getItem(STORAGE_KEY);
  const parsed = allHistory ? JSON.parse(allHistory) : {};
  
  parsed[userEmail] = messages;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  
  console.log(`Saved ${messages.length} messages for ${userEmail}`);
  return true;
};

// Add a new message to history
export const addMessage = (message) => {
  const history = loadChatHistory();
  const newHistory = [...history, message];
  saveChatHistory(newHistory);
  return newHistory;
};

// Clear chat history for current user
export const clearChatHistory = () => {
  const userEmail = getCurrentUser();
  if (!userEmail) return;
  
  const allHistory = localStorage.getItem(STORAGE_KEY);
  if (allHistory) {
    const parsed = JSON.parse(allHistory);
    delete parsed[userEmail];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  }
  
  console.log(`Cleared chat history for ${userEmail}`);
};

// Delete a specific message by ID
export const deleteMessage = (messageId) => {
  const history = loadChatHistory();
  const newHistory = history.filter(msg => msg.id !== messageId);
  saveChatHistory(newHistory);
  return newHistory;
};

// Export chat history as JSON
export const exportChatHistory = () => {
  const userEmail = getCurrentUser();
  const history = loadChatHistory();
  const dataStr = JSON.stringify({
    user: userEmail,
    exportDate: new Date().toISOString(),
    messages: history
  }, null, 2);
  
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', `nexabot_chat_${userEmail}_${Date.now()}.json`);
  linkElement.click();
};

// Get chat statistics for current user
export const getChatStats = () => {
  const history = loadChatHistory();
  const userMessages = history.filter(msg => msg.role === 'user').length;
  const assistantMessages = history.filter(msg => msg.role === 'assistant').length;
  
  return {
    totalMessages: history.length,
    userMessages,
    assistantMessages,
    lastMessage: history[history.length - 1] || null,
    firstMessage: history[0] || null,
  };
};

// Clear ALL chat history for all users (admin function)
export const clearAllHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('Cleared all chat history for all users');
};

// Get list of all users with chat history
export const getAllUsers = () => {
  const allHistory = localStorage.getItem(STORAGE_KEY);
  if (!allHistory) return [];
  const parsed = JSON.parse(allHistory);
  return Object.keys(parsed);
};