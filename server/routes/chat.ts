import type { RequestHandler } from "express";

interface ChatMessage { role: "user" | "assistant" | "system"; content: string }

async function callOpenAI(apiKey: string, messages: ChatMessage[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", messages }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "";
  return reply as string;
}

async function callAnthropic(apiKey: string, messages: ChatMessage[]) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest", max_tokens: 800, messages: messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })) }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const reply = data.content?.[0]?.text || "";
  return reply as string;
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages = [] } = req.body as { messages: ChatMessage[] };
    const openai = process.env.OPENAI_API_KEY;
    const anthropic = process.env.ANTHROPIC_API_KEY;

    if (!openai && !anthropic) {
      return res.status(400).json({ error: "AI not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY." });
    }

    let reply = "";
    if (openai) reply = await callOpenAI(openai, messages);
    else if (anthropic) reply = await callAnthropic(anthropic, messages);

    res.json({ reply });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
};
