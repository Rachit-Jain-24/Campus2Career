import type { AdminStudentProfile } from '../../types/studentAdmin';
import type { AdminCompanyProfile, CompanyFormData } from '../../types/companyAdmin';
import type { AdminDriveProfile, DriveFormData } from '../../types/driveAdmin';
import type { AdminInterview, InterviewFormData } from '../../types/interviewAdmin';
import type { AdminOffer, OfferFormData } from '../../types/offerAdmin';
import type { PlatformSettings } from '../../types/settingsAdmin';
import type { AuditLogEntry, AuditLogWritePayload } from '../../types/auditAdmin';

export type Unsubscribe = () => void;

/**
 * Interface defining the standardized methods for Database Adapters.
 * This allows swapping between Firestore and Supabase seamlessly.
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StudentAdapter {
  fetchAllStudents(): Promise<AdminStudentProfile[]>;
  fetchStudentsPaginated(params: PaginationParams): Promise<PaginatedResult<AdminStudentProfile>>;
  getStudentBySapId(sapId: string): Promise<AdminStudentProfile | null>;
  createStudent(data: any): Promise<void>;
  deleteStudent(sapId: string): Promise<void>;
  onStudentsChange(callback: (students: AdminStudentProfile[]) => void): Unsubscribe;
}

export interface CompanyAdapter {
  fetchAllCompanies(): Promise<AdminCompanyProfile[]>;
  createCompany(data: CompanyFormData): Promise<AdminCompanyProfile>;
  updateCompany(id: string, data: Partial<CompanyFormData>): Promise<void>;
}

export interface DriveAdapter {
  fetchAllDrives(): Promise<AdminDriveProfile[]>;
  createDrive(data: DriveFormData): Promise<string>;
  updateDrive(id: string, data: Partial<DriveFormData>): Promise<void>;
  onDrivesChange(callback: (drives: AdminDriveProfile[]) => void): Unsubscribe;
}

export interface InterviewAdapter {
  getAllInterviews(): Promise<AdminInterview[]>;
  createInterview(data: InterviewFormData): Promise<AdminInterview>;
  updateInterview(id: string, data: Partial<InterviewFormData>): Promise<void>;
}

export interface OfferAdapter {
  getAllOffers(): Promise<AdminOffer[]>;
  createOffer(data: OfferFormData): Promise<AdminOffer>;
  updateOffer(id: string, data: Partial<OfferFormData>): Promise<void>;
  onOffersChange(callback: (offers: AdminOffer[]) => void): Unsubscribe;
}

export interface AuditAdapter {
  getAllLogs(): Promise<AuditLogEntry[]>;
  fetchLogs(count: number): Promise<AuditLogEntry[]>;
  logAuditEvent(payload: AuditLogWritePayload): Promise<string>;
}

export interface SettingsAdapter {
  getSettings(): Promise<PlatformSettings>;
  saveSettings(settings: PlatformSettings, adminEmail?: string): Promise<void>;
  saveSection(section: string, data: any, adminEmail?: string): Promise<void>;
}
export interface UserAdapter {
  lookupUserProfileByEmail(email: string): Promise<any | null>;
  getStudentDoc(sapId: string): Promise<any | null>;
  updateUser(collection: string, docId: string, data: any): Promise<void>;
  onProfileChange?(collection: string, docId: string, callback: (data: any) => void): Unsubscribe;
}

export interface EligibilityAdapter {
  fetchAllRules(): Promise<any[]>;
  createRule(data: any): Promise<any>;
  updateRule(id: string, data: any): Promise<void>;
  deleteRule(id: string): Promise<void>;
}

export interface AnalyticsAdapter {
  getCollectionCount(collection: string): Promise<number>;
  getDashboardStats(): Promise<any>;
}

export interface AdminUserAdapter {
  fetchAllAdmins(): Promise<any[]>;
  createAdmin(data: any): Promise<any>;
  updateAdmin(email: string, data: any): Promise<void>;
}

export interface CurriculumAdapter {
  getCurriculum(branch: string, batch: string): Promise<any | null>;
  saveCurriculum(data: any): Promise<void>;
}

export interface SyllabusAdapter {
  getSyllabusRecord(sapId: string, semester: number): Promise<any | null>;
  saveSyllabusRecord(sapId: string, semester: number, data: any): Promise<void>;
}

export interface DatabaseAdapter {
  students: StudentAdapter;
  companies: CompanyAdapter;
  drives: DriveAdapter;
  interviews: InterviewAdapter;
  offers: OfferAdapter;
  audit: AuditAdapter;
  settings: SettingsAdapter;
  user: UserAdapter;
  eligibility: EligibilityAdapter;
  analytics: AnalyticsAdapter;
  admins: AdminUserAdapter;
  curriculum: CurriculumAdapter;
  syllabus: SyllabusAdapter;
}
