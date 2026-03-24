import { NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/chats/[chatId] — fetch a specific chat with ALL its messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    // Validate chatId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(chatId)) {
      return Response.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    const db = await getDatabase();
    const chat = await db.collection("chats").findOne({
      _id: new ObjectId(chatId),
      userId, // security: only return if this chat belongs to the user
    });

    if (!chat) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    return Response.json(chat);
  } catch (error) {
    console.error("Get chat error:", error);
    return Response.json({ error: "Failed to get chat" }, { status: 500 });
  }
}