import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import logging
import traceback
import time
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import requests

app = FastAPI()

# ── Rate limiting (in-memory, per IP) ────────────────────────────────────────
RATE_LIMIT_REQUESTS = 30   # max requests
RATE_LIMIT_WINDOW   = 60   # per 60 seconds
_rate_store: dict = defaultdict(list)

def check_rate_limit(ip: str):
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    _rate_store[ip] = [t for t in _rate_store[ip] if t > window_start]
    if len(_rate_store[ip]) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")
    _rate_store[ip].append(now)

# ── OpenRouter configuration (server-side only — never sent to browser) ───────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

MODELS = [
    "google/gemini-2.0-flash-001",
    "anthropic/claude-3.5-haiku",
    "meta-llama/llama-3.1-70b-instruct"
]

import time

def call_openrouter(prompt: str, json_mode: bool = False) -> str:
    """Call OpenRouter API with fallback between free models"""
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not configured")
    
    errors = []
    
    for i, model in enumerate(MODELS):
        # Add delay between model attempts (rate limit protection)
        if i > 0:
            time.sleep(0.5)
        
        try:
            response = requests.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": os.getenv("ALLOWED_ORIGIN", "http://localhost:5173"),
                    "X-Title": "Campus2Career"
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"} if json_mode else None
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "choices" in data and len(data["choices"]) > 0:
                    content = data["choices"][0]["message"]["content"]
                    return content.replace("```json", "").replace("```", "").strip()
            elif response.status_code == 429:
                errors.append(f"{model}: Rate limited")
                continue
            else:
                errors.append(f"{model}: {response.status_code}")
        except Exception as e:
            errors.append(f"{model}: {str(e)}")
    
    raise Exception(f"All OpenRouter models failed: {errors}")

# CORS configuration - restrict to known origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://campus2career-assistant.web.app",
    "https://campus2career-assistant.firebaseapp.com",
]

