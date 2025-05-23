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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 w-full max-w-xl mx-auto">
        <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
        <button
          className="px-6 py-3 rounded bg-gray-200 hover:bg-gray-300 shadow"
          onClick={handleSignOut}
        >
          Sign out
        </button>

        <div className="w-full mt-6">
          <h2 className="text-xl font-semibold mb-2">Your Resumes</h2>
          <form className="flex gap-2 mb-4" onSubmit={handleAddResume}>
            <input
              className="flex-1 px-3 py-2 border rounded shadow"
              type="text"
              placeholder="Resume title"
              value={resumeTitle}
              onChange={e => setResumeTitle(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              type="submit"
            >
              Add
            </button>
          </form>
          <ResumeList resumes={resumes} loading={resumesLoading} error={error} />
        </div>
      </div>
    </AppLayout>
  );
}
