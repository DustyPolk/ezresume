'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import debounce from 'lodash/debounce';

interface EducationStepProps {
  onNext: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  location: string;
  graduationDate: string;
  gpa?: string;
  honors?: string;
}

const DEGREE_TYPES = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctoral Degree',
  'Professional Degree',
  'Certificate',
  'Bootcamp',
  'Other',
];

export function EducationStep({ onNext, onBack }: EducationStepProps) {
  const { data, addEducation: addToContext, updateEducation: updateInContext, removeEducation: removeFromContext, saveProgress } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [educations, setEducations] = useState<Education[]>(
    data.education.length > 0 
      ? data.education.map(edu => ({
          id: edu.id,
          school: edu.institution_name,
          degree: edu.degree_type,
          field: edu.field_of_study,
          location: edu.location || '',
          graduationDate: edu.graduation_date || '',
          gpa: edu.gpa?.toString() || '',
          honors: edu.honors_awards?.join(', ') || '',
        })) 
      : [{
          id: Date.now().toString(),
          school: '',
          degree: '',
          field: '',
          location: '',
          graduationDate: '',
          gpa: '',
          honors: '',
        }]
  );
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  // Auto-save with debouncing
  const debouncedSave = React.useMemo(
    () => debounce(async (eduData: Education[]) => {
      // Clear existing education
      data.education.forEach(edu => {
        removeFromContext(edu.id);
      });
      
      // Add all education
      eduData.forEach((edu, index) => {
        if (edu.school.trim() || edu.degree.trim()) {
          addToContext({
            institution_name: edu.school,
            degree_type: edu.degree,
            field_of_study: edu.field,
            location: edu.location,
            graduation_date: edu.graduationDate || undefined,
            gpa: edu.gpa ? parseFloat(edu.gpa) : undefined,
            honors_awards: edu.honors ? edu.honors.split(',').map(h => h.trim()).filter(Boolean) : undefined,
            order_index: index,
          });
        }
      });

      // Save to database (don't show saving indicator for auto-save)
      try {
        await saveProgress();
      } catch (error) {
        console.error('Error auto-saving education:', error);
      }
    }, 3000), // Increased to 3 seconds to reduce frequency
    [addToContext, removeFromContext, data.education, saveProgress]
  );

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    debouncedSave(educations);
  }, [educations]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
    
    // Clear error for this field
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
        school: '',
        degree: '',
        field: '',
        location: '',
        graduationDate: '',
        gpa: '',
        honors: '',
      },
    ]);
  };

  const removeEducation = (index: number) => {
    const updated = educations.filter((_, i) => i !== index);
    setEducations(updated.length > 0 ? updated : [{
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      location: '',
      graduationDate: '',
      gpa: '',
      honors: '',
    }]);
  };

  const validateForm = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let isValid = true;

    educations.forEach((edu, index) => {
      newErrors[index] = {};
      
      if (!edu.school?.trim()) {
        newErrors[index].school = 'School name is required';
        isValid = false;
      }
      if (!edu.degree?.trim()) {
        newErrors[index].degree = 'Degree is required';
        isValid = false;
      }
      if (!edu.field?.trim()) {
        newErrors[index].field = 'Field of study is required';
        isValid = false;
      }
      if (!edu.graduationDate) {
        newErrors[index].graduationDate = 'Graduation date is required';
        isValid = false;
      }
      
      // Validate GPA if provided
      if (edu.gpa && !/^[0-4](\.[0-9]{1,2})?$/.test(edu.gpa)) {
        newErrors[index].gpa = 'GPA must be between 0.00 and 4.00';
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
        await saveProgress();
        onNext();
      } catch (error) {
        console.error('Error saving education:', error);
        // Still proceed to next step even if save fails
        onNext();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSkip = async () => {
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="text-center w-full">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Education</h2>
            <p className="text-slate-600 text-lg">Add your educational background, starting with the most recent</p>
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

      {educations.map((edu, eduIndex) => (
        <div key={edu.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8 mb-6">
          {educations.length > 1 && (
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Education {eduIndex + 1}
              </h3>
              <button
                onClick={() => removeEducation(eduIndex)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}

          <div className="space-y-6">
            {/* School Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                School/Institution *
              </label>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => handleEducationChange(eduIndex, 'school', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors[eduIndex]?.school ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="e.g., University of California, Berkeley"
              />
              {errors[eduIndex]?.school && (
                <p className="mt-1 text-sm text-red-600">{errors[eduIndex].school}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Degree */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Degree *
                </label>
                <select
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(eduIndex, 'degree', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors[eduIndex]?.degree ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select degree type</option>
                  {DEGREE_TYPES.map((degree) => (
                    <option key={degree} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
                {errors[eduIndex]?.degree && (
                  <p className="mt-1 text-sm text-red-600">{errors[eduIndex].degree}</p>
                )}
              </div>

              {/* Field of Study */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Field of Study *
                </label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => handleEducationChange(eduIndex, 'field', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors[eduIndex]?.field ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="e.g., Computer Science"
                />
                {errors[eduIndex]?.field && (
                  <p className="mt-1 text-sm text-red-600">{errors[eduIndex].field}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={edu.location}
                  onChange={(e) => handleEducationChange(eduIndex, 'location', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Berkeley, CA"
                />
              </div>

              {/* Graduation Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Graduation Date *
                </label>
                <input
                  type="month"
                  value={edu.graduationDate}
                  onChange={(e) => handleEducationChange(eduIndex, 'graduationDate', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors[eduIndex]?.graduationDate ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors[eduIndex]?.graduationDate && (
                  <p className="mt-1 text-sm text-red-600">{errors[eduIndex].graduationDate}</p>
                )}
              </div>

              {/* GPA */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  GPA (Optional)
                </label>
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => handleEducationChange(eduIndex, 'gpa', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors[eduIndex]?.gpa ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="e.g., 3.85"
                />
                {errors[eduIndex]?.gpa && (
                  <p className="mt-1 text-sm text-red-600">{errors[eduIndex].gpa}</p>
                )}
              </div>

              {/* Honors */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Honors/Awards (Optional)
                </label>
                <input
                  type="text"
                  value={edu.honors || ''}
                  onChange={(e) => handleEducationChange(eduIndex, 'honors', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Magna Cum Laude, Dean's List"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addEducation}
        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 transform hover:scale-[1.02]"
      >
        + Add Another Education
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

export default EducationStep;