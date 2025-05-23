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
    return <div className="text-center py-4">Loading resumes...</div>;
  }

  if (error) {
    return <div className="text-red-600 bg-red-100 p-3 rounded">{error}</div>;
  }

  if (resumes.length === 0) {
    return <div className="text-center py-4 text-gray-600">No resumes yet. Add your first one!</div>;
  }

  return (
    <ul className="space-y-4">
      {resumes.map(resume => (
        <ResumeCard key={resume.id} resume={resume} />
      ))}
    </ul>
  );
};

export default ResumeList;
