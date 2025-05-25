'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import debounce from 'lodash/debounce';

interface SkillsStepProps {
  onNext: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

const SKILL_CATEGORIES = [
  'Technical',
  'Software',
  'Language',
  'Management',
  'Communication',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Other',
];

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-gray-200' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-200' },
  { value: 'advanced', label: 'Advanced', color: 'bg-indigo-200' },
  { value: 'expert', label: 'Expert', color: 'bg-purple-200' },
];

const COMMON_SKILLS = {
  Technical: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'Git'],
  Software: ['Microsoft Office', 'Google Workspace', 'Photoshop', 'Salesforce', 'SAP', 'Jira'],
  Language: ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic'],
  Management: ['Project Management', 'Team Leadership', 'Agile', 'Scrum', 'Strategic Planning'],
  Communication: ['Public Speaking', 'Writing', 'Presentation', 'Negotiation', 'Active Listening'],
};

export function SkillsStep({ onNext, onBack }: SkillsStepProps) {
  const { data, addSkill: addToContext, updateSkill: updateInContext, removeSkill: removeFromContext, saveProgress } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [skills, setSkills] = useState<Skill[]>(
    data.skills.length > 0 
      ? data.skills.map(skill => ({
          id: skill.id,
          name: skill.skill_name,
          level: (skill.proficiency_level || 'intermediate') as Skill['level'],
          category: skill.skill_category || 'Technical',
        }))
      : []
  );
  const [newSkill, setNewSkill] = useState({ name: '', category: '', level: 'intermediate' as const });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState('');

  // Map frontend categories to database categories
  const mapCategoryToDb = (category: string): 'technical' | 'soft' | 'language' | 'tool' => {
    const categoryMap: Record<string, 'technical' | 'soft' | 'language' | 'tool'> = {
      'technical': 'technical',
      'software': 'tool',
      'language': 'language',
      'management': 'soft',
      'communication': 'soft',
      'design': 'technical',
      'marketing': 'soft',
      'sales': 'soft',
      'finance': 'technical',
      'other': 'soft',
    };
    
    return categoryMap[category.toLowerCase()] || 'soft';
  };

  // Auto-save with debouncing
  const debouncedSave = React.useMemo(
    () => debounce(async (skillData: Skill[]) => {
      // Clear existing skills
      data.skills.forEach(skill => {
        removeFromContext(skill.id);
      });
      
      // Add all skills
      skillData.forEach(skill => {
        if (skill.name.trim()) {
          addToContext({
            skill_name: skill.name,
            skill_category: mapCategoryToDb(skill.category),
            proficiency_level: skill.level,
          });
        }
      });

      // Save to database (don't show saving indicator for auto-save)
      try {
        await saveProgress();
      } catch (error) {
        console.error('Error auto-saving skills:', error);
      }
    }, 3000), // Increased to 3 seconds to reduce frequency
    [addToContext, removeFromContext, data.skills, saveProgress]
  );

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    debouncedSave(skills);
  }, [skills]); // eslint-disable-line react-hooks/exhaustive-deps

  const addNewSkill = () => {
    const validationErrors: Record<string, string> = {};
    
    if (!newSkill.name.trim()) {
      validationErrors.name = 'Skill name is required';
    }
    if (!newSkill.category) {
      validationErrors.category = 'Please select a category';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check for duplicates
    if (skills.some(s => s.name.toLowerCase() === newSkill.name.trim().toLowerCase())) {
      setErrors({ name: 'This skill has already been added' });
      return;
    }

    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name.trim(),
      level: newSkill.level,
      category: newSkill.category,
    };

    setSkills([...skills, skill]);
    setNewSkill({ name: '', category: '', level: 'intermediate' });
    setErrors({});
  };

  const removeSkillFromList = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const updateSkillLevel = (id: string, level: Skill['level']) => {
    setSkills(skills.map(s => s.id === id ? { ...s, level } : s));
  };

  const addSuggestedSkill = (skillName: string, category: string) => {
    if (skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      return; // Already added
    }

    const skill: Skill = {
      id: Date.now().toString(),
      name: skillName,
      level: 'intermediate',
      category,
    };

    setSkills([...skills, skill]);
  };

  const validateForm = () => {
    if (skills.length === 0) {
      setErrors({ general: 'Please add at least one skill' });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (validateForm()) {
      setIsSaving(true);
      try {
        // Clear existing skills
        data.skills.forEach(skill => {
          removeFromContext(skill.id);
        });
        
        // Add all current skills
        skills.forEach(skill => {
          if (skill.name.trim()) {
            addToContext({
              skill_name: skill.name,
              skill_category: mapCategoryToDb(skill.category),
              proficiency_level: skill.level,
            });
          }
        });
        
        // Save to database
        await saveProgress();
        onNext();
      } catch (error) {
        console.error('Error saving skills:', error);
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

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills</h2>
            <p className="text-gray-600">Add your relevant skills and expertise levels</p>
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

      {/* Add New Skill */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Skill</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Name *
            </label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => {
                setNewSkill({ ...newSkill, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., JavaScript"
              onKeyPress={(e) => e.key === 'Enter' && addNewSkill()}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={newSkill.category}
              onChange={(e) => {
                setNewSkill({ ...newSkill, category: e.target.value });
                if (errors.category) setErrors({ ...errors, category: '' });
              }}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proficiency Level
            </label>
            <select
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as Skill['level'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {SKILL_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={addNewSkill}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-150 hover:scale-105"
        >
          Add Skill
        </button>

        {errors.general && (
          <p className="mt-2 text-sm text-red-600">{errors.general}</p>
        )}
      </div>

      {/* Suggested Skills */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Skills</h3>
        <div className="mb-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {Object.keys(COMMON_SKILLS).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(COMMON_SKILLS)
            .filter(([category]) => !selectedCategory || category === selectedCategory)
            .flatMap(([category, skillList]) =>
              skillList.map((skill) => ({
                name: skill,
                category,
                added: skills.some(s => s.name.toLowerCase() === skill.toLowerCase()),
              }))
            )
            .map((skill) => (
              <button
                key={`${skill.category}-${skill.name}`}
                onClick={() => !skill.added && addSuggestedSkill(skill.name, skill.category)}
                disabled={skill.added}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  skill.added
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                }`}
              >
                {skill.added && '✓ '}{skill.name}
              </button>
            ))}
        </div>
      </div>

      {/* Current Skills */}
      {skills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills ({skills.length})</h3>
          
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h4 className="text-md font-medium text-gray-700 mb-3">{category}</h4>
              <div className="space-y-2">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {SKILL_LEVELS.map((level) => (
                          <button
                            key={level.value}
                            onClick={() => updateSkillLevel(skill.id, level.value as Skill['level'])}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              skill.level === level.value
                                ? `${level.color} text-gray-800`
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                            }`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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

export default SkillsStep;