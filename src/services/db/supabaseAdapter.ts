import { supabase } from '../../lib/supabase';
import type { 
  StudentAdapter, CompanyAdapter, DriveAdapter, 
  InterviewAdapter, OfferAdapter, AuditAdapter, SettingsAdapter, UserAdapter,
  EligibilityAdapter, AnalyticsAdapter, AdminUserAdapter, CurriculumAdapter, SyllabusAdapter
} from './types';
import type { AdminStudentProfile } from '../../types/studentAdmin';
import type { AdminCompanyProfile, CompanyFormData } from '../../types/companyAdmin';
import type { AdminDriveProfile, DriveFormData } from '../../types/driveAdmin';
import type { AdminInterview, InterviewFormData } from '../../types/interviewAdmin';
import type { AdminOffer, OfferFormData } from '../../types/offerAdmin';
import type { AuditLogEntry, AuditLogWritePayload } from '../../types/auditAdmin';
import type { PlatformSettings } from '../../types/settingsAdmin';

// --- Student Adapter ---
export const supabaseStudents: StudentAdapter = {
  async fetchAllStudents(): Promise<AdminStudentProfile[]> {
    const { data, error } = await supabase
      .from('student_readiness_v')
      .select('*');
    
    if (error) throw error;
    
    return data.map(s => ({
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
    } as AdminStudentProfile));
  },

  async getStudentBySapId(sapId: string): Promise<AdminStudentProfile | null> {
    const { data, error } = await supabase
      .from('student_readiness_v')
      .select('*')
      .eq('sap_id', sapId)
      .single();
    
    if (error) return null;
    
    return {
      id: data.id,
      sapId: data.sap_id,
      fullName: data.name,
      email: data.email,
      department: data.branch || 'Unknown',
      currentYear: data.current_year || 'Unknown',
      cgpa: Number(data.cgpa || 0),
      readinessScore: Number(data.readiness_score || 0),
      careerGoal: (data.career_track as any) || 'Undecided',
      placementStatus: (data.placement_status as any) || 'unplaced',
      eligibilityStatus: 'pending_review',
      resumeStatus: data.resume_url ? 'pending' : 'not_uploaded',
      internshipCompleted: data.internships?.length > 0,
      contact: data.phone || '',
      skills: data.skills || [],
      certifications: data.certifications || [],
      projectsCount: data.projects?.length || 0,
      offersCount: 0, 
      achievements: data.achievements || [],
      bio: data.bio || '',
      leetcodeStats: {
        totalSolved: data.leetcode_total_solved || 0,
        easySolved: data.leetcode_easy_solved || 0,
        mediumSolved: data.leetcode_medium_solved || 0,
        hardSolved: data.leetcode_hard_solved || 0
      },
      lastUpdated: new Date(data.updated_at)
    } as AdminStudentProfile;
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
      });
      
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
      id: d.firestore_id || d.id,
      companyId: d.company_id,
      companyName: d.company_name,
      title: d.title,
      status: (d.status as any) || 'upcoming',
      jobRole: d.title, // Fallback
      packageRange: (d as any).package_range || 'TBD',
      location: d.location || 'Multiple',
      mode: 'on-campus',
      description: '',
      eligibilityRules: {
        allowedDepartments: [],
        allowedYears: [],
        requiresResumeApproval: false,
        mandatoryInternship: false,
        requiredSkills: []
      },
      registrationStart: new Date(d.registration_start),
      registrationEnd: new Date(d.registration_end),
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
      stages: d.drive_stages?.map((s: any) => ({
        id: s.id,
        name: s.stage_name,
        date: s.stage_date ? new Date(s.stage_date) : null,
        status: 'pending'
      })) || []
    } as any)) as AdminDriveProfile[];
  },

  async createDrive(formData: DriveFormData): Promise<string> {
    const { data: drive, error } = await supabase
      .from('drives')
      .insert({
        company_id: formData.companyId,
        company_name: formData.companyName,
        title: formData.title,
        status: formData.status,
        location: formData.location,
        registration_start: formData.registrationStart.toISOString(),
        registration_end: formData.registrationEnd.toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;

    if (formData.stages && formData.stages.length > 0) {
      await supabase.from('drive_stages').insert(
        formData.stages.map(s => ({
          drive_id: drive.id,
          stage_name: s.name,
          stage_date: s.date?.toISOString(),
          stage_location: '',
          notes: ''
        }))
      );
    }
    
    return drive.id;
  },

  async updateDrive(id: string, formData: Partial<DriveFormData>): Promise<void> {
    const { error } = await supabase
      .from('drives')
      .update({
        title: formData.title,
        status: formData.status,
        location: formData.location,
        registration_start: formData.registrationStart?.toISOString(),
        registration_end: formData.registrationEnd?.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  onDrivesChange(callback: (drives: AdminDriveProfile[]) => void): () => void {
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
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        actor_id: payload.actorId,
        actor_name: payload.actorName,
        actor_email: payload.actorEmail,
        actor_role: payload.actorRole,
        action: payload.action,
        module: payload.module,
        severity: payload.severity,
        summary: payload.summary,
        metadata: payload.metadata,
        before_snapshot: payload.beforeSnapshot,
        after_snapshot: payload.afterSnapshot,
        target_id: payload.targetId,
        target_type: payload.targetType,
        ip_address: payload.ipAddress,
        user_agent: payload.userAgent,
        timestamp: new Date().toISOString()
      })
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
    
    if (error) return {} as PlatformSettings; 
    
    return {
      general: {
        platformName: data.platform_name,
        instituteName: data.institute_name,
        supportEmail: data.support_email,
        currentAcademicYear: data.current_academic_year,
        activePlacementSeason: data.active_placement_season
      },
      placement: {
        minReadinessThreshold: data.min_readiness_threshold
      }
    } as any as PlatformSettings;
  },

  async saveSettings(settings: PlatformSettings, adminEmail?: string): Promise<void> {
    const { error } = await supabase
      .from('platform_config')
      .upsert({
        config_key: 'platformSettings',
        platform_name: settings.general.platformName,
        institute_name: settings.general.instituteName,
        support_email: settings.general.supportEmail,
        current_academic_year: settings.general.currentAcademicYear,
        active_placement_season: settings.general.activePlacementSeason,
        updated_by: adminEmail || 'system_admin',
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  },

  async saveSection(_section: string, data: any, adminEmail?: string): Promise<void> {
    await this.saveSettings(data, adminEmail);
  }
};

// --- User Adapter ---
export const supabaseUser: UserAdapter = {
  async lookupUserProfileByEmail(email: string): Promise<any | null> {
    // Check students first using the readiness view
    const { data: student } = await supabase
      .from('student_readiness_v')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (student) {
      return { ...student, role: 'student', sapId: student.sap_id, readinessScore: Number(student.readiness_score || 0) };
    }

    // Check admins
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    return admin || null;
  },

  async getStudentDoc(sapId: string): Promise<any | null> {
    const { data } = await supabase
      .from('student_readiness_v')
      .select('*')
      .eq('sap_id', sapId)
      .maybeSingle();
      
    if (data) {
      return { ...data, role: 'student', sapId: data.sap_id, readinessScore: Number(data.readiness_score || 0) };
    }
    return null;
  },

  async updateUser(col: string, id: string, data: any): Promise<void> {
    const table = col === 'students' ? 'students' : 'admins';
    const idField = table === 'students' ? 'sap_id' : 'email';

    const { error } = await supabase
      .from(table)
      .update(data)
      .eq(idField, id);
      
    if (error) throw error;
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
    return data;
  },
  async createRule(data: any): Promise<any> {
    const { data: rule, error } = await supabase
      .from('eligibility_rules')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return rule;
  },
  async updateRule(id: string, data: any): Promise<void> {
    const { error } = await supabase
      .from('eligibility_rules')
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
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
      name: admin.full_name
    }));
  },
  async createAdmin(data: any): Promise<any> {
    const { data: admin, error } = await supabase
      .from('admins')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return admin;
  },
  async updateAdmin(email: string, data: any): Promise<void> {
    const { error } = await supabase
      .from('admins')
      .update(data)
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
  }
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
