import { NextRequest } from "next/server";
import { generateChatResponse } from "@/lib/gemini";
import { buildContext, contextToGeminiHistory } from "@/services/contextBuilder";
import { filterResponse } from "@/services/safetyFilter";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, emotion = "neutral", history = [], userId } = body;

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // --- Step 1: Load this user's emotional context from MongoDB ---
    // This is what makes the AI "remember" past context
    let emotionalContext = "";
    if (userId) {
      try {
        const db = await getDatabase();
        const ctx = await db
          .collection("emotional_contexts")
          .findOne({ userId });
        if (ctx?.currentContext) {
          emotionalContext = ctx.currentContext;
        }
      } catch (e) {
        // Not critical — continue without context if DB fails
        console.error("Could not load emotional context:", e);
      }
    }

    // --- Step 2: Cap history to last 10 messages (saves cost + avoids context limit) ---
    const cappedHistory = history.slice(-10);

    const context = buildContext(message, emotion, cappedHistory);
    const geminiHistory = contextToGeminiHistory(context);

    // --- Step 3: Generate response (with emotional context injected) ---
    const rawReply = await generateChatResponse(
      context.user_input,
      context.emotion,
      geminiHistory,
      emotionalContext
    );

    const reply = filterResponse(rawReply);

    // --- Step 4: Save emotion + context to MongoDB (only if user is logged in) ---
    if (userId && emotion !== "neutral") {
      try {
        const db = await getDatabase();
        const existing = await db
          .collection("emotional_contexts")
          .findOne({ userId });

        const newEntry = { emotion, timestamp: new Date() };

        // Keep only last 3 emotions
        const recentEmotions = [
          newEntry,
          ...(existing?.recentEmotions || []),
        ].slice(0, 3);

        // Save a short summary of what the user was talking about
        const now = new Date();
        const newContext = `User was feeling ${emotion}: "${message.slice(0, 120)}"`;

        await db.collection("emotional_contexts").updateOne(
          { userId },
          {
            $set: {
              recentEmotions,
              currentContext: newContext,
              currentContextAt: now,
              contextUpdatedAt: now,
            },
          },
          { upsert: true } // create if doesn't exist
        );
      } catch (e) {
        console.error("Could not save emotional context:", e);
      }
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
