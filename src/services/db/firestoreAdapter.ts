import { 
  collection, getDocs, query, orderBy, doc, getDoc, setDoc, updateDoc, 
  serverTimestamp, Timestamp, addDoc, where, deleteDoc, limit, onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { 
  StudentAdapter, CompanyAdapter, DriveAdapter, 
  InterviewAdapter, OfferAdapter, AuditAdapter, SettingsAdapter, UserAdapter,
  EligibilityAdapter, AnalyticsAdapter, AdminUserAdapter, CurriculumAdapter, SyllabusAdapter,
  Unsubscribe
} from './types';
import type { AdminStudentProfile } from '../../types/studentAdmin';
import type { AdminCompanyProfile, CompanyFormData } from '../../types/companyAdmin';
import type { AdminDriveProfile, DriveFormData } from '../../types/driveAdmin';
import type { AdminInterview, InterviewFormData } from '../../types/interviewAdmin';
import type { AdminOffer, OfferFormData } from '../../types/offerAdmin';
import type { AuditLogEntry, AuditLogWritePayload } from '../../types/auditAdmin';
import type { PlatformSettings } from '../../types/settingsAdmin';
import { DEFAULT_SETTINGS } from '../admin/settings.service';

// --- Student Adapter ---
export const firestoreStudents: StudentAdapter = {
  async fetchAllStudents(): Promise<AdminStudentProfile[]> {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        sapId: data.sapId || '',
        fullName: data.name || 'Unknown Student',
        email: data.email || '',
        department: data.branch || data.department || 'Unknown',
        currentYear: data.currentYear || 'Unknown',
        cgpa: Number(data.academicDetails?.cgpa || data.cgpa || 0),
        readinessScore: data.assessmentResults?.overallScore || data.readinessScore || 0,
        careerGoal: data.careerTrack || data.careerGoal || 'Undecided',
        placementStatus: data.placementStatus || 'unplaced',
        eligibilityStatus: data.eligibilityStatus || 'pending_review',
        resumeStatus: data.resumeStatus || 'not_uploaded',
        internshipCompleted: !!data.internshipCompleted,
        contact: data.contact || data.phone,
        skills: data.skills || data.techSkills || [],
        certifications: data.certifications || [],
        projectsCount: data.projects?.length || 0,
        offersCount: data.offers?.length || 0,
        achievements: data.achievements || [],
        bio: data.bio || '',
        leetcodeStats: data.leetcodeStats || (data.leetcode && typeof data.leetcode === 'object' ? data.leetcode.stats : null) || { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 },
        lastUpdated: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date())
      };
    });
  },

  async getStudentBySapId(sapId: string): Promise<AdminStudentProfile | null> {
    const docRef = doc(db, 'students', sapId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      sapId: data.sapId || '',
      fullName: data.name || 'Unknown Student',
      email: data.email || '',
      department: data.branch || data.department || 'Unknown',
      currentYear: data.currentYear || 'Unknown',
      cgpa: Number(data.academicDetails?.cgpa || data.cgpa || 0),
      readinessScore: data.assessmentResults?.overallScore || data.readinessScore || 0,
      careerGoal: data.careerTrack || data.careerGoal || 'Undecided',
      placementStatus: data.placementStatus || 'unplaced',
      eligibilityStatus: data.eligibilityStatus || 'pending_review',
      resumeStatus: data.resumeStatus || 'not_uploaded',
      internshipCompleted: !!data.internshipCompleted,
      contact: data.contact || data.phone,
      skills: data.skills || data.techSkills || [],
      certifications: data.certifications || [],
      projectsCount: data.projects?.length || 0,
      offersCount: data.offers?.length || 0,
      achievements: data.achievements || [],
      bio: data.bio || '',
      leetcodeStats: data.leetcodeStats || (data.leetcode && typeof data.leetcode === 'object' ? data.leetcode.stats : null) || { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 },
      lastUpdated: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date())
    };
  },

  async deleteStudent(sapId: string): Promise<void> {
    const docRef = doc(db, 'students', sapId);
    await deleteDoc(docRef);
  },

  async createStudent(data: any): Promise<void> {
    const docRef = doc(db, 'students', data.sapId);
    await setDoc(docRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },

  onStudentsChange(callback: (students: AdminStudentProfile[]) => void): Unsubscribe {
    const q = collection(db, 'students');
    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          sapId: data.sapId || '',
          fullName: data.name || 'Unknown Student',
          email: data.email || '',
          department: data.branch || data.department || 'Unknown',
          currentYear: data.currentYear || 'Unknown',
          cgpa: Number(data.academicDetails?.cgpa || data.cgpa || 0),
          readinessScore: data.assessmentResults?.overallScore || data.readinessScore || 0,
          careerGoal: data.careerTrack || data.careerGoal || 'Undecided',
          placementStatus: data.placementStatus || 'unplaced',
          eligibilityStatus: data.eligibilityStatus || 'pending_review',
          resumeStatus: data.resumeStatus || 'not_uploaded',
          internshipCompleted: !!data.internshipCompleted,
          contact: data.contact || data.phone,
          skills: data.skills || data.techSkills || [],
          certifications: data.certifications || [],
          projectsCount: data.projects?.length || 0,
          offersCount: data.offers?.length || 0,
          achievements: data.achievements || [],
          bio: data.bio || '',
          leetcodeStats: data.leetcodeStats || (data.leetcode && typeof data.leetcode === 'object' ? data.leetcode.stats : null) || { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 },
          lastUpdated: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date())
        };
      });
      callback(students);
    });
  }
};

