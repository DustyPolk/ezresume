"use client";
import React, { useState } from 'react';
import { Experience } from '../../../types/resume';
import { inputStyles } from '../../../lib/styles';
import LocationSelect from '../../ui/LocationSelect';

interface ExperienceSectionProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences, onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      highlights: [],
    };
    onChange([...experiences, newExperience]);
    setExpandedId(newExperience.id);
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    onChange(experiences.map(exp => exp.id === id ? { ...exp, ...updates } : exp));
  };

  const deleteExperience = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id));
  };

  const addHighlight = (experienceId: string) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (experience) {
      updateExperience(experienceId, {
        highlights: [...experience.highlights, ''],
      });
    }
  };

  const updateHighlight = (experienceId: string, index: number, value: string) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (experience) {
      const newHighlights = [...experience.highlights];
      newHighlights[index] = value;
      updateExperience(experienceId, { highlights: newHighlights });
    }
  };

  const deleteHighlight = (experienceId: string, index: number) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (experience) {
      updateExperience(experienceId, {
        highlights: experience.highlights.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Work Experience</h2>
        <p className="text-sm text-gray-600 mb-6">
          List your work experience in reverse chronological order, starting with your most recent position.
        </p>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 mb-4">No work experience added yet</p>
          <button
            onClick={addExperience}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Add Your First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience) => (
            <div key={experience.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedId(expandedId === experience.id ? null : experience.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {experience.position || 'Position'} at {experience.company || 'Company'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {experience.startDate || 'Start'} - {experience.current ? 'Present' : experience.endDate || 'End'}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === experience.id ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedId === experience.id && (
                <div className="p-6 border-t border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={experience.company}
                        onChange={(e) => updateExperience(experience.id, { company: e.target.value })}
                        className={inputStyles}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={experience.position}
                        onChange={(e) => updateExperience(experience.id, { position: e.target.value })}
                        className={inputStyles}
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <LocationSelect
                      value={experience.location}
                      onChange={(value) => updateExperience(experience.id, { location: value })}
                      placeholder="Select or type a location..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="month"
                        value={experience.startDate}
                        onChange={(e) => updateExperience(experience.id, { startDate: e.target.value })}
                        className={inputStyles}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <div className="space-y-2">
                        <input
                          type="month"
                          value={experience.endDate}
                          onChange={(e) => updateExperience(experience.id, { endDate: e.target.value })}
                          disabled={experience.current}
                          className={`${inputStyles} disabled:bg-gray-100`}
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={experience.current}
                            onChange={(e) => updateExperience(experience.id, { current: e.target.checked, endDate: '' })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">I currently work here</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description
                    </label>
                    <textarea
                      value={experience.description}
                      onChange={(e) => updateExperience(experience.id, { description: e.target.value })}
                      rows={3}
                      className={`${inputStyles} resize-none`}
                      placeholder="Describe your role and responsibilities..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Key Achievements & Highlights
                      </label>
                      <button
                        onClick={() => addHighlight(experience.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        + Add Highlight
                      </button>
                    </div>
                    <div className="space-y-2">
                      {experience.highlights.map((highlight, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => updateHighlight(experience.id, index, e.target.value)}
                            className={`flex-1 ${inputStyles.replace('w-full', '')}`}
                            placeholder="• Led team of 5 engineers to deliver project 2 weeks ahead of schedule"
                          />
                          <button
                            onClick={() => deleteHighlight(experience.id, index)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={() => deleteExperience(experience.id)}
                      className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete Experience
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addExperience}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            + Add Another Experience
          </button>
        </div>
      )}
    </div>
  );
};

export default ExperienceSection;