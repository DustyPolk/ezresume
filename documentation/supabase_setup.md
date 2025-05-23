# Supabase Setup & Integration

## 1. Project Setup
- Create a new Supabase project
- Note project URL and anon/public keys

## 2. Database Schema
- **users** (handled by Supabase Auth)
- **resumes**: id, user_id, title, created_at, updated_at
- **sections**: id, resume_id, type, content, order

## 3. Authentication
- Enable Google Auth in Supabase dashboard
- Configure redirect URIs for local/dev/prod

## 4. Next.js Integration
- Install `@supabase/supabase-js`
- Add env variables for Supabase URL and anon key
- Initialize Supabase client in the app

## 5. Security
- Enable Row Level Security (RLS) on tables
- Write policies so users can only access their own data

## 6. Usage Patterns
- Use Supabase client on frontend for non-sensitive ops
- Use server-side (API routes) for privileged actions
