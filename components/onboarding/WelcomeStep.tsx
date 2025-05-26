'use client';

import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface WelcomeStepProps {
  onNext: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { data } = useOnboarding();
  const firstName = data.personalInfo.full_name?.split(' ')[0] || 'there';

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent mb-4">
            Welcome{firstName !== 'there' ? `, ${firstName}` : ''}! 👋
          </h1>
          <p className="text-xl text-slate-600">
            Let&apos;s create your professional resume in just a few minutes
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            What we&apos;ll cover:
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                ✓
              </span>
              <span className="text-slate-700">Your contact information and professional summary</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                ✓
              </span>
              <span className="text-slate-700">Work experience and achievements</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                ✓
              </span>
              <span className="text-slate-700">Education and skills</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                ✓
              </span>
              <span className="text-slate-700">Optional: Projects and certifications</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6 mb-10">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-purple-900 font-semibold">Estimated time: 10-15 minutes</span>
          </div>
          <p className="text-purple-700 text-sm">
            Don&apos;t worry - your progress is saved automatically, so you can come back anytime!
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            Let&apos;s Get Started →
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeStep;