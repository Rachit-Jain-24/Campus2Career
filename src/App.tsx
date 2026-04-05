import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import CareerDiscoveryPage from './pages/onboarding/CareerDiscoveryPage';
import ProfileSetupPage from './pages/student/ProfileSetupPage';
import AssessmentPage from './pages/student/AssessmentPage';
import ProfilePage from './pages/student/Profile';
import StudentDashboard from './pages/student/Dashboard';
import LeetCodeTracker from './pages/student/LeetCodeTracker';
import RoadmapPage from './pages/student/RoadmapPage';
import InterviewSimulator from './pages/student/InterviewSimulator';
import ResumeAnalyzer from './pages/student/ResumeAnalyzer';
import SkillGapAnalysisPage from './pages/student/SkillGapAnalysis';
import CareerDNAPage from './pages/student/CareerDNAPage';
import DailySparkPage from './pages/student/DailySparkPage';
import PeerCompassPage from './pages/student/PeerCompassPage';
import MonthlyNudgePage from './pages/student/MonthlyNudgePage';
import SeedAdminData from './pages/admin/SeedAdminData';

// New role-based portal routes
import { AdminPortalRoutes } from './routes/AdminPortalRoutes';
import { DeanPortalRoutes } from './routes/DeanPortalRoutes';
import { DirectorPortalRoutes } from './routes/DirectorPortalRoutes';
import { ProgramChairPortalRoutes } from './routes/ProgramChairPortalRoutes';
import { FacultyPortalRoutes } from './routes/FacultyPortalRoutes';
import { PlacementPortalRoutes } from './routes/PlacementPortalRoutes';

// Role login pages
import PortalSelector from './pages/role-login/PortalSelector';
import AdminLoginPage from './pages/role-login/AdminLoginPage';
import DeanLoginPage from './pages/role-login/DeanLoginPage';
import DirectorLoginPage from './pages/role-login/DirectorLoginPage';
import ProgramChairLoginPage from './pages/role-login/ProgramChairLoginPage';
import FacultyLoginPage from './pages/role-login/FacultyLoginPage';
import PlacementLoginPage from './pages/role-login/PlacementLoginPage';

import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import { SystemAdminRoute } from './components/SystemAdminRoute';
import { getDefaultAdminRoute } from './config/admin/roleRoutes';
import type { StudentUser } from './types/auth';

const ChatWidget = lazy(() =>
  import('./components/AICareerAdvisor/ChatWidget').then((m) => ({ default: m.ChatWidget }))
);

function App() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary p-4 text-center">
        <div className="flex flex-col items-center gap-6 max-w-sm">
          <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-primary tracking-tight uppercase">Initializing Portal</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              We're syncing your academic profile and career roadmap...
            </p>
          </div>

          <div id="loading-fallback" className="pt-4 opacity-0 animate-in fade-in duration-1000 delay-500 fill-mode-forwards" style={{ animationDelay: '3s' }}>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
            >
              Taking too long? Reload
            </button>
            <div className="mt-2">
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="text-[10px] text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Clear Session & Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getDefaultPath = () => {
    if (!user) return '/login';
    if (user.role && user.role !== 'student') return getDefaultAdminRoute(user.role);
    
    // Student Onboarding — simplified: CareerDiscovery → ProfileSetup → Dashboard
    const isDiscoveryDone = user.careerDiscoveryCompleted || (user as StudentUser).careerTrack;
    if (!isDiscoveryDone) return '/career-discovery';
    if (!user.profileCompleted) return '/student/profile-setup';
    return '/student/dashboard';
  };

  return (
    <>
      <Routes>
        {/* ── Student auth ── */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

        {/* ── Role-based login pages (always public) ── */}
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/login/dean" element={<DeanLoginPage />} />
        <Route path="/login/director" element={<DirectorLoginPage />} />
        <Route path="/login/program-chair" element={<ProgramChairLoginPage />} />
        <Route path="/login/faculty" element={<FacultyLoginPage />} />
        <Route path="/login/placement-officer" element={<PlacementLoginPage />} />
        <Route path="/portal" element={<PortalSelector />} />

        {/* ── Role-based portals ── */}
        <Route path="/admin/*" element={<ProtectedRoute allowedRole="admin"><AdminPortalRoutes /></ProtectedRoute>} />
        <Route path="/dean/*" element={<ProtectedRoute allowedRole="admin"><DeanPortalRoutes /></ProtectedRoute>} />
        <Route path="/director/*" element={<ProtectedRoute allowedRole="admin"><DirectorPortalRoutes /></ProtectedRoute>} />
        <Route path="/program-chair/*" element={<ProtectedRoute allowedRole="admin"><ProgramChairPortalRoutes /></ProtectedRoute>} />
        <Route path="/faculty/*" element={<ProtectedRoute allowedRole="admin"><FacultyPortalRoutes /></ProtectedRoute>} />
        <Route path="/placement/*" element={<ProtectedRoute allowedRole="admin"><PlacementPortalRoutes /></ProtectedRoute>} />

        {/* ── System tools ── */}
        <Route path="/seed-admin-data" element={<SystemAdminRoute><SeedAdminData /></SystemAdminRoute>} />

        {/* ── Student routes ── */}
        <Route path="/career-discovery" element={<ProtectedRoute allowedRole="student"><CareerDiscoveryPage /></ProtectedRoute>} />
        <Route path="/student/profile-setup" element={<ProtectedRoute allowedRole="student"><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/student/assessment" element={<ProtectedRoute allowedRole="student" requireProfileSetup><AssessmentPage /></ProtectedRoute>} />
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="student" requireAssessment><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/leetcode" element={<ProtectedRoute allowedRole="student" requireAssessment><LeetCodeTracker /></ProtectedRoute>} />
        <Route path="/student/roadmap" element={<ProtectedRoute allowedRole="student" requireAssessment><RoadmapPage /></ProtectedRoute>} />
        <Route path="/student/interview" element={<ProtectedRoute allowedRole="student" requireAssessment><InterviewSimulator /></ProtectedRoute>} />
        <Route path="/student/resume-analyzer" element={<ProtectedRoute allowedRole="student" requireAssessment><ResumeAnalyzer /></ProtectedRoute>} />
        <Route path="/student/skill-gap-analysis" element={<ProtectedRoute allowedRole="student" requireAssessment><SkillGapAnalysisPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRole="student" requireAssessment><ProfilePage /></ProtectedRoute>} />
        <Route path="/student/career-dna" element={<ProtectedRoute allowedRole="student" requireAssessment><CareerDNAPage /></ProtectedRoute>} />
        <Route path="/student/daily-spark" element={<ProtectedRoute allowedRole="student" requireAssessment><DailySparkPage /></ProtectedRoute>} />
        <Route path="/student/peer-compass" element={<ProtectedRoute allowedRole="student" requireAssessment><PeerCompassPage /></ProtectedRoute>} />
        <Route path="/student/monthly-nudge" element={<ProtectedRoute allowedRole="student" requireAssessment><MonthlyNudgePage /></ProtectedRoute>} />

        {/* ── Default redirect ── */}
        <Route path="/" element={<Navigate to={getDefaultPath()} replace />} />

        {/* Convenience aliases */}
        <Route path="/student-login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/dean-login" element={<DeanLoginPage />} />
      </Routes>

      {user?.role === 'student' && user?.assessmentCompleted === true && (
        <Suspense fallback={null}>
          <ChatWidget student={user as StudentUser} />
        </Suspense>
      )}
    </>
  );
}

export default App;
