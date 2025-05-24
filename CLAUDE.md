# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev         # Start development server with Turbopack at http://localhost:3000
npm run build       # Create production build
npm run start       # Start production server
npm run lint        # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.1.8 with App Router
- **UI**: React 19.0.0 with TypeScript
- **Styling**: Tailwind CSS 3.4.1
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **Package Manager**: npm (bun lock file also present)

### Project Structure
- `/app/` - Next.js App Router pages using file-based routing
  - `/builder/[id]/` - Dynamic resume builder page
  - `/dashboard/` - User dashboard with resume list
  - `page.tsx` - Landing page with Google auth
- `/components/` - Reusable React components organized by feature
- `/lib/` - Utilities including Supabase client configuration
- `/documentation/` - Detailed project documentation

### Key Patterns

1. **Client Components**: Use `"use client"` directive for interactive components
2. **Hydration Safety**: Components use mounted state pattern to prevent hydration errors:
   ```typescript
   const [mounted, setMounted] = useState(false);
   useEffect(() => { setMounted(true); }, []);
   if (!mounted) return null;
   ```
3. **Authentication Flow**: Google OAuth via Supabase, redirects authenticated users from `/` to `/dashboard`
4. **Data Access**: Supabase client-side queries with Row Level Security (RLS)
5. **Environment Variables**: 
   - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - OpenAI: `OPENAI_API_KEY`
   - GeoNames: `NEXT_PUBLIC_GEONAMES_USERNAME` (for city autocomplete)
6. **OpenAI Integration**: AI-powered resume generation using GPT-4
7. **Location Autocomplete**: GeoNames API integration with caching and popular cities

### Database Schema
- **profiles** table: User profiles linked to auth.users
- **resumes** table: Resume documents with user_id foreign key
- RLS policies ensure users can only access their own data

### UI Components and Design System

1. **Landing Page**: Modern marketing page with hero section, feature highlights, and CTA sections
   - Hero: Dark slate-900 background with indigo accents
   - Feature grid: 3-column responsive layout with icon placeholders
   - Dual CTA sections with contrasting color schemes

2. **Template System**: Template picker component with placeholder templates
   - Grid layout for template selection
   - Preview functionality planned but not implemented
   - Templates stored as simple objects with name/description

3. **Component Patterns**:
   - AppLayout wrapper for authenticated pages (dashboard, builder)
   - Consistent color scheme: indigo primary, gray text/backgrounds
   - Button styles: `bg-indigo-600 hover:bg-indigo-500` with scale transforms
   - Card styles: `rounded-2xl shadow-xl` with hover effects
   - Input styles: explicit `text-gray-900 placeholder-gray-400` for visibility
   - Responsive design with Tailwind breakpoints (sm:, md:, lg:)

4. **User Data Access**:
   - Google OAuth provides `user_metadata` with `full_name`
   - Display first name only: `user?.user_metadata?.full_name?.split(' ')[0]`
   - Fallback chain: full_name → name → email username

### Development Notes

1. **No Testing Setup**: Project currently has no test files or testing framework configured
2. **API Routes**: 
   - `/api/generate-resume` - OpenAI integration with Bearer token auth
3. **Turbopack**: Development server uses `--turbopack` flag for faster builds
4. **TypeScript Config**: Basic Next.js TypeScript setup, no custom paths or aliases
5. **Performance Optimizations**:
   - Debounced auto-save (1.5s delay)
   - Multi-layer caching for location search (memory + localStorage)
   - Popular cities preloading for instant results
6. **External APIs**:
   - OpenAI GPT-4 for resume generation
   - GeoNames for worldwide city search

### Current Implementation Status
- ✅ Google authentication with proper hydration handling
- ✅ Modern landing page with hero, features, and CTAs
- ✅ Dashboard with aligned UI design (indigo theme, enhanced cards)
- ✅ Basic resume CRUD operations
- ✅ User personalization (displays first name from Google profile)
- ✅ OpenAI integration for AI-powered resume generation
- ✅ GeoNames city autocomplete with caching
- ✅ Debounced auto-save to prevent data loss
- ✅ Data persistence across page reloads
- 🚧 Resume builder UI with sections (contact, experience, education, skills)
- 🚧 AI content generation with master prompt system
- 📋 Export functionality (planned)
- 📋 Actual resume templates (currently placeholders)
- 📋 Section-specific AI generation (planned)
- 📋 User onboarding flow (planned - see `/documentation/onboarding_plan.md`)

### AI Integration Architecture

1. **Master Prompt System** (`/lib/prompts/resumeMasterPrompt.ts`)
   - Comprehensive guidelines for resume generation
   - Industry-specific keyword banks
   - Experience level customization (entry, mid, senior, executive)
   - Dynamic prompt enhancement based on user input

2. **API Authentication** (`/api/generate-resume`)
   - Uses Bearer token authentication
   - Validates session with Supabase
   - Sends access token in Authorization header

3. **Prompt Configuration** (`/lib/prompts/promptConfig.ts`)
   - Centralized prompt settings
   - Industry configurations
   - Action verb libraries
   - Section templates

4. **Resume Generator** (`/lib/resumeGenerator.ts`)
   - Transforms app data to OpenAI format
   - Handles API communication
   - Parses AI responses

### Location Search Architecture

1. **GeoNames Integration** (`/lib/geonames.ts`)
   - Real-time city search worldwide
   - Optimized API parameters for performance
   - Fallback for when API is unavailable

2. **Caching System** (`/lib/geonames-cache.ts`)
   - Memory cache (1 hour TTL)
   - LocalStorage cache (24 hour TTL)
   - Popular cities preloading
   - Instant results for common searches

3. **React Select Async** (`/components/ui/LocationSelectAsync.tsx`)
   - Infinite scrolling with pagination
   - Debounced search (200ms)
   - Custom styling to match app theme
   - Supports custom location input

### Best Practices for this Codebase

1. **Authentication**: Always validate sessions in API routes using Bearer tokens
2. **Caching**: Use multi-layer caching for external API calls
3. **Auto-save**: Implement debouncing to prevent excessive saves
4. **Data Persistence**: Always check for existing data before applying defaults
5. **TypeScript**: Use proper types, avoid `any` except for vendor library internals
6. **Performance**: Preload common data, cache aggressively, optimize API calls