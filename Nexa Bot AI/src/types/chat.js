// Message structure
export const messageTypes = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
  };
  
  // Message format
  export const createMessage = (content, role, id = null) => ({
    id: id || Date.now().toString(),
    content,
    role,
    timestamp: new Date().toISOString(),
  });