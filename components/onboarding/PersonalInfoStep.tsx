'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import LocationSelectAsync from '@/components/ui/LocationSelectAsync';
import debounce from 'lodash/debounce';

interface PersonalInfoStepProps {
  onNext: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export function PersonalInfoStep({ onNext, onBack }: PersonalInfoStepProps) {
  const { data, updatePersonalInfo, saveProgress } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    full_name: data.personalInfo.full_name || '',
    email: data.personalInfo.email || '',
    phone: data.personalInfo.phone || '',
    location: data.personalInfo.location || '',
    linkedin_url: data.personalInfo.linkedin_url || '',
    website_url: data.personalInfo.website_url || '',
  });

  // Auto-save with debouncing (don't show saving indicator for auto-save)
  const debouncedSave = React.useMemo(
    () => debounce(async (data: typeof formData) => {
      updatePersonalInfo(data);
      try {
        await saveProgress();
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error auto-saving personal info:', error);
      }
    }, 3000), // Increased to 3 seconds to reduce frequency
    [updatePersonalInfo, saveProgress]
  );

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    debouncedSave(formData);
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateForm()) {
      // Cancel any pending auto-save
      debouncedSave.cancel();
      
      updatePersonalInfo(formData);
      setIsSaving(true);
      try {
        await saveProgress();
        onNext();
      } catch (error) {
        console.error('Error saving personal info:', error);
        // Still proceed to next step even if save fails
        onNext();
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent mb-2">
                Personal Information
              </h2>
              <p className="text-slate-600">Let&apos;s start with your contact details</p>
            </div>
            <div className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-indigo-100">
              {isSaving ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : lastSaved ? (
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Auto-saved
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-xl shadow-sm border border-indigo-100 p-8">
          <div className="space-y-6">
            {/* Full Name */}
            <div className="group">
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300 ${
                  errors.full_name ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="John Doe"
              />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300 ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="group">
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300 ${
                  errors.phone ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Location */}
            <div className="group">
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-2">
                Location *
              </label>
              <LocationSelectAsync
                value={formData.location}
                onChange={(value) => handleChange('location', value)}
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="group">
              <label htmlFor="linkedin" className="block text-sm font-semibold text-slate-700 mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                id="linkedin"
                value={formData.linkedin_url || ''}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300"
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            {/* Portfolio */}
            <div className="group">
              <label htmlFor="portfolio" className="block text-sm font-semibold text-slate-700 mb-2">
                Portfolio/Website
              </label>
              <input
                type="url"
                id="portfolio"
                value={formData.website_url || ''}
                onChange={(e) => handleChange('website_url', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300"
                placeholder="https://johndoe.com"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={onBack}
            className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-md"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonalInfoStep;