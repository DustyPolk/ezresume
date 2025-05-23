import React from 'react';

const TemplatePicker: React.FC = () => {
  return (
    <div className="my-6 p-4 border border-dashed border-gray-300 rounded">
      <h2 className="text-xl font-semibold mb-2">Choose a Template</h2>
      <p className="text-gray-500">
        Template selection will be available here soon.
        For now, a default template will be used.
      </p>
      {/* Placeholder for template thumbnails or options */}
    </div>
  );
};

export default TemplatePicker;
