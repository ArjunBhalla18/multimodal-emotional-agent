"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "@/components/MessageBubble";
import VoiceRecorder from "@/components/VoiceRecorder";
import EmotionCamera from "@/components/EmotionCamera";
import { SerenaMark } from "@/components/SerenaMark";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  emotion?: string;
  timestamp: Date;
}

export default function ChatWindow() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emotion, setEmotion] = useState("neutral");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(true); // loading previous chat

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Load most recent chat on mount ───────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) {
      setChatLoading(false);
      return;
    }

    const loadRecentChat = async () => {
      try {
        // Get list of chats (most recent first)
        const res = await fetch("/api/chats", {
          headers: { "x-user-id": user.uid },
        });

        if (!res.ok) {
          setChatLoading(false);
          return;
        }

        const chats = await res.json();

        if (chats.length > 0) {
          // Load the most recent chat's full messages
          const chatRes = await fetch(`/api/chats/${chats[0]._id}`, {
            headers: { "x-user-id": user.uid },
          });

          if (chatRes.ok) {
            const chat = await chatRes.json();
            // Convert timestamp strings back to Date objects
            const loadedMessages: Message[] = chat.messages.map(
              (m: Omit<Message, "timestamp"> & { timestamp: string }) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              })
            );
            setMessages(loadedMessages);
            setCurrentChatId(chats[0]._id.toString());
          }
        }
      } catch (e) {
        console.error("Failed to load recent chat:", e);
      } finally {
        setChatLoading(false);
      }
    };

    loadRecentChat();
  }, [user?.uid]);

  // ─── Auto-save chat to MongoDB 2 seconds after last message ───────────────
  useEffect(() => {
    if (!user?.uid || messages.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        if (currentChatId) {
          // Update existing chat
          await fetch("/api/chats", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chatId: currentChatId,
              userId: user.uid,
              messages,
            }),
          });
        } else {
          // Create new chat — use first message as the title
          const title = messages[0]?.text.slice(0, 50) || "New Chat";
          const res = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.uid,
              title,
              messages,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentChatId(data.chatId);
          }
        }
      } catch (e) {
        console.error("Failed to save chat:", e);
      }
    }, 2000); // wait 2 seconds after last change before saving

    return () => clearTimeout(timer);
  }, [messages, currentChatId, user?.uid]);

  // ─── Save emotion to DB when it changes (debounced 8 seconds) ─────────────
  // We wait 8 seconds so we only save if they stay in that emotion — not every flicker
  useEffect(() => {
    if (!user?.uid || emotion === "neutral") return;

    const timer = setTimeout(async () => {
      try {
        await fetch("/api/emotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, emotion }),
        });
      } catch (e) {
        console.error("Failed to save emotion:", e);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [emotion, user?.uid]);

  // ─── Auto-scroll to bottom on new messages ────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ─── TTS Playback ──────────────────────────────────────────────────────────
  const playTTS = async (text: string, msgEmotion: string = "neutral") => {
    try {
      setIsSpeaking(true);
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, emotion: msgEmotion }),
      });

      if (!response.ok) {
        console.error("TTS failed:", response.statusText);
        setIsSpeaking(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      await audio.play();
    } catch (error) {
      console.error("TTS playback error:", error);
      setIsSpeaking(false);
    }
  };

  // ─── Send Message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        text: text.trim(),
        emotion,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        // Cap history to last 10 messages to control cost
        const history = messages.slice(-10).map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          text: m.text,
          ...(m.emotion ? { emotion: m.emotion } : {}),
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            emotion,
            history,
            userId: user?.uid || null, // Pass user ID for context memory
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            text: data.reply,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          playTTS(data.reply, emotion);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              text: "I'm having trouble responding right now. Please try again.",
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: "Connection error. Please check your internet and try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [emotion, isLoading, messages, user?.uid]
  );

  // ─── Start a new chat ──────────────────────────────────────────────────────
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInput("");
    inputRef.current?.focus();
  };

  const handleTranscription = useCallback(
    (text: string) => {
      setInput(text);
      sendMessage(text);
    },
    [sendMessage]
  );

  const handleEmotionDetected = useCallback((detectedEmotion: string) => {
    setEmotion(detectedEmotion);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleGetHelp = async () => {
    try {
      const response = await fetch("/api/emergency-support");
      const data = await response.json();
      const helpText = [
        data.message,
        "",
        ...data.resources.map(
          (r: { name: string; phone?: string; url: string }) =>
            `• ${r.name}${r.phone ? ` — ${r.phone}` : ""}\n  ${r.url}`
        ),
        "",
        data.disclaimer,
      ].join("\n");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: helpText,
          timestamp: new Date(),
        },
      ]);
    } catch {
      // silently ignore
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-lg shadow-violet-500/20 ring-1 ring-violet-500/20 dark:bg-white">
            <SerenaMark className="h-full w-full" />
          </div>
          <div>
            <h2 className="font-brand text-base font-semibold tracking-tight">
              Serena
            </h2>
            <p className="text-[0.65rem] leading-tight text-muted-foreground sm:text-xs">
              Conversations that Care
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
              {emotion !== "neutral" && (
                <span className="ml-1 text-xs text-muted-foreground">
                  · Detected: {emotion}
                </span>
              )}
              {isSpeaking && (
                <span className="ml-1 text-xs text-violet-400">· Speaking</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* New Chat button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="rounded-lg text-sm"
            id="new-chat-btn"
          >
            ✏️ New Chat
          </Button>

          {/* Get Help button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetHelp}
            className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            id="get-help-btn"
          >
            🆘 Get Help
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="mx-auto max-w-3xl py-6 space-y-4">

          {/* Show loading spinner while fetching previous chat */}
          {chatLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-xl shadow-violet-500/25 ring-1 ring-violet-500/20 dark:bg-white">
                <SerenaMark className="h-full w-full" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Hi{user?.displayName ? `, ${user.displayName}` : ""}! 👋
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                I&apos;m Serena — your emotionally-aware companion. Share how
                you&apos;re feeling — type, use voice, or turn on the emotion
                camera.
              </p>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                text={msg.text}
                emotion={msg.emotion}
                timestamp={msg.timestamp}
                userName={user?.displayName || undefined}
              />
            ))
          )}

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                AI
              </div>
              <div className="rounded-2xl bg-card border border-border px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Bar */}
      <div className="border-t border-border/40 bg-background/80 px-4 py-3 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-2"
        >
          <EmotionCamera onEmotionDetected={handleEmotionDetected} />
          <VoiceRecorder
            onTranscription={handleTranscription}
            disabled={isLoading}
          />
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 rounded-xl border-border/60 bg-muted/50 px-4 py-2.5 text-sm focus-visible:ring-violet-500/50"
            id="chat-input"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 p-0 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50"
            id="send-btn"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M5 10h10M12 5l5 5-5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
}
