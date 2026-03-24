"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EmotionCameraProps {
  onEmotionDetected: (emotion: string) => void;
}

const EMOTIONS = ["neutral", "happy", "sad", "angry", "fearful", "surprised", "disgusted"];

export default function EmotionCamera({
  onEmotionDetected,
}: EmotionCameraProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 160, height: 120, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch (error) {
      console.error("Failed to access camera:", error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setCurrentEmotion("neutral");
    onEmotionDetected("neutral");
  }, [onEmotionDetected]);

  // TODO: Replace with real DeepFace / face-api.js integration
  // This simulates emotion detection for development purposes
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Simulate emotion detection — in production, replace with actual
      // client-side facial emotion recognition (e.g., face-api.js or TensorFlow.js)
      const randomEmotion =
        EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      setCurrentEmotion(randomEmotion);
      onEmotionDetected(randomEmotion);
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, onEmotionDetected]);

  const emotionConfig: Record<string, { emoji: string; color: string }> = {
    happy: { emoji: "😊", color: "text-emerald-500" },
    sad: { emoji: "😢", color: "text-blue-500" },
    angry: { emoji: "😠", color: "text-red-500" },
    fearful: { emoji: "😰", color: "text-amber-500" },
    surprised: { emoji: "😲", color: "text-purple-500" },
    disgusted: { emoji: "🤢", color: "text-lime-500" },
    neutral: { emoji: "😐", color: "text-gray-500" },
  };

  const config = emotionConfig[currentEmotion] || emotionConfig.neutral;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={isActive ? stopCamera : startCamera}
        className={`h-10 w-10 rounded-full transition-all duration-300 ${
          isActive
            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
            : "text-muted-foreground hover:text-foreground"
        }`}
        id="emotion-camera-btn"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="4" width="16" height="12" rx="2" />
          <circle cx="10" cy="10" r="3" />
        </svg>
      </Button>

      {/* Camera Preview Panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-14 right-0 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          >
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-24 w-32 object-cover"
              />
              {/* Emotion overlay */}
              <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-1 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-sm">
                <span className="text-sm">{config.emoji}</span>
                <span className={`text-xs font-medium ${config.color}`}>
                  {currentEmotion}
                </span>
              </div>
              {/* Live indicator */}
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-red-500/90 px-1.5 py-0.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                <span className="text-[10px] font-bold text-white">LIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
