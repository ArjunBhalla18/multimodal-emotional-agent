"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";

const INTEREST_OPTIONS = [
  "Mindfulness",
  "Meditation",
  "Exercise",
  "Sleep",
  "Nutrition",
  "Journaling",
  "Therapy",
  "Yoga",
  "Reading",
  "Music",
  "Art",
  "Nature",
];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.uid) return;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/user", {
          headers: { "x-user-id": user.uid },
        });

        if (!response.ok) return;
        const data = await response.json();

        if (typeof data.name === "string" && data.name.trim()) {
          setName(data.name);
        }
        if (typeof data.country === "string") {
          setCountry(data.country);
        }
        if (typeof data.mobile === "string") {
          setPhone(data.mobile);
        }
        if (Array.isArray(data.preferences)) {
          setInterests(data.preferences.slice(0, 3));
        }
        if (typeof data.avatar === "string" && data.avatar.trim()) {
          setAvatarUrl(data.avatar);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [user?.uid]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      if (prev.length >= 3) {
        toast.info("You can select up to 3 interests");
        return prev;
      }
      return [...prev, interest];
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    // Validate on client side too
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, WebP, or GIF image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "x-user-id": user.uid },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setAvatarUrl(data.avatar);
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setAvatarUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!user?.uid || saving) return;

    setSaving(true);
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({
          name: name.trim(),
          country: country.trim(),
          mobile: phone.trim(),
          preferences: interests,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      // Sync name to Firebase Auth so navbar + avatar header stay in sync
      if (name.trim() && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }

      toast.success("Profile updated!");
    } catch (error) {
      console.error("Profile save failed:", error);
      toast.error("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl space-y-6"
      >
        {/* Profile Header */}
        <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6">
            {/* Avatar with upload */}
            <div className="group relative">
              <Avatar className="h-20 w-20">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Profile picture" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white">
                  {user.displayName?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>

              {/* Upload overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/0 transition-all duration-200 group-hover:bg-black/50"
                id="avatar-upload-btn"
              >
                <span className="text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {avatarUploading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  )}
                </span>
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-file-input"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Click avatar to change • Max 2MB</span>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!user?.uid) return;
                    try {
                      const res = await fetch("/api/user/avatar", {
                        method: "DELETE",
                        headers: { "x-user-id": user.uid },
                      });
                      if (res.ok) {
                        setAvatarUrl(null);
                        toast.success("Avatar removed");
                      } else {
                        toast.error("Failed to remove avatar");
                      }
                    } catch {
                      toast.error("Failed to remove avatar");
                    }
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors underline underline-offset-2"
                  id="avatar-delete-btn"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">
                {user.displayName || "User"}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="profile-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="profile-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="profile-email"
                  value={user.email || ""}
                  disabled
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="profile-phone" className="text-sm font-medium">
                  Phone (optional)
                </label>
                <Input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="profile-country"
                  className="text-sm font-medium"
                >
                  Country (optional)
                </label>
                <Input
                  id="profile-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  className="rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              Interests{" "}
              <span className="text-sm font-normal text-muted-foreground">
                (select up to 3)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Toggle
                  key={interest}
                  pressed={interests.includes(interest)}
                  onPressedChange={() => toggleInterest(interest)}
                  className="rounded-full border border-border/60 px-4 py-1.5 text-sm data-[state=on]:border-violet-500 data-[state=on]:bg-violet-500/10 data-[state=on]:text-violet-600 dark:data-[state=on]:text-violet-400"
                  id={`interest-${interest.toLowerCase()}`}
                >
                  {interest}
                </Toggle>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            id="save-profile"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