# Add custom origin from environment if available
custom_origin = os.getenv("ALLOWED_ORIGIN")
if custom_origin:
    ALLOWED_ORIGINS.append(custom_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Campus2Career AI Engine is live! Deployment successful.",
        "endpoints": ["/health", "/ping", "/api/ai", "/api/generate-roadmap", "/api/run-code", "/api/analyze-resume"]
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ping")
def ping():
    """Heartbeat endpoint to keep the service awake on free tier"""
    return {"status": "alive", "timestamp": time.time()}

# ── AI Proxy endpoint — keeps API key server-side ─────────────────────────────
class AIProxyRequest(BaseModel):
    prompt: str
    json_mode: bool = False
    temperature: float = 0.7
    max_tokens: int = 2000

@app.post("/api/ai")
async def ai_proxy(req: AIProxyRequest, request: Request):
    # Rate limit by IP
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    check_rate_limit(client_ip.split(",")[0].strip())

    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")

    result = call_openrouter(req.prompt, json_mode=req.json_mode)
    return {"result": result}

class RoadmapRequest(BaseModel):
    currentYear: int
    targetRole: str
    skills: List[str]
    leetcodeSolved: int
    projectsCount: int
    internshipsCount: int = 0
    resumeUrl: str = ""
    apiKey: str

# The Accurate CSE (DS) Curriculum (Extracted from PDF for B Tech CSE (DS) Batch 2022-2026)
NMIMS_CURRICULUM = {
    "sem1": ["Calculus", "English Communication", "Basic Electrical and Electronics Engineering", "Programming for Problem Solving", "Engineering Graphics and Design", "Elements of Biology", "Professional Ethics", "Constitution of India", "Design Thinking"],
    "sem2": ["Linear Algebra and Differential Equations", "Physics", "Digital Circuits and Computer Architecture", "Principles of Economics and Management", "Environmental Science", "Python for data analysis", "Digital Manufacturing Laboratory", "Electrical and Electronics Workshop", "Critical Thinking"],
    "sem3": ["Probability and Statistics", "Data Wrangling", "Optimization methods", "Discrete Mathematics", "Data Structures and Algorithms", "Management Accounting for Engineers", "Technical Communication", "Community service"],
    "sem4": ["Statistical Methods", "Machine learning", "Introduction to Data, Signal, and Image Analysis", "Database Management Systems", "Web Programming", "Data handling and Visualization"],
    "sem5": ["Software Engineering", "Mobile Application development", "Computer Networks", "Operating Systems", "Department Elective I", "Open Elective I", "Open Elective II"],
    "sem6": ["Applied Artificial Intelligence", "Neural Networks and Deep Learning", "Advance Data Structure for Analytics", "Department Elective II", "Department Elective III", "Open Elective III", "Open Elective IV", "Interpersonal Skills"],
    "sem7": ["Cloud Computing", "Big Data", "Computer Vision", "Department Elective IV", "Department Elective V", "Open Elective V", "Capstone Project"],
    "sem8": ["Project"]
}

# Live Industry Trend Context (Mocking Google Trends via a dict for reliability during presentation)
TRENDS_DB = {
    "Frontend Developer": ["Next.js 14 Server Components", "Tailwind CSS Optimization", "State Management (Zustand/Redux)"],
    "Backend Developer": ["Go Microservices", "PostgreSQL Vector DBs", "GraphQL", "Redis Caching"],
    "Machine Learning Engineer": ["LLM Fine-tuning (LoRA)", "RAG Pipelines", "PyTorch 2.0", "HuggingFace Transformers"],
    "DevOps Engineer": ["Kubernetes Operators", "GitHub Actions CI/CD", "Terraform", "Prometheus Monitoring"],
    "Software Engineer": ["System Design (High-Level)", "Cloud Native Architecture (AWS/GCP)", "Message Queues (Kafka)"]
}

# Legacy Roadmap Context (Few-shot examples for higher quality generation)
LEGACY_ROADMAP_CONTEXT = {
    "Software Engineer": {
        "skillsToMaster": ["C/C++", "Advanced DSA", "React", "Node.js", "System Design"],
        "projectsToBuild": ["E-commerce Website", "Task Manager App", "Scalable Chat Application"],
        "certifications": ["Meta Front-End Developer", "AWS Cloud Practitioner"],
        "internshipGoals": "2-month summer internship in Web Dev (Year 2), 6-month product internship (Year 3)",
        "milestones": ["Solve 200+ LeetCode problems", "Build full-stack app", "Master system design basics"]
    },
    "Data Scientist": {
        "skillsToMaster": ["Python", "Statistics", "ML Algorithms", "TensorFlow", "Spark"],
        "projectsToBuild": ["Predictive Models", "Recommendation System", "End-to-end ML Pipeline"],
        "certifications": ["Machine Learning Specialization (Stanford)", "Deep Learning Specialization"],
        "internshipGoals": "Data Analysis summer internship (Year 2), 6-month ML/AI internship (Year 3)",
        "milestones": ["Build 10+ ML models", "Kaggle competitions", "Deploy ML models to cloud"]
    }
}

@app.post("/api/generate-roadmap")
async def generate_roadmap(req: RoadmapRequest):
    if not req.apiKey:
        return {"error": "Missing API Key"}

    # --- Layer 1: Base Year-wise Roadmap (Deterministic) ---
    base_roadmap = []
    # (Existing base_roadmap logic remains same)
    if req.currentYear == 1:
        base_roadmap = [
            {"title": "Solve first 50 DSA problems", "desc": "Establish a strong problem-solving foundation.", "iconKey": "Code2"},
            {"title": "Build 2 basic projects", "desc": "Apply basic programming concepts to real-world scenarios.", "iconKey": "LayoutGrid"},
            {"title": "Learn Git and GitHub", "desc": "Master version control and technical collaboration.", "iconKey": "Target"},
            {"title": "Explore domains (web, AI, data)", "desc": "Understand different career tracks to find your passion.", "iconKey": "Compass"}
        ]
    elif req.currentYear == 2:
        base_roadmap = [
            {"title": "Solve 150 DSA problems", "desc": "Improve algorithmic thinking and pattern recognition.", "iconKey": "Code2"},
            {"title": "Build 3 intermediate projects", "desc": "Deepen technical implementation skills.", "iconKey": "LayoutGrid"},
            {"title": "Learn APIs and databases", "desc": "Understand backend communication and data persistence.", "iconKey": "Server"},
            {"title": "Participate in hackathons", "desc": "Network and build under pressure.", "iconKey": "Briefcase"}
        ]
    elif req.currentYear == 3:
        base_roadmap = [
            {"title": "Solve 300 DSA problems", "desc": "Reach high proficiency for tier-1 company rounds.", "iconKey": "Code2"},
            {"title": "Build production-level projects", "desc": "Focus on scalability, performance, and clean code.", "iconKey": "LayoutGrid"},
            {"title": "Prepare professional resume", "desc": "Synthesize achievements and technical competence.", "iconKey": "FileText"},
            {"title": "Apply for summer internships", "desc": "Gain real-world industry experience.", "iconKey": "Briefcase"},
            {"title": "System design basics", "desc": "Understand high-level architectural components.", "iconKey": "Server"}
        ]
    else: # Year 4
        base_roadmap = [
            {"title": "Practice mock interviews", "desc": "Improve technical communication and articulation.", "iconKey": "Target"},
            {"title": "Revise DSA and core CS", "desc": "Keep fundamentals sharp for placement drives.", "iconKey": "GraduationCap"},
            {"title": "Improve resume ATS score", "desc": "Optimize for corporate structural algorithms.", "iconKey": "FileText"},
            {"title": "Apply to companies", "desc": "Consistent application to target placement slots.", "iconKey": "Briefcase"},
            {"title": "Advance System Design", "desc": "Prepare for senior-level architectural rounds.", "iconKey": "Server"}
        ]

    # --- Layer 2: AI Personalization & Context ---
    industry_trends = TRENDS_DB.get(req.targetRole, TRENDS_DB["Software Engineer"])
    legacy_examples = LEGACY_ROADMAP_CONTEXT.get(req.targetRole, LEGACY_ROADMAP_CONTEXT["Software Engineer"])

    prompt = f"""
        You are a senior placement coach and curriculum advisor at NMIMS.
        
        OFFICIAL NMIMS CSE (DS) CURRICULUM:
        {json.dumps(NMIMS_CURRICULUM)}

        BASE ROADMAP (Standard Year {req.currentYear} Plan):
        {json.dumps(base_roadmap)}
        
        USER STATS:
        - Tech Skills: {', '.join(req.skills)}
        - LeetCode Solved: {req.leetcodeSolved}
        - Projects: {req.projectsCount}
        - Internships: {req.internshipsCount}
        - Target Role: {req.targetRole}
        - Resume Uploaded: {'Yes' if req.resumeUrl else 'No'}
        
        TRENDING CONTEXT & LEGACY EXAMPLES:
        Trends: {json.dumps(industry_trends)}
        Legacy High-Quality Examples: {json.dumps(legacy_examples)}

        TASK:
        1. Refine the BASE ROADMAP into a personalized plan for Year {req.currentYear}.
        2. Rewrite 'desc' to be highly personal based on 'USER STATS'.
        3. EXPLAINABLE MAPPING: Create a year-by-year mapping of the NMIMS curriculum.
        4. RICH DETAILS: Provide specific skills, projects, certifications, internship goals, and milestones for the CURRENT YEAR based on the {req.targetRole} track.
        
        Return ONLY valid JSON matching this structure:
        {{
            "academicFocus": ["Identify 2 current NMIMS subjects for Year {req.currentYear} to focus on."],
            "industryGap": ["Identify 2 skills missing from their profile relevant to {req.targetRole}."],
            "roadmapSteps": [
                {{ "title": "step title", "desc": "personalized description", "iconKey": "iconName" }}
            ],
            "curriculumMapping": [
                {{
                    "year": 1,
                    "focus": "Overall Career Theme",
                    "subject": "Subject name from Sem 1 or 2",
                    "reason": "Benefit for {req.targetRole}"
                }},
                {{ "year": 2, "focus": "...", "subject": "Sem 3 or 4", "reason": "..." }},
                {{ "year": 3, "focus": "...", "subject": "Sem 5 or 6", "reason": "..." }},
                {{ "year": 4, "focus": "...", "subject": "Sem 7 or 8", "reason": "..." }}
            ],
            "skillsToMaster": ["list of skills"],
            "projectsToBuild": ["list of projects"],
            "certifications": ["list of certs"],
            "internshipGoals": "description of internship targets",
            "milestones": ["3-5 clear milestones to track for Year {req.currentYear}"]
        }}
    """
    
    try:
        text = call_openrouter(prompt, json_mode=True)
        data = json.loads(text)
        return data
    except Exception as e:
        logging.error(f"Failed to generate: {e}")
        # Build a basic fallback curriculum mapping
        fallback_curriculum = []
        for y in range(1, 5):
            fallback_curriculum.append({
                "year": y,
                "focus": f"Year {y} Fundamentals",
                "subject": "Core Subjects",
                "reason": f"Building base for {req.targetRole}"
            })
        
        return {
            "academicFocus": ["Maintain CORE CS performance"],
            "industryGap": ["Live trends analysis unavailable"],
            "roadmapSteps": base_roadmap,
            "curriculumMapping": fallback_curriculum
        }

class SpeechAnalysisRequest(BaseModel):
    transcript: str
    durationSeconds: float

@app.post("/api/analyze-speech")
async def analyze_speech(req: SpeechAnalysisRequest):
    filler_words = ["um", "uh", "ah", "like", "you know", "actually", "basically", "so"]
    words = req.transcript.lower().split()
    word_count = len(words)
    
    found_fillers = [word for word in words if word in filler_words]
    filler_count = len(found_fillers)
    
    # Simple speech speed logic (words per minute)
    wpm = (word_count / req.durationSeconds) * 60 if req.durationSeconds > 0 else 0
    
    # Mock confidence score based on filler word density
    filler_density = filler_count / word_count if word_count > 0 else 0
    confidence_score = max(0, min(10, 10 - (filler_density * 20)))
    
    # Mock clarity based on simple rules
    clarity = "High" if filler_density < 0.05 else "Medium" if filler_density < 0.15 else "Low"
    
    return {
        "communicationScore": max(0, min(10, 10 - (filler_count * 0.5))),
        "confidenceScore": round(confidence_score, 1),
        "fillerWordCount": filler_count,
        "speechSpeed": round(wpm, 1),
        "clarity": clarity
    }

class InterviewEvaluationRequest(BaseModel):
    question: str
    transcript: str
    skills: List[str]
    mode: str
    apiKey: str
    resumeDescription: str = ""

@app.post("/api/evaluate-interview-answer")
async def evaluate_interview_answer(req: InterviewEvaluationRequest):
    if not OPENROUTER_API_KEY:
        return {"error": "OpenRouter API not configured"}
    
    prompt = f"""
        You are an expert technical interviewer at a top tech company.
        Evaluate the following student's answer based on the provided data.
        
        INTERVIEW DATA:
        - Mode: {req.mode}
        - Question: {req.question}
        - Answer Transcript: {req.transcript}
        - Student Skills: {', '.join(req.skills)}
        - Resume Highlights: {req.resumeDescription if req.resumeDescription else "Not provided"}
        
        CRITERIA:
        1. Technical Accuracy (Is the concept correct?)
        2. Concept Clarity (Is the explanation clear?)
        3. Real-world grounding (Does it reflect their resume if relevant?)
        
        Return ONLY valid JSON matching this structure:
        {{
            "technicalScore": 0-10,
            "strengths": ["list of 2-3 specific strengths"],
            "improvements": ["list of 2-3 specific areas to improve"],
            "suggestedAnswer": "A professional, concise example answer"
        }}
    """
    
    try:
        text = call_openrouter(prompt, json_mode=True)
        data = json.loads(text)
        return data
    except Exception as e:
        logging.error(f"Evaluation failed: {e}")
        return {
            "technicalScore": 5,
            "strengths": ["Attempted to answer"],
            "improvements": ["Analysis failed partially"],
            "suggestedAnswer": "Please review the fundamentals of the topic."
        }


# ── OneCompiler proxy — keeps API key server-side, avoids browser CORS ────────
ONECOMPILER_API_KEY = os.getenv("ONECOMPILER_API_KEY", "")
ONECOMPILER_URL = "https://api.onecompiler.com/v1/run"

class CodeFile(BaseModel):
    name: str
    content: str

class CodeRunRequest(BaseModel):
    language: str
    stdin: str = ""
    files: List[CodeFile]

@app.post("/api/run-code")
async def run_code(req: CodeRunRequest, request: Request):
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    check_rate_limit(client_ip.split(",")[0].strip())

    if not ONECOMPILER_API_KEY:
        raise HTTPException(status_code=503, detail="Code execution service not configured")

    try:
        response = requests.post(
            ONECOMPILER_URL,
            headers={
                "Content-Type": "application/json",
                "X-API-Key": ONECOMPILER_API_KEY,
            },
            json={
                "language": req.language,
                "stdin": req.stdin,
                "files": [{"name": f.name, "content": f.content} for f in req.files],
            },
            timeout=30,
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"OneCompiler error: {response.text}")

        return response.json()

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Code execution timed out")
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Code execution service unavailable: {str(e)}")


class ResumeAnalysisRequest(BaseModel):
    resumeText: str
    jdText: str

@app.post("/api/analyze-resume")
async def analyze_resume(req: ResumeAnalysisRequest):
    try:
        # Preprocessing function
        def preprocess(text):
            text = text.lower()
            text = re.sub(r'[^a-z0-9\s]', ' ', text)
            return text
            
        resume_clean = preprocess(req.resumeText)
        jd_clean = preprocess(req.jdText)
        
        # Calculate semantic similarity
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([jd_clean, resume_clean])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        
        # Extract keywords from JD to check matches
        feature_names = vectorizer.get_feature_names_out()
        
        # Get top keywords based on TFIDF score in JD
        jd_dense = tfidf_matrix[0:1].todense().tolist()[0]
        jd_keywords_scores = [(feature_names[i], score) for i, score in enumerate(jd_dense) if score > 0]
        jd_keywords_scores.sort(key=lambda x: x[1], reverse=True)
        
        top_jd_keywords = [k[0] for k in jd_keywords_scores[:20] if len(k[0]) > 2] # take top 20 meaningful keywords
        
        # Check matching
        # tokenize loosely
        resume_tokens = set(resume_clean.split())
        matched_skills = [k for k in top_jd_keywords if k in resume_tokens]
        missing_keywords = [k for k in top_jd_keywords if k not in resume_tokens]
        
        match_ratio = len(matched_skills) / max(len(top_jd_keywords), 1)
        
        # Weighting: 60% cosine sim, 40% keyword match
        final_score = (similarity * 0.6) + (match_ratio * 0.4)
        score_percent = min(100, int(final_score * 100) + 15) # slight baseline bump
        
        # Generate Feedback
        exp_match = "High" if score_percent > 70 else "Medium" if score_percent > 40 else "Low"
        role_alignment = "Strong NLP Semantics" if score_percent > 70 else "Partial NLP Semantics" if score_percent > 40 else "Low Semantics"
        
        suggestions = []
        if len(missing_keywords) > 0:
            suggestions.append(f"Consider adding missing keywords: {', '.join(missing_keywords[:4])}")
        
        if similarity < 0.4:
            suggestions.append("Your resume semantics deviate from the JD. Include more exact phrasing.")
        else:
            suggestions.append("Solid semantic alignment with the JD text structure.")
            
        suggestions.append("TF-IDF vector matching processed successfully.")
        
        return {
            "score": score_percent,
            "matchDetails": {
                "experienceMatch": exp_match,
                "techStackMatch": f"{int(match_ratio * 100)}%",
                "roleAlignment": role_alignment
            },
            "extractedSkills": matched_skills,
            "missingKeywords": missing_keywords,
            "suggestions": suggestions,
            "summary": f"Python AI NLP evaluated a {score_percent}% similarity using TF-IDF cosine distances and keyword intersections."
        }
    except Exception as e:
        logging.error(f"NLP error details: {traceback.format_exc()}")
        return {"error": str(e)}
