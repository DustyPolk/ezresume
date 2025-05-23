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
    return <div className="text-slate-500 py-10 text-center">Loading resumes...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-md text-center">{error}</div>;
  }

  if (resumes.length === 0) {
    return <div className="text-slate-500 py-10 text-center">No resumes yet. Add your first one!</div>;
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
