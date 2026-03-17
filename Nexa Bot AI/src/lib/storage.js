function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── Conversations ────────────────────────────────────────────────────────────

export function getConversations() {
  return JSON.parse(localStorage.getItem("nexabot_conversations") || "[]");
}

function saveConversations(convs) {
  localStorage.setItem("nexabot_conversations", JSON.stringify(convs));
}

export function createConversation(name = "New Chat") {
  const conv = { id: generateId(), metadata: { name }, messages: [], created_date: new Date().toISOString() };
  const convs = getConversations();
  convs.unshift(conv);
  saveConversations(convs);
  return conv;
}

export function getConversation(id) {
  return getConversations().find(c => c.id === id) || null;
}

export function updateConversation(id, updates) {
  const convs = getConversations().map(c => c.id === id ? { ...c, ...updates } : c);
  saveConversations(convs);
}

export function deleteConversation(id) {
  saveConversations(getConversations().filter(c => c.id !== id));
}

export function addMessageToConversation(id, message) {
  const convs = getConversations();
  const conv = convs.find(c => c.id === id);
  if (!conv) return;
  conv.messages = [...(conv.messages || []), message];
  saveConversations(convs);
}

// ─── Memories ─────────────────────────────────────────────────────────────────

export function getMemories() {
  return JSON.parse(localStorage.getItem("nexabot_memories") || "[]");
}

export function createMemory(data) {
  const memory = { id: generateId(), ...data, created_date: new Date().toISOString() };
  const memories = getMemories();
  memories.unshift(memory);
  localStorage.setItem("nexabot_memories", JSON.stringify(memories));
  return memory;
}

export function deleteMemory(id) {
  localStorage.setItem("nexabot_memories", JSON.stringify(getMemories().filter(m => m.id !== id)));
}
