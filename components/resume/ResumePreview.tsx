"use client";
import React from 'react';
import { ResumeData } from '../../types/resume';

interface ResumePreviewProps {
  resumeData: ResumeData;
  template: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ minHeight: '11in', width: '8.5in', margin: '0 auto' }}>
      <div className="p-8">
        {/* Header/Contact Section */}
        <header className="mb-6 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {resumeData.contact.fullName || 'Your Name'}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            {resumeData.contact.email && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {resumeData.contact.email}
              </span>
            )}
            {resumeData.contact.phone && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {resumeData.contact.phone}
              </span>
            )}
            {resumeData.contact.location && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {resumeData.contact.location}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700 mt-2">
            {resumeData.contact.linkedin && (
              <a href={resumeData.contact.linkedin} className="text-blue-600 hover:underline">
                LinkedIn
              </a>
            )}
            {resumeData.contact.github && (
              <a href={resumeData.contact.github} className="text-blue-600 hover:underline">
                GitHub
              </a>
            )}
            {resumeData.contact.website && (
              <a href={resumeData.contact.website} className="text-blue-600 hover:underline">
                Portfolio
              </a>
            )}
          </div>
        </header>

        {/* Professional Summary */}
        {resumeData.summary && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
              Professional Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {resumeData.summary}
            </p>
          </section>
        )}

        {/* Experience Section */}
        {resumeData.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wide">
              Professional Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-sm text-gray-700">
                        {exp.company}
                        {exp.location && ` • ${exp.location}`}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-700 mb-2">{exp.description}</p>
                  )}
                  {exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {exp.highlights.filter(h => h.trim()).map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {resumeData.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wide">
              Education
            </h2>
            <div className="space-y-3">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {edu.institution}
                        {edu.location && ` • ${edu.location}`}
                        {edu.gpa && ` • GPA: ${edu.gpa}`}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </span>
                  </div>
                  {edu.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-1">
                      {edu.highlights.filter(h => h.trim()).map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {resumeData.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wide">
              Skills
            </h2>
            <div className="space-y-2">
              {Object.entries(
                resumeData.skills.reduce((acc, skill) => {
                  const category = skill.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(skill);
                  return acc;
                }, {} as Record<string, typeof resumeData.skills>)
              ).map(([category, skills]) => (
                <div key={category}>
                  <span className="font-medium text-gray-800">{category}: </span>
                  <span className="text-sm text-gray-700">
                    {skills.map(s => s.name).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;