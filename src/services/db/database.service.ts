import { isSupabaseEnabled } from '../../lib/supabase';
import { 
  firestoreStudents, firestoreCompanies, firestoreDrives, 
  firestoreInterviews, firestoreOffers, firestoreAudit, firestoreSettings,
  firestoreUser, firestoreEligibility, firestoreAnalytics, firestoreAdmins, firestoreCurriculum, firestoreSyllabus
} from './firestoreAdapter';
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
 * The Database Service is the single point of entry for all database operations.
 * It dynamically switches between Firestore and Supabase based on the .env configuration.
 */

const useSupabase = isSupabaseEnabled();

export const studentsDb: StudentAdapter = useSupabase ? supabaseStudents : firestoreStudents;
export const companiesDb: CompanyAdapter = useSupabase ? supabaseCompanies : firestoreCompanies;
export const drivesDb: DriveAdapter = useSupabase ? supabaseDrives : firestoreDrives;
export const interviewsDb: InterviewAdapter = useSupabase ? supabaseInterviews : firestoreInterviews;
export const offersDb: OfferAdapter = useSupabase ? supabaseOffers : firestoreOffers;
export const auditDb: AuditAdapter = useSupabase ? supabaseAudit : firestoreAudit;
export const settingsDb: SettingsAdapter = useSupabase ? supabaseSettings : firestoreSettings;
export const userDb: UserAdapter = useSupabase ? supabaseUser : firestoreUser;
export const eligibilityDb: EligibilityAdapter = useSupabase ? supabaseEligibility : firestoreEligibility;
export const analyticsDb: AnalyticsAdapter = useSupabase ? supabaseAnalytics : firestoreAnalytics;
export const adminUsersDb: AdminUserAdapter = useSupabase ? supabaseAdmins : firestoreAdmins;
export const curriculumDb: CurriculumAdapter = useSupabase ? supabaseCurriculum : firestoreCurriculum;
export const syllabusDb: SyllabusAdapter = useSupabase ? supabaseSyllabus : firestoreSyllabus;

// Log the active provider for debugging
console.log(`[DatabaseService] Active Provider: ${useSupabase ? 'Supabase' : 'Firestore'}`);
