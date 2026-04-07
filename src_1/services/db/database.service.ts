import { 
  supabaseStudents, supabaseCompanies, supabaseDrives, 
  supabaseInterviews, supabaseOffers, supabaseAudit, supabaseSettings,
  supabaseUser, supabaseEligibility, supabaseAnalytics, supabaseAdmins, supabaseCurriculum, supabaseSyllabus
} from './supabaseAdapter';
import type { 
  StudentAdapter, CompanyAdapter, DriveAdapter, 
  InterviewAdapter, OfferAdapter, AuditAdapter, SettingsAdapter, UserAdapter,
  EligibilityAdapter, AnalyticsAdapter, AdminUserAdapter, CurriculumAdapter, SyllabusAdapter
} from './types';

/**
 * Database Service - Supabase Only
 * All database operations go through Supabase (PostgreSQL + Auth + Storage)
 */

export const studentsDb: StudentAdapter = supabaseStudents;
export const companiesDb: CompanyAdapter = supabaseCompanies;
export const drivesDb: DriveAdapter = supabaseDrives;
export const interviewsDb: InterviewAdapter = supabaseInterviews;
export const offersDb: OfferAdapter = supabaseOffers;
export const auditDb: AuditAdapter = supabaseAudit;
export const settingsDb: SettingsAdapter = supabaseSettings;
export const userDb: UserAdapter = supabaseUser;
export const eligibilityDb: EligibilityAdapter = supabaseEligibility;
export const analyticsDb: AnalyticsAdapter = supabaseAnalytics;
export const adminUsersDb: AdminUserAdapter = supabaseAdmins;
export const curriculumDb: CurriculumAdapter = supabaseCurriculum;
export const syllabusDb: SyllabusAdapter = supabaseSyllabus;

console.log('[DatabaseService] Using Supabase (PostgreSQL)');