// --- Company Adapter ---
export const firestoreCompanies: CompanyAdapter = {
  async fetchAllCompanies(): Promise<AdminCompanyProfile[]> {
    const companiesRef = collection(db, 'companies');
    const q = query(companiesRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as AdminCompanyProfile;
    });
  },

  async createCompany(data: CompanyFormData): Promise<AdminCompanyProfile> {
    const companiesRef = collection(db, 'companies');
    const newDocRef = doc(companiesRef);
    const now = new Date();
    const newCompany: AdminCompanyProfile = {
      ...data,
      id: newDocRef.id,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(newDocRef, { ...newCompany, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return newCompany;
  },

  async updateCompany(id: string, data: Partial<CompanyFormData>): Promise<void> {
    const docRef = doc(db, 'companies', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  }
};

// --- Drive Adapter ---
export const firestoreDrives: DriveAdapter = {
  async fetchAllDrives(): Promise<AdminDriveProfile[]> {
    const drivesRef = collection(db, 'drives');
    const q = query(drivesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        registrationStart: data.registrationStart?.toDate() || new Date(),
        registrationEnd: data.registrationEnd?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        stages: (data.stages || []).map((stage: any) => ({
          ...stage,
          date: stage.date ? stage.date.toDate() : null
        }))
      } as AdminDriveProfile;
    });
  },

  async createDrive(data: DriveFormData): Promise<string> {
    const newDriveRef = doc(collection(db, 'drives'));
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(newDriveRef, {
      ...cleanData,
      applicantCount: 0,
      shortlistedCount: 0,
      registrationStart: Timestamp.fromDate(data.registrationStart),
      registrationEnd: Timestamp.fromDate(data.registrationEnd),
      stages: data.stages.map((stage: any) => ({
        ...stage,
        date: stage.date ? Timestamp.fromDate(stage.date) : null
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return newDriveRef.id;
  },

  async updateDrive(id: string, data: Partial<DriveFormData>): Promise<void> {
    const driveRef = doc(db, 'drives', id);
    const cleanData = JSON.parse(JSON.stringify(data));
    const updatePayload: any = { ...cleanData, updatedAt: serverTimestamp() };
    if (data.registrationStart) updatePayload.registrationStart = Timestamp.fromDate(data.registrationStart);
    if (data.registrationEnd) updatePayload.registrationEnd = Timestamp.fromDate(data.registrationEnd);
    if (data.stages) {
      updatePayload.stages = data.stages.map((stage: any) => ({
        ...stage,
        date: stage.date ? Timestamp.fromDate(stage.date) : null
      }));
    }
    await updateDoc(driveRef, updatePayload);
  },

  onDrivesChange(callback: (drives: AdminDriveProfile[]) => void): Unsubscribe {
    const q = query(collection(db, 'drives'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const drives = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        registrationStart: d.data().registrationStart?.toDate ? d.data().registrationStart.toDate() : new Date(),
        registrationEnd: d.data().registrationEnd?.toDate ? d.data().registrationEnd.toDate() : new Date(),
      } as any as AdminDriveProfile));
      callback(drives);
    });
  }
};

// --- Interview Adapter ---
export const firestoreInterviews: InterviewAdapter = {
  async getAllInterviews(): Promise<AdminInterview[]> {
    const interviewsRef = collection(db, 'interviews');
    const q = query(interviewsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as AdminInterview;
    });
  },

  async createInterview(data: InterviewFormData): Promise<AdminInterview> {
    const interviewsRef = collection(db, 'interviews');
    const newInterviewRef = doc(interviewsRef);
    const documentData = {
      ...data,
      scheduledDate: Timestamp.fromDate(new Date(data.scheduledDate)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(newInterviewRef, documentData);
    return { id: newInterviewRef.id, ...data, scheduledDate: new Date(data.scheduledDate), createdAt: new Date(), updatedAt: new Date() };
  },

  async updateInterview(id: string, data: Partial<InterviewFormData>): Promise<void> {
    const interviewRef = doc(db, 'interviews', id);
    const updateData: any = { ...data, updatedAt: serverTimestamp() };
    if (data.scheduledDate) updateData.scheduledDate = Timestamp.fromDate(new Date(data.scheduledDate));
    await updateDoc(interviewRef, updateData);
  }
};

// --- Offer Adapter ---
export const firestoreOffers: OfferAdapter = {
  async getAllOffers(): Promise<AdminOffer[]> {
    const offersRef = collection(db, 'offers');
    const q = query(offersRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        joiningDate: data.joiningDate ? data.joiningDate.toDate() : null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as AdminOffer;
    });
  },

  async createOffer(data: OfferFormData): Promise<AdminOffer> {
    const offersRef = collection(db, 'offers');
    const newOfferRef = doc(offersRef);
    const documentData = {
      ...data,
      joiningDate: data.joiningDate ? Timestamp.fromDate(new Date(data.joiningDate)) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(newOfferRef, documentData);
    return { id: newOfferRef.id, ...data, joiningDate: data.joiningDate ? new Date(data.joiningDate) : null, createdAt: new Date(), updatedAt: new Date() };
  },

  async updateOffer(id: string, data: Partial<OfferFormData>): Promise<void> {
    const offerRef = doc(db, 'offers', id);
    const updateData: any = { ...data, updatedAt: serverTimestamp() };
    if (data.joiningDate !== undefined) updateData.joiningDate = data.joiningDate ? Timestamp.fromDate(new Date(data.joiningDate)) : null;
    await updateDoc(offerRef, updateData);
  },

  onOffersChange(callback: (offers: AdminOffer[]) => void): Unsubscribe {
    const q = query(collection(db, 'offers'), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const offers = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        joiningDate: d.data().joiningDate?.toDate ? d.data().joiningDate.toDate() : null,
      } as any as AdminOffer));
      callback(offers);
    });
  }
};

// --- Audit Adapter ---
export const firestoreAudit: AuditAdapter = {
  async getAllLogs(): Promise<AuditLogEntry[]> {
    const logsRef = collection(db, 'auditLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp)
      } as AuditLogEntry;
    });
  },

  async fetchLogs(count: number): Promise<AuditLogEntry[]> {
    const logsRef = collection(db, 'auditLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp)
      } as AuditLogEntry;
    });
  },

  async logAuditEvent(payload: AuditLogWritePayload): Promise<string> {
    const logsRef = collection(db, 'auditLogs');
    const docRef = await addDoc(logsRef, { ...payload, timestamp: serverTimestamp() });
    return docRef.id;
  }
};

// --- Settings Adapter ---
export const firestoreSettings: SettingsAdapter = {
  async getSettings(): Promise<PlatformSettings> {
    const docRef = doc(db, 'config/platformSettings');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return { ...DEFAULT_SETTINGS, ...data, updatedAt: data.updatedAt?.toDate() || undefined };
    }
    return { ...DEFAULT_SETTINGS };
  },

  async saveSettings(settings: PlatformSettings, adminEmail?: string): Promise<void> {
    const docRef = doc(db, 'config/platformSettings');
    await setDoc(docRef, { ...settings, updatedAt: serverTimestamp(), updatedBy: adminEmail || 'system_admin' }, { merge: true });
  },

  async saveSection(_section: string, data: any, adminEmail?: string): Promise<void> {
    await this.saveSettings(data, adminEmail);
  }
};

// --- User Adapter ---
export const firestoreUser: UserAdapter = {
  async lookupUserProfileByEmail(email: string): Promise<any | null> {
    // Check 'students'
    let q = query(collection(db, 'students'), where('email', '==', email));
    let snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data();

    // Check 'admins'
    q = query(collection(db, 'admins'), where('email', '==', email));
    snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data();

    return null;
  },

  async getStudentDoc(sapId: string): Promise<any | null> {
    const docRef = doc(db, 'students', sapId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  },

  async updateUser(col: string, id: string, data: any): Promise<void> {
    await setDoc(doc(db, col, id), { 
      ...data, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  },

  onProfileChange(col: string, id: string, callback: (data: any) => void): Unsubscribe {
    const docRef = doc(db, col, id);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) callback(snap.data());
    });
  }
};

// --- Eligibility Adapter ---
export const firestoreEligibility: EligibilityAdapter = {
  async fetchAllRules(): Promise<any[]> {
    const snap = await getDocs(collection(db, 'eligibilityRules'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async createRule(data: any): Promise<any> {
    const docRef = await addDoc(collection(db, 'eligibilityRules'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  },
  async updateRule(id: string, data: any): Promise<void> {
    await updateDoc(doc(db, 'eligibilityRules', id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },
  async deleteRule(id: string): Promise<void> {
    await deleteDoc(doc(db, 'eligibilityRules', id));
  }
};

// --- Analytics Adapter ---
export const firestoreAnalytics: AnalyticsAdapter = {
  async getCollectionCount(col: string): Promise<number> {
    const snap = await getDocs(collection(db, col));
    return snap.size;
  },
  async getDashboardStats(): Promise<any> {
    const [students, drives, companies, offers, interviews] = await Promise.all([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'drives')),
      getDocs(collection(db, 'companies')),
      getDocs(collection(db, 'offers')),
      getDocs(collection(db, 'interviews'))
    ]);

    return {
      totalStudents: students.size,
      activeDrives: drives.size,
      partnerCompanies: companies.size,
      offersIssued: offers.size,
      interviewsCount: interviews.size
    };
  }
};

// --- Admin Users Adapter ---
export const firestoreAdmins: AdminUserAdapter = {
  async fetchAllAdmins(): Promise<any[]> {
    const q = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  },
  async createAdmin(data: any): Promise<any> {
    const docRef = doc(db, 'admins', data.email);
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() });
    return data;
  },
  async updateAdmin(email: string, data: any): Promise<void> {
    const docRef = doc(db, 'admins', email);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  }
};

// --- Curriculum Adapter ---
export const firestoreCurriculum: CurriculumAdapter = {
  async getCurriculum(branch: string, batch: string): Promise<any | null> {
    const docRef = doc(db, 'curriculum', `${branch}_${batch}`);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  },
  async saveCurriculum(data: any): Promise<void> {
    const docRef = doc(db, 'curriculum', `${data.branch}_${data.batch}`);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  }
};

// --- Syllabus Adapter ---
export const firestoreSyllabus: SyllabusAdapter = {
  async getSyllabusRecord(sapId: string, semester: number): Promise<any | null> {
    const docRef = doc(db, `users/${sapId}/syllabi/semester_${semester}`);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  },
  async saveSyllabusRecord(sapId: string, semester: number, data: any): Promise<void> {
    const docRef = doc(db, `users/${sapId}/syllabi/semester_${semester}`);
    await setDoc(docRef, data);
  }
};
