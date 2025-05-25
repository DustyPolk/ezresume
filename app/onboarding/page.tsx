'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import PersonalInfoStep from '@/components/onboarding/PersonalInfoStep';
import ProfessionalSummaryStep from '@/components/onboarding/ProfessionalSummaryStep';
import ExperienceStep from '@/components/onboarding/ExperienceStep';
import EducationStep from '@/components/onboarding/EducationStep';
import SkillsStep from '@/components/onboarding/SkillsStep';
import AdditionalInfoStep from '@/components/onboarding/AdditionalInfoStep';
import CompletionStep from '@/components/onboarding/CompletionStep';

const ONBOARDING_STEPS = [
  { id: 1, name: 'Welcome', component: WelcomeStep },
  { id: 2, name: 'Personal Info', component: PersonalInfoStep },
  { id: 3, name: 'Professional Summary', component: ProfessionalSummaryStep },
  { id: 4, name: 'Experience', component: ExperienceStep },
  { id: 5, name: 'Education', component: EducationStep },
  { id: 6, name: 'Skills', component: SkillsStep },
  { id: 7, name: 'Additional Info', component: AdditionalInfoStep },
  { id: 8, name: 'Complete', component: CompletionStep },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkUserAndOnboarding = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/');
          return;
        }

        // Check if user has already completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, onboarding_current_step')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No profile found - this is expected for new users
            console.log('No profile found for user, starting fresh onboarding');
          } else if (profileError.message?.includes('relation "public.user_profiles" does not exist')) {
            console.error('Database tables not set up. Please run the migration SQL in Supabase.');
            setError('Database setup required. Please run the migration in Supabase SQL editor.');
            setLoading(false);
            return;
          } else {
            console.error('Error fetching profile:', profileError);
          }
        }

        if (profile?.onboarding_completed) {
          router.push('/dashboard');
          return;
        }

        // Resume from last step if available
        if (profile?.onboarding_current_step) {
          setCurrentStep(profile.onboarding_current_step);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/');
      }
    };

    checkUserAndOnboarding();
  }, [mounted, router]);

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Save current step to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ onboarding_current_step: nextStep })
          .eq('user_id', user.id);
      }
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Save current step to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ onboarding_current_step: prevStep })
          .eq('user_id', user.id);
      }
    }
  };

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    }
    router.push('/dashboard');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Database Setup Required</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <div className="mt-6 space-y-3">
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-gray-900 mb-2">To fix this:</p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Go to your Supabase dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Run the migration from <code className="bg-gray-200 px-1 rounded">/supabase/migrations/001_onboarding_schema.sql</code></li>
                </ol>
              </div>
              <button
                onClick={() => router.push('/')}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = ONBOARDING_STEPS[currentStep - 1].component;
  const progress = ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100;

  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">EZResume Onboarding</h1>
              <div className="text-sm text-gray-500">
                Step {currentStep} of {ONBOARDING_STEPS.length}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CurrentStepComponent 
            onNext={handleNext}
            onBack={handleBack}
            onComplete={handleComplete}
            isFirstStep={currentStep === 1}
            isLastStep={currentStep === ONBOARDING_STEPS.length}
          />
        </div>

        {/* Step Indicators */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            {ONBOARDING_STEPS.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step.id === currentStep
                    ? 'w-8 bg-indigo-600'
                    : step.id < currentStep
                    ? 'bg-indigo-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );
}