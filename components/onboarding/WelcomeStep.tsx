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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome{firstName !== 'there' ? `, ${firstName}` : ''}! 👋
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Let's create your professional resume in just a few minutes
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          What we'll cover:
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-indigo-600 mr-3">✓</span>
            <span className="text-gray-700">Your contact information and professional summary</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-3">✓</span>
            <span className="text-gray-700">Work experience and achievements</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-3">✓</span>
            <span className="text-gray-700">Education and skills</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-3">✓</span>
            <span className="text-gray-700">Optional: Projects and certifications</span>
          </li>
        </ul>
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 mb-8">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-indigo-900 font-medium">Estimated time: 10-15 minutes</span>
        </div>
        <p className="text-indigo-700 text-sm">
          Don't worry - your progress is saved automatically, so you can come back anytime!
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-150 hover:scale-105"
        >
          Let's Get Started →
        </button>
      </div>
    </div>
  );
}

export default WelcomeStep;