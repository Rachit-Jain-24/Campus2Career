# Implementation Plan: Syllabus-Driven AI Roadmap

## Overview

Extend the existing Career Roadmap with a Gemini AI pipeline driven by uploaded syllabus PDFs. Tasks build incrementally: data model → Firebase service → Gemini function → UI → tests.

## Tasks

- [x] 1. Extend `IntelligentRoadmap` type in `src/lib/roadmapGenerator.ts`
  - Add `SubjectIndustryEntry` interface with `subject: string`, `industryRelevance: 'high' | 'medium' | 'low'`, and `supplementarySkills: string[]` fields
  - Add optional `subjectIndustryMap?: SubjectIndustryEntry[]` field to the existing `IntelligentRoadmap` interface
  - No changes to `generateIntelligentRoadmap` function — the new field is optional so the fallback path is zero-change
  - _Requirements: 4.2, 5.1_

- [ ] 2. Create `src/services/student/syllabus.service.ts`
  - [x] 2.1 Implement `SyllabusRecord` interface and `uploadSyllabusPDF` function
    - Define `SyllabusRecord` interface: `{ downloadUrl: string; semester: number; uploadedAt: string; fileName: string }`
    - Import `storage` and `db` from `src/lib/firebase.ts`
    - Use `uploadBytesResumable` to upload to path `syllabi/{sapId}/semester_{N}.pdf`
    - Call `onProgress` callback with 0–100 values during upload
    - After upload completes, call `getDownloadURL` and write Firestore doc at `users/{sapId}/syllabi/semester_{N}` with all four `SyllabusRecord` fields
    - Return the completed `SyllabusRecord`
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ]* 2.2 Write property test for storage path construction (P5)
    - **Property 5: Firebase Storage path construction**
    - **Validates: Requirements 3.1**
    - Use `fc.string()` for sapId and `fc.integer({ min: 1, max: 8 })` for semester
    - Assert path equals `` `syllabi/${sapId}/semester_${N}.pdf` ``

  - [x] 2.3 Implement `getSyllabusRecord` function
    - Read Firestore doc at `users/{sapId}/syllabi/semester_{N}`
    - Return the document data as `SyllabusRecord` if it exists, or `null` if not
    - _Requirements: 3.3_

  - [ ]* 2.4 Write property test for syllabus metadata round-trip (P6)
    - **Property 6: Syllabus metadata round-trip**
    - **Validates: Requirements 3.2**
    - Use `fc.record({ downloadUrl: fc.webUrl(), semester: fc.integer({min:1,max:8}), fileName: fc.string({minLength:1}), uploadedAt: fc.string({minLength:1}) })`
    - Mock Firestore write/read; assert returned object has identical `downloadUrl`, `semester`, `fileName`, and non-empty `uploadedAt`

