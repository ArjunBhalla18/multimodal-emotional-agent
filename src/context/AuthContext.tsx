"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  Auth,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

function isValidAuth(a: unknown): a is Auth {
  return (
    a !== null &&
    typeof a === "object" &&
    typeof (a as Record<string, unknown>).onAuthStateChanged === "function"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isValidAuth(auth)) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (!isValidAuth(auth))
      throw new Error("Firebase not configured. Add API keys to .env.local");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    if (!isValidAuth(auth))
      throw new Error("Firebase not configured. Add API keys to .env.local");

    // Step 1: Create user in Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // Step 2: Save user profile to MongoDB
    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: cred.user.uid, // Firebase UID as our MongoDB user ID
          name,
          email,
          // API hashes this before storing
          password,
        }),
      });
    } catch (e) {
      // Non-critical: user can still use the app even if MongoDB save fails
      console.error("Failed to save user to MongoDB:", e);
    }
  };

  const logout = async () => {
    if (!isValidAuth(auth)) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);