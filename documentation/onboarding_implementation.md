# Onboarding Implementation

## Overview
The onboarding system collects comprehensive user information through an 8-step wizard flow, storing data in Supabase for use in AI-powered resume generation.

## Database Structure

### Tables Created
1. **user_profiles** - Main profile with onboarding status
2. **user_experiences** - Work history
3. **user_education** - Educational background
4. **user_skills** - Skills with categories
5. **user_projects** - Portfolio projects
6. **user_certifications** - Professional certifications

All tables include:
- UUID primary keys
- Foreign key to auth.users
- RLS policies for security
- Timestamps (created_at, updated_at)

### Key Features
- Auto-creation of user_profile on signup via trigger
- Progress tracking with `onboarding_current_step`
- Completion flag with timestamp

## Implementation Details

### Route Structure
- `/app/onboarding/page.tsx` - Main onboarding container
- `/components/onboarding/*` - Individual step components
- `/contexts/OnboardingContext.tsx` - State management

### Step Components
1. **WelcomeStep** - Introduction and time estimate
2. **PersonalInfoStep** - Contact details, social links
3. **ProfessionalSummaryStep** - Career overview, targets
4. **ExperienceStep** - Work history management
5. **EducationStep** - Academic background
6. **SkillsStep** - Skills categorization
7. **AdditionalInfoStep** - Projects & certifications
8. **CompletionStep** - Success and redirect

### Features Implemented
- ✅ Auto-save with 1-second debouncing
- ✅ Progress persistence across sessions
- ✅ Form validation on required fields
- ✅ GeoNames integration for location fields
- ✅ Dynamic add/edit/remove for collections
- ✅ Skill suggestions and categorization
- ✅ Mobile-responsive design
- ✅ Accessibility compliant

### Authentication Flow Updates
1. Landing page (`/app/page.tsx`):
   - Checks if user has profile
   - Redirects to `/onboarding` if incomplete
   - Redirects to `/dashboard` if complete

2. Dashboard (`/app/dashboard/page.tsx`):
   - Verifies onboarding completion
   - Redirects to `/onboarding` if needed

### Context API
The `OnboardingContext` provides:
- Centralized state management
- CRUD operations for all data types
- Batch save functionality
- Data loading from Supabase
- Temporary ID generation for new items

## Usage

### Running the Migration
```sql
-- Execute in Supabase SQL Editor
-- File: /supabase/migrations/001_onboarding_schema.sql
```

### Testing Onboarding
1. Sign in with Google
2. System auto-redirects to `/onboarding`
3. Complete all steps (or skip optional ones)
4. Data saves automatically
5. Completion redirects to dashboard

### Accessing User Data
```typescript
// In any component after onboarding
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*, user_experiences(*), user_education(*), user_skills(*)')
  .eq('user_id', userId)
  .single();
```

## Next Steps
1. Integrate AI suggestions for professional summary
2. Update resume builder to use profile data
3. Add LinkedIn import functionality
4. Implement resume parser for existing documents
5. Add profile editing from dashboard

## Troubleshooting

### Common Issues
1. **Profile not created**: Check trigger is active in Supabase
2. **Can't save data**: Verify RLS policies are correct
3. **Location search fails**: Check NEXT_PUBLIC_GEONAMES_USERNAME env var

### Debug Commands
```bash
# Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

# Verify RLS policies
SELECT * FROM pg_policies 
WHERE tablename LIKE 'user_%';

# Check user profile
SELECT * FROM user_profiles 
WHERE user_id = auth.uid();
```