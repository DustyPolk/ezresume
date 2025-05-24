-- Create profile for existing users who signed up before the onboarding system
-- This only creates profiles for users who don't already have one

INSERT INTO user_profiles (user_id, full_name, email)
SELECT 
    id as user_id,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email) as full_name,
    email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Check if it worked
SELECT * FROM user_profiles;