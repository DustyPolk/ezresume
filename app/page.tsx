"use client";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // This loading is for the auth check
  const [mounted, setMounted] = useState(false); // New mounted state
  const router = useRouter();

  useEffect(() => {
    setMounted(true); // Set mounted after initial client render
  }, []);

  useEffect(() => {
    if (mounted) { // Only run auth check if mounted
      const getUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        // TODO: Handle error if needed
        setUser(data?.user || null);
        setLoading(false); // Auth check finished
      };
      getUser();
    }
  }, [mounted]); // Depend on mounted

  useEffect(() => {
    if (mounted && user) { // Redirect only if mounted and user exists
      router.push('/dashboard');
    }
  }, [mounted, user, router]); // Depend on mounted and user

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  if (!mounted || loading) { // Show loading if not mounted OR if auth check is in progress
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If mounted and finished loading auth state:
  if (!user) { // No user, show sign-in
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="text-2xl font-bold">AI Resume Builder</h1>
        <button
          className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 shadow"
          onClick={handleSignIn} // handleSignIn remains the same
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // If mounted, finished loading, and user exists (and redirect hasn't happened yet)
  return <div className="flex items-center justify-center min-h-screen">Redirecting to dashboard...</div>;
}
