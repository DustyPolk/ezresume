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
    <li className="border-b py-3 px-4 mb-2 bg-white shadow rounded hover:bg-gray-50 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">{resume.title}</h3>
        {/* Optional: Display other info like last edited date here */}
      </div>
      <Link href={`/builder/${resume.id}`} legacyBehavior>
        <a className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          Open Builder
        </a>
      </Link>
      {/* Placeholder for future actions (e.g., delete button) can go here or next to the title */}
    </li>
  );
};

export default ResumeCard;
