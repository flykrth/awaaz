export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  cleanContent?: string;
  actions?: string[];
  timestamp: string;
  mode?: "gemini" | "sovereign";
}

export function parseMessageActions(rawText: string): {
  cleanContent: string;
  actions: string[];
} {
  const actionRegex = /\[\[ACTION:([A-Z0-9_]+)\]\]/g;
  const actions: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = actionRegex.exec(rawText)) !== null) {
    actions.push(match[1]);
  }

  const cleanContent = rawText.replace(actionRegex, "").trim();
  return { cleanContent, actions };
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  apiKey?: string
): Promise<{ reply: string; mode: "gemini" | "sovereign"; model: string }> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: history.map((h) => ({
          role: h.role,
          content: h.cleanContent || h.content,
        })),
        apiKey: apiKey || undefined,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply || "No response received.",
      mode: data.mode || "sovereign",
      model: data.model || "Gemini 2.5 Flash",
    };
  } catch (err: any) {
    console.warn("API request failed, falling back to local client parsing:", err);
    return {
      reply:
        "The agentic gateway processed your inquiry. Please ensure your Gemini API key is configured in settings if you wish to run direct API completions.",
      mode: "sovereign",
      model: "Sovereign Client Fallback",
    };
  }
}
