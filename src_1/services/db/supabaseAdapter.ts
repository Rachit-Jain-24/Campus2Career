import { supabase } from '../../lib/supabase';
import type { 
  StudentAdapter, CompanyAdapter, DriveAdapter, 
  InterviewAdapter, OfferAdapter, AuditAdapter, SettingsAdapter, UserAdapter,
  EligibilityAdapter, AnalyticsAdapter, AdminUserAdapter, CurriculumAdapter, SyllabusAdapter,
  PaginationParams, PaginatedResult
} from './types';
import type { AdminStudentProfile } from '../../types/studentAdmin';
import type { AdminCompanyProfile, CompanyFormData } from '../../types/companyAdmin';
import type { AdminDriveProfile, DriveFormData } from '../../types/driveAdmin';
import type { AdminInterview, InterviewFormData } from '../../types/interviewAdmin';
import type { AdminOffer, OfferFormData } from '../../types/offerAdmin';
import type { AuditLogEntry, AuditLogWritePayload } from '../../types/auditAdmin';
import type { PlatformSettings } from '../../types/settingsAdmin';

// Helper function to map student data
const mapStudentData = (s: any): AdminStudentProfile => ({
  id: s.id,
  sapId: s.sap_id,
  fullName: s.name,
  email: s.email,
  department: s.branch || 'Unknown',
  currentYear: s.current_year || 'Unknown',
  cgpa: Number(s.cgpa || 0),
  readinessScore: Number(s.readiness_score || 0),
  careerGoal: (s.career_track as any) || 'Undecided',
  placementStatus: (s.placement_status as any) || 'unplaced',
  eligibilityStatus: 'pending_review',
  resumeStatus: s.resume_url ? 'pending' : 'not_uploaded',
  internshipCompleted: false,
  contact: s.phone || '',
  skills: s.skills || [],
  certifications: s.certifications || [],
  projectsCount: s.projects?.length || 0,
  offersCount: 0,
  achievements: s.achievements || [],
  bio: s.bio || '',
  leetcodeStats: {
    totalSolved: s.leetcode_total_solved || 0,
    easySolved: s.leetcode_easy_solved || 0,
    mediumSolved: s.leetcode_medium_solved || 0,
    hardSolved: s.leetcode_hard_solved || 0
  },
  lastUpdated: new Date(s.updated_at)
} as AdminStudentProfile);

