"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: "💬",
    title: "Empathetic Chat",
    description:
      "AI that truly understands your emotions and responds with genuine empathy and care.",
  },
  {
    icon: "🎙️",
    title: "Voice Interaction",
    description:
      "Speak naturally — your voice is transcribed and understood in real time.",
  },
  {
    icon: "😊",
    title: "Emotion Detection",
    description:
      "On-device facial emotion recognition adapts responses to how you're feeling.",
  },
  {
    icon: "🔒",
    title: "Privacy First",
    description:
      "No audio or video is ever stored. Your emotional data stays on your device.",
  },
  {
    icon: "🛡️",
    title: "Safe & Responsible",
    description:
      "Built with safety guardrails — never provides medical advice or prescriptions.",
  },
  {
    icon: "🔊",
    title: "Voice Responses",
    description:
      "Hear responses spoken aloud with emotionally-modulated voice synthesis.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4">
        {/* Gradient background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-600 dark:text-violet-400"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
            Emotionally-Aware AI
          </motion.div>

          {/* Heading */}
          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Your compassionate{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400">
              AI companion
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            MindfulAI listens, understands your emotions, and responds with
            genuine empathy. Talk through text, voice, or let your expressions
            speak for themselves.
          </p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/chat">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
                id="hero-cta"
              >
                Start Chatting →
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl px-8 text-base font-semibold"
                id="hero-signup"
              >
                Create Account
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative border-t border-border/40 bg-muted/30 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built with empathy,{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
                powered by AI
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every feature is designed to create a safe, supportive space for you.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-2xl transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>
            © 2026 MindfulAI. Not a substitute for professional mental health care.
          </p>
        </div>
      </footer>
    </div>
  );
}
