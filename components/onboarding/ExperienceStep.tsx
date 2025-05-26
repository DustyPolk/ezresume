'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import debounce from 'lodash/debounce';

interface ExperienceStepProps {
  onNext: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

interface ExperienceForm {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

export function ExperienceStep({ onNext, onBack }: ExperienceStepProps) {
  const { data, addExperience: addToContext, updateExperience: updateInContext, removeExperience: removeFromContext, saveProgress } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [experiences, setExperiences] = useState<ExperienceForm[]>(
    data.experiences.length > 0 
      ? data.experiences.map(exp => ({
          id: exp.id,
          company: exp.company_name,
          position: exp.job_title,
          location: exp.location || '',
          startDate: exp.start_date,
          endDate: exp.end_date || '',
          current: exp.is_current,
          responsibilities: exp.key_achievements || [''],
        }))
      : [{
          id: Date.now().toString(),
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          responsibilities: [''],
        }]
  );
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  // Auto-save with debouncing
  const debouncedSave = React.useMemo(
    () => debounce(async (expData: ExperienceForm[]) => {
      // Clear existing experiences
      data.experiences.forEach(exp => {
        removeFromContext(exp.id);
      });
      
      // Add all experiences
      expData.forEach((exp, index) => {
        // Only save experiences that have required fields
        if (exp.company.trim() && exp.position.trim() && exp.startDate) {
          addToContext({
            company_name: exp.company,
            job_title: exp.position,
            location: exp.location,
            start_date: exp.startDate,
            end_date: exp.endDate || undefined,
            is_current: exp.current,
            key_achievements: exp.responsibilities.filter(r => r.trim()),
            order_index: index,
          });
        }
      });

      // Save to database (don't show saving indicator for auto-save)
      try {
        await saveProgress();
      } catch (error) {
        console.error('Error auto-saving experiences:', error);
      }
    }, 3000), // Increased to 3 seconds to reduce frequency
    [addToContext, removeFromContext, data.experiences, saveProgress]
  );

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    debouncedSave(experiences);
  }, [experiences]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExperienceChange = (index: number, field: keyof ExperienceForm, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    
    // Handle current employment checkbox
    if (field === 'current' && value === true) {
      updated[index].endDate = '';
    }
    
    setExperiences(updated);
    
    // Clear error when user starts typing
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const handleResponsibilityChange = (expIndex: number, respIndex: number, value: string) => {
    const updated = [...experiences];
    updated[expIndex].responsibilities[respIndex] = value;
    setExperiences(updated);
  };

  const addResponsibility = (expIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].responsibilities.push('');
    setExperiences(updated);
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].responsibilities.splice(respIndex, 1);
    setExperiences(updated);
  };

  const addNewExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        responsibilities: [''],
      },
    ]);
  };

  const removeExperience = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated.length > 0 ? updated : [{
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      responsibilities: [''],
    }]);
  };

  const validateForm = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let isValid = true;

    experiences.forEach((exp, index) => {
      newErrors[index] = {};
      
      if (!exp.company?.trim()) {
        newErrors[index].company = 'Company name is required';
        isValid = false;
      }
      if (!exp.position?.trim()) {
        newErrors[index].position = 'Position is required';
        isValid = false;
      }
      if (!exp.startDate) {
        newErrors[index].startDate = 'Start date is required';
        isValid = false;
      }
      if (!exp.current && !exp.endDate) {
        newErrors[index].endDate = 'End date is required';
        isValid = false;
      }
      
      // At least one responsibility
      const hasResponsibility = exp.responsibilities.some(r => r.trim());
      if (!hasResponsibility) {
        newErrors[index].responsibilities = 'At least one responsibility is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    if (validateForm()) {
      setIsSaving(true);
      try {
        // Clear existing experiences
        data.experiences.forEach(exp => {
          removeFromContext(exp.id);
        });
        
        // Add all valid experiences
        experiences.forEach((exp, index) => {
          if (exp.company.trim() && exp.position.trim() && exp.startDate) {
            addToContext({
              company_name: exp.company,
              job_title: exp.position,
              location: exp.location,
              start_date: exp.startDate,
              end_date: exp.endDate || undefined,
              is_current: exp.current,
              key_achievements: exp.responsibilities.filter(r => r.trim()),
              order_index: index,
            });
          }
        });
        
        await saveProgress();
        onNext();
      } catch (error) {
        console.error('Error saving experiences:', error);
        // Still proceed to next step even if save fails
        onNext();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="text-center w-full">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Work Experience</h2>
            <p className="text-slate-600 text-lg">Add your relevant work experience, starting with the most recent</p>
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

      {experiences.map((exp, expIndex) => (
        <div key={exp.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8 mb-6">
          {experiences.length > 1 && (
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Experience {expIndex + 1}
              </h3>
              <button
                onClick={() => removeExperience(expIndex)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleExperienceChange(expIndex, 'company', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors[expIndex]?.company ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Company Name"
              />
              {errors[expIndex]?.company && (
                <p className="mt-1 text-sm text-red-600">{errors[expIndex].company}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Position *
              </label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => handleExperienceChange(expIndex, 'position', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors[expIndex]?.position ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Job Title"
              />
              {errors[expIndex]?.position && (
                <p className="mt-1 text-sm text-red-600">{errors[expIndex].position}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) => handleExperienceChange(expIndex, 'location', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="City, State"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Date *
              </label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(expIndex, 'startDate', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors[expIndex]?.startDate ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors[expIndex]?.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors[expIndex].startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Date {!exp.current && '*'}
              </label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(expIndex, 'endDate', e.target.value)}
                disabled={exp.current}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors[expIndex]?.endDate ? 'border-red-500' : 'border-slate-300'
                } ${exp.current ? 'bg-slate-100' : ''}`}
              />
              {errors[expIndex]?.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors[expIndex].endDate}</p>
              )}
            </div>

            {/* Current Position */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`current-${expIndex}`}
                checked={exp.current}
                onChange={(e) => handleExperienceChange(expIndex, 'current', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor={`current-${expIndex}`} className="ml-2 block text-sm text-slate-900">
                I currently work here
              </label>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Key Responsibilities & Achievements *
            </label>
            <p className="text-sm text-slate-500 mb-3">
              Describe your key achievements and responsibilities. Use action verbs and quantify results when possible.
            </p>
            {exp.responsibilities.map((resp, respIndex) => (
              <div key={respIndex} className="flex items-start mb-3">
                <span className="text-slate-400 mr-3 mt-2">•</span>
                <textarea
                  value={resp}
                  onChange={(e) => handleResponsibilityChange(expIndex, respIndex, e.target.value)}
                  rows={2}
                  className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Led a team of 5 engineers to deliver a new feature that increased user engagement by 25%"
                />
                {exp.responsibilities.length > 1 && (
                  <button
                    onClick={() => removeResponsibility(expIndex, respIndex)}
                    className="ml-3 text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {errors[expIndex]?.responsibilities && (
              <p className="mt-1 text-sm text-red-600">{errors[expIndex].responsibilities}</p>
            )}
            <button
              onClick={() => addResponsibility(expIndex)}
              className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              + Add another responsibility
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addNewExperience}
        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 transform hover:scale-[1.02]"
      >
        + Add Another Experience
      </button>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-150 hover:scale-105 shadow-lg"
        >
          ← Back
        </button>
        <div className="space-x-3">
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-slate-500 hover:text-slate-700 focus:outline-none transition-colors duration-200"
          >
            Skip for now
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-150 hover:scale-105 shadow-lg"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExperienceStep;