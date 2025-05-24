import { NextRequest, NextResponse } from 'next/server';
import { generateResume, ResumeData } from '@/lib/openai';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client with the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify the token by getting the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
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