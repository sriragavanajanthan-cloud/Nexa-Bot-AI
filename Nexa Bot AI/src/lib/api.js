const OPENAI_API_URL = "https://api.openai.com/v1";

export const NEXABOT_SYSTEM_PROMPT = `You are NEXAbot.AI, a versatile and intelligent AI assistant.
You help users with coding, analysis, writing, research, math, and any other tasks.
You provide clear, accurate, and helpful responses formatted in markdown.
When writing code, always use proper syntax highlighting with language tags.`;

export function getApiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY || "";
}

export async function sendChatMessage(messages) {
  const key = getApiKey();
  if (!key) throw new Error("No API key set");

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: NEXABOT_SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "API request failed");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function invokeLLM({ prompt, responseJsonSchema }) {
  const key = getApiKey();
  if (!key) throw new Error("No API key set");

  const body = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    ...(responseJsonSchema ? { response_format: { type: "json_object" } } : {})
  };

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "API request failed");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  return responseJsonSchema ? JSON.parse(content) : content;
}

export async function generateImage({ prompt }) {
  const key = getApiKey();
  if (!key) throw new Error("No API key set");

  const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024" })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Image generation failed");
  }

  const data = await response.json();
  return { url: data.data?.[0]?.url };
}

export function uploadFile(file) {
  const url = URL.createObjectURL(file);
  return Promise.resolve({ file_url: url });
}
