import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

interface Resume {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

interface ResumeCardProps {
  resume: Resume;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(resume.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateTitle = async () => {
    if (!editTitle.trim() || editTitle === resume.title) {
      setIsEditing(false);
      setEditTitle(resume.title);
      return;
    }

    const { error } = await supabase
      .from('resumes')
      .update({ title: editTitle.trim() })
      .eq('id', resume.id);

    if (!error) {
      setIsEditing(false);
      if (onUpdate) onUpdate();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resume.id);

    if (!error && onDelete) {
      onDelete();
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <li className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
      <div className="p-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateTitle();
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditTitle(resume.title);
                  }
                }}
                className="text-2xl font-bold text-gray-900 mb-2 bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full"
                autoFocus
              />
            ) : (
              <h3 
                className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-200 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {resume.title}
              </h3>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Created {formatDate(resume.created_at)}</span>
              {resume.updated_at && (
                <span>• Updated {formatDate(resume.updated_at)}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Link href={`/builder/${resume.id}`} legacyBehavior>
              <a className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Edit Resume
              </a>
            </Link>
            
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 text-gray-400 hover:text-red-600 transition-colors duration-200"
                title="Delete resume"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default ResumeCard;