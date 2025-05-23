"use client";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function AuthPage() { // Renamed function to AuthPage
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="text-2xl font-bold">AI Resume Builder</h1>
        <button
          className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 shadow"
          onClick={handleSignIn}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // If user exists, redirect is handled by useEffect. Can show a loading/redirecting message.
  return <div className="flex items-center justify-center min-h-screen">Redirecting to dashboard...</div>;
}
