import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindfulAI — Emotionally-Aware AI Companion",
  description:
    "A compassionate, multimodal AI assistant that listens, understands your emotions, and responds with empathy. Voice, text, and facial emotion awareness.",
  keywords: ["AI", "emotional wellness", "mental health", "chat", "companion"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full dark`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
