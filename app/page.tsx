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
        const { data } = await supabase.auth.getUser();
        setUser(data?.user || null);
        setLoading(false); // Auth check finished
      };
      getUser();
    }
  }, [mounted]); // Depend on mounted

  useEffect(() => {
    if (mounted && user) { // Redirect only if mounted and user exists
      const checkOnboarding = async () => {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();
        
        // If tables don't exist or no profile found, we need onboarding
        if (profileError || !profile) {
          router.push('/onboarding');
        } else if (profile.onboarding_completed) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      };
      checkOnboarding();
    }
  }, [mounted, user, router]); // Depend on mounted and user

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  if (!mounted || loading) { // Show loading if not mounted OR if auth check is in progress
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If mounted and finished loading auth state:
  if (!user) { // No user, show new landing page content
    return (
      <div className="new-landing-page-container w-full"> {/* This div will be styled by Tailwind later */}
        {/* New Hero Section */}
        <section className="hero-section bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Craft Your <span className="text-indigo-400">Dream Resume</span>, Effortlessly.
            </h1>
            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-slate-300 mb-10">
              Stop wrestling with confusing templates and endless revisions. Our AI-powered builder helps you create professional, tailored resumes in minutes, so you can land your next interview with confidence.
            </p>
            {/* Sign-in Button */}
            <button
              className="px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
              onClick={handleSignIn} // Ensure handleSignIn is in scope
            >
              Get Started - Sign in with Google
            </button>
            <p className="mt-4 text-sm text-slate-400">It&apos;s free to get started!</p>
          </div>
          {/* Optional: Placeholder for a visual element if design implies it */}
          {/* <div className="mt-12"> Image/Graphic Placeholder </div> */}
        </section>

        {/* New Feature Highlights Section */}
        <section className="features-section bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 sm:mb-16">
              Everything You Need to Shine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 lg:gap-x-12">
              {/* Feature 1 */}
              <div className="feature-item text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                   <svg className="w-10 h-10 text-indigo-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path d="M9 10h.01M15 10h.01M12 14h.01"></path><path d="M12 6v1m0 14V6"></path></svg> {/* Example SVG icon */}
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-3">AI-Powered Content</h3>
                <p className="text-slate-600">
                  Let our smart AI assist you in writing compelling bullet points and summaries, tailored to your experience and the jobs you want.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="feature-item text-center md:text-left">
                 <div className="flex justify-center md:justify-start mb-4">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 11h10"></path></svg> {/* Example SVG icon */}
                 </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-3">Modern Templates</h3>
                <p className="text-slate-600">
                  Choose from a selection of professionally designed templates that are proven to impress recruiters. (Placeholders for now!)
                </p>
              </div>
              {/* Feature 3 */}
              <div className="feature-item text-center md:text-left">
                 <div className="flex justify-center md:justify-start mb-4">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> {/* Example SVG icon */}
                 </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-3">Simple & Intuitive</h3>
                <p className="text-slate-600">
                  Our easy-to-use interface makes resume building a breeze. No more fighting with word processors or complex software.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* New CTA Section */}
        <section className="cta-section bg-indigo-700 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Stop Dreaming, Start Achieving.
            </h2>
            <p className="text-lg sm:text-xl text-indigo-100 mb-10">
              Your perfect resume is just a few clicks away. Join thousands of successful job seekers who trusted our AI to elevate their careers. What are you waiting for?
            </p>
            <button
              className="px-10 py-4 rounded-lg bg-white hover:bg-slate-100 text-indigo-700 font-semibold text-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
              onClick={handleSignIn} // Ensure handleSignIn is in scope
            >
              Create Your Resume Now - Sign in with Google
            </button>
            <p className="mt-4 text-sm text-indigo-200">
              Free to sign up. No credit card required.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // If mounted, finished loading, and user exists (and redirect hasn't happened yet)
  return <div className="flex items-center justify-center min-h-screen">Redirecting to dashboard...</div>;
}
