# Implementation Plan: AI Career Advisor Chatbot

## Overview

Implement the AI Career Advisor Chatbot as a floating widget on all `requireAssessment` student routes. The implementation follows a bottom-up approach: build the NLP pipeline modules first, then the orchestrator service, then the UI components, and finally wire everything into `App.tsx`.

## Tasks

- [x] 1. Set up directory structure and shared type definitions
  - Create `src/lib/ai/` directory with an `index.ts` barrel export
  - Create `src/components/AICareerAdvisor/` directory with an `index.ts` barrel export
  - Define and export all shared interfaces from the design: `KnowledgeChunk`, `RAGResult`, `IntentResult`, `Intent`, `ConversationTurn`, `ExtractedEntities`, `ContextSnapshot`, `SentimentResult`, `SentimentLabel`, `RankedChunk`, `PersonalizationResult`, `PromptInput`, `TransparencyMeta`, `ChatbotResponse`, `PersistedSession`, `Message`
  - Place shared types in `src/lib/ai/types.ts`
  - _Requirements: 1.1, 2.1, 3.1, 4.2, 5.1, 6.1, 8.1_

- [x] 2. Implement `ragEngine.ts` — TF-IDF knowledge base and retrieval
  - [x] 2.1 Implement tokenizer, stop-word filter, TF-IDF computation, and L2 normalization
    - Implement `tokenize(text: string): string[]` with lowercase, punctuation removal, stop-word filtering (words ≤ 2 chars)
    - Implement `computeTFIDF(chunks: RawChunk[]): KnowledgeChunk[]` using the exact formulas from the design: `TF = count/length`, `IDF = ln((1+N)/(1+df))+1`, L2-normalize each vector
    - Build the IDF table over the full corpus before normalizing individual chunks
    - _Requirements: 1.2_

  - [x] 2.2 Write property test for TF-IDF vector validity (Property 2)
    - **Property 2: TF-IDF Vector Validity** — for any corpus of random strings (minLength 10, minChunks 5), every chunk's `tfidfVector` must be non-empty and all weights > 0
    - **Validates: Requirements 1.2**
    - Use `fc.array(fc.string({ minLength: 10 }), { minLength: 5 })`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 2: TF-IDF vector validity`

  - [x] 2.3 Implement knowledge base construction from data sources and `initialize()`
    - Build FAQ corpus inline (≥ 20 Q&A chunks) covering placement process, eligibility, interview tips, offer negotiation
    - Build chunks from `industryBenchmarks` (one chunk per role with skills, benchmarks, salary)
    - Build chunks from `RECOMMENDED_PROBLEMS` (one chunk per problem with title, difficulty, category, level)
    - Build student profile chunks (skills, projects, internships, goals, leetcode stats) from `StudentUser`
    - Implement `initialize(student: StudentUser): Promise<void>` — runs in `setTimeout(..., 0)` to avoid blocking UI
    - Implement `isInitialized(): boolean`
    - _Requirements: 1.1, 1.4, 1.5, 11.2_

  - [x] 2.4 Write property test for RAG corpus completeness (Property 1)
    - **Property 1: RAG Corpus Completeness** — after `initialize()` with any valid student profile, chunks from all four sources (`industry_benchmark`, `leetcode`, `faq`, `student_profile`) must be present
    - **Validates: Requirements 1.1, 1.5**
    - Use `fc.record({ skills: fc.array(fc.string()), careerTrack: fc.constantFrom(...Object.keys(industryBenchmarks)), ... })`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 1: RAG corpus completeness`

  - [x] 2.5 Implement `retrieve(query, topK?)` with cosine similarity ranking
    - Tokenize and IDF-weight the query vector (unknown terms get IDF = 1), L2-normalize
    - Compute dot product (cosine similarity) against all chunk vectors
    - Return top-5 chunks sorted by descending score as `RAGResult`
    - _Requirements: 1.3_

  - [x] 2.6 Write property test for retrieval ordering (Property 3)
    - **Property 3: Retrieval Ordering** — for any query string against a corpus with ≥ 5 chunks, `retrieve()` returns exactly 5 chunks with scores in monotonically non-increasing order
    - **Validates: Requirements 1.3**
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 3: retrieval ordering`

  - [x] 2.7 Implement `refreshProfileChunks(student: StudentUser): void`
    - Remove all existing chunks with `source === 'student_profile'`
    - Rebuild profile chunks from the new student object
    - Recompute IDF table and re-normalize all vectors to reflect the updated corpus
    - _Requirements: 1.6_

  - [x] 2.8 Write property test for profile chunk refresh (Property 4)
    - **Property 4: Profile Chunk Refresh** — after `refreshProfileChunks(newProfile)`, chunks reflect new profile data and old superseded profile chunks are absent
    - **Validates: Requirements 1.6**
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 4: profile chunk refresh`

- [x] 3. Checkpoint — Ensure RAG engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement `intentClassifier.ts` — two-stage NLP intent classification
  - [x] 4.1 Implement keyword scoring and semantic rule matching
    - Define `INTENT_KEYWORDS` dictionary exactly as specified in the design (all 6 intents with their keyword lists)
    - Define `SEMANTIC_RULES` array with all 6 regex patterns and boost values from the design
    - Implement `keywordScore(intent, message)` = `matchedKeywords.length / INTENT_KEYWORDS[intent].length`
    - Implement `semanticBoost(intent, message)` by evaluating all regex patterns
    - Implement `classify(message: string): IntentResult` — truncate input >1000 chars to 500 chars, compute combined confidence per intent, return argmax if ≥ 0.3 else fallback to `placement_advice`
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 4.2 Write property test for intent classification completeness (Property 5)
    - **Property 5: Intent Classification Completeness** — for any string input, `classify()` returns a valid `Intent` and `confidence` in [0.0, 1.0]
    - **Validates: Requirements 2.1, 2.4**
    - Use `fc.string()`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 5: intent classification completeness`

- [x] 5. Implement `contextManager.ts` — sliding window + entity extraction + sessionStorage
  - [x] 5.1 Implement sliding window and entity extraction
    - Define entity dictionaries for companies (TCS, Infosys, Wipro, Accenture, Google, Amazon, Microsoft, Flipkart, etc.), roles (Software Engineer, Data Scientist, Backend Engineer, etc.), and skills (reuse keys from `industryBenchmarks` skill lists)
    - Implement `addTurn(turn: ConversationTurn): void` — append to window, evict oldest when length > 10
    - Implement `extractEntities(text: string): ExtractedEntities` — pattern match against entity dictionaries
    - Implement `getSnapshot(): ContextSnapshot` — returns current turns + accumulated entities
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.2 Write property test for sliding window size invariant (Property 6)
    - **Property 6: Sliding Window Size Invariant** — after adding N > 10 turns, `getSnapshot().turns.length === 10` and the turns are the N most recent
    - **Validates: Requirements 3.1, 3.2**
    - Use `fc.array(fc.record({ role: fc.constantFrom('user', 'assistant'), content: fc.string(), timestamp: fc.integer() }), { minLength: 11, maxLength: 30 })`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 6: sliding window size invariant`

  - [x] 5.3 Write property test for entity extraction coverage (Property 7)
    - **Property 7: Entity Extraction Coverage** — any message containing a term from the entity dictionary must have that term in the corresponding entity array
    - **Validates: Requirements 3.3**
    - Use `fc.constantFrom(...entityDictionary)` embedded in `fc.string()`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 7: entity extraction coverage`

  - [x] 5.4 Write property test for entity accumulation monotonicity (Property 8)
    - **Property 8: Entity Accumulation Monotonicity** — entity set after N turns is always a superset of entity set after N-1 turns
    - **Validates: Requirements 3.4**
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 8: entity accumulation monotonicity`

  - [x] 5.5 Implement `persist(uid)`, `restore(uid)`, and `clear(uid)` with sessionStorage
    - Key format: `c2c_chat_{uid}`
    - Persist `PersistedSession` (version: 1, uid, turns, entities, lastUpdated) as JSON
    - On restore, check version field — discard and start fresh if mismatched
    - Wrap all `sessionStorage` calls in try/catch; silently fall back to in-memory on failure
    - _Requirements: 3.6, 10.1, 10.2, 10.4_

  - [x] 5.6 Write property test for context session round-trip (Property 9)
    - **Property 9: Context Session Round-Trip** — `persist(uid)` then `restore(uid)` on a fresh instance produces a structurally equivalent snapshot (same turns in order, same entity sets)
    - **Validates: Requirements 3.6, 10.1, 10.2**
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 9: context session round-trip`

- [x] 6. Implement `sentimentAnalyzer.ts` — weighted lexicon scoring
  - [x] 6.1 Implement weighted lexicon and scoring
    - Define `STRESS_TERMS` array (≥ 30 terms with weights) exactly as specified in the design
    - Define `CONFIDENCE_TERMS` array (≥ 20 terms with weights) exactly as specified in the design
    - Implement `analyze(message: string): SentimentResult` — scan message for all term matches, compute `rawScore = sum(confidence weights) - sum(stress weights)`, apply thresholds: < -0.5 → `stressed`, > 0.5 → `confident`, else `neutral`
    - _Requirements: 4.1, 4.2, 4.6_

  - [x] 6.2 Write property test for sentiment label validity (Property 10)
    - **Property 10: Sentiment Label Validity** — for any string input, `analyze()` returns a valid `SentimentLabel` and a finite `score`
    - **Validates: Requirements 4.2**
    - Use `fc.string()`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 10: sentiment label validity`

- [x] 7. Checkpoint — Ensure NLP pipeline tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement `personalizationEngine.ts` — profile-aware ranking + readiness score + suggested prompts
  - [x] 8.1 Implement combined scoring and year-aware ranking
    - Implement `profileRelevance(chunk, student)` = `tagOverlap(chunk.tags, studentCareerTrackSkills) / max(chunk.tags.length, 1)` where `studentCareerTrackSkills` = union of `student.skills`, `student.techSkills`, and required skills of `student.careerTrack` benchmark
    - Implement `combinedScore(chunk) = 0.6 × cosineScore + 0.4 × profileRelevance`
    - Apply year-based boosts: year 1–2 → foundational skill chunks +0.15, placement FAQ chunks -0.2; year 3–4 → internship and system design chunks +0.15
    - Filter out chunks tagged `placement_drive` or `eligibility` when `placementStatus === 'placed'`
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 8.2 Write property test for combined scoring formula invariant (Property 13)
    - **Property 13: Combined Scoring Formula Invariant** — for any set of chunks, `|combinedScore - (0.6 × cosineScore + 0.4 × profileScore)| < 0.001`
    - **Validates: Requirements 5.2**
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 13: combined scoring formula invariant`

  - [x] 8.3 Write property test for year-aware chunk ranking (Property 14)
    - **Property 14: Year-Aware Chunk Ranking** — year 1–2 students rank foundational chunks above placement FAQ chunks; year 3–4 students rank internship/system design chunks above foundational chunks
    - **Validates: Requirements 5.3, 5.4**
    - Use `fc.integer({ min: 1, max: 4 })`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 14: year-aware chunk ranking`

  - [x] 8.4 Write property test for placed student filtering (Property 15)
    - **Property 15: Placed Student Filtering** — for any student with `placementStatus === 'placed'`, no chunk tagged `placement_drive` or `eligibility` appears in `rankedChunks`
    - **Validates: Requirements 5.5**
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 15: placed student filtering`

  - [x] 8.5 Implement readiness score and suggested prompts generation
    - Delegate readiness score to `analyzeSkillGap(skills, careerTrack, leetcodeSolved, projectCount, internshipCount, cgpa)` from `src/lib/skillGapAnalysis.ts`, return `overallReadiness`
    - Generate exactly 4 suggested prompts based on student profile gaps, current year, and intent context
    - When `currentYear === 4` and `placementStatus !== 'placed'`, always include at least one prompt containing a placement-readiness keyword
    - Implement `rank(ragResult, student, intent): PersonalizationResult`
    - _Requirements: 5.1, 5.6, 9.1, 9.3, 9.4_

  - [x] 8.6 Write property test for readiness score range (Property 12)
    - **Property 12: Readiness Score Range** — for any valid `StudentUser` profile, `rank()` returns `readinessScore` in [0, 100]
    - **Validates: Requirements 5.1**
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 12: readiness score range`

  - [x] 8.7 Write property test for suggested prompts count (Property 21)
    - **Property 21: Suggested Prompts Count** — for any `StudentUser` profile, `rank()` returns exactly 4 strings in `suggestedPrompts`
    - **Validates: Requirements 9.1**
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 21: suggested prompts count`

  - [x] 8.8 Write property test for year-4 unplaced placement prompt (Property 22)
    - **Property 22: Year-4 Unplaced Placement Prompt** — for any student with `currentYear === 4` and `placementStatus !== 'placed'`, at least one of the 4 suggested prompts contains a placement-readiness keyword
    - **Validates: Requirements 9.4**
    - Use `fc.record({ currentYear: fc.constant(4), placementStatus: fc.string().filter(s => s !== 'placed') })`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 22: year-4 unplaced placement prompt`

- [x] 9. Implement `promptBuilder.ts` — 8-part structured Gemini prompt assembly
  - [x] 9.1 Implement the 8-part prompt assembly and token estimation
    - Implement `estimateTokens(text: string): number` as `Math.ceil(text.length / 4)`
    - Implement `build(input: PromptInput): string` assembling all 8 parts in order: system persona, tone instruction (mapped from `sentiment.label`), student profile summary, top-5 RAG chunks, classified intent, personalization rationale, conversation history, current user message
    - Tone instruction mapping: `stressed` → empathetic/encouraging, `confident` → direct/ambitious, `neutral` → balanced/professional (exact strings from design)
    - When `intent.intent === 'leetcode_guidance'`, inject `RECOMMENDED_PROBLEMS` filtered to `level <= student.currentYear` as additional context
    - _Requirements: 6.1, 4.3, 4.4, 4.5, 6.6_

  - [x] 9.2 Implement token budget enforcement with oldest-turn truncation
    - After assembling the full prompt, if `estimateTokens(prompt) > 8000`, remove the oldest turns from the conversation history section one at a time until the budget is met
    - _Requirements: 6.5_

  - [x] 9.3 Write property test for prompt structure completeness (Property 16)
    - **Property 16: Prompt Structure Completeness** — for any valid `PromptInput`, the built prompt contains all 8 structural sections
    - **Validates: Requirements 6.1**
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 16: prompt structure completeness`

  - [x] 9.4 Write property test for token limit enforcement (Property 17)
    - **Property 17: Token Limit Enforcement** — for any `PromptInput` with many long turns, the built prompt's estimated token count is ≤ 8000
    - **Validates: Requirements 6.5**
    - Use `fc.array(fc.string({ minLength: 200 }), { minLength: 20 })`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 17: token limit enforcement`

  - [x] 9.5 Write property test for tone instruction injection (Property 11)
    - **Property 11: Tone Instruction Injection** — for each `SentimentLabel`, the built prompt contains the corresponding tone instruction string
    - **Validates: Requirements 4.3, 4.4, 4.5**
    - Use `fc.constantFrom('stressed', 'neutral', 'confident')`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 11: tone instruction injection`

  - [x] 9.6 Write property test for LeetCode intent context injection (Property 18)
    - **Property 18: LeetCode Intent Context Injection** — when `intent === 'leetcode_guidance'`, the built prompt contains problem entries filtered to `level <= student.currentYear`
    - **Validates: Requirements 6.6**
    - Use `fc.integer({ min: 1, max: 4 })`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 18: LeetCode intent context injection`

- [x] 10. Checkpoint — Ensure prompt builder tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement `chatbotService.ts` — orchestrator with streaming and fallback
  - [x] 11.1 Implement `initialize(student)` and pipeline orchestration in `sendMessage()`
    - Instantiate `GoogleGenerativeAI` using `import.meta.env.VITE_GEMINI_API_KEY`
    - Implement `initialize(student: StudentUser): Promise<void>` — calls `ragEngine.initialize(student)` and `contextManager.restore(student.uid)`
    - Implement `sendMessage(message, student): Promise<ChatbotResponse>` — orchestrate the full pipeline: `contextManager.addTurn` → `intentClassifier.classify` → `sentimentAnalyzer.analyze` → `ragEngine.retrieve` → `personalizationEngine.rank` → `promptBuilder.build` → Gemini stream
    - _Requirements: 6.2, 6.3_

  - [x] 11.2 Implement streaming response, 15-second timeout fallback, and `clearSession()`
    - Use `model.generateContentStream(prompt)` from `@google/generative-ai`
    - Wrap the stream in `Promise.race` with a 15-second timeout; on timeout, call `buildFallbackResponse(topChunk)` and return a single-chunk async iterable
    - Handle 429 rate-limit and malformed stream errors per the error handling table in the design
    - Implement `clearSession(uid: string): void` — calls `contextManager.clear(uid)`
    - After stream completes, call `contextManager.addTurn` with the full assistant response and `contextManager.persist(student.uid)`
    - _Requirements: 6.3, 6.4, 10.3_

  - [x] 11.3 Assemble and return `TransparencyMeta` and `suggestedPrompts` with each response
    - Populate all `TransparencyMeta` fields: `intent`, `intentConfidence`, `sentimentLabel`, `sentimentScore`, `ragChunksRetrieved`, `topChunkTitle`, `placementReadinessScore`, `modelUsed`
    - Set `modelUsed` to `'local-fallback'` when the timeout fallback is triggered
    - _Requirements: 8.1, 8.2_

