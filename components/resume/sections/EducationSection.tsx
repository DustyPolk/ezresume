"use client";
import React, { useState } from 'react';
import { Education } from '../../../types/resume';
import { inputStyles } from '../../../lib/styles';

interface EducationSectionProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({ education, onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingEducation, setEditingEducation] = useState<Record<string, Education>>({});
  const [newEducationId, setNewEducationId] = useState<string | null>(null);

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      highlights: [],
    };
    setEditingEducation(prev => ({ ...prev, [newEducation.id]: newEducation }));
    setNewEducationId(newEducation.id);
    setExpandedId(newEducation.id);
  };

  const saveEducation = (id: string) => {
    const educationToSave = editingEducation[id];
    if (educationToSave) {
      if (newEducationId === id) {
        // Adding new education
        onChange([...education, educationToSave]);
        setNewEducationId(null);
      } else {
        // Updating existing education
        onChange(education.map(edu => edu.id === id ? educationToSave : edu));
      }
      // Remove from editing state
      const newEditingState = { ...editingEducation };
      delete newEditingState[id];
      setEditingEducation(newEditingState);
      
      // Close the expanded section after saving
      setExpandedId(null);
    }
  };

  const cancelEdit = (id: string) => {
    if (newEducationId === id) {
      setNewEducationId(null);
    }
    const newEditingState = { ...editingEducation };
    delete newEditingState[id];
    setEditingEducation(newEditingState);
    setExpandedId(null);
  };

  const startEdit = (edu: Education) => {
    setEditingEducation(prev => ({ ...prev, [edu.id]: { ...edu } }));
    setExpandedId(edu.id);
  };

  const updateEditingEducation = (id: string, updates: Partial<Education>) => {
    setEditingEducation(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const deleteEducation = (id: string) => {
    // If this is a new education that hasn't been saved yet, just cancel
    if (newEducationId === id) {
      cancelEdit(id);
      return;
    }
    
    // Delete from the actual education list
    onChange(education.filter(edu => edu.id !== id));
    
    // Clean up any editing state
    if (editingEducation[id]) {
      const newEditingState = { ...editingEducation };
      delete newEditingState[id];
      setEditingEducation(newEditingState);
    }
    
    // Clear expanded state
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const addHighlight = (educationId: string) => {
    const edu = editingEducation[educationId] || education.find(e => e.id === educationId);
    if (edu) {
      const updates = { highlights: [...edu.highlights, ''] };
      if (editingEducation[educationId]) {
        updateEditingEducation(educationId, updates);
      } else {
        setEditingEducation(prev => ({ ...prev, [educationId]: { ...edu, ...updates } }));
      }
    }
  };

  const updateHighlight = (educationId: string, index: number, value: string) => {
    const edu = editingEducation[educationId] || education.find(e => e.id === educationId);
    if (edu) {
      const newHighlights = [...edu.highlights];
      newHighlights[index] = value;
      const updates = { highlights: newHighlights };
      if (editingEducation[educationId]) {
        updateEditingEducation(educationId, updates);
      } else {
        setEditingEducation(prev => ({ ...prev, [educationId]: { ...edu, ...updates } }));
      }
    }
  };

  const deleteHighlight = (educationId: string, index: number) => {
    const edu = editingEducation[educationId] || education.find(e => e.id === educationId);
    if (edu) {
      const updates = { highlights: edu.highlights.filter((_, i) => i !== index) };
      if (editingEducation[educationId]) {
        updateEditingEducation(educationId, updates);
      } else {
        setEditingEducation(prev => ({ ...prev, [educationId]: { ...edu, ...updates } }));
      }
    }
  };

  const getEducationData = (id: string): Education | undefined => {
    return editingEducation[id] || education.find(e => e.id === id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
        <p className="text-sm text-gray-600 mb-6">
          Add your educational background, starting with your highest degree.
        </p>
      </div>

      {education.length === 0 && !newEducationId ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <p className="text-gray-600 mb-4">No education added yet</p>
          <button
            onClick={addEducation}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Add Education
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Show existing education */}
          {education.map((edu) => {
            const isEditing = !!editingEducation[edu.id];
            const displayEdu = getEducationData(edu.id) || edu;
            
            return (
              <div key={edu.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => !isEditing && (expandedId === edu.id ? setExpandedId(null) : startEdit(edu))}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {displayEdu.degree || 'Degree'} in {displayEdu.field || 'Field of Study'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {displayEdu.institution || 'Institution'} • {displayEdu.startDate || 'Start'} - {displayEdu.endDate || 'End'}
                      </p>
                    </div>
                    {!isEditing && (
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedId === edu.id ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>

                {expandedId === edu.id && (
                  <div className="p-6 border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution Name *
                      </label>
                      <input
                        type="text"
                        value={displayEdu.institution}
                        onChange={(e) => updateEditingEducation(edu.id, { institution: e.target.value })}
                        className={inputStyles}
                        placeholder="University of California, Berkeley"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Degree *
                        </label>
                        <input
                          type="text"
                          value={displayEdu.degree}
                          onChange={(e) => updateEditingEducation(edu.id, { degree: e.target.value })}
                          className={inputStyles}
                          placeholder="Bachelor of Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field of Study *
                        </label>
                        <input
                          type="text"
                          value={displayEdu.field}
                          onChange={(e) => updateEditingEducation(edu.id, { field: e.target.value })}
                          className={inputStyles}
                          placeholder="Computer Science"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={displayEdu.location}
                          onChange={(e) => updateEditingEducation(edu.id, { location: e.target.value })}
                          className={inputStyles}
                          placeholder="Berkeley, CA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GPA (Optional)
                        </label>
                        <input
                          type="text"
                          value={displayEdu.gpa || ''}
                          onChange={(e) => updateEditingEducation(edu.id, { gpa: e.target.value })}
                          className={inputStyles}
                          placeholder="3.8/4.0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="month"
                          value={displayEdu.startDate}
                          onChange={(e) => updateEditingEducation(edu.id, { startDate: e.target.value })}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date (or Expected)
                        </label>
                        <input
                          type="month"
                          value={displayEdu.endDate}
                          onChange={(e) => updateEditingEducation(edu.id, { endDate: e.target.value })}
                          className={inputStyles}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Honors & Activities
                        </label>
                        <button
                          onClick={() => addHighlight(edu.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          + Add Item
                        </button>
                      </div>
                      <div className="space-y-2">
                        {displayEdu.highlights.map((highlight, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={highlight}
                              onChange={(e) => updateHighlight(edu.id, index, e.target.value)}
                              className={`flex-1 ${inputStyles.replace('w-full', '')}`}
                              placeholder="• Dean's List, Fall 2022"
                            />
                            <button
                              onClick={() => deleteHighlight(edu.id, index)}
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

                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() => deleteEducation(edu.id)}
                        className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete Education
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => cancelEdit(edu.id)}
                          className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEducation(edu.id)}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Show new education being added */}
          {newEducationId && editingEducation[newEducationId] && (
            <div className="border-2 border-indigo-300 rounded-lg overflow-hidden bg-indigo-50">
              <div className="p-4 bg-indigo-100">
                <h3 className="font-medium text-gray-900">New Education Entry</h3>
              </div>
              <div className="p-6 bg-white border-t border-indigo-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    value={editingEducation[newEducationId].institution}
                    onChange={(e) => updateEditingEducation(newEducationId, { institution: e.target.value })}
                    className={inputStyles}
                    placeholder="University of California, Berkeley"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degree *
                    </label>
                    <input
                      type="text"
                      value={editingEducation[newEducationId].degree}
                      onChange={(e) => updateEditingEducation(newEducationId, { degree: e.target.value })}
                      className={inputStyles}
                      placeholder="Bachelor of Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Study *
                    </label>
                    <input
                      type="text"
                      value={editingEducation[newEducationId].field}
                      onChange={(e) => updateEditingEducation(newEducationId, { field: e.target.value })}
                      className={inputStyles}
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingEducation[newEducationId].location}
                      onChange={(e) => updateEditingEducation(newEducationId, { location: e.target.value })}
                      className={inputStyles}
                      placeholder="Berkeley, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPA (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingEducation[newEducationId].gpa || ''}
                      onChange={(e) => updateEditingEducation(newEducationId, { gpa: e.target.value })}
                      className={inputStyles}
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="month"
                      value={editingEducation[newEducationId].startDate}
                      onChange={(e) => updateEditingEducation(newEducationId, { startDate: e.target.value })}
                      className={inputStyles}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (or Expected)
                    </label>
                    <input
                      type="month"
                      value={editingEducation[newEducationId].endDate}
                      onChange={(e) => updateEditingEducation(newEducationId, { endDate: e.target.value })}
                      className={inputStyles}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => cancelEdit(newEducationId)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveEducation(newEducationId)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Save Education
                  </button>
                </div>
              </div>
            </div>
          )}

          {!newEducationId && (
            <button
              onClick={addEducation}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + Add Another Education
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EducationSection;