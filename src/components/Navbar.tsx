"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SerenaMark } from "@/components/SerenaMark";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load user avatar from MongoDB
  useEffect(() => {
    if (!user?.uid) {
      setAvatarUrl(null);
      return;
    }

    const loadAvatar = async () => {
      try {
        const response = await fetch("/api/user", {
          headers: { "x-user-id": user.uid },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (typeof data.avatar === "string" && data.avatar.trim()) {
          setAvatarUrl(data.avatar);
        }
      } catch (error) {
        console.error("Failed to load avatar:", error);
      }
    };

    loadAvatar();
  }, [user?.uid]);

  const navLinks = [
    { href: "/chat", label: "Chat", icon: "💬" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/40 backdrop-blur-2xl backdrop-saturate-150"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-md shadow-violet-500/15 ring-1 ring-violet-500/20 transition-shadow group-hover:shadow-violet-500/30 dark:bg-white">
            <SerenaMark className="h-full w-full" priority />
          </div>
          <div className="flex flex-col items-start gap-0.5 leading-none">
            <span className="font-brand text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Serena
            </span>
            <span className="max-w-[11rem] text-[0.65rem] font-sans font-normal leading-snug tracking-wide text-muted-foreground sm:max-w-none sm:text-xs">
              Conversations that Care
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {user &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-lg"
            id="theme-toggle"
          >
            <span className="dark:hidden text-lg">🌙</span>
            <span className="hidden dark:inline text-lg">☀️</span>
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm hover:bg-accent" id="user-menu">
                  {avatarUrl ? (
                    <div className="h-6 w-6 overflow-hidden rounded-full ring-1 ring-violet-500/30">
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                      {user.displayName?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium sm:inline">
                    {user.displayName || user.email}
                  </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Link href="/profile">👤 Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive"
                >
                  🚪 Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-lg" id="login-nav">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                  id="signup-nav"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="md:hidden inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-accent" id="mobile-menu">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-foreground"
                >
                  <path
                    d="M3 5h14M3 10h14M3 15h14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-left mb-4">Navigation</SheetTitle>
              <div className="flex flex-col gap-2 pt-2">
                {user &&
                  navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                {user && (
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    🚪 Log out
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
