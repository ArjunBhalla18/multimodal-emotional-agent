"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageBubbleProps {
  role: "user" | "assistant";
  text: string;
  emotion?: string;
  timestamp?: Date;
  userName?: string;
  userAvatar?: string;
}

const EMOTION_BADGES: Record<string, { emoji: string; color: string }> = {
  happy: { emoji: "😊", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  sad: { emoji: "😢", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  angry: { emoji: "😠", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  fearful: { emoji: "😰", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  surprised: { emoji: "😲", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  disgusted: { emoji: "🤢", color: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
  neutral: { emoji: "😐", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
};

export default function MessageBubble({
  role,
  text,
  emotion,
  timestamp,
  userName,
  userAvatar,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const badge = emotion ? EMOTION_BADGES[emotion] || EMOTION_BADGES.neutral : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          {userAvatar ? (
            <AvatarImage src={userAvatar} alt="You" />
          ) : null}
          <AvatarFallback
            className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold"
          >
            {userName?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex h-8 w-8 shrink-0 mt-1 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-md shadow-violet-500/15 ring-1 ring-violet-500/20 dark:bg-white">
          <Image
            src="/serena-mark.png"
            alt="Serena"
            width={32}
            height={32}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
            : "bg-card border border-border shadow-sm"
        }`}
      >
        {/* Emotion Badge */}
        {badge && (
          <span
            className={`mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}
          >
            {badge.emoji} {emotion}
          </span>
        )}

        <p
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? "text-white/95" : "text-foreground"
          }`}
        >
          {text}
        </p>

        {/* Timestamp */}
        {timestamp && (
          <p
            className={`mt-1.5 text-xs ${
              isUser ? "text-white/50" : "text-muted-foreground"
            }`}
          >
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
