import { NextRequest } from "next/server";
import { synthesizeSpeech } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, emotion = "neutral" } = body;

    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const audioBuffer = await synthesizeSpeech(text, emotion);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return Response.json(
      { error: "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}
