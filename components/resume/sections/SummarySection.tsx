"use client";
import React from 'react';

interface SummarySectionProps {
  summary: string;
  onChange: (summary: string) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
        <p className="text-sm text-gray-600 mb-6">
          Write a brief summary that highlights your professional background and key achievements.
          Keep it concise and impactful - aim for 2-3 sentences.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Summary
        </label>
        <textarea
          value={summary || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
          placeholder="Experienced software engineer with 5+ years developing scalable web applications. Proven track record of leading cross-functional teams and delivering high-quality solutions on time and within budget."
        />
        <div className="mt-2 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {summary ? `${summary.split(' ').length} words` : '0 words'}
          </p>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Get AI Suggestions
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tip</h3>
        <p className="text-sm text-blue-700">
          Tailor your summary to the specific job you&apos;re applying for. Include keywords from the job description
          and highlight relevant accomplishments that align with the role.
        </p>
      </div>
    </div>
  );
};

export default SummarySection;