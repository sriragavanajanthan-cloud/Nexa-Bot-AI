// src/lib/api.js

// Get configuration from environment variables
const DIY_API_URL = import.meta.env.VITE_DIY_API_URL || "http://localhost:3000/api/chat";
const DIY_API_KEY = import.meta.env.VITE_DIY_API_KEY;
const API_PROVIDER = import.meta.env.VITE_API_PROVIDER || "diy"; // "diy", "openai", etc.

export const NEXABOT_SYSTEM_PROMPT = `You are NEXAbot.AI, a versatile and intelligent AI assistant.
You help users with coding, analysis, writing, research, math, and any other tasks.
You provide clear, accurate, and helpful responses formatted in markdown.
When writing code, always use proper syntax highlighting with language tags.`;

export function getApiKey() {
  // For DIY engines, the API key might be optional
  return DIY_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
}

export function signOut() {
  localStorage.removeItem("nexabot_user_email");
  window.location.reload();
}

// Main chat function that routes to your DIY engine
export async function sendChatMessage(messages) {
  const apiUrl = DIY_API_URL;
  
  if (!apiUrl) {
    throw new Error("DIY API URL not configured. Add VITE_DIY_API_URL to your .env file");
  }

  console.log("Sending to DIY engine:", apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(DIY_API_KEY && { "Authorization": `Bearer ${DIY_API_KEY}` }),
        "X-App-Id": "nexabot-ai",
        "X-User-Email": localStorage.getItem("nexabot_user_email") || "anonymous",
      },
      body: JSON.stringify({
        // Standard format that most DIY engines understand
        messages: [
          { role: "system", content: NEXABOT_SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        // Add metadata
        metadata: {
          user_id: localStorage.getItem("nexabot_user_email"),
          timestamp: new Date().toISOString(),
          conversation_id: Date.now().toString(),
        },
        // Parameters you can adjust
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DIY Engine error response:", errorText);
      throw new Error(`DIY Engine API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Handle different response formats from DIY engines
    // Adjust this based on your engine's response structure
    if (data.response) return data.response;
    if (data.message) return data.message;
    if (data.content) return data.content;
    if (data.text) return data.text;
    if (data.output) return data.output;
    if (data.choices && data.choices[0]) {
      return data.choices[0].message?.content || data.choices[0].text;
    }
    
    // If none of the above, return the whole response as JSON string
    return JSON.stringify(data);
    
  } catch (error) {
    console.error("DIY Engine connection error:", error);
    throw new Error(`Failed to connect to DIY engine at ${apiUrl}: ${error.message}`);
  }
}

// For generating titles and other simple prompts
export async function invokeLLM({ prompt, responseJsonSchema }) {
  const apiUrl = DIY_API_URL;
  
  if (!apiUrl) {
    throw new Error("DIY API URL not configured");
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(DIY_API_KEY && { "Authorization": `Bearer ${DIY_API_KEY}` }),
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 100,
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    let content = data.response || data.message || data.content || data.text;
    
    if (responseJsonSchema && content) {
      try {
        return JSON.parse(content);
      } catch (e) {
        return content;
      }
    }
    
    return content;
    
  } catch (error) {
    console.error("invokeLLM error:", error);
    return "New Chat"; // Fallback title
  }
}

// Image generation (if your DIY engine supports it)
export async function generateImage({ prompt, existing_image_urls }) {
  const imageApiUrl = import.meta.env.VITE_DIY_IMAGE_API_URL || DIY_API_URL;
  
  try {
    const response = await fetch(`${imageApiUrl}/images`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(DIY_API_KEY && { "Authorization": `Bearer ${DIY_API_KEY}` }),
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024",
      })
    });

    if (!response.ok) {
      throw new Error("Image generation failed");
    }

    const data = await response.json();
    return { url: data.url || data.image_url || data.data?.[0]?.url };
    
  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error("Image generation not available in DIY engine");
  }
}

// File upload handler
export async function uploadFile(file) {
  // If your DIY engine supports file uploads
  const uploadUrl = import.meta.env.VITE_DIY_UPLOAD_URL;
  
  if (uploadUrl) {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        ...(DIY_API_KEY && { "Authorization": `Bearer ${DIY_API_KEY}` }),
      },
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      return { file_url: data.url || data.file_url };
    }
  }
  
  // Fallback to local URL
  const url = URL.createObjectURL(file);
  return { file_url: url };
}
