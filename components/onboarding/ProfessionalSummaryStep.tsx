'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import debounce from 'lodash/debounce';

interface ProfessionalSummaryStepProps {
  onNext: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-7 years)' },
  { value: 'senior', label: 'Senior Level (8-15 years)' },
  { value: 'executive', label: 'Executive (15+ years)' },
];

const COMMON_INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Sales',
  'Engineering',
  'Design',
  'Consulting',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'Real Estate',
  'Legal',
  'Non-profit',
  'Government',
  'Media',
  'Transportation',
  'Construction',
  'Other',
];

export function ProfessionalSummaryStep({ onNext, onBack }: ProfessionalSummaryStepProps) {
  const { data, updatePersonalInfo, saveProgress } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    professional_headline: data.personalInfo.professional_headline || '',
    years_of_experience: data.personalInfo.years_of_experience || 0,
    professional_summary: data.personalInfo.professional_summary || '',
    target_roles: data.personalInfo.target_roles || [],
    target_industries: data.personalInfo.target_industries || [],
  });
  const [showOtherIndustry, setShowOtherIndustry] = useState(false);

  // Auto-save with debouncing (don't show saving indicator for auto-save)
  const debouncedSave = React.useMemo(
    () => debounce(async (data: typeof formData) => {
      updatePersonalInfo(data);
      try {
        await saveProgress();
      } catch (error) {
        console.error('Error auto-saving professional summary:', error);
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

  const handleIndustryChange = (industry: string) => {
    if (industry === 'Other') {
      setShowOtherIndustry(true);
      handleChange('target_industries', [...(formData.target_industries || [])]);
    } else {
      const current = formData.target_industries || [];
      if (current.includes(industry)) {
        handleChange('target_industries', current.filter(i => i !== industry));
      } else {
        handleChange('target_industries', [...current, industry]);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.professional_headline?.trim()) {
      newErrors.professional_headline = 'Professional headline is required';
    }
    if (formData.years_of_experience === undefined || formData.years_of_experience === null) {
      newErrors.years_of_experience = 'Please select your experience level';
    }
    if (!formData.professional_summary?.trim()) {
      newErrors.professional_summary = 'Professional summary is required';
    } else if (formData.professional_summary.trim().length < 50) {
      newErrors.professional_summary = 'Summary should be at least 50 characters';
    }
    if (!formData.target_roles || formData.target_roles.length === 0) {
      newErrors.target_roles = 'Target roles are required';
    }
    if (!formData.target_industries || formData.target_industries.length === 0) {
      newErrors.target_industries = 'Please select at least one industry';
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
        console.error('Error saving professional summary:', error);
        // Still proceed to next step even if save fails
        onNext();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSkip = async () => {
    // Cancel any pending auto-save
    debouncedSave.cancel();
    
    // Save minimal data and move to next step
    updatePersonalInfo({
      ...formData,
      professional_headline: formData.professional_headline || 'Professional',
      years_of_experience: formData.years_of_experience || 5,
      professional_summary: formData.professional_summary || '',
      target_roles: formData.target_roles || [],
      target_industries: formData.target_industries || [],
    });
    setIsSaving(true);
    try {
      await saveProgress();
    } catch (error) {
      console.error('Error saving during skip:', error);
    } finally {
      setIsSaving(false);
    }
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Summary</h2>
            <p className="text-gray-600">Tell us about your professional background and goals</p>
          </div>
          {isSaving && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Professional Headline */}
          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
              Professional Headline *
            </label>
            <input
              type="text"
              id="headline"
              value={formData.professional_headline || ''}
              onChange={(e) => handleChange('professional_headline', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.professional_headline ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Senior Software Engineer, Marketing Manager, Data Analyst"
            />
            {errors.professional_headline && (
              <p className="mt-1 text-sm text-red-600">{errors.professional_headline}</p>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => {
                    const yearsMap = { entry: 1, mid: 5, senior: 10, executive: 20 };
                    handleChange('years_of_experience', yearsMap[level.value as keyof typeof yearsMap]);
                  }}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    (formData.years_of_experience <= 2 && level.value === 'entry') ||
                    (formData.years_of_experience > 2 && formData.years_of_experience <= 7 && level.value === 'mid') ||
                    (formData.years_of_experience > 7 && formData.years_of_experience <= 15 && level.value === 'senior') ||
                    (formData.years_of_experience > 15 && level.value === 'executive')
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
            {errors.years_of_experience && (
              <p className="mt-1 text-sm text-red-600">{errors.years_of_experience}</p>
            )}
          </div>

          {/* Professional Summary */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary *
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Write 2-3 sentences about your experience, skills, and what you bring to employers
            </p>
            <textarea
              id="summary"
              value={formData.professional_summary || ''}
              onChange={(e) => handleChange('professional_summary', e.target.value)}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.professional_summary ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Experienced professional with expertise in..."
            />
            {errors.professional_summary && (
              <p className="mt-1 text-sm text-red-600">{errors.professional_summary}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.professional_summary?.length || 0} characters
            </p>
          </div>

          {/* Target Roles */}
          <div>
            <label htmlFor="targetRoles" className="block text-sm font-medium text-gray-700 mb-2">
              Target Roles *
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Separate multiple roles with commas
            </p>
            <input
              type="text"
              id="targetRoles"
              value={formData.target_roles?.join(', ') || ''}
              onChange={(e) => {
                // Only split by comma when there's actually a comma in the input
                const value = e.target.value;
                if (value.includes(',')) {
                  handleChange('target_roles', value.split(',').map(s => s.trim()).filter(Boolean));
                } else {
                  // For single values without commas, just store as array with one item
                  handleChange('target_roles', value ? [value] : []);
                }
              }}
              onBlur={(e) => {
                // On blur, properly split and trim all values
                const value = e.target.value;
                handleChange('target_roles', value.split(',').map(s => s.trim()).filter(Boolean));
              }}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.target_roles ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
            />
            {errors.target_roles && (
              <p className="mt-1 text-sm text-red-600">{errors.target_roles}</p>
            )}
          </div>

          {/* Target Industries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Industries * (Select all that apply)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_INDUSTRIES.map((industry) => (
                <label
                  key={industry}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.target_industries?.includes(industry) || false}
                    onChange={() => handleIndustryChange(industry)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{industry}</span>
                </label>
              ))}
            </div>
            {showOtherIndustry && (
              <input
                type="text"
                value={''}
                onChange={(e) => handleChange('otherIndustry', e.target.value)}
                className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Please specify other industry"
              />
            )}
            {errors.target_industries && (
              <p className="mt-1 text-sm text-red-600">{errors.target_industries}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-150 hover:scale-105"
        >
          ← Back
        </button>
        <div className="space-x-3">
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            Skip for now
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-150 hover:scale-105"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalSummaryStep;