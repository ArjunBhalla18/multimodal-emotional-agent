# Multimodal Emotional AI Assistant – Full Architecture Specification

## 1. Project Overview

Build a full-stack multimodal conversational AI assistant with the following capabilities:

* Accept user input via:

  * Text
  * Voice (speech)
* Perform real-time:

  * Speech-to-text transcription
  * Facial emotion detection (on-device only)
* Generate emotionally-aware responses using:

  * Text input + detected emotional context
* Output:

  * Text response (chat UI)
  * Voice response (emotionally modulated)

The system must prioritize:

* Privacy (no storage of raw audio/video)
* Safety (no medical advice)
* Scalability
* Clean modular architecture

---

## 2. Core Features

### 2.1 Input System

* Text input via chat UI
* Voice input via microphone
* Webcam input for facial emotion detection (processed locally only)

---

### 2.2 Processing Pipeline

#### Step 1: Speech Processing

* Convert speech → text using Whisper (fast)

#### Step 2: Emotion Detection

* Facial emotion detection (local processing)
* Output: emotion label only (e.g., happy, sad, angry, neutral)

#### Step 3: Context Builder

Construct structured input:

```json
{
  "user_input": "...",
  "emotion": "sad",
  "chat_history": [...]
}
```

---

### 2.3 Response Generation

* Use Gemini API
* Inject system prompt:

Rules:

* Be empathetic and supportive
* Adjust tone based on emotion:

  * Sad → empathetic
  * Happy → encouraging
  * Angry → calming
* STRICTLY DO NOT:

  * Provide medical diagnosis
  * Suggest drugs/medication
* If sensitive case:

  * Suggest contacting professionals

---

### 2.4 Output System

* Display response in chat UI
* Convert response → speech using ElevenLabs
* Apply tone variation based on emotion

---

### 2.5 Chat Persistence

* Store:

  * Chat messages
  * Important extracted context
* Do NOT store:

  * Audio
  * Video
  * Raw emotion data

---

### 2.6 User System

User profile includes:

* Name
* Email
* Password (secure)
* Optional:

  * Phone number
  * Country
  * Avatar
* Preferences (max 3 interests)

---

### 2.7 Emergency Feature

* Button: “Get Help”
* Placeholder API:

  * /api/emergency-support
* Future integration:

  * Nearby healthcare providers

---

## 3. Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

### Backend

* Next.js API Routes (initial)
* Firebase (Auth)
* MongoDB (data storage)

### AI Services

* Gemini API (LLM)
* Whisper (speech-to-text)
* ElevenLabs (TTS)
* DeepFace (local emotion detection)

---

## 4. System Architecture

```
Client (Next.js Frontend)
  ├── Chat UI
  ├── Voice Recorder
  ├── Webcam Emotion Detection (local)
  ↓
API Layer (Next.js API Routes)
  ├── /api/chat
  ├── /api/tts
  ├── /api/transcribe
  ├── /api/emergency-support
  ↓
External Services
  ├── Gemini API
  ├── ElevenLabs API
  ├── Whisper
  ↓
Database
  ├── MongoDB
  ├── Firebase Auth
```

---

## 5. Folder Structure

```
/app
  /login
  /signup
  /chat
  /profile

/components
  ChatWindow.tsx
  MessageBubble.tsx
  VoiceRecorder.tsx
  EmotionCamera.tsx
  Navbar.tsx

/lib
  firebase.ts
  mongodb.ts
  gemini.ts
  elevenlabs.ts

/pages/api
  chat.ts
  tts.ts
  transcribe.ts
  emergency.ts

/services
  contextBuilder.ts
  safetyFilter.ts
```

---

## 6. API Design

### POST /api/chat

Input:

```json
{
  "message": "I feel low",
  "emotion": "sad",
  "history": []
}
```

Output:

```json
{
  "reply": "...",
  "audioUrl": "..."
}
```

---

### POST /api/transcribe

* Input: audio file
* Output: text

---

### POST /api/tts

* Input: text + emotion
* Output: audio stream

---

### GET /api/emergency-support

* Placeholder response

---

## 7. Database Schema (MongoDB)

### Users

```json
{
  "_id": "",
  "name": "",
  "email": "",
  "avatar": "",
  "preferences": [],
  "createdAt": ""
}
```

---

### Chats

```json
{
  "userId": "",
  "messages": [
    {
      "role": "user",
      "text": "",
      "emotion": ""
    },
    {
      "role": "assistant",
      "text": ""
    }
  ],
  "updatedAt": ""
}
```

---

## 8. Security & Privacy

* Use Firebase Auth (JWT based)
* Hash passwords
* HTTPS only
* Do not store:

  * audio
  * video
* Only store processed context
* Emotion processed locally

---

## 9. Safety Layer

Inject system prompt in Gemini:

* No medical advice
* No prescriptions
* Encourage professional help when needed

---

## 10. UI Requirements

* Modern chat interface (ChatGPT-like)
* Dark/light theme
* Smooth animations
* Avatar-based messages
* Voice interaction button
* Live emotion indicator (optional)

---

## 11. Deployment Plan

### Frontend + API

* Vercel

### Database

* MongoDB Atlas

### Auth

* Firebase

### AI APIs

* Gemini + ElevenLabs hosted

---

## 12. Future Enhancements

* Voice emotion detection
* Memory summarization
* Personalization engine
* Real-time streaming responses
* Therapist fine-tuned model

---

## 13. Development Phases

### Phase 1

* Chat UI + Gemini integration

### Phase 2

* Speech input + Whisper

### Phase 3

* Emotion detection

### Phase 4

* TTS (ElevenLabs)

### Phase 5

* Auth + DB

### Phase 6

* Deployment

---

## 14. Key Constraints

* Privacy-first design
* Modular architecture
* No medical advice
* Scalable structure

---

End of specification.
