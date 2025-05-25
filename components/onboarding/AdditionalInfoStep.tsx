'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import debounce from 'lodash/debounce';

interface AdditionalInfoStepProps {
  onNext: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies?: string;
  date?: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export function AdditionalInfoStep({ onNext, onBack }: AdditionalInfoStepProps) {
  const { data, addProject: addProjectToContext, removeProject: removeProjectFromContext, 
          addCertification: addCertToContext, removeCertification: removeCertFromContext,
          updateProject: updateProjectInContext, updateCertification: updateCertInContext, saveProgress } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>(
    data.projects.map(p => ({
      id: p.id,
      name: p.project_name,
      description: p.description || '',
      url: p.project_url || '',
      technologies: p.technologies_used?.join(', ') || '',
      date: p.start_date || '',
    }))
  );
  const [certifications, setCertifications] = useState<Certification[]>(
    data.certifications.map(c => ({
      id: c.id,
      name: c.certification_name,
      issuer: c.issuing_organization,
      date: c.issue_date,
      expiryDate: c.expiry_date || '',
      credentialId: c.credential_id || '',
      url: c.credential_url || '',
    }))
  );
  const [activeTab, setActiveTab] = useState<'projects' | 'certifications'>('projects');

  // Auto-save with debouncing
  const debouncedSave = React.useMemo(
    () => debounce(async (saveData: { projects: Project[]; certifications: Certification[] }) => {
      // Clear and re-add all projects
      data.projects.forEach(p => removeProjectFromContext(p.id));
      saveData.projects.forEach(project => {
        if (project.name.trim()) {
          addProjectToContext({
            project_name: project.name,
            description: project.description,
            project_url: project.url,
            technologies_used: project.technologies ? project.technologies.split(',').map(t => t.trim()) : [],
            start_date: project.date,
            end_date: undefined,
            role: undefined,
            key_achievements: [],
            order_index: 0,
          });
        }
      });

      // Clear and re-add all certifications
      data.certifications.forEach(c => removeCertFromContext(c.id));
      saveData.certifications.forEach(cert => {
        if (cert.name.trim() && cert.issuer.trim()) {
          addCertToContext({
            certification_name: cert.name,
            issuing_organization: cert.issuer,
            issue_date: cert.date,
            expiry_date: cert.expiryDate,
            credential_id: cert.credentialId,
            credential_url: cert.url,
          });
        }
      });

      // Save to database (don't show saving indicator for auto-save)
      try {
        await saveProgress();
      } catch (error) {
        console.error('Error auto-saving additional info:', error);
      }
    }, 3000), // Increased to 3 seconds to reduce frequency
    [data, addProjectToContext, removeProjectFromContext, addCertToContext, removeCertFromContext, saveProgress]
  );

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    debouncedSave({ projects, certifications });
  }, [projects, certifications]); // eslint-disable-line react-hooks/exhaustive-deps

  // Project handlers
  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        name: '',
        description: '',
        url: '',
        technologies: '',
        date: '',
      },
    ]);
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Certification handlers
  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        id: Date.now().toString(),
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        credentialId: '',
        url: '',
      },
    ]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      // Clear and re-add all projects
      data.projects.forEach(p => removeProjectFromContext(p.id));
      projects.forEach(project => {
        if (project.name.trim()) {
          addProjectToContext({
            project_name: project.name,
            description: project.description,
            project_url: project.url,
            technologies_used: project.technologies ? project.technologies.split(',').map(t => t.trim()) : [],
            start_date: project.date,
            end_date: undefined,
            role: undefined,
            key_achievements: [],
            order_index: 0,
          });
        }
      });

      // Clear and re-add all certifications
      data.certifications.forEach(c => removeCertFromContext(c.id));
      certifications.forEach(cert => {
        if (cert.name.trim() && cert.issuer.trim()) {
          addCertToContext({
            certification_name: cert.name,
            issuing_organization: cert.issuer,
            issue_date: cert.date,
            expiry_date: cert.expiryDate,
            credential_id: cert.credentialId,
            credential_url: cert.url,
          });
        }
      });
      
      await saveProgress();
      onNext();
    } catch (error) {
      console.error('Error saving additional info:', error);
      // Still proceed to next step even if save fails
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h2>
            <p className="text-gray-600">Optional: Add projects and certifications to strengthen your resume</p>
          </div>
          {isSaving && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            activeTab === 'projects'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            activeTab === 'certifications'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Certifications ({certifications.length})
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          {projects.map((project, index) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Project {index + 1}
                </h3>
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., E-commerce Platform"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe the project, your role, and key achievements..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologies Used
                    </label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="month"
                      value={project.date}
                      onChange={(e) => updateProject(index, 'date', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={project.url}
                    onChange={(e) => updateProject(index, 'url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://github.com/username/project"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addProject}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            + Add Project
          </button>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div>
          {certifications.map((cert, index) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Certification {index + 1}
                </h3>
                <button
                  onClick={() => removeCertification(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certification Name
                    </label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., AWS Certified Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issuing Organization
                    </label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date
                    </label>
                    <input
                      type="month"
                      value={cert.date}
                      onChange={(e) => updateCertification(index, 'date', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="month"
                      value={cert.expiryDate}
                      onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credential ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={cert.credentialId}
                      onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., ABC123XYZ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credential URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={cert.url}
                      onChange={(e) => updateCertification(index, 'url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://credential.url"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addCertification}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            + Add Certification
          </button>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-150 hover:scale-105"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-150 hover:scale-105"
        >
          Complete Onboarding →
        </button>
      </div>
    </div>
  );
}

export default AdditionalInfoStep;