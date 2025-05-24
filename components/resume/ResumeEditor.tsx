"use client";
import React from 'react';
import { ResumeData, SectionType } from '../../types/resume';
import ContactSection from './sections/ContactSection';
import SummarySection from './sections/SummarySection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';

interface ResumeEditorProps {
  resumeData: ResumeData;
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  onUpdate: (updates: Partial<ResumeData>) => void;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resumeData,
  activeSection,
  onSectionChange,
  onUpdate,
}) => {
  const sections: { id: SectionType; label: string; icon: React.ReactElement }[] = [
    {
      id: 'contact',
      label: 'Contact Info',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'education',
      label: 'Education',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'contact':
        return (
          <ContactSection
            contact={resumeData.contact}
            onChange={(contact) => onUpdate({ contact })}
          />
        );
      case 'summary':
        return (
          <SummarySection
            summary={resumeData.summary}
            onChange={(summary) => onUpdate({ summary })}
          />
        );
      case 'experience':
        return (
          <ExperienceSection
            experiences={resumeData.experience}
            onChange={(experience) => onUpdate({ experience })}
          />
        );
      case 'education':
        return (
          <EducationSection
            education={resumeData.education}
            onChange={(education) => onUpdate({ education })}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            skills={resumeData.skills}
            onChange={(skills) => onUpdate({ skills })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200">
        <div className="p-6">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Resume Sections
          </h3>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <span className={`mr-3 ${
                  activeSection === section.id ? 'text-indigo-600' : 'text-gray-400'
                }`}>{section.icon}</span>
                <span className="flex-1 text-left">{section.label}</span>
                {activeSection === section.id && (
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;