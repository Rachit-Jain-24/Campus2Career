// contextmanager
// Feature: ai-career-advisor-chatbot
import type { ConversationTurn, ExtractedEntities, ContextSnapshot, PersistedSession } from './types';

// Entity dictionaries
const COMPANIES: string[] = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Google', 'Amazon', 'Microsoft',
  'Flipkart', 'Paytm', 'Zomato', 'Swiggy', 'Ola', 'Uber', 'Razorpay', 'CRED',
  'Meesho', 'PhonePe', 'Byju', 'Unacademy', 'Freshworks', 'Zoho', 'HCL',
  'Cognizant', 'Capgemini', 'IBM', 'Oracle', 'SAP', 'Salesforce', 'Adobe', 'Nvidia'
];

const ROLES: string[] = [
  'Software Engineer', 'Data Scientist', 'Backend Engineer', 'Frontend Engineer',
  'Full Stack Engineer', 'DevOps Engineer', 'Machine Learning Engineer',
  'Product Manager', 'Data Analyst', 'Cloud Engineer', 'Security Engineer',
  'Mobile Developer', 'Android Developer', 'iOS Developer', 'SDE', 'SDE-1', 'SDE-2'
];

// Skills from industryBenchmarks + common skills
const SKILLS: string[] = [
  // From industryBenchmarks requiredSkills
  'JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'MongoDB', 'PostgreSQL', 'Git',
  'REST API', 'TypeScript', 'Docker', 'Python', 'Machine Learning', 'Pandas', 'NumPy',
  'Scikit-learn', 'SQL', 'Statistics', 'Data Visualization', 'TensorFlow', 'PyTorch',
  'Java', 'Spring Boot', 'System Design', 'Microservices', 'Kubernetes', 'AWS', 'Redis',
  'Deep Learning', 'NLP', 'Computer Vision', 'Mathematics', 'MLOps', 'Research',
  'Responsive Design', 'Webpack', 'Testing', 'Linux', 'CI/CD', 'Terraform', 'Monitoring',
  'Scripting',
  // Additional common skills
  'C++', 'GCP', 'Azure', 'DSA', 'Django', 'Flask', 'GraphQL', 'REST API',
  'Machine Learning', 'Deep Learning', 'SAP', 'Go', 'Angular', 'Vue', 'MySQL',
  'Express', 'Pandas', 'NumPy'
];

// Deduplicate skills
const SKILLS_DICT: string[] = [...new Set(SKILLS)];

const WINDOW_SIZE = 10;

// Module-level state
let turns: ConversationTurn[] = [];
let accumulatedEntities: ExtractedEntities = {
  companies: [],
  roles: [],
  skills: []
};

/**
 * Append a turn to the sliding window (max 10), evicting oldest if needed.
 * Also extracts and accumulates entities from the turn content.
 */
export function addTurn(turn: ConversationTurn): void {
  turns.push(turn);
  if (turns.length > WINDOW_SIZE) {
    turns = turns.slice(turns.length - WINDOW_SIZE);
  }

  const extracted = extractEntities(turn.content);

  // Accumulate entities (no duplicates)
  for (const company of extracted.companies) {
    if (!accumulatedEntities.companies.includes(company)) {
      accumulatedEntities.companies.push(company);
    }
  }
  for (const role of extracted.roles) {
    if (!accumulatedEntities.roles.includes(role)) {
      accumulatedEntities.roles.push(role);
    }
  }
  for (const skill of extracted.skills) {
    if (!accumulatedEntities.skills.includes(skill)) {
      accumulatedEntities.skills.push(skill);
    }
  }
}

/**
 * Pattern match text against entity dictionaries (case-insensitive).
 * Returns matched companies, roles, and skills.
 */
export function extractEntities(text: string): ExtractedEntities {
  const companies: string[] = [];
  const roles: string[] = [];
  const skills: string[] = [];

  const lower = text.toLowerCase();

  for (const company of COMPANIES) {
    if (lower.includes(company.toLowerCase())) {
      companies.push(company);
    }
  }

  for (const role of ROLES) {
    if (lower.includes(role.toLowerCase())) {
      roles.push(role);
    }
  }

  for (const skill of SKILLS_DICT) {
    if (lower.includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  }

  return { companies, roles, skills };
}

/**
 * Returns the current sliding window turns and accumulated entities.
 */
export function getSnapshot(): ContextSnapshot {
  return {
    turns: [...turns],
    entities: {
      companies: [...accumulatedEntities.companies],
      roles: [...accumulatedEntities.roles],
      skills: [...accumulatedEntities.skills]
    }
  };
}

/**
 * Reset in-memory state (used by persist/restore/clear in task 5.5).
 */
export function _resetState(): void {
  turns = [];
  accumulatedEntities = { companies: [], roles: [], skills: [] };
}

const SESSION_KEY = (uid: string) => `c2c_chat_${uid}`;

/**
 * Persist current turns and entities to sessionStorage under key c2c_chat_{uid}.
 * Silently falls back on any failure.
 */
export function persist(uid: string): void {
  try {
    const data: PersistedSession = {
      version: 1,
      uid,
      turns: [...turns],
      entities: {
        companies: [...accumulatedEntities.companies],
        roles: [...accumulatedEntities.roles],
        skills: [...accumulatedEntities.skills],
      },
      lastUpdated: Date.now(),
    };
    sessionStorage.setItem(SESSION_KEY(uid), JSON.stringify(data));
  } catch {
    // silent fallback — in-memory state is still valid
  }
}

/**
 * Restore turns and entities from sessionStorage for the given uid.
 * Returns true on success, false if not found, version mismatch, or parse error.
 */
export function restore(uid: string): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY(uid));
    if (!raw) return false;
    const data = JSON.parse(raw) as PersistedSession;
    if (data.version !== 1) return false;
    turns = data.turns;
    accumulatedEntities = data.entities;
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove the sessionStorage entry for uid and reset in-memory state.
 * Silently falls back on any failure.
 */
export function clear(uid: string): void {
  try {
    sessionStorage.removeItem(SESSION_KEY(uid));
    _resetState();
  } catch {
    // silent fallback
  }
}

// Export dictionaries for use in property tests
export { COMPANIES, ROLES, SKILLS_DICT as SKILLS };
