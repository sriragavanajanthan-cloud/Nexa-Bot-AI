import { base44 } from "@/api/base44Client";

export const NEXABOT_SYSTEM_PROMPT = `You are NEXAbot.AI, a versatile and intelligent AI assistant.
You help users with coding, analysis, writing, research, math, and any other tasks.
You provide clear, accurate, and helpful responses formatted in markdown.
When writing code, always use proper syntax highlighting with language tags.`;

export async function sendChatMessage(messages) {
  const history = messages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `${NEXABOT_SYSTEM_PROMPT}\n\nConversation:\n${history}\n\nRespond as the Assistant:`,
  });
  return result;
}

export async function invokeLLM({ prompt, responseJsonSchema }) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: responseJsonSchema || undefined,
  });
  return result;
}

export async function generateImage({ prompt, existing_image_urls }) {
  const result = await base44.integrations.Core.GenerateImage({
    prompt,
    existing_image_urls: existing_image_urls || undefined,
  });
  return { url: result.url };
}

export async function uploadFile(file) {
  const result = await base44.integrations.Core.UploadFile({ file });
  return { file_url: result.file_url };
}
