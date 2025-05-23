"use client"; // Needed if you directly use client hooks here, or for event handlers.
               // ResumeBuilder itself might be a client component.
import React from 'react';
import AppLayout from '../../../../components/layout/AppLayout'; // Adjust path
import ResumeBuilder from '../../../../components/resume/ResumeBuilder'; // Adjust path
// It's good practice to ensure user is authenticated here as well,
// or rely on a higher-level protection mechanism if dashboard is the only entry.
// For now, we'll focus on the structure.

export default function BuilderPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <AppLayout>
      <ResumeBuilder resumeId={id} />
    </AppLayout>
  );
}
