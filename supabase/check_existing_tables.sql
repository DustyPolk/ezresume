-- Check ALL tables in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if you have any users
SELECT id, email, created_at 
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Check existing resumes table
SELECT COUNT(*) as resume_count FROM resumes;
SELECT COUNT(*) as profiles_count FROM profiles;