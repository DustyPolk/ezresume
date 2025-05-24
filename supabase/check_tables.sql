-- Check if onboarding tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_profiles',
    'user_experiences', 
    'user_education',
    'user_skills',
    'user_projects',
    'user_certifications'
)
ORDER BY table_name;