// ============================================
// DIY ENGINE CONFIGURATION
// ============================================
// Change these values to match your DIY engine
const DIY_ENGINE_URL = import.meta.env.VITE_DIY_ENGINE_URL || "http://localhost:5000";
const DIY_ENGINE_ENDPOINT = import.meta.env.VITE_DIY_ENGINE_ENDPOINT || "/chat";

export const NEXABOT_SYSTEM_PROMPT = `You are NEXAbot.AI, a versatile and intelligent AI assistant.
You help users with coding, analysis, writing, research, math, and any other tasks.
You provide clear, accurate, and helpful responses formatted in markdown.
When writing code, always use proper syntax highlighting with language tags.`;

// No API key needed for DIY engine
export function getApiKey() {
  // Return null or a dummy value - DIY engine doesn't need a key
  return null;
}

export function signOut() {
  localStorage.removeItem("nexabot_user_email");
  window.location.reload();
}

// Main chat function - updated for DIY engine
export async function sendChatMessage(messages) {
  try {
    // Format messages for your DIY engine
    // Most DIY engines expect a simple prompt string
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    const prompt = lastUserMessage?.content || "";
    
    // Add system prompt context
    const fullPrompt = `${NEXABOT_SYSTEM_PROMPT}\n\nUser: ${prompt}\n\nAssistant:`;

    const response = await fetch(`${DIY_ENGINE_URL}${DIY_ENGINE_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Common formats - adjust based on your engine
        prompt: fullPrompt,
        max_tokens: 1000,
        temperature: 0.7,
        // Or if your engine uses messages format:
        // messages: [
        //   { role: "system", content: NEXABOT_SYSTEM_PROMPT },
        //   ...messages
        // ]
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
    throw new Error(`Failed to connect to DIY engine at ${DIY_ENGINE_URL}. Make sure it's running!`);
  }
}

// Updated for DIY engine - JSON mode
export async function invokeLLM({ prompt, responseJsonSchema }) {
  try {
    const response = await fetch(`${DIY_ENGINE_URL}${DIY_ENGINE_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 1000,
        temperature: 0.7,
        // If your engine supports JSON mode, add this:
        ...(responseJsonSchema ? { format: "json" } : {})
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
    throw new Error("Failed to get response from DIY engine");
  }
}

// Image generation - DIY version (if your engine supports it)
export async function generateImage({ prompt, existing_image_urls }) {
  // Option 1: If your DIY engine supports image generation
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
    console.warn("DIY image generation not available, falling back to placeholder");
  }
  
  // Option 2: Return a placeholder or use a free image API
  return { url: "https://via.placeholder.com/1024x1024?text=DIY+Engine+Image" };
}

// File upload - stays the same (local)
export async function uploadFile(file) {
  const url = URL.createObjectURL(file);
  return Promise.resolve({ file_url: url });
}
