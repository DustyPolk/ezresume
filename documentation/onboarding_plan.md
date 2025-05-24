# User Onboarding Implementation Plan

## Overview
Implement a comprehensive onboarding flow for first-time users to collect all necessary information for AI-powered resume generation. This data will be stored in Supabase and used as the foundation for all resume creation.

## Architecture Design

### 1. Database Schema Updates

Create new tables in Supabase:

```sql
-- User profile extension table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Onboarding Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  
  -- Professional Summary
  professional_summary TEXT,
  years_of_experience INTEGER,
  
  -- Career Preferences
  target_roles TEXT[], -- Array of target job titles
  target_industries TEXT[], -- Array of industries
  job_search_status TEXT, -- 'active', 'passive', 'not_looking'
  preferred_locations TEXT[], -- Array of locations
  open_to_remote BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Work Experience table
CREATE TABLE user_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  
  description TEXT,
  key_achievements TEXT[], -- Array of achievement bullets
  technologies_used TEXT[], -- Array of tech/tools
  
  order_index INTEGER, -- For ordering experiences
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Education table
CREATE TABLE user_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  institution_name TEXT NOT NULL,
  degree_type TEXT NOT NULL, -- Bachelor's, Master's, etc.
  field_of_study TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  graduation_date DATE,
  gpa DECIMAL(3,2),
  
  relevant_coursework TEXT[],
  honors_awards TEXT[],
  
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills table
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  skill_name TEXT NOT NULL,
  skill_category TEXT, -- 'technical', 'soft', 'language', 'tool'
  proficiency_level TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
  years_of_experience INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, skill_name)
);

-- Projects table (optional)
CREATE TABLE user_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  project_name TEXT NOT NULL,
  description TEXT,
  role TEXT,
  technologies_used TEXT[],
  project_url TEXT,
  start_date DATE,
  end_date DATE,
  
  key_achievements TEXT[],
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Certifications table
CREATE TABLE user_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  certification_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Onboarding Flow Design

#### Step 1: Welcome & Overview
- Welcome message with user's name from Google OAuth
- Explain the purpose: "Let's gather your information to create amazing resumes"
- Show progress indicator (Step 1 of 7)
- Estimate time: "This will take about 10-15 minutes"

#### Step 2: Personal Information
- Full name (pre-filled from Google)
- Email (pre-filled from Google)
- Phone number
- Location (with GeoNames autocomplete)
- LinkedIn URL
- GitHub URL (optional)
- Personal website (optional)

#### Step 3: Professional Summary
- Years of experience (dropdown or input)
- Professional headline (e.g., "Senior Software Engineer")
- Brief professional summary (textarea with AI assist button)
- Target roles (multi-select with suggestions)
- Target industries (multi-select)
- Job search status (active/passive/not looking)

#### Step 4: Work Experience
- Add multiple experiences
- For each experience:
  - Company name
  - Job title
  - Location (with autocomplete)
  - Start/End dates (or "Current")
  - Role description
  - Key achievements (with AI suggestions)
  - Technologies/Tools used
- Ability to reorder experiences
- "Add Another Experience" button

#### Step 5: Education
- Add multiple education entries
- For each entry:
  - Institution name
  - Degree type
  - Field of study
  - Location
  - Graduation date
  - GPA (optional)
  - Relevant coursework (optional)
  - Honors/Awards (optional)

#### Step 6: Skills
- Technical skills (with autocomplete from common skills)
- Soft skills
- Languages
- Tools & Technologies
- Proficiency levels for each
- AI suggestions based on experience

#### Step 7: Additional Information (Optional)
- Projects
- Certifications
- Publications
- Volunteer work
- Option to skip this step

### 3. Implementation Components

#### A. Onboarding Route (`/app/onboarding/page.tsx`)
```typescript
// Main onboarding container with step management
- Step navigation
- Progress indicator
- Data persistence between steps
- Skip/Back/Next buttons
- Auto-save functionality
```

#### B. Step Components (`/components/onboarding/`)
```
- WelcomeStep.tsx
- PersonalInfoStep.tsx  
- ProfessionalSummaryStep.tsx
- ExperienceStep.tsx
- EducationStep.tsx
- SkillsStep.tsx
- AdditionalInfoStep.tsx
- CompletionStep.tsx
```

#### C. Onboarding Context (`/contexts/OnboardingContext.tsx`)
```typescript
// Manage onboarding state across steps
interface OnboardingData {
  currentStep: number;
  personalInfo: PersonalInfo;
  professionalSummary: ProfessionalSummary;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects?: Project[];
  certifications?: Certification[];
}
```

#### D. API Routes
- `/api/onboarding/save` - Save progress
- `/api/onboarding/complete` - Mark onboarding as complete
- `/api/user-profile/[section]` - Get/update specific sections

### 4. User Flow Integration

#### A. Authentication Flow Update
```typescript
// In app/page.tsx or middleware
1. User logs in with Google
2. Check if user_profiles.onboarding_completed = true
3. If false → Redirect to /onboarding
4. If true → Redirect to /dashboard
```

#### B. Dashboard Integration
- Show user's professional headline
- Quick stats (X years experience, Y skills)
- "Update Profile" button → Edit onboarding data

#### C. Resume Builder Integration
When creating a new resume:
1. Pre-populate all fields from user profile
2. User can override for specific resume
3. Template + User Data → OpenAI → Generated Resume

### 5. AI Integration Enhancements

#### A. Smart Suggestions During Onboarding
- Professional summary generator based on experience
- Achievement bullets suggestions
- Skills extraction from job descriptions
- Industry-specific keyword recommendations

#### B. Enhanced Resume Generation
```typescript
interface EnhancedResumeGeneration {
  userData: CompleteUserProfile;
  templateChoice: Template;
  customizations: {
    targetRole?: string;
    targetCompany?: string;
    emphasize?: string[];
    tone?: 'professional' | 'creative' | 'technical';
  };
}
```

### 6. Implementation Timeline

#### Phase 1: Database & Backend (Day 1)
- [ ] Create database schema
- [ ] Set up RLS policies
- [ ] Create Supabase functions

#### Phase 2: Onboarding UI (Days 2-3)
- [ ] Create onboarding route and components
- [ ] Implement step navigation
- [ ] Add form validation
- [ ] Integrate location autocomplete

#### Phase 3: Data Integration (Day 4)
- [ ] Connect forms to Supabase
- [ ] Implement auto-save
- [ ] Add progress persistence

#### Phase 4: AI Enhancements (Day 5)
- [ ] Add AI suggestions to forms
- [ ] Update resume generation to use profile data
- [ ] Test end-to-end flow

### 7. UI/UX Considerations

#### A. Design Principles
- Clean, minimal interface
- Clear progress indication
- Helpful tooltips and examples
- Mobile-responsive design
- Accessibility compliant

#### B. Validation & Error Handling
- Real-time validation
- Clear error messages
- Graceful handling of API failures
- Ability to save and resume later

#### C. Progress Persistence
- Auto-save every field change
- LocalStorage backup
- Resume from where user left off
- "Save and Exit" option

### 8. Future Enhancements

1. **Import from LinkedIn** - Auto-fill from LinkedIn profile
2. **Resume Parser** - Upload old resume to extract info
3. **AI Interview** - Conversational onboarding
4. **Skills Assessment** - Verify skill levels
5. **Reference Management** - Store references securely

### 9. Success Metrics

- Onboarding completion rate > 80%
- Average time to complete < 15 minutes
- User satisfaction score > 4.5/5
- Resume generation quality improvement
- Reduced time to create first resume

### 10. Technical Considerations

- Use React Hook Form for form management
- Implement proper loading states
- Add analytics tracking
- Consider progressive disclosure
- Ensure GDPR compliance for data storage