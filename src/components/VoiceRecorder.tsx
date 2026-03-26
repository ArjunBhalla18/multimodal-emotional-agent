"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  /**
   * Called when the user has been silent for a while and there is nothing
   * worth sending to chat (e.g., could not hear anything).
   */
  onNoSpeech?: () => void;
}

// Extend Window for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function VoiceRecorder({
  onTranscription,
  disabled = false,
  onNoSpeech,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldStopRef = useRef(false);
  const transcriptBufferRef = useRef<string>(""); // buffer all final speech until user stops
  const silenceTimeoutRef = useRef<number | null>(null);
  const silenceTriggeredRef = useRef(false);

  const SILENCE_MS = 10000; // 10 seconds of no speech -> fallback

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in your browser. Use Chrome or Edge."
      );
      return;
    }

    // Each "start" creates a fresh recognition instance to avoid stale callbacks.
    const recognition = new SpeechRecognition();
    shouldStopRef.current = false;
    silenceTriggeredRef.current = false;
    transcriptBufferRef.current = "";

    const clearSilenceTimer = () => {
      if (silenceTimeoutRef.current) {
        window.clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    };

    const resetSilenceTimer = () => {
      clearSilenceTimer();
      silenceTimeoutRef.current = window.setTimeout(() => {
        // If we timed out for silence, don't restart.
        silenceTriggeredRef.current = true;
        shouldStopRef.current = true;

        clearSilenceTimer();

        const transcript = transcriptBufferRef.current.trim();
        transcriptBufferRef.current = "";

        if (transcript) {
          setIsProcessing(true);
          onTranscription(transcript);
          setTimeout(() => setIsProcessing(false), 500);
        } else {
          onNoSpeech?.();
        }

        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }, SILENCE_MS);
    };

    // Continuous listening prevents the mic from "time-windowing" after a short pause.
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Any recognized speech (including interim) resets silence timer.
      let sawAnyText = false;

      // Buffer only "final" segments; ignore interim results for now.
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (transcript.trim()) {
          sawAnyText = true;
        }

        if (result.isFinal && transcript.trim()) {
          transcriptBufferRef.current =
            transcriptBufferRef.current.trimEnd() +
            (transcriptBufferRef.current ? " " : "") +
            transcript.trim();
        }
      }

      if (sawAnyText) resetSilenceTimer();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      shouldStopRef.current = true;
      transcriptBufferRef.current = "";
      clearSilenceTimer();
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);

      // Silence handler already sent fallback and finalized.
      if (silenceTriggeredRef.current) {
        silenceTriggeredRef.current = false;
        return;
      }

      // If the user didn't explicitly stop, try restarting to avoid early endings.
      if (!shouldStopRef.current) {
        try {
          recognition.start();
          setIsRecording(true);
          resetSilenceTimer();
        } catch (e) {
          // If restart fails, just finalize what we have (if anything).
          const transcript = transcriptBufferRef.current.trim();
          transcriptBufferRef.current = "";
          if (transcript) {
            setIsProcessing(true);
            onTranscription(transcript);
            setTimeout(() => setIsProcessing(false), 500);
          }
        }
        return;
      }

      // User clicked stop: send whatever we captured.
      const transcript = transcriptBufferRef.current.trim();
      transcriptBufferRef.current = "";
      clearSilenceTimer();
      if (transcript) {
        setIsProcessing(true);
        onTranscription(transcript);
        setTimeout(() => setIsProcessing(false), 500);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);

    // Start counting silence immediately after mic start.
    resetSilenceTimer();
  }, [onTranscription, onNoSpeech]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    // Mark as user-stopped so `onend` finalizes instead of restarting.
    shouldStopRef.current = true;
    silenceTriggeredRef.current = false;
    if (silenceTimeoutRef.current) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    try {
      recognitionRef.current.stop();
    } catch (e) {
      // If stopping fails, finalize anyway.
      const transcript = transcriptBufferRef.current.trim();
      transcriptBufferRef.current = "";
      if (transcript) {
        setIsProcessing(true);
        onTranscription(transcript);
        setTimeout(() => setIsProcessing(false), 500);
      }
    } finally {
      setIsRecording(false);
    }
  }, [onTranscription]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || isProcessing}
        onClick={isRecording ? stopRecording : startRecording}
        className={`relative h-10 w-10 rounded-full transition-all duration-300 ${
          isRecording
            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            : "text-muted-foreground hover:text-foreground"
        }`}
        id="voice-recorder-btn"
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
            />
          ) : isRecording ? (
            <motion.div
              key="recording"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="4" y="4" width="12" height="12" rx="2" />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M4 10a6 6 0 0 0 12 0" strokeLinecap="round" />
                <path d="M10 16v2" strokeLinecap="round" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Recording pulse indicator */}
      {isRecording && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-red-500/30 pointer-events-none"
        />
      )}
    </div>
  );
}
