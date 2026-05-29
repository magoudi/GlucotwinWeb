import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AdminRoute } from './components/AdminRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicOnlyRoute } from './components/PublicOnlyRoute'
import { fetchCurrentAccount } from './lib/api'
import { store } from './store'
import { setBootstrappingFinished } from './store/authSlice'
import { DoctorRoute } from './components/DoctorRoute'

const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const CreateAccountPage = lazy(() => import('./pages/CreateAccountPage').then((module) => ({ default: module.CreateAccountPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })))
const EmailVerificationPage = lazy(() => import('./pages/EmailVerificationPage').then((module) => ({ default: module.EmailVerificationPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const AdaptationPage = lazy(() => import('./pages/AdaptationPage').then((module) => ({ default: module.AdaptationPage })))
const AIModelsPage = lazy(() => import('./pages/AIModelsPage').then((module) => ({ default: module.AIModelsPage })))
const BolusPredictionPage = lazy(() => import('./pages/BolusPredictionPage').then((module) => ({ default: module.BolusPredictionPage })))
const TwinSimulatorPage = lazy(() => import('./pages/TwinSimulatorPage').then((module) => ({ default: module.TwinSimulatorPage })))
const BasalPlanPage = lazy(() => import('./pages/BasalPlanPage').then((module) => ({ default: module.BasalPlanPage })))
const FoodPortionRecommendationPage = lazy(() => import('./pages/FoodPortionRecommendationPage').then((module) => ({ default: module.FoodPortionRecommendationPage })))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })))
const TimelinePage = lazy(() => import('./pages/TimelinePage').then((module) => ({ default: module.TimelinePage })))
const CareTeamPage = lazy(() => import('./pages/CareTeamPage').then((module) => ({ default: module.CareTeamPage })))
const ProfileDetailsPage = lazy(() => import('./pages/ProfileDetailsPage').then((module) => ({ default: module.ProfileDetailsPage })))
const ConnectorsPage = lazy(() => import('./pages/ConnectorsPage').then((module) => ({ default: module.ConnectorsPage })))
const SelectDoctorPage = lazy(() => import('./pages/SelectDoctorPage').then((module) => ({ default: module.SelectDoctorPage })))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage').then((module) => ({ default: module.SubscriptionPage })))
const PaymentPage = lazy(() => import('./pages/PaymentPage').then((module) => ({ default: module.PaymentPage })))
const SubscriptionSuccessPage = lazy(() => import('./pages/SubscriptionSuccessPage').then((module) => ({ default: module.SubscriptionSuccessPage })))
const SubscriptionCancelPage = lazy(() => import('./pages/SubscriptionCancelPage').then((module) => ({ default: module.SubscriptionCancelPage })))
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })))
const RemindersPage = lazy(() => import('./pages/RemindersPage').then((module) => ({ default: module.RemindersPage })))
const EducationPage = lazy(() => import('./pages/EducationPage').then((module) => ({ default: module.EducationPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage').then((module) => ({ default: module.AccessDeniedPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage').then((module) => ({ default: module.AdminOverviewPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })))
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncementsPage').then((module) => ({ default: module.AdminAnnouncementsPage })))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((module) => ({ default: module.AdminSettingsPage })))
const AdminSystemPage = lazy(() => import('./pages/admin/AdminSystemPage').then((module) => ({ default: module.AdminSystemPage })))
const AdminAuditPage = lazy(() => import('./pages/admin/AdminAuditPage').then((module) => ({ default: module.AdminAuditPage })))
const AdminSubscriptionsPage = lazy(() => import('./pages/admin/AdminSubscriptionsPage').then((module) => ({ default: module.AdminSubscriptionsPage })))
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage').then((module) => ({ default: module.AdminPaymentsPage })))
const AdminEmailLogsPage = lazy(() => import('./pages/admin/AdminEmailLogsPage').then((module) => ({ default: module.AdminEmailLogsPage })))
const AdminFeatureFlagsPage = lazy(() => import('./pages/admin/AdminFeatureFlagsPage').then((module) => ({ default: module.AdminFeatureFlagsPage })))

const DoctorOverviewPage = lazy(() => import('./pages/doctor/DoctorOverviewPage').then((module) => ({ default: module.DoctorOverviewPage })))
const DoctorPatientsPage = lazy(() => import('./pages/doctor/DoctorPatientsPage').then((module) => ({ default: module.DoctorPatientsPage })))
const DoctorRequestsPage = lazy(() => import('./pages/doctor/DoctorRequestsPage').then((module) => ({ default: module.DoctorRequestsPage })))
const DoctorInsightsPage = lazy(() => import('./pages/doctor/DoctorInsightsPage').then((module) => ({ default: module.DoctorInsightsPage })))
const DoctorTreatmentPlansPage = lazy(() => import('./pages/doctor/DoctorTreatmentPlansPage').then((module) => ({ default: module.DoctorTreatmentPlansPage })))
const DoctorNotesPage = lazy(() => import('./pages/doctor/DoctorNotesPage').then((module) => ({ default: module.DoctorNotesPage })))
const DoctorAppointmentsPage = lazy(() => import('./pages/doctor/DoctorAppointmentsPage').then((module) => ({ default: module.DoctorAppointmentsPage })))
const DoctorMessagesPage = lazy(() => import('./pages/doctor/DoctorMessagesPage').then((module) => ({ default: module.DoctorMessagesPage })))
const DoctorReportsPage = lazy(() => import('./pages/doctor/DoctorReportsPage').then((module) => ({ default: module.DoctorReportsPage })))
const DoctorSettingsPage = lazy(() => import('./pages/doctor/DoctorSettingsPage').then((module) => ({ default: module.DoctorSettingsPage })))

function RouteLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4f0] text-[#111111]">
      <div className="rounded-2xl border border-black/8 bg-white px-6 py-5 text-sm font-extrabold text-[#555555] shadow-[0_4px_16px_rgba(17,17,17,0.08)]">
        Loading workspace...
      </div>
    </div>
  )
}

