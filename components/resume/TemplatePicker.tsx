import React from 'react';

const TemplatePicker: React.FC = () => {
  return (
    <div className="my-8 p-6 bg-slate-50 rounded-lg shadow"> {/* Updated wrapper styles */}
      <h2 className="text-xl font-semibold text-slate-700 mb-3"> {/* Updated title styles */}
        Choose a Template
      </h2>
      <p className="text-slate-600"> {/* Updated text color */}
        Template selection will be available here soon.
        For now, a default template will be used.
      </p>
      {/* Placeholder for template thumbnails or options */}
    </div>
  );
};

export default TemplatePicker;
