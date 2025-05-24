import { NextRequest, NextResponse } from 'next/server';
import { generateResume, ResumeData } from '@/lib/openai';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with the auth token from cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            cookie: cookies().toString(),
          },
        },
      }
    );

    // Get the user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Auth error:', sessionError);
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