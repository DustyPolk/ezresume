import OpenAI from 'openai';
import { getEnhancedPrompt } from './prompts/resumeMasterPrompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ResumeData {
  // Personal Information
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    website?: string;
  };
  
  // Professional Summary
  summary?: string;
  
  // Work Experience
  experience: Array<{
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    responsibilities: string[];
  }>;
  
  // Education
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
    honors?: string[];
  }>;
  
  // Skills
  skills: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
    certifications?: string[];
  };
  
  // Additional Sections
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  
  // Meta Information for AI
  targetRole?: string;
  targetIndustry?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  resumeStyle?: 'traditional' | 'modern' | 'creative' | 'technical';
}

export async function generateResume(resumeData: ResumeData): Promise<string> {
  try {
    const enhancedPrompt = getEnhancedPrompt(
      resumeData.targetRole,
      resumeData.targetIndustry,
      resumeData.experienceLevel
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: enhancedPrompt
        },
        {
          role: "user",
          content: JSON.stringify(resumeData)
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating resume:', error);
    throw new Error('Failed to generate resume');
  }
}

export default openai;