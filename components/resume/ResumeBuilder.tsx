"use client"; 
import React from 'react';
import TemplatePicker from './TemplatePicker'; // Import TemplatePicker

interface ResumeBuilderProps {
  resumeId: string;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ resumeId }) => {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">Resume Builder</h1>
      <p className="text-slate-700 mb-6">Currently building resume with ID: <strong>{resumeId}</strong></p>
      
      <TemplatePicker /> {/* Integrate TemplatePicker here */}

      <p className="mt-6 text-slate-600"> {/* Changed text color */}
        Section editing and AI suggestions are coming soon!
      </p>
    </div>
  );
};

export default ResumeBuilder;
