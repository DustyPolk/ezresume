import { ResumeData } from '@/types/resume';
import { ResumeData as OpenAIResumeData } from './openai';

/**
 * Transforms the app's ResumeData format to OpenAI's expected format
 */
export function transformToOpenAIFormat(resume: Partial<ResumeData>): OpenAIResumeData {
  return {
    personalInfo: {
      fullName: resume.contact?.fullName || '',
      email: resume.contact?.email || '',
      phone: resume.contact?.phone || '',
      location: resume.contact?.location || '',
      linkedIn: resume.contact?.linkedin,
      website: resume.contact?.website,
    },
    summary: resume.summary,
    experience: (resume.experience || []).map(exp => ({
      jobTitle: exp.position,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      responsibilities: [exp.description, ...exp.highlights].filter(Boolean),
    })),
    education: (resume.education || []).map(edu => ({
      degree: edu.degree,
      field: edu.field,
      institution: edu.institution,
      location: edu.location,
      graduationDate: edu.endDate,
      gpa: edu.gpa,
      honors: edu.highlights,
    })),
    skills: {
      technical: resume.skills?.filter(s => s.category === 'technical').map(s => s.name),
      soft: resume.skills?.filter(s => s.category === 'soft').map(s => s.name),
      languages: resume.skills?.filter(s => s.category === 'language').map(s => s.name),
      certifications: resume.certifications?.map(c => `${c.name} (${c.issuer})`),
    },
    projects: resume.projects?.map(proj => ({
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies,
      link: proj.link,
    })),
  };
}

/**
 * Calls the AI generation API with resume data
 */
export async function generateAIResume(resumeData: Partial<ResumeData>): Promise<string> {
  // Import supabase client to get the session
  const { supabase } = await import('./supabaseClient');
  
  // Get the current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('No active session. Please log in again.');
  }
  
  const openAIData = transformToOpenAIFormat(resumeData);
  
  const response = await fetch('/api/generate-resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(openAIData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate resume');
  }

  const result = await response.json();
  return result.content;
}

/**
 * Parses AI-generated content back into structured sections
 */
export function parseAIGeneratedContent(content: string): Partial<ResumeData> {
  // This is a simplified parser - you may want to enhance it based on the AI output format
  const sections = content.split(/\n(?=[A-Z\s]+:)/);
  
  const parsedData: Partial<ResumeData> = {};
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const header = lines[0].toLowerCase();
    
    if (header.includes('summary')) {
      parsedData.summary = lines.slice(1).join('\n').trim();
    }
    // Add more parsing logic as needed
  });
  
  return parsedData;
}