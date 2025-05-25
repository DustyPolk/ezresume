# Setting Up Onboarding Database Tables

## Quick Setup

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the Migration**
   - Open `/supabase/migrations/001_onboarding_schema.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify Tables Were Created**
   - Run the check query from `/supabase/check_tables.sql`
   - You should see all 6 tables listed:
     - user_profiles
     - user_experiences
     - user_education
     - user_skills
     - user_projects
     - user_certifications

## What the Migration Does

1. Creates all necessary tables for user onboarding data
2. Sets up Row Level Security (RLS) policies
3. Creates indexes for performance
4. Sets up automatic timestamps
5. Creates a trigger to auto-create user_profiles on signup

## Troubleshooting

### If you get "table already exists" errors:
- The tables might be partially created
- Drop existing tables first (be careful with data!):
```sql
DROP TABLE IF EXISTS user_certifications CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS user_education CASCADE;
DROP TABLE IF EXISTS user_experiences CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

### If RLS policies fail:
- Make sure RLS is enabled in Supabase settings
- Check that auth.users table exists

### Testing the Setup

1. Sign out and sign back in with Google
2. You should be redirected to `/onboarding`
3. Complete the onboarding flow
4. Check the tables in Supabase to see your data

## Next Steps

After setup:
- New users will automatically get a user_profile entry
- They'll be redirected to onboarding on first login
- Existing users without profiles will also go through onboarding
- Data saves automatically as users progress through steps