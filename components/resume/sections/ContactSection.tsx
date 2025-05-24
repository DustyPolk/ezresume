"use client";
import React from 'react';
import { ContactInfo } from '../../../types/resume';
import { inputStyles, labelStyles, sectionHeaderStyles, sectionDescriptionStyles } from '../../../lib/styles';
import LocationSelectAsync from '../../ui/LocationSelectAsync';

interface ContactSectionProps {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ contact, onChange }) => {
  const handleChange = (field: keyof ContactInfo, value: string) => {
    onChange({ ...contact, [field]: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeaderStyles}>Contact Information</h2>
        <p className={sectionDescriptionStyles}>
          This information will appear at the top of your resume. Make sure it&apos;s up to date.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6 space-y-6">
          <div>
            <label className={labelStyles}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contact.fullName || ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={inputStyles}
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyles}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={contact.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={inputStyles}
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label className={labelStyles}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contact.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={inputStyles}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className={labelStyles}>
              Location
            </label>
            <LocationSelectAsync
              value={contact.location || ''}
              onChange={(value) => handleChange('location', value)}
              placeholder="Type to search cities..."
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Professional Links
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyles}>
                LinkedIn
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <input
                  type="url"
                  value={contact.linkedin || ''}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  className={`${inputStyles} pl-10`}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
            </div>

            <div>
              <label className={labelStyles}>
                GitHub
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <input
                  type="url"
                  value={contact.github || ''}
                  onChange={(e) => handleChange('github', e.target.value)}
                  className={`${inputStyles} pl-10`}
                  placeholder="github.com/johndoe"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelStyles}>
                Personal Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={contact.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className={`${inputStyles} pl-10`}
                  placeholder="johndoe.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;