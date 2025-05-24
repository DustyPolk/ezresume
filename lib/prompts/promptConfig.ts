/**
 * Prompt configuration for resume generation
 * This file allows easy customization of AI prompts without modifying core logic
 */

export const PROMPT_CONFIG = {
  // Model configuration
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 2000,

  // Tone and style settings
  tone: {
    professional: true,
    formal: true,
    concise: true,
  },

  // Section priorities (1-10, higher = more important)
  sectionPriorities: {
    summary: 10,
    experience: 9,
    skills: 8,
    education: 7,
    projects: 6,
    certifications: 5,
  },

  // Achievement emphasis settings
  achievementSettings: {
    requireMetrics: true,
    minimumBulletsPerRole: 3,
    maximumBulletsPerRole: 5,
    prioritizeRecentRoles: true,
  },

  // ATS optimization settings
  atsOptimization: {
    useStandardHeaders: true,
    includeKeywords: true,
    avoidGraphics: true,
    useSimpleFormatting: true,
  },

  // Length constraints
  lengthConstraints: {
    summaryMaxWords: 50,
    bulletPointMaxWords: 30,
    totalMaxPages: 2,
  },
};

// Industry-specific configurations
export const INDUSTRY_CONFIGS = {
  tech: {
    emphasizeTechnicalSkills: true,
    includeGithub: true,
    highlightProjects: true,
    keywords: ['scalable', 'agile', 'cloud', 'API', 'microservices'],
  },
  finance: {
    emphasizeCompliance: true,
    includeMetrics: true,
    highlightCertifications: true,
    keywords: ['ROI', 'compliance', 'analysis', 'risk management'],
  },
  marketing: {
    emphasizeCreativity: true,
    includePortfolio: true,
    highlightCampaigns: true,
    keywords: ['campaign', 'engagement', 'brand', 'conversion'],
  },
};

// Experience level configurations
export const EXPERIENCE_LEVEL_CONFIGS = {
  entry: {
    emphasizeEducation: true,
    includeCoursework: true,
    highlightPotential: true,
    minimumExperience: 0,
  },
  mid: {
    emphasizeProgression: true,
    includeAchievements: true,
    highlightSkills: true,
    minimumExperience: 3,
  },
  senior: {
    emphasizeLeadership: true,
    includeMetrics: true,
    highlightStrategy: true,
    minimumExperience: 7,
  },
  executive: {
    emphasizeVision: true,
    includeBoard: true,
    highlightTransformation: true,
    minimumExperience: 10,
  },
};

// Prompt templates for different sections
export const SECTION_TEMPLATES = {
  summary: {
    entry: "Recent graduate with {degree} seeking {targetRole} position. {skills}. {achievement}.",
    mid: "{years} years of experience in {industry}. Proven track record in {achievements}. Expertise in {skills}.",
    senior: "Senior {profession} with {years}+ years driving {impact}. Led {teams} in {achievements}. Expert in {skills}.",
    executive: "Executive leader with {years}+ years transforming {industry}. {revenue} in revenue growth. {strategic_achievements}.",
  },
  
  bulletPoint: {
    action: "{verb} {what} {result} {metric}",
    achievement: "Achieved {metric} by {action} resulting in {impact}",
    leadership: "Led {team_size} team to {achievement} through {approach}",
  },
};

// Verb banks for different contexts
export const ACTION_VERBS = {
  leadership: ['Led', 'Directed', 'Managed', 'Supervised', 'Coordinated', 'Oversaw'],
  achievement: ['Achieved', 'Exceeded', 'Surpassed', 'Delivered', 'Accomplished'],
  improvement: ['Improved', 'Enhanced', 'Optimized', 'Streamlined', 'Upgraded'],
  creation: ['Developed', 'Created', 'Designed', 'Built', 'Established', 'Launched'],
  analysis: ['Analyzed', 'Evaluated', 'Assessed', 'Investigated', 'Researched'],
};