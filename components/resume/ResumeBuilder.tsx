"use client"; 
import React from 'react';
import TemplatePicker from './TemplatePicker'; // Import TemplatePicker

interface ResumeBuilderProps {
  resumeId: string;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ resumeId }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resume Builder</h1>
      <p>Currently building resume with ID: <strong>{resumeId}</strong></p>
      
      <TemplatePicker /> {/* Integrate TemplatePicker here */}

      <p className="mt-6 text-gray-600">
        Section editing and AI suggestions are coming soon!
      </p>
    </div>
  );
};

export default ResumeBuilder;
