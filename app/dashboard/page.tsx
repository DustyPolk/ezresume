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
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]); // Use Resume type
  const [resumeTitle, setResumeTitle] = useState("");
  const [resumesLoading, setResumesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data?.user) {
        router.push('/');
        return;
      }
      setUser(data.user);
      setLoading(false);
    };
    getUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    setUser(null);
    router.push('/');
  };

  if (loading) {
    // Centering for loading state can be handled by AppLayout or a specific loading component
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    // This state should ideally not be visible for long due to redirects
    return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

  return (
    <AppLayout>
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto"> {/* Adjusted container for page content */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-0">
            Welcome, {user?.email?.split('@')[0]} {/* Display part of email */}
          </h1>
          <button
            className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>

        <div className="w-full mt-2"> {/* Reduced mt-6 to mt-2 */}
          <h2 className="text-xl font-semibold mb-4 text-slate-700">Your Resumes</h2> {/* Added text-slate-700 and increased mb */}
          <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={handleAddResume}> {/* Adjusted flex, gap, mb */}
            <input
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
              type="text"
              placeholder="Enter new resume title..."
              value={resumeTitle}
              onChange={e => setResumeTitle(e.target.value)}
            />
            <button
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              type="submit"
            >
              Add Resume
            </button>
          </form>
          <ResumeList resumes={resumes} loading={resumesLoading} error={error} />
        </div>
      </div>
    </AppLayout>
  );
}
