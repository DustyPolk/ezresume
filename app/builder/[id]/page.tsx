"use client";
import React, { use } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import ResumeBuilder from '../../../components/resume/ResumeBuilder';

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <AppLayout>
      <ResumeBuilder resumeId={id} />
    </AppLayout>
  );
}
