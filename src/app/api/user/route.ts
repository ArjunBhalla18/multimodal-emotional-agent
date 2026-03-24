import { NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { randomBytes, scryptSync } from "crypto";

interface UserDoc {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  mobile?: string;
  preferences?: string[];
  authProvider?: string;
  passwordHash?: string;
  passwordLastUpdatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function sanitizePreferences(preferences: unknown): string[] {
  if (!Array.isArray(preferences)) return [];
  return preferences
    .filter((item): item is string => typeof item === "string")
    .slice(0, 3);
}

// GET /api/user — fetch user profile from MongoDB
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const users = db.collection<UserDoc>("users");
    const user = await users.findOne(
      { _id: userId },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json({ error: "Failed to get user" }, { status: 500 });
  }
}

// POST /api/user — create or update user in MongoDB
// Called automatically on signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, avatar, country, mobile, preferences, password } =
      body;

    if (!userId || !name || !email) {
      return Response.json(
        { error: "userId, name and email are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // upsert = update if exists, insert if not
    const updateSet: Record<string, unknown> = {
      name,
      email,
      authProvider: "firebase",
      updatedAt: new Date(),
      ...(avatar ? { avatar } : {}),
      ...(country ? { country } : {}),
      ...(mobile ? { mobile } : {}),
    };

    const safePreferences = sanitizePreferences(preferences);
    if (safePreferences.length > 0) {
      updateSet.preferences = safePreferences;
    }

    if (typeof password === "string" && password.length >= 6) {
      updateSet.passwordHash = hashPassword(password);
      updateSet.passwordLastUpdatedAt = new Date();
    }

    const users = db.collection<UserDoc>("users");
    await users.updateOne(
      { _id: userId },
      {
        $setOnInsert: { createdAt: new Date() }, // only set on first insert
        $set: updateSet,
      },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Save user error:", error);
    return Response.json({ error: "Failed to save user" }, { status: 500 });
  }
}

// PATCH /api/user — update profile fields for the currently logged-in user
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatar, country, mobile, preferences } = body;

    const updateSet: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof name === "string" && name.trim()) {
      updateSet.name = name.trim();
    }
    if (typeof avatar === "string" && avatar.trim()) {
      updateSet.avatar = avatar.trim();
    }
    if (typeof country === "string") {
      updateSet.country = country.trim();
    }
    if (typeof mobile === "string") {
      updateSet.mobile = mobile.trim();
    }
    if (preferences !== undefined) {
      updateSet.preferences = sanitizePreferences(preferences);
    }

    const db = await getDatabase();
    const users = db.collection<UserDoc>("users");
    await users.updateOne(
      { _id: userId },
      {
        $set: updateSet,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}