function RoutesWithAnimation() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/adaptation" element={<AdaptationPage />} />
          <Route path="/ai-models" element={<AIModelsPage />} />
          <Route path="/bolus-prediction" element={<BolusPredictionPage />} />
          <Route path="/what-if-simulator" element={<TwinSimulatorPage />} />
          <Route path="/basal-schedule" element={<BasalPlanPage />} />
          <Route path="/food-portion" element={<FoodPortionRecommendationPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/care-team" element={<CareTeamPage />} />
          <Route path="/profile" element={<ProfileDetailsPage />} />
          <Route path="/connectors" element={<ConnectorsPage />} />
          <Route path="/select-doctor" element={<SelectDoctorPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/payment/:packageId" element={<PaymentPage />} />
          <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
          <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/system" element={<AdminSystemPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/email-logs" element={<AdminEmailLogsPage />} />
          <Route path="/admin/feature-flags" element={<AdminFeatureFlagsPage />} />
        </Route>
        <Route element={<DoctorRoute />}>
          <Route path="/doctor" element={<DoctorOverviewPage />} />
          <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
          <Route path="/doctor/requests" element={<DoctorRequestsPage />} />
          <Route path="/doctor/patients/:id/insights" element={<DoctorInsightsPage />} />
          <Route path="/doctor/patients/:id/treatment-plans" element={<DoctorTreatmentPlansPage />} />
          <Route path="/doctor/patients/:id/notes" element={<DoctorNotesPage />} />
          <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
          <Route path="/doctor/messages" element={<DoctorMessagesPage />} />
          <Route path="/doctor/reports" element={<DoctorReportsPage />} />
          <Route path="/doctor/settings" element={<DoctorSettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  useEffect(() => {
    fetchCurrentAccount().catch(() => {
      store.dispatch(setBootstrappingFinished())
    })
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingScreen />}>
        <RoutesWithAnimation />
      </Suspense>
    </BrowserRouter>
  )
}

export default App

