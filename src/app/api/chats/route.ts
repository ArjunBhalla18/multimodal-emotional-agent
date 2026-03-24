import { NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/chats — list all chats for a user (no messages, just titles + dates)
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const chats = await db
      .collection("chats")
      .find({ userId })
      .sort({ updatedAt: -1 }) // most recent first
      .limit(20)
      .project({ title: 1, updatedAt: 1, createdAt: 1 }) // don't return messages here
      .toArray();

    return Response.json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    return Response.json({ error: "Failed to get chats" }, { status: 500 });
  }
}

// POST /api/chats — create a new chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, messages } = body;

    if (!userId || !messages) {
      return Response.json(
        { error: "userId and messages are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date();

    const result = await db.collection("chats").insertOne({
      userId,
      title: title || "New Chat",
      messages,
      createdAt: now,
      updatedAt: now,
    });

    return Response.json({ chatId: result.insertedId.toString() });
  } catch (error) {
    console.error("Create chat error:", error);
    return Response.json({ error: "Failed to create chat" }, { status: 500 });
  }
}

// PATCH /api/chats — update messages in an existing chat
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, userId, messages } = body;

    if (!chatId || !userId || !messages) {
      return Response.json(
        { error: "chatId, userId and messages are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    await db.collection("chats").updateOne(
      { _id: new ObjectId(chatId), userId }, // userId check = security
      {
        $set: {
          messages,
          updatedAt: new Date(),
        },
      }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update chat error:", error);
    return Response.json({ error: "Failed to update chat" }, { status: 500 });
  }
}