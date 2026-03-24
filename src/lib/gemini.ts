import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt } from "@/services/safetyFilter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function generateChatResponse(
  message: string,
  emotion: string,
  history: ChatMessage[] = []
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
      temperature: 0.8,
    },
  });

  const systemPrompt = getSystemPrompt(emotion);
  const fullMessage = `${systemPrompt}\n\nUser emotion: ${emotion}\nUser message: ${message}`;

  const result = await chat.sendMessage(fullMessage);
  const response = result.response;
  return response.text();
}
