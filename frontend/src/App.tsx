import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { AppShell } from './components/AppShell';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Modules } from './pages/Modules';
import { Quests } from './pages/Quests';
import { Lesson } from './pages/Lesson';
import { Profile } from './pages/Profile';
import { League } from './pages/League';
import { Onboarding } from './pages/Onboarding';
import { GeneratedLesson } from './pages/GeneratedLesson';
import { AiAdvisor } from './pages/AiAdvisor';
import { Tools } from './pages/Tools';
import { Portfolio } from './pages/Portfolio';
import { Review } from './pages/Review';
import { Shop } from './pages/Shop';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Privacy } from './pages/Privacy';
import { Faq } from './pages/Faq';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
    </div>
  );
}

/** Requires logged in + onboarding complete. Wraps in the AppShell layout. */
function ProtectedRoute({ children, bare = false }: { children: React.ReactNode; bare?: boolean }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarding_done) return <Navigate to="/onboarding" replace />;
  if (bare) return <>{children}</>; // Lesson view skips the shell for full-screen exercises
  return <AppShell>{children}</AppShell>;
}

/** Requires logged in but redirects away if onboarding already done */
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarding_done) return <Navigate to="/modules" replace />;
  return <>{children}</>;
}

/** Redirects to dashboard/onboarding if already logged in */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) {
    return <Navigate to={user.onboarding_done ? '/modules' : '/onboarding'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
          <Route path="/dashboard" element={<Navigate to="/modules" replace />} />
          <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
          <Route path="/quests" element={<ProtectedRoute><Quests /></ProtectedRoute>} />
          <Route path="/lesson/:moduleId/:lessonId" element={<ProtectedRoute bare><Lesson /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute bare><GeneratedLesson /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/league" element={<ProtectedRoute><League /></ProtectedRoute>} />
          <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/review" element={<ProtectedRoute><Review /></ProtectedRoute>} />
          {/* Friends moved into Profile tab — keep the old URL working via redirect */}
          <Route path="/friends" element={<Navigate to="/profile?tab=friends" replace />} />
          <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
          <Route path="/advisor" element={<ProtectedRoute><AiAdvisor /></ProtectedRoute>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