// --- Student Adapter ---
export const supabaseStudents: StudentAdapter = {
  async fetchAllStudents(): Promise<AdminStudentProfile[]> {
    const { data, error } = await supabase
      .from('student_readiness_v')
      .select('*');
    
    if (error) throw error;
    
    return data.map(mapStudentData);
  },

  async fetchStudentsPaginated(params: PaginationParams): Promise<PaginatedResult<AdminStudentProfile>> {
    const { page, pageSize, sortBy = 'name', sortOrder = 'asc', filters = {} } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query with filters
    let query = supabase
      .from('student_readiness_v')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.department) {
      query = query.eq('branch', filters.department);
    }
    if (filters.currentYear) {
      query = query.eq('current_year', filters.currentYear);
    }
    if (filters.placementStatus) {
      query = query.eq('placement_status', filters.placementStatus);
    }
    if (filters.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%,sap_id.ilike.%${filters.searchQuery}%`);
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order(sortBy === 'name' ? 'name' : sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: (data || []).map(mapStudentData),
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  },

  async getStudentBySapId(sapId: string): Promise<AdminStudentProfile | null> {
    const { data, error } = await supabase
      .from('student_readiness_v')
      .select('*')
      .eq('sap_id', sapId)
      .single();
    
    if (error) return null;
    
    return mapStudentData(data);
  },

  onStudentsChange(callback: (students: AdminStudentProfile[]) => void): () => void {
    const channel = supabase
      .channel('public:students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, async () => {
        const students = await this.fetchAllStudents();
        callback(students);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_skills' }, async () => {
        const students = await this.fetchAllStudents();
        callback(students);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_projects' }, async () => {
        const students = await this.fetchAllStudents();
        callback(students);
      })
      .subscribe();
      
    return () => { channel.unsubscribe(); };
  },

  async deleteStudent(sapId: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('sap_id', sapId);
      
    if (error) throw error;
  },

  async createStudent(data: any): Promise<void> {
    const { error } = await supabase
      .from('students')
      .upsert({
        sap_id: data.sapId,
        uid: data.id,
        id: data.id,
        roll_no: data.rollNo,
        name: data.name,
        email: data.email,
        branch: data.branch,
        current_year: String(data.currentYear),
        batch: data.batch,
        cgpa: parseFloat(data.cgpa || "0"),
        phone: data.phone,
        bio: data.bio,
        location: data.location,
        career_track: data.careerTrack,
        career_track_emoji: data.careerTrackEmoji,
        career_discovery_completed: data.careerDiscoveryCompleted,
        placement_status: data.placementStatus,
        profile_completed: data.profileCompleted,
        onboarding_step: data.onboardingStep,
        github_url: data.githubUrl,
        linkedin_url: data.linkedinUrl,
        leetcode_username: data.leetcode,
        leetcode_total_solved: data.leetcodeStats?.totalSolved || 0,
        leetcode_easy_solved: data.leetcodeStats?.easySolved || 0,
        leetcode_medium_solved: data.leetcodeStats?.mediumSolved || 0,
        leetcode_hard_solved: data.leetcodeStats?.hardSolved || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'sap_id' }); // update existing row if sap_id already exists
      
    if (error) throw error;
  }
};

// --- Company Adapter ---
export const supabaseCompanies: CompanyAdapter = {
  async fetchAllCompanies(): Promise<AdminCompanyProfile[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*, company_departments(department), company_job_roles(role)')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(c => ({
      id: c.firestore_id || c.id,
      companyName: c.company_name,
      industry: c.industry,
      website: c.website,
      hrName: c.hr_name,
      hrEmail: c.hr_email,
      hrPhone: c.hr_phone,
      packageRange: c.package_range,
      eligibleDepartments: c.company_departments?.map((d: any) => d.department) || [],
      location: c.location,
      hiringMode: (c.hiring_mode as any) || 'on-campus',
      jobRoles: c.company_job_roles?.map((r: any) => r.role) || [],
      status: (c.status as any) || 'upcoming',
      notes: c.notes,
      logoUrl: c.logo_url,
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at)
    } as AdminCompanyProfile));
  },

  async createCompany(formData: CompanyFormData): Promise<AdminCompanyProfile> {
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        company_name: formData.companyName,
        industry: formData.industry,
        website: formData.website,
        hr_name: formData.hrName,
        hr_email: formData.hrEmail,
        hr_phone: formData.hrPhone,
        package_range: formData.packageRange,
        location: formData.location,
        hiring_mode: formData.hiringMode,
        status: formData.status,
        notes: formData.notes,
        logo_url: formData.logoUrl
      })
      .select()
      .single();
    
    if (error) throw error;

    // Handle nested collections
    if (formData.eligibleDepartments.length > 0) {
      await supabase.from('company_departments').insert(
        formData.eligibleDepartments.map(dept => ({ company_id: company.id, department: dept }))
      );
    }
    if (formData.jobRoles.length > 0) {
      await supabase.from('company_job_roles').insert(
        formData.jobRoles.map(role => ({ company_id: company.id, role }))
      );
    }

    return {
      ...formData,
      id: company.id,
      createdAt: new Date(company.created_at),
      updatedAt: new Date(company.updated_at)
    };
  },

  async updateCompany(id: string, formData: Partial<CompanyFormData>): Promise<void> {
    const updatePayload: any = {};
    if (formData.companyName) updatePayload.company_name = formData.companyName;
    if (formData.industry) updatePayload.industry = formData.industry;
    if (formData.website) updatePayload.website = formData.website;
    if (formData.hrName) updatePayload.hr_name = formData.hrName;
    if (formData.hrEmail) updatePayload.hr_email = formData.hrEmail;
    if (formData.hrPhone) updatePayload.hr_phone = formData.hrPhone;
    if (formData.packageRange) updatePayload.package_range = formData.packageRange;
    if (formData.location) updatePayload.location = formData.location;
    if (formData.hiringMode) updatePayload.hiring_mode = formData.hiringMode;
    if (formData.status) updatePayload.status = formData.status;
    if (formData.notes) updatePayload.notes = formData.notes;
    if (formData.logoUrl) updatePayload.logo_url = formData.logoUrl;
    
    updatePayload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('companies')
      .update(updatePayload)
      .eq('id', id);
    
    if (error) throw error;
  }
};

// --- Drive Adapter ---
export const supabaseDrives: DriveAdapter = {
  async fetchAllDrives(): Promise<AdminDriveProfile[]> {
    const { data, error } = await supabase
      .from('drives')
      .select('*, drive_stages(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(d => ({
      id: d.id,
      companyId: d.company_id,
      companyName: d.company_name,
      title: d.title,
      status: (d.status as any) || 'upcoming',
      jobRole: d.job_role || d.title,
      packageRange: d.package_range || 'TBD',
      location: d.location || 'Multiple',
      mode: d.mode || 'on-campus',
      description: d.description || '',
      eligibilityRules: d.eligibility_rules || {
        allowedDepartments: [],
        allowedYears: [],
        requiresResumeApproval: false,
        mandatoryInternship: false,
        requiredSkills: [],
        minCGPA: 0,
        maxActiveBacklogs: 0,
        maxHistoryBacklogs: 0,
      },
      registrationStart: d.registration_start ? new Date(d.registration_start) : new Date(),
      registrationEnd: d.registration_end ? new Date(d.registration_end) : new Date(),
      applicantCount: d.applicant_count || 0,
      shortlistedCount: d.shortlisted_count || 0,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
      stages: d.drive_stages?.map((s: any) => ({
        id: s.id,
        name: s.stage_name,
        date: s.stage_date ? new Date(s.stage_date) : null,
        status: s.status || 'pending'
      })) || []
    } as any)) as AdminDriveProfile[];
  },

  async createDrive(formData: DriveFormData): Promise<string> {
    // Build insert payload — only include columns that definitely exist
    // Extra columns (job_role, package_range, etc.) are added via ALTER TABLE
    const insertPayload: Record<string, any> = {
      company_id: formData.companyId && formData.companyId.length > 10 ? formData.companyId : null, // only pass if valid UUID
      company_name: formData.companyName,
      title: formData.title,
      location: formData.location,
      status: formData.status,
      registration_start: formData.registrationStart instanceof Date ? formData.registrationStart.toISOString() : formData.registrationStart,
      registration_end: formData.registrationEnd instanceof Date ? formData.registrationEnd.toISOString() : formData.registrationEnd,
    };

    // Safely add extended columns — if they don't exist yet Supabase will error
    // and we catch + retry without them
    const extendedPayload = {
      ...insertPayload,
      job_role: formData.jobRole,
      package_range: formData.packageRange,
      mode: formData.mode,
      description: formData.description,
      eligibility_rules: formData.eligibilityRules,
    };

    let drive: any;

    // Try with all columns first
    const { data: d1, error: e1 } = await supabase
      .from('drives')
      .insert(extendedPayload)
      .select()
      .single();

    if (e1) {
      // If extended columns don't exist yet, fall back to base columns only
      console.warn('[supabaseAdapter] Extended drive columns missing, using base insert:', e1.message);
      const { data: d2, error: e2 } = await supabase
        .from('drives')
        .insert(insertPayload)
        .select()
        .single();
      if (e2) throw e2;
      drive = d2;
    } else {
      drive = d1;
    }

    if (formData.stages && formData.stages.length > 0) {
      await supabase.from('drive_stages').insert(
        formData.stages.map(s => ({
          // Don't pass id — let Supabase auto-generate UUID
          drive_id: drive.id,
          stage_name: s.name,
          stage_date: s.date instanceof Date ? s.date.toISOString() : (s.date || null),
          status: s.status || 'pending',
          notes: ''
        }))
      );
    }

    return drive.id;
  },

  async updateDrive(id: string, formData: Partial<DriveFormData>): Promise<void> {
    const row: Record<string, any> = { updated_at: new Date().toISOString() };
    if (formData.companyId !== undefined) row.company_id = formData.companyId || null;
    if (formData.companyName !== undefined) row.company_name = formData.companyName;
    if (formData.title !== undefined) row.title = formData.title;
    if (formData.jobRole !== undefined) row.job_role = formData.jobRole;
    if (formData.packageRange !== undefined) row.package_range = formData.packageRange;
    if (formData.location !== undefined) row.location = formData.location;
    if (formData.mode !== undefined) row.mode = formData.mode;
    if (formData.description !== undefined) row.description = formData.description;
    if (formData.status !== undefined) row.status = formData.status;
    if (formData.registrationStart !== undefined) {
      row.registration_start = formData.registrationStart instanceof Date ? formData.registrationStart.toISOString() : formData.registrationStart;
    }
    if (formData.registrationEnd !== undefined) {
      row.registration_end = formData.registrationEnd instanceof Date ? formData.registrationEnd.toISOString() : formData.registrationEnd;
    }
    if (formData.eligibilityRules !== undefined) row.eligibility_rules = formData.eligibilityRules;

    const { error } = await supabase
      .from('drives')
      .update(row)
      .eq('id', id);
    
    if (error) throw error;
  },

  onDrivesChange(callback: (drives: AdminDriveProfile[]) => void): () => void {
    // Initial fetch immediately on subscribe
    this.fetchAllDrives()
      .then(drives => callback(drives))
      .catch(err => console.warn('[supabaseAdapter] Initial drives fetch failed:', err));

    // Then listen for real-time changes
    const channel = supabase
      .channel('public:drives')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drives' }, async () => {
        const drives = await this.fetchAllDrives();
        callback(drives);
      })
      .subscribe();
      
    return () => { channel.unsubscribe(); };
  }
};

// --- Interview Adapter ---
export const supabaseInterviews: InterviewAdapter = {
  async getAllInterviews(): Promise<AdminInterview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(i => ({
      id: i.firestore_id || i.id,
      studentId: i.student_id,
      studentName: 'Unknown',
      companyId: '',
      companyName: i.company_name,
      driveId: i.drive_id,
      driveTitle: 'Placement Drive',
      roundType: (i.round_type as any) || 'technical_interview',
      scheduledDate: new Date(i.scheduled_date),
      scheduledTime: '',
      mode: 'online',
      status: (i.status as any) || 'scheduled',
      attendanceStatus: 'pending',
      resultStatus: 'pending',
      createdAt: new Date(i.created_at),
      updatedAt: new Date(i.updated_at)
    } as any)) as AdminInterview[];
  },

  async createInterview(formData: InterviewFormData): Promise<AdminInterview> {
    const { data: interview, error } = await supabase
      .from('interviews')
      .insert({
        drive_id: formData.driveId,
        student_id: formData.studentId,
        company_name: formData.companyName,
        round_type: formData.roundType,
        scheduled_date: new Date(formData.scheduledDate).toISOString(),
        status: formData.status,
        location: formData.location
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...formData,
      id: interview.id,
      scheduledDate: new Date(formData.scheduledDate),
      createdAt: new Date(interview.created_at),
      updatedAt: new Date(interview.updated_at)
    } as any;
  },

  async updateInterview(id: string, formData: Partial<InterviewFormData>): Promise<void> {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (formData.status) updatePayload.status = formData.status;
    
    const { error } = await supabase
      .from('interviews')
      .update(updatePayload)
      .eq('id', id);
    
    if (error) throw error;
  }
};

// --- Offer Adapter ---
export const supabaseOffers: OfferAdapter = {
  async getAllOffers(): Promise<AdminOffer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(o => ({
      id: o.firestore_id || o.id,
      studentId: o.student_id,
      studentName: 'Unknown',
      companyId: o.company_id,
      companyName: o.company_name,
      driveId: o.drive_id,
      driveTitle: 'Placement Drive',
      role: o.role,
      ctc: Number(o.ctc || 0),
      location: o.location,
      status: (o.status as any) || 'issued',
      joiningDate: o.joining_date ? new Date(o.joining_date) : null,
      createdAt: new Date(o.created_at),
      updatedAt: new Date(o.updated_at)
    } as any)) as AdminOffer[];
  },

  async createOffer(formData: OfferFormData): Promise<AdminOffer> {
    const { data: offer, error } = await supabase
      .from('offers')
      .insert({
        drive_id: formData.driveId,
        student_id: formData.studentId,
        company_id: formData.companyId,
        company_name: formData.companyName,
        role: formData.role,
        ctc: formData.ctc,
        location: formData.location,
        status: formData.status,
        joining_date: formData.joiningDate?.toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...formData,
      id: offer.id,
      joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : null,
      createdAt: new Date(offer.created_at),
      updatedAt: new Date(offer.updated_at)
    } as any as AdminOffer;
  },

  async updateOffer(id: string, formData: Partial<OfferFormData>): Promise<void> {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (formData.status) updatePayload.status = formData.status;

    const { error } = await supabase
      .from('offers')
      .update(updatePayload)
      .eq('id', id);
    
    if (error) throw error;
  },

  onOffersChange(callback: (offers: AdminOffer[]) => void): () => void {
    const channel = supabase
      .channel('public:offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, async () => {
        const offers = await this.getAllOffers();
        callback(offers);
      })
      .subscribe();
      
    return () => { channel.unsubscribe(); };
  }
};

// --- Audit Adapter ---
export const supabaseAudit: AuditAdapter = {
  async getAllLogs(): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(l => ({
      id: l.firestore_id || l.id,
      actorId: l.actor_id,
      actorName: l.actor_name,
      actorEmail: l.actor_email,
      actorRole: l.actor_role,
      action: l.action,
      module: l.module,
      severity: l.severity,
      summary: l.summary,
      targetId: l.target_id,
      targetType: l.target_type,
      timestamp: new Date(l.timestamp),
      metadata: l.metadata,
      beforeSnapshot: l.before_snapshot,
      afterSnapshot: l.after_snapshot,
      ipAddress: l.ip_address,
      userAgent: l.user_agent
    } as AuditLogEntry));
  },

  async fetchLogs(count: number): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(count);
    
    if (error) throw error;
    
    return (data || []).map(l => ({
      id: l.firestore_id || l.id,
      actorId: l.actor_id,
      actorName: l.actor_name,
      actorEmail: l.actor_email,
      actorRole: l.actor_role,
      action: l.action,
      module: l.module,
      severity: l.severity,
      summary: l.summary,
      targetId: l.target_id,
      targetType: l.target_type,
      timestamp: new Date(l.timestamp),
      metadata: l.metadata,
      beforeSnapshot: l.before_snapshot,
      afterSnapshot: l.after_snapshot,
      ipAddress: l.ip_address,
      userAgent: l.user_agent
    } as AuditLogEntry));
  },

  async logAuditEvent(payload: AuditLogWritePayload): Promise<string> {
    // Build insert row — only include columns that exist in the current schema.
    // metadata, before_snapshot, after_snapshot, ip_address, user_agent are added
    // by scripts/fix-schema.sql and will be silently ignored if not yet present.
    const row: any = {
      actor_id:    payload.actorId,
      actor_name:  payload.actorName,
      actor_email: payload.actorEmail,
      actor_role:  payload.actorRole,
      action:      payload.action,
      module:      payload.module,
      severity:    payload.severity,
      summary:     payload.summary,
      target_id:   payload.targetId,
      target_type: payload.targetType,
      timestamp:   new Date().toISOString(),
    };
    // Optional columns (added by fix-schema.sql)
    if (payload.metadata !== undefined)       row.metadata        = payload.metadata;
    if (payload.beforeSnapshot !== undefined) row.before_snapshot = payload.beforeSnapshot;
    if (payload.afterSnapshot !== undefined)  row.after_snapshot  = payload.afterSnapshot;
    if (payload.ipAddress !== undefined)      row.ip_address      = payload.ipAddress;
    if (payload.userAgent !== undefined)      row.user_agent      = payload.userAgent;

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(row)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
};

// --- Settings Adapter ---
export const supabaseSettings: SettingsAdapter = {
  async getSettings(): Promise<PlatformSettings> {
    const { data, error } = await supabase
      .from('platform_config')
      .select('*')
      .eq('config_key', 'platformSettings')
      .single();

    if (error || !data) {
      // Return sensible defaults if config not found
      return {
        general: {
          platformName: 'Campus2Career',
          instituteName: 'NMIMS Hyderabad',
          supportEmail: 'placement@nmims.edu.in',
          brandLogoUrl: '',
          brandFaviconUrl: '',
          currentAcademicYear: '2025-26',
          activePlacementSeason: true,
        },
        departments: [],
        academic: { availableBatches: [], availableYears: [], semesterLabels: [], defaultProgressionYear: 'Final Year' },
        placement: { eligibilityLabels: [], driveStatusLabels: [], offerStatusLabels: [], interviewRoundLabels: [], minReadinessThreshold: 60, minResumeScoreThreshold: 70, warningCGPAThreshold: 6.0 },
        notifications: { emailNotificationsEnabled: true, inAppNotificationsEnabled: true, driveReminderDaysBefore: 2, interviewReminderHoursBefore: 24, adminAlertOnNewDrive: true, adminAlertOnOfferUpdate: true, adminAlertOnLowReadiness: true },
        security: { sessionTimeoutMinutes: data?.session_timeout_minutes || 480, auditLoggingEnabled: data?.audit_logging_enabled ?? true, requireConfirmOnDelete: true, requireConfirmOnStatusChange: true },
      } as PlatformSettings;
    }

    return {
      general: {
        platformName: data.platform_name || 'Campus2Career',
        instituteName: data.institute_name || 'NMIMS Hyderabad',
        supportEmail: data.support_email || 'placement@nmims.edu.in',
        brandLogoUrl: '',
        brandFaviconUrl: '',
        currentAcademicYear: data.current_academic_year || '2025-26',
        activePlacementSeason: data.active_placement_season === true,
      },
      departments: [],
      academic: { availableBatches: [], availableYears: [], semesterLabels: [], defaultProgressionYear: 'Final Year' },
      placement: { eligibilityLabels: [], driveStatusLabels: [], offerStatusLabels: [], interviewRoundLabels: [], minReadinessThreshold: data.min_readiness_threshold || 60, minResumeScoreThreshold: 70, warningCGPAThreshold: 6.0 },
      notifications: { emailNotificationsEnabled: true, inAppNotificationsEnabled: true, driveReminderDaysBefore: 2, interviewReminderHoursBefore: 24, adminAlertOnNewDrive: true, adminAlertOnOfferUpdate: true, adminAlertOnLowReadiness: true },
      security: { sessionTimeoutMinutes: data.session_timeout_minutes || 480, auditLoggingEnabled: data.audit_logging_enabled ?? true, requireConfirmOnDelete: true, requireConfirmOnStatusChange: true },
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      updatedBy: data.updated_by,
    } as PlatformSettings;
  },

  async saveSettings(settings: PlatformSettings, adminEmail?: string): Promise<void> {
    const { error } = await supabase
      .from('platform_config')
      .upsert({
        config_key: 'platformSettings',
        platform_name: settings.general?.platformName,
        institute_name: settings.general?.instituteName,
        support_email: settings.general?.supportEmail,
        current_academic_year: settings.general?.currentAcademicYear,
        active_placement_season: settings.general?.activePlacementSeason === true,
        min_readiness_threshold: settings.placement?.minReadinessThreshold || 60,
        session_timeout_minutes: settings.security?.sessionTimeoutMinutes || 480,
        audit_logging_enabled: settings.security?.auditLoggingEnabled ?? true,
        updated_by: adminEmail || 'system_admin',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'config_key' });

    if (error) throw error;
  },

  async saveSection(section: string, data: any, adminEmail?: string): Promise<void> {
    // Merge section into full settings and save
    const current = await this.getSettings();
    const merged = { ...current, [section]: data };
    await this.saveSettings(merged, adminEmail);
  }
};

// --- Helpers ---
const withTimeout = async (promise: Promise<any>, timeoutMs: number = 10000): Promise<any> => {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('QUERY_TIMEOUT')), timeoutMs);
  });
  return Promise.race([promise, timeout]);
};

// Maps raw Supabase snake_case student row → camelCase StudentUser shape the app expects
const mapStudentRow = (s: any): any => ({
  // Identity — uid is the Supabase Auth UUID, id is the table PK
  uid: s.uid || s.id,
  id: s.id,
  sapId: s.sap_id,
  name: s.name,
  email: s.email,
  role: 'student',
  // Academic
  branch: s.branch || '',
  rollNo: s.roll_no || '',
  currentYear: s.current_year ? parseInt(s.current_year) : 1,
  batch: s.batch || '',
  cgpa: s.cgpa ? String(s.cgpa) : '',
  // Contact
  phone: s.phone || '',
  bio: s.bio || '',
  location: s.location || '',
  // Career
  careerTrack: s.career_track || '',
  careerTrackEmoji: s.career_track_emoji || '',
  placementStatus: s.placement_status || 'unplaced',
  // Onboarding flags
  careerDiscoveryCompleted: s.career_discovery_completed === true,
  profileCompleted: s.profile_completed === true,
  assessmentCompleted: s.assessment_completed === true,
  onboardingStep: s.onboarding_step || 0,
  // Social links
  githubUrl: s.github_url || '',
  linkedinUrl: s.linkedin_url || '',
  portfolioUrl: s.portfolio_url || '',
  leetcode: s.leetcode_username || '',
  resumeUrl: s.resume_url || '',
  resumeName: s.resume_name || '',
  // Skills & interests — handle both raw table columns and view aggregates
  techSkills: s.tech_skills || s.skills || (Array.isArray(s.skill_list) ? s.skill_list.map((sk: any) => typeof sk === 'string' ? sk : sk.skill) : []),
  skills: s.skills || s.tech_skills || (Array.isArray(s.skill_list) ? s.skill_list.map((sk: any) => typeof sk === 'string' ? sk : sk.skill) : []),
  interests: s.interests || [],
  goals: s.goals || [],
  clubs: s.clubs || [],
  hobbies: s.hobbies || [],
  languages: s.languages || [],
  // Experience — prefer JSONB columns, fall back to view aggregates
  projects: s.projects || (Array.isArray(s.project_list) ? s.project_list : []),
  internships: (() => {
    const raw = s.internships || (Array.isArray(s.internship_list) ? s.internship_list : []);
    // Normalize to the shape Profile.tsx expects: { id, role, company, period, description }
    return raw.map((i: any, idx: number) => ({
      id: i.id || idx + 1,
      role: i.role || '',
      company: i.company || i.companyName || '',
      period: i.period || i.duration || '',
      description: i.description || '',
    }));
  })(),
  certifications: (() => {
    const raw = s.certifications || [];
    return raw.map((c: any, idx: number) => ({
      id: c.id || idx + 1,
      name: typeof c === 'string' ? c : (c.name || ''),
      issuer: c.issuer || '',
      year: c.year || '',
      link: c.link || '',
    }));
  })(),
  achievements: (() => {
    const raw = s.achievements || [];
    return raw.map((a: any, idx: number) => ({
      id: a.id || idx + 1,
      title: a.title || '',
      description: a.description || '',
      year: a.year || '',
    }));
  })(),
  // Assessment
  assessmentResults: s.assessment_results || null,
  academicData: s.academic_data || null,
  careerDNA: s.career_dna || null,
  sparkStreak: s.spark_streak || 0,
  sparkLastDate: s.spark_last_date || '',
  trackedLeetcodeProblems: s.tracked_leetcode_problems || [],
  interviewSessions: s.interview_sessions || [],
  resumeDescription: s.resume_description || '',
  // LeetCode
  leetcodeStats: (s.leetcode_total_solved != null) ? {
    totalSolved: s.leetcode_total_solved || 0,
    easySolved: s.leetcode_easy_solved || 0,
    mediumSolved: s.leetcode_medium_solved || 0,
    hardSolved: s.leetcode_hard_solved || 0,
    ranking: s.leetcode_ranking || 0,
    acceptanceRate: s.leetcode_acceptance_rate || 0,
    streak: s.leetcode_streak || 0,
    lastUpdated: 0,
  } : undefined,
  // Readiness
  readinessScore: Number(s.readiness_score || 0),
  // Timestamps
  createdAt: s.created_at || new Date().toISOString(),
  updatedAt: s.updated_at || new Date().toISOString(),
});

// --- User Adapter ---
export const supabaseUser: UserAdapter = {
  async lookupUserProfileByEmail(email: string): Promise<any | null> {
    try {
      // 1. Check raw students table FIRST (Instant lookup with 3s timeout)
      const { data: rawStudent } = await withTimeout(supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .maybeSingle() as any
      );

      if (rawStudent) {
        return mapStudentRow(rawStudent);
      }

      // 2. Try the Readiness View if no raw match found
      const { data: student } = await withTimeout(supabase
        .from('student_readiness_v')
        .select('*')
        .eq('email', email)
        .maybeSingle() as any
      );
        
      if (student) {
        return mapStudentRow(student);
      }

      // 3. Check admins
      const { data: admin } = await withTimeout(supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .maybeSingle() as any
      );

      if (admin) {
        return {
          ...admin,
          uid: admin.uid || admin.id,
          name: admin.full_name || admin.name,
          role: admin.role || 'system_admin',
        };
      }

      return null;
    } catch (err: any) {
      if (err.message === 'QUERY_TIMEOUT') {
        console.warn('[SupabaseAdapter] Lookup timed out. Caller will decide whether to retry or use fallback.');
        throw err; // RE-THROW TIMEOUT Specifically
      }
      console.warn('[SupabaseAdapter] Lookup skipped or timed out:', err);
      return null;
    }
  },

  async getStudentDoc(sapId: string): Promise<any | null> {
    try {
      // 1. Check raw table FIRST with timeout
      const { data: raw } = await withTimeout(supabase
        .from('students')
        .select('*')
        .eq('sap_id', sapId)
        .maybeSingle() as any
      );

      if (raw) {
        return mapStudentRow(raw);
      }

      // 2. Try view as fallback
      const { data } = await withTimeout(supabase
        .from('student_readiness_v')
        .select('*')
        .eq('sap_id', sapId)
        .maybeSingle() as any
      );
        
      if (data) {
        return mapStudentRow(data);
      }
      return null;
    } catch (err) {
      console.warn('[SupabaseAdapter] getStudentDoc timed out:', err);
      return null;
    }
  },

  async updateUser(col: string, id: string, data: any): Promise<void> {
    const table = col === 'students' ? 'students' : 'admins';
    const idField = table === 'students' ? 'sap_id' : 'email';

    if (table === 'students') {
      // Map camelCase app fields → snake_case Supabase columns
      const mapped: Record<string, any> = {
        updated_at: new Date().toISOString(),
        sap_id: id,  // always set — required for upsert onConflict: 'sap_id'
      };
      if (data.sapId !== undefined)                   mapped.sap_id = data.sapId;
      if (data.uid !== undefined) {
        mapped.uid = data.uid;
        mapped.id = data.uid;
      }
      if (data.name !== undefined)                    mapped.name = data.name;
      if (data.email !== undefined)                   mapped.email = data.email;
      if (data.phone !== undefined)                   mapped.phone = data.phone;
      if (data.bio !== undefined)                     mapped.bio = data.bio;
      if (data.branch !== undefined)                  mapped.branch = data.branch;
      if (data.rollNo !== undefined)                  mapped.roll_no = data.rollNo;
      if (data.currentYear !== undefined)             mapped.current_year = String(data.currentYear);
      if (data.batch !== undefined)                   mapped.batch = data.batch;
      if (data.cgpa !== undefined)                    mapped.cgpa = parseFloat(data.cgpa) || 0;
      if (data.location !== undefined)                mapped.location = data.location;
      if (data.careerTrack !== undefined)             mapped.career_track = data.careerTrack;
      if (data.careerTrackEmoji !== undefined)        mapped.career_track_emoji = data.careerTrackEmoji;
      if (data.careerDiscoveryCompleted !== undefined) mapped.career_discovery_completed = data.careerDiscoveryCompleted;
      if (data.profileCompleted !== undefined)        mapped.profile_completed = data.profileCompleted;
      if (data.assessmentCompleted !== undefined)     mapped.assessment_completed = data.assessmentCompleted;
      if (data.placementStatus !== undefined)         mapped.placement_status = data.placementStatus;
      if (data.onboardingStep !== undefined)          mapped.onboarding_step = data.onboardingStep;
      if (data.githubUrl !== undefined)               mapped.github_url = data.githubUrl;
      if (data.linkedinUrl !== undefined)             mapped.linkedin_url = data.linkedinUrl;
      if (data.portfolioUrl !== undefined)            mapped.portfolio_url = data.portfolioUrl;
      if (data.leetcode !== undefined)                mapped.leetcode_username = data.leetcode;
      if (data.resumeUrl !== undefined)               mapped.resume_url = data.resumeUrl;
      if (data.resumeName !== undefined)              mapped.resume_name = data.resumeName;
      if (data.techSkills !== undefined)              mapped.tech_skills = data.techSkills;
      if (data.skills !== undefined)                  mapped.skills = data.skills;
      if (data.interests !== undefined)               mapped.interests = data.interests;
      if (data.goals !== undefined)                   mapped.goals = data.goals;
      if (data.clubs !== undefined)                   mapped.clubs = data.clubs;
      if (data.hobbies !== undefined)                 mapped.hobbies = data.hobbies;
      if (data.languages !== undefined)               mapped.languages = data.languages;
      // projects/internships/certifications/achievements live in separate tables
      // (student_projects, student_internships, etc.) — skip to avoid column errors.
      if (data.assessmentResults !== undefined)       mapped.assessment_results = data.assessmentResults;
      if (data.academicData !== undefined)            mapped.academic_data = data.academicData;
      if (data.careerDNA !== undefined)               mapped.career_dna = data.careerDNA;
      if (data.sparkStreak !== undefined)             mapped.spark_streak = data.sparkStreak;
      if (data.sparkLastDate !== undefined)           mapped.spark_last_date = data.sparkLastDate;
      if (data.trackedLeetcodeProblems !== undefined) mapped.tracked_leetcode_problems = data.trackedLeetcodeProblems;
      if (data.interviewSessions !== undefined)       mapped.interview_sessions = data.interviewSessions;
      if (data.resumeDescription !== undefined)       mapped.resume_description = data.resumeDescription;
      if (data.leetcodeStats !== undefined) {
        mapped.leetcode_total_solved    = data.leetcodeStats.totalSolved  ?? 0;
        mapped.leetcode_easy_solved     = data.leetcodeStats.easySolved   ?? 0;
        mapped.leetcode_medium_solved   = data.leetcodeStats.mediumSolved ?? 0;
        mapped.leetcode_hard_solved     = data.leetcodeStats.hardSolved   ?? 0;
        mapped.leetcode_streak          = data.leetcodeStats.streak       ?? 0;
        mapped.leetcode_ranking         = data.leetcodeStats.ranking      ?? null;
        mapped.leetcode_acceptance_rate = data.leetcodeStats.acceptanceRate ?? null;
      }

      // id passed from AuthContext is the Supabase Auth UUID (uid), not sap_id
      // Match on uid column which stores the Auth UUID
      const { error } = await supabase
        .from('students')
        .update(mapped)
        .eq('uid', id);

      if (error) {
        console.error('[supabaseAdapter] update by uid failed:', error);
        // Fallback: try matching by sap_id in case uid wasn't set
        const sapIdVal = mapped.sap_id || data.sapId;
        if (sapIdVal) {
          const { error: sapError } = await supabase
            .from('students')
            .update(mapped)
            .eq('sap_id', sapIdVal);
          if (sapError) throw sapError;
        } else {
          throw error;
        }
      }

      // ── Sync relational tables so admin views stay in sync ──────────────
      // We need the student's UUID to write to related tables
      if (data.internships !== undefined || data.projects !== undefined ||
          data.certifications !== undefined || data.achievements !== undefined ||
          data.techSkills !== undefined || data.skills !== undefined) {

        const { data: studentRow } = await supabase
          .from('students')
          .select('id')
          .eq('sap_id', id)
          .maybeSingle();

        const studentUuid = studentRow?.id;
        if (studentUuid) {
          // Sync internships → student_internships
          if (data.internships !== undefined && Array.isArray(data.internships)) {
            await supabase.from('student_internships').delete().eq('student_id', studentUuid);
            if (data.internships.length > 0) {
              await supabase.from('student_internships').insert(
                data.internships.map((i: any) => ({
                  student_id: studentUuid,
                  company: i.company || i.companyName || '',
                  role: i.role || '',
                  duration: i.period || i.duration || '',
                  year: i.year || new Date().getFullYear().toString(),
                  description: i.description || '',
                }))
              );
            }
          }

          // Sync projects → student_projects
          if (data.projects !== undefined && Array.isArray(data.projects)) {
            await supabase.from('student_projects').delete().eq('student_id', studentUuid);
            if (data.projects.length > 0) {
              await supabase.from('student_projects').insert(
                data.projects.map((p: any) => ({
                  student_id: studentUuid,
                  title: p.title || '',
                  description: p.description || '',
                  tech_stack: p.tech || p.tech_stack || p.tags?.join(', ') || '',
                  github_link: p.link || p.github_link || p.githubUrl || null,
                  live_link: p.liveLink || p.live_link || null,
                  year: p.year || new Date().getFullYear().toString(),
                }))
              );
            }
          }

          // Sync certifications → student_certifications
          if (data.certifications !== undefined && Array.isArray(data.certifications)) {
            await supabase.from('student_certifications').delete().eq('student_id', studentUuid);
            if (data.certifications.length > 0) {
              await supabase.from('student_certifications').insert(
                data.certifications.map((c: any) => ({
                  student_id: studentUuid,
                  name: typeof c === 'string' ? c : (c.name || ''),
                  issuer: c.issuer || '',
                  year: c.year || '',
                  link: c.link || null,
                }))
              );
            }
          }

          // Sync achievements → student_achievements
          if (data.achievements !== undefined && Array.isArray(data.achievements)) {
            await supabase.from('student_achievements').delete().eq('student_id', studentUuid);
            if (data.achievements.length > 0) {
              await supabase.from('student_achievements').insert(
                data.achievements.map((a: any) => ({
                  student_id: studentUuid,
                  title: a.title || '',
                  description: a.description || '',
                  year: a.year || '',
                }))
              );
            }
          }

          // Sync skills → student_skills
          const skillsArray = data.techSkills || data.skills;
          if (skillsArray !== undefined && Array.isArray(skillsArray)) {
            await supabase.from('student_skills').delete().eq('student_id', studentUuid);
            if (skillsArray.length > 0) {
              await supabase.from('student_skills').insert(
                skillsArray.map((s: any) => ({
                  student_id: studentUuid,
                  skill: typeof s === 'string' ? s : (s.name || s),
                  level: 'intermediate',
                }))
              );
            }
          }
        }
      }
    } else {
      // Admins table — pass data as-is (already snake_case from admin forms)
      const { error } = await supabase
        .from(table)
        .update(data)
        .eq(idField, id);

      if (error) throw error;
    }
  },

  onProfileChange(collection: string, docId: string, callback: (data: any) => void): (() => void) {
    const table = collection === 'students' ? 'students' : 'admins';
    const idField = collection === 'students' ? 'sap_id' : 'email';

    // Setup listener for the primary table
    const channel = supabase
      .channel(`profile:${docId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: table, filter: `${idField}=eq.${docId}` }, async () => {
        const fresh = collection === 'students' ? await this.getStudentDoc(docId) : await this.lookupUserProfileByEmail(docId);
        if (fresh) callback(fresh);
      });

    // For students, also listen to related tables that affect their readiness score in the view
    if (collection === 'students') {
        const studentId = docId; // Assumes sap_id for student lookups
        // We first need the UUID for filtering related tables correctly, but for simplicity we'll just listen to the tables
        channel
          .on('postgres_changes', { event: '*', schema: 'public', table: 'student_skills' }, async () => {
            const fresh = await this.getStudentDoc(studentId);
            if (fresh) callback(fresh);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'student_projects' }, async () => {
            const fresh = await this.getStudentDoc(studentId);
            if (fresh) callback(fresh);
          });
    }

    channel.subscribe();
    return () => { channel.unsubscribe(); };
  }
};

// --- Eligibility Adapter ---
export const supabaseEligibility: EligibilityAdapter = {
  async fetchAllRules(): Promise<any[]> {
    const { data, error } = await supabase
      .from('eligibility_rules')
      .select('*, eligibility_rule_years(year), eligibility_rule_departments(department)');

    if (error) throw error;
    // Normalize column names to what the app expects
    return (data || []).map(r => ({
      ...r,
      id: r.id,
      ruleName: r.rule_name || r.ruleName || 'Unnamed Rule',
      description: r.description || '',
      minCGPA: r.min_cgpa ?? r.minCGPA ?? r.minCgpa ?? 6.0,
      active: r.active ?? true,
      maxActiveBacklogs: r.max_active_backlogs ?? r.maxActiveBacklogs ?? r.maxBacklogs ?? 0,
      maxHistoryBacklogs: r.max_history_backlogs ?? r.maxHistoryBacklogs ?? 0,
      requiresResumeApproval: r.requires_resume_approval ?? r.requiresResumeApproval ?? false,
      mandatoryInternship: r.mandatory_internship ?? r.mandatoryInternship ?? false,
      requiredSkills: r.required_skills || r.requiredSkills || [],
      linkedDriveIds: r.linked_drive_ids || r.linkedDriveIds || [],
      allowedYears: r.eligibility_rule_years?.map((y: any) => y.year) || [],
      allowedDepartments: r.eligibility_rule_departments?.map((d: any) => d.department) || [],
      createdAt: r.created_at || r.createdAt || new Date().toISOString(),
      updatedAt: r.updated_at || r.updatedAt || new Date().toISOString(),
    }));
  },
  async createRule(data: any): Promise<any> {
    // Map app fields → actual DB columns
    const row: any = {
      rule_name: data.ruleName || data.rule_name || 'New Rule',
      description: data.description || '',
      min_cgpa: data.minCGPA ?? data.minCgpa ?? data.min_cgpa ?? 6.0,
      active: data.isActive ?? data.active ?? true,
      max_active_backlogs: data.maxActiveBacklogs ?? data.maxBacklogs ?? data.max_active_backlogs ?? 0,
      max_history_backlogs: data.maxHistoryBacklogs ?? data.max_history_backlogs ?? 0,
      requires_resume_approval: data.requiresResumeApproval ?? data.requires_resume_approval ?? false,
      mandatory_internship: data.mandatoryInternship ?? data.mandatory_internship ?? false,
      required_skills: data.requiredSkills ?? data.required_skills ?? [],
      linked_drive_ids: data.linkedDriveIds ?? data.linked_drive_ids ?? [],
    };
    const { data: rule, error } = await supabase
      .from('eligibility_rules')
      .insert(row)
      .select()
      .single();

    if (error) throw error;

    if (Array.isArray(data.allowedYears) && data.allowedYears.length > 0) {
      const { error: yearsError } = await supabase
        .from('eligibility_rule_years')
        .insert(data.allowedYears.map((year: string) => ({ rule_id: rule.id, year })));
      if (yearsError) throw yearsError;
    }

    if (Array.isArray(data.allowedDepartments) && data.allowedDepartments.length > 0) {
      const { error: departmentsError } = await supabase
        .from('eligibility_rule_departments')
        .insert(data.allowedDepartments.map((department: string) => ({ rule_id: rule.id, department })));
      if (departmentsError) throw departmentsError;
    }

    return {
      ...rule,
      ruleName: rule.rule_name,
      minCGPA: rule.min_cgpa,
      maxActiveBacklogs: rule.max_active_backlogs,
      maxHistoryBacklogs: rule.max_history_backlogs,
      requiresResumeApproval: rule.requires_resume_approval,
      mandatoryInternship: rule.mandatory_internship,
      requiredSkills: rule.required_skills || [],
      linkedDriveIds: rule.linked_drive_ids || [],
      allowedYears: data.allowedYears || [],
      allowedDepartments: data.allowedDepartments || [],
      createdAt: rule.created_at,
      updatedAt: rule.updated_at,
    };
  },
  async updateRule(id: string, data: any): Promise<void> {
    const row: any = {};
    if (data.ruleName !== undefined)          row.rule_name = data.ruleName;
    if (data.rule_name !== undefined)         row.rule_name = data.rule_name;
    if (data.description !== undefined)       row.description = data.description;
    if (data.minCGPA !== undefined)           row.min_cgpa = data.minCGPA;
    if (data.minCgpa !== undefined)           row.min_cgpa = data.minCgpa;
    if (data.min_cgpa !== undefined)          row.min_cgpa = data.min_cgpa;
    if (data.isActive !== undefined)          row.active = data.isActive;
    if (data.active !== undefined)            row.active = data.active;
    if (data.maxActiveBacklogs !== undefined) row.max_active_backlogs = data.maxActiveBacklogs;
    if (data.maxBacklogs !== undefined)       row.max_active_backlogs = data.maxBacklogs;
    if (data.max_active_backlogs !== undefined) row.max_active_backlogs = data.max_active_backlogs;
    if (data.maxHistoryBacklogs !== undefined) row.max_history_backlogs = data.maxHistoryBacklogs;
    if (data.max_history_backlogs !== undefined) row.max_history_backlogs = data.max_history_backlogs;
    if (data.requiresResumeApproval !== undefined) row.requires_resume_approval = data.requiresResumeApproval;
    if (data.requires_resume_approval !== undefined) row.requires_resume_approval = data.requires_resume_approval;
    if (data.mandatoryInternship !== undefined) row.mandatory_internship = data.mandatoryInternship;
    if (data.mandatory_internship !== undefined) row.mandatory_internship = data.mandatory_internship;
    if (data.requiredSkills !== undefined) row.required_skills = data.requiredSkills;
    if (data.required_skills !== undefined) row.required_skills = data.required_skills;
    if (data.linkedDriveIds !== undefined) row.linked_drive_ids = data.linkedDriveIds;
    if (data.linked_drive_ids !== undefined) row.linked_drive_ids = data.linked_drive_ids;
    row.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('eligibility_rules')
      .update(row)
      .eq('id', id);

    if (error) throw error;

    if (Array.isArray(data.allowedYears)) {
      const { error: deleteYearsError } = await supabase
        .from('eligibility_rule_years')
        .delete()
        .eq('rule_id', id);
      if (deleteYearsError) throw deleteYearsError;

      if (data.allowedYears.length > 0) {
        const { error: insertYearsError } = await supabase
          .from('eligibility_rule_years')
          .insert(data.allowedYears.map((year: string) => ({ rule_id: id, year })));
        if (insertYearsError) throw insertYearsError;
      }
    }

    if (Array.isArray(data.allowedDepartments)) {
      const { error: deleteDepartmentsError } = await supabase
        .from('eligibility_rule_departments')
        .delete()
        .eq('rule_id', id);
      if (deleteDepartmentsError) throw deleteDepartmentsError;

      if (data.allowedDepartments.length > 0) {
        const { error: insertDepartmentsError } = await supabase
          .from('eligibility_rule_departments')
          .insert(data.allowedDepartments.map((department: string) => ({ rule_id: id, department })));
        if (insertDepartmentsError) throw insertDepartmentsError;
      }
    }
  },
  async deleteRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('eligibility_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// --- Analytics Adapter ---
export const supabaseAnalytics: AnalyticsAdapter = {
  async getCollectionCount(col: string): Promise<number> {
    const { count, error } = await supabase
      .from(col)
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  },

  async getDashboardStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('placement_analytics_v')
        .select('*')
        .single();
      if (error) throw error;
      return {
        totalStudents: data.total_students,
        activeDrives: data.active_drives,
        partnerCompanies: data.partner_companies,
        offersIssued: data.total_offers,
        interviewsCount: data.pending_interviews,
        avgReadiness: data.avg_readiness
      };
    } catch {
      // Fallback if view doesn't exist yet
      const [sR, dR, cR, oR] = await Promise.allSettled([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('drives').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('offers').select('*', { count: 'exact', head: true }),
      ]);
      return {
        totalStudents: sR.status === 'fulfilled' ? (sR.value.count || 0) : 0,
        activeDrives: dR.status === 'fulfilled' ? (dR.value.count || 0) : 0,
        partnerCompanies: cR.status === 'fulfilled' ? (cR.value.count || 0) : 0,
        offersIssued: oR.status === 'fulfilled' ? (oR.value.count || 0) : 0,
        interviewsCount: 0,
        avgReadiness: 0
      };
    }
  }
};

// --- Admin Users Adapter ---
export const supabaseAdmins: AdminUserAdapter = {
  async fetchAllAdmins(): Promise<any[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(admin => ({
      ...admin,
      // admins table uses 'name' column (not 'full_name')
      name: admin.name || admin.full_name || admin.email,
      id: admin.id || admin.email,
      createdAt: admin.created_at,
      lastLogin: admin.last_login,
    }));
  },
  async createAdmin(data: any): Promise<any> {
    // Map camelCase form fields → snake_case columns
    const row: any = {
      email: data.email,
      name: data.name || data.full_name,
      role: data.role,
      department: data.department,
      status: data.status || 'active',
      phone: data.phone,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data: admin, error } = await supabase
      .from('admins')
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return { ...admin, name: admin.name };
  },
  async updateAdmin(email: string, data: any): Promise<void> {
    // Map camelCase → snake_case for updates
    const row: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined)       row.name = data.name;
    if (data.full_name !== undefined)  row.name = data.full_name;
    if (data.role !== undefined)       row.role = data.role;
    if (data.department !== undefined) row.department = data.department;
    if (data.status !== undefined)     row.status = data.status;
    if (data.phone !== undefined)      row.phone = data.phone;
    if (data.notes !== undefined)      row.notes = data.notes;
    if (data.last_login !== undefined) row.last_login = data.last_login;

    const { error } = await supabase
      .from('admins')
      .update(row)
      .eq('email', email);

    if (error) throw error;
  }
};

// --- Curriculum Adapter ---
export const supabaseCurriculum: CurriculumAdapter = {
  async getCurriculum(branch: string, batch: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('curriculum')
      .select('*')
      .eq('branch', branch)
      .eq('batch', batch)
      .maybeSingle();
      
    if (error) throw error;
    if (!data) return null;
    
    return {
      ...data,
      downloadUrl: data.download_url,
      updatedAt: data.updated_at
    };
  },
  async saveCurriculum(data: any): Promise<void> {
    const { error } = await supabase
      .from('curriculum')
      .upsert({
        branch: data.branch,
        batch: data.batch,
        download_url: data.downloadUrl,
        semesters: data.semesters,
        uploaded_by: data.uploadedBy,
        updated_at: new Date().toISOString()
      }, { onConflict: 'branch,batch' });
      
    if (error) throw error;
  },

  async getSubjects(branch: string, batch: string, semester?: number): Promise<any[]> {
    let query = supabase
      .from('curriculum_subjects')
      .select('*')
      .eq('branch', branch)
      .eq('batch', batch)
      .order('semester', { ascending: true })
      .order('subject_name', { ascending: true });

    if (semester !== undefined) query = query.eq('semester', semester);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(r => ({
      id: r.id,
      branch: r.branch,
      batch: r.batch,
      semester: r.semester,
      subjectCode: r.subject_code || '',
      subjectName: r.subject_name,
      description: r.description || '',
      topics: r.topics || [],
      industrySkills: r.industry_skills || [],
      industryRelevance: r.industry_relevance || 'medium',
      isActive: r.is_active ?? true,
      pdfUrl: r.pdf_url || null,
      uploadedBy: r.uploaded_by || '',
      updatedAt: r.updated_at,
    }));
  },

  async saveSubject(subject: any): Promise<any> {
    const row = {
      branch: subject.branch,
      batch: subject.batch,
      semester: subject.semester,
      subject_code: subject.subjectCode || '',
      subject_name: subject.subjectName,
      description: subject.description || '',
      topics: subject.topics || [],
      industry_skills: subject.industrySkills || [],
      industry_relevance: subject.industryRelevance || 'medium',
      is_active: subject.isActive ?? true,
      pdf_url: subject.pdfUrl || null,
      uploaded_by: subject.uploadedBy || 'Program Chair',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('curriculum_subjects')
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return { ...subject, id: data.id, updatedAt: data.updated_at };
  },

  async updateSubject(id: string, updates: any): Promise<void> {
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.subjectName !== undefined)      row.subject_name = updates.subjectName;
    if (updates.subjectCode !== undefined)      row.subject_code = updates.subjectCode;
    if (updates.description !== undefined)      row.description = updates.description;
    if (updates.topics !== undefined)           row.topics = updates.topics;
    if (updates.industrySkills !== undefined)   row.industry_skills = updates.industrySkills;
    if (updates.industryRelevance !== undefined) row.industry_relevance = updates.industryRelevance;
    if (updates.isActive !== undefined)         row.is_active = updates.isActive;
    if (updates.pdfUrl !== undefined)           row.pdf_url = updates.pdfUrl;

    const { error } = await supabase
      .from('curriculum_subjects')
      .update(row)
      .eq('id', id);

    if (error) throw error;
  },

  async toggleSubject(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('curriculum_subjects')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteSubject(id: string): Promise<void> {
    const { error } = await supabase
      .from('curriculum_subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getActiveSubjectsForRoadmap(branch: string, batch: string): Promise<Record<number, any[]>> {
    const { data, error } = await supabase
      .from('curriculum_subjects')
      .select('*')
      .eq('branch', branch)
      .eq('batch', batch)
      .eq('is_active', true)
      .order('semester', { ascending: true });

    if (error) throw error;

    const grouped: Record<number, any[]> = {};
    for (const r of data || []) {
      const sem = r.semester;
      if (!grouped[sem]) grouped[sem] = [];
      grouped[sem].push({
        id: r.id,
        subjectName: r.subject_name,
        subjectCode: r.subject_code || '',
        description: r.description || '',
        topics: r.topics || [],
        industrySkills: r.industry_skills || [],
        industryRelevance: r.industry_relevance || 'medium',
        isActive: true,
      });
    }
    return grouped;
  },
};

// --- Syllabus Adapter ---
export const supabaseSyllabus: SyllabusAdapter = {
  async getSyllabusRecord(sapId: string, semester: number): Promise<any | null> {
    const { data, error } = await supabase
      .from('student_syllabi')
      .select('*')
      .eq('student_sap_id', sapId)
      .eq('semester', semester)
      .maybeSingle();
      
    if (error) throw error;
    if (!data) return null;
    
    return {
      downloadUrl: data.download_url,
      semester: data.semester,
      uploadedAt: data.uploaded_at,
      fileName: data.file_name
    };
  },
  async saveSyllabusRecord(sapId: string, semester: number, data: any): Promise<void> {
    const { error } = await supabase
      .from('student_syllabi')
      .upsert({
        student_sap_id: sapId,
        semester: semester,
        file_name: data.fileName,
        download_url: data.downloadUrl,
        uploaded_at: data.uploadedAt || new Date().toISOString()
      }, { onConflict: 'student_sap_id,semester' });
      
    if (error) throw error;
  }
};
