import { NextRequest, NextResponse } from 'next/server';
import { generateResume, ResumeData } from '@/lib/openai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client configured for server-side auth
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: any[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }: any) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized - No valid session' }, { status: 401 });
    }

    // Parse the resume data from the request
    const resumeData: ResumeData = await request.json();
    
    // Validate required fields
    if (!resumeData.personalInfo?.fullName || !resumeData.personalInfo?.email) {
      return NextResponse.json(
        { error: 'Missing required personal information' },
        { status: 400 }
      );
    }

    // Check if OPENAI_API_KEY is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Generate the resume using OpenAI
    const generatedContent = await generateResume(resumeData);
    
    // Return the generated resume content
    return NextResponse.json({
      success: true,
      content: generatedContent,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in generate-resume API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate resume' },
      { status: 500 }
    );
  }
}