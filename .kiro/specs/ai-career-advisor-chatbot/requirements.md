# Requirements Document

## Introduction

The AI Career Advisor Chatbot is a floating widget feature for the Campus2Career placement management system. It provides students with a personalized, context-aware career guidance assistant powered by a multi-layer AI pipeline. The pipeline combines local NLP techniques (TF-IDF retrieval, intent classification, sentiment analysis, entity extraction, and a personalization engine) with Google Gemini 1.5 Flash as the final generation layer. The chatbot is accessible from all student pages as a bottom-right floating widget and supports a full-screen mode. Each response includes a transparency panel showing which AI techniques contributed to the answer.

---

## Glossary

- **Chatbot**: The AI Career Advisor floating widget component rendered on all student pages.
- **RAG_Engine**: The Retrieval-Augmented Generation module that builds a local TF-IDF vector knowledge base from industry benchmarks, placement FAQs, company data, and the student's own profile, and retrieves the top-k relevant context chunks before each Gemini call.
- **Intent_Classifier**: The NLP module that classifies each user message into one of the defined intents using keyword matching and semantic rules.
- **Context_Manager**: The module that maintains a sliding-window conversation history and extracts named entities (companies, roles, skills) across turns.
- **Sentiment_Analyzer**: The rule-based module that scores student messages for stress or anxiety signals and returns a tone label.
- **Personalization_Engine**: The module that scores and ranks advice candidates based on the student's year, CGPA, skills, placement status, and career track.
- **Gemini**: The Google Gemini 1.5 Flash model used as the final language generation layer, called with a structured prompt assembled from all upstream AI modules.
- **Transparency_Panel**: The collapsible UI section within each chatbot response that lists which AI techniques were activated and what they contributed.
- **Knowledge_Base**: The local in-memory corpus of documents built from `industryBenchmarks.ts`, `leetcodeProblems.ts`, placement FAQs, company profiles, and the student's Firestore profile fields.
- **Student_Profile**: The Firestore document for the authenticated student containing: `skills`, `projects`, `internships`, `leetcodeStats`, `cgpa`, `careerTrack`, `branch`, `currentYear`, `placementStatus`.
- **Intent**: One of the six classified query categories: `skill_gap_query`, `interview_prep`, `company_info`, `placement_advice`, `resume_help`, `leetcode_guidance`.
- **Sentiment_Label**: One of three tone labels produced by the Sentiment_Analyzer: `stressed`, `neutral`, `confident`.
- **Chunk**: A discrete unit of text in the Knowledge_Base used for TF-IDF retrieval.
- **TF-IDF**: Term Frequency–Inverse Document Frequency, the weighting scheme used to score chunk relevance against a query.
- **Cosine_Similarity**: The similarity metric used to rank retrieved chunks against the query vector.
- **Sliding_Window**: The fixed-size buffer of the most recent N conversation turns retained by the Context_Manager.
- **Entity**: A named item (company name, role title, skill name) extracted from conversation history by the Context_Manager.

---

## Requirements

### Requirement 1: RAG Knowledge Base Construction

**User Story:** As a student, I want the chatbot to answer questions using accurate, up-to-date placement data, so that the advice I receive is grounded in real industry benchmarks and my own profile rather than generic LLM knowledge.

#### Acceptance Criteria

1. THE RAG_Engine SHALL build a Knowledge_Base in memory at chatbot initialization time by ingesting documents from: all role entries in `industryBenchmarks.ts`, all problem entries in `leetcodeProblems.ts`, a set of at least 20 placement FAQ Chunks, and the authenticated student's Student_Profile fields.
2. THE RAG_Engine SHALL represent each Chunk as a TF-IDF weighted term vector computed over the full Knowledge_Base corpus.
3. WHEN a user message is received, THE RAG_Engine SHALL compute the Cosine_Similarity between the query vector and every Chunk vector and return the top 5 Chunks ranked by descending similarity score.
4. IF the Knowledge_Base has not been initialized, THEN THE RAG_Engine SHALL initialize it before processing the first query and SHALL NOT block the UI thread during initialization.
5. THE RAG_Engine SHALL include the student's Student_Profile as a dedicated set of Chunks so that profile-specific questions retrieve personalized context.
6. WHEN the student's Student_Profile is updated in Firestore, THE RAG_Engine SHALL refresh the profile Chunks within the same session without requiring a page reload.

---

### Requirement 2: NLP Intent Classification

**User Story:** As a student, I want the chatbot to understand what kind of help I am asking for, so that it routes my question to the right knowledge and gives a focused, relevant answer.

#### Acceptance Criteria

1. WHEN a user message is received, THE Intent_Classifier SHALL classify it into exactly one of the six Intents: `skill_gap_query`, `interview_prep`, `company_info`, `placement_advice`, `resume_help`, or `leetcode_guidance`.
2. THE Intent_Classifier SHALL use a two-stage classification approach: first a keyword-matching pass over a defined keyword dictionary per Intent, then a semantic rule pass that evaluates phrase patterns and co-occurrence signals.
3. WHEN no Intent scores above the minimum confidence threshold of 0.3, THE Intent_Classifier SHALL assign the Intent `placement_advice` as the default fallback.
4. THE Intent_Classifier SHALL expose the classified Intent and its confidence score to the Transparency_Panel for display.
5. THE Intent_Classifier SHALL process each message within 50 milliseconds on the client side without any network call.

---

### Requirement 3: Contextual Memory with Entity Extraction

**User Story:** As a student, I want the chatbot to remember what I mentioned earlier in the conversation, so that I do not have to repeat myself and the advice stays coherent across multiple turns.

#### Acceptance Criteria

1. THE Context_Manager SHALL maintain a Sliding_Window of the 10 most recent conversation turns (user message + assistant response pairs).
2. WHEN a new turn is added and the Sliding_Window is full, THE Context_Manager SHALL discard the oldest turn to make room for the new one.
3. WHEN a user message is received, THE Context_Manager SHALL extract Entities of type company, role, and skill from the message using pattern matching against a predefined entity dictionary.
4. THE Context_Manager SHALL accumulate extracted Entities across all turns in the current session and make the full entity set available to the Gemini prompt builder.
5. WHEN building the Gemini prompt, THE Context_Manager SHALL include the full Sliding_Window history formatted as a structured conversation transcript.
6. IF the student closes and reopens the chatbot widget within the same browser session, THEN THE Context_Manager SHALL restore the Sliding_Window and entity set from session storage.

---

### Requirement 4: Sentiment Analysis and Tone Adaptation

**User Story:** As a student who may feel anxious about placements, I want the chatbot to detect when I am stressed and respond with an encouraging, supportive tone, so that I feel motivated rather than overwhelmed.

#### Acceptance Criteria

1. WHEN a user message is received, THE Sentiment_Analyzer SHALL score the message using a weighted keyword lexicon containing at least 30 stress-signal terms (e.g., "worried", "failing", "rejected", "scared") and at least 20 confidence-signal terms (e.g., "ready", "confident", "excited", "prepared").
2. THE Sentiment_Analyzer SHALL produce a Sentiment_Label of `stressed`, `neutral`, or `confident` based on the net weighted score of the message.
3. WHEN the Sentiment_Label is `stressed`, THE Gemini prompt builder SHALL prepend a tone instruction directing Gemini to respond with empathetic, encouraging language and to avoid listing deficiencies first.
4. WHEN the Sentiment_Label is `confident`, THE Gemini prompt builder SHALL prepend a tone instruction directing Gemini to respond with direct, ambitious, stretch-goal-oriented language.
5. WHEN the Sentiment_Label is `neutral`, THE Gemini prompt builder SHALL use a balanced, professional tone instruction.
6. THE Sentiment_Analyzer SHALL expose the Sentiment_Label and the raw score to the Transparency_Panel for display.

---

### Requirement 5: Personalization Engine

