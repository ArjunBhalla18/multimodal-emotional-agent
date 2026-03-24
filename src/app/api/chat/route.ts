import { NextRequest } from "next/server";
import { generateChatResponse } from "@/lib/gemini";
import { buildContext, contextToGeminiHistory } from "@/services/contextBuilder";
import { filterResponse } from "@/services/safetyFilter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, emotion = "neutral", history = [] } = body;

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const context = buildContext(message, emotion, history);
    const geminiHistory = contextToGeminiHistory(context);

    const rawReply = await generateChatResponse(
      context.user_input,
      context.emotion,
      geminiHistory
    );

    const reply = filterResponse(rawReply);

    return Response.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
