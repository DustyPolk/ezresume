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
5. **Environment Variables**: Required for Supabase configuration (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

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
2. **No API Routes**: All data operations happen client-side via Supabase
3. **Turbopack**: Development server uses `--turbopack` flag for faster builds
4. **TypeScript Config**: Basic Next.js TypeScript setup, no custom paths or aliases

### Current Implementation Status
- ✅ Google authentication with proper hydration handling
- ✅ Modern landing page with hero, features, and CTAs
- ✅ Dashboard with aligned UI design (indigo theme, enhanced cards)
- ✅ Basic resume CRUD operations
- ✅ User personalization (displays first name from Google profile)
- 🚧 Resume builder UI with template picker (in progress)
- 📋 AI content generation (planned)
- 📋 Export functionality (planned)
- 📋 Actual resume templates (currently placeholders)