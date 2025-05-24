export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights: string[];
}

export interface Skill {
  id: string;
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  highlights: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  link?: string;
}

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  template: string;
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  customSections?: CustomSection[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  items?: Array<{
    id: string;
    title: string;
    description: string;
    highlights: string[];
  }>;
}

export type SectionType = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'custom';

export interface Template {
  id: string;
  name: string;
  description: string;
  preview?: string;
  sections: SectionType[];
  styles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
    spacing: 'compact' | 'normal' | 'relaxed';
  };
}