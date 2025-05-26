"use client";
import { supabase } from "../../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';
import LocationSelectAsync from '../../components/ui/LocationSelectAsync';
import type { CompleteUserData } from '../../types/database';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<CompleteUserData | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkUserAndFetchData();
    }
  }, [mounted]);

  const checkUserAndFetchData = async () => {
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data?.user) {
        router.push('/');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', data.user.id)
        .single();

      if (!profile?.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      setUser(data.user);
      await fetchUserData(data.user.id);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const [profileRes, experiencesRes, educationRes, skillsRes, projectsRes, certificationsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('user_experiences').select('*').eq('user_id', userId).order('order_index'),
        supabase.from('user_education').select('*').eq('user_id', userId).order('order_index'),
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('user_projects').select('*').eq('user_id', userId).order('order_index'),
        supabase.from('user_certifications').select('*').eq('user_id', userId).order('issue_date', { ascending: false })
      ]);

      setUserData({
        profile: profileRes.data,
        experiences: experiencesRes.data || [],
        education: educationRes.data || [],
        skills: skillsRes.data || [],
        projects: projectsRes.data || [],
        certifications: certificationsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSave = async (section: string, data: any) => {
    setSaving(true);
    try {
      switch (section) {
        case 'profile':
          await supabase.from('user_profiles').update(data).eq('user_id', user?.id);
          break;
        case 'experience':
          if (data.id) {
            await supabase.from('user_experiences').update(data).eq('id', data.id);
          } else {
            await supabase.from('user_experiences').insert({ ...data, user_id: user?.id });
          }
          break;
        case 'education':
          if (data.id) {
            await supabase.from('user_education').update(data).eq('id', data.id);
          } else {
            await supabase.from('user_education').insert({ ...data, user_id: user?.id });
          }
          break;
        case 'skills':
          await supabase.from('user_skills').delete().eq('user_id', user?.id);
          if (data.length > 0) {
            await supabase.from('user_skills').insert(
              data.map((skill: any) => ({ ...skill, user_id: user?.id }))
            );
          }
          break;
        case 'projects':
          if (data.id) {
            await supabase.from('user_projects').update(data).eq('id', data.id);
          } else {
            await supabase.from('user_projects').insert({ ...data, user_id: user?.id });
          }
          break;
        case 'certifications':
          if (data.id) {
            await supabase.from('user_certifications').update(data).eq('id', data.id);
          } else {
            await supabase.from('user_certifications').insert({ ...data, user_id: user?.id });
          }
          break;
      }
      await fetchUserData(user!.id);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    try {
      await supabase.from(table).delete().eq('id', id);
      await fetchUserData(user!.id);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !userData) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Personal Info', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '🛠️' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'certifications', label: 'Certifications', icon: '📜' },
    { id: 'resumes', label: 'My Resumes', icon: '📄' }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  Welcome back, {userData.profile.full_name.split(' ')[0]}!
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your profile and resumes
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeSection === item.id
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md transform scale-105'
                          : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {activeSection === 'overview' && (
                  <OverviewSection userData={userData} />
                )}
                {activeSection === 'profile' && (
                  <ProfileSection 
                    profile={userData.profile} 
                    onSave={(data) => handleSave('profile', data)}
                    saving={saving}
                  />
                )}
                {activeSection === 'experience' && (
                  <ExperienceSection 
                    experiences={userData.experiences}
                    onSave={(data) => handleSave('experience', data)}
                    onDelete={(id) => handleDelete('user_experiences', id)}
                    saving={saving}
                  />
                )}
                {activeSection === 'education' && (
                  <EducationSection 
                    education={userData.education}
                    onSave={(data) => handleSave('education', data)}
                    onDelete={(id) => handleDelete('user_education', id)}
                    saving={saving}
                  />
                )}
                {activeSection === 'skills' && (
                  <SkillsSection 
                    skills={userData.skills}
                    onSave={(data) => handleSave('skills', data)}
                    saving={saving}
                  />
                )}
                {activeSection === 'projects' && (
                  <ProjectsSection 
                    projects={userData.projects || []}
                    onSave={(data) => handleSave('projects', data)}
                    onDelete={(id) => handleDelete('user_projects', id)}
                    saving={saving}
                  />
                )}
                {activeSection === 'certifications' && (
                  <CertificationsSection 
                    certifications={userData.certifications || []}
                    onSave={(data) => handleSave('certifications', data)}
                    onDelete={(id) => handleDelete('user_certifications', id)}
                    saving={saving}
                  />
                )}
                {activeSection === 'resumes' && (
                  <ResumesSection userId={user.id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Overview Section Component
function OverviewSection({ userData }: { userData: CompleteUserData }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">Profile Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3">Professional Summary</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {userData.profile.professional_summary || 'No summary added yet'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-sm font-semibold text-purple-900 mb-3">Contact Information</h3>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="flex items-center gap-2">
              <span className="text-lg">📧</span>
              <span>{userData.profile.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span>{userData.profile.location || 'No location set'}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <span>{userData.profile.phone || 'No phone number'}</span>
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-sm font-semibold text-green-900 mb-3">Experience</h3>
          <p className="text-2xl font-bold text-green-700 mb-1">
            {userData.experiences.length}
          </p>
          <p className="text-sm text-slate-700">positions listed</p>
          {userData.profile.years_of_experience && (
            <p className="text-sm text-green-700 font-medium mt-2">
              {userData.profile.years_of_experience} years total
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
          <h3 className="text-sm font-semibold text-orange-900 mb-3">Education</h3>
          <p className="text-2xl font-bold text-orange-700 mb-1">
            {userData.education.length}
          </p>
          <p className="text-sm text-slate-700">degrees/certifications</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-6 border border-cyan-100">
          <h3 className="text-sm font-semibold text-cyan-900 mb-3">Skills</h3>
          <p className="text-2xl font-bold text-cyan-700 mb-1">
            {userData.skills.length}
          </p>
          <p className="text-sm text-slate-700">skills listed</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
          <h3 className="text-sm font-semibold text-rose-900 mb-3">Job Search Status</h3>
          <p className="text-sm font-medium text-slate-700">
            {userData.profile.job_search_status 
              ? userData.profile.job_search_status.replace(/_/g, ' ').charAt(0).toUpperCase() + 
                userData.profile.job_search_status.slice(1).replace(/_/g, ' ')
              : 'Not specified'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Profile Section Component
function ProfileSection({ 
  profile, 
  onSave, 
  saving 
}: { 
  profile: any; 
  onSave: (data: any) => void; 
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    ...profile,
    location: typeof profile.location === 'string' ? profile.location : ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData({
      ...profile,
      location: typeof profile.location === 'string' ? profile.location : ''
    });
  }, [profile]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setHasChanges(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-8 border-b border-indigo-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
        {hasChanges && (
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-indigo-300"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-indigo-300"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-indigo-300"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Location
          </label>
          <LocationSelectAsync
            value={formData.location || ''}
            onChange={(value: string) => handleChange('location', value)}
            placeholder="Select or type a location..."
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            value={formData.linkedin_url || ''}
            onChange={(e) => handleChange('linkedin_url', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-indigo-300"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            value={formData.github_url || ''}
            onChange={(e) => handleChange('github_url', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-indigo-300"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Professional Headline
          </label>
          <input
            type="text"
            value={formData.professional_headline || ''}
            onChange={(e) => handleChange('professional_headline', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-indigo-300"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            value={formData.years_of_experience || ''}
            onChange={(e) => handleChange('years_of_experience', parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-indigo-300"
          />
        </div>

        <div className="md:col-span-2 group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Professional Summary
          </label>
          <textarea
            value={formData.professional_summary || ''}
            onChange={(e) => handleChange('professional_summary', e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-indigo-300 resize-none"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Job Search Status
          </label>
          <select
            value={formData.job_search_status || ''}
            onChange={(e) => handleChange('job_search_status', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 transition-all duration-200 hover:border-indigo-300 appearance-none bg-white"
          >
            <option value="">Select status</option>
            <option value="active">Actively looking</option>
            <option value="passive">Open to opportunities</option>
            <option value="not_looking">Not looking</option>
          </select>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Open to Remote
          </label>
          <select
            value={formData.open_to_remote ? 'yes' : 'no'}
            onChange={(e) => handleChange('open_to_remote', e.target.value === 'yes')}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 transition-all duration-200 hover:border-indigo-300 appearance-none bg-white"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>
    </form>
  );
}

// Experience Section Component
function ExperienceSection({ 
  experiences, 
  onSave, 
  onDelete,
  saving 
}: { 
  experiences: any[]; 
  onSave: (data: any) => void; 
  onDelete: (id: string) => void;
  saving: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (experience: any) => {
    setEditingId(experience.id);
    setFormData(experience);
    setShowAddForm(false);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      company_name: '',
      job_title: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      key_achievements: [],
      technologies_used: []
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setEditingId(null);
    setShowAddForm(false);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({});
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8 border-b border-indigo-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900">Work Experience</h2>
        {!showAddForm && !editingId && (
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            Add Experience
          </button>
        )}
      </div>

      {(showAddForm || editingId) ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={formData.is_current}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_current"
                checked={formData.is_current}
                onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? null : formData.end_date })}
                className="mr-2"
              />
              <label htmlFor="is_current" className="text-sm text-gray-700">
                I currently work here
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{exp.job_title}</h3>
                  <p className="text-sm font-medium text-indigo-600">{exp.company_name}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(exp.start_date).toLocaleDateString()} - {
                      exp.is_current ? 'Present' : 
                      exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'
                    }
                  </p>
                  {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                  {exp.description && <p className="mt-2 text-sm text-gray-700">{exp.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this experience?')) {
                        onDelete(exp.id);
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {experiences.length === 0 && (
            <p className="text-center text-gray-500 py-8">No experience added yet</p>
          )}
        </div>
      )}
    </div>
  );
}

// Education Section Component
function EducationSection({ 
  education, 
  onSave, 
  onDelete,
  saving 
}: { 
  education: any[]; 
  onSave: (data: any) => void; 
  onDelete: (id: string) => void;
  saving: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (edu: any) => {
    setEditingId(edu.id);
    setFormData(edu);
    setShowAddForm(false);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      institution_name: '',
      degree_type: '',
      field_of_study: '',
      location: '',
      start_date: '',
      graduation_date: '',
      gpa: '',
      relevant_coursework: [],
      honors_awards: []
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setEditingId(null);
    setShowAddForm(false);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({});
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Education</h2>
        {!showAddForm && !editingId && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Add Education
          </button>
        )}
      </div>

      {(showAddForm || editingId) ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution Name
              </label>
              <input
                type="text"
                value={formData.institution_name}
                onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree Type
              </label>
              <input
                type="text"
                value={formData.degree_type}
                onChange={(e) => setFormData({ ...formData, degree_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="e.g., Bachelor of Science"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field of Study
              </label>
              <input
                type="text"
                value={formData.field_of_study}
                onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduation Date
              </label>
              <input
                type="date"
                value={formData.graduation_date || ''}
                onChange={(e) => setFormData({ ...formData, graduation_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.gpa || ''}
                onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="e.g., 3.75"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{edu.degree_type} in {edu.field_of_study}</h3>
                  <p className="text-sm text-gray-600">{edu.institution_name}</p>
                  {(edu.start_date || edu.graduation_date) && (
                    <p className="text-sm text-gray-500">
                      {edu.start_date && new Date(edu.start_date).toLocaleDateString()} - {
                        edu.graduation_date ? new Date(edu.graduation_date).toLocaleDateString() : 'Present'
                      }
                    </p>
                  )}
                  {edu.location && <p className="text-sm text-gray-500">{edu.location}</p>}
                  {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(edu)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this education?')) {
                        onDelete(edu.id);
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {education.length === 0 && (
            <p className="text-center text-gray-500 py-8">No education added yet</p>
          )}
        </div>
      )}
    </div>
  );
}

// Skills Section Component
function SkillsSection({ 
  skills, 
  onSave, 
  saving 
}: { 
  skills: any[]; 
  onSave: (data: any) => void; 
  saving: boolean;
}) {
  const [editMode, setEditMode] = useState(false);
  const [skillsList, setSkillsList] = useState(skills);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    skill_category: 'technical' as const,
    proficiency_level: 'intermediate' as const,
    years_of_experience: 0
  });

  const handleAddSkill = () => {
    if (newSkill.skill_name.trim()) {
      setSkillsList([...skillsList, { ...newSkill, id: `temp-${Date.now()}` }]);
      setNewSkill({
        skill_name: '',
        skill_category: 'technical',
        proficiency_level: 'intermediate',
        years_of_experience: 0
      });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const skillsToSave = skillsList.map(({ id, created_at, ...skill }) => skill);
    await onSave(skillsToSave);
    setEditMode(false);
  };

  const categories = {
    technical: { label: 'Technical', color: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 border border-indigo-200' },
    soft: { label: 'Soft Skills', color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border border-emerald-200' },
    language: { label: 'Languages', color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200' },
    tool: { label: 'Tools', color: 'bg-gradient-to-r from-amber-100 to-orange-100 text-orange-800 border border-orange-200' }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8 border-b border-indigo-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900">Skills</h2>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            Edit Skills
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSkillsList(skills);
                setEditMode(false);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {editMode ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Skill</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Skill name"
                value={newSkill.skill_name}
                onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
              <select
                value={newSkill.skill_category}
                onChange={(e) => setNewSkill({ ...newSkill, skill_category: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                <option value="technical">Technical</option>
                <option value="soft">Soft Skill</option>
                <option value="language">Language</option>
                <option value="tool">Tool</option>
              </select>
              <select
                value={newSkill.proficiency_level}
                onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {skillsList.map((skill, index) => (
              <div key={skill.id || index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{skill.skill_name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${categories[skill.skill_category as keyof typeof categories]?.color}`}>
                    {categories[skill.skill_category as keyof typeof categories]?.label}
                  </span>
                  <span className="text-sm text-gray-600">{skill.proficiency_level}</span>
                </div>
                <button
                  onClick={() => handleRemoveSkill(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(categories).map(([category, config]) => {
            const categorySkills = skills.filter(s => s.skill_category === category);
            return (
              <div key={category} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                <h3 className="font-semibold text-slate-900 mb-4">{config.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <span
                      key={skill.id}
                      className={`px-4 py-2 text-sm font-medium rounded-full ${config.color} shadow-sm`}
                    >
                      {skill.skill_name}
                    </span>
                  ))}
                  {categorySkills.length === 0 && (
                    <span className="text-sm text-slate-500 italic">No skills added</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Resumes Section Component
function ResumesSection({ userId }: { userId: string }) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setResumes(data);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async () => {
    const title = `Resume ${new Date().toLocaleDateString()}`;
    const { data, error } = await supabase
      .from('resumes')
      .insert([{ title, user_id: userId }])
      .select()
      .single();

    if (!error && data) {
      router.push(`/builder/${data.id}`);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      await supabase.from('resumes').delete().eq('id', id);
      fetchResumes();
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8 border-b border-indigo-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Resumes</h2>
        <button
          onClick={handleCreateResume}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          Create New Resume
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map((resume) => (
          <div key={resume.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 group">
            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{resume.title}</h3>
            <p className="text-sm text-slate-500 mb-4">
              Updated {new Date(resume.updated_at).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/builder/${resume.id}`)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteResume(resume.id)}
                className="px-4 py-2 text-red-600 text-sm font-medium border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {resumes.length === 0 && (
          <div className="col-span-full">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-12 text-center border border-indigo-100">
              <div className="mb-6">
                <span className="text-6xl">📄</span>
              </div>
              <p className="text-slate-600 mb-6 text-lg">You haven't created any resumes yet</p>
              <button
                onClick={handleCreateResume}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Create Your First Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Projects Section Component
function ProjectsSection({ 
  projects, 
  onSave, 
  onDelete,
  saving 
}: { 
  projects: any[]; 
  onSave: (data: any) => void; 
  onDelete: (id: string) => void;
  saving: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setFormData(project);
    setShowAddForm(false);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      project_name: '',
      description: '',
      role: '',
      technologies_used: [],
      project_url: '',
      start_date: '',
      end_date: '',
      key_achievements: []
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setEditingId(null);
    setShowAddForm(false);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({});
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Projects</h2>
        {!showAddForm && !editingId && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Add Project
          </button>
        )}
      </div>

      {(showAddForm || editingId) ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Role
              </label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="e.g., Lead Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project URL
              </label>
              <input
                type="url"
                value={formData.project_url || ''}
                onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technologies Used
              </label>
              <input
                type="text"
                value={formData.technologies_used?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  technologies_used: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{project.project_name}</h3>
                  {project.role && <p className="text-sm text-gray-600">{project.role}</p>}
                  {(project.start_date || project.end_date) && (
                    <p className="text-sm text-gray-500">
                      {project.start_date && new Date(project.start_date).toLocaleDateString()} 
                      {project.start_date && project.end_date && ' - '}
                      {project.end_date && new Date(project.end_date).toLocaleDateString()}
                    </p>
                  )}
                  {project.description && <p className="mt-2 text-sm text-gray-700">{project.description}</p>}
                  {project.technologies_used && project.technologies_used.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {project.technologies_used.map((tech: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.project_url && (
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer" 
                       className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-700">
                      View Project →
                    </a>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this project?')) {
                        onDelete(project.id);
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-center text-gray-500 py-8">No projects added yet</p>
          )}
        </div>
      )}
    </div>
  );
}

// Certifications Section Component
function CertificationsSection({ 
  certifications, 
  onSave, 
  onDelete,
  saving 
}: { 
  certifications: any[]; 
  onSave: (data: any) => void; 
  onDelete: (id: string) => void;
  saving: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (cert: any) => {
    setEditingId(cert.id);
    setFormData(cert);
    setShowAddForm(false);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      certification_name: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: ''
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setEditingId(null);
    setShowAddForm(false);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({});
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Certifications</h2>
        {!showAddForm && !editingId && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Add Certification
          </button>
        )}
      </div>

      {(showAddForm || editingId) ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification Name
              </label>
              <input
                type="text"
                value={formData.certification_name}
                onChange={(e) => setFormData({ ...formData, certification_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuing Organization
              </label>
              <input
                type="text"
                value={formData.issuing_organization}
                onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expiry_date || ''}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential ID
              </label>
              <input
                type="text"
                value={formData.credential_id || ''}
                onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential URL
              </label>
              <input
                type="url"
                value={formData.credential_url || ''}
                onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{cert.certification_name}</h3>
                  <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                  <p className="text-sm text-gray-500">
                    Issued: {new Date(cert.issue_date).toLocaleDateString()}
                    {cert.expiry_date && ` • Expires: ${new Date(cert.expiry_date).toLocaleDateString()}`}
                  </p>
                  {cert.credential_id && (
                    <p className="text-sm text-gray-500">Credential ID: {cert.credential_id}</p>
                  )}
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" 
                       className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-700">
                      View Credential →
                    </a>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(cert)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this certification?')) {
                        onDelete(cert.id);
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {certifications.length === 0 && (
            <p className="text-center text-gray-500 py-8">No certifications added yet</p>
          )}
        </div>
      )}
    </div>
  );
}