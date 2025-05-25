export interface UserProfile {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
  onboarding_current_step: number;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  professional_summary?: string;
  professional_headline?: string;
  years_of_experience?: number;
  target_roles?: string[];
  target_industries?: string[];
  job_search_status?: 'active' | 'passive' | 'not_looking';
  preferred_locations?: string[];
  open_to_remote: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserExperience {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  key_achievements?: string[];
  technologies_used?: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserEducation {
  id: string;
  user_id: string;
  institution_name: string;
  degree_type: string;
  field_of_study: string;
  location?: string;
  start_date?: string;
  graduation_date?: string;
  gpa?: number;
  relevant_coursework?: string[];
  honors_awards?: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  skill_category?: 'technical' | 'soft' | 'language' | 'tool';
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  created_at: string;
}

export interface UserProject {
  id: string;
  user_id: string;
  project_name: string;
  description?: string;
  role?: string;
  technologies_used?: string[];
  project_url?: string;
  start_date?: string;
  end_date?: string;
  key_achievements?: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserCertification {
  id: string;
  user_id: string;
  certification_name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  created_at: string;
}

// Complete user data type
export interface CompleteUserData {
  profile: UserProfile;
  experiences: UserExperience[];
  education: UserEducation[];
  skills: UserSkill[];
  projects?: UserProject[];
  certifications?: UserCertification[];
}