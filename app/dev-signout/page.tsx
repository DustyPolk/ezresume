'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DevSignOut() {
  const router = useRouter();

  useEffect(() => {
    const signOutCompletely = async () => {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all local storage
      localStorage.clear();
      
      // Clear all session storage
      sessionStorage.clear();
      
      // Clear cookies (what we can access)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 1000);
    };

    signOutCompletely();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Signing Out...</h1>
        <p className="text-gray-600">Clearing all session data</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}