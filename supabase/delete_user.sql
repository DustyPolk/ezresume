-- ⚠️ WARNING: This will delete ALL data for a user!
-- Replace 'your-email@gmail.com' with your actual email

-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@gmail.com';

-- Then use that ID to delete everything (replace 'your-user-id' with the actual ID):
/*
DELETE FROM resumes WHERE user_id = 'your-user-id';
DELETE FROM profiles WHERE user_id = 'your-user-id';
DELETE FROM auth.users WHERE id = 'your-user-id';
*/

-- Or delete ALL users and start fresh (VERY DANGEROUS):
/*
TRUNCATE resumes CASCADE;
TRUNCATE profiles CASCADE;
DELETE FROM auth.users;
*/