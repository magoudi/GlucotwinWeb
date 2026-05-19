import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage').then((module) => ({ default: module.AdminOverviewPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })))
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncementsPage').then((module) => ({ default: module.AdminAnnouncementsPage })))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((module) => ({ default: module.AdminSettingsPage })))
const AdminSystemPage = lazy(() => import('./pages/admin/AdminSystemPage').then((module) => ({ default: module.AdminSystemPage })))
const AdminAuditPage = lazy(() => import('./pages/admin/AdminAuditPage').then((module) => ({ default: module.AdminAuditPage })))
const DoctorOverviewPage = lazy(() => import('./pages/doctor/DoctorOverviewPage').then((module) => ({ default: module.DoctorOverviewPage })))
const DoctorPatientsPage = lazy(() => import('./pages/doctor/DoctorPatientsPage').then((module) => ({ default: module.DoctorPatientsPage })))
const DoctorRequestsPage = lazy(() => import('./pages/doctor/DoctorRequestsPage').then((module) => ({ default: module.DoctorRequestsPage })))
const SelectDoctorPage = lazy(() => import('./pages/SelectDoctorPage').then((module) => ({ default: module.SelectDoctorPage })))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage').then((module) => ({ default: module.SubscriptionPage })))
const PaymentPage = lazy(() => import('./pages/PaymentPage').then((module) => ({ default: module.PaymentPage })))
const SubscriptionSuccessPage = lazy(() => import('./pages/SubscriptionSuccessPage').then((module) => ({ default: module.SubscriptionSuccessPage })))
const SubscriptionCancelPage = lazy(() => import('./pages/SubscriptionCancelPage').then((module) => ({ default: module.SubscriptionCancelPage })))

function RouteLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1120] text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-sm font-extrabold text-slate-200">
        Loading workspace...
      </div>
    </div>
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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
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
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/system" element={<AdminSystemPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
          </Route>
          <Route element={<DoctorRoute />}>
            <Route path="/doctor" element={<DoctorOverviewPage />} />
            <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
            <Route path="/doctor/requests" element={<DoctorRequestsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
