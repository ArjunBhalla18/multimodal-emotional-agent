const EMOTION_TONE_MAP: Record<string, string> = {
  sad: "Be empathetic, gentle, and supportive. Use a warm, understanding tone. Acknowledge their feelings.",
  happy: "Be encouraging, enthusiastic, and positive. Match their upbeat energy. Celebrate their mood.",
  angry: "Be calming, patient, and understanding. Use a soothing tone. Don't dismiss their frustration.",
  fearful: "Be reassuring and comforting. Provide a sense of safety. Use gentle, supportive language.",
  surprised: "Be engaged and curious. Match their sense of wonder or address their surprise with empathy.",
  disgusted: "Be understanding and non-judgmental. Acknowledge their reaction. Help them process.",
  neutral: "Be friendly, balanced, and conversational. Maintain a warm, approachable tone.",
};

const BLOCKED_KEYWORDS = [
  "prescribe",
  "medication",
  "dosage",
  "drug",
  "diagnosis",
  "mg",
  "milligram",
  "pharmaceutical",
  "prescription",
];

const DISCLAIMER =
  "\n\n⚠️ *I'm an AI assistant and not a medical professional. If you're experiencing a medical or mental health emergency, please contact a healthcare provider or emergency services immediately.*";

export function getSystemPrompt(emotion: string): string {
  const tonalGuidance =
    EMOTION_TONE_MAP[emotion] || EMOTION_TONE_MAP.neutral;

  return `You are a compassionate, emotionally-aware AI wellness companion. Your role is to provide supportive, empathetic conversation.

TONE GUIDANCE: ${tonalGuidance}

STRICT RULES:
- NEVER provide medical diagnoses or suggest specific medications/drugs
- NEVER prescribe treatments or dosages
- NEVER act as a replacement for professional medical or mental health care
- If the user seems to be in crisis or distress, gently suggest they reach out to a mental health professional or crisis helpline
- Always be respectful, non-judgmental, and supportive
- Keep responses concise but warm (2-4 paragraphs max)
- Use the user's detected emotion to guide your response tone`;
}

export function filterResponse(text: string): string {
  const lowerText = text.toLowerCase();
  const containsBlockedContent = BLOCKED_KEYWORDS.some((keyword) =>
    lowerText.includes(keyword)
  );

  if (containsBlockedContent) {
    return text + DISCLAIMER;
  }

  return text;
}
