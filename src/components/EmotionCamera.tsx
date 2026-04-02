"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EmotionCameraProps {
  onEmotionDetected: (emotion: string) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
let faceapi: any = null;
let modelsLoaded = false;

async function ensureFaceAPI() {
  if (faceapi) return faceapi;
  faceapi = await import("@vladmandic/face-api");
  return faceapi;
}

async function ensureModels(api: any) {
  if (modelsLoaded) return;
  const MODEL_URL = "/models";
  await api.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await api.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  console.log("[EmotionCamera] Models loaded ✓");
  modelsLoaded = true;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const EXPRESSION_KEYS = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "fearful",
  "surprised",
  "disgusted",
] as const;

export default function EmotionCamera({
  onEmotionDetected,
}: EmotionCameraProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [noFace, setNoFace] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiRef = useRef<any>(null);

  const startCamera = useCallback(async () => {
    try {
      setIsLoadingModels(true);

      // 1. Load library + models
      const api = await ensureFaceAPI();
      apiRef.current = api;
      await ensureModels(api);

      // 2. Start webcam — store stream, we'll attach it in useEffect once video element mounts
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      streamRef.current = stream;

      setIsLoadingModels(false);
      setIsActive(true); // This causes the video element to mount
      console.log("[EmotionCamera] Camera started ✓");
    } catch (error) {
      console.error("[EmotionCamera] Failed to start:", error);
      setIsLoadingModels(false);
    }
  }, []);

  // Attach stream to video element once it mounts (isActive becomes true)
  useEffect(() => {
    if (!isActive || !streamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    console.log("[EmotionCamera] Stream attached to video element ✓");
  }, [isActive]);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setCurrentEmotion("neutral");
    setConfidence(0);
    setNoFace(false);
    onEmotionDetected("neutral");
  }, [onEmotionDetected]);

  // Detection loop — starts once video is active and playing
  useEffect(() => {
    if (!isActive || !apiRef.current) return;

    const api = apiRef.current;

    const detect = async () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || video.readyState < 2) {
        return;
      }

      try {
        const result = await api
          .detectSingleFace(
            video,
            new api.TinyFaceDetectorOptions({
              inputSize: 256,
              scoreThreshold: 0.4,
            })
          )
          .withFaceExpressions();

        if (!result || !result.expressions) {
          setNoFace(true);
          return;
        }

        setNoFace(false);

        const expressions = result.expressions;
        let bestEmotion = "neutral";
        let bestScore = 0;

        for (const key of EXPRESSION_KEYS) {
          const score = expressions[key];
          if (typeof score === "number" && score > bestScore) {
            bestScore = score;
            bestEmotion = key;
          }
        }

        console.log(
          `[EmotionCamera] ${bestEmotion} (${Math.round(bestScore * 100)}%)`
        );

        if (bestScore > 0.2) {
          setCurrentEmotion(bestEmotion);
          setConfidence(Math.round(bestScore * 100));
          onEmotionDetected(bestEmotion);
        }
      } catch (err) {
        console.error("[EmotionCamera] Detection error:", err);
      }
    };

    // Wait a moment for video to start playing, then begin detection loop
    const startTimeout = setTimeout(() => {
      detect(); // First detection
      intervalRef.current = setInterval(detect, 1500);
    }, 1000);

    return () => {
      clearTimeout(startTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
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
        disabled={isLoadingModels}
        className={`h-10 w-10 rounded-full transition-all duration-300 ${
          isActive
            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
            : isLoadingModels
            ? "animate-pulse text-muted-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        id="emotion-camera-btn"
      >
        {isLoadingModels ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
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
        )}
      </Button>

      {/* Camera Preview — portaled to body so fixed positioning works */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="fixed top-40 right-4 z-[9999] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/20"
              >
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-44 w-60 object-cover"
                  />
                  {/* Emotion overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                    {noFace ? (
                      <span className="text-xs text-white/70">
                        No face detected
                      </span>
                    ) : (
                      <>
                        <span className="text-base">{config.emoji}</span>
                        <span
                          className={`text-sm font-semibold ${config.color}`}
                        >
                          {currentEmotion}
                        </span>
                        {confidence > 0 && (
                          <span className="text-xs text-white/50">
                            {confidence}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {/* Live indicator */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    <span className="text-[10px] font-bold text-white">
                      LIVE
                    </span>
                  </div>
                  {/* Close button */}
                  <button
                    onClick={stopCamera}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                    id="close-camera-preview"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M2 2l8 8M10 2l-8 8" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