- [ ] 3. Add `generateSyllabusRoadmap` to `src/lib/gemini.ts`
  - [x] 3.1 Implement `generateSyllabusRoadmap` function with prompt construction
    - Define inline `StudentProfile` interface: `{ sapId: string; currentYear: number; techSkills: string[]; leetcodeStats?: { totalSolved: number }; projects?: unknown[]; internships?: unknown[]; cgpa?: string }`
    - Import `IntelligentRoadmap` and `generateIntelligentRoadmap` from `src/lib/roadmapGenerator.ts`
    - Build a structured prompt containing: `syllabusText`, `targetRole`, `currentYear`, `techSkills`, `leetcodeStats.totalSolved`, `projects.length`, `internships.length`, `cgpa`
    - Instruct Gemini to return only valid JSON matching `IntelligentRoadmap` shape including `subjectIndustryMap`
    - _Requirements: 4.1, 4.2_

  - [ ]* 3.2 Write property test for prompt completeness (P7)
    - **Property 7: Prompt completeness**
    - **Validates: Requirements 4.1**
    - Use `fc.record(...)` for `StudentProfile` and `fc.string()` for `syllabusText`
    - Extract the prompt string from the function (via a testable helper) and assert it contains all required fields

  - [x] 3.3 Implement Gemini call with 30-second timeout and fallback
    - Call `gemini-1.5-flash` via `genAI.getGenerativeModel` (same pattern as `analyzeProfileWithAI`)
    - Wrap the Gemini call in `Promise.race` with a 30-second timeout `Promise`
    - On timeout: call `generateIntelligentRoadmap` as fallback and return its result (no `subjectIndustryMap`)
    - On missing `VITE_GEMINI_API_KEY`: skip Gemini call, return `generateIntelligentRoadmap` result directly
    - On invalid JSON from Gemini: log error, return `generateIntelligentRoadmap` result
    - _Requirements: 4.3, 4.4, 4.5, 4.6_

  - [ ]* 3.4 Write property test for response parsing correctness (P8)
    - **Property 8: Response parsing correctness**
    - **Validates: Requirements 4.2**
    - Use `fc.record(...)` generating valid `IntelligentRoadmap` shapes (including `subjectIndustryMap`)
    - Serialize to JSON string, pass through the parser, assert structural equality

  - [ ]* 3.5 Write property test for fallback always returns valid roadmap (P9)
    - **Property 9: Fallback always returns a valid roadmap**
    - **Validates: Requirements 4.4, 4.5, 4.6**
    - Use `fc.record(...)` for `StudentProfile` and `fc.string()` for `targetRole`
    - Simulate error conditions (invalid JSON, missing key, timeout); assert returned object has all required `IntelligentRoadmap` fields, non-empty `roadmapSteps`, and `overallProgress` in [0, 100]

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Update `RoadmapPage.tsx` — state, semester selector, and syllabus uploader
  - [x] 5.1 Add new state variables and semester default logic
    - Import `generateSyllabusRoadmap` from `src/lib/gemini.ts`
    - Import `uploadSyllabusPDF`, `getSyllabusRecord`, `SyllabusRecord` from `src/services/student/syllabus.service.ts`
    - Import `extractTextFromLocalPDF` from `src/lib/pdfParser.ts`
    - Add state: `semester` (default from `(currentYear - 1) * 2 + 1`), `syllabusText`, `syllabusRecord`, `uploadProgress`, `uploadError`, `isAiGenerated`, `isGenerating`
    - _Requirements: 1.2, 1.3_

  - [ ]* 5.2 Write property test for year-to-semester default mapping (P2)
    - **Property 2: Year-to-semester default mapping**
    - **Validates: Requirements 1.3**
    - Use `fc.integer({ min: 1, max: 4 })` for `currentYear`
    - Assert `(currentYear - 1) * 2 + 1` equals expected semester (1, 3, 5, 7)

  - [x] 5.3 Implement semester selector UI and Firebase record loading
    - Render 8 pill buttons (1–8) for semester selection; active semester highlighted
    - On semester change: call `getSyllabusRecord(sapId, semester)` and update `syllabusRecord` state
    - If record exists, display existing file name and upload date banner
    - _Requirements: 1.1, 1.2, 1.4, 3.3_

  - [ ]* 5.4 Write property test for semester selector state update (P1)
    - **Property 1: Semester selector state update**
    - **Validates: Requirements 1.2**
    - Use `fc.integer({ min: 1, max: 8 })` for semester value
    - Render component, simulate selecting each semester, assert active semester state equals selected value

  - [x] 5.5 Implement syllabus PDF uploader with validation
    - Render file input (PDF-only, 10 MB limit) with drag-drop / click support
    - Validate MIME type: reject non-`application/pdf` with inline error "Please upload a valid PDF file."
    - Validate size: reject files > 10 × 1024 × 1024 bytes with inline error "File size must be under 10 MB."
    - On valid file: call `extractTextFromLocalPDF`, set `syllabusText`; on extraction failure show error and retain previous roadmap
    - Show upload progress bar using `uploadProgress` state while Firebase upload is in progress
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.5_

  - [ ]* 5.6 Write property test for file type validation (P3)
    - **Property 3: File type validation**
    - **Validates: Requirements 2.1, 2.2**
    - Use `fc.string()` for MIME type
    - Assert file is accepted iff MIME type is exactly `application/pdf`; all others show error "Please upload a valid PDF file."

  - [ ]* 5.7 Write property test for file size validation (P4)
    - **Property 4: File size validation**
    - **Validates: Requirements 2.3**
    - Use `fc.integer({ min: 0, max: 20_000_000 })` for byte size
    - Assert file is rejected with "File size must be under 10 MB." iff size > 10 × 1024 × 1024

- [ ] 6. Update `RoadmapPage.tsx` — AI generation, branding badge, and subject-industry map section
  - [x] 6.1 Wire syllabus text to `generateSyllabusRoadmap` and set `isAiGenerated`
    - When `syllabusText` is set (new upload or loaded from cache), call `generateSyllabusRoadmap` with syllabus text and student profile
    - Set `isGenerating = true` before call, `false` after; show "Gemini AI is analyzing your syllabus…" overlay while in-flight
    - Set `isAiGenerated = true` when Gemini returns successfully; `false` on fallback
    - When `syllabusText` is `null` and `targetRole` changes, call `generateIntelligentRoadmap` and set `isAiGenerated = false`
    - _Requirements: 4.3, 4.6, 4.7, 7.3, 7.4_

  - [x] 6.2 Add Firebase Storage upload in parallel with roadmap generation
    - After text extraction succeeds, call `uploadSyllabusPDF` in parallel (do not await before showing roadmap)
    - Pass `onProgress` callback to update `uploadProgress` state
    - On upload failure: show non-blocking error "Failed to save syllabus. Your roadmap was still generated."
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 6.3 Render AI branding badge and Gemini loading overlay
    - Replace the hardcoded "AI-Powered Career Roadmap" label in the header banner with a conditional badge:
      - `isAiGenerated === true` → "Gemini AI-Powered" with sparkle icon + tooltip "This roadmap was generated by Google Gemini 1.5 Flash based on your uploaded syllabus and profile."
      - `isAiGenerated === false` → "Smart Algorithmic Roadmap" (no AI label, no tooltip)
    - Render "Gemini AI is analyzing your syllabus…" loading overlay when `isGenerating === true`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 6.4 Write property test for AI branding label consistency (P12)
    - **Property 12: AI branding label consistency**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - Use `fc.boolean()` for `isAiGenerated`
    - Assert exactly one label is visible; "Gemini AI-Powered" iff `true`, "Smart Algorithmic Roadmap" iff `false`

  - [x] 6.5 Render "Syllabus Analysis" subject–industry map section
    - When `isAiGenerated === true` and `roadmap.subjectIndustryMap` is non-empty, render a "Syllabus Analysis" card
    - For each entry: show `subject` name, a relevance badge (green for "high", yellow for "medium", grey for "low"), and `supplementarySkills` as tag chips
    - When `isAiGenerated === false`, do not render this section
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.6 Write property test for subject–industry map rendering completeness (P10)
    - **Property 10: Subject–industry map rendering completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Use `fc.array(fc.record({ subject: fc.string({minLength:1}), industryRelevance: fc.constantFrom('high','medium','low'), supplementarySkills: fc.array(fc.string()) }))`
    - Assert every subject, relevance badge class, and supplementary skill tag is present in the rendered output

  - [ ]* 6.7 Write property test for Syllabus Analysis absent on fallback (P11)
    - **Property 11: Syllabus Analysis section absent on fallback**
    - **Validates: Requirements 5.4**
    - Use `fc.record(...)` for roadmap state with `isAiGenerated: false`
    - Assert "Syllabus Analysis" section is not rendered

  - [x] 6.8 Add "Regenerate Roadmap" button
    - Render button when `syllabusText` is a non-null, non-empty string
    - On click: re-invoke `generateSyllabusRoadmap` with current `syllabusText` and updated profile
    - _Requirements: 7.1, 7.2_

  - [ ]* 6.9 Write property test for regenerate button visibility (P13)
    - **Property 13: Regenerate button visibility**
    - **Validates: Requirements 7.1**
    - Use `fc.option(fc.string({ minLength: 1 }))` for `syllabusText`
    - Assert button is visible iff `syllabusText` is a non-null, non-empty string

  - [ ]* 6.10 Write property test for role change without syllabus uses algorithmic generator (P14)
    - **Property 14: Role change without syllabus uses algorithmic generator**
    - **Validates: Requirements 7.4**
    - Use `fc.constantFrom(...roles)` for `targetRole`
    - With `syllabusText === null`, simulate role change; assert `generateIntelligentRoadmap` was called (not `generateSyllabusRoadmap`) and `isAiGenerated === false`

- [x] 7. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
