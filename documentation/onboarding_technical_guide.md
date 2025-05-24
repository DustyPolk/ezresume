# Onboarding Technical Implementation Guide

## Quick Start Checklist

### Tomorrow's First Steps:

1. **Create Database Schema**
   ```bash
   # Run migrations in Supabase SQL editor
   # Use schema from onboarding_plan.md
   ```

2. **Update Authentication Flow**
   ```typescript
   // app/page.tsx - Add onboarding check
   const { data: profile } = await supabase
     .from('user_profiles')
     .select('onboarding_completed')
     .eq('user_id', user.id)
     .single();
   
   if (!profile?.onboarding_completed) {
     router.push('/onboarding');
   } else {
     router.push('/dashboard');
   }
   ```

3. **Create Onboarding Route Structure**
   ```
   app/
     onboarding/
       page.tsx              # Main container
       layout.tsx            # Onboarding-specific layout
       [step]/
         page.tsx            # Dynamic step renderer
   ```

## Code Templates

### 1. Onboarding Context Provider
```typescript
// contexts/OnboardingContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  data: any; // Use proper types
  updateData: (stepData: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveProgress: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // Implementation
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};
```

### 2. Step Component Template
```typescript
// components/onboarding/BaseStep.tsx
interface BaseStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export function BaseStep({ title, description, children, onNext, onBack, isFirstStep, isLastStep }: BaseStepProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      
      <div className="space-y-6">
        {children}
      </div>
      
      <div className="flex justify-between mt-8">
        {!isFirstStep && (
          <button onClick={onBack} className="btn-secondary">
            Back
          </button>
        )}
        <button onClick={onNext} className="btn-primary ml-auto">
          {isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
```

### 3. Auto-Save Hook
```typescript
// hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';

export function useAutoSave(data: any, saveFn: (data: any) => Promise<void>, delay = 1000) {
  const debouncedSave = useRef(
    debounce(async (data: any) => {
      try {
        await saveFn(data);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay)
  ).current;

  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);
}
```

### 4. Progress Indicator Component
```typescript
// components/onboarding/ProgressIndicator.tsx
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { id: number; name: string; completed: boolean }[];
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${step.completed ? 'bg-green-500 text-white' : 
                currentStep === step.id ? 'bg-indigo-600 text-white' : 
                'bg-gray-200 text-gray-600'}
            `}>
              {step.completed ? '✓' : step.id}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                h-1 w-full bg-gray-200
                ${step.completed ? 'bg-green-500' : ''}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Integration Points

### 1. Resume Builder Updates
```typescript
// lib/resumeGenerator.ts - Update to use profile data
export async function generateAIResume(
  resumeData: Partial<ResumeData>,
  userProfile?: UserProfile
): Promise<string> {
  // Merge resume data with user profile
  const enrichedData = {
    ...transformToOpenAIFormat(resumeData),
    userProfile: userProfile ? {
      yearsOfExperience: userProfile.years_of_experience,
      targetRoles: userProfile.target_roles,
      allExperiences: userProfile.experiences,
      allSkills: userProfile.skills,
      // ... more profile data
    } : undefined
  };
  
  // Rest of implementation
}
```

### 2. Master Prompt Updates
```typescript
// lib/prompts/resumeMasterPrompt.ts - Add profile context
export function getEnhancedPromptWithProfile(
  userProfile: UserProfile,
  targetRole?: string,
  targetCompany?: string
): string {
  return `
    ${RESUME_MASTER_PROMPT}
    
    USER PROFILE CONTEXT:
    - ${userProfile.years_of_experience} years of total experience
    - Career focus: ${userProfile.target_roles.join(', ')}
    - Key skills: ${userProfile.skills.map(s => s.skill_name).join(', ')}
    - Previous companies: ${userProfile.experiences.map(e => e.company_name).join(', ')}
    
    Generate a resume that leverages this complete career history while
    focusing on the most relevant experiences for the target role.
  `;
}
```

### 3. Supabase Service Functions
```typescript
// lib/services/userProfileService.ts
export class UserProfileService {
  static async getCompleteProfile(userId: string) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        experiences:user_experiences(*),
        education:user_education(*),
        skills:user_skills(*),
        projects:user_projects(*),
        certifications:user_certifications(*)
      `)
      .eq('user_id', userId)
      .single();
    
    return profile;
  }
  
  static async updateSection(userId: string, section: string, data: any) {
    // Implementation for updating specific sections
  }
  
  static async checkOnboardingStatus(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();
    
    return data?.onboarding_completed || false;
  }
}
```

## State Management Approach

### Option 1: Context + Local State
- Use React Context for onboarding flow
- Local state in each step component
- Sync to Supabase on step completion

### Option 2: Zustand Store
```typescript
// stores/onboardingStore.ts
import create from 'zustand';

interface OnboardingStore {
  currentStep: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  updateData: (section: string, data: any) => void;
  saveToSupabase: () => Promise<void>;
}
```

### Option 3: React Hook Form + Context
- Use RHF for form management
- Context for navigation and global state
- Best for complex forms with validation

## Testing Approach

1. **Unit Tests**
   - Test each step component
   - Test form validation
   - Test data transformation

2. **Integration Tests**
   - Test complete onboarding flow
   - Test data persistence
   - Test skip/resume functionality

3. **E2E Tests**
   - Test from login to dashboard
   - Test error scenarios
   - Test mobile responsiveness

## Migration Strategy

1. **Soft Launch**
   - Feature flag for gradual rollout
   - Existing users see "Complete Profile" prompt
   - New users go through onboarding

2. **Data Migration**
   - Extract data from existing resumes
   - Pre-populate profiles for existing users
   - Allow users to verify/update

## Performance Considerations

1. **Lazy Loading**
   - Load step components dynamically
   - Prefetch next step while user fills current

2. **Optimistic Updates**
   - Update UI immediately
   - Sync to database in background
   - Handle conflicts gracefully

3. **Caching**
   - Cache user profile data
   - Invalidate on updates
   - Use SWR or React Query

## Security Considerations

1. **Data Validation**
   - Server-side validation for all inputs
   - Sanitize HTML content
   - Validate URLs

2. **RLS Policies**
   ```sql
   -- Users can only see/edit their own profile
   CREATE POLICY "Users can CRUD own profile" ON user_profiles
     USING (auth.uid() = user_id);
   ```

3. **Rate Limiting**
   - Limit API calls during onboarding
   - Prevent spam submissions
   - Add CAPTCHA if needed