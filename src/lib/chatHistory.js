const STORAGE_KEY = 'nexabot_chat_sessions';

export function getChatSessions() {
  const sessions = localStorage.getItem(STORAGE_KEY);
  return sessions ? JSON.parse(sessions) : [];
}

export function saveChatSession(session) {
  const sessions = getChatSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  
  const trimmed = sessions.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function deleteChatSession(sessionId) {
  const sessions = getChatSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

export function getChatSession(sessionId) {
  const sessions = getChatSessions();
  return sessions.find(s => s.id === sessionId);
}

export function createNewSession(title = 'New Chat') {
  return {
    id: Date.now().toString(),
    title: title,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preview: ''
  };
}

export function updateSessionMessages(sessionId, messages) {
  const sessions = getChatSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (session) {
    session.messages = messages;
    session.updatedAt = new Date().toISOString();
    const lastUserMessage = messages.find(m => m.role === 'user');
    if (lastUserMessage) {
      session.preview = lastUserMessage.content.substring(0, 50);
      if (session.title === 'New Chat' && lastUserMessage.content) {
        session.title = lastUserMessage.content.substring(0, 30);
      }
    }
    saveChatSession(session);
  }
  return session;
}
