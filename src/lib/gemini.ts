import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt } from "@/services/safetyFilter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// Main chat response — now accepts emotionalContext from MongoDB
export async function generateChatResponse(
  message: string,
  emotion: string,
  history: ChatMessage[] = [],
  emotionalContext: string = "", // What we know about the user from past chats
  userName: string = "" // User's profile display name
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "System instructions follow." }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I will follow these instructions." }],
      },
      ...history,
    ],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.9,    // Slightly higher = more natural/varied responses
    },
  });

  const systemPrompt = getSystemPrompt(emotion);

  // Include past emotional context if available (e.g. "User was feeling sad about a bad exam")
  const contextSection = emotionalContext
    ? `\nWhat I know about this user from before: ${emotionalContext}`
    : "";

  const nameSection = userName
    ? `\nThe user's name is ${userName}. Use it naturally sometimes — don't overuse it. If they tell you a different name, use that instead.`
    : "";

  const fullMessage = `${systemPrompt}${nameSection}${contextSection}\n\nCurrent detected emotion: ${emotion}\nUser message: ${message}`;

  const result = await chat.sendMessage(fullMessage);
  return result.response.text();
}