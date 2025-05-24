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
  updated_at?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // For user auth
  const [resumes, setResumes] = useState<Resume[]>([]); // Use Resume type
  const [resumeTitle, setResumeTitle] = useState("");
  const [resumesLoading, setResumesLoading] = useState(false); // For resumes data
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); // New mounted state
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalResumeTitle, setModalResumeTitle] = useState("");
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
        
        // Check onboarding status
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', data.user.id)
          .single();
        
        if (!profile?.onboarding_completed) {
          router.push('/onboarding');
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
  }, [user]); // Keep dependency on user

  const fetchResumes = async () => {
    setResumesLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("resumes")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false });  // Order by most recently updated
    if (error) setError(error.message);
    setResumes((data as Resume[]) || []); // Cast to Resume[]
    setResumesLoading(false);
  };

  const handleAddResume = async (e?: React.FormEvent, customTitle?: string) => {
    if (e) e.preventDefault();
    setError(null);
    
    // Use custom title if provided (from modal), otherwise use form input
    const title = customTitle || resumeTitle.trim() || `Resume ${new Date().toLocaleDateString()}`;
    
    if (!user) return;
    
    const { data, error } = await supabase
      .from("resumes")
      .insert([{ title, user_id: user.id }])
      .select()
      .single();
      
    if (error) {
      setError(error.message);
      return;
    }
    
    setResumeTitle("");
    setModalResumeTitle("");
    setShowCreateModal(false);
    
    // Navigate directly to the builder for new resumes
    if (data) {
      router.push(`/builder/${data.id}`);
    }
  };

  const handleCreateResume = () => {
    setShowCreateModal(true);
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
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Resumes</p>
                  <p className="text-3xl font-bold text-gray-900">{resumes.length}</p>
                </div>
                <div className="bg-indigo-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recently Updated</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {resumes.filter(r => {
                      const updated = new Date(r.updated_at || r.created_at || '');
                      const dayAgo = new Date();
                      dayAgo.setDate(dayAgo.getDate() - 1);
                      return updated > dayAgo;
                    }).length}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Templates Available</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Your Resumes</h2>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                <button
                  onClick={() => setShowQuickCreate(!showQuickCreate)}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  {showQuickCreate ? 'Hide options' : 'More options'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={handleCreateResume}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Resume
                </button>
                
                <button
                  onClick={() => {
                    setResumeTitle('Professional Resume');
                    handleAddResume();
                  }}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg border-2 border-gray-300 hover:border-indigo-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Use Template
                </button>
                
                <button
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-400 font-semibold py-4 px-6 rounded-lg border-2 border-gray-200 cursor-not-allowed"
                  disabled
                  title="Coming soon"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import Resume
                </button>
              </div>
              
              {showQuickCreate && (
                <form className="mt-6 flex flex-col sm:flex-row gap-4" onSubmit={handleAddResume}>
                  <input
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base text-gray-900 placeholder-gray-400"
                    type="text"
                    placeholder="Enter custom resume title..."
                    value={resumeTitle}
                    onChange={e => setResumeTitle(e.target.value)}
                  />
                  <button
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    type="submit"
                  >
                    Create
                  </button>
                </form>
              )}
            </div>

            {/* Resume List */}
            <ResumeList 
              resumes={resumes} 
              loading={resumesLoading} 
              error={error} 
              onCreateResume={handleCreateResume}
              onUpdate={fetchResumes}
            />
          </div>
        </div>
      </div>

      {/* Create Resume Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Resume</h2>
              <p className="text-gray-600 mb-6">
                Give your resume a name to get started. You can always change this later.
              </p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (modalResumeTitle.trim()) {
                  handleAddResume(e, modalResumeTitle.trim());
                }
              }}>
                <input
                  type="text"
                  value={modalResumeTitle}
                  onChange={(e) => setModalResumeTitle(e.target.value)}
                  placeholder="e.g., Marketing Manager Resume"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-6 text-gray-900 placeholder-gray-400"
                  autoFocus
                />
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setModalResumeTitle("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!modalResumeTitle.trim()}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Create Resume
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
