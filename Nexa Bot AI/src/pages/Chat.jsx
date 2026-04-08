// ============================================
// DIY ENGINE CONFIGURATION
// ============================================
// Change these values to match your DIY engine
const DIY_ENGINE_URL = import.meta.env.VITE_DIY_ENGINE_URL || "http://localhost:5000";
const DIY_ENGINE_CHAT_ENDPOINT = import.meta.env.VITE_DIY_ENGINE_CHAT_ENDPOINT || "/chat";
const DIY_ENGINE_GENERATE_ENDPOINT = import.meta.env.VITE_DIY_ENGINE_GENERATE_ENDPOINT || "/generate";

export const NEXABOT_SYSTEM_PROMPT = `You are NEXAbot.AI, a versatile and intelligent AI assistant.
You help users with coding, analysis, writing, research, math, and any other tasks.
You provide clear, accurate, and helpful responses formatted in markdown.
When writing code, always use proper syntax highlighting with language tags.`;

// No API key needed for DIY engine
export function getApiKey() {
  return null;
}

export function signOut() {
  localStorage.removeItem("nexabot_user_email");
  window.location.reload();
}

// Main chat function - sends message to DIY engine
export async function sendChatMessage(messages) {
  try {
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    const prompt = lastUserMessage?.content || "";
    
    // Add system prompt and conversation context
    const conversationContext = messages.slice(-10).map(m => 
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    ).join("\n");
    
    const fullPrompt = `${NEXABOT_SYSTEM_PROMPT}\n\nConversation history:\n${conversationContext}\n\nUser: ${prompt}\n\nAssistant:`;

    const response = await fetch(`${DIY_ENGINE_URL}${DIY_ENGINE_CHAT_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: fullPrompt,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DIY Engine error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Try different response formats (adjust based on your engine)
    return data.response || data.text || data.output || data.content || data.message || "";
    
  } catch (error) {
    console.error("DIY Engine connection failed:", error);
    throw new Error(`Cannot connect to DIY engine at ${DIY_ENGINE_URL}. Make sure it's running!`);
  }
}

// For generating titles and other LLM calls
export async function invokeLLM({ prompt, responseJsonSchema }) {
  try {
    const response = await fetch(`${DIY_ENGINE_URL}${DIY_ENGINE_GENERATE_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.5,
      })
    });

    if (!response.ok) {
      throw new Error(`DIY Engine error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.response || data.text || data.output || data.content || "";
    
    return responseJsonSchema ? JSON.parse(content) : content;
    
  } catch (error) {
    console.error("DIY Engine invokeLLM failed:", error);
    // Fallback: return a simple title based on prompt
    if (prompt.includes("title")) {
      return "New Chat";
    }
    throw new Error("Failed to get response from DIY engine");
  }
}

// Image generation (if your engine supports it)
export async function generateImage({ prompt, existing_image_urls }) {
  try {
    const response = await fetch(`${DIY_ENGINE_URL}/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    
    if (response.ok) {
      const data = await response.json();
      return { url: data.url || data.image_url };
    }
  } catch (error) {
    console.warn("DIY image generation not available");
  }
  
  // Return placeholder
  return { url: "https://via.placeholder.com/1024x1024?text=DIY+Engine" };
}

// File upload (local)
export async function uploadFile(file) {
  const url = URL.createObjectURL(file);
  return Promise.resolve({ file_url: url });
}
