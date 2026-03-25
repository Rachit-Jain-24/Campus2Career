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
import { AdminRoutes } from './routes/AdminRoutes';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import type { StudentUser } from '@/types/auth';

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

  // Determine fallback path mostly for root (/) routing when user isn't matching other explicit routes
  const getDefaultPath = () => {
    if (!user) return '/login';

    // Check if user is admin (any admin role)
    if (user.role && user.role !== 'student') return '/admin/dashboard';

    if (!user.careerDiscoveryCompleted) return '/career-discovery';
    if (!user.profileCompleted) return '/student/profile-setup';
    if (!user.assessmentCompleted) return '/student/assessment';

    return '/student/dashboard';
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

        {/* Switch Account Page */}
        <Route path="/switch-account" element={<SwitchAccount />} />

        {/* Admin Routes - Complete Admin Portal */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Public Admin Account Creation */}
        <Route path="/create-admin" element={<CreateAdminAccount />} />
        
        {/* Public Check Account Page */}
        <Route path="/check-account" element={<CheckAccount />} />
        
        {/* Public Seed Students Page (No Login Required) */}
        <Route path="/seed-students" element={<SeedStudents />} />
        
        {/* Public Seed Remaining 20 Students */}
        <Route path="/seed-remaining-20" element={<SeedRemaining20 />} />
        
        {/* Public Update Batch Data Page (No Login Required) */}
        <Route path="/update-batch-data" element={<UpdateBatchData />} />
        
        {/* Legacy Admin Seed Routes (keep for backward compatibility) */}
        <Route path="/admin-legacy/seed-demo" element={<SeedDemoData />} />
        <Route path="/admin-legacy/seed-batch" element={<ProtectedRoute allowedRole="admin"><SeedBatchData /></ProtectedRoute>} />

        {/* Onboarding Flow: Redirect if already completed */}
        <Route path="/career-discovery" element={<ProtectedRoute allowedRole="student"><CareerDiscoveryPage /></ProtectedRoute>} />

        {/* Student Profile Setup (post-onboarding): Redirect if already completed  */}
        <Route path="/student/profile-setup" element={<ProtectedRoute allowedRole="student"><ProfileSetupPage /></ProtectedRoute>} />

        {/* Career & Personality Assessment */}
        <Route path="/student/assessment" element={<ProtectedRoute allowedRole="student" requireProfileSetup><AssessmentPage /></ProtectedRoute>} />

        {/* Main Student Dashboard */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="student" requireAssessment><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/leetcode" element={<ProtectedRoute allowedRole="student" requireAssessment><LeetCodeTracker /></ProtectedRoute>} />
        <Route path="/student/roadmap" element={<ProtectedRoute allowedRole="student" requireAssessment><RoadmapPage /></ProtectedRoute>} />
        <Route path="/student/interview" element={<ProtectedRoute allowedRole="student" requireAssessment><InterviewSimulator /></ProtectedRoute>} />
        <Route path="/student/resume-analyzer" element={<ProtectedRoute allowedRole="student" requireAssessment><ResumeAnalyzer /></ProtectedRoute>} />
        <Route path="/student/skill-gap-analysis" element={<ProtectedRoute allowedRole="student" requireAssessment><SkillGapAnalysisPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRole="student" requireAssessment><ProfilePage /></ProtectedRoute>} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={getDefaultPath()} replace />} />
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
