const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

function getVoiceSettingsForEmotion(emotion: string): VoiceSettings {
  const settings: Record<string, VoiceSettings> = {
    happy: {
      stability: 0.4,
      similarity_boost: 0.75,
      style: 0.8,
      use_speaker_boost: true,
    },
    sad: {
      stability: 0.8,
      similarity_boost: 0.9,
      style: 0.3,
      use_speaker_boost: false,
    },
    angry: {
      stability: 0.6,
      similarity_boost: 0.85,
      style: 0.5,
      use_speaker_boost: true,
    },
    neutral: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true,
    },
    fearful: {
      stability: 0.7,
      similarity_boost: 0.8,
      style: 0.4,
      use_speaker_boost: false,
    },
    surprised: {
      stability: 0.35,
      similarity_boost: 0.7,
      style: 0.7,
      use_speaker_boost: true,
    },
  };

  return settings[emotion] || settings.neutral;
}

export async function synthesizeSpeech(
  text: string,
  emotion: string = "neutral"
): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    throw new Error("ElevenLabs API key or Voice ID not configured");
  }

  const voiceSettings = getVoiceSettingsForEmotion(emotion);

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: voiceSettings,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  return response.arrayBuffer();
}