- [x] 12. Checkpoint — Ensure chatbot service integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement UI components — `TransparencyPanel.tsx` and `SuggestedPrompts.tsx`
  - [x] 13.1 Implement `TransparencyPanel.tsx`
    - Render a collapsible section toggled by a "Show AI Details" button
    - Display all `TransparencyMeta` fields: intent + confidence, sentiment label + score, RAG chunks retrieved + top chunk title, placement readiness score, model used label
    - Style with `bg-muted/50 text-xs rounded-lg p-3 mt-2` using Tailwind CSS only
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 13.2 Implement `SuggestedPrompts.tsx`
    - Render 4 chip buttons from the `prompts` prop
    - On click, call `onSelect(prompt)` to populate and submit the input
    - Style as pill-shaped chips using Tailwind CSS and Lucide React only
    - _Requirements: 9.1, 9.2_

- [x] 14. Implement `ChatPanel.tsx` — main chat interface
  - [x] 14.1 Implement message list, input field, and streaming render
    - Render message list with user and assistant bubbles; assistant messages include `TransparencyPanel` below each bubble
    - Implement streaming token append: update the last assistant message's `content` as each token chunk arrives from `ChatbotResponse.stream`
    - Show typing indicator animation within 100ms of `sendMessage` being called (set `isLoading = true` immediately)
    - Support send on Enter key press and send button click
    - _Requirements: 7.3, 7.5, 7.6_

  - [x] 14.2 Implement welcome message, suggested prompts display, and clear chat
    - On first open (empty message list), display welcome message containing `student.name` and `student.careerTrack`
    - Render `SuggestedPrompts` when message list is empty and after each assistant response
    - Implement "Clear Chat" button that calls `chatbotService.clearSession(student.uid)` and resets messages to the welcome message
    - _Requirements: 7.7, 9.1, 9.3, 10.3_

  - [x] 14.3 Implement full-screen mode toggle and accessibility attributes
    - Add full-screen toggle button (Lucide `Maximize2`/`Minimize2` icon) that switches between `w-[400px] h-[560px]` and `max-w-[800px] w-full h-full`
    - Set `role="dialog"` and `aria-label="AI Career Advisor Chat"` on the panel root element
    - _Requirements: 7.4, 11.5_

  - [x] 14.4 Write property test for welcome message personalization (Property 19)
    - **Property 19: Welcome Message Personalization** — for any `StudentUser` profile, the welcome message contains `student.name` and `student.careerTrack` as substrings
    - **Validates: Requirements 7.7**
    - Use `fc.record({ name: fc.string({ minLength: 1 }), careerTrack: fc.string({ minLength: 1 }) })`
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 19: welcome message personalization`

  - [x] 14.5 Write property test for transparency meta completeness (Property 20)
    - **Property 20: Transparency Meta Completeness** — every assistant response message has non-null `transparencyMeta` with all required fields having valid values
    - **Validates: Requirements 8.1, 8.2**
    - Integration test with mocked Gemini stream
    - Tag: `// Feature: ai-career-advisor-chatbot, Property 20: transparency meta completeness`

- [x] 15. Implement `ChatWidget.tsx` — floating button with unread badge
  - Render a fixed `bottom-6 right-6 z-50` circular button with Lucide `Bot` icon
  - Show unread badge (red dot with count) when `unreadCount > 0`
  - Toggle `isOpen` state on click to mount/unmount `ChatPanel`
  - Set `aria-label="Open AI Career Advisor"` on the button
  - Pass `student` prop down to `ChatPanel`; receive `onUnreadChange` callback from `ChatPanel` to update badge count
  - _Requirements: 7.1, 7.2, 7.3, 11.1, 11.5_

- [x] 16. Wire `ChatWidget` into `App.tsx` via `React.lazy`
  - Add `const ChatWidget = React.lazy(() => import('./components/AICareerAdvisor/ChatWidget'))` at the top of `App.tsx`
  - Wrap `ChatWidget` in `<Suspense fallback={null}>` and render it inside the `App` component body, visible only when `user?.role === 'student'` and `user?.assessmentCompleted === true`
  - Cast `user` to `StudentUser` before passing as the `student` prop
  - _Requirements: 7.1, 11.1_

- [x] 17. Final checkpoint — Ensure all tests pass and accessibility is verified
  - Ensure all tests pass, ask the user if questions arise.
  - Verify `aria-label` on `ChatWidget` button and `role="dialog"` + `aria-label` on `ChatPanel`

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check (install as dev dependency: `npm install --save-dev fast-check`)
- All 22 correctness properties from the design document are covered across the property test sub-tasks
- Checkpoints ensure incremental validation at each pipeline layer
