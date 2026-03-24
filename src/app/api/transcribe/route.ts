import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return Response.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Send to OpenAI Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append("file", audioFile);
    whisperFormData.append("model", "whisper-1");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: whisperFormData,
      }
    );

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json({ text: data.text });
  } catch (error) {
    console.error("Transcribe API error:", error);
    return Response.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
