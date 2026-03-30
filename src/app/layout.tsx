import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Oneko from "@/components/Oneko";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-brand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Serena — Conversations that Care",
  description:
    "Serena is a compassionate, multimodal AI companion that listens, understands your emotions, and responds with empathy. Voice, text, and facial emotion awareness.",
  keywords: ["AI", "emotional wellness", "mental health", "chat", "companion"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfairDisplay.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Toaster />
            <Oneko />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
