"use client";
import React, { useState } from 'react';
import { Skill } from '../../../types/resume';

interface SkillsSectionProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onChange }) => {
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Technical');

  const categories = ['Technical', 'Languages', 'Tools', 'Soft Skills', 'Other'];

  const addSkill = () => {
    if (newSkill.trim()) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.trim(),
        category: selectedCategory,
      };
      onChange([...skills, skill]);
      setNewSkill('');
    }
  };

  const deleteSkill = (id: string) => {
    onChange(skills.filter(skill => skill.id !== id));
  };


  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
        <p className="text-sm text-gray-600 mb-6">
          Add your relevant skills organized by category. Focus on skills that are most relevant to your target role.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            placeholder="Enter a skill (e.g., JavaScript, Project Management)"
          />
          <button
            onClick={addSkill}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Add Skill
          </button>
        </div>
      </div>

      {Object.keys(groupedSkills).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-gray-600">No skills added yet</p>
          <p className="text-sm text-gray-500 mt-1">Start adding your skills above</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map(skill => (
                  <div
                    key={skill.id}
                    className="group relative inline-flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:border-gray-400 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{skill.name}</span>
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Include a mix of hard skills (technical) and soft skills</li>
          <li>• Prioritize skills mentioned in the job description</li>
          <li>• Be honest about your skill levels</li>
          <li>• Keep your skills list relevant and concise</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillsSection;