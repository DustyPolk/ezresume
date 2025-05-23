# System Architecture

## Overview
- **Frontend:** Next.js (React-based)
- **Backend/Database:** Supabase (Postgres, Auth, Storage)
- **AI Integration:** API routes or serverless functions in Next.js, calling external or managed AI models

## Data Flow
1. User signs up/logs in via Google (Supabase Auth)
2. User creates/edits resumes; data is stored in Supabase
3. When AI suggestions are needed, frontend calls API route, which interacts with AI provider
4. Resume data and user info are kept secure via Supabase Row Level Security (RLS)

## Security & Privacy
- RLS ensures users can only access their own data
- Sensitive operations (AI, export) handled server-side
- No sensitive data exposed to client or third parties
