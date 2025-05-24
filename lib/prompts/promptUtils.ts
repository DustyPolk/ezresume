import { INDUSTRY_CONFIGS, EXPERIENCE_LEVEL_CONFIGS, ACTION_VERBS } from './promptConfig';

/**
 * Generates a customized prompt based on user preferences and data
 */
export function customizePrompt(
  basePrompt: string,
  options: {
    industry?: string;
    experienceLevel?: string;
    emphasis?: string[];
    tone?: 'professional' | 'creative' | 'technical';
  }
): string {
  let customPrompt = basePrompt;

  // Add industry-specific customizations
  if (options.industry) {
    const industryConfig = INDUSTRY_CONFIGS[options.industry.toLowerCase() as keyof typeof INDUSTRY_CONFIGS];
    if (industryConfig) {
      customPrompt += `\n\nINDUSTRY-SPECIFIC REQUIREMENTS:`;
      if (industryConfig.emphasizeTechnicalSkills) {
        customPrompt += `\n- Emphasize technical skills and tools`;
      }
      if (industryConfig.keywords) {
        customPrompt += `\n- Include keywords: ${industryConfig.keywords.join(', ')}`;
      }
    }
  }

  // Add experience level customizations
  if (options.experienceLevel) {
    const levelConfig = EXPERIENCE_LEVEL_CONFIGS[options.experienceLevel as keyof typeof EXPERIENCE_LEVEL_CONFIGS];
    if (levelConfig) {
      customPrompt += `\n\nEXPERIENCE LEVEL ADJUSTMENTS:`;
      if (levelConfig.emphasizeEducation) {
        customPrompt += `\n- Give more weight to education and academic achievements`;
      }
      if (levelConfig.emphasizeLeadership) {
        customPrompt += `\n- Highlight leadership experience and team management`;
      }
    }
  }

  // Add emphasis customizations
  if (options.emphasis && options.emphasis.length > 0) {
    customPrompt += `\n\nSPECIAL EMPHASIS:`;
    options.emphasis.forEach(item => {
      customPrompt += `\n- ${item}`;
    });
  }

  // Add tone adjustments
  if (options.tone) {
    customPrompt += `\n\nTONE: Write in a ${options.tone} tone while maintaining professionalism.`;
  }

  return customPrompt;
}

/**
 * Selects appropriate action verbs based on context
 */
export function selectActionVerbs(
  context: 'leadership' | 'achievement' | 'improvement' | 'creation' | 'analysis',
  count: number = 5
): string[] {
  const verbs = ACTION_VERBS[context] || ACTION_VERBS.achievement;
  return verbs.slice(0, count);
}

/**
 * Formats resume data for optimal prompt processing
 */
export function formatForPrompt(data: Record<string, unknown>): string {
  // Remove empty fields to reduce token usage
  const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  // Format with clear sections
  return JSON.stringify(cleanData, null, 2);
}

/**
 * Validates that resume data has minimum required information
 */
export function validateResumeData(data: Record<string, unknown>): { valid: boolean; missing: string[] } {
  const required = ['personalInfo', 'experience', 'education'];
  const missing: string[] = [];

  required.forEach(field => {
    if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
      missing.push(field);
    }
  });

  // Check for personal info subfields
  if (data.personalInfo && typeof data.personalInfo === 'object') {
    const personalInfo = data.personalInfo as Record<string, unknown>;
    if (!personalInfo.fullName) missing.push('Full Name');
    if (!personalInfo.email) missing.push('Email');
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Extracts keywords from job descriptions for ATS optimization
 */
export function extractKeywords(jobDescription: string): string[] {
  // Simple keyword extraction - in production, consider using NLP
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  
  const words = jobDescription
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Return top keywords by frequency
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}