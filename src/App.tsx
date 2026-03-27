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
import SeedDemoData from './pages/admin/SeedDemoData';
import SeedBatchData from './pages/admin/SeedBatchData';
import SeedStudents from './pages/SeedStudents';
import SeedRemaining20 from './pages/SeedRemaining20';
import UpdateBatchData from './pages/UpdateBatchData';
import SwitchAccount from './pages/SwitchAccount';
import CheckAccount from './pages/CheckAccount';
import CreateAdminAccount from './pages/admin/CreateAdminAccount';
import FixUserFields from './pages/FixUserFields';
import FixStudent35 from './pages/admin/FixStudent35';
import SeedAdminData from './pages/admin/SeedAdminData';

// Legacy admin routes (kept for backward compat)
import { AdminRoutes } from './routes/AdminRoutes';

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
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Initializing Campus2Career</p>
        </div>
      </div>
    );
  }

  const getDefaultPath = () => {
    if (!user) return '/login';
    if (user.role && user.role !== 'student') return getDefaultAdminRoute(user.role);
    if (!user.careerDiscoveryCompleted) return '/career-discovery';
    if (!user.profileCompleted) return '/student/profile-setup';
    if (!user.assessmentCompleted) return '/student/assessment';
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

        {/* ── Legacy admin portal (kept for backward compat) ── */}
        <Route path="/admin-legacy/*" element={<AdminRoutes />} />

        {/* ── Utility tools — restricted to system_admin only ── */}
        <Route path="/switch-account" element={<SwitchAccount />} />
        <Route path="/create-admin" element={<SystemAdminRoute><CreateAdminAccount /></SystemAdminRoute>} />
        <Route path="/check-account" element={<SystemAdminRoute><CheckAccount /></SystemAdminRoute>} />
        <Route path="/seed-students" element={<SystemAdminRoute><SeedStudents /></SystemAdminRoute>} />
        <Route path="/seed-remaining-20" element={<SystemAdminRoute><SeedRemaining20 /></SystemAdminRoute>} />
        <Route path="/update-batch-data" element={<SystemAdminRoute><UpdateBatchData /></SystemAdminRoute>} />
        <Route path="/admin-legacy/seed-demo" element={<SystemAdminRoute><SeedDemoData /></SystemAdminRoute>} />
        <Route path="/admin-legacy/seed-batch" element={<SystemAdminRoute><SeedBatchData /></SystemAdminRoute>} />

        {/* ── vpa-v2 specific fix routes ── */}
        <Route path="/fix-user-fields" element={<FixUserFields />} />
        <Route path="/fix-student-35" element={<FixStudent35 />} />
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
