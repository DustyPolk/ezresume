'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  UserProfile, 
  UserExperience, 
  UserEducation, 
  UserSkill, 
  UserProject, 
  UserCertification 
} from '@/types/database';

interface OnboardingData {
  personalInfo: Partial<UserProfile>;
  experiences: UserExperience[];
  education: UserEducation[];
  skills: UserSkill[];
  projects: UserProject[];
  certifications: UserCertification[];
}

interface OnboardingContextType {
  data: OnboardingData;
  updatePersonalInfo: (info: Partial<UserProfile>) => void;
  addExperience: (experience: Omit<UserExperience, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateExperience: (id: string, experience: Partial<UserExperience>) => void;
  removeExperience: (id: string) => void;
  addEducation: (education: Omit<UserEducation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateEducation: (id: string, education: Partial<UserEducation>) => void;
  removeEducation: (id: string) => void;
  addSkill: (skill: Omit<UserSkill, 'id' | 'user_id' | 'created_at'>) => void;
  updateSkill: (id: string, skill: Partial<UserSkill>) => void;
  removeSkill: (id: string) => void;
  addProject: (project: Omit<UserProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateProject: (id: string, project: Partial<UserProject>) => void;
  removeProject: (id: string) => void;
  addCertification: (cert: Omit<UserCertification, 'id' | 'user_id' | 'created_at'>) => void;
  updateCertification: (id: string, cert: Partial<UserCertification>) => void;
  removeCertification: (id: string) => void;
  saveProgress: () => Promise<void>;
  loadUserData: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    personalInfo: {},
    experiences: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  });

  const [userId, setUserId] = useState<string | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  // Load user data when userId is set
  useEffect(() => {
    if (userId) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // loadUserData is intentionally not included to prevent loops

  const loadUserData = async () => {
    const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) {
      console.error('No user ID found for loading data');
      return;
    }

    try {
      console.log('Loading user data for userId:', currentUserId);
      
      // Load user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

      // Load experiences
      const { data: experiences } = await supabase
        .from('user_experiences')
        .select('*')
        .eq('user_id', currentUserId)
        .order('order_index', { ascending: true });

      // Load education
      const { data: education } = await supabase
        .from('user_education')
        .select('*')
        .eq('user_id', currentUserId)
        .order('order_index', { ascending: true });

      // Load skills
      const { data: skills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', currentUserId);

      // Load projects
      const { data: projects } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', currentUserId)
        .order('order_index', { ascending: true });

      // Load certifications
      const { data: certifications } = await supabase
        .from('user_certifications')
        .select('*')
        .eq('user_id', currentUserId);

      setData({
        personalInfo: profile || {},
        experiences: experiences || [],
        education: education || [],
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || [],
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updatePersonalInfo = (info: Partial<UserProfile>) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info }
    }));
  };

  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  const addExperience = (experience: Omit<UserExperience, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newExperience = {
      ...experience,
      id: generateTempId(),
      user_id: userId || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExperience as UserExperience]
    }));
  };

  const updateExperience = (id: string, experience: Partial<UserExperience>) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, ...experience } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = (education: Omit<UserEducation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newEducation = {
      ...education,
      id: generateTempId(),
      user_id: userId || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      education: [...prev.education, newEducation as UserEducation]
    }));
  };

  const updateEducation = (id: string, education: Partial<UserEducation>) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, ...education } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = (skill: Omit<UserSkill, 'id' | 'user_id' | 'created_at'>) => {
    const newSkill = {
      ...skill,
      id: generateTempId(),
      user_id: userId || '',
      created_at: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill as UserSkill]
    }));
  };

  const updateSkill = (id: string, skill: Partial<UserSkill>) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.map(s => 
        s.id === id ? { ...s, ...skill } : s
      )
    }));
  };

  const removeSkill = (id: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
  };

  const addProject = (project: Omit<UserProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newProject = {
      ...project,
      id: generateTempId(),
      user_id: userId || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject as UserProject]
    }));
  };

  const updateProject = (id: string, project: Partial<UserProject>) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === id ? { ...p, ...project } : p
      )
    }));
  };

  const removeProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const addCertification = (cert: Omit<UserCertification, 'id' | 'user_id' | 'created_at'>) => {
    const newCert = {
      ...cert,
      id: generateTempId(),
      user_id: userId || '',
      created_at: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert as UserCertification]
    }));
  };

  const updateCertification = (id: string, cert: Partial<UserCertification>) => {
    setData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => 
        c.id === id ? { ...c, ...cert } : c
      )
    }));
  };

  const removeCertification = (id: string) => {
    setData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id)
    }));
  };

  const saveProgress = useCallback(async () => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log('Save already in progress, skipping...');
      return;
    }
    
    console.log('saveProgress called, userId:', userId);
    console.log('Current data state:', {
      personalInfo: Object.keys(data.personalInfo).length,
      experiences: data.experiences.length,
      education: data.education.length,
      skills: data.skills.length,
      projects: data.projects.length,
      certifications: data.certifications.length,
    });
    
    if (!userId) {
      console.error('No userId found, cannot save');
      return;
    }

    isSavingRef.current = true;
    try {
      // First, check if we have a profile already
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('user_id', userId)
        .single();

      // Save or update user profile
      if (data.personalInfo && Object.keys(data.personalInfo).length > 0) {
        // Merge with existing profile to ensure required fields are present
        const profileData = {
          user_id: userId,
          full_name: data.personalInfo.full_name || existingProfile?.full_name || '',
          email: data.personalInfo.email || existingProfile?.email || '',
          ...data.personalInfo,
        };
        
        console.log('Saving profile data:', JSON.stringify(profileData, null, 2));
        
        const { data: savedData, error: profileError } = await supabase
          .from('user_profiles')
          .upsert(profileData, { onConflict: 'user_id' })
          .select();
        
        if (profileError) {
          console.error('Error saving profile:', JSON.stringify(profileError, null, 2));
          throw profileError;
        }
        
        console.log('Profile saved successfully:', savedData);
      }

      // Save experiences (delete all and re-insert for simplicity)
      await supabase
        .from('user_experiences')
        .delete()
        .eq('user_id', userId);

      if (data.experiences.length > 0) {
        console.log('Saving experiences:', data.experiences.length);
        const experiencesData = data.experiences.map((exp, index) => ({
          id: exp.id.startsWith('temp_') ? undefined : exp.id,
          user_id: userId,
          company_name: exp.company_name,
          job_title: exp.job_title,
          location: exp.location,
          start_date: exp.start_date,
          end_date: exp.end_date,
          is_current: exp.is_current,
          description: exp.description,
          key_achievements: exp.key_achievements,
          technologies_used: exp.technologies_used,
          order_index: index,
        }));
        console.log('Experiences data to save:', JSON.stringify(experiencesData, null, 2));

        const { error: expError } = await supabase
          .from('user_experiences')
          .insert(experiencesData);
        
        if (expError) {
          console.error('Error saving experiences:', JSON.stringify(expError, null, 2));
          throw expError;
        }
      }

      // Save education
      await supabase
        .from('user_education')
        .delete()
        .eq('user_id', userId);

      if (data.education.length > 0) {
        console.log('Saving education:', data.education.length);
        const educationData = data.education.map((edu, index) => ({
          id: edu.id.startsWith('temp_') ? undefined : edu.id,
          user_id: userId,
          institution_name: edu.institution_name,
          degree_type: edu.degree_type,
          field_of_study: edu.field_of_study,
          location: edu.location,
          start_date: edu.start_date,
          graduation_date: edu.graduation_date,
          gpa: edu.gpa,
          relevant_coursework: edu.relevant_coursework,
          honors_awards: edu.honors_awards,
          order_index: index,
        }));
        console.log('Education data to save:', JSON.stringify(educationData, null, 2));

        const { error: eduError } = await supabase
          .from('user_education')
          .insert(educationData);
        
        if (eduError) {
          console.error('Error saving education:', JSON.stringify(eduError, null, 2));
          throw eduError;
        }
      }

      // Save skills
      await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', userId);

      if (data.skills.length > 0) {
        console.log('Saving skills:', data.skills.length);
        const skillsData = data.skills.map(skill => ({
          id: skill.id.startsWith('temp_') ? undefined : skill.id,
          user_id: userId,
          skill_name: skill.skill_name,
          skill_category: skill.skill_category,
          proficiency_level: skill.proficiency_level,
          years_of_experience: skill.years_of_experience,
        }));
        console.log('Skills data to save:', JSON.stringify(skillsData, null, 2));

        const { error: skillsError } = await supabase
          .from('user_skills')
          .insert(skillsData);
        
        if (skillsError) {
          console.error('Error saving skills:', JSON.stringify(skillsError, null, 2));
          throw skillsError;
        }
      }

      // Save projects
      await supabase
        .from('user_projects')
        .delete()
        .eq('user_id', userId);

      if (data.projects.length > 0) {
        const projectsData = data.projects.map((project, index) => ({
          ...project,
          id: project.id.startsWith('temp_') ? undefined : project.id,
          user_id: userId,
          order_index: index,
        }));

        const { error: projectsError } = await supabase
          .from('user_projects')
          .insert(projectsData);
        
        if (projectsError) {
          console.error('Error saving projects:', JSON.stringify(projectsError, null, 2));
          throw projectsError;
        }
      }

      // Save certifications
      await supabase
        .from('user_certifications')
        .delete()
        .eq('user_id', userId);

      if (data.certifications.length > 0) {
        const certsData = data.certifications.map(cert => ({
          ...cert,
          id: cert.id.startsWith('temp_') ? undefined : cert.id,
          user_id: userId,
        }));

        const { error: certsError } = await supabase
          .from('user_certifications')
          .insert(certsData);
        
        if (certsError) {
          console.error('Error saving certifications:', JSON.stringify(certsError, null, 2));
          throw certsError;
        }
      }

      // Don't reload data here - it causes infinite loops
      console.log('Save completed successfully');
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    } finally {
      isSavingRef.current = false;
    }
  }, [userId, data]); // isSavingGlobal intentionally excluded to prevent infinite loops

  return (
    <OnboardingContext.Provider value={{
      data,
      updatePersonalInfo,
      addExperience,
      updateExperience,
      removeExperience,
      addEducation,
      updateEducation,
      removeEducation,
      addSkill,
      updateSkill,
      removeSkill,
      addProject,
      updateProject,
      removeProject,
      addCertification,
      updateCertification,
      removeCertification,
      saveProgress,
      loadUserData,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}