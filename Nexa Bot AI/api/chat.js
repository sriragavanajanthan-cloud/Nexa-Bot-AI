module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI backend is not configured" });
    return;
  }

  const message = req.body?.message?.trim();
  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are NEXAbot, a concise and helpful AI assistant.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      const errorMessage = data?.error?.message || "AI provider request failed";
      const isAuthIssue = /api key|invalid_api_key|authentication/i.test(errorMessage);
      const safeError = isAuthIssue ? "AI backend authentication failed" : errorMessage;
      res.status(openAiResponse.status).json({ error: safeError });
      return;
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      res.status(502).json({ error: "No response text returned from OpenAI" });
      return;
    }

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({
      error: error?.message || "Unexpected server error while calling OpenAI",
    });
  }
};
