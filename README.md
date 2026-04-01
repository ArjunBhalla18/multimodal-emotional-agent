# SerenaAI — Emotionally-Aware AI Companion

A full-stack multimodal conversational AI assistant built with Next.js 16, featuring text/voice input, facial emotion detection, and emotionally-aware responses.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion
- **Auth**: Firebase Authentication
- **Database**: MongoDB Atlas
- **AI**: Gemini API (LLM), WebSpeech (Speech Recognition), ElevenLabs (TTS)
- **Emotion Detection**: Client-side webcam (stub — ready for DeepFace/face-api.js)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required keys:
| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | [Firebase Console](https://console.firebase.google.com) → Project Settings |
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Connection String |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `ELEVENLABS_API_KEY` | [ElevenLabs](https://elevenlabs.io) → Profile → API Key |
| `ELEVENLABS_VOICE_ID` | ElevenLabs → Voices → Select a voice → Copy ID |

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Gemini chat endpoint
│   │   ├── transcribe/route.ts    # Whisper STT endpoint
│   │   ├── tts/route.ts           # ElevenLabs TTS endpoint
│   │   └── emergency-support/route.ts
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── chat/page.tsx
│   ├── profile/page.tsx
│   ├── layout.tsx
│   └── page.tsx                   # Landing page
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── ChatWindow.tsx
│   ├── MessageBubble.tsx
│   ├── VoiceRecorder.tsx
│   ├── EmotionCamera.tsx
│   └── Navbar.tsx
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── firebase.ts
│   ├── mongodb.ts
│   ├── gemini.ts
│   └── elevenlabs.ts
└── services/
    ├── contextBuilder.ts
    └── safetyFilter.ts
```

## Safety

- No medical advice or prescriptions
- On-device emotion processing only (no video/audio stored)
- Crisis resources via "Get Help" button
