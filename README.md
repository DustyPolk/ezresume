# EZResume - AI-Powered Resume Builder

A modern, AI-powered resume builder that helps you create professional resumes effortlessly. Built with Next.js, React, TypeScript, and Supabase.

## 🚀 Features

### ✅ Implemented
- **Google Authentication** - Secure sign-in with Google OAuth via Supabase
- **Modern Landing Page** - Responsive marketing page with hero section and feature highlights
- **User Dashboard** - Personal dashboard to manage multiple resumes
- **Resume Management** - Create, view, edit, and delete resumes
- **Template System** - Template picker UI (templates in development)
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS

### 🚧 In Progress
- **Resume Builder Interface** - Visual editor with live preview
- **Resume Templates** - Professional templates for different industries
- **Section Management** - Add/edit/reorder resume sections

### 📋 Planned Features
- **AI Content Generation** - AI-powered suggestions for resume content
- **Export Functionality** - Download resumes as PDF/DOCX
- **Version History** - Track changes and restore previous versions
- **Cover Letter Builder** - Matching cover letter templates
- **ATS Optimization** - Ensure resumes pass applicant tracking systems
- **Sharing & Collaboration** - Share resumes with unique links
- **Analytics** - Track resume views and downloads

## 🛠 Tech Stack

- **Framework**: [Next.js 15.1.8](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 19.0.0](https://react.dev/)
- **Styling**: [Tailwind CSS 3.4.1](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Deployment**: Optimized for [Vercel](https://vercel.com/)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ezresume.git
   cd ezresume
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Enable Google authentication in Authentication > Providers
   - Run the database migrations (see `/documentation/supabase_setup.md`)

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗂 Project Structure

```
ezresume/
├── app/                 # Next.js App Router pages
│   ├── builder/[id]/   # Dynamic resume builder page
│   ├── dashboard/      # User dashboard
│   └── page.tsx        # Landing page
├── components/         # Reusable React components
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout components
│   └── resume/         # Resume builder components
├── lib/                # Utilities and configurations
├── documentation/      # Project documentation
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## 🚀 Development

### Available Scripts

```bash
npm run dev       # Start development server with Turbopack
npm run build     # Create production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Key Development Patterns

1. **Client Components**: Use `"use client"` directive for interactive components
2. **Hydration Safety**: Components implement mounted state pattern to prevent SSR issues
3. **Authentication**: Protected routes redirect to login when unauthenticated
4. **Data Access**: Client-side Supabase queries with Row Level Security (RLS)

## 🔒 Security

- Row Level Security (RLS) ensures users can only access their own data
- Environment variables keep sensitive configuration secure
- Google OAuth provides secure authentication
- All API calls are authenticated through Supabase

## 📝 Documentation

Detailed documentation is available in the `/documentation` directory:
- `architecture.md` - System architecture and design decisions
- `development_plan.md` - Roadmap and implementation timeline
- `supabase_setup.md` - Database schema and setup instructions
- `ai_integration.md` - AI features and integration plans

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)