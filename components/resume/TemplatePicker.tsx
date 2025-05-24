"use client";
import React from 'react';

interface TemplatePickerProps {
  onSelectTemplate?: (templateId: string) => void;
  currentTemplate?: string;
}

const TemplatePicker: React.FC<TemplatePickerProps> = ({ onSelectTemplate, currentTemplate }) => {
  const templates = [
    { id: 'modern', name: 'Modern', description: 'Clean and contemporary design' },
    { id: 'classic', name: 'Classic', description: 'Traditional and professional' },
    { id: 'creative', name: 'Creative', description: 'Stand out with unique styling' },
  ];

  const handleSelectTemplate = (templateId: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-700 mb-4">Choose a Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map(template => (
          <div 
            key={template.id} 
            onClick={() => handleSelectTemplate(template.id)}
            className={`border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
              currentTemplate === template.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
            }`}
          >
            <h3 className="font-medium text-slate-800">{template.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{template.description}</p>
            <div className="mt-3 h-40 bg-slate-200 rounded flex items-center justify-center">
              <span className="text-slate-500">Preview</span>
            </div>
            {currentTemplate === template.id && (
              <div className="mt-2 text-center">
                <span className="text-sm text-indigo-600 font-medium">Current Template</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatePicker;