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
    <li className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="p-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-0"> {/* Removed mb-2 as button is on same line */}
            {resume.title}
          </h3>
          {/* Optional: Display other info like last edited date here */}
        </div>
        <Link href={`/builder/${resume.id}`} legacyBehavior>
          <a className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out">
            Open Builder
          </a>
        </Link>
      </div>
    </li>
  );
};

export default ResumeCard;
