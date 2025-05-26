'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface CompletionStepProps {
  onNext?: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export function CompletionStep({ onComplete }: CompletionStepProps) {
  const router = useRouter();
  const { data, saveProgress } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      handleComplete();
    }
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = async () => {
    setIsSaving(true);
    setError('');

    try {
      // Save all the data one final time
      await saveProgress();
      
      // Mark onboarding as complete
      if (onComplete) {
        onComplete();
      }
      
      // Wait a moment before redirecting to show success state
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to complete onboarding. Please try again.');
      setIsSaving(false);
    }
  };

  const completedSections = [
    data.personalInfo.full_name ? 'Personal Information' : null,
    data.personalInfo.professional_headline ? 'Professional Summary' : null,
    data.experiences.length > 0 ? `${data.experiences.length} Work Experience${data.experiences.length > 1 ? 's' : ''}` : null,
    data.education.length > 0 ? `${data.education.length} Education Entr${data.education.length > 1 ? 'ies' : 'y'}` : null,
    data.skills.length > 0 ? `${data.skills.length} Skills` : null,
    data.projects.length > 0 ? `${data.projects.length} Project${data.projects.length > 1 ? 's' : ''}` : null,
    data.certifications.length > 0 ? `${data.certifications.length} Certification${data.certifications.length > 1 ? 's' : ''}` : null,
  ].filter(Boolean);

  if (!mounted) return null;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {!error && isSaving && (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  Completing Your Profile...
                </h2>
                <p className="text-slate-600 mt-2">We&apos;re saving your information and getting everything ready.</p>
              </div>
            </>
          )}

          {!error && !isSaving && (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Congratulations! 🎉
                </h2>
                <p className="text-slate-600 mt-2">Your profile is complete. Redirecting to your dashboard...</p>
              </div>
            </>
          )}

          {error && (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Oops! Something went wrong</h2>
                <p className="text-red-600 mt-2">{error}</p>
              </div>
              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Try Again
              </button>
            </>
          )}
        </div>

        {!error && (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Your Profile Summary</h3>
            <div className="space-y-3">
              {completedSections.map((section, index) => (
                <div key={index} className="flex items-center bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-medium">{section}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <p className="text-sm text-purple-800">
                <strong className="font-semibold">Pro tip:</strong> You can always update your profile information from your dashboard.
                Now you&apos;re ready to create tailored resumes for any job opportunity!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompletionStep;