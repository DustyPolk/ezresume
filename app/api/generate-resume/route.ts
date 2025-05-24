import { NextRequest, NextResponse } from 'next/server';
import { generateResume, ResumeData } from '@/lib/openai';
import { createClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}