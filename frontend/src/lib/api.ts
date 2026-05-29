import { useEffect, useState } from 'react'
import { store } from '../store'
import { clearAccount, setAuthState, type AuthSessionState } from '../store/authSlice'
import { useAppSelector } from '../store/hooks'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export type AccountUser = {
  id: string
  fullName: string
  email: string
  username: string
  initials: string
  phone: string
  bio: string
  subtitle: string
  role?: string
  dateOfBirth?: string | null
  diabetesType?: string
  managementType?: 'pump' | 'injections' | 'unknown'
  glucoseUnit?: 'mmol/L' | 'mg/dL'
  targetGlucoseMin?: number
  targetGlucoseMax?: number
  carbRatio?: number
  correctionFactor?: number
  insulinSensitivity?: number
  basalProfile?: Array<{ startTime: string; rate: number }>
  riskLevel?: 'High' | 'Medium' | 'Low'
  clinicalStatus?: string
  createdAt?: string
  featureFlags?: Record<string, boolean>
  isSubscribed?: boolean
  subscriptionStatus?: string
  subscriptionPlan?: string | null
  subscriptionBillingPeriod?: string | null
  subscriptionEndDate?: string | null
}

type ApiState<T> = {
  data: T | null
  error: string | null
  loading: boolean
}

type AuthPayload = {
  user: AccountUser
  session?: AuthSessionState
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(typeof payload.error === 'string' ? payload.error : `Request failed with ${response.status}`)
  }

  return payload as T
}

const apiCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useApiData<T>(path: string, options: { useCache?: boolean } = { useCache: true }) {
  const [state, setState] = useState<ApiState<T>>(() => {
    // Initial state: load from cache immediately if available
    if (options.useCache && apiCache.has(path)) {
      const cached = apiCache.get(path)!
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return { data: cached.data as T, error: null, loading: false }
      }
    }
    return { data: null, error: null, loading: true }
  })

  useEffect(() => {
    let active = true

    async function load() {
      // Don't set loading=true if we already have data from cache
      if (!state.data) setState(s => ({ ...s, loading: true }))
      
      try {
        const data = await apiRequest<T>(path)
        if (active) {
          if (options.useCache) {
            apiCache.set(path, { data, timestamp: Date.now() })
          }
          setState({ data, error: null, loading: false })
        }
      } catch (error) {
        if (active) {
          setState({ data: state.data, error: error instanceof Error ? error.message : 'Could not load data', loading: false })
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [path])

  return state
}

export function getStoredAccount() {
  return store.getState().auth.user
}

function getStoredSession() {
  return store.getState().auth.session
}

export function storeAccount(user: AccountUser, session?: AuthSessionState) {
  store.dispatch(setAuthState({ user, session: session ?? getStoredSession() }))
}

export function useAccount() {
  return useAppSelector((state) => state.auth.user)
}

export function useIsBootstrapping() {
  return useAppSelector((state) => state.auth.isBootstrapping)
}

export function useSession() {
  return useAppSelector((state) => state.auth.session)
}

export async function createAccount(input: {
  fullName: string
  email: string
  password: string
  role: 'patient' | 'doctor' | 'researcher'
  diabetesType?: string
  managementType?: string
  glucoseUnit?: string
  targetGlucoseMin?: number
  targetGlucoseMax?: number
  carbRatio?: number
  correctionFactor?: number
  insulinSensitivity?: number
  specialty?: string
  clinicName?: string
  licenseNumber?: string
}) {
  const payload = await apiRequest<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  storeAccount(payload.user, payload.session)
  return payload.user
}

export async function login(input: { identifier?: string; email?: string; password: string }) {
  const payload = await apiRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier: input.identifier ?? input.email ?? '',
      password: input.password,
    }),
  })
  storeAccount(payload.user, payload.session)
  return payload.user
}

export async function logout() {
  await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {})
  store.dispatch(clearAccount())
}

export async function fetchCurrentAccount() {
  const payload = await apiRequest<{ user: AccountUser; session?: AuthSessionState }>('/auth/me')
  storeAccount(payload.user, payload.session)
  return payload.user
}

export async function updateAccount(input: Partial<AccountUser>) {
  const payload = await apiRequest<{ user: AccountUser }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  storeAccount(payload.user)
  return payload.user
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  return apiRequest<{ ok: boolean; passwordUpdatedAt: string }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function savePageData<T>(_slug: string, data: T) {
  return data
}

export async function stopImpersonating() {
  const payload = await apiRequest<{ user: AccountUser | null; session?: AuthSessionState }>('/auth/stop-impersonating', {
    method: 'POST',
  })

  if (payload.user) {
    storeAccount(payload.user, payload.session)
  }

  return payload
}

export async function requestPasswordResetCode(email: string): Promise<{ success: boolean; message: string; resetCode?: string }> {
  return apiRequest('/auth/password-reset/request-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function verifyPasswordResetCode(email: string, code: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
  return apiRequest('/auth/password-reset/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })
}

export async function confirmPasswordReset(email: string, resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return apiRequest('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ email, resetToken, newPassword }),
  })
}

export function usePageData<T>(slug: string) {
  return useApiData<T>(`/pages/${slug}`)
}

export type TreatmentPlan = {
  id: string
  patientId: string
  doctorId: string
  description: string
  details: Record<string, any>
  status: 'draft' | 'signed_pending_patient' | 'pending' | 'accepted' | 'dismissed' | 'active' | 'archived'
  createdAt: string
  patientComment?: string
  patientRespondedAt?: string | null
  acceptedAt?: string | null
  dismissedAt?: string | null
  appliedAt?: string | null
  clinicianReply?: string
  clinicianRepliedAt?: string | null
}

export type TimelineEvent = {
  id: string
  type: 'meal' | 'insulin' | 'activity' | 'sleep' | 'plan' | 'bolus' | 'food' | 'whatif'
  title: string
  detail: string
  timestampLabel: string
  impact: string
  severity: 'info' | 'safe' | 'warning'
  targetContext: string
}

export type TimelineData = {
  summary: {
    meals: number
    insulinEvents: number
    activityMinutes: number
    sleepHours: number
  }
  events: TimelineEvent[]
  disclaimer?: string
}

export async function fetchPendingTreatmentPlan(): Promise<{ plan: TreatmentPlan | null }> {
  return apiRequest('/glucotwin/treatment-plans/pending')
}

export async function fetchTreatmentPlanHistory(): Promise<{ plans: TreatmentPlan[] }> {
  return apiRequest('/glucotwin/treatment-plans')
}

export async function dismissTreatmentPlan(id: string, patientComment = ''): Promise<void> {
  return apiRequest(`/glucotwin/treatment-plans/${id}/dismiss`, {
    method: 'POST',
    body: JSON.stringify({ patientComment }),
  })
}

export async function acceptTreatmentPlan(id: string, patientComment = ''): Promise<void> {
  return apiRequest(`/glucotwin/treatment-plans/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ patientComment }),
  })
}

export async function fetchTimeline(): Promise<TimelineData> {
  return apiRequest('/glucotwin/timeline')
}
