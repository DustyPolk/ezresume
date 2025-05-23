"use client";
import { supabase } from "../../lib/supabaseClient"; // Adjusted path
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'; // Import useRouter
import AppLayout from '../../components/layout/AppLayout'; // Import AppLayout
import ResumeList from '../../components/dashboard/ResumeList'; // Import ResumeList

// Define Resume type, or import from a shared location if available
interface Resume {
  id: string;
  title: string;
  created_at?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // For user auth
  const [resumes, setResumes] = useState<Resume[]>([]); // Use Resume type
  const [resumeTitle, setResumeTitle] = useState("");
  const [resumesLoading, setResumesLoading] = useState(false); // For resumes data
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); // New mounted state
  const router = useRouter();

  useEffect(() => {
    setMounted(true); // Set mounted after initial client render
  }, []);

  useEffect(() => {
    if (mounted) { // Only run auth check if mounted
      const getUser = async () => {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError || !data?.user) {
          router.push('/'); // Redirect if no user or error
          return;
        }
        setUser(data.user);
        setLoading(false); // Auth check finished
      };
      getUser();
    }
  }, [mounted, router]); // Depend on mounted and router

  useEffect(() => {
    // This already depends on 'user', which is set after 'mounted' and auth.
    // And 'mounted' is implicitly handled by 'user' being null initially.
    if (user) { // user will only be set if mounted and auth succeeded
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Keep dependency on user

  const fetchResumes = async () => {
    setResumesLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("resumes")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setResumes((data as Resume[]) || []); // Cast to Resume[]
    setResumesLoading(false);
  };

  const handleAddResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!resumeTitle.trim() || !user) return;
    const { error } = await supabase
      .from("resumes")
      .insert([{ title: resumeTitle.trim(), user_id: user.id }]);
    if (error) setError(error.message);
    setResumeTitle("");
    fetchResumes();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null); // This will trigger the !user condition below if not redirected first
    router.push('/'); // Explicitly redirect to home
  };

  if (!mounted || loading) { // Show loading if not mounted OR if user auth check is in progress
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If mounted and finished loading user auth:
  if (!user) {
    // This state should ideally not be rendered due to the redirect in the getUser useEffect,
    // but as a fallback or during the brief moment before redirect.
    return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

  // If mounted, user exists, and user auth loading is false:
  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2">
                  Welcome back, {(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0])?.split(' ')[0]}!
                </h1>
                <p className="text-lg sm:text-xl text-indigo-100">
                  Craft your perfect resume with AI assistance
                </p>
              </div>
              <button
                className="mt-4 sm:mt-0 bg-white hover:bg-gray-100 text-indigo-600 font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Your Resumes</h2>
            
            {/* Create Resume Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleAddResume}>
                <input
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base text-gray-900 placeholder-gray-400"
                  type="text"
                  placeholder="Enter your new resume title..."
                  value={resumeTitle}
                  onChange={e => setResumeTitle(e.target.value)}
                />
                <button
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  type="submit"
                >
                  Create Resume
                </button>
              </form>
            </div>

            {/* Resume List */}
            <ResumeList resumes={resumes} loading={resumesLoading} error={error} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
