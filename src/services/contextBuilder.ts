export interface ChatContext {
  user_input: string;
  emotion: string;
  chat_history: { role: string; text: string; emotion?: string }[];
}

export function buildContext(
  userInput: string,
  emotion: string,
  chatHistory: { role: string; text: string; emotion?: string }[] = []
): ChatContext {
  return {
    user_input: userInput,
    emotion: emotion || "neutral",
    chat_history: chatHistory.map((msg) => ({
      role: msg.role,
      text: msg.text,
      ...(msg.emotion ? { emotion: msg.emotion } : {}),
    })),
  };
}

export function contextToGeminiHistory(
  context: ChatContext
): { role: "user" | "model"; parts: { text: string }[] }[] {
  return context.chat_history.map((msg) => ({
    role: msg.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: msg.text }],
  }));
}
