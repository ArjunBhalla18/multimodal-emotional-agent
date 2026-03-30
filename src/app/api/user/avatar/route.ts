import { NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";

interface UserDoc {
  _id: string;
  avatar?: string;
  updatedAt?: Date;
}

// POST /api/user/avatar — upload avatar image as base64
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      return Response.json(
        { error: "File too large. Maximum size is 2MB" },
        { status: 400 }
      );
    }

    // Convert to base64 data URL for storage in MongoDB
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const db = await getDatabase();
    await db.collection<UserDoc>("users").updateOne(
      { _id: userId },
      {
        $set: {
          avatar: dataUrl,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return Response.json({ success: true, avatar: dataUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return Response.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
