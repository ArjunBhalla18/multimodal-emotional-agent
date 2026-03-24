import { NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";

// GET /api/emotions — fetch the user's emotional context + last 3 emotions
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const context = await db
      .collection("emotional_contexts")
      .findOne({ userId });

    // Return empty defaults if nothing saved yet
    return Response.json(
      context || { recentEmotions: [], currentContext: "" }
    );
  } catch (error) {
    console.error("Get emotions error:", error);
    return Response.json({ error: "Failed to get emotions" }, { status: 500 });
  }
}

// POST /api/emotions — store timely emotion snapshots from live detection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, emotion } = body;

    if (!userId || !emotion || typeof emotion !== "string") {
      return Response.json(
        { error: "userId and emotion are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const existing = await db.collection("emotional_contexts").findOne({ userId });

    const newEntry = { emotion, timestamp: new Date() };
    const recentEmotions = [newEntry, ...(existing?.recentEmotions || [])].slice(
      0,
      3
    );

    await db.collection("emotional_contexts").updateOne(
      { userId },
      {
        $set: {
          recentEmotions,
          latestEmotion: emotion,
          latestEmotionAt: new Date(),
        },
      },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Save emotions error:", error);
    return Response.json({ error: "Failed to save emotions" }, { status: 500 });
  }
}