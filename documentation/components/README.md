# React Components Plan for AI Resume Builder

This document details the major React components required to build all planned features for the AI-powered resume builder. The goal is to create a modular, extensible, and user-friendly experience that leverages AI to help users generate effective resumes from their personal information and experience.

---

## 1. Authentication & Layout
- **AuthProvider**: Context provider for user/session state
- **ProtectedRoute**: Wrapper to restrict access to authenticated users
- **AppLayout**: Main layout (sidebar, header, content)

## 2. Dashboard & Navigation
- **Dashboard**: Main landing page after login; shows resume list, quick actions
- **ResumeList**: Displays user's resumes (CRUD)
- **ResumeCard**: Individual resume summary (title, last edited, actions)
- **TemplatePicker**: UI for browsing/selecting resume templates

## 3. Resume Builder
- **ResumeBuilder**: Main workspace for editing/creating a resume
- **ResumeForm**: Multi-step form for entering user info, experience, education, etc.
- **SectionEditor**: Edits a single section (e.g. Work, Education, Skills)
- **SectionList**: Lists all sections in a resume; reorder, add, remove sections
- **AIContentSuggestor**: Calls AI to generate or improve content for a section
- **PreviewPane**: Live preview of the resume with selected template
- **TemplateSelector**: Allows switching templates/styles for the resume

## 4. User Input & Data Collection
- **PersonalInfoForm**: Collects name, contact, summary, etc.
- **ExperienceForm**: Collects work history, roles, achievements
- **EducationForm**: Collects education background
- **SkillsForm**: Collects skills, certifications, languages
- **CustomSectionForm**: For additional, user-defined sections

## 5. AI Interaction
- **AIPromptModal**: Lets users describe their experience/goals for AI
- **AIResultDisplay**: Shows AI-generated content with options to accept/edit
- **AIStatusIndicator**: Shows loading, error, or success states for AI calls

## 6. Export & Sharing
- **ExportButton**: Export to PDF/Word
- **ShareResumeModal**: Generate and copy shareable link (if enabled)

## 7. Miscellaneous
- **Notification**: Toasts and alerts for user feedback
- **LoadingSpinner**: Consistent loading indicator
- **ErrorBoundary**: Catches and displays errors gracefully

---

## Example User Flow
1. User logs in via Google (AuthProvider, ProtectedRoute)
2. User lands on Dashboard (Dashboard, ResumeList)
3. User chooses a template (TemplatePicker)
4. User enters personal info and experience (ResumeForm, SectionEditor, AIPromptModal)
5. AI generates and suggests resume content (AIContentSuggestor, AIResultDisplay)
6. User previews and customizes resume (PreviewPane, TemplateSelector)
7. User exports or shares resume (ExportButton, ShareResumeModal)

This modular approach ensures scalability and a seamless user experience as we expand features.
