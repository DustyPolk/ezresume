import React from 'react';
import Link from 'next/link'; // Import Link

interface Resume { // Consider defining this in a shared types file later
  id: string;
  title: string;
  // created_at?: string; // Optional, if you want to display it
}

interface ResumeCardProps {
  resume: Resume;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ resume }) => {
  return (
    <li className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
      <div className="p-8">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
              {resume.title}
            </h3>
            <p className="text-gray-600">
              Click to edit your resume
            </p>
          </div>
          <Link href={`/builder/${resume.id}`} legacyBehavior>
            <a className="ml-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Edit Resume
            </a>
          </Link>
        </div>
      </div>
    </li>
  );
};

export default ResumeCard;