**User Story:** As a student, I want the chatbot's advice to be tailored to my specific academic year, CGPA, skills, and placement status, so that the guidance is actionable for my current situation rather than generic.

#### Acceptance Criteria

1. WHEN generating a response, THE Personalization_Engine SHALL load the authenticated student's Student_Profile and compute a placement readiness score on a 0–100 scale using the same weighted formula as the existing `analyzeSkillGap` function in `src/lib/skillGapAnalysis.ts`.
2. THE Personalization_Engine SHALL rank the top 3 advice candidates from the retrieved RAG Chunks by combining the Cosine_Similarity score (weight 0.6) with a profile-relevance score (weight 0.4) derived from how closely the Chunk's role or skill matches the student's `careerTrack` and `skills`.
3. WHEN the student's `currentYear` is 1 or 2, THE Personalization_Engine SHALL prioritize Chunks and advice related to foundational skills and project building over placement-readiness topics.
4. WHEN the student's `currentYear` is 3 or 4, THE Personalization_Engine SHALL prioritize Chunks and advice related to internships, system design, and placement readiness.
5. WHEN the student's `placementStatus` is `placed`, THE Personalization_Engine SHALL filter out placement-drive advice and instead surface career growth and negotiation topics.
6. THE Personalization_Engine SHALL expose the computed placement readiness score and the top-ranked advice rationale to the Transparency_Panel.

---

### Requirement 6: Gemini Prompt Construction and Response Generation

**User Story:** As a student, I want the chatbot to give me rich, accurate, and contextually relevant answers, so that I can act on the advice immediately.

#### Acceptance Criteria

1. WHEN generating a response, THE Chatbot SHALL assemble a structured Gemini prompt that includes, in order: (a) a system persona block, (b) the student's Student_Profile summary, (c) the top 5 RAG Chunks, (d) the classified Intent, (e) the Sentiment_Label tone instruction, (f) the Personalization_Engine's ranked advice rationale, (g) the Sliding_Window conversation history, and (h) the current user message.
2. THE Chatbot SHALL call the Gemini 1.5 Flash model using the existing `@google/generative-ai` SDK already present in the project, without adding new npm packages.
3. WHEN the Gemini API returns a response, THE Chatbot SHALL stream the response tokens to the UI using the SDK's streaming API so that text appears progressively.
4. IF the Gemini API call fails or times out after 15 seconds, THEN THE Chatbot SHALL display a fallback message generated locally from the top RAG Chunk without calling Gemini again.
5. THE Chatbot SHALL limit the assembled prompt to 8000 tokens by truncating the oldest Sliding_Window turns first if the total exceeds the limit.
6. WHEN the Intent is `leetcode_guidance`, THE Chatbot SHALL include the relevant problem entries from `leetcodeProblems.ts` filtered by the student's `currentYear` as additional context Chunks in the prompt.

---

### Requirement 7: Floating Widget UI

**User Story:** As a student, I want the chatbot to be accessible from any page without navigating away, so that I can get quick advice while working on my profile, roadmap, or LeetCode tracker.

#### Acceptance Criteria

1. THE Chatbot SHALL render as a floating widget fixed to the bottom-right corner of the viewport on all student pages that require assessment (routes under `/student/*` with `requireAssessment`).
2. WHEN the widget is in collapsed state, THE Chatbot SHALL display a circular button with an AI icon and an unread message count badge when there are unread responses.
3. WHEN the student clicks the collapsed widget button, THE Chatbot SHALL expand to a chat panel of 400px width and 560px height without obscuring the primary page content.
4. THE Chatbot SHALL provide a full-screen mode toggle button that expands the chat panel to fill the viewport with a maximum width of 800px centered.
5. WHEN the student is typing a message, THE Chatbot SHALL display a typing indicator animation in the assistant message area within 100 milliseconds of the Gemini API call being initiated.
6. THE Chatbot SHALL support sending messages by pressing the Enter key or clicking the send button.
7. WHEN the chat panel is open, THE Chatbot SHALL display a welcome message on first load that references the student's name and career track from the Student_Profile.
8. THE Chatbot SHALL render using only Tailwind CSS utility classes and Lucide React icons, without adding new UI library dependencies.

---

### Requirement 8: Transparency Panel

**User Story:** As a student, I want to see which AI techniques were used to generate each response, so that I understand how the advice was produced and can trust it more.

#### Acceptance Criteria

1. THE Chatbot SHALL attach a Transparency_Panel to every assistant response message in the chat.
2. THE Transparency_Panel SHALL display the following fields for each response: (a) detected Intent and confidence score, (b) Sentiment_Label and raw score, (c) number of RAG Chunks retrieved and the title of the top Chunk, (d) placement readiness score from the Personalization_Engine, and (e) a label indicating that Gemini 1.5 Flash was used for final generation.
3. WHEN the student clicks a "Show AI Details" toggle on a response, THE Transparency_Panel SHALL expand inline below the response text without navigating away.
4. WHEN the student clicks the toggle again, THE Transparency_Panel SHALL collapse.
5. THE Transparency_Panel SHALL be styled distinctly from the response text using a muted background and smaller font size so it does not distract from the main answer.

---

### Requirement 9: Suggested Prompts and Quick Actions

**User Story:** As a student who is unsure what to ask, I want the chatbot to suggest relevant questions based on my profile, so that I can get started quickly without having to think of a question.

#### Acceptance Criteria

1. WHEN the chat panel is first opened, THE Chatbot SHALL display 4 suggested prompt chips generated by the Personalization_Engine based on the student's Student_Profile gaps and current year.
2. WHEN the student clicks a suggested prompt chip, THE Chatbot SHALL populate the input field with the chip text and submit it immediately.
3. THE Personalization_Engine SHALL regenerate the suggested prompts after each response to reflect the evolving conversation context.
4. WHEN the student's `currentYear` is 4 and `placementStatus` is not `placed`, THE Personalization_Engine SHALL always include at least one suggested prompt related to placement readiness assessment.

---

### Requirement 10: Conversation Persistence and Session Management

**User Story:** As a student, I want my conversation history to be saved so that I can continue a previous conversation when I return to the platform.

#### Acceptance Criteria

1. THE Context_Manager SHALL persist the Sliding_Window conversation history to the browser's `sessionStorage` under a key namespaced by the student's `uid`.
2. WHEN the student navigates between student pages within the same browser session, THE Chatbot SHALL restore the conversation history from `sessionStorage` so the chat is continuous.
3. THE Chatbot SHALL provide a "Clear Chat" button that clears both the in-memory Sliding_Window and the `sessionStorage` entry and resets the chat to the welcome message.
4. IF `sessionStorage` is unavailable, THEN THE Chatbot SHALL operate with an in-memory-only Sliding_Window and SHALL NOT throw an error or block the UI.
5. THE Chatbot SHALL NOT persist conversation history to Firestore in order to avoid additional read/write costs.

---

### Requirement 11: Performance and Accessibility

**User Story:** As a student on a low-bandwidth connection, I want the chatbot to load quickly and remain usable, so that slow network conditions do not prevent me from getting career advice.

#### Acceptance Criteria

1. THE Chatbot component SHALL be code-split using React lazy loading so that it does not increase the initial page bundle size.
2. THE RAG_Engine Knowledge_Base initialization SHALL complete within 500 milliseconds on a modern browser without a network call.
3. THE Chatbot SHALL display a skeleton loading state while the Student_Profile is being fetched from Firestore.
4. WHEN the Gemini API is unavailable, THE Chatbot SHALL surface a locally generated fallback response using only the RAG_Engine top Chunk within 200 milliseconds.
5. THE Chatbot widget button SHALL have an `aria-label` of "Open AI Career Advisor" and the chat panel SHALL have `role="dialog"` and `aria-label="AI Career Advisor Chat"` for screen reader compatibility.
6. THE Chatbot SHALL maintain a color contrast ratio of at least 4.5:1 between text and background in both the widget button and the chat panel.
