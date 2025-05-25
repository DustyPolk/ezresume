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
  }, [mounted]);

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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        {!error && isSaving && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Completing Your Profile...</h2>
              <p className="text-gray-600 mt-2">We're saving your information and getting everything ready.</p>
            </div>
          </>
        )}

        {!error && !isSaving && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Congratulations! 🎉</h2>
              <p className="text-gray-600 mt-2">Your profile is complete. Redirecting to your dashboard...</p>
            </div>
          </>
        )}

        {error && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
              <p className="text-red-600 mt-2">{error}</p>
            </div>
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>

      {!error && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile Summary</h3>
          <div className="space-y-2">
            {completedSections.map((section, index) => (
              <div key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{section}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-700">
              <strong>Pro tip:</strong> You can always update your profile information from your dashboard.
              Now you're ready to create tailored resumes for any job opportunity!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompletionStep;