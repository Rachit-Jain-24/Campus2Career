# Requirements Document

## Introduction

The Syllabus-Driven AI Roadmap feature enhances the existing Career Roadmap in Campus2Career by replacing the hardcoded NMIMS CSE curriculum data with a real Gemini AI-powered system. Students upload their semester syllabus PDF, the system extracts subject names, and Gemini generates a personalized placement roadmap that maps each subject to industry skills and tools. The "AI-Powered" label is made truthful by invoking the Gemini API directly from the frontend. An algorithmic fallback is retained when Gemini is unavailable. Uploaded syllabi are persisted in Firebase Storage so students do not need to re-upload on every visit.

## Glossary

- **Roadmap_Page**: The React page at `src/pages/student/RoadmapPage.tsx` that renders the career roadmap UI.
- **Syllabus_Uploader**: The UI component that accepts a PDF file from the student and triggers extraction.
- **PDF_Extractor**: The existing `extractTextFromLocalPDF()` function in `src/lib/pdfParser.ts` that converts a PDF `File` to plain text.
- **Gemini_Service**: The Gemini 1.5 Flash model accessed via `@google/generative-ai` using `VITE_GEMINI_API_KEY`.
- **AI_Roadmap_Generator**: The new function in `src/lib/gemini.ts` that sends syllabus text + student profile to Gemini and returns a structured roadmap.
- **Algorithmic_Generator**: The existing `generateIntelligentRoadmap()` in `src/lib/roadmapGenerator.ts` used as a fallback.
- **Firebase_Storage**: Cloud Storage instance exported from `src/lib/firebase.ts` used to persist uploaded syllabus PDFs.
- **Firestore**: Cloud Firestore instance used to store syllabus metadata (download URL, semester, upload timestamp) per student.
- **IntelligentRoadmap**: The TypeScript interface representing the roadmap data structure consumed by `Roadmap_Page`.
- **Subject_Industry_Map**: A section of the AI-generated roadmap that lists each syllabus subject alongside its industry relevance rating and recommended supplementary skills.
- **Semester**: An integer from 1 to 8 representing the academic semester whose syllabus is being uploaded.
- **Student**: An authenticated user with `role === 'student'` in the Campus2Career system.

---

## Requirements

### Requirement 1: Semester Selector

**User Story:** As a Student, I want to select which semester (1–8) my syllabus belongs to, so that the roadmap is generated in the correct academic context.

#### Acceptance Criteria

1. THE Roadmap_Page SHALL display a semester selector offering values 1 through 8.
2. WHEN a Student selects a semester, THE Roadmap_Page SHALL update the active semester state and reflect it in all subsequent roadmap generation calls.
3. THE Roadmap_Page SHALL default the semester selector to the semester derived from the Student's `currentYear` field (Year 1 → Semester 1, Year 2 → Semester 3, Year 3 → Semester 5, Year 4 → Semester 7).
4. WHEN a Student changes the semester selector, THE Roadmap_Page SHALL check Firebase Storage for a previously uploaded syllabus for that semester and load it if one exists.

---

### Requirement 2: Syllabus PDF Upload

**User Story:** As a Student, I want to upload my semester syllabus as a PDF, so that the AI can read my actual subjects and generate a relevant roadmap.

#### Acceptance Criteria

1. THE Syllabus_Uploader SHALL accept only files with MIME type `application/pdf`.
2. IF a Student uploads a file that is not a PDF, THEN THE Syllabus_Uploader SHALL display an inline error message: "Please upload a valid PDF file."
3. IF a Student uploads a PDF larger than 10 MB, THEN THE Syllabus_Uploader SHALL display an inline error message: "File size must be under 10 MB."
4. WHEN a valid PDF is uploaded, THE PDF_Extractor SHALL extract the full text content from the file.
5. IF the PDF_Extractor fails to extract text (e.g., scanned image PDF), THEN THE Roadmap_Page SHALL display an error: "Could not read text from this PDF. Please upload a text-based PDF." and retain the previous roadmap state.
6. WHEN text extraction succeeds, THE Roadmap_Page SHALL immediately trigger AI roadmap generation using the extracted text.

---

### Requirement 3: Firebase Storage Persistence

**User Story:** As a Student, I want my uploaded syllabus to be saved so I don't have to re-upload it every time I visit the roadmap page.

#### Acceptance Criteria

1. WHEN a Student successfully uploads a syllabus PDF, THE Roadmap_Page SHALL upload the file to Firebase Storage at path `syllabi/{sapId}/semester_{N}.pdf`, where `{N}` is the selected semester number.
2. WHEN the upload to Firebase Storage completes, THE Roadmap_Page SHALL write a Firestore document at `users/{sapId}/syllabi/semester_{N}` containing the fields: `downloadUrl` (string), `semester` (number), `uploadedAt` (ISO timestamp), and `fileName` (string).
3. WHEN a Student visits the Roadmap_Page and a Firestore syllabus record exists for the active semester, THE Roadmap_Page SHALL display the previously uploaded file name and upload date without requiring a new upload.
4. IF the Firebase Storage upload fails, THEN THE Roadmap_Page SHALL display an error: "Failed to save syllabus. Your roadmap was still generated." and continue to show the AI-generated roadmap.
5. WHILE a Firebase Storage upload is in progress, THE Syllabus_Uploader SHALL display an upload progress indicator.

---

### Requirement 4: Gemini AI Roadmap Generation

**User Story:** As a Student, I want the roadmap to be generated by real AI using my syllabus content, so that the "AI-Powered" label is accurate and the roadmap is genuinely personalized.

#### Acceptance Criteria

1. WHEN syllabus text is available, THE AI_Roadmap_Generator SHALL send a structured prompt to Gemini_Service containing: the extracted syllabus text, the Student's `targetRole`, `currentYear`, `techSkills`, `leetcodeStats.totalSolved`, `projects.length`, `internships.length`, and `cgpa`.
2. THE AI_Roadmap_Generator SHALL instruct Gemini_Service to return a valid JSON object conforming to the `IntelligentRoadmap` interface, including a `subjectIndustryMap` array where each entry contains `subject` (string), `industryRelevance` ("high" | "medium" | "low"), and `supplementarySkills` (string[]).
3. WHEN Gemini_Service returns a valid response, THE AI_Roadmap_Generator SHALL parse the JSON and return the roadmap to Roadmap_Page within 30 seconds.
4. IF Gemini_Service returns an invalid JSON response, THEN THE AI_Roadmap_Generator SHALL log the error and return the result of Algorithmic_Generator with the same input parameters.
5. IF `VITE_GEMINI_API_KEY` is empty or undefined, THEN THE AI_Roadmap_Generator SHALL skip the Gemini call and return the result of Algorithmic_Generator.
6. IF the Gemini_Service call times out after 30 seconds, THEN THE AI_Roadmap_Generator SHALL return the result of Algorithmic_Generator and display a non-blocking toast: "AI generation timed out. Showing smart fallback roadmap."
7. WHILE the AI_Roadmap_Generator is awaiting a Gemini_Service response, THE Roadmap_Page SHALL display a loading state with the message "Gemini AI is analyzing your syllabus…".

---

### Requirement 5: Subject–Industry Relevance Display

**User Story:** As a Student, I want to see which of my syllabus subjects are industry-relevant and what to learn alongside them, so that I can prioritize my study time for placement readiness.

#### Acceptance Criteria

1. WHEN an AI-generated roadmap is displayed, THE Roadmap_Page SHALL render a "Syllabus Analysis" section showing each subject from the `subjectIndustryMap`.
2. THE Roadmap_Page SHALL visually distinguish subjects by their `industryRelevance` value: "high" subjects SHALL use a green badge, "medium" subjects SHALL use a yellow badge, and "low" subjects SHALL use a grey badge.
3. FOR each subject in the `subjectIndustryMap`, THE Roadmap_Page SHALL display the `supplementarySkills` as a list of tags beneath the subject name.
4. WHEN the roadmap is generated by Algorithmic_Generator (fallback), THE Roadmap_Page SHALL NOT render the "Syllabus Analysis" section.

---

### Requirement 6: Honest AI Branding

**User Story:** As a Student, I want the roadmap page to accurately reflect whether AI was used, so that I can trust the information and explain it in presentations.

#### Acceptance Criteria

1. WHEN the roadmap is generated by Gemini_Service, THE Roadmap_Page SHALL display the label "Gemini AI-Powered" with the Gemini icon or a sparkle indicator.
2. WHEN the roadmap is generated by Algorithmic_Generator (fallback), THE Roadmap_Page SHALL display the label "Smart Algorithmic Roadmap" instead of any AI-related label.
3. THE Roadmap_Page SHALL NOT display the label "AI-Powered" when no Gemini API call was made.
4. WHEN the roadmap is generated by Gemini_Service, THE Roadmap_Page SHALL display a tooltip or info badge that reads: "This roadmap was generated by Google Gemini 1.5 Flash based on your uploaded syllabus and profile."

---

### Requirement 7: Roadmap Regeneration

**User Story:** As a Student, I want to regenerate my roadmap after changing my target role or uploading a new syllabus, so that the roadmap stays current.

#### Acceptance Criteria

1. THE Roadmap_Page SHALL display a "Regenerate Roadmap" button when a syllabus has been uploaded for the active semester.
2. WHEN a Student clicks "Regenerate Roadmap", THE Roadmap_Page SHALL re-invoke AI_Roadmap_Generator with the current syllabus text and updated profile data.
3. WHEN a Student changes the `targetRole` selector and a syllabus is already loaded, THE Roadmap_Page SHALL automatically re-invoke AI_Roadmap_Generator within 500 ms of the role change.
4. WHEN a Student changes the `targetRole` selector and no syllabus is loaded, THE Roadmap_Page SHALL invoke Algorithmic_Generator immediately.
