import React from 'react';
import ResumeCard from './ResumeCard'; // Assuming it's in the same directory

interface Resume { // Duplicate or move to a shared types file
  id: string;
  title: string;
  created_at?: string;
}

interface ResumeListProps {
  resumes: Resume[];
  loading: boolean;
  error: string | null;
}

const ResumeList: React.FC<ResumeListProps> = ({ resumes, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
        <p className="font-semibold">Error loading resumes</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-xl text-gray-600 font-medium mb-2">No resumes yet</p>
        <p className="text-gray-500">Create your first resume to get started!</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-6">
      {resumes.map(resume => (
        <ResumeCard key={resume.id} resume={resume} />
      ))}
    </ul>
  );
};

export default ResumeList;